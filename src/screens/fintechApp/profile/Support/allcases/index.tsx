import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState, useCallback } from "react";
import { RefreshControl } from "react-native";
import ViewComponent from "../../../../../newComponents/view/view";
import { getThemedCommonStyles, statusColor } from "../../../../../components/CommonStyles";
import { FormattedDateText } from "../../../../../newComponents/textComponets/dateTimeText/dateTimeText";
import Container from "../../../../../newComponents/container/container";
import ErrorComponent from "../../../../../newComponents/errorDisplay/errorDisplay";
import FlatListComponent from "../../../../../newComponents/flatList/flatList";
import { dateFormates, isErrorDispaly } from "../../../../../utils/helpers";
import Loadding from "../../../../commonScreens/skeltons";
import { allTransactionList } from "../../../../commonScreens/transactions/skeltonViews";
import ProfileService from "../../../../../apiServices/profile";
import { useThemeColors } from "../../../../../hooks/useThemeColors";
import DashboardLoader from "../../../../../components/loader";
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook";
import CommonTouchableOpacity from "../../../../../newComponents/touchableComponents/touchableOpacity";
import PageHeader from "../../../../../newComponents/pageHeader/pageHeader";
import ParagraphComponent from "../../../../../newComponents/textComponets/paragraphText/paragraph";

interface Item {
  title?: string;
  number?: string;
  createdDate?: string;
  state?: string;
  length?: any;
  id?:string;
}
const ItemSeparator = React.memo(() => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return <ViewComponent style={[commonStyles.transactionsListGap]} />;
});

const SupportAllCases: React.FC<any> = () => {
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [casesData, setCasesData] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true); // new state variable
  const [refresh, setRefresh] = useState<boolean>(false);
  const navigation = useNavigation<any>();
  const loadeMoreLoader = allTransactionList(10);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const getRefTransactions = useCallback(async (currentPage: number) => {
    if (currentPage === 1) {
      setLoading(true); // show main loader
    } else {
      setIsLoadingMore(true); // show footer loader
    }

    try {
      interface ApiSuccessData {
        data: Item[];
        pagination: {
            hasNextPage: boolean;
        }
      }
      const response = await ProfileService.getCasesList(currentPage, 10);
      if (response?.ok) {
        const responseData = response.data as ApiSuccessData | undefined;
        const newTransactions = responseData?.data || [];
        setCasesData((prevData) => currentPage === 1 ? newTransactions : [...prevData, ...newTransactions]);
        setHasMoreData(responseData?.pagination?.hasNextPage ?? false);
      } else {
        setErrorMsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
    }
    setLoading(false);
    setIsLoadingMore(false);
  }, []);


  useEffect(() => {
    getRefTransactions(pageNo);
  }, [pageNo, getRefTransactions]);
  
  useHardwareBackHandler(()=>{
    backArrowButtonHandler();
  })

  const backArrowButtonHandler = () => {
    navigation.navigate('Support',{animation:'slide_from_left'});
  };

  const handleRefresh = () => {
    setPageNo(1);
    getRefTransactions(1);
  };
  
  const onRefresh = async () => {
    setRefresh(true);
    try {
      setPageNo(1);
      await getRefTransactions(1);
    } finally {
      setRefresh(false);
    }
  };

  const loadMoreData = () => {
    if (!isLoadingMore && !loading && hasMoreData) {
      setPageNo((prevPage) => prevPage + 1);
    }
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return <Loadding contenthtml={loadeMoreLoader} />;
    }
    return null;
  };
  const handleCaseView=(item:Item)=>{
    navigation.navigate("SupportCaseView",{id:item?.id})
  }
  const renderItem = ({ item, index }: any) => { 
  const title = item?.title;
  let displayTitle = title; 
  if (title && title.length > 30) {
    displayTitle = `${title.substring(0, 25)}......`;
  }
  return ( 
    <CommonTouchableOpacity onPress={() => handleCaseView(item)} style={[commonStyles.cardsbannerbg]}>
      <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flex1]}>
          <ViewComponent>
            {(item?.number) && <ParagraphComponent text={item?.number} style={[commonStyles.primarytext]} />}
            {displayTitle && <ParagraphComponent text={displayTitle} style={[commonStyles.secondarytext]} />}
          </ViewComponent>
          <ViewComponent>
            {(item?.createdDate) && <FormattedDateText conversionType={"UTC-to-local"} value={(item?.date ?? item?.createdDate) as string} dateFormat={dateFormates?.dateTime} style={[commonStyles.primarytext]} />}
            {(item?.state) && <ParagraphComponent text={item?.state ?? item?.state} style={[commonStyles.fs12, commonStyles.fw700, commonStyles.textRight, commonStyles.mb5, { color: statusColor[item?.state?.toLowerCase()] }]} />}
          </ViewComponent>
        </ViewComponent>
      </ViewComponent>
    </CommonTouchableOpacity>
  ); 
}; 

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {(pageNo === 1 && loading)&&
       <DashboardLoader />}
        {!loading&&<Container style={commonStyles.container}>
            <PageHeader
              title={"GLOBAL_CONSTANTS.ALL_CASES"}
              onBackPress={backArrowButtonHandler}
              isrefresh={true}
              onRefresh={handleRefresh}
            />
            <FlatListComponent
              ListHeaderComponent={errorMsg ? <ErrorComponent message={errorMsg} onClose={() => setErrorMsg("")} /> : null}
              data={casesData}
              ItemSeparatorComponent={ItemSeparator}
              keyExtractor={(item, index) => item.id ?? index.toString()} 
              renderItem={renderItem}
              onEndReached={loadMoreData}
              ListFooterComponent={renderFooter}
              onEndReachedThreshold={0.5}
              refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}
            />
        </Container>}
    </ViewComponent>
  );
};
export default SupportAllCases;

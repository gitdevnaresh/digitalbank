import { useNavigation } from "@react-navigation/native";
import { getThemedCommonStyles, statusColor } from "../../../../../components/CommonStyles";
import { useThemeColors } from "../../../../../hooks/useThemeColors";
import PageHeader from "../../../../../newComponents/pageHeader/pageHeader";
import ViewComponent from "../../../../../newComponents/view/view"
import Container from "../../../../../newComponents/container/container";
import React, { useEffect, useState } from "react";
import { RefreshControl } from "react-native";
import CommonTouchableOpacity from "../../../../../newComponents/touchableComponents/touchableOpacity";
import ParagraphComponent from "../../../../../newComponents/textComponets/paragraphText/paragraph";
import TextMultiLangauge from "../../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { s } from "../../../../../newComponents/theme/scale";
import { isErrorDispaly } from "../../../../../utils/helpers";
import ProfileService from "../../../../../apiServices/profile";
import Ionicons from '@expo/vector-icons/Ionicons';
import DashboardLoader from "../../../../../components/loader";
import useEncryptDecrypt from "../../../../../hooks/encDecHook";
import { SimpleLineIcons } from "@expo/vector-icons";
import { FlatList } from "react-native";
import ErrorComponent from "../../../../../newComponents/errorDisplay/errorDisplay";
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook";
import ScrollViewComponent from "../../../../../newComponents/scrollView/scrollView";
import useMemberLogin from "../../../../../hooks/userInfoHook";

interface ItemCommonModelInterface {
  title: string,
  value: string,
  isChecked: boolean
}

interface CaseDetailItem {
  documentName: string;
  state: string;
  isChecked: boolean;
  [key: string]: any; // Allow other properties
}

interface CaseDetails {
  number: string;
  title: string;
  state: string;
  remarks: string;
  commonModel: { [key: string]: any };
  details: CaseDetailItem[];
  [key: string]: any; // Allow other properties
}
const ItemSeparator = React.memo(() => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return <ViewComponent style={[commonStyles.listitemGap]} />;
});
const SupportCaseView: React.FC<any> = (props) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const navigation = useNavigation<any>();
  const [data, setData] = useState<{
    isExpanded: boolean;
    caseDetails: CaseDetails | null;
    loader: boolean;
    error: any;
  }>({ isExpanded: false, caseDetails: null, loader: false, error: '' });
  const [refresh, setRefresh] = useState<boolean>(false);
  const { decryptAES } = useEncryptDecrypt();
  const ENCRYPTED_KEYS = new Set(['Email', 'Account Number/IBAN']);
  const { getMemDetails } = useMemberLogin();

  useEffect(() => {
    getCaseDetails(props?.route?.params?.id);
  }, [props?.route?.params?.id]);

  const getCaseDetails = async (id: string) => {
    setData((prev: any) => ({ ...prev, loader: true, error: '' }));
    try {
      const response = await ProfileService.getCaseDetails(id);
      if (response.ok) {
        setData((prev: any) => ({ ...prev, loader: false, caseDetails: response.data }));
      } else {
        setData((prev: any) => ({ ...prev, loader: false, error: isErrorDispaly(response) }));
      }
    } catch (error) {
      setData((prev: any) => ({ ...prev, loader: false, error: isErrorDispaly(error) }));
    }
  };  
  const onRefresh = async () => {
    setRefresh(true);
    try {
      await getCaseDetails(props?.route?.params?.id);
    } finally {
      setRefresh(false);
    }
  };
  useHardwareBackHandler(() => {
    backArrowButtonHandler();
  });
  const backArrowButtonHandler = () => {
    if(props?.route?.params?.screenName == 'Onbaording'){
        getMemDetails();
    }else{
      navigation.navigate('Support',{animation:'slide_from_left'});
    }
  };
  const handleExpand = () => {
    setData((prev: any) => ({ ...prev, isExpanded: !prev.isExpanded }));
  };

  const caseDetails = data.caseDetails;
  const commonModel = caseDetails?.commonModel;

  // Convert the object into an array of key-value pairs
  const keyValuePairs = commonModel ? Object.entries(commonModel).map(([key, value]) => ({
    title: key,
    value: value,
  })) : [];
  const visiblePairs = data?.isExpanded ? keyValuePairs : keyValuePairs.slice(0, 0);
  const showReadMore = keyValuePairs.length > 0;
  const handleSelectCaseView = (item: CaseDetailItem) => {
      navigation.navigate('CaseViewDetails',{item:item,customerDetails:data?.caseDetails,screenName:props?.route?.params?.screenName})
    }
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {data?.loader && <DashboardLoader />}
      {!data?.loader && <Container style={[commonStyles.container]}>
        <PageHeader title={data?.caseDetails?.number} onBackPress={backArrowButtonHandler} />
        {data.error && <ErrorComponent message={data.error} onClose={() => setData((prev: any) => ({ ...prev, error: '' }))} />}
        <ScrollViewComponent refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}>
        <ViewComponent>
          <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap10,commonStyles.flexWrap]}>
            <TextMultiLangauge text={"GLOBAL_CONSTANTS.CASE_NUMBER"} style={[commonStyles.listsecondarytext]} />
            <ParagraphComponent text={data?.caseDetails?.number} style={[commonStyles.listprimarytext]} />
          </ViewComponent>
          <ViewComponent style={[commonStyles.listitemGap]} />
          <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap10,commonStyles.flexWrap]}>
            <TextMultiLangauge text={"GLOBAL_CONSTANTS.CASE_TITLE"} style={[commonStyles.listsecondarytext]} />
            <ParagraphComponent text={data?.caseDetails?.title} style={[commonStyles.listprimarytext]} />
          </ViewComponent>
          <ViewComponent style={[commonStyles.listitemGap]} />
          <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap10]}>
            <TextMultiLangauge text={"GLOBAL_CONSTANTS.CASE_STATE"} style={[commonStyles.listsecondarytext]} />
             <ParagraphComponent text={data?.caseDetails?.state} style={[commonStyles.listprimarytext, { color: statusColor[data?.caseDetails?.state?.toLowerCase()||"pending"] }]} />
          </ViewComponent>
          <ViewComponent style={[commonStyles.listitemGap]} />
          <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap10,commonStyles.flexWrap]}>
            <TextMultiLangauge text={"GLOBAL_CONSTANTS.REMARKS"} style={[commonStyles.listsecondarytext]} />
            <ParagraphComponent text={data?.caseDetails?.remarks} style={[commonStyles.listprimarytext]} numberOfLines={data.isExpanded ? undefined : 5}/>
          </ViewComponent>
          <ViewComponent style={[commonStyles.listitemGap]} />
          {visiblePairs.map((item: any, index) => {
            const displayValue = ENCRYPTED_KEYS?.has(item?.title)
              ? decryptAES(item?.value)
              : item?.value;
            const containerStyle = [commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap10,commonStyles.flexWrap];
            return (
              <ViewComponent key={`${item.title}-${index}`}>
                <ViewComponent style={containerStyle}>
                  <ParagraphComponent text={item?.title} style={[commonStyles.listsecondarytext]} />
                  <ParagraphComponent text={displayValue} style={[commonStyles.listprimarytext]} />
                </ViewComponent>
                {index < visiblePairs.length - 1 && <ViewComponent style={[commonStyles.listitemGap]} />}
              </ViewComponent>
            );
          })}
          {showReadMore && (
            <CommonTouchableOpacity onPress={handleExpand} >
              <Ionicons name="chevron-down" size={s(28)} style={[commonStyles.mxAuto, commonStyles.textCenter, { transform: [{ rotate: data?.isExpanded ? "180deg" : "0deg" }] }]} color={NEW_COLOR.TEXT_WHITE} />
              <ParagraphComponent style={[commonStyles.textCenter, commonStyles.sectionSubTitleText]}>
                {data.isExpanded ? "GLOBAL_CONSTANTS.SHOW_LESS" : "GLOBAL_CONSTANTS.READ_MORE"}
              </ParagraphComponent>
            </CommonTouchableOpacity>
          )}
        </ViewComponent>
          <ViewComponent style={[commonStyles.sectionGap]} />
          <TextMultiLangauge text={"GLOBAL_CONSTANTS.REQUEST_FOR_DOCUMENT"} style={[commonStyles.sectionTitle,commonStyles.titleSectionGap]}/>
        <FlatList
          data={data.caseDetails?.details?.filter((item: CaseDetailItem) => item.isChecked)}
          renderItem={({ item }) => (
            <CommonTouchableOpacity onPress={() => handleSelectCaseView(item)} style={[commonStyles.dflex, commonStyles.alignCenter,  commonStyles.gap10, commonStyles.justifyContent,commonStyles.flexWrap,commonStyles.casescardsbannerbg]}>
              <ViewComponent style={[commonStyles.flex1]}>
              <ParagraphComponent text={item?.documentName} style={[commonStyles.sectionSubTitleText]} numberOfLines={3}/>
              </ViewComponent>
              <ParagraphComponent text={item?.state} style={[commonStyles.chatcolorstatus, { color: statusColor[item?.state?.toLowerCase()] }]} />
              {/* <SimpleLineIcons name="arrow-right" size={s(14)} color={NEW_COLOR.TEXT_WHITE} style={[commonStyles.mt4]} /> */}
            </CommonTouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={<ViewComponent style={[commonStyles.mb10]}/>}
          scrollEnabled={false}
          nestedScrollEnabled={true}
        />
        {/* <ViewComponent style={[commonStyles.sectionGap]}/> */}
        </ScrollViewComponent>
      </Container>}
    </ViewComponent>
  )
}
export default SupportCaseView;


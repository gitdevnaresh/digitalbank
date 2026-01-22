
import React, { useEffect, useState , useMemo } from 'react';
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import { useThemeColors } from "../../../../../hooks/useThemeColors";
import ViewComponent from "../../../../../newComponents/view/view";
import Container from "../../../../../newComponents/container/container";
import PageHeader from "../../../../../newComponents/pageHeader/pageHeader";
import { dateFormates, isErrorDispaly } from "../../../../../utils/helpers";
import ProfileService from "../../../../../apiServices/profile";
import { FlatList } from "react-native-gesture-handler";
import { RefreshControl } from "react-native";
import FilePreviewWithId from "../../../../../newComponents/fileUpload/filePreviewWithId";
import ParagraphComponent from "../../../../../newComponents/textComponets/paragraphText/paragraph";
import { FormattedDateText } from "../../../../../newComponents/textComponets/dateTimeText/dateTimeText";
import ButtonComponent from "../../../../../newComponents/buttons/button";
import { s } from "../../../../../newComponents/theme/scale";
import { RightIcon } from "../../../../../assets/svg";
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook";
import { useNavigation } from "@react-navigation/native";
import DashboardLoader from "../../../../../components/loader";
import SafeAreaViewComponent from "../../../../../newComponents/safeArea/safeArea";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { transform } from "@babel/core";
import ScrollViewComponent from "../../../../../newComponents/scrollView/scrollView";
 
const ItemSeparator = React.memo(() => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return <ViewComponent style={[commonStyles.listGap]} />;
});
 
const CaseViewDetails: React.FC<any> = (props) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [data, setData] = useState<any>({ caseDetails: null, loader: false, error: '' });
  const [refresh, setRefresh] = useState<boolean>(false);
  const navigation = useNavigation<any>();
 
  useEffect(() => {
    if (props?.route?.params?.item?.id) {
      getCaseDetails(props?.route?.params?.item?.id);
    }
  }, [props?.route?.params?.item?.id]);
 
  const getCaseDetails = async (id: string) => {
    setData((prev: any) => ({ ...prev, loader: true, error: '' }));
    try {
      const response: any = await ProfileService.getCaseDetailsMessages(id);
      if (response?.ok) {
        const sortedData = response.data.sort((a: any, b: any) => new Date(a.repliedDate).getTime() - new Date(b.repliedDate).getTime());
        setData((prev: any) => ({ ...prev, loader: false, caseDetails: sortedData }));
      } else {
        setData((prev: any) => ({ ...prev, loader: false, error: isErrorDispaly(response) }));
      }
    } catch (error) {
      setData((prev: any) => ({ ...prev, loader: false, error: isErrorDispaly(error) }));
    }
  };
  
  const handleRefresh = async () => {
    await getCaseDetails(props?.route?.params?.item?.id);
  };
  
  const onRefresh = async () => {
    setRefresh(true);
    try {
      await getCaseDetails(props?.route?.params?.item?.id);
    } finally {
      setRefresh(false);
    }
  };
 
  useHardwareBackHandler(() => {
    navigation?.goBack();
  });
 
  const backArrowButtonHandler = () => {
    navigation?.goBack();
  };
 
  const getBubbleRadius = (isCustomer: boolean) => {
    if (isCustomer) {
      return {
        borderTopLeftRadius: s(12),
        borderBottomLeftRadius: s(12),
        borderBottomRightRadius: s(12),
      };
    }
 
    return {
      borderTopRightRadius: s(12),
      borderBottomRightRadius: s(12),
      borderBottomLeftRadius: s(12),
    };
  };
 
  const groupedData = useMemo(() => {
    const messages = data?.caseDetails || [];
    if (messages.length === 0) {
      return [];
    }
 
    const grouped: any = [];
    let lastDate: string | null = null;
 
    messages.forEach((message: any) => {
      const messageDate = message.repliedDate.split('T')[0];
 
      if (messageDate !== lastDate) {
        grouped.push({
          id: `date-${messageDate}`,
          type: 'date',
          date: message.repliedDate,
        });
        lastDate = messageDate;
      }
 
      grouped.push({
        ...message,
        type: 'message',
      });
    });
 
    return grouped;
  }, [data?.caseDetails]);
 
  return (
    <ViewComponent style={[commonStyles.flex1]}>
      {data.loader && <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>}
      {!data.loader && (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
          <Container style={[commonStyles.container]}>
            <PageHeader title={props?.route?.params?.item?.documentName} onBackPress={backArrowButtonHandler} isrefresh={true} onRefresh={handleRefresh} />
            <ViewComponent style={[commonStyles.flex1]}>
              <ScrollViewComponent
                style={[commonStyles.flex1]}
                refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}
                contentContainerStyle={{ flex: 1 }}
              >
              <FlatList
                inverted={true}
                style={[commonStyles.flex1]}
                data={groupedData.slice().reverse()}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => {
                  if (item.type === 'date') {
                    return (
                      <ViewComponent style={[commonStyles.alignCenter]}>
                        <FormattedDateText value={item.date} dateFormat={dateFormates.date} style={[commonStyles.chatmaindate]} />
                      </ViewComponent>
                    );
                  }
                  return (
                    <ViewComponent
                      style={[
                        commonStyles.dflex,
                        commonStyles.alignStart,
                        commonStyles.gap16,
                        { flexDirection: item?.isCustomer ? "row-reverse" : "row" },
                      ]}
                    >
                      <ViewComponent
                        style={[
                          { width: s(30), height: s(30) },
                          { backgroundColor: item?.isCustomer ? NEW_COLOR.BUTTON_BG : NEW_COLOR.BANNER_BG },
                          commonStyles.dflex,
                          commonStyles.alignCenter,
                          commonStyles.justifyCenter,
                          commonStyles.rounded100,
                        ]}
                      >
                        <ParagraphComponent
                          style={[commonStyles.fs12, commonStyles.fw600, { color: item?.isCustomer ? NEW_COLOR.TEXT_ALWAYS_WHITE : NEW_COLOR.textWhite }]}
                          text={item?.repliedBy ? item.repliedBy.substring(0, 2).toUpperCase() : ""}
                        />
 
                        {item?.isCustomer ? (
                          <ViewComponent style={{ position: "absolute", right: s(26), top: s(-10.5), }}>
                            <MaterialIcons name="arrow-right" size={30} color={NEW_COLOR.CHATREPLEY_BG} />
                          </ViewComponent>
                        ) : (
                          <ViewComponent style={{ position: "absolute", left: s(26), top: -s(14), }}>
                            <MaterialIcons name="arrow-right" size={30} color={NEW_COLOR.CHATLEFT_BG} style={[commonStyles.textRight, commonStyles.mt4, { transform: [{ rotate: "180deg" }] }]} />
                          </ViewComponent>
                        )}
                      </ViewComponent>
 
                      <ViewComponent
                        style={[
                          commonStyles.p12,
                          {
                            width: s(320),
                            backgroundColor: item?.isCustomer
                              ? NEW_COLOR.CHATREPLEY_BG
                              : NEW_COLOR.CHATLEFT_BG,
                            ...getBubbleRadius(!!item?.isCustomer),
                          },
                        ]}
                      >
                        <ViewComponent>
                          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                            <ParagraphComponent
                              style={[
                                commonStyles.chattitletext,
                              ]}
                              text={item?.repliedBy}
                            />
                            {item?.repliedDate && (
                              <FormattedDateText
                                conversionType={"UTC-to-local"}
                                value={item?.repliedDate as string}
                                dateFormat={dateFormates?.time}
                                style={[commonStyles.chatdate]}
                              />
                            )}
                          </ViewComponent>
                           <FilePreviewWithId
                          label={item?.reply}
                          fileName={item?.repositories[0]?.fileName}
                          id={item?.repositories[0]?.id}
                          showImage={false}
                        />
                        </ViewComponent>
 
                       
                        <ViewComponent
                          style={[
                            commonStyles.dflex,
                            commonStyles.alignCenter,
                            commonStyles.justifyend,
                          ]}
                        >
 
                        </ViewComponent>
                      </ViewComponent>
                    </ViewComponent>
                  );
                }}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={ItemSeparator}
              />
              </ScrollViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]} />
            {props?.route?.params?.item?.state?.toLowerCase() !== "approved" && <ViewComponent style={[commonStyles.mt30]}>
              <ButtonComponent title={"GLOBAL_CONSTANTS.SEND_REPLY"} onPress={() => navigation.navigate('SendReply', {
                item: props?.route?.params?.item,
                customerDetails: props?.route?.params?.customerDetails,
                onReplySuccess: () => getCaseDetails(props?.route?.params?.item?.id)
              })} />
              <ViewComponent style={[commonStyles.sectionGap]} />
            </ViewComponent>}
 
          </Container>
        </ViewComponent>
      )}
    </ViewComponent>
  )
}
 
export default CaseViewDetails;
 


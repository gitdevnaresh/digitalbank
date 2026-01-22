import React, { useCallback, useEffect, useState, useRef } from 'react';
import { BackHandler, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getThemedCommonStyles, statusColor } from '../../../../components/CommonStyles';
import { s } from '../../../../constants/theme/scale';
import FlatListComponent from '../../../../newComponents/flatList/flatList';
import ViewComponent from '../../../../newComponents/view/view';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import Container from '../../../../newComponents/container/container';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import { FormattedDateText } from '../../../../newComponents/textComponets/dateTimeText/dateTimeText';
import SearchCompApi from '../../../../newComponents/searchComponents/searchCompApi';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import DashboardLoader from '../../../../components/loader';
import SafeAreaViewComponent from '../../../../newComponents/safeArea/safeArea';
import { isErrorDispaly } from '../../../../utils/helpers';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import TeamsService from './service';
import CustomRBSheet from '../../../../newComponents/models/commonBottomSheet';
import FilterIconImage from '../../../../components/svgIcons/mainmenuicons/transactionfilter';
import CustomPicker from '../../../../newComponents/pickerComponents/basic/customPickerNonFormik';
import ButtonComponent from '../../../../newComponents/buttons/button';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import Feather from 'react-native-vector-icons/Feather';
import NoDataComponent from '../../../../newComponents/noData/noData';
import { allTransactionList } from '../../../commonScreens/transactions/skeltonViews';
import Loadding from '../../../commonScreens/skeltons';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import { TeamsLuResponse, TeamsListResponse, TeamMember, StatusLookup } from './utils/interfaces';
import { SimpleLineIcons } from "@expo/vector-icons";
import TeamMembersIcon from '../../../../components/svgIcons/mainmenuicons/teamamembers';
import { STATUS, SCREENS, PAGINATION, UI } from './constants';
import ImageUri from '../../../../newComponents/imageComponents/image';


const TeamList = () => {
  const teamsListLoader = allTransactionList(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errormsg, setErrormsg] = useState<string>("");
  const [teamsList, setTeamsList] = useState<TeamMember[]>([]);
  const [pageNo, setPageNo] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [selectedTeam, setSelectedTeam] = useState<TeamMember | null>(null);
  const dotsSheetRef = useRef<any>(null);
  const filterSheetRef = useRef<any>(null);
  const confirmSheetRef = useRef<any>(null);
  const [statusLu, setStatusLu] = useState<StatusLookup[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [toggleLoading, setToggleLoading] = useState<boolean>(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const navigation = useNavigation<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { decryptAES } = useEncryptDecrypt();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      setPageNo(1);
      setTeamsList([]);
      getTeamsList(1, selectedStatus, searchQuery);
    }
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      // Reload data when screen comes into focus
      if (teamsList.length > 0) {
        setPageNo(1);
        setTeamsList([]);
        getTeamsList(1, selectedStatus, searchQuery);
      }

      const onBackPress = () => {
        backArrowButtonHandler();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription?.remove();
    }, [])
  );
  const { t } = useLngTranslation();
  const loadInitialData = async () => {
    setLoading(true);
    setErrormsg("");

    try {
      await getTeamsList(1);
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const getTeamsList = async (page: number = 1, status?: string, search?: string, isLoadMore: boolean = false) => {
    if (!isLoadMore) {
      setLoading(true);
      setErrormsg("");
    } else {
      setLoadMoreLoading(true);
    }

    try {
      const statusParam = status || selectedStatus || STATUS.ALL;
      const searchParam = search !== undefined ? search : searchQuery;
      const response = await TeamsService.getTeamsList(statusParam, searchParam || null, page, PAGINATION.DEFAULT_PAGE_SIZE) as TeamsListResponse;

      if (response?.data || response?.ok !== false) {
        const data = response.data?.data || [];

        if (isLoadMore && page > 1) {
          const existingIds = new Set(teamsList.map(t => t.id));
          const newData = data.filter(item => !existingIds.has(item.id));

          if (newData.length === 0) {
            setTotal(teamsList.length);
          } else {
            setTeamsList(prev => [...prev, ...newData]);
          }
        } else {
          setTeamsList(data);
        }
        setTotal(response.data?.total || data.length);
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      if (!isLoadMore) {
        setLoading(false);
      } else {
        setLoadMoreLoading(false);
      }
    }
  };

  const getTeamsLu = async () => {
    try {
      const response = await TeamsService.getTeamsLu() as TeamsLuResponse;
      if (response?.ok) {
        setStatusLu(response.data?.TeamStatus || []);
      }
    } catch (error) {
        setErrormsg(isErrorDispaly(error));
    }
  };

  const handleMainSearch = (value: string) => {
    setSearchQuery(value);
  };

  const backArrowButtonHandler = () => {
    navigation.goBack();
  };

  const handleMenuPress = (item: TeamMember) => {
    setSelectedTeam(item);
    dotsSheetRef?.current?.open();
  };

  const openFilterSheet = () => {
    if (statusLu.length === 0) {
      getTeamsLu();
    }
    filterSheetRef?.current?.open();
  };

  const handleSelectStatus = (selected: { code: string }) => {
    setSelectedStatus(selected?.code);
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setSelectedStatus("");
    setPageNo(1);
    setTeamsList([]);
    setErrormsg("");
    getTeamsList(1, STATUS.ALL, "");
  };

  const handleApplyFilter = () => {
    setPageNo(1);
    setTeamsList([]);
    getTeamsList(1, selectedStatus, searchQuery);
    filterSheetRef?.current?.close();
  };

  const loadMoreData = () => {
    if (teamsList.length < total && !loading && !loadMoreLoading && teamsList.length > 0) {
      const nextPage = pageNo + 1;
      setPageNo(nextPage);
      getTeamsList(nextPage, selectedStatus, searchQuery, true);
    }
  };

  const renderFooter = () => {
    if (loadMoreLoading) {
      return (
        <Loadding contenthtml={teamsListLoader} />
      );
    }
    return null;
  };

  const handleToggleStatusConfirm = () => {
    dotsSheetRef?.current?.close();
    setTimeout(() => {  
      confirmSheetRef?.current?.open();
    }, 300); 
  };

  const handleToggleStatus = async () => {
    if (!selectedTeam) return;

    setToggleLoading(true);
    try {
      const action = selectedTeam.status === 'Active' ? 'disable' : 'enable';
      const response = await TeamsService.toggleMemberStatus(selectedTeam.id, action);

      if (response?.ok) {
        setPageNo(1);
        setTeamsList([]);
        await getTeamsList(1, selectedStatus, searchQuery);
        confirmSheetRef?.current?.close();
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      setToggleLoading(false);
    }
  };

  const handleMemberPress = (item: TeamMember) => {
    navigation.navigate(SCREENS.TEAM_CARDS_VIEW, { memberId: item.id, memberData: item });
  };

  const renderItem = ({ item }: { item: TeamMember; index: number }) => {
    return (
      <CommonTouchableOpacity
        activeOpacity={0.8}
        key={item.id}
        onPress={() => handleMemberPress(item)}
        style={[
          commonStyles.cardsbannerbg
        ]}
      >
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap16]}>
          <ViewComponent style={[commonStyles.alignCenter, commonStyles.justifyCenter, { minHeight: s(34), minWidth: s(34) }]}>
          
            <ImageUri uri={item?.image ? item?.image :'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/default_user_image.jpg'} width={s(30)} height={s(30)} style={[{ borderRadius: s(30) / 2 }]} />
          </ViewComponent>
          <ViewComponent style={[commonStyles.dflex, commonStyles.flex1, commonStyles.justifyContent, commonStyles.alignCenter]}>
            <ViewComponent >
              <ParagraphComponent
                style={[commonStyles.primarytext]}
                text={(() => {
                  const name = item.fullName || `${item.firstName}` || "";
                  return name.length > UI.MAX_NAME_LENGTH 
                    ? `${name.slice(0, UI.NAME_TRUNCATE_START)}...${name.slice(-UI.NAME_TRUNCATE_END)}`
                    : name;
                })()}
                numberOfLines={1}
              />
              <ParagraphComponent
                style={[commonStyles.secondarytext]}
                text={`ID: ${item.refId}`}
                numberOfLines={1}
              />
              <ParagraphComponent
                style={[commonStyles.secondarytext]}
                text={(() => {
                  const email = decryptAES(item.email) || "";
                  return email.length > UI.MAX_NAME_LENGTH 
                    ? `${email.slice(0, UI.EMAIL_TRUNCATE_START)}...${email.slice(-UI.EMAIL_TRUNCATE_END)}`
                    : email;
                })()}
                numberOfLines={1}
              />
              <FormattedDateText
                value={item.registeredDate}
                conversionType='UTC-to-local'
                style={[commonStyles.secondarytext, commonStyles.mt4]}
              />
            </ViewComponent>
            <ViewComponent>
              <ParagraphComponent
                style={[commonStyles.colorstatus, { color: statusColor[item.customerState?.toLowerCase()] }]}
                text={item.customerState}
                numberOfLines={1}
              />
              <ParagraphComponent
                style={[commonStyles.colorstatus, commonStyles.textRight, {
                  color: statusColor[item.status?.toLowerCase()]
                }]}
                text={item.status}
              />
            </ViewComponent>
            <CommonTouchableOpacity
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.8}
              style={[commonStyles.alignCenter, commonStyles.justifyCenter]}
            >
              <Feather
                name="more-vertical"
                size={s(16)}
                color={NEW_COLOR.TEXT_WHITE}
              />
            </CommonTouchableOpacity>
          </ViewComponent>
        </ViewComponent>

      </CommonTouchableOpacity>
    );
  };

  if (loading && pageNo === 1) {
    return (
      <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
        <DashboardLoader />
      </SafeAreaViewComponent>
    );
  }

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={commonStyles.container}>
        <PageHeader
          title={"GLOBAL_CONSTANTS.TEAM_MEMBERS"}
          onBackPress={backArrowButtonHandler}
          isrefresh={true}
          onRefresh={handleRefresh}
        />
        {errormsg !== "" && (
          <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />
        )}
        <FlatListComponent
          ListHeaderComponent={
            <ViewComponent style={[commonStyles.sectionGap]}>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8,]}>
                <ViewComponent style={[commonStyles.flex1]}>
                  <SearchCompApi
                    placeholder={"GLOBAL_CONSTANTS.SEARCH_TEAMS"}
                    onSearch={handleMainSearch}
                    searchQuery={searchQuery}
                  />
                </ViewComponent>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={openFilterSheet}
                  style={[commonStyles.roundediconbg]}
                >
                  <FilterIconImage width={s(20)} height={s(20)} />
                </TouchableOpacity>
              </ViewComponent>
            </ViewComponent>
          }
          data={teamsList ?? []}
          keyExtractor={(item: TeamMember, index: number) => `${item.id}-${index}`}
          ItemSeparatorComponent={() => <ViewComponent style={commonStyles.listGap} />}
          renderItem={renderItem}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          contentContainerStyle={{ paddingBottom: s(100) }}
          ListEmptyComponent={
            !loading ? (
              <ViewComponent style={[commonStyles.alignCenter, commonStyles.mt20]}>
                <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} />
              </ViewComponent>
            ) : null
          }
        />

        {/* Bottom Sheets */}
        <CustomRBSheet refRBSheet={filterSheetRef} title="GLOBAL_CONSTANTS.FILTER_TITLE" height={s(270)}>
          <ViewComponent >
            <CustomPicker
              label="GLOBAL_CONSTANTS.STATUS"
              data={statusLu}
              value={selectedStatus || STATUS.ALL}
              onChange={handleSelectStatus}
              modalTitle="GLOBAL_CONSTANTS.STATUS"
              placeholder="GLOBAL_CONSTANTS.STATUS"
              selectionType={t("GLOBAL_CONSTANTS.STATUS")}
            />
            <ViewComponent style={[commonStyles.sectionGap]} />
            <ViewComponent style={[commonStyles.sectionGap]} />

            <ButtonComponent multiLanguageAllows={true} title={"GLOBAL_CONSTANTS.APPLY_BUTTON"} onPress={handleApplyFilter} />
            <ViewComponent style={[commonStyles.titleSectionGap]} />
          </ViewComponent>
        </CustomRBSheet>


        <CustomRBSheet refRBSheet={dotsSheetRef} title={selectedTeam?.status === 'Active' ? "GLOBAL_CONSTANTS.CONFIRM_DISABLE" : "GLOBAL_CONSTANTS.CONFIRM_ENABLE"} height={s(250)}>
          <ViewComponent>
            {selectedTeam && (
              <ViewComponent>
                <CommonTouchableOpacity onPress={handleToggleStatusConfirm}>
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                      <ViewComponent style={[commonStyles.bottomsheeticonbg]}>
                        <Feather name={selectedTeam.status === 'Active' ? 'user-x' : 'user-check'} size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                      </ViewComponent>
                      <TextMultiLanguage style={[commonStyles.bottomsheetprimarytext]} text={selectedTeam.status === 'Active' ? 'GLOBAL_CONSTANTS.DISABLE' : 'GLOBAL_CONSTANTS.ENABLE'} />
                    </ViewComponent>
                    <SimpleLineIcons name="arrow-right" size={s(16)} color={NEW_COLOR.TEXT_WHITE} />
                  </ViewComponent>
                </CommonTouchableOpacity>
                <ViewComponent style={[commonStyles.sectionGap]} />
                <ViewComponent style={[commonStyles.titleSectionGap]} />

                <ButtonComponent
                  multiLanguageAllows={true}
                  title="GLOBAL_CONSTANTS.CANCEL"
                  onPress={() => dotsSheetRef?.current?.close()}
                  solidBackground={true}
                />
              </ViewComponent>
            )}
          </ViewComponent>
        </CustomRBSheet>

        <CustomRBSheet refRBSheet={confirmSheetRef} title={selectedTeam?.status === 'Active' ? "GLOBAL_CONSTANTS.CONFIRM_DISABLE" : "GLOBAL_CONSTANTS.CONFIRM_ENABLE"} height={s(320)}>
          <ViewComponent>
            {selectedTeam && (
              <ViewComponent>
                  <ViewComponent style={[commonStyles.mxAuto,commonStyles.titleSectionGap,{width:s(80),height:s(80)}]}>
                    <TeamMembersIcon width={s(90)} height={s(90)} />
                  </ViewComponent>
                <TextMultiLanguage
                  style={[commonStyles.bottomsheetsectiontitle, commonStyles.sectionGap, commonStyles.textCenter]}
                  text={selectedTeam.status === 'Active' ? "GLOBAL_CONSTANTS.CONFIRM_DISABLE_MESSAGE" : "GLOBAL_CONSTANTS.CONFIRM_ENABLE_MESSAGE"}
                />
                <ViewComponent style={[commonStyles.dflex, commonStyles.gap12]}>
                  <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent
                      multiLanguageAllows={true}
                      title="GLOBAL_CONSTANTS.NO"
                      onPress={() => confirmSheetRef?.current?.close()}
                      solidBackground={true}
                    />
                  </ViewComponent>
                  <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent
                      multiLanguageAllows={true}
                      title="GLOBAL_CONSTANTS.YES"
                      onPress={handleToggleStatus}
                      loading={toggleLoading}
                    />
                  </ViewComponent>
                </ViewComponent>
              </ViewComponent>
            )}
          </ViewComponent>
        </CustomRBSheet>
      </Container>
    </ViewComponent>
  );
};

export default TeamList;

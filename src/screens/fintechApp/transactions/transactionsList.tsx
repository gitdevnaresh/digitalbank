import React, { useEffect, useRef, useState, useMemo } from 'react';
import moment from 'moment';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { getStatusColor, getThemedCommonStyles, TransactionBlobIcons } from '../../../components/CommonStyles';
import { s } from '../../../constants/theme/scale';
import { SvgUri } from 'react-native-svg';
import FlatListComponent from '../../../newComponents/flatList/flatList';
import ViewComponent from '../../../newComponents/view/view';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import Container from '../../../newComponents/container/container';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import { FormattedDateText } from '../../../newComponents/textComponets/dateTimeText/dateTimeText';
import { CurrencyText } from '../../../newComponents/textComponets/currencyText/currencyText';
import SearchCompApi from '../../../newComponents/searchComponents/searchCompApi';
import { ReceivedImages, Transactionwithdraw } from '../../../assets/svg';
import CustomRBSheet from '../../../newComponents/models/commonBottomSheet';
import { allTransactionList } from '../../commonScreens/transactions/skeltonViews';
import Loadding from '../../commonScreens/skeltons';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { TRANSACTION_CONST } from '../../commonScreens/transactions/constants';
import DashboardLoader from '../../../components/loader';
import TransactionFilterSheetContent from './TransactionFilterSheetContent';
import { useTransactionFilters } from './useTransactionFilters';
import { useTransactionData } from './useTransactionData';
import SafeAreaViewComponent from '../../../newComponents/safeArea/safeArea';
import { useHardwareBackHandler } from '../../../hooks/backHandleHook';
import TransactionDetails from '../../commonScreens/transactions/Details';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import { useSelector } from 'react-redux';
import { RefreshControl } from 'react-native';

const TransactionListItemSeparator = React.memo(({ commonStyles }: any) => (
  <ViewComponent style={[commonStyles.transactionsListGap]} />
));

const createItemSeparator = (commonStyles: any) => () => (
  <TransactionListItemSeparator commonStyles={commonStyles} />
);



const TransactionList: React.FC = (props: any) => {
  const [transactionDetailModel, setTransactionDetailModel] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const allTransactionListLoader = allTransactionList(10);
  const isFocused = useIsFocused();
  const [transactionId, setTransactionId] = useState<any>("");
  const navigation = useNavigation<any>();
  const [refreshCounter, setRefreshCounter] = useState(0); // New state for refresh trigger
  const rbSheetRef = useRef<any>(null);
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const statusColor = getStatusColor(NEW_COLOR);
  const itemSeparator = createItemSeparator(commonStyles);
  const cardId = props?.route?.params?.cardId;
  const initialModuleFromRoute = props?.route?.params?.trasactionType;
  const currency = props?.route?.params?.currency;
  const vaultId = "00000000-0000-0000-0000-000000000000"
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const Id = props?.route?.params?.id;
  const {
    appliedFilters,
    pickerStates,
    popUpErrorMsg,
    handleApplyFilter,
    handleClearFilter,
    handleErrorClose,
    setAppliedAccountMemberName,
  } = useTransactionFilters({ initialModuleFromRoute, rbSheetRef });

  const {
    pageNo, setPageNo,
    transactionListLoading,
    errormsg, setErrormsg,
    transactionsList, setTransactionData,
    stateLu, memberShip,
    getTranscationLookups,
    getAllTransactionsList,
    loadMoreData: loadMoreHookData,
  } = useTransactionData({ initialModule: initialModuleFromRoute });

  // Effect for initializing picker and applied filter based on route params and focus
  useEffect(() => {
    if (isFocused) {
      const initialModule = initialModuleFromRoute ?? "All";
      // Set the picker's initial value if not set or different from initialModule
      if (!pickerStates.selectedAccountMemberInPicker || pickerStates.selectedAccountMemberInPicker.name !== initialModule) {
        pickerStates.setSelectedAccountMemberInPicker({ id: initialModule, name: initialModule, state: 'All' });
      }
      // Set the applied filter value; this will trigger data fetch if it changes.
      if (appliedFilters.moduleName !== initialModule) {
        setAppliedAccountMemberName(initialModule);
      }
    }
  }, [isFocused, initialModuleFromRoute, pickerStates.selectedAccountMemberInPicker, appliedFilters.moduleName, setAppliedAccountMemberName, pickerStates.setSelectedAccountMemberInPicker]);

  // Effect for fetching transaction lookups
  useEffect(() => {
    if (isFocused) {
      getTranscationLookups();
    }
  }, [isFocused, getTranscationLookups]);

  // Effect for fetching transaction data
  useEffect(() => {
    if (isFocused) {
      setPageNo(1);
      setTransactionData([]); // Clear data before new fetch for page 1
      // Destructure appliedFilters to use its properties as dependencies
      const { startDate, endDate, status, moduleName } = appliedFilters;

      const formattedStartDate = startDate ? moment(startDate).format("YYYY-MM-DD") : null;
      const formattedEndDate = endDate ? moment(endDate).format("YYYY-MM-DD") : null;
      const moduleToFetch = moduleName ?? initialModuleFromRoute ?? "All";

      getAllTransactionsList(1, searchQuery, status, moduleToFetch, formattedStartDate, formattedEndDate, vaultId, cardId, currency, Id);
      // BackHandler setup remains the same
    }
  }, [
    isFocused,
    appliedFilters.startDate, // Use individual stable properties from appliedFilters
    appliedFilters.endDate,
    appliedFilters.status,
    appliedFilters.moduleName,
    searchQuery,
    refreshCounter, // Add refreshCounter as a dependency
    getAllTransactionsList, // Assumed to be stable from useCallback
    initialModuleFromRoute, // Keep this dependency
    setPageNo, setTransactionData // State setters are stable
  ]);
  useHardwareBackHandler(() => {
    backArrowButtonHandler();
  })
  const handleRefresh = () => {
    setRefreshing(true);
    setSearchQuery("")
    handleClearFilter();// This will reset applied filters and picker states
    setRefreshCounter(prev => prev + 1); // Increment counter to force useEffect trigger
    // Data fetching will be triggered by the useEffect due to appliedFilters change
    setRefreshing(false);
  };

  const handleSearch = (value: any) => {
    setSearchQuery(value);
  };

  const neoTransactionpopup = (val: any) => {
    setTransactionId(val?.id ?? val?.transactionId);
    setTransactionDetailModel(true);
  };
  const backArrowButtonHandler = () => {
    navigation.goBack();
  };

  const loadMoreData = () => {
    loadMoreHookData(searchQuery, appliedFilters.status, appliedFilters.moduleName, appliedFilters.startDate, appliedFilters.endDate, vaultId, cardId, currency, Id);
  };

  const renderFooter = () => {
    if (!transactionListLoading) return null;
    else {
      return (
        <Loadding contenthtml={allTransactionListLoader} />
      );
    }
  };
  const iconsList = {
    buy: (
      <ViewComponent style={[commonStyles.buy]}>
        <ViewComponent>
          <SvgUri
            width={s(14)}
            height={s(14)}
            uri={TransactionBlobIcons.buy}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    purchase: (
      <SvgUri
        width={s(12)}
        height={s(12)}
        uri={TransactionBlobIcons.purchase}
      />
    ),
    purchasefiat: (
      <SvgUri
        width={s(12)}
        height={s(12)}
        uri={TransactionBlobIcons.purchasefiat}
      />
    ),
    purchasecrypto: (
      <SvgUri
        width={s(12)}
        height={s(12)}
        uri={TransactionBlobIcons.purchasecrypto}
      />
    ),
    sell: (
      <ViewComponent style={[commonStyles.sell]}>
        <ViewComponent>
          <SvgUri
            width={s(14)}
            height={s(14)}
            uri={TransactionBlobIcons.sell}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    withdraw: (
      <ViewComponent style={[commonStyles.bgwithdraw]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    deposit: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    accountdeposit: (
      <SvgUri
        width={s(50)}
        height={s(50)}
        uri={TransactionBlobIcons.accountdeposit}
      />
    ),
    withdrawcrypto: (
      <ViewComponent style={[commonStyles.bgwithdraw]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    depositfiat: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    payinfiat: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    exchangewallettransfer: (
      <SvgUri
        width={s(12)}
        height={s(12)}
        uri={TransactionBlobIcons.exchangewallettransfer}
      />
    ),
    depositcrypto: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    withdrawfiat: (
      <ViewComponent style={[commonStyles.bgwithdraw]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    payoutfiat: (
      <ViewComponent style={[commonStyles.bgwithdraw]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    payoutcrypto: (
      <ViewComponent style={[commonStyles.bgwithdraw]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    payincrypto: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    buyreferralbonus: (
      <ViewComponent style={[commonStyles.buy]}>
        <ViewComponent>
          <SvgUri
            width={s(14)}
            height={s(14)}
            uri={TransactionBlobIcons.buy}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    sellreferralbonus: (
      <ViewComponent style={[commonStyles.sell]}>
        <ViewComponent>
          <SvgUri
            width={s(14)}
            height={s(14)}
            uri={TransactionBlobIcons.sell}
          />
        </ViewComponent>
      </ViewComponent>
    ),
      payoutcryptolevelbonus: (
            <ViewComponent style={[commonStyles.bgwithdraw]}>
                <ViewComponent>
                    <SvgUri
                        width={s(12)}
                        height={s(12)}
                        uri={TransactionBlobIcons.withdraw}
                    />
                </ViewComponent>
            </ViewComponent>
        ),
     payincryptolevelbonus:(
            <ViewComponent style={[commonStyles.bgdeposist]}>
                <ViewComponent>
                    <SvgUri
                        width={s(12)}
                        height={s(12)}
                        uri={TransactionBlobIcons.deposit}
                    />
                </ViewComponent>
            </ViewComponent>
        ),
        depositcryptolevelbonus: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
     depositlevelbonus: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
     withdrawcryptolevelbonus: (
       <ViewComponent style={[commonStyles.bgwithdraw]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
     withdrawlevelbonus: (
       <ViewComponent style={[commonStyles.bgwithdraw]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    refund: (
      <ViewComponent style={[commonStyles.refumdbg]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.refund}
          />
        </ViewComponent>
      </ViewComponent>
    ),
     levelbonus: (
      <ViewComponent style={[commonStyles.refumdbg]}>
        <ViewComponent>
          <SvgUri
            width={s(18)}
            height={s(18)}
            uri={TransactionBlobIcons.referralbonus}
          />
        </ViewComponent>
      </ViewComponent>
    ),
      applycard: (
          <ViewComponent style={[commonStyles.bgdeposist]}>
            <ViewComponent>
              <SvgUri
                width={s(12)}
                height={s(12)}
                uri={TransactionBlobIcons.applycard}
              />
            </ViewComponent>
          </ViewComponent>
        ),
           fee: (
          <ViewComponent style={[commonStyles.bgdeposist]}>
            <ViewComponent>
              <SvgUri
                width={s(14)}
                height={s(14)}
                uri={TransactionBlobIcons.applycard}
              />
            </ViewComponent>
          </ViewComponent>
        ),
          consume: (
          <ViewComponent style={[commonStyles.bgdeposist]}>
            <ViewComponent>
              <SvgUri
                width={s(14)}
                height={s(14)}
                uri={TransactionBlobIcons.applycard}
              />
            </ViewComponent>
          </ViewComponent>
        ),
        topupcard:
        (
          <ViewComponent style={[commonStyles.bgdeposist]}>
            <ViewComponent>
              <SvgUri
                width={s(14)}
                height={s(14)}
                uri={TransactionBlobIcons.applycard}
              />
            </ViewComponent>
          </ViewComponent>
        ),
       default: (
      <ViewComponent style={[commonStyles.refumdbg]}>
        <ViewComponent>
          <SvgUri
            width={s(18)}
            height={s(18)}
            uri={TransactionBlobIcons.refund}
          />
        </ViewComponent>
      </ViewComponent>
    ),
  };
  // Define a type for the keys of iconsList
  type IconKey = keyof typeof iconsList;

  const renderItem = ({ item }: any) => {
    const state = item?.status ?? item?.remarks ?? item?.state ?? "";
    const txType = item.actionType || item.transactionType || item.type || item.action || "";
    const decimalPlaces = ["depositcrypto", "withdrawcrypto", "payoutcrypto", "payincrypto"].includes(item?.type?.toLowerCase()?.replaceAll(" ", "") || "") ? 4 : 2;
    
    // Simplified icon key generation
    const getIconKey = () => {
      const type = item?.action||item?.txType || item?.transactionType || item?.type || "";
      return type.toLowerCase().replaceAll(" ", "");
    };
    
    const iconKey = getIconKey();
    const displayIcon = iconsList[iconKey as keyof typeof iconsList] || iconsList.default; // fallback icon
    return (
      <CommonTouchableOpacity onPress={() => neoTransactionpopup(item)} activeOpacity={0.8} key={item?.id ?? item?.transactionId} style={[commonStyles.cardsbannerbg]}>
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap16]}>
          <ViewComponent style={[commonStyles.alignCenter, commonStyles.justifyCenter, { minHeight: s(34), minWidth: s(34) }]}>
            {displayIcon}
          </ViewComponent>
          <ViewComponent style={[commonStyles.dflex, commonStyles.flex1, commonStyles.justifyContent, commonStyles.gap10, commonStyles.alignCenter]}>
            <ViewComponent style={[commonStyles.flex1]}>
              <ParagraphComponent text={txType || ""} numberOfLines={1} style={[commonStyles.primarytext, { width: s(200) }, commonStyles.flex1]} />
              {/* {props?.route?.params?.trasactionType !== TRANSACTION_CONST.CARDS && <ParagraphComponent style={[commonStyles.primarytext, { width: s(200) }]} text={`${item?.actionType || item?.type || ""}`} numberOfLines={1} />} */}
              {/* {props?.route?.params?.trasactionType === TRANSACTION_CONST.CARDS && <ParagraphComponent style={[commonStyles.primarytext, { width: s(200) }]} text={`${item?.transactionType ?? item?.type ?? ""}`} numberOfLines={1} />} */}
              <FormattedDateText value={item?.date ?? item?.dateTime ?? item?.transactionDate ?? ""} conversionType='UTC-to-local' style={[commonStyles.secondarytext]} />
            </ViewComponent>
            <ViewComponent>
              {(item?.type != 'Sell' && item?.type != 'Buy') && <ViewComponent>{props?.route?.params?.trasactionType !== TRANSACTION_CONST.CARDS && <CurrencyText style={[commonStyles.listprimarytext, commonStyles.textRight,]} decimalPlaces={decimalPlaces} value={item?.value ?? item?.amount} currency={`${item?.wallet ?? item?.walletCode ?? userInfo?.currency ?? item?.type ?? ""}`} />}</ViewComponent>}
              {(item?.type == 'Sell' || item?.type == 'Buy') &&
                <ViewComponent >
                  {props?.route?.params?.trasactionType !== TRANSACTION_CONST.CARDS && <CurrencyText style={[commonStyles.listprimarytext, commonStyles.textRight]} decimalPlaces={decimalPlaces} value={item?.value ?? item?.amount} currency={`${item?.wallet ?? item?.walletCode ?? item?.type ?? ""}`} />}
                </ViewComponent>
              }
              {props?.route?.params?.trasactionType === TRANSACTION_CONST.CARDS && <CurrencyText style={[commonStyles.primarytext, commonStyles.textRight,]} value={item?.value ?? item?.amount} currency={`${item?.wallet ?? item?.walletCode ?? item?.type ?? ""}`} decimalPlaces={decimalPlaces} />}
              <ParagraphComponent style={[commonStyles.colorstatus, commonStyles.textRight, { color: statusColor[state !== null && state?.toLowerCase()] ?? NEW_COLOR.TEXT_GREEN }]} text={state} />
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
      </CommonTouchableOpacity>
    )
  }
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {pageNo === 1 && transactionListLoading ? (
        <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>
      ) : (
        <Container style={commonStyles.container}>
          <PageHeader title={"GLOBAL_CONSTANTS.TRANSACTIONS"} onBackPress={backArrowButtonHandler} />
          <ViewComponent>
            {errormsg !== "" && <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />}
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.sectionGap]}>
              <ViewComponent style={commonStyles.flex1}>
                <SearchCompApi
                  placeholder={"GLOBAL_CONSTANTS.SEARCH_TRANSACTIONS"}
                  onSearch={handleSearch}
                  inputStyle={[commonStyles.textWhite]}
                  searchQuery={searchQuery}
                />
              </ViewComponent>
            </ViewComponent>
          </ViewComponent>
          <FlatListComponent
            showsVerticalScrollIndicator={false}
            data={transactionsList ?? []}
            keyExtractor={(item: any, index: number) => `${item.id ?? 'item'}-${index}`}
            ItemSeparatorComponent={itemSeparator}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.5}
            renderItem={renderItem}
            ListFooterComponent={renderFooter}
            isLoading={transactionListLoading}
            contentContainerStyle={{ paddingBottom: s(180) }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          />
          {transactionDetailModel && (
            <TransactionDetails
              modalVisible={transactionDetailModel}
              transactionId={transactionId}
              closePopUp={() => setTransactionDetailModel(false)}
            />
          )}
          <CustomRBSheet refRBSheet={rbSheetRef} title="GLOBAL_CONSTANTS.FILTER_TITLE" height={s(600)}>
            <TransactionFilterSheetContent
              popUpErrorMsg={popUpErrorMsg}
              onCloseError={handleErrorClose}
              statusOptions={stateLu}
              selectedStatus={pickerStates.selectedStatusInPicker}
              onSelectStatus={(data) => pickerStates.setSelectedStatusInPicker(data?.code)}
              moduleOptions={memberShip}
              selectedModule={pickerStates.selectedAccountMemberInPicker}
              onSelectModule={pickerStates.setSelectedAccountMemberInPicker}
              startDate={pickerStates.selectedStartDateInPicker}
              onSelectStartDate={pickerStates.setSelectedStartDateInPicker}
              endDate={pickerStates.selectedEndDateInPicker}
              onSelectEndDate={pickerStates.setSelectedEndDateInPicker}
              onApply={handleApplyFilter}
              onClear={handleClearFilter}
            />
          </CustomRBSheet>
        </Container>
      )}
    </ViewComponent>
  );
};
export default TransactionList;



import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState, useCallback } from "react";
import { TouchableOpacity, TextInput } from "react-native"; // Import View from react-native for styling
import AntDesign from "react-native-vector-icons/AntDesign";
import { useThemeColors } from "../../../../../hooks/useThemeColors";
import { useLngTranslation } from "../../../../../hooks/useLngTranslation";
import { CoinImages, getStatusColor, getThemedCommonStyles } from "../../../../../components/CommonStyles";
import { transactionCard } from "../../../skeleton_views";
import PaymentService from "../../../../../apiServices/payments";
import {isErrorDispaly } from "../../../../../utils/helpers";
import ViewComponent from "../../../../../newComponents/view/view";
import ImageUri from "../../../../../newComponents/imageComponents/image";
import ParagraphComponent from "../../../../../newComponents/textComponets/paragraphText/paragraph";
import FlatListComponent from "../../../../../newComponents/flatList/flatList";
import ErrorComponent from "../../../../../newComponents/errorDisplay/errorDisplay";
import TransactionDetails from "../../../../commonScreens/transactions/Details";
import Loadding from "../../../../commonScreens/skeltons";
import { ms, s } from "../../../../../newComponents/theme/scale";
import Container from "../../../../../newComponents/container/container";
import PageHeader from "../../../../../newComponents/pageHeader/pageHeader";
import { CurrencyText } from "../../../../../newComponents/textComponets/currencyText/currencyText";
import { FormattedDateText } from "../../../../../newComponents/textComponets/dateTimeText/dateTimeText";
import DashboardLoader from "../../../../../components/loader";
import SafeAreaViewComponent from "../../../../../newComponents/safeArea/safeArea";
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook";

// Define the type for a single transaction item for better type safety
interface TransactionItem {
    id: string;
    wallet: string;
    network: string;
    merchantName: string;
    createdDate: string;
    amount: number;
    status: string;
    value: number;
    txSubtype: string;
}

/**
 * A self-contained component to display and search a paginated list of payout transactions.
 */
const PayoutTransactions: React.FC = () => {
    // State Management
    const [listData, setListData] = useState<TransactionItem[] | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [errormsg, setErrormsg] = useState<string>('');
    const [listLoading, setListLoading] = useState<boolean>(false);
    const [isLoadMore, setIsLoadMore] = useState<boolean>(false);
    const [pageNo, setPageNo] = useState<number>(1);
    const [trasactionId, setTransactionId] = useState<string>("");
    const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
    
    // Hooks
    const isFocused = useIsFocused();
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const loadingSkeleton = transactionCard(10); // Pre-generate the skeleton UI
    const statusColor = getStatusColor(NEW_COLOR);
    const navigation = useNavigation<any>();

    // Memoized data fetching logic
    const getData = useCallback(async (page: number, query: string) => {
        setListLoading(true);
        if (page === 1) {
            setListData(null); // Clear previous results for a new search/refresh
        }
        setErrormsg('');
        const pageSize = 10;
        try {
            const response = await PaymentService.getPayOutList(
                page,
                pageSize,
                query === '' ? 'null' : query,
            );
            
            if (response.ok) {
                const newData: TransactionItem[] = response.data?.data || [];
                const hasMoreData = newData.length === pageSize;
                
                if (page === 1) {
                    setListData(newData);
                } else {
                    setListData((prevData) => [...(prevData || []), ...newData]);
                }
                setIsLoadMore(hasMoreData);
            } else {
                setErrormsg(isErrorDispaly(response) || 'Failed to fetch data.');
            }
        } catch (error: any) {
            setErrormsg(isErrorDispaly(error) || 'An unexpected error occurred.');
        } finally {
            setListLoading(false);
        }
    }, []); // Empty dependency array as it doesn't depend on props/state from this scope

    // Effect to fetch data on search query change or when the screen is focused
    useEffect(() => {
        const handler = setTimeout(() => {
            if (isFocused) {
                setPageNo(1);
                getData(1, searchQuery);
            }
        }, 500); // Debounce to prevent rapid firing of API calls while typing
        return () => clearTimeout(handler);
    }, [searchQuery, isFocused, getData]);

    // Handler for updating search query text
    const handleSearchQueryChange = useCallback((text: string) => {
        setSearchQuery(text);
    }, []);

    // Handler for loading more data on scroll end
    const loadMoreData = () => {
        if (isLoadMore && !listLoading) {
            const newPage = pageNo + 1;
            setPageNo(newPage);
            getData(newPage, searchQuery);
        }
    };

    // Renders the loading indicator at the bottom of the list
    const renderFooter = () => {
        if (listLoading && pageNo > 1) {
            return <Loadding contenthtml={loadingSkeleton} />;
        }
        return null;
    };
    
    // Callback to open transaction details modal
    const handleView = useCallback((item: TransactionItem) => {
        setTransactionId(item?.id);
        setDetailsVisible(true);
    }, []);

    // Callback to clear error messages
    const handleError = useCallback(() => {
        setErrormsg('');
    }, []);
    
    const handleBackPresss = () => {
        navigation.goBack();
    };
useHardwareBackHandler(()=>{
    handleBackPresss();
})
    // JSX for the Search Input Box
    const SearchBoxComponent = (
        <ViewComponent style={commonStyles.sectionGap}>
            <ViewComponent style={commonStyles.searchContainer}>
                <AntDesign name={'search1'} color={NEW_COLOR.SEARCH_ICON} size={ms(22)} />
                <TextInput
                    value={searchQuery}
                    style={[commonStyles.searchInput, commonStyles.fs16, commonStyles.fw400]}
                    onChangeText={handleSearchQueryChange}
                    placeholder={t("GLOBAL_CONSTANTS.SEARCH_PAYOUT")}
                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_COLOR}
                />
            </ViewComponent>
        </ViewComponent>
    );

    const renderTransactionItem = ({ item, index }: { item: TransactionItem; index: number }) =>{ 
        const value=item?.value;
        const decimalPlaces = item?.txSubtype?.toLowerCase() === "fiat" ? 2 : 4;
        return(
        <ViewComponent>
            <TouchableOpacity  style ={[commonStyles.cardsbannerbg]} onPress={() => handleView(item)}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
                    {/* Left side: Icon and Details */}
                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter, commonStyles.flex1]}>
                        <ImageUri uri={CoinImages[item?.wallet.toLowerCase() as keyof typeof CoinImages] || CoinImages['eur']} width={s(34)} height={s(34)} />
                        <ViewComponent style={[commonStyles.mb4]}>
                            <ParagraphComponent text={item?.merchantName || ''} numberOfLines={1} style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.fw600, commonStyles.mb4]} />
                          <ParagraphComponent text={item?.network && item?.network.trim() !== '' ? `${item?.wallet}(${item?.network})` : item?.wallet || ''} style={[commonStyles.idrsecondarytext]} />
                        </ViewComponent>
                    </ViewComponent>
                    {/* Right side: Amount and Status */}
                    <ViewComponent>
                        <FormattedDateText value={item?.createdDate} conversionType='UTC-to-local' style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textGrey, commonStyles.mb4]} /> 
                        <CurrencyText value={value || 0} decimalPlaces={decimalPlaces} currency={item?.wallet} symboles={true} style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textWhite, commonStyles.textRight, commonStyles.mb2]}/>
                        <ParagraphComponent text={item?.status} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textRight, { color: statusColor[item?.status?.toLowerCase() as keyof typeof statusColor] || NEW_COLOR.TEXT_GREEN }]} />
                    </ViewComponent>
                </ViewComponent>
            </TouchableOpacity>
            {/* Render separator if it's not the last item */}
            {index < (listData?.length ?? 0) - 1 && <ViewComponent style={commonStyles.transactionsListGap} />}
        </ViewComponent>
    )};

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.container]}>
                <PageHeader title={"GLOBAL_CONSTANTS.PAYOUTS"} onBackPress={handleBackPresss}/>
                <ViewComponent style={{ flex: 1 }}>
                    {SearchBoxComponent}

                    {errormsg ? <ErrorComponent message={errormsg} onClose={handleError} /> : null}
                    
                    {listLoading && pageNo === 1 ? (
                        <SafeAreaViewComponent>
                            <DashboardLoader />
                        </SafeAreaViewComponent>
                    ) : (
                        <FlatListComponent
                            data={listData}
                            renderItem={renderTransactionItem}
                            keyExtractor={(item: TransactionItem) => item.id.toString()}
                            onEndReached={loadMoreData}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={renderFooter}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ flexGrow: 1 }}
                        />
                    )}

                    {detailsVisible && (
                        <TransactionDetails
                            modalVisible={detailsVisible}
                            transactionId={trasactionId}
                            closePopUp={() => setDetailsVisible(false)}
                        />
                    )}
                </ViewComponent>
            </Container>
        </ViewComponent>
    );
};

export default PayoutTransactions;

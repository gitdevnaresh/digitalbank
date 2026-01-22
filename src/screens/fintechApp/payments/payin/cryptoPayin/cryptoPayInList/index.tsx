import React, { useEffect, useRef, useState } from 'react';
import {StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import AntDesign from "react-native-vector-icons/AntDesign";
import { TextInput } from 'react-native-gesture-handler';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../../../../../hooks/useThemeColors';
import { CoinImages, getThemedCommonStyles, statusColor } from '../../../../../../components/CommonStyles';
import { ms, s } from '../../../../../../newComponents/theme/scale';
import ParagraphComponent from '../../../../../../newComponents/textComponets/paragraphText/paragraph';
import {formatDateTimes, isErrorDispaly } from '../../../../../../utils/helpers';
import { PAYMENT_LINK_CONSTENTS } from '../../../constants';
import { PaymentLinkListInterface } from '../../../interface';
import PaymentService from '../../../../../../apiServices/payments';
import Loadding from '../../../../../commonScreens/skeltons';
import { transactionCard } from '../../../../skeleton_views';
import KycVerifyPopup from '../../../../../commonScreens/kycVerify';
import { useLngTranslation } from '../../../../../../hooks/useLngTranslation';
import { useHardwareBackHandler } from '../../../../../../hooks/backHandleHook';
import ImageUri from '../../../../../../newComponents/imageComponents/image';
import DashboardLoader from '../../../../../../components/loader';
import ViewComponent from '../../../../../../newComponents/view/view';
import SafeAreaViewComponent from '../../../../../../newComponents/safeArea/safeArea';
import CommonTouchableOpacity from '../../../../../../newComponents/touchableComponents/touchableOpacity';
import FlatListComponent from '../../../../../../newComponents/flatList/flatList';
import ErrorComponent from '../../../../../../newComponents/errorDisplay/errorDisplay';
import ScrollViewComponent from '../../../../../../newComponents/scrollView/scrollView';
import { CurrencyText } from '../../../../../../newComponents/textComponets/currencyText/currencyText';
import { FormattedDateText } from '../../../../../../newComponents/textComponets/dateTimeText/dateTimeText';
import CustomeditLink from '../../../../../../components/svgIcons/mainmenuicons/linkedit';

const CryptoPayInGrid = (props: any) => {
    const isInTab = props?.isInTab || false;
    const [errormsg, setErrormsg] = useState<any>('');
    const [paymentsData, setPaymentsData] = useState<PaymentLinkListInterface[]>([]);
    const [allPaymentsData, setAllPaymentsData] = useState<PaymentLinkListInterface[]>([]); // Store all data for local search
    const flatListRef = useRef<any>(); // Added ref for FlatList
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails)
    const [dataLoading, setDataLoading] = useState<boolean>(false)
    const [initialLoading, setInitialLoading] = useState<boolean>(true) // Added for initial load
    const loading = transactionCard(10);
    const [searchText, setSearchText] = useState<string>(""); // Separate state for input text
    const [pageNo, setPageNo] = useState<number>(1);
    const [isLoadMore, setIsLoading] = useState<boolean>(false);
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const [kycModelVisible, setKycModelVisible] = useState<boolean>(false)
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const styles = themedStyles();
    const { t } = useLngTranslation();

    useEffect(() => {
        if (!isInTab || props?.isActiveTab) {
            if (isFocused) {
                getData(1, true);
            }
        }
    }, [isFocused, isInTab, props?.isActiveTab])

    useHardwareBackHandler(() => {
        backArrowButtonHandler();
    })

    const backArrowButtonHandler = () => {
        navigation.navigate("Dashboard", { screen: "GLOBAL_CONSTANTS.PAYMENTS" });
    };

    const getData = async (pageNumber: any, isInitialLoad = false) => {
        if (isInitialLoad) {
            setInitialLoading(true);
        } else {
            setDataLoading(true);
        }

        const pageSize = 10;
        try {
            const response: any = await PaymentService.getAllPaymentLinks(
                "payins",
                'null', // Always fetch all data, search is local now
                pageNumber || pageNo,
                pageSize
            );
            const moreData = response?.data?.data.length == pageSize;
            if (response.ok) {
                if ((pageNumber || pageNo) === 1) {
                    setAllPaymentsData(response.data?.data); // Store all data
                    setPaymentsData(response.data?.data); // Show all by default
                } else {
                    setAllPaymentsData(prev => [...prev, ...response?.data?.data]);
                    setPaymentsData(prev => [...prev, ...response?.data?.data]);
                }
                setErrormsg('')
            } else {
                setErrormsg(isErrorDispaly(response))
            }
            setIsLoading(moreData)
        }
        catch (error) {
            setErrormsg(isErrorDispaly(error))
        } finally {
            if (isInitialLoad) {
                setInitialLoading(false);
            } else {
                setDataLoading(false);
            }
        }
    }
    const loadMoreData = () => {
        if (isLoadMore === true && !dataLoading) {
            setPageNo(prevPage => prevPage + 1);
            getData(pageNo + 1);
        }
    };
    const renderFooter = () => {
        if (!dataLoading) {
            return null;
        }
        else {
            return (
                <Loadding contenthtml={loading} />
            );
        }
    };
    const handleView = (item: any) => {
        const returnTab = props?.currentTabIndex ?? 1;
        if (item?.type === PAYMENT_LINK_CONSTENTS.INVOICE) {
            navigation.navigate(PAYMENT_LINK_CONSTENTS.INVOICE_FROM_SUMMARY, { id: item?.id, payinGrid: PAYMENT_LINK_CONSTENTS.PAY_IN_GRID, action: PAYMENT_LINK_CONSTENTS.VIEW_COMPONENT, invoiceNo: item?.invoiceNo, returnTab })
        }
        else if (item?.type === PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.PAYMENT_LINK) {
            navigation.navigate(PAYMENT_LINK_CONSTENTS.STATIC_PAYMENT_LINK, { id: item?.id, payinGrid: PAYMENT_LINK_CONSTENTS.PAY_IN_GRID, action: PAYMENT_LINK_CONSTENTS.VIEW_COMPONENT, invoiceNo: item?.invoiceNo, returnTab })
        }
    };
    const handleEdit = (val: any) => {
        if (userInfo?.kycStatus == null || userInfo?.kycStatus == "Draft" || userInfo?.kycStatus == "Submitted") {
            setKycModelVisible(!kycModelVisible);
            return;
        }
        if (val?.status === PAYMENT_LINK_CONSTENTS.PAID) {
            setErrormsg(PAYMENT_LINK_CONSTENTS.PAYIN_HAS_BEEN_FULLY_PAID);
            setTimeout(() => scrollToTop(), 100);
        }
        else if (val?.status === PAYMENT_LINK_CONSTENTS.CANCELLED) {
            setErrormsg(PAYMENT_LINK_CONSTENTS.CANNOT_EDIT_CANCELLED_PAYIN);
            setTimeout(() => scrollToTop(), 100);
        }
        else if (val?.status === PAYMENT_LINK_CONSTENTS.PARTIALLY_PAID) {
            setErrormsg(PAYMENT_LINK_CONSTENTS.PAY_IN_HAS_BEEN_PARTIALLY_PAID);
            setTimeout(() => scrollToTop(), 100);
        }
         else if (val?.status === "Expired") {
              setErrormsg(PAYMENT_LINK_CONSTENTS.EXPIRED_PAYIN);
              setTimeout(() => scrollToTop(), 100);
               }
        else {
            const returnTab = props?.currentTabIndex ?? 1;
            if (val.type === PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.PAYMENT_LINK) {
                navigation.navigate(PAYMENT_LINK_CONSTENTS.CREATE_PAYMENT_COMPONENT, { id: val?.id, Type: val?.type, invoiceNo: val?.invoiceNo, returnTab });
            }
            else {
                navigation.navigate(PAYMENT_LINK_CONSTENTS.INVOICE_FORM, { id: val?.id, Type: val?.type, invoiceNo: val?.invoiceNo, returnTab })
            }
        }
    };

    const handleSearchQueryChange = (val: string) => {
        setSearchText(val);
        if (val.trim() === "") {
            setPaymentsData(allPaymentsData);
        } else {
            const filtered = allPaymentsData.filter((item) => {
                return (
                    (item.invoiceNo && item.invoiceNo.toLowerCase().includes(val.toLowerCase())) ||
                    (item.currency && item.currency.toLowerCase().includes(val.toLowerCase())) ||
                    (item.state && item.state.toLowerCase().includes(val.toLowerCase()))
                );
            });
            setPaymentsData(filtered);
        }
    };

    const handleSearch = () => {
        // No-op, search happens onChangeText
    };

    const handleSubmitEditing = () => {
        // No-op, search happens onChangeText
    };

    const scrollToTop = () => {
        if (flatListRef?.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
    };

    const SearchBoxComponent = (
        <ViewComponent style={commonStyles.sectionGap}>
            <ViewComponent style={[commonStyles.searchContainer]}>
                <CommonTouchableOpacity onPress={handleSearch} >
                    <AntDesign name={PAYMENT_LINK_CONSTENTS.SEARCH1} color={NEW_COLOR.SEARCH_ICON} size={ms(22)} style={styles.searchIcon} />
                </CommonTouchableOpacity>
                <TextInput
                    style={[commonStyles.searchinputtext]}
                    onChangeText={handleSearchQueryChange}
                    onSubmitEditing={handleSubmitEditing}
                    value={searchText}
                    placeholder={t("GLOBAL_CONSTANTS.SEARCH_COIN")}
                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_COLOR}
                    returnKeyType="search"
                />
            </ViewComponent>
        </ViewComponent>
    );

    const handleError = () => {
        setErrormsg('');
    }

    const closekycModel = () => {
        setKycModelVisible(!kycModelVisible)
    };

    return (
        <ViewComponent style={[commonStyles.flex1]}>
            {initialLoading && <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>}
            {!initialLoading && <ViewComponent style={[commonStyles.mt32, commonStyles.flex1]}>
                <ViewComponent style={commonStyles.flex1}>
                    {errormsg && <ErrorComponent message={errormsg} onClose={handleError} />}
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                            {SearchBoxComponent}
                        </ViewComponent>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1,commonStyles.sectionGap]}>
                        <ScrollViewComponent>
                        <FlatListComponent
                        scrollEnabled={false}   // ?? disables FlatList scroll
                        nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={false}
                            ref={flatListRef}
                            data={paymentsData}
                            renderItem={({ item, index }: any) => (<ViewComponent>
                                <CommonTouchableOpacity key={index} onPress={() => handleView(item) }
                                    style={[commonStyles.cardsbannerbg]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter, commonStyles.flex1]}>
                                            <ViewComponent style={{ minWidth: s(34), minHeight: s(34) }}>
                                                <ImageUri uri={CoinImages[item?.currency.toLowerCase() || 'eur']} width={s(34)} height={s(34)} />
                                            </ViewComponent>
                                            <ViewComponent>
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mb6, commonStyles.gap10]}>
                                                    <ParagraphComponent text={item?.invoiceNo} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} numberOfLines={1} />
                                                    <CustomeditLink width={s(24)} height={s(20)} onPress={() => handleEdit(item)} />
                                                </ViewComponent>
                                                <ParagraphComponent text={`${item.currency}(${item?.network})`} numberOfLines={1} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey,commonStyles.mb6]} />
                                                <ParagraphComponent text={item?.type} style={[commonStyles.fs12, commonStyles.fw400,commonStyles.textlinkgrey]}/>
                                            </ViewComponent>
                                        </ViewComponent>
                                        <ViewComponent style={[]}>
                                            <FormattedDateText value={item?.date || "--"} conversionType='UTC-to-local'  style={[commonStyles.idrsecondarytext]} />
                                            <CurrencyText value={item?.amount || 0} decimalPlaces={4} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite, commonStyles.textRight,commonStyles.mb6]} />
                                            <ParagraphComponent text={item?.status} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textRight, { color: statusColor[item?.status?.toLowerCase()] || NEW_COLOR.TEXT_GREEN }]} />

                                        </ViewComponent>
                                    </ViewComponent>
                                </CommonTouchableOpacity>
                                {index !== paymentsData.length - 1 &&
                                    <ViewComponent style={[commonStyles.transactionsListGap]} />}
                            </ViewComponent>)}
                            keyExtractor={(item) => item?.id}
                            onEndReached={loadMoreData}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={renderFooter}
                        />
                        </ScrollViewComponent>
                    </ViewComponent>
                </ViewComponent>
                {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} />}
            </ViewComponent>}
        </ViewComponent>
    );
};
export default CryptoPayInGrid;

const themedStyles = () => StyleSheet.create({
    searchIcon: {
        marginTop: 4,
        width: ms(22),
        height: ms(22),
    }
});

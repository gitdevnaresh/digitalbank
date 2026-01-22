import React, { useCallback, useEffect, useState } from 'react';
import { TextInput, Keyboard, RefreshControl } from 'react-native';
import { ms, s } from '../../../../constants/theme/scale';
import { isErrorDispaly } from '../../../../utils/helpers';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import { useSelector } from 'react-redux';
import { CoinImages, getThemedCommonStyles } from '../../../../components/CommonStyles';
import SvgFromUrl from '../../../../components/svgIcon';
import { useIsFocused } from '@react-navigation/native';
import { CurrencyText } from '../../../../newComponents/textComponets/currencyText/currencyText';
import Container from '../../../../newComponents/container/container';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import AntDesign from "react-native-vector-icons/AntDesign";
import { CRYPTO_CONSTANTS, CurrencyDetails, FiatLoadingstate, PayWithWalletFiatConfirm, PayWithWalletFiatLists } from './createAccConstant';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import CreateAccountService from '../../../../apiServices/createAccount';
import ViewComponent from '../../../../newComponents/view/view';
import DashboardLoader from '../../../../components/loader';
import ScrollViewComponent from '../../../../newComponents/scrollView/scrollView';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import NoDataComponent from '../../../../newComponents/noData/noData';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';

const PayWithFiatCurrencies = React.memo((props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const selectedBank = props.selectedBank || useSelector((state: any) => state.userReducer.selectedBank);
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const [searchText, setSearchText] = useState<string>("");
    const [refresh, setRefresh] = useState<boolean>(false);
    const { t } = useLngTranslation();
    const isFocused = useIsFocused();
    const Kyc_KybDocuments = props?.route?.params?.Documents;
    const [lists, setLists] = useState<PayWithWalletFiatLists>({
        currenciesList: [],
        currenciesPrevList: []
    });
    const [isLoadings, setIsLoadings] = useState<FiatLoadingstate>({
        currencyLoading: false,
        isActive: false,
        isCurencySelected: false,
        btnLoading: false
    })
    const [selectedItem, setSelectedItem] = useState<CurrencyDetails>({
        id: "",
        currency: "",
        code: "",
        logo: "",
        amount: 0,
        amountInUSD: 0,
        minLimit: 0,
        maxLimit: 0
    })

    useEffect(() => {
        if (props?.isActiveTab !== false) {
            getCurrencies()
            setSelectedItem({
                id: "",
                currency: "",
                code: "",
                logo: "",
                amount: 0,
                amountInUSD: 0,
                minLimit: 0,
                maxLimit: 0
            })
        }
    }, [isFocused, props?.isActiveTab]);

    const handleChangeSearch = useCallback((val: string) => {
        let value = val.trim();
        setSearchText(value)
        if (value) {
            let filterData = lists?.currenciesPrevList.filter((item: any) => {
                return (
                    item.code?.toLowerCase().includes(value.toLowerCase()) ||
                    item.currency?.toLowerCase().includes(value.toLowerCase())
                );
            });
            setLists((prev) => ({ ...prev, currenciesList: filterData }))
        } else {
            setLists((prev) => ({ ...prev, currenciesList: lists?.currenciesPrevList }))
        }
    }, [lists?.currenciesPrevList]);

    const SearchBoxComponent = (
        <ViewComponent style={{ marginBottom: s(16) }}>
            <ViewComponent style={[commonStyles.searchContainer]


            }>
                <AntDesign name={CRYPTO_CONSTANTS.SEARCH_ICON} color={NEW_COLOR.SEARCH_ICON} size={ms(22)} />

                <TextInput
                    value={searchText}
                    style={{
                        flex: 1,
                        color: NEW_COLOR.TEXT_WHITE,
                        fontSize: s(16),
                        paddingVertical: s(10),
                        backgroundColor: 'transparent',
                    }}
                    onChangeText={handleChangeSearch}
                    placeholder={t("GLOBAL_CONSTANTS.SEARCH")}
                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_COLOR}
                />
            </ViewComponent>
        </ViewComponent>
    );

    const onRefresh = async () => {
        setRefresh(true);
        try {
            await getCurrencies();
        } finally {
            setRefresh(false);
        }
    };

    const getCurrencies = async () => {
        setIsLoadings((prev) => ({ ...prev, currencyLoading: true }))
        setErrormsg('');
        try {
            const response: any = await CreateAccountService.getVaultFiatCurrencies();
            if (response.ok) {
                setLists((prev: any) => ({ ...prev, currenciesList: response?.data?.assets, currenciesPrevList: response?.data?.assets }))
                setIsLoadings((prev) => ({ ...prev, currencyLoading: false }))
            } else {
                setErrormsg(isErrorDispaly(response));
                setIsLoadings((prev) => ({ ...prev, currencyLoading: false }))
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setIsLoadings((prev) => ({ ...prev, currencyLoading: false }))
        }
    };

    const handleContinue = async () => {
        setIsLoadings((prev) => ({ ...prev, btnLoading: true }))
        const saveObj: PayWithWalletFiatConfirm = {
            walletId: selectedItem?.id,
            amount: 0,
            // documents: identityDocuments,
        }
        try {
            const response: any = await CreateAccountService.confirmPayWithFiat(selectedBank?.productId, saveObj);
            if (response?.ok) {
                setIsLoadings((prev) => ({ ...prev, btnLoading: false }))
                setSearchText('')
                props?.navigation.navigate("payWithFiatPreview", {
                    selectedAccount: props?.route?.params?.selectedAccount,
                    selectedBank: selectedBank?.name,
                    accountToCreate: response?.data?.accountToCreate,
                    amount: response?.data?.amount,
                    payingWalletCoin: response?.data?.payingWalletCoin,
                    selectedPayingItem: selectedItem,
                    documents: Kyc_KybDocuments
                })
            } else {
                setIsLoadings((prev) => ({ ...prev, btnLoading: false }))
                setErrormsg(isErrorDispaly(response))
            }
        } catch (error) {
            setIsLoadings((prev) => ({ ...prev, btnLoading: false }))
            setErrormsg(isErrorDispaly(error))
        }
    };

    const handleSelectedItem = async (item: any) => {
        // Check if amount is 0 or null
        if (!item?.amount || item?.amount <= 0) {
            setSelectedItem(item);
            setErrormsg(`${t("GLOBAL_CONSTANTS.INSUFFICIENT_FUNDS")} for ${item?.code || 'selected coin'}`);
            return;
        }
        
        setSelectedItem(item);
        setErrormsg('');
        setIsLoadings((prev) => ({ ...prev, btnLoading: true }));
        const saveObj: PayWithWalletFiatConfirm = {
            walletId: item?.id,
            amount: 0,
        };
        try {
            const response: any = await CreateAccountService.confirmPayWithFiat(selectedBank?.productId, saveObj);
            if (response?.ok) {
                setIsLoadings((prev) => ({ ...prev, btnLoading: false }));
                setSearchText('');
                props?.navigation.navigate("payWithFiatPreview", {
                    selectedAccount: props?.route?.params?.selectedAccount,
                    selectedBank: selectedBank,
                    accountToCreate: response?.data?.accountToCreate,
                    amount: response?.data?.amount,
                    payingWalletCoin: response?.data?.payingWalletCoin,
                    selectedPayingItem: item,
                    documents: Kyc_KybDocuments,
                    fromScreen:props.route.params.targetScreen
                });
            } else {
                setIsLoadings((prev) => ({ ...prev, btnLoading: false }));
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setIsLoadings((prev) => ({ ...prev, btnLoading: false }));
            setErrormsg(isErrorDispaly(error));
        }
    }
    const handleCloseError = useCallback(() => {
        setErrormsg("")
    }, []);
    return (
        <Container style={[commonStyles.screenBg]}>
            <ScrollViewComponent
                refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}
            >
                {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                <ViewComponent>{SearchBoxComponent}</ViewComponent>
                {isLoadings?.currencyLoading && (
                    <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        <DashboardLoader />
                    </ViewComponent>)}
                {!isLoadings?.currencyLoading && lists?.currenciesList && lists?.currenciesList?.length > 0 &&
                    <ViewComponent>
                        <ViewComponent>
                            {lists?.currenciesList?.map((item: any, index: any) => {
                                const isSelected = selectedItem?.id === item.id;
                                return (
                                    <CommonTouchableOpacity
                                        key={item.id}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            handleSelectedItem(item);
                                        }}
                                        activeOpacity={0.85}

                                    >
                                        <ViewComponent
                                            style={[
                                                commonStyles.gap16, 
                                                commonStyles.dflex, 
                                                commonStyles.alignCenter, 
                                                commonStyles.py14,
                                                isSelected && { backgroundColor: NEW_COLOR.actioniconbg || '', borderRadius: s(8) }
                                            ]}  >

                                            <ViewComponent style={{ width: s(30), height: s(30) }}>
                                                <SvgFromUrl uri={item?.code?.toLowerCase() === 'usd' ? CoinImages['bankusd'] : CoinImages[item?.code?.toLowerCase() || '']} width={s(32)} height={s(32)} />
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.flexWrap,{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                                                <ParagraphComponent text={item?.code || ""} style={[commonStyles.listprimarytext]} />
                                                <CurrencyText 
                                                    value={item?.amount || 0} 
                                                    style={[commonStyles.listprimarytext]} 
                                                    decimalPlaces={2}
                                                />
                                            </ViewComponent>
                                        </ViewComponent>
                                    </CommonTouchableOpacity>
                                )
                            })}
                        </ViewComponent>
                    </ViewComponent>
                }
                {!isLoadings?.currencyLoading && lists?.currenciesList?.length < 1 &&
                    <ViewComponent >
                        <NoDataComponent />
                    </ViewComponent>
                }
                


            </ScrollViewComponent>
            

        </Container>
    )
})

export default PayWithFiatCurrencies;

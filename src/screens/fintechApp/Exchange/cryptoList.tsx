import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { TextInput, BackHandler } from 'react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { CoinImages, getThemedCommonStyles } from '../../../components/CommonStyles';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import ViewComponent from '../../../newComponents/view/view';

import AntDesign from "react-native-vector-icons/AntDesign";
import ExchangeServices from '../../../apiServices/exchange';
import { isErrorDispaly } from '../../../utils/helpers';
import Container from '../../../newComponents/container/container';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import FlatListComponent from '../../../newComponents/flatList/flatList';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import SvgFromUrl from '../../../components/svgIcon';
import { ms, s } from '../../../newComponents/theme/scale';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import { CurrencyText } from '../../../newComponents/textComponets/currencyText/currencyText';
import NoDataComponent from '../../../newComponents/noData/noData';
import DashboardLoader from '../../../components/loader';
interface CryptoDetails {
    id: string;
    code: string;
    name: string;
    amount: number;
    logo: string;
}

interface CryptoLoadingState {
    cryptoLoading: boolean;
    isActive: boolean;
    isCryptoSelected: boolean;
    btnLoading: boolean;
}

interface CryptoListState {
    cryptoList: any[];
    cryptoPrevList: any[];
}

// Memoized row component
const CryptoRow = React.memo(({ item, onPress, isSelected, commonStyles, NEW_COLOR }: any) => {
    return (
        <CommonTouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            style={[commonStyles.listitemGap]}
        >
            <ViewComponent
                style={[isSelected && commonStyles.tabactivebg,isSelected &&  commonStyles.px10, commonStyles.py7,isSelected &&commonStyles.rounded12, commonStyles.gap16, commonStyles.dflex, commonStyles.alignCenter, ]}  >
                <ViewComponent style={{ width: s(30), height: s(30) }}>
                    {CoinImages[item?.code?.toLowerCase()] && (
                        <SvgFromUrl uri={CoinImages[item?.code?.toLowerCase()]} width={s(32)} height={s(32)} />
                    )}
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex,commonStyles.alignCenter,commonStyles.justifyContent,commonStyles.flex1]}>
                    <ViewComponent>
                        <ParagraphComponent text={item?.name || ""} style={[commonStyles.primarytext]} />
                        <ParagraphComponent text={item?.code || ""} style={[commonStyles.secondarytext]} />
                    </ViewComponent>
                    <CurrencyText value={item?.amount || 0} style={[commonStyles.primarytext]} currency={item?.code} decimalPlaces={4}/>
                </ViewComponent>
            </ViewComponent>
        </CommonTouchableOpacity>
    );
});

const ExchangeCryptoList = React.memo((props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const [searchText, setSearchText] = useState<string>("");
    const { t } = useLngTranslation();
    const isFocused = useIsFocused();
    const navigation = useNavigation<any>();

    const [lists, setLists] = useState<CryptoListState>({
        cryptoList: [],
        cryptoPrevList: []
    });

    const [isLoadings, setIsLoadings] = useState<CryptoLoadingState>({
        cryptoLoading: false,
        isActive: false,
        isCryptoSelected: false,
        btnLoading: false
    });
    const [refreshing, setRefreshing] = useState(false);

    const [selectedItem, setSelectedItem] = useState<CryptoDetails>({
        id: "",
        code: "",
        name: "",
        amount: 0,
        logo: ""
    });

    const handleGoBack = useCallback(() => {
        navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.EXCHANGE", animation: "slide_from_left" });
    }, [navigation]);

    useEffect(() => {
        if (isFocused) {
            setSearchText("");
            getCryptoList();
            setSelectedItem({ id: "", code: "", name: "", amount: 0, logo: "" });
        }
    }, [isFocused]);

    useEffect(() => {
        const backAction = () => {
            handleGoBack();
            return true;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [handleGoBack]);

    const handleChangeSearch = useCallback((val: string) => {
        let value = val.trim();
        setSearchText(value)
        if (value) {
            let filterData = lists?.cryptoPrevList.filter((item: any) => {
                return (
                    item.code?.toLowerCase().includes(value.toLowerCase()) ||
                    item.name?.toLowerCase().includes(value.toLowerCase())
                );
            });
            setLists((prev) => ({ ...prev, cryptoList: filterData }))
        } else {
            setLists((prev) => ({ ...prev, cryptoList: lists?.cryptoPrevList }))
        }
    }, [lists?.cryptoPrevList]);

    const SearchBoxComponent = (
        <ViewComponent style={[commonStyles.titleSectionGap]}>
            <ViewComponent style={[commonStyles.searchContainer]}>
                <AntDesign name="search1" color={NEW_COLOR.SEARCH_ICON} size={ms(22)} />
                <TextInput
                    value={searchText}
                    style={[commonStyles.inputsearch]}
                    onChangeText={handleChangeSearch}
                    placeholder={t("GLOBAL_CONSTANTS.SEARCH")}
                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_COLOR}
                />
            </ViewComponent>
        </ViewComponent>
    );

    const getCryptoList = async () => {
        setIsLoadings((prev) => ({ ...prev, cryptoLoading: true }))
        setErrormsg('');
        try {
            const pageNo = 1;
            const pageSize = 10;
            const response: any = await ExchangeServices.getexchangeCryptoList(pageNo, pageSize);

            if (response.ok) {
                const assetsData = response?.data?.assets || [];
                setLists((prev: any) => ({ ...prev, cryptoList: assetsData, cryptoPrevList: assetsData }))
                setIsLoadings((prev) => ({ ...prev, cryptoLoading: false }))
            } else {
                setErrormsg(isErrorDispaly(response));
                setIsLoadings((prev) => ({ ...prev, cryptoLoading: false }))
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setIsLoadings((prev) => ({ ...prev, cryptoLoading: false }))
        }
    };

    const handleSelectedItem = useCallback((item: any) => {
        setIsLoadings((prev) => ({ ...prev, isActive: true, isCryptoSelected: true }));
        setSelectedItem(item);
        const screenName = props?.route?.params?.type === 'sell' ? 'CryptoSellExchange' : 'CryptoExchange';
        props?.navigation.navigate(screenName, {
            cryptoCoin: item?.code,
            coinFullName: item?.name,
            logo: item?.image,
            amountInUSD: item?.amount,
            fromScreen: 'ExchangeCryptoList'
        });
    }, [props?.route?.params?.type, props?.navigation]);

    const renderItem = useCallback(({ item }: any) => {
        const isSelected = selectedItem?.id === item.id;
        return (
            <CryptoRow
                item={item}
                onPress={() => handleSelectedItem(item)}
                isSelected={isSelected}
                commonStyles={commonStyles}
                NEW_COLOR={NEW_COLOR}
            />
        );
    }, [selectedItem?.id, handleSelectedItem, commonStyles, NEW_COLOR]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await getCryptoList();
        setRefreshing(false);
    }, []);

    const handleCloseError = useCallback(() => {
        setErrormsg("")
    }, []);

    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <Container style={[commonStyles.container, commonStyles.flex1]}>
                <PageHeader title={t("GLOBAL_CONSTANTS.SELECT_CRYPTO")} onBackPress={handleGoBack} />
                {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                <ViewComponent style={[commonStyles.titleSectionGap]}>{SearchBoxComponent}</ViewComponent>
                {isLoadings?.cryptoLoading && (
                    <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        <DashboardLoader />
                    </ViewComponent>)}
                {!isLoadings?.cryptoLoading && lists?.cryptoList && lists?.cryptoList?.length > 0 &&
                    <ViewComponent>
                        <FlatListComponent
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            data={lists?.cryptoList}
                            scrollEnabled={true}
                            numColumns={1}
                            renderItem={renderItem}
                            keyExtractor={(item: any) => item.id}
                        />
                    </ViewComponent>
                }
                {!isLoadings?.cryptoLoading && lists?.cryptoList?.length < 1 &&
                    <ViewComponent>
                        <NoDataComponent />
                    </ViewComponent>
                }
            </Container>
        </ViewComponent>
    )
})

export default ExchangeCryptoList;

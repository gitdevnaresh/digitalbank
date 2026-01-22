import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import FlatListComponent from "../../../../newComponents/flatList/flatList";
import { CoinImages, getThemedCommonStyles } from "../../../../components/CommonStyles";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import ExchangeServices from "../../../../apiServices/exchange";
import { isErrorDispaly } from "../../../../utils/helpers";

import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import ViewComponent from "../../../../newComponents/view/view";
import { SvgUri } from "react-native-svg";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import NoDataComponent from "../../../../newComponents/noData/noData";
import { s } from "../../../../newComponents/theme/scale";
import { CurrencyText } from "../../../../newComponents/textComponets/currencyText/currencyText";

interface ExchangeCryptoListDashboardProps {
    refreshTrigger?: boolean;
    initialData?: any;
    onError?: (error: string) => void;
    onLoadingChange?: (loading: boolean) => void;
}

const ExchangeCryptoListDashboard = ({ refreshTrigger, initialData, onError, onLoadingChange }: ExchangeCryptoListDashboardProps) => {
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [cryptoData, setCryptoData] = useState<any>({ cryptoList: initialData?.assets || [] })
    const [isLoading, setIsLoading] = useState(!initialData?.assets?.length)

    useEffect(() => {
        setCryptoData((prev: any) => ({ ...prev, cryptoList: initialData?.assets || [] }));
        const newLoading = !initialData?.assets?.length;
        setIsLoading(newLoading);
    }, [initialData])

    const handleCoinPress = useCallback((item: any) => {
        navigation.navigate('ExchangeCryptoDetails', {
            coinName: item?.name,
            coinCode: item?.code,
            coinIcon: CoinImages[item?.code?.toLowerCase()],
            balance: item?.amount || 0,
            balanceInUSD: item?.amountInUSD || 0
        });
    }, [navigation]);

    return (
        <View style={[{}]}>
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.CRYPTO"} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
            <FlatListComponent
                data={cryptoData?.cryptoList || []}
                scrollEnabled={false}
                ListEmptyComponent={isLoading ? null : <NoDataComponent />}
                ItemSeparatorComponent={() => <ViewComponent style={[commonStyles.transactionsListGap]} />}
                renderItem={({ item }) => (
                    <CommonTouchableOpacity onPress={() => handleCoinPress(item)} style={[commonStyles.cardsbannerbg]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                            <ViewComponent style={{ width: s(32), height: s(32) }}>
                                <SvgUri
                                    width={s(32)} height={s(32)}
                                    uri={CoinImages[item?.code?.toLowerCase()]}
                                />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                <ViewComponent>
                                    <ParagraphComponent text={item?.name} style={[commonStyles.primarytext]} />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.alignEnd]}>
                                    <CurrencyText value={item?.amount || 0} decimalPlaces={4} currency={item?.name} style={[commonStyles.primarytext]} />
                                </ViewComponent>
                            </ViewComponent>
                        </ViewComponent>
                    </CommonTouchableOpacity>
                )}
            />
        </View>
    );
};

export default ExchangeCryptoListDashboard;
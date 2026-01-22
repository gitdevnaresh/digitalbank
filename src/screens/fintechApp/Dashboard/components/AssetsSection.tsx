import React, { useCallback } from "react";
import ViewComponent from "../../../../newComponents/view/view";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import ImageUri from "../../../../newComponents/imageComponents/image";
import { CurrencyText } from "../../../../newComponents/textComponets/currencyText/currencyText";
import { CoinImages } from "../../../../components/CommonStyles";
import NoDataComponent from "../../../../newComponents/noData/noData";
import { s } from "../../../../constants/theme/scale";
import { oneCoinValue, tradeValue } from "../constant";
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { useNavigation } from "@react-navigation/native";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import { walletsTabsNavigation } from "../../../../../configuration";
import { setNavigationSource } from "../../../../redux/actions/actions";
import { useDispatch } from "react-redux";

interface CommonStyles {
    // Define specific style properties, e.g., sectionGap: object, dflex: object, etc.
    // Replace with actual style definitions
    [key: string]: any;
}

interface GraphConfiguration {
    ASSETS: {
        Crypto?: boolean;
        // Add other asset types if they exist
    };
    // Add other properties of GraphConfiguration
}

interface Asset {
    code: string;
    amount: number;
    name?: string; 
    image?:string// Add the name property, making it optional to be safe
    // Add other properties of an asset item
}

interface NewColor {
    // Define the structure of NEW_COLOR, e.g. TEXT_RED: string, TEXT_GREEN: string;
    [key: string]: string;
}

interface AssetsSectionProps {
    commonStyles: CommonStyles;
    GraphConfiguration: GraphConfiguration;
    assets?: Asset[]| [];
    handleNavigate: (item: Asset, selectedVault?: any) => void;
    NEW_COLOR: NewColor;
    setCoinsList?:any;
    vaultsLists?:any;
    vaultCoinsLists?:any;
    handleChangeSearch?:any;
    handleNaviagetePaymentModes?:any;
    showHeader?: boolean;
}

const AssetsSection: React.FC<AssetsSectionProps> = ({ commonStyles, GraphConfiguration,setCoinsList,vaultsLists,vaultCoinsLists,handleChangeSearch,handleNaviagetePaymentModes, assets, handleNavigate, NEW_COLOR, showHeader = true }) => {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const handleSeeAll = useCallback(() => {
        dispatch(setNavigationSource("Dashboard"));
        navigation.navigate({ name: walletsTabsNavigation });
    }, [navigation]);
    
    if (!GraphConfiguration.ASSETS.Crypto) {
        return null;
    }
 
    return (
        <ViewComponent style={[commonStyles.sectionGap]}>
            {showHeader && (
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.titleSectionGap]}>
                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.WALLETS"} style={commonStyles.sectionTitle} />
                    {(assets?.length || 0) > 0 && <CommonTouchableOpacity style={[commonStyles.dflex, commonStyles.alignCenter]} onPress={handleSeeAll}>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.SEE_ALL"} style={[commonStyles.sectionLink]} />
                    </CommonTouchableOpacity>}
                </ViewComponent>
            )}
 
      {(assets && assets.length > 0) ? (
                <ViewComponent>
                    {(assets || []).slice(0, 5).map((item: Asset, index: number) => (
                        <ViewComponent key={item?.code ?? index} style={[commonStyles.cardsbannerbg,commonStyles.transactionsListGap]}>
                            <CommonTouchableOpacity activeOpacity={0.5} onPress={() => handleNavigate(item, vaultsLists?.vaultsList?.[0])}>
                                <ViewComponent style={[commonStyles.dflex,  commonStyles.alignCenter,commonStyles.gap16]}>
                                    <ViewComponent style={{ width: s(36), height: s(36) }}><ImageUri uri={CoinImages[item?.code?.toLowerCase()]||item?.image} /></ViewComponent>
                                    <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                        <ViewComponent>
                                            <ParagraphComponent text={item?.name||item?.code} style={[commonStyles.primarytext]} />
                                            <ParagraphComponent text={`${item?.code ?? ''}`} style={[commonStyles.secondarytext]} />
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.alignEnd,]}>
                                            <CurrencyText value={item?.amount ?? 0} decimalPlaces={4} currency={item?.code} style={[commonStyles.primarytext]} />
                                            {/* <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                                <ParagraphComponent text={`${tradeValue[item?.code] ?? 0}%`} style={[Number(tradeValue[item?.code] ?? 0) < 0 ? commonStyles.textRed : commonStyles.textGreen, commonStyles.colorstatus]} />
                                            </ViewComponent> */}
                                        </ViewComponent>
                                    </ViewComponent>
                                </ViewComponent>
                                {index !== Math.min(assets.length, 5) - 1 && <ViewComponent/>}
                            </CommonTouchableOpacity>
                        </ViewComponent>
                    ))}
                </ViewComponent>
            ) : (
                <ViewComponent>
                    <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} />
                </ViewComponent>
            )}
        </ViewComponent>

    );
};

export default React.memo(AssetsSection);
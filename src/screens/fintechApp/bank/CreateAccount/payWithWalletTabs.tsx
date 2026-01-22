import React, { useCallback, useState, useEffect } from "react";
import { BackHandler } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { s } from '../../../../constants/theme/scale';
import PayWithCryptoWallet from "./payWithCryptoWallet";
import PayWithFiatCurrencies from "./payWithFiatWallet";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import SafeAreaViewComponent from "../../../../newComponents/safeArea/safeArea";
import ViewComponent from "../../../../newComponents/view/view";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ProfileService from '../../../../apiServices/profile';
import DashboardLoader from '../../../../components/loader';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import { isErrorDispaly } from '../../../../utils/helpers';
import CustomTabView, { SceneMap } from "../../../../newComponents/customTabView/customTabView";

const PayWithWalletTabs = (props: any) => {
    const initialIndex = 0;
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const routes = [
        { key: "first", title: "GLOBAL_CONSTANTS.FIAT" },
        { key: "second", title: "GLOBAL_CONSTANTS.CRYPTO" }
    ];
    const [state, setState] = useState<any>({
        index: initialIndex,
        routes,
    });
    const [hasTabSwitched, setHasTabSwitched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const _frist = () => {
        const bankFromParams = props?.route?.params?.selectedBank;
        const finalSelectedBank = selectedBank || bankFromParams;
        return (
            <PayWithFiatCurrencies {...props} isActiveTab={hasTabSwitched ? state.index === 0 : true} selectedBank={finalSelectedBank} />
        );
    };
    const _second = () => {
        const bankFromParams = props?.route?.params?.selectedBank;
        const finalSelectedBank = selectedBank || bankFromParams;
        return (
            <PayWithCryptoWallet {...props} isActiveTab={hasTabSwitched ? state.index === 1 : false} selectedBank={finalSelectedBank} />
        );
    };

    const selectedBank = useSelector((state: any) => state.userReducer?.selectedBank);
    const handleBackPress = async () => {
        setLoading(true);
        try {
            const bankFromParams = props?.route?.params?.selectedBank;
            const finalSelectedBank = selectedBank || bankFromParams;
            
            if (finalSelectedBank?.productId) {
                const detailsRes = await ProfileService.kycInfoDetails(finalSelectedBank.productId);
                
                if (detailsRes?.ok && detailsRes.data?.kyc?.provider?.toLowerCase() === "sumsub") {
                    setLoading(false);
                    // Navigate to CreateAccountForm instead of going back to BankKYCScreen
                    navigation.navigate('createAccountForm', {
                        animation: 'slide_from_left'
                    });
                    return;
                }
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
        
        setLoading(false);
        // Default back behavior
        if (props?.backArrowButtonHandler) {
            props.backArrowButtonHandler();
        } else {
            navigation.goBack();
        }
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBackPress(); return true; }
        );
        return () => backHandler.remove();
    }, []);

    const _handleIndexChange = (index: any) => {
        setHasTabSwitched(true);
        setState({ ...state, index });
    };
    const renderTabBar = useCallback((props: any) => {
        const active = props.navigationState.index;
        return (
               <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.tabBarContainer, { overflow: 'hidden' }]}>
                    {props.navigationState.routes.map((route: any, i: number) => {
                        const isActive = active === i;
                        const isFirstTab = i === 0;
                        const isLastTab = i === props.navigationState.routes.length - 1;

                        const tabStyleList: any[] = [
                            commonStyles.tabButton,
                            isActive ? commonStyles.activeTabButton : commonStyles.inactiveTabButton,
                        ];

                        if (isFirstTab) {
                            tabStyleList.push({
                                borderTopLeftRadius: s(30),
                                borderBottomLeftRadius: s(30),
                                ...(isLastTab && {
                                    borderTopRightRadius: s(30),
                                    borderBottomRightRadius: s(30),
                                }),
                            });
                        } else if (isLastTab) {
                            tabStyleList.push({
                                borderTopRightRadius: s(30),
                                borderBottomRightRadius: s(30),
                            });
                        }

                        return (
                            <CommonTouchableOpacity
                                key={route.key}
                                style={tabStyleList}
                                activeOpacity={0.8}
                                onPress={() => {
                                    if (state.index !== i) {
                                        setState({ ...state, index: i });
                                    }
                                }}
                            >
                                <ParagraphComponent
                                    style={[
                                        commonStyles.fs16,
                                        commonStyles.fw600,
                                        isActive ? commonStyles.textWhite : commonStyles.textGrey
                                    ]}
                                    text={t(route?.title) || ""}
                                />
                            </CommonTouchableOpacity>
                        );
                    })}
                </ViewComponent>
        );
    }, [commonStyles, state]);

    const renderScene = SceneMap({
        first: _frist,
        second: _second
    });
    const handleCloseError = () => {
        setErrormsg(null);
    };

    if (loading) {
        return <DashboardLoader />;
    }

    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
        <ViewComponent style={{ flex: 1, paddingHorizontal: s(24), paddingTop: s(24) }}>
            <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
                <PageHeader title={"GLOBAL_CONSTANTS.PAY_WITH_WALLET"} onBackPress={handleBackPress} />
                {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                 <CustomTabView
                    style={{ backgroundColor: NEW_COLOR.SCREENBG_BLACK }}
                    navigationState={state}
                    renderScene={renderScene}
                    renderTabBar={renderTabBar}
                    onIndexChange={_handleIndexChange}
                />
            </SafeAreaViewComponent>
        </ViewComponent>
        </ViewComponent>
    ); 
};

export default PayWithWalletTabs;




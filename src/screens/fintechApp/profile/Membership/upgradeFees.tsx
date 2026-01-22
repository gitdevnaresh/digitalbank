import React, { useEffect, useState } from 'react';
import { TouchableOpacity, LayoutAnimation, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Container from '../../../../newComponents/container/container';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import NoDataComponent from '../../../../newComponents/noData/noData';
import { CommissionInfo, gradients } from './feeinterfaces';
import { s } from '../../../../constants/theme/scale';
import Feather from "react-native-vector-icons/Feather";
import { isErrorDispaly } from '../../../../utils/helpers';
import CryptoServices from '../../../../apiServices/crypto'; 
import DashboardLoader from "../../../../components/loader"
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import SafeAreaViewComponent from '../../../../newComponents/safeArea/safeArea';
import ViewComponent from '../../../../newComponents/view/view';
import { useHardwareBackHandler } from '../../../../hooks/backHandleHook';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import { getTabsConfigation } from '../../../../../configuration';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { useSelector } from 'react-redux';
import ScrollViewComponent from '../../../../newComponents/scrollView/scrollView';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';

const UpgradeFees = () => {
    const navigation = useNavigation<any>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState<string>("");
    const [expanded, setExpanded] = useState<number | null>(null);
    const [actionsList, setActionsList] = useState<any[]>([]);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [moduleExpandLoader, setModuleExpandLoader] = useState(false);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [feesData, setFeesData] = useState<CommissionInfo>({
        membershipName: '',
        membershipPrice: 0,
        referralBonus: 0,
        id: "",
        customerId: "",
        customerIds: "",
        tierName: "",
        onBoardingFee: 0,
        monthlyFee: 0,
        dormantFee: 0,
        userCreated: "",
        createdDate: "",
        modifiedBy: "",
        modifiedDate: "",
        status: "",
        info: "",
        commissionModels: []
    });
    useEffect(() => {
        getFeesdata();
    }, []);
    const formatNameMapping: Record<string, string> = {
        bankaccountcreation: "Account Creation",
        bankdepositfiat: "Deposit Fiat",
        bankwithdrawfiat: "Withdraw Fiat",
        depositcrypto: "Deposit Crypto",
        withdrawcrypto: "Withdraw Crypto",
        depositfiat: "Deposit Fiat",
        withdrawfiat: "Withdraw Fiat",
        payincrypto: "Payin Crypto",
        payoutcrypto: "Payout Crypto",
        payinfiat: "Payin Fiat",
        payoutfiat: "Payout Fiat",

    };

    // const tabs = getTabsConfigation("TABS")?.filter((tab: any) => tab?.isDisplay);
     const menuItemsFromStore = useSelector((state: any) => state.userReducer?.menuItems);
  const tabs = menuItemsFromStore?.filter((tab: any) => tab?.isEnabled);
    const showCardsSection = tabs?.some((tab: any) => tab?.featureName?.toLowerCase() === 'cards');
    const showBankSection = tabs?.some((tab: any) => tab?.featureName?.toLowerCase() === 'banks');
    const showPaymentsSection = tabs?.some((tab: any) => tab?.featureName?.toLowerCase() === 'payments');
    const showExchnagesSection = tabs?.some((tab: any) => tab?.featureName?.toLowerCase() === 'exchange');
    const showWalletsSection = tabs?.some((tab: any) => tab?.featureName?.toLowerCase() === 'wallets');
    const allChargerMenu = [
        { name: "Wallets Charges", module: "wallets", show: showWalletsSection },
        { name: "Bank Charges", module: "banks", show: showBankSection },
        { name: "Cards Charges", module: "cards", show: showCardsSection },
        { name: "Payments Charges", module: "payments", show: showPaymentsSection },
         { name: "Exchange Charges", module: "exchange",show:showExchnagesSection },

    ];
    const [chargerMenu] = useState(allChargerMenu.filter(item => item.show));
    const getFeesdata = async () => {
        setErrormsg("");
        setIsLoading(true);
        try {
            const response: any = await CryptoServices.getFeesData();
            if (response?.ok) {
                setFeesData(response?.data);
                setIsLoading(false);
            } else {
                setErrormsg(isErrorDispaly(response));
                setIsLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setIsLoading(false);
        }
    }
    const handleRefresh = () => {
        getFeesdata()
        setExpanded(null);
        setActionsList([]);
    };
    const onRefresh = async () => {
        setRefresh(true);
        try {
            await getFeesdata();
            setExpanded(null);
            setActionsList([]);
        } finally {
            setRefresh(false);
        }
    };
    const fetchChargesData = async (module: string) => {
        setErrormsg("");
        setModuleExpandLoader(true);
        try {
            const response: any = await CryptoServices.getUpgradeFeeChargesData(feesData?.id, module);
            if (response.ok) {
                setActionsList(response?.data);
                setModuleExpandLoader(false);
            } else {
                setErrormsg(isErrorDispaly(response));
                setModuleExpandLoader(false);

            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setModuleExpandLoader(false);
        } finally {
            setIsLoading(false);
            setModuleExpandLoader(false);
        }
    };
 
    const toggleItem = (item: any, index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expanded === index) {
            setExpanded(null);
        } else {
            setExpanded(index);
            fetchChargesData(item.module);
        }
    };
    useHardwareBackHandler(() => {
        navigation.navigate('NewProfile', { animation: 'slide_from_left' });
    });
    const backArrowButtonHandler = () => {
        navigation.navigate("NewProfile", { animation: 'slide_from_left' });
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {isLoading && (<SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>)}
            {(!isLoading && chargerMenu?.length > 0) && (<Container style={[commonStyles.container]}>
                <PageHeader
                    title={"GLOBAL_CONSTANTS.FEES"}
                    onBackPress={backArrowButtonHandler}
                    isrefresh={true}
                    onRefresh={handleRefresh}
                />
                <ScrollViewComponent showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}>
                    {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />}
 
                    <ViewComponent style={[commonStyles.rounded5]}>
                        {chargerMenu?.map((item, index) => (
                            <ViewComponent
                                key={index}
                                style={[
                                    commonStyles.screenBg,
                                    expanded === index ? commonStyles.sectionBorder : commonStyles.borderTransparent,
                                    commonStyles.transactionsListGap
                                ]}
                            >
                                <TouchableOpacity onPress={() => toggleItem(item, index)} activeOpacity={0.8}>
                                    <LinearGradient
                                        colors={gradients[index % gradients.length]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[
                                            commonStyles.p10,
                                            {
                                                borderTopLeftRadius: s(4),
                                                borderTopRightRadius: s(4),
                                                borderBottomLeftRadius: expanded === index ? 0 : s(4),
                                                borderBottomRightRadius: expanded === index ? 0 : s(4)
                                            }
                                        ]}
                                    >
                                        <ViewComponent
                                            style={[
                                                commonStyles.dflex,
                                                commonStyles.alignCenter,
                                                commonStyles.justifyContent,
 
                                            ]}
                                        >
                                            <ParagraphComponent
                                                style={[
                                                    commonStyles.sectionSubTitleText
                                                ]}
                                                text={`${item.name}`}
                                            />
                                            <Feather
                                                name="chevron-down"
                                                size={s(20)}
                                                color={NEW_COLOR.TEXT_WHITE}
                                                style={{
                                                    transform: [
                                                        { rotate: expanded === index ? "180deg" : "0deg" }
                                                    ]
                                                }}
                                            />
                                        </ViewComponent>
                                    </LinearGradient>
                                </TouchableOpacity>
                                {expanded === index && (
                                    <ViewComponent style={[{ paddingTop: 0 }]}>
 
                                        {moduleExpandLoader && (
                                            <ViewComponent
                                                style={[
 
                                                    commonStyles.alignCenter,
                                                    commonStyles.justifyCenter,
                                                    commonStyles.p20
                                                ]}
                                            >
                                                <ActivityIndicator size="small" color="#007AFF" />
                                            </ViewComponent>)}
                                        {!moduleExpandLoader && actionsList.length > 0 && (
                                            <ViewComponent>
 
                                                {actionsList.map((actionItem: any, actionIndex: number) => (
                                                    <ViewComponent key={actionIndex} style={[commonStyles.p8, commonStyles.borderBottom]}>
                                                        {item.module === "cards" ? (
                                                            <ViewComponent>
                                                                {actionItem?.actionDetails?.map((detail: any, detailIndex: number) => (
                                                                    <ViewComponent key={detailIndex} style={[commonStyles.mb12]}>
 
                                                                        {/* Card name */}
                                                                        <ParagraphComponent
                                                                            text={detail.name}
                                                                            style={[commonStyles.sectionSubTitleText, commonStyles.titleSectionGap]}
                                                                        />
 
                                                                        {/* Issuing Fee (remove currency) */}
                                                                        {detail?.issuingFee && (
                                                                            <ViewComponent style={[commonStyles.dflex, commonStyles.listGap,
                                                                            detail?.issuingFee.toString().length > 30
                                                                                ? { flexDirection: 'column', alignItems: 'flex-start', marginBottom: s(10) } // stack
                                                                                : { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } // side by side
                                                                            ]}>
                                                                                <ParagraphComponent
                                                                                    text="Issuing Fee:"
                                                                                    style={[commonStyles.listsecondarytext]}
                                                                                />
                                                                                <ParagraphComponent
                                                                                    text={` ${detail.issuingFee.replace(/EUR|USD/gi, "").trim()}`}
                                                                                    style={[commonStyles.listprimarytext, commonStyles.textRight, commonStyles.flex1]}
                                                                                />
                                                                            </ViewComponent>
                                                                        )}
 
                                                                        {/* Top up fee (keep full string) */}
                                                                        {detail?.fee && (
                                                                            <ViewComponent
                                                                                style={[
                                                                                    commonStyles.dflex,
                                                                                    commonStyles.listGap,
                                                                                    detail.fee.toString().length > 30
                                                                                        ? { flexDirection: 'column', alignItems: 'flex-start', marginBottom: s(10) } // stack
                                                                                        : { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } // side by side
                                                                                ]}
                                                                            >
                                                                                <ParagraphComponent
                                                                                    text="Top Up Fee:"
                                                                                    style={[commonStyles.listsecondarytext]}
                                                                                />
                                                                                <ParagraphComponent
                                                                                    text={` ${detail.fee}`}
                                                                                    style={[
                                                                                        commonStyles.listprimarytext,
                                                                                        commonStyles.textRight, commonStyles.flex1,
 
                                                                                        detail.fee.toString().length > 50
                                                                                            ? { marginTop: s(4) } // stack
                                                                                            : { marginTop: s(0) } // side by side
                                                                                    ]}
                                                                                    numberOfLines={0}
                                                                                />
                                                                            </ViewComponent>
                                                                        )}
 
 
                                                                        {/* Maintenance Fee (remove currency) */}
                                                                        {detail?.maintenanceFee && (
 
                                                                            <ViewComponent style={[commonStyles.dflex, commonStyles.listGap,
                                                                            detail?.maintenanceFee.toString().length > 30
                                                                                ? { flexDirection: 'column', alignItems: 'flex-start', marginBottom: s(10) } // stack
                                                                                : { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } // side by side
                                                                            ]}>
                                                                                <ParagraphComponent
                                                                                    text="Maintenance Fee:"
                                                                                    style={[commonStyles.listsecondarytext]}
                                                                                />
                                                                                <ParagraphComponent
                                                                                    text={` ${detail.maintenanceFee.replace(/EUR|USD/gi, "").trim()}`}
                                                                                    style={[commonStyles.listprimarytext, commonStyles.textRight, commonStyles.flex1]}
                                                                                />
                                                                            </ViewComponent>
                                                                        )}
 
                                                                        {/* Cancellation Fee (remove currency) */}
                                                                        {detail?.cardCancellationFee && (
 
 
                                                                            <ViewComponent style={[commonStyles.dflex, commonStyles.listGap,
                                                                            detail?.cardCancellationFee.toString().length > 30
                                                                                ? { flexDirection: 'column', alignItems: 'flex-start', marginBottom: s(10) } // stack
                                                                                : { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } // side by side
                                                                            ]}>
                                                                                <ParagraphComponent
                                                                                    text="Cancellation Fee:"
                                                                                    style={[commonStyles.listsecondarytext]}
                                                                                />
                                                                                <ParagraphComponent
                                                                                    text={` ${detail.cardCancellationFee.replace(/EUR|USD/gi, "").trim()}`}
                                                                                    style={[commonStyles.listprimarytext, commonStyles.textRight, commonStyles.flex1]}
                                                                                />
                                                                            </ViewComponent>
                                                                        )}
                                                                         {/* <ViewComponent style={[commonStyles.dflex,commonStyles.listGap,commonStyles.gap8,commonStyles.flexWrap,commonStyles.justifyContent]}>
                                                                                <TextMultiLanguage
                                                                                    text={"GLOBAL_CONSTANTS.REFERRAL"}
                                                                                    style={[commonStyles.listprimarytext, commonStyles.flex1]}
                                                                                />
                                                                                <ParagraphComponent
                                                                                    text={(detail?.refMinFee && detail?.refMaxFee) ? `${detail?.refMinFee} or ${detail?.refMaxFee}% ${detail?.name} whichever is higher and Refferal Type is ${detail?.refType}` : "No Referral Fee"}
                                                                                    style={[commonStyles.listsecondarytext]}
                                                                                />
                                                                            </ViewComponent>
                                                                              <ViewComponent style={[commonStyles.dflex, commonStyles.listGap, commonStyles.gap8, commonStyles.flexWrap, commonStyles.justifyContent]}>
                                                                            <TextMultiLanguage
                                                                                text={"GLOBAL_CONSTANTS.REFERRAL_LEVELS"}
                                                                                style={[commonStyles.listprimarytext]}
                                                                            />
                                                                            <ViewComponent >
                                                                                {detail?.levels
                                                                                    ? detail.levels.split(',').filter((lvl: string) => lvl.trim() !== '').map((lvl: string, idx: number) => (
                                                                                        <ParagraphComponent
                                                                                            key={idx}
                                                                                            text={`Level ${idx + 1} will receive ${lvl}%`}
                                                                                            style={[commonStyles.listsecondarytext]}
                                                                                        />
                                                                                    ))
                                                                                    : <TextMultiLanguage text={"GLOBAL_CONSTANTS.NO_REFERRAL_LEVELS"} style={[commonStyles.listsecondarytext, commonStyles.textRight]} />
                                                                                }
                                                                            </ViewComponent>
                                                                        </ViewComponent> */}
                                                                    </ViewComponent>
                                                                ))}
                                                            </ViewComponent>
                                                        ) : (
                                                            // Default handling for other modules
                                                            <ViewComponent>
 
 
                                                                <ParagraphComponent
                                                                    text={formatNameMapping[actionItem.action?.toLowerCase()] || actionItem.action}
                                                                    style={[commonStyles.fs16, commonStyles.textWhite, commonStyles.fw600]}
                                                                />
 
 
                                                                {actionItem?.actionDetails?.map((detail: any, detailIndex: number) => (
                                                                         <ViewComponent>
                                                                    <ViewComponent key={detailIndex} style={[commonStyles.dflex,commonStyles.listGap,                                                                      
                                                                              actionItem?.actionDetails.toString().length > 80
                                                                                ? { flexDirection: 'column', alignItems: 'flex-start', marginBottom: s(10) } // stack
                                                                                : { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } // side by side
                                                                                ]}>
                                                                        <ParagraphComponent
                                                                            text={
                                                                                `${detail.name}${item.module !== "banks" && detail.network
                                                                                    ? ` (${detail.network})`
                                                                                    : ""
                                                                                }`
                                                                            }
                                                                            style={[commonStyles.listprimarytext, commonStyles.flex1]}
                                                                        />
                                                                        <ParagraphComponent
                                                                            text={detail.fee}
                                                                            style={[commonStyles.listsecondarytext, commonStyles.flex1, commonStyles.textRight]}
                                                                        />
                                                                        </ViewComponent>
                                                                         {/* <ViewComponent>
                                                                            <ViewComponent style={[commonStyles.dflex,commonStyles.listGap,commonStyles.gap8,commonStyles.flexWrap,commonStyles.justifyContent]}>
                                                                                <TextMultiLanguage
                                                                                    text={"GLOBAL_CONSTANTS.REFERRAL"}
                                                                                    style={[commonStyles.listprimarytext]}
                                                                                />
                                                                                <ParagraphComponent
                                                                                    text={(detail?.refMinFee && detail?.refMaxFee) ? `${detail?.refMinFee} or ${detail?.refMaxFee}% ${detail?.name} whichever is higher and Refferal Type is ${detail?.refType}` : "No Referrals Fee"}
                                                                                    style={[commonStyles.listsecondarytext]}
                                                                                />
                                                                            </ViewComponent>
                                                                    </ViewComponent>
                                                                        <ViewComponent style={[commonStyles.dflex, commonStyles.listGap, commonStyles.gap8, commonStyles.flexWrap, commonStyles.justifyContent]}>
                                                                            <TextMultiLanguage
                                                                                text={"GLOBAL_CONSTANTS.REFERRAL_LEVELS"}
                                                                                style={[commonStyles.listprimarytext]}
                                                                            />
                                                                            <ViewComponent >
                                                                                {detail?.levels
                                                                                    ? detail.levels.split(',').filter((lvl: string) => lvl.trim() !== '').map((lvl: string, idx: number) => (
                                                                                        <ParagraphComponent
                                                                                            key={idx}
                                                                                            text={`Level ${idx + 1} will receive ${lvl}%`}
                                                                                            style={[commonStyles.listsecondarytext]}
                                                                                        />
                                                                                    ))
                                                                                    : <TextMultiLanguage text={"GLOBAL_CONSTANTS.NO_REFERRAL_LEVELS"} style={[commonStyles.listsecondarytext, commonStyles.textRight]} />
                                                                                }
                                                                            </ViewComponent>
                                                                        </ViewComponent> */}
                                                                        </ViewComponent>
                                                                ))}
                                                            </ViewComponent>
                                                        )}
                                                    </ViewComponent>
                                                ))}
 
                                            </ViewComponent>
                                        )}
                                        {!moduleExpandLoader && actionsList.length === 0 && <NoDataComponent />}
                                    </ViewComponent>
                                )}
                            </ViewComponent>
                        ))}
                    </ViewComponent>
 
                </ScrollViewComponent>
            </Container>)}
        </ViewComponent>
    );
};
export default UpgradeFees;
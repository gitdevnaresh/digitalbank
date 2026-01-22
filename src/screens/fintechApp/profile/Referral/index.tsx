import React, { useEffect, useRef, useState } from "react";
import { Alert, Platform, SafeAreaView, Share, RefreshControl } from "react-native";
import { useSelector } from "react-redux";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import Container from "../../../../newComponents/container/container";
import { s } from "../../../../constants/theme/scale";
import CopyCard from "../../../../newComponents/copyIcon/CopyCard";
import { isErrorDispaly } from "../../../../utils/helpers";
import { REFERRAL_CONST } from "./membersConstants";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import KpiComponent from "../../../../newComponents/kpiComponent/kpiComponent";
import ProfileService from '../../../../apiServices/profile';
import ViewComponent from "../../../../newComponents/view/view";
import TextMultiLangauge from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import FlatListComponent from "../../../../newComponents/flatList/flatList";
import { getTabsConfigation } from "../../../../../configuration";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import { NavigationProp, ParamListBase, useIsFocused } from "@react-navigation/native";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import RecentMemberList from "./recentMemberList";
import Clipboard from "@react-native-clipboard/clipboard";
import CustomRBSheet from "../../../../newComponents/models/commonDrawer";
import ButtonComponent from "../../../../newComponents/buttons/button";
import GenealogyTree from "./genologyTree/GenealogyTree";
import ImageUri from "../../../../newComponents/imageComponents/image";
import { Feather } from "@expo/vector-icons";
import { useHardwareBackHandler } from "../../../../hooks/backHandleHook";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import { getAllEnvData } from "../../../../../Environment";
import { ReferralsBannerImage } from "../../../../assets/svg";

interface MembersDashBoardProps {
    navigation: NavigationProp<ParamListBase>;
}
interface KpiItem {
    name: string;
    value: string | number;
    isCount?: boolean;
}
interface UserInfo {
    id: string;
    depositReference?: string;
}

const SECTION_TYPES = {
    KPI: 'KPI',
    ADVERTISEMENT: 'ADVERTISEMENT',
    TABS: 'TABS',
    MEMBERS_HEADER: 'MEMBERS_HEADER',
    GENEALOGY: 'GENEALOGY',
};

const MembersDashBoard: React.FC<MembersDashBoardProps> = (props) => {
    const [kpiData, setKpiData] = useState<KpiItem[]>([]);
    const [kpiDataLoading, setKpiDataLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [refresh, setRefresh] = useState<boolean>(false);
    const userInfo = useSelector((state: { userReducer: { userDetails: UserInfo } }) => state.userReducer?.userDetails);
    const configuration = getTabsConfigation('REFERRALS');
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [referralCode, setReferralCode] = useState<KpiItem[]>([]);
    const [listSections, setListSections] = useState<Array<{ id: string, type: string }>>([]);
    const [activeTab, setActiveTab] = useState('Affiliates');
    const isInviteNowModalVisableRef = useRef<any>()
    const { oAuthConfig } = getAllEnvData();
    const truncatedBaseUrl = oAuthConfig?.sumsubWebUrl
    const baseUrl = oAuthConfig?.sumsubWebUrl
    const playStoreUrl = oAuthConfig?.playStoreUrl
    const appStore = oAuthConfig?.appStoreUrl

    const isFocused = useIsFocused();
    useEffect(() => {
        getReferralKpis();
    }, [isFocused]);

    useEffect(() => {
        const sectionsArray = [];
        sectionsArray.push({ id: SECTION_TYPES.KPI, type: SECTION_TYPES.KPI });

        if (configuration.ADVERTISEMENT) {
            sectionsArray.push({ id: SECTION_TYPES.ADVERTISEMENT, type: SECTION_TYPES.ADVERTISEMENT });
        }
        sectionsArray.push({ id: SECTION_TYPES.TABS, type: SECTION_TYPES.TABS });

        if (activeTab === 'Affiliates') {
            sectionsArray.push({ id: SECTION_TYPES.MEMBERS_HEADER, type: SECTION_TYPES.MEMBERS_HEADER });
        } else if (activeTab === 'Network') {
            sectionsArray.push({ id: SECTION_TYPES.GENEALOGY, type: SECTION_TYPES.GENEALOGY });
        }
        setListSections(sectionsArray);
    }, [configuration.ADVERTISEMENT, activeTab]);

    const handleReload = () => {
        getReferralKpis();
    }
    
    const onRefresh = async () => {
        setRefresh(true);
        try {
            await getReferralKpis();
        } finally {
            setRefresh(false);
        }
    };
    const copyToClipboard = async (text: any) => {
        try {
            Clipboard.setString(text);
        } catch (error: any) {
            Alert.alert(REFERRAL_CONST.FAILED_TO_COPY, error);
        }

    };
    const onShare = async () => {
        try {
            const code = referralCode[0]?.value;
            const referralUrl = `${baseUrl}/app?referralCode=${code}`;

            await Share.share({
                message: `${t("GLOBAL_CONSTANTS.HELLO_I_WOULD_LIKE_TO_INVITE")}${referralCode[0]?.value}.\n${t("GLOBAL_CONSTANTS.IAM_USING_ARTHAPAYMENTS")}${referralUrl}\n${t("GLOBAL_CONSTANTS.DOWNLOAD_APP_LINK")}\n${Platform.OS == 'android' ? playStoreUrl : appStore}`
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };
    const getReferralKpis = async () => {
        setErrorMsg('')
        setKpiDataLoading(true);
        try {
            const response = await ProfileService.getReferralKPis();
            if (response.ok) {
                let filteredKpiData: KpiItem[];
                let ReferalCode: KpiItem[];
                const responseData = response.data as KpiItem[];
                filteredKpiData = responseData.filter((item: KpiItem) => item.name !== "Referral Code");
                ReferalCode = responseData.filter((item: KpiItem) => item.name == "Referral Code");
                setKpiData(filteredKpiData);
                setReferralCode(ReferalCode);
                setKpiDataLoading(false);
            }
            else {
                setKpiDataLoading(false);
                setErrorMsg(isErrorDispaly(response))
            }
        }
        catch (error) {
            setKpiDataLoading(false);
            setErrorMsg(isErrorDispaly(error))
        }
    };
    useHardwareBackHandler(() => {
        backArrowButtonHandler();
    })
    const backArrowButtonHandler = () => {
        props.navigation.goBack();
    }
    const handleAllmembersList = () => {
        props.navigation.navigate("MembersList");
    };
    const closeInviteSheet = () => {
        isInviteNowModalVisableRef.current?.close();
    }
    const renderSectionItem = ({ item }: { item: { id: string, type: string } }) => {
        switch (item.type) {
            case SECTION_TYPES.KPI:
                return (
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap10, commonStyles.sectionGap]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <KpiComponent
                                data={kpiData ?? []}
                            />
                        </ViewComponent>
                    </ViewComponent>
                );

            case SECTION_TYPES.ADVERTISEMENT:
                return (
                    <ViewComponent style={[commonStyles.bgnote, commonStyles.dflex, commonStyles.gap10, commonStyles.sectionGap]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ParagraphComponent text={"GLOBAL_CONSTANTS.INVITE_FRIENDS_AND_GET_CRYPTO"} style={[commonStyles.RefeeralsectionTitle]} />
                            <ViewComponent >
                                <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter, commonStyles.mt16]}>
                                    <ViewComponent style={[commonStyles.bgBlack]}>
                                        <ParagraphComponent text={referralCode[0]?.value} style={[commonStyles.referralcodetext]} />
                                    </ViewComponent>
                                    <ViewComponent  style={[{ backgroundColor: NEW_COLOR.BG_BLACK },commonStyles.rounded6,commonStyles.py10,]}>
                                        <CopyCard onPress={() => copyToClipboard(referralCode[0]?.value)} copyIconColor={NEW_COLOR.TEXT_PRIMARY} />
                                    </ViewComponent>
                                    <ViewComponent>
                                        <CommonTouchableOpacity onPress={onShare} style={[commonStyles.bgBlack]}>
                                            <Feather name="share-2" size={s(18)} color={NEW_COLOR.TEXT_PRIMARY} />
                                        </CommonTouchableOpacity>
                                    </ViewComponent>
                                </ViewComponent>
                            </ViewComponent>
                        </ViewComponent>
                        <ViewComponent>
                            <ReferralsBannerImage
                                width={s(140)}
                                height={s(100)}
                            />
                        </ViewComponent>
                    </ViewComponent>



                );

            case SECTION_TYPES.MEMBERS_HEADER:
                return (
                    <ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.listGap]}>
                            <TextMultiLangauge text={"GLOBAL_CONSTANTS.MEMBERS"} style={[commonStyles.sectionTitle]} />
                            <CommonTouchableOpacity onPress={handleAllmembersList} style={[commonStyles.dflex, commonStyles.alignCenter,]} >
                                <ParagraphComponent text={"GLOBAL_CONSTANTS.SEE_ALL"} style={[commonStyles.sectionLink, commonStyles.fw500]} />
                            </CommonTouchableOpacity>
                        </ViewComponent>
                        <RecentMemberList />
                        <ViewComponent style={[commonStyles.sectionGap]} />
                        <ViewComponent style={[commonStyles.sectionGap]} />
                    </ViewComponent>
                );
            case SECTION_TYPES.GENEALOGY:
                return (
                    <ViewComponent style={[commonStyles.sectionGap]}>
                        <GenealogyTree />
                        <ViewComponent style={[commonStyles.sectionGap]} />
                        <ViewComponent style={[commonStyles.sectionGap]} />
                    </ViewComponent>
                );
            default:
                return null;
        }
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {kpiDataLoading && (
                <SafeAreaView style={[commonStyles.flex1]}>
                    <DashboardLoader /></SafeAreaView>)}
            {!kpiDataLoading && (
                <Container style={[commonStyles.flex1, commonStyles.container, { paddingBottom: 0 }]}>
                    <PageHeader title={"GLOBAL_CONSTANTS.REFERRALS"} onBackPress={backArrowButtonHandler} isrefresh={true} onRefresh={handleReload} />

                    <FlatListComponent
                        data={listSections}
                        renderItem={renderSectionItem}
                        keyExtractor={item => item.id}
                        ListHeaderComponent={errorMsg ? <ErrorComponent message={errorMsg} onClose={() => setErrorMsg("")} /> : null}
                        contentContainerStyle={{ paddingBottom: s(16) }}
                        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}
                    />
                    <CustomRBSheet
                        refRBSheet={isInviteNowModalVisableRef} // Use the ref here
                        height={s(235)}
                        closeOnPressMask={true}
                        onClose={() => { }}
                        customStyles={{ container: { borderTopLeftRadius: s(30), borderTopRightRadius: s(30), backgroundColor: NEW_COLOR.BACKGROUND_MODAL } }}
                    >
                        <ViewComponent>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mb16]}>
                                <TextMultiLangauge
                                    text={"GLOBAL_CONSTANTS.REFERRAL_CODE"}
                                    style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw500, commonStyles.flex1]}
                                />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                    <ParagraphComponent
                                        text={referralCode[0]?.value ?? userInfo?.depositReference ?? 'N/A'}
                                        style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.fw500]}
                                        numberOfLines={1}
                                    />
                                    <CopyCard onPress={() => copyToClipboard(referralCode[0]?.value ?? userInfo?.depositReference)} copyIconColor={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mb16]}>
                                <TextMultiLangauge
                                    text={"Referral Link"}
                                    style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw500, commonStyles.flex1]}
                                />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                    <ParagraphComponent
                                        text={truncatedBaseUrl}
                                        style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.fw500]}
                                        numberOfLines={1}
                                    />
                                    <CopyCard onPress={() => copyToClipboard(baseUrl)} copyIconColor={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                            </ViewComponent>

                            <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.mt24, commonStyles.sectionGap]}>
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.CLOSE"}
                                        onPress={closeInviteSheet}
                                        solidBackground={true}
                                    />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.SHARE"}
                                        onPress={onShare}
                                    />
                                </ViewComponent>
                            </ViewComponent>
                        </ViewComponent>
                    </CustomRBSheet>

                </Container>)}
        </ViewComponent>
    );
};

export default MembersDashBoard;

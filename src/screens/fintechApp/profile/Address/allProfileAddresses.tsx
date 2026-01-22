import { TouchableOpacity, View, ScrollView, SafeAreaView, RefreshControl } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ms, s } from "../../../../constants/theme/scale";
import { useIsFocused } from "@react-navigation/core";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import CardsModuleService from "../../../../apiServices/card";
import { isErrorDispaly } from "../../../../utils/helpers";
import Container from "../../../../newComponents/container/container";
import TextMultiLangauge from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import Entypo from '@expo/vector-icons/Entypo';
import ButtonComponent from "../../../../newComponents/buttons/button";
import { ProfileAddressImage } from "../../../../assets/svg";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import ViewComponent from "../../../../newComponents/view/view";
import { useHardwareBackHandler } from "../../../../hooks/backHandleHook";
import CustomeditLink from "../../../../components/svgIcons/mainmenuicons/linkedit";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import { MaterialIcons } from "@expo/vector-icons";
import AddIcon from "../../../../newComponents/addCommonIcon/addCommonIcon";
interface Address {
    id: string | number;
    isDefault: boolean;
    favoriteName: string;
    phoneCode?: string | number;
    phoneNumber: string | number;
    addressLine1: string;
    addressLine2?: string;
    town?: string;
    city: string;
    state: string;
    country: string;
}

interface SuccessApiResponse<T> {
    ok: true;
    data: { data: T };
    [key: string]: any;
}

interface ErrorApiResponse {
    ok: false;
    data?: unknown;
    [key: string]: any;
}

type ApiResponse<T> = SuccessApiResponse<T> | ErrorApiResponse;
const AllPersonalInfo = (props: any) => {
    const [personalInfoLoading, setPersonalInfoLoading] = useState(false);
    const [personalInfoAddress, setPersonalInfoAddress] = useState<Address[]>([]);
    const [errormsg, setErrormsg] = useState<string>('');
    const [refresh, setRefresh] = useState<boolean>(false);
    const isFocus = useIsFocused()
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    useEffect(() => {
        getPersonlCustomerDetailsInfo();
    }, [props?.route?.params?.cardId, isFocus]);
    useHardwareBackHandler(() => {
        handleGoBack();
    })
    const getPersonlCustomerDetailsInfo = async () => {
        const pageSize = 10;
        const pageNo = 1;
        try {
            setPersonalInfoLoading(true);
            const response = (await CardsModuleService?.cardsAddressGet(pageNo, pageSize)) as ApiResponse<Address[]>;
            if (response?.ok) {
                setPersonalInfoAddress(response?.data?.data || []);
                setErrormsg('');
                setPersonalInfoLoading(false);
            } else {
                setErrormsg(isErrorDispaly(response));
                setPersonalInfoLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setPersonalInfoLoading(false);
        }
    };
    const handleRedirectToAddPersolForm = (val?: Address) => {
        props.navigation.push("addProfileAddress", {
            ...props.route.params,
            value: val,
            cardId: props?.route?.params?.cardId,
            logo: props?.route?.params?.logo,
            addressDetails: val,
            screenName: "ProfileAddresses",

        });
    };
    const handleGoBack = () => {
        if (props?.route?.params?.cardId) {
            props.navigation.push("ApplyExchangaCard", {
                cardId: props?.route?.params?.cardId,
                logo: props?.route?.params?.logo
            })
        } else if (props?.route?.params?.returnScreen) {
            props.navigation.push(props?.route?.params?.returnScreen, props?.route?.params?.returnParams)
        } else {
            props.navigation.goBack()
        }
    };
    const handleError = useCallback(() => {
        setErrormsg('');
    }, []);

    const onRefresh = async () => {
        setRefresh(true);
        try {
            await getPersonlCustomerDetailsInfo();
        } finally {
            setRefresh(false);
        }
    };
    const handleView = (item: Address) => {
        props.navigation.navigate("AddressViewDetails", { addressDetails: item })
    }
    const addIcon = (
        <ViewComponent style={[commonStyles.actioniconbg]} >
            <AddIcon onPress={() => handleRedirectToAddPersolForm()} />
        </ViewComponent>
    )


    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            {personalInfoLoading && (<DashboardLoader />)}
            {!personalInfoLoading && (
                <Container style={[commonStyles.container]}>
                    <PageHeader title={"GLOBAL_CONSTANTS.ADDRESSES"} onBackPress={handleGoBack} rightActions={addIcon} />

                    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}>
                        {errormsg !== "" && <ErrorComponent message={errormsg} onClose={handleError} />}
                        <View>
                            <View>
                                {personalInfoAddress?.map((item: Address, index: number) => (
                                    <TouchableOpacity key={item?.id} style={[commonStyles.relative]} onPress={() => handleView(item)}>
                                        {item.isDefault && <View style={[commonStyles.rounded5, { backgroundColor: item.isDefault ? NEW_COLOR.BANNER_BG : NEW_COLOR.TRANSPARENT }]}>
                                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.p8]}>
                                                <Entypo name="location-pin" size={s(18)} color={NEW_COLOR.TEXT_link} />
                                                <TextMultiLangauge style={[commonStyles.fs14, commonStyles.textlinkgrey, commonStyles.fw500]} text={"GLOBAL_CONSTANTS.DEFAULT"} />
                                            </View>
                                            <View style={[commonStyles.hLine]} />
                                        </View>}
                                        <View style={[commonStyles.dflex, commonStyles.rounded5, commonStyles.gap16, commonStyles.alignStart, { backgroundColor: item.isDefault ? NEW_COLOR.BANNER_BG : NEW_COLOR.TRANSPARENT, padding: item.isDefault ? ms(10) : 0, }]}>
                                            <View style={[commonStyles.roundediconbg, item.isDefault ? { backgroundColor: item.isDefault ? NEW_COLOR.INPUTROUNDED_ICON : NEW_COLOR.TRANSPARENT } : null]}>
                                                <ParagraphComponent style={[commonStyles.twolettertext]} text={item.favoriteName?.slice(0, 1)?.toUpperCase()} />
                                            </View>
                                            <View style={[commonStyles.flex1]}>
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                                                    <View style={[commonStyles.dflex, commonStyles.gap8, commonStyles.mb2]}>
                                                        <ParagraphComponent style={[commonStyles.twolettertext, commonStyles.textCenter,]} text={`${item.favoriteName?.length > 20
                                                            ? `${item.favoriteName.slice(0, 4)}...${item.favoriteName.slice(-8)}`
                                                            : item.favoriteName ?? '--'

                                                            }`}
                                                        />
                                                        <TouchableOpacity activeOpacity={0.6} onPress={() => handleRedirectToAddPersolForm(item)} >
                                                            <CustomeditLink height={s(18)} width={s(18)} style={[commonStyles.mt6]} />
                                                        </TouchableOpacity>
                                                    </View>


                                                </ViewComponent>
                                                {item?.addressType && <ParagraphComponent text={item?.addressType} style={[commonStyles.twolettertext]} />}
                                                <View>
                                                    <ParagraphComponent text={
                                                        [
                                                            item.addressLine1,
                                                            item.addressLine2,
                                                            item.town,
                                                            item.city,
                                                            item.state,
                                                            item.country.length > 10 ? `${item.country.slice(0, 8)}...${item.country.slice(-8)}` : item.country
                                                        ].filter(Boolean).join(', ') || '--'
                                                    } style={[commonStyles.addressespara]} />
                                                </View>
                                            </View>

                                        </View>
                                        {index !== personalInfoAddress.length - 1 && <View style={[commonStyles.listitemGap]} />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {!personalInfoLoading && (!personalInfoAddress || personalInfoAddress?.length === 0) && (<View style={[commonStyles.justifyCenter, commonStyles.mt5, commonStyles.mb28]}>
                            <ProfileAddressImage height={s(200)} width={s(200)} style={[commonStyles.mxAuto, commonStyles.sectionGap, commonStyles.mt20]} />
                            <View>
                                <ButtonComponent multiLanguageAllows={true} title={"GLOBAL_CONSTANTS.ADD_ADDRESS"} onPress={() => handleRedirectToAddPersolForm()} />
                            </View>
                        </View>
                        )}
                        <View style={[commonStyles.mb43]} />
                        <View style={[commonStyles.mb43]} />
                    </ScrollView >
                </Container >)}
        </SafeAreaView>
    );
};
export default AllPersonalInfo;

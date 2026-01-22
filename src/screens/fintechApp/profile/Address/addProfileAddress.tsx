
import { KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import ViewComponent from '../../../../newComponents/view/view'
import { s } from '../../../../newComponents/theme/scale'
import { useThemeColors } from '../../../../hooks/useThemeColors'
import { getThemedCommonStyles } from '../../../../components/CommonStyles'
import Container from '../../../../newComponents/container/container'
import PageHeader from '../../../../newComponents/pageHeader/pageHeader'
import { useHardwareBackHandler } from '../../../../hooks/backHandleHook'
import CommonAddress, { AddressFormValues } from '../../onboarding/kyc/commonAddAdress'
import CardsModuleService from '../../../../apiServices/card'
import useEncryptDecrypt from '../../../../hooks/encDecHook'
import { KYB_INFO_CONSTANTS } from '../../onboarding/kybInformation/constants'
import { useSelector } from 'react-redux'
import { t } from 'i18next'
import { showAppToast } from '../../../../newComponents/toasterMessages/ShowMessage'

const AddProfileAddress = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [loading, setLoading] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState<string>("");
    const { encryptAES } = useEncryptDecrypt();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [initValues, setInitValues] = useState<AddressFormValues>({
        firstName: "",
        lastName: "",
        favoriteName: "",
        addressType: "",
        country: "",
        state: "",
        city: "",
        phoneNumber: "",
        addressLine1: "",
        addressLine2: "",
        postalCode: "",
        email: "",
        phoneCode: "",
        town: "",
        isDefault: false,
    });
    const isEditing = !!props?.route?.params?.value;

    useEffect(() => {
        if (isEditing) {
            // We have params, so set the initial values for the form
            setInitValues(props.route.params.value);
        } else {
            // We are in "add" mode, so create the default empty object
            setInitValues({
                firstName: "",
                lastName: "",
                favoriteName: "",
                addressType: "",
                country: "",
                state: "",
                city: "",
                phoneNumber: "",
                addressLine1: "",
                addressLine2: "",
                postalCode: "",
                email: "",
                phoneCode: "",
                town: "",
                isDefault: false,
            });
        }
    }, [props?.route?.params?.value]);
    useHardwareBackHandler(() => {
        handleGoBack()
    })
    const handleUpdate = async (values: any) => {
        const updateObj = {
            "id": props?.route?.params?.value?.id,
            "favoriteName": values?.favoriteName?.trim() || "",
            "addressType": values?.addressType?.trim() || "",
            "email": encryptAES(values?.email),
            "country": values?.country,
            "state": values?.state.trim(),
            "phoneNumber": encryptAES(values?.phoneNumber),
            "phoneCode": encryptAES(values?.phoneCode),
            "isDefault": values?.isDefault || false,
            "addressLine1": values?.addressLine1?.trim(),
            "addressLine2": values?.addressLine2?.trim(),
            "city": values?.city?.trim(),
            "postalCode": encryptAES(values?.postalCode),
            "createdBy": encryptAES(userInfo?.userName),
            "modifiedBy": encryptAES(userInfo?.userName),
            "createdDate": new Date(),
            "town": values?.town,
            "modifiedDate": new Date(),
            "metadata": null
        };
        try {
            const response: any = await CardsModuleService.cardsAddressPut(updateObj);
            if (response.ok) {
                showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_UPDATED"), 'success');
                handleGoBack()
            }
            return response;
        } catch (error: any) {
            return error;
        }
    }
    const handleSave = async (values: AddressFormValues) => {
        try {
            if (props?.route?.params?.value?.id) {
                return await handleUpdate(values);
            } else {
                const obj = {
                    id: KYB_INFO_CONSTANTS.GUID_FORMATE,
                    customerId: userInfo?.id,
                    favoriteName: values?.favoriteName?.trim(),
                    addressType: values?.addressType?.trim() || "",
                    country: values?.country,
                    state: values?.state?.trim() || "",
                    city: values?.city?.trim(),
                    addressLine1: values?.addressLine1?.trim(),
                    addressLine2: values?.addressLine2?.trim(),
                    postalCode: encryptAES(values?.postalCode),
                    phoneNumber: encryptAES(values?.phoneNumber),
                    phoneCode: encryptAES(values?.phoneCode),
                    email: encryptAES(values?.email),
                    isDefault: values?.isDefault || false,
                    createdBy: userInfo?.userName,
                    town: values?.town,
                    createdDate: new Date(),
                }
                const repsone = await CardsModuleService.cardsAddressPost(obj);
                if (repsone.ok) {
                    showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_ADDED"), 'success');
                    handleGoBack()
                }
                return repsone;



            }
        } catch (error) {
            return error
        }
    }
    const handleGoBack = () => {
        props?.navigation?.goBack()
    }
    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                // keyboardVerticalOffset={s(64)}
            >
                <Container style={[commonStyles.container]}>
                    <PageHeader title={props?.route?.params?.value && "GLOBAL_CONSTANTS.EDIT_ADDRESS" || "GLOBAL_CONSTANTS.ADD_ADDRESS"} onBackPress={handleGoBack} />
                    <CommonAddress isAddAddress={true} screenName={'ProfileAddress'} initValues={initValues} handleSave={handleSave} loading={loading} errormsg={errormsg} handleGoBack={handleGoBack} />
                </Container>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default AddProfileAddress




import { KeyboardAvoidingView, Platform, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import ViewComponent from '../../../../../newComponents/view/view'
import { s } from '../../../../../newComponents/theme/scale'
import { useThemeColors } from '../../../../../hooks/useThemeColors'
import { getThemedCommonStyles } from '../../../../../components/CommonStyles'
import Container from '../../../../../newComponents/container/container'
import PageHeader from '../../../../../newComponents/pageHeader/pageHeader'
import CommonAddress, { AddressFormValues } from '../../../onboarding/kyc/commonAddAdress'
import CardsModuleService from '../../../../../apiServices/card'
import { KYB_INFO_CONSTANTS } from '../../../onboarding/kybInformation/constants'
import { useSelector } from 'react-redux'
import useEncryptDecrypt from '../../../../../hooks/encDecHook'
import { showAppToast } from '../../../../../newComponents/toasterMessages/ShowMessage'
import { t } from 'i18next'
interface AddCardsAddressModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    value?: AddressFormValues & { id?: string };
}

const AddCardsAddress = (props: AddCardsAddressModalProps) => {
    const { isVisible, onClose, onSaveSuccess, value } = props;
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { encryptAES } = useEncryptDecrypt();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [initValues, setInitValues] = useState<AddressFormValues>({
        firstName: "", lastName: "", favoriteName: "", addressType: "",
        country: "", state: "", city: "", phoneNumber: "", addressLine1: "",
        addressLine2: "", postalCode: "", email: "", phoneCode: "",
        town: "", isDefault: false,
    });
    const isEditing = !!value;

    useEffect(() => {
        if (isVisible) {
            if (isEditing && value) {
                setInitValues(value);
            } else {
                setInitValues({
                    firstName: "", lastName: "", favoriteName: "", addressType: "",
                    country: "", state: "", city: "", phoneNumber: "", addressLine1: "",
                    addressLine2: "", postalCode: "", email: "", phoneCode: "",
                    town: "", isDefault: false,
                });
            }
        }
    }, [isVisible, isEditing, value]);

    const handleUpdate = async (formValues: any) => {
        const updateObj = {
            "id": value?.id,
            "favoriteName": formValues?.favoriteName?.trim() || "",
            "addressType": formValues?.addressType?.trim() || "",
            "email": encryptAES(formValues?.email),
            "country": formValues?.country || "",
            "state": formValues.state?.trim(),
            "phoneNumber": encryptAES(formValues?.phoneNumber),
            "phoneCode": encryptAES(formValues?.phoneCode),
            "isDefault": formValues?.isDefault || false,
            "addressLine1": formValues?.addressLine1?.trim(),
            "addressLine2": formValues?.addressLine2?.trim(),
            "city": formValues?.city?.trim(),
            "postalCode": encryptAES(formValues?.postalCode),
            "createdBy": encryptAES(userInfo?.userName),
            "modifiedBy": encryptAES(userInfo?.userName),
            "createdDate": new Date(),
            "town": formValues?.town,
            "modifiedDate": new Date(),
            "metadata": null
        };
        try {
            const response: any = await CardsModuleService.cardsAddressPut(updateObj);
            if (response.ok) {
                onClose();
                showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_ADDED"), 'success');

            }
            return response

        } catch (error: any) {
            return error;
        }
    }

    const handleSave = async (formValues: AddressFormValues) => {
        try {
            if (isEditing) {
                await handleUpdate(formValues);
            } else {
                const obj = {
                    id: KYB_INFO_CONSTANTS.GUID_FORMATE,
                    customerId: userInfo.id,
                    favoriteName: formValues?.favoriteName?.trim(),
                    addressType: formValues?.addressType?.trim() || "",
                    country: formValues.country,
                    state: formValues.state?.trim(),
                    city: formValues.city?.trim(),
                    addressLine1: formValues.addressLine1?.trim(),
                    addressLine2: formValues.addressLine2?.trim(),
                    postalCode: encryptAES(formValues?.postalCode),
                    phoneNumber: encryptAES(formValues?.phoneNumber),
                    phoneCode: encryptAES(formValues?.phoneCode),
                    email: encryptAES(formValues?.email),
                    isDefault: formValues?.isDefault || false,
                    createdBy: userInfo?.userName,
                    town: formValues?.town,
                    createdDate: new Date(),
                }
                const response = await CardsModuleService.cardsAddressPost(obj);
                if (response.ok) {
                    showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_ADDED"), 'success');
                    onSaveSuccess();
                }
                return response;

            }
        } catch (error) {
            return error
        }
    }

    return (
        <Modal
            visible={isVisible}
            onRequestClose={onClose}
            animationType="slide"
        >
            <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg,Platform.OS === 'ios' ? commonStyles.mt32:0]}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={s(64)}
                >
                    <Container style={[commonStyles.container]}>
                        <PageHeader
                            title={isEditing ? "GLOBAL_CONSTANTS.EDIT_ADDRESS" : "GLOBAL_CONSTANTS.ADD_ADDRESS"}
                            onBackPress={onClose}
                        />
                        <CommonAddress
                            isAddAddress={true}
                            screenName={'ProfileAddress'}
                            initValues={initValues}
                            handleSave={handleSave}
                            handleGoBack={onClose}
                        />
                    </Container>
                </KeyboardAvoidingView>
            </ViewComponent>
        </Modal>
    )
}

export default AddCardsAddress




import { KeyboardAvoidingView, Platform } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import ViewComponent from '../../../../../../newComponents/view/view'
import { s } from '../../../../../../newComponents/theme/scale'
import { useThemeColors } from '../../../../../../hooks/useThemeColors'
import { getThemedCommonStyles } from '../../../../../../components/CommonStyles'
import Container from '../../../../../../newComponents/container/container'
import PageHeader from '../../../../../../newComponents/pageHeader/pageHeader'
import CommonAddress, { AddressFormValues } from '../../../../onboarding/kyc/commonAddAdress'
import { KYB_INFO_CONSTANTS } from '../../../../onboarding/kybInformation/constants'
import { useSelector } from 'react-redux'
import useEncryptDecrypt from '../../../../../../hooks/encDecHook'

interface PayoutAddressFormProps {
    onClose: () => void;
    onSubmit: (addressObject: any, taxIdNumber?: string) => void;
    editingAddress?: any;
    taxIdNumber?: string;
}

const PayoutAddressForm: React.FC<PayoutAddressFormProps> = ({
    onClose,
    onSubmit,
    editingAddress,
    taxIdNumber
}) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);

    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { decryptAES } = useEncryptDecrypt();
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

    useEffect(() => {
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
    }, [editingAddress]);

    const handleSave = async (values: AddressFormValues) => {
        try {
            const addressObject = {
                id: KYB_INFO_CONSTANTS.GUID_FORMATE,
                customerId: userInfo?.id,
                favoriteName: values?.favoriteName?.trim(),
                addressType: values?.addressType?.trim() || "",
                country: values?.country,
                state: values?.state?.trim() || "",
                city: values?.city?.trim(),
                addressLine1: values?.addressLine1?.trim(),
                addressLine2: values?.addressLine2?.trim(),
                postalCode: decryptAES(values?.postalCode),
                phoneNumber: decryptAES(values?.phoneNumber),
                phoneCode: decryptAES(values?.phoneCode),
                email: decryptAES(values?.email),
                createdBy: userInfo?.name,
                isDefault: values?.isDefault || false,
                town: values?.town,
                createdDate: new Date(),
            };

            const response = await onSubmit(addressObject, taxIdNumber);
            return response;
        } catch (error) {
            return error;
        }
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            // keyboardVerticalOffset={s(64)}
            >
                <Container style={[commonStyles.container]}>
                    <ViewComponent style={{ marginTop: Platform.OS === 'ios' ? s(30) : 0 }}>
                        <PageHeader
                            title={"GLOBAL_CONSTANTS.ADD_ADDRESS"}
                            onBackPress={onClose}
                        />
                    </ViewComponent>
                    <CommonAddress
                        isAddAddress={true}
                        initValues={initValues}
                        handleSave={handleSave}
                    />
                </Container>
            </KeyboardAvoidingView>
        </ViewComponent >
    );
};

export default PayoutAddressForm;

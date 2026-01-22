import React, { useState } from 'react';
import { Formik } from "formik";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/core";
import { isErrorDispaly } from '../../../../utils/helpers';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import Container from '../../../../newComponents/container/container';
import SafeAreaViewComponent from '../../../../newComponents/safeArea/safeArea';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import ScrollViewComponent from '../../../../newComponents/scrollView/scrollView';
import ViewComponent from '../../../../newComponents/view/view';
import FormikTextInput from '../../../../newComponents/textInputComponents/formik/textInput';
import ButtonComponent from '../../../../newComponents/buttons/button';
import ProfileService from '../../../../apiServices/profile';
import { encryptAES } from '../../../../utils/encryptionDecryption';
import { CreateAccSchema } from './validationSchema';
import { ResetPasswordFormValues } from './interface';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';

const ChangePassword = () => {
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const navigation = useNavigation<any>();
    const [errormsg, setErrormsg] = useState(null);
    const [btnDtlLoading, setBtnDtlLoading] = useState(false);
    const [btnDisabled, setBtnDisabled] = useState(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const initValues: ResetPasswordFormValues = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    };
    const onSubmit = async (value: ResetPasswordFormValues) => {
        setBtnDtlLoading(true);
        setBtnDisabled(true);
        let obj: any = {
            email: encryptAES(userInfo?.email, userInfo?.sk),
            currentPassword: encryptAES(value?.currentPassword, userInfo?.sk),
            password: encryptAES(value?.newPassword, userInfo?.sk),
            confirmPassword: encryptAES(value?.confirmPassword, userInfo?.sk),
            userId: userInfo?.id,
            metadata: {},
            info: ""
        }
        try {
            const res: any = await ProfileService.resetPassword();
            if (res?.ok) {
                setBtnDtlLoading(false);
                setBtnDisabled(false);
                navigation.navigate("ChangePasswordSuccess");
            }
            else {
                setErrormsg(isErrorDispaly(res));
                setBtnDtlLoading(false);
                setBtnDisabled(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setBtnDtlLoading(false);
            setBtnDisabled(false);
        }

    }
    const handleBack = () => {
        navigation.navigate("ProfileComponent")
    }
    return (
        <SafeAreaViewComponent>
            <KeyboardAwareScrollView
                contentContainerStyle={[{ flexGrow: 1 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >
                <Container style={commonStyles.container}>
                    <PageHeader title="GLOBAL_CONSTANTS.CHANGE_PASSWORD" onBackPress={handleBack} />
                    <ScrollViewComponent>
                        {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg(null)} />}
                        <ViewComponent >
                            <Formik
                                initialValues={initValues}
                                onSubmit={onSubmit}
                                validationSchema={CreateAccSchema}
                                enableReinitialize
                            >
                                {(formik) => {
                                    const { handleSubmit } =
                                        formik;
                                    return (
                                        <ViewComponent>
                                            <ViewComponent style={commonStyles.mt8} />
                                            <FormikTextInput
                                                label={"GLOBAL_CONSTANTS.CURRENT_PASSWORD"}
                                                name={"currentPassword"}
                                                placeholder={"GLOBAL_CONSTANTS.ENTER_CURRENT_PASSWORD"}
                                                secureTextEntry={true}
                                                isRequired={true}
                                                maxLength={50}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />
                                            <FormikTextInput
                                                label={"GLOBAL_CONSTANTS.NEW_PASSWORD"}
                                                name={"newPassword"}
                                                placeholder={"GLOBAL_CONSTANTS.ENTER_NEW_PASSWORD"}
                                                secureTextEntry={true}
                                                isRequired={true}
                                                maxLength={50}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />
                                            <FormikTextInput
                                                label={"GLOBAL_CONSTANTS.CONFIRM_PASSWORD"}
                                                name={"confirmPassword"}
                                                placeholder={"GLOBAL_CONSTANTS.ENTER_CONFIRM_PASSWORD"}
                                                secureTextEntry={true}
                                                isRequired={true}
                                                maxLength={50}
                                            />
                                            <ViewComponent style={commonStyles.sectionGap} />
                                            <ViewComponent >
                                                <ButtonComponent
                                                    title={"GLOBAL_CONSTANTS.SAVE"}
                                                    onPress={handleSubmit}
                                                    disable={btnDisabled}
                                                    loading={btnDtlLoading}
                                                />
                                            </ViewComponent>
                                            <ViewComponent style={commonStyles.mt16} />
                                            <ViewComponent>
                                                <ButtonComponent
                                                    title={"GLOBAL_CONSTANTS.CANCEL"}
                                                    onPress={() => navigation.goBack()}
                                                    disable={btnDisabled}
                                                    solidBackground={true}
                                                />
                                            </ViewComponent>
                                        </ViewComponent>
                                    );
                                }}
                            </Formik>
                        </ViewComponent>
                    </ScrollViewComponent>
                </Container></KeyboardAwareScrollView>
        </SafeAreaViewComponent>

    );
};

export default ChangePassword;


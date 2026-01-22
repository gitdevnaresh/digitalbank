import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, TextInput } from "react-native";
import { Formik, Field } from "formik";
import CreateAccountService from '../../../apiServices/createAccount';
import { formatDateTimeAPI, isErrorDispaly } from '../../../utils/helpers';
import CustomPicker from "../../../newComponents/customPicker/CustomPicker";
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import OnBoardingService from '../../../apiServices/onBoardingservice';
import { useDispatch, useSelector } from 'react-redux';
import { CommonActions, useIsFocused, useNavigation } from "@react-navigation/native";
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import Container from '../../../newComponents/container/container';
import RadioButton from '../../../newComponents/radiobutton/RadioButton';
import AuthService from '../../../apiServices/auth';
import { loginAction } from '../../../redux/actions/actions';
import { s } from '../../../constants/theme/scale';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import { validatePhoneNumber } from '../../commonScreens/commonValidations';
import { validateBusinessName, validateFirastName, validateLastName } from './onBoardingSchema';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import ButtonComponent from '../../../newComponents/buttons/button';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ViewComponent from '../../../newComponents/view/view';
import { CountryListItem, LocalRootStackParamList, PhoneCodeListItem, RegFormValues, RootState, } from './constants';
import { useThemeColors } from '../../../hooks/useThemeColors';
import DashboardLoader from '../../../components/loader';
import Keychain from 'react-native-keychain';
import PhoneCodePicker from '../../commonScreens/phonePicker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomRBSheet from '../../../newComponents/models/commonDrawer';
import { useHardwareBackHandler } from '../../../hooks/backHandleHook';
import { logEvent } from '../../../hooks/loggingHook';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import AlertsCarousel from '../Dashboard/components/allertCases';
import RenderHTML from 'react-native-render-html';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import LabelComponent from '../../../newComponents/textComponets/lableComponent/lable';
import DatePickerComponent from '../../../newComponents/datePickers/formik/datePicker';
import ConfirmLogout from '../../commonScreens/confirmLogout/comfirmLogout';
import NoDataComponent from '../../../newComponents/noData/noData';
import useCountryData from '../../../hooks/useCountryData';
import useLogout from '../../../hooks/useLogout';

type CustomerRigisterScreenProps = NativeStackScreenProps<LocalRootStackParamList, 'CustomerRigister'>;
type FormFieldNames = keyof RegFormValues;

const CustomerRigister = (props: CustomerRigisterScreenProps) => {
    const { route } = props;
    const { accountType: routeAccountType, referralId: routeReferralId } = route.params || "";
    const [genderOptions, setGenderOptions] = useState<any[]>([]);
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Use new country data hook
    const { countries, phoneCodes, loading: countryLoading, error: countryError } = useCountryData({
        loadCountries: true,
        loadPhoneCodes: true,
    });
    const dispatch = useDispatch<any>();
    const { encryptAES } = useEncryptDecrypt();
    const CustomeRbsheetRef = useRef<any>(null);
    const [regVals, setRegVals] = useState<RegFormValues>({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        country: '',
        businessName: '',
        phoneCode: "",
        gender: '',
        state: "",
        city: "",
        addressLine1: "",
        postalCode: "",
        incorporationDate: null,
    });

    const userinfo = useSelector((state: RootState) => state.userReducer?.userDetails);
    const navigation = useNavigation<NativeStackScreenProps<LocalRootStackParamList>['navigation']>();
    const [saveLoading, setSaveLoading] = useState<boolean>(false)
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [isCheckedError, setIsCheckedError] = useState<string | null>(null);
    const isFocused = useIsFocused();
    const { t } = useLngTranslation();
    const isEmployeeFromUserInfo = userinfo?.isEmployee;
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    // 1. Add state to track the currently focused field
    const [focusedField, setFocusedField] = useState<FormFieldNames | null>(null);
    const [templateContent, setTemplateContent] = useState<any>(null);
    const [templateTitle, setTemplateTile] = useState<string>('');
    const [templeteLoader, setTempleteLoader] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState(false);
    const scrollRef = useRef<any>(null);
    const { logout } = useLogout();

    useEffect(() => {
        getLookupDetails();
        if (isEmployeeFromUserInfo) {
            setRegVals((prev) => ({
                ...prev,
                firstName: userinfo?.firstName ?? '',
                lastName: userinfo?.lastName ?? '',
                phoneNumber: userinfo?.phoneNo ?? '',
                country: userinfo?.country ?? '',
                phoneCode: userinfo?.phonecode ?? '',
            }))
        }
    }, [isFocused, isEmployeeFromUserInfo]);

    // Handle country data errors
    useEffect(() => {
        if (countryError) {
            setErrormsg(countryError);
        }
    }, [countryError]);
    const getLookupDetails = async () => {
        try {
            const response: any = await CreateAccountService.getListOfCountries();
            if (response?.ok) {
                if (response.data?.Gender) {
                    const mappedGenders = response.data.Gender.map((gender: any) => {
                        let key = gender.name.toUpperCase();
                        if (key === 'OTHERS') {
                            key = 'OTHER';
                        }
                        return { label: `GLOBAL_CONSTANTS.${key}`, value: gender.name };
                    });
                    setGenderOptions(mappedGenders);
                }
                setErrormsg(null)
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    };
    const getPrivatePolicyData = async (type: string) => {
        setTempleteLoader(true);
        try {
            const response: any = await CreateAccountService.getPrivatePolicyTemplate(type, props?.route?.params?.accountType);
            if (response?.ok) {
                setTemplateContent(response.data?.templateContent);
                setErrormsg(null)
                setTempleteLoader(false);
            } else {
                setErrormsg(isErrorDispaly(response));
                setTempleteLoader(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setTempleteLoader(false);
        }
    };
    const handleSubmit = async (values: RegFormValues) => {
        setErrormsg('')
        if (!isChecked) {
            setIsCheckedError(t('GLOBAL_CONSTANTS.ERROR_ACCEPT_TERMS'));
            scrollRef?.current?.scrollToPosition(0, 0, true);
            return;
        }
        logEvent("Button Pressed", { action: "Registration button pressed", nextScreen: "Phone verification", currentScreen: "Registration" })
        setIsCheckedError(null);
        const userInfo = {
            phoneNo: encryptAES(values.phoneNumber),
            phoneCode: encryptAES(`${values.phoneCode}`),
            country: values.country,
            isAccepted: isChecked,
            referralId: routeReferralId ?? null,
            firstName: values.firstName || null,
            lastName: values.lastName || null,
            gender: values?.gender || null,
            businessName: values?.businessName || null,
            incorporationDate: values?.incorporationDate ? formatDateTimeAPI(values?.incorporationDate) : null,
        };
        setSaveLoading(true);
        const currentAccountType = routeAccountType || userinfo?.accountType;
        if (!currentAccountType) {
            setErrormsg(t("ERROR_ACCOUNT_TYPE_MISSING"));
            scrollRef?.current?.scrollToPosition(0, 0, true);
            setSaveLoading(false);
            return;
        }
        const saveRes = await OnBoardingService.saveUserInfo(userInfo, currentAccountType);
        if (saveRes.ok) {
            setSaveLoading(false);
            updateUserInfo(saveRes?.data);
        } else {
            setErrormsg(isErrorDispaly(saveRes));
            scrollRef?.current?.scrollToPosition(0, 0, true);
            setSaveLoading(false);
        }
    };

    const updateUserInfo = (values: any) => {
        AuthService.getMemberInfo().then((userLoginInfo: any) => {
            dispatch(loginAction(userLoginInfo?.data));
            setSaveLoading(false);
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{ name: "RegistrationSuccess" }],
                })
            );
        }).catch((error) => {
            setSaveLoading(false);
        })
    }

    const validatePersonalFields = (values: RegFormValues, errors: Partial<Record<keyof RegFormValues, string>>) => {
        if (!values.firstName) {
            errors.firstName = "GLOBAL_CONSTANTS.IS_REQUIRED";
        } else if (!validateFirastName(values.firstName)) {
            errors.firstName = "GLOBAL_CONSTANTS.INVALID_FIRST_NAME";
        }
        if (!values.lastName) {
            errors.lastName = "GLOBAL_CONSTANTS.IS_REQUIRED";
        } else if (!validateLastName(values.lastName)) {
            errors.lastName = "GLOBAL_CONSTANTS.INVALID_LAST_NAME";
        }
        if (!values.gender) {
            errors.gender = "GLOBAL_CONSTANTS.IS_REQUIRED";
        }
    };

    const validateBusinessFields = (values: RegFormValues, errors: Partial<Record<keyof RegFormValues, string>>) => {
        if (!values.businessName) {
            errors.businessName = "GLOBAL_CONSTANTS.IS_REQUIRED";
        } else if (!validateBusinessName(values?.businessName)) {
            errors.businessName = "GLOBAL_CONSTANTS.INVALID_BUSINESS_NAME";
        }
        if (!values?.incorporationDate) {
            errors.incorporationDate = "GLOBAL_CONSTANTS.IS_REQUIRED";
        }
    };

    const validate = (values: RegFormValues) => {
        const errors: Partial<Record<keyof RegFormValues, string>> = {};
        const currentAccountType = routeAccountType || userinfo?.accountType;
        if (currentAccountType !== 'Business') {
            validatePersonalFields(values, errors);
        } else {
            validateBusinessFields(values, errors);
        }
        if (!values?.phoneNumber) {
            errors.phoneNumber = "GLOBAL_CONSTANTS.IS_REQUIRED";
        } else if (!validatePhoneNumber(values?.phoneNumber)) {
            errors.phoneNumber = "GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER";
        }
        if (!values.country) {
            errors.country = "GLOBAL_CONSTANTS.IS_REQUIRED";
        }
        if (!values.phoneCode) {
            errors.phoneCode = "GLOBAL_CONSTANTS.IS_REQUIRED";
        }
        // if (!isChecked) {
        //     setIsCheckedError(t('GLOBAL_CONSTANTS.ERROR_ACCEPT_TERMS'));
        // }
        return errors;
    };
    useHardwareBackHandler(() => {
        navigation.goBack();
    })
    const handleBackArrowAddressView = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleCheck = (isActive: boolean) => {
        Keyboard.dismiss();
        setIsChecked(isActive);
        setIsCheckedError(null)
    };

    const handleClose = () => {
        setIsVisible(false)
    }
    const handleConfirm = async () => {
        setIsVisible(false)
        handleLogout();
    }
    const handleLogoutBtn = () => {
        setIsVisible(true)
    }

    const handleLogout = async () => {
        setLoading(true);
        await logout();
        setLoading(false);

    };
    const handleValidationSave = (validateForm: any) => {
        validateForm().then(async (errors: any) => {
            if (Object?.keys(errors)?.length > 0) {
                scrollRef?.current?.scrollToPosition(0, 0, true);
                setErrormsg(t("GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD"));
            }
        })
    };

    const hadnleOpenAgreementPopup = (type: any, title: any) => {
        Keyboard.dismiss();
        setTemplateTile(title);
        getPrivatePolicyData(type)
        CustomeRbsheetRef.current?.open();
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <KeyboardAwareScrollView
                ref={scrollRef}
                contentContainerStyle={[{ flexGrow: 1 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >

                <Container style={[commonStyles.container]}>
                    <PageHeader showLogo={false} onBackPress={handleBackArrowAddressView} title={props?.route?.params?.accountType === "Business" ? "GLOBAL_CONSTANTS.BUSINESS_INFORMATION" : "GLOBAL_CONSTANTS.PERSIONAL_INFORMATION"} />
                    <AlertsCarousel commonStyles={commonStyles} screenName='Onbaording' />
                    <ViewComponent style={commonStyles.titleSectionGap} />
                    {loading && (
                        <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                            <DashboardLoader />
                        </ViewComponent>
                    )}
                    {!loading && (
                        <>
                            {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg(null)} />}
                            <ViewComponent >
                                <Formik
                                    initialValues={regVals}
                                    onSubmit={handleSubmit}
                                    validate={validate}
                                    enableReinitialize
                                >
                                    {({ touched, handleSubmit, handleChange, handleBlur, values, errors, setFieldValue, validateForm }) => {

                                        // 2. Define border color logic for phone group
                                        const phoneGroupHasError = (touched.phoneCode && errors.phoneCode) || (touched.phoneNumber && errors.phoneNumber);
                                        const isPhoneGroupFocused = focusedField === 'phoneNumber';
                                        const phoneGroupBorderColor = phoneGroupHasError ? NEW_COLOR.TEXT_RED : isPhoneGroupFocused ? NEW_COLOR.TEXT_PRIMARY : NEW_COLOR.INPUT_BORDER;

                                        return (
                                            <>
                                                {(routeAccountType || userinfo?.accountType) !== 'Business' && <>
                                                    <ViewComponent style={[commonStyles.relative,]}>
                                                        <LabelComponent style={[commonStyles.inputLabel]} text={t("GLOBAL_CONSTANTS.FIRST_NAME")} children={<ParagraphComponent style={[commonStyles.textRed]} text={' *'} />} />
                                                        {/* 3. Apply dynamic border color and event handlers */}
                                                        <TextInput style={[commonStyles.textInput, { borderColor: touched.firstName && errors.firstName ? NEW_COLOR.TEXT_RED : focusedField === 'firstName' ? NEW_COLOR.TEXT_PRIMARY : NEW_COLOR.INPUT_BORDER }]}
                                                            placeholder={t("GLOBAL_CONSTANTS.FIRST_NAME_PLACEHOLDER")}
                                                            placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                            onChangeText={handleChange('firstName')}
                                                            onFocus={() => setFocusedField('firstName')}
                                                            value={values?.firstName}
                                                            maxLength={30}
                                                        />
                                                    </ViewComponent>
                                                    {touched.firstName && errors.firstName && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]} text={errors.firstName} />}
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                    <ViewComponent style={[commonStyles.relative,]}>
                                                        <LabelComponent style={[commonStyles.inputLabel]} text={t("GLOBAL_CONSTANTS.LAST_NAME")} children={<ParagraphComponent style={[commonStyles.textRed]} text={' *'} />} />
                                                        <TextInput style={[commonStyles.textInput, { borderColor: touched.lastName && errors.lastName ? NEW_COLOR.TEXT_RED : focusedField === 'lastName' ? NEW_COLOR.TEXT_PRIMARY : NEW_COLOR.INPUT_BORDER }]}
                                                            placeholder={t("GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER")}
                                                            onChangeText={handleChange('lastName')}
                                                            onFocus={() => setFocusedField('lastName')}
                                                            placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                            value={values.lastName}
                                                            maxLength={30}
                                                        />
                                                    </ViewComponent>
                                                    {touched.lastName && errors.lastName && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]} text={errors.lastName} />}
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                    <LabelComponent text={"GLOBAL_CONSTANTS.GENDER"} children={<LabelComponent
                                                        text=" *"
                                                        style={commonStyles.textError}
                                                    />} style={[commonStyles.mb10, commonStyles.textWhite]} />
                                                    <RadioButton
                                                        options={genderOptions}
                                                        selectedOption={values.gender}
                                                        onSelect={(val: string) => setFieldValue('gender', val)}
                                                        nameField='label'
                                                        valueField='value'
                                                    />
                                                    {touched.gender && errors.gender && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]} text={errors.gender} />}
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                </>}
                                                {(routeAccountType || userinfo?.accountType) === 'Business' && <>
                                                    <ViewComponent style={[commonStyles.relative, commonStyles.pr5]}>
                                                        <LabelComponent style={[commonStyles.inputLabel]} text={t("GLOBAL_CONSTANTS.LEGAL_ENTITY_NAME")} children={<ParagraphComponent style={[commonStyles.textRed]} text={' *'} />} />
                                                        <TextInput style={[commonStyles.textInput, { borderColor: touched.businessName && errors.businessName ? NEW_COLOR.TEXT_RED : focusedField === 'businessName' ? NEW_COLOR.TEXT_PRIMARY : NEW_COLOR.INPUT_BORDER }]}
                                                            placeholder={t("GLOBAL_CONSTANTS.LEGAL_ENTITY_PLACEHOLDER")}
                                                            onChangeText={handleChange('businessName')}
                                                            onFocus={() => setFocusedField('businessName')}
                                                            placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                            value={values.businessName || ''}
                                                            maxLength={30}
                                                        />
                                                    </ViewComponent>
                                                    {touched.businessName && errors.businessName && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]} text={errors.businessName} />}
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                </>}
                                                <LabelComponent text={"GLOBAL_CONSTANTS.PHONE_NUMBER"} style={[commonStyles.inputLabel]} >
                                                    <LabelComponent text={"*"} style={commonStyles.textError} />
                                                </LabelComponent>
                                                <ViewComponent style={[commonStyles.relative, commonStyles.dflex,]}>
                                                    <PhoneCodePicker
                                                        inputStyle={{ borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderColor: touched?.phoneCode && errors?.phoneCode ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER }}
                                                        modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY_CODE"}
                                                        customBind={["name", "(", "code", ")"]}
                                                        data={phoneCodes}
                                                        value={values?.phoneCode}
                                                        placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_SELECT")}
                                                        containerStyle={[]}
                                                        onChange={(item: any) => setFieldValue('phoneCode', item?.code)}
                                                        sheetHeight={s(350)}
                                                        isOnlycountry={true}
                                                    />
                                                    <TextInput
                                                        style={[commonStyles.flex1, commonStyles.textInput, commonStyles.fs14, commonStyles.fw400, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderColor: phoneGroupBorderColor, width: "100%" }]}
                                                        placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_PLACEHOLDER")}
                                                        onChangeText={(text) => {
                                                            const formattedText = text.replace(/[^0-9]/g, "").slice(0, 13);
                                                            handleChange('phoneNumber')(formattedText);
                                                        }}
                                                        onFocus={() => setFocusedField('phoneNumber')}
                                                        value={values.phoneNumber}
                                                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                        keyboardType="phone-pad"
                                                        maxLength={13}
                                                    />
                                                </ViewComponent>
                                                {(touched.phoneCode || touched.phoneNumber) && (errors.phoneCode || errors.phoneNumber) && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]} text={errors.phoneNumber ?? errors.phoneCode} />}
                                                <ViewComponent style={[commonStyles.formItemSpace]} />
                                                <ViewComponent style={[commonStyles.relative]}>
                                                    <LabelComponent style={[commonStyles.inputLabel]} text={(routeAccountType || userinfo?.accountType) !== 'Business' ? t("GLOBAL_CONSTANTS.COUNTRY_OF_RECIDENCY") : t("GLOBAL_CONSTANTS.COUNTRY_OF_INCORPORATION")} children={<ParagraphComponent style={[commonStyles.textRed]} text={' *'} />} />
                                                    <Field
                                                        activeOpacity={0.9}
                                                        style={commonStyles.textInput}
                                                        touched={touched.country}
                                                        name="country"
                                                        error={errors.country}
                                                        data={countries}
                                                        placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                                                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                        component={CustomPicker}
                                                        modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                                                        sheetHeight={s(600)}
                                                        showCountryImages={true}
                                                        isOnlycountry={true}
                                                        onPress={() => {
                                                            Keyboard.dismiss();
                                                        }}
                                                    />
                                                    {(routeAccountType || userinfo?.accountType) === 'Business' && <ViewComponent style={[commonStyles.formItemSpace]} />}
                                                </ViewComponent>
                                                {(routeAccountType || userinfo?.accountType) === 'Business' && <DatePickerComponent name='incorporationDate' label={"GLOBAL_CONSTANTS.INCORPORATION_DATE"} maximumDate={new Date()} />}
                                                <ViewComponent style={[commonStyles.formItemSpace]} />
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.gap8]}>
                                                    <MaterialCommunityIcons
                                                        name={isChecked === true ? 'checkbox-outline' : 'checkbox-blank-outline'} size={s(22)}
                                                        color={isChecked === true ? NEW_COLOR.TEXT_PRIMARY : NEW_COLOR.TEXT_link}
                                                        touchableOpacity={0.6} onPress={() => handleCheck(!isChecked)}
                                                    />
                                                    <ParagraphComponent text={"GLOBAL_CONSTANTS.BY_CLICK_SUBMIT"} style={[commonStyles.secondparatext, commonStyles.flex1]} >
                                                        <ParagraphComponent text={"GLOBAL_CONSTANTS.AGREEMENT"} style={[commonStyles.secondparatextlink]} onPress={() => hadnleOpenAgreementPopup('Aggrement', 'User Agreement')}>
                                                            <ParagraphComponent text={"GLOBAL_CONSTANTS.AND_IVE_READ"} style={[commonStyles.secondparatext]} >
                                                            </ParagraphComponent>
                                                        </ParagraphComponent>
                                                        <ParagraphComponent text={"GLOBAL_CONSTANTS.PRIVACY_POLICY"} style={[commonStyles.secondparatextlink]} onPress={() => hadnleOpenAgreementPopup('PrivacyPolicy', "Privacy Policy")} >
                                                        </ParagraphComponent>
                                                    </ParagraphComponent>
                                                </ViewComponent>
                                                {isCheckedError && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt10]} text={isCheckedError} />}
                                                <ViewComponent style={[commonStyles.mt24, commonStyles.mb24,]} />
                                                <ButtonComponent title={"GLOBAL_CONSTANTS.CONTINUE"} onPress={() => {
                                                    handleValidationSave(validateForm);
                                                    handleSubmit();
                                                }} disable={saveLoading} loading={saveLoading} />
                                                <ViewComponent style={[commonStyles.buttongap]} />
                                                <ButtonComponent title={"GLOBAL_CONSTANTS.LOGOUT"} onPress={handleLogoutBtn} solidBackground={true} />
                                                <ViewComponent style={[commonStyles.sectionGap]} />
                                                <ViewComponent style={[commonStyles.mb10]} />
                                                <ConfirmLogout
                                                    isVisible={isVisible}
                                                    onClose={handleClose}
                                                    onConfirm={handleConfirm} />

                                            </>
                                        )
                                    }}
                                </Formik>
                            </ViewComponent>
                        </>
                    )}
                    <CustomRBSheet modeltitle={true} refRBSheet={CustomeRbsheetRef} title={templateTitle} height={s(700)} closeicon={true}>
                        {templeteLoader && <ActivityIndicator size="small" color={NEW_COLOR.TEXT_PRIMARY} />}
                        {!templeteLoader && <RenderHTML source={{ html: templateContent }}
                            tagsStyles={{
                                p: commonStyles.textWhite,
                                h1: commonStyles.textWhite,
                                h2: commonStyles.textWhite,
                                li: commonStyles.textWhite, span: commonStyles.textWhite,
                                a: { color: NEW_COLOR.TEXT_PRIMARY }
                            }}
                            classesStyles={{
                                "text-paraColor": commonStyles.textWhite,
                                "text-subTextColor": commonStyles.textWhite,
                            }} />}

                        {(!templeteLoader && !templateContent) && (<ViewComponent style={[commonStyles.mt44]}>
                            <NoDataComponent Description={`No ${templateTitle} Found`} />
                        </ViewComponent>
                        )}
                        <ViewComponent style={[commonStyles.sectionGap]} />
                    </CustomRBSheet>
                </Container>
            </KeyboardAwareScrollView>
        </ViewComponent >
    );
};

export default CustomerRigister;

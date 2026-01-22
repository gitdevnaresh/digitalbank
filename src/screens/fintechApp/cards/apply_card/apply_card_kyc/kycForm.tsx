import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StyleSheet, View, BackHandler, KeyboardAvoidingView, Platform } from "react-native";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import { isUSDateFormat, formatDateTimeDatePicker, isErrorDispaly } from "../../../../../utils/helpers";
import CardsModuleService from '../../../../../apiServices/card';
import { useIsFocused } from '@react-navigation/native';
import { CREATE_KYC_ADDRESS_CONST, FORM_DATA_CONSTANTS, FormData, generateValidationSchema } from "../constants";
import { Field, Formik } from "formik";
import moment from "moment-timezone";
import CustomPicker from "../../../../../newComponents/customPicker/CustomPicker";
import KycFields from "./kycFields";
import { setApplyCardData } from "../../../../../redux/actions/actions";
import { CARDS_CONST } from "../../CardsDashoard/constants";
import ButtonComponent from "../../../../../newComponents/buttons/button";
import { useThemeColors } from "../../../../../hooks/useThemeColors";
import useEncryptDecrypt from "../../../../../hooks/encDecHook";
import ViewComponent from "../../../../../newComponents/view/view";
import Container from "../../../../../newComponents/container/container";
import { s } from "../../../../../newComponents/theme/scale";
import ScrollViewComponent from "../../../../../newComponents/scrollView/scrollView";
import PageHeader from "../../../../../newComponents/pageHeader/pageHeader";
import DashboardLoader from "../../../../../components/loader";
import ErrorComponent from "../../../../../newComponents/errorDisplay/errorDisplay";
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook";
import { useLngTranslation } from "../../../../../hooks/useLngTranslation";
import LabelComponent from "../../../../../newComponents/textComponets/lableComponent/lable";
import CustomRBSheet from "../../../../../newComponents/models/commonBottomSheet";
import BindCardSuccess from "../../CardsDashoard/BindCardSuccess";
import * as Yup from 'yup';
const KycForm = (props: any) => {
    const isFocus = useIsFocused();
    const ref = useRef<any>(null);
    const [applyCardsLoading, setApplyCardsLoading] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState<any>('');
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [btnLoader, setBtnLoader] = useState<boolean>(false);
    const [kycReqList, setKycReqList] = useState([])
    const [keyRequirements, setKeyRequirements] = useState("")
    const [data, setData] = useState({ "beneficiaryType": [], "beneficiary": [], "ubosDetails": {} });
    const dispatch = useDispatch();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { decryptAES, encryptAES } = useEncryptDecrypt();
    const { t } = useLngTranslation();
    const succussRbRef = useRef<any>();

    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        middleName: "",
        country: "",
        state: "",
        dob: "",
        gender: "",
        city: "",
        town: "",
        addressLine1: "",
        mobile: "",
        mobileCode: userInfo?.phonecode || "",
        email: "",
        idType: "",
        idNumber: "",
        docExpiryDate: "",
        postalCode: "",
        faceImage: "",
        signature: "",
        profilePicBack: "",
        profilePicFront: "",
        handHoldingIDPhoto: "",
        biometric: "",
        emergencyContactName: "",
        kycRequirements: "",
        beneficiaryType: '',
        beneficiary: '',
        idImage: null,
        address: null,
        addressId: null,
        docNumber: null,
        faceImage1: null,
        mixedPhoto: null,
        occupation: null,
        annualSalary: null,
        sourceOfIncome: null,
        accountPurpose: null,
        expectedMonthlyVolume: null,
        issueDate: null,
        addressLine2: "",
        isDefault: false,
        documentTypeCode: "",
        isDocumentsRequriedOrNot: false,
        addressCountry: "",


    });
    useEffect(() => {
        getApplyCardDeatilsInfo();
        ref?.current?.scrollTo({ y: 0, animated: true });
        getListOfBeneficiaryTypes();
    }, [isFocus]);
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);
   const getApplyCardDeatilsInfo = async () => {
        setApplyCardsLoading(true);
        try {
            const response: any = await CardsModuleService?.getApplyCardsRequirements(props?.route?.params?.cardId);
            if (response?.status === 200) {
                setErrormsg('');
                setApplyCardsLoading(false);
                const kycRequirements = response?.data?.kyc?.kycRequirements;
                const mappedKycRequirements = kycRequirements
                    ? kycRequirements?.split(',')?.map((req: any) => req.toLowerCase())
                    : [];
                setKycReqList(mappedKycRequirements);
                setKeyRequirements(kycRequirements)
                const kycResponse = response?.data?.kyc;

                setFormData((prevData: any) => ({
                    ...prevData,
                    firstName: decryptAES(kycResponse?.firstName) ?? "",
                    lastName: decryptAES(kycResponse?.lastName) ?? "",
                    middleName: kycResponse?.middleName ?? "",
                    email: decryptAES(kycResponse?.email) ?? "",
                    mobile: decryptAES(kycResponse?.mobile) ?? "",
                    mobileCode: decryptAES(kycResponse?.mobileCode) ?? "",
                    country: kycResponse?.country ?? "",
                    addressCountry: kycResponse?.addressCountry ?? kycResponse?.country??"",
                    city: kycResponse?.city ?? "",
                    town:kycResponse?.town ?? "",
                    addressLine1:kycResponse?.addressLine1 ?? null,
                    state: kycResponse?.state ?? "",
                    gender: kycResponse?.gender ?? "",
                    dob: isUSDateFormat(decryptAES(kycResponse?.dob)) && formatDateTimeDatePicker(decryptAES(kycResponse?.dob)) || decryptAES(kycResponse?.dob),
                    idNumber: decryptAES(kycResponse?.idNumber) ?? "",
                    faceImage: kycResponse?.faceImage ?? null,
                    signature: kycResponse?.signature || null,
                    profilePicBack: kycResponse?.backDocImage ?? kycResponse?.profilePicBack ?? null,
                    profilePicFront:kycResponse?.profilePicFront ?? null,
                    handHoldingIDPhoto: kycResponse?.handHoldingIDPhoto ?? null,
                    faceImage1: kycResponse?.faceImage ?? null,
                    idImage:kycResponse?.idImage ?? null,
                    docExpiryDate: isUSDateFormat(decryptAES(kycResponse?.docExpiryDate)) && formatDateTimeDatePicker(decryptAES(kycResponse?.docExpiryDate)) || decryptAES(kycResponse?.docExpiryDate),
                    issueDate: isUSDateFormat(decryptAES(kycResponse?.docissueDate)) && formatDateTimeDatePicker(decryptAES(kycResponse?.docissueDate)) || decryptAES(kycResponse?.docissueDate),
                    occupation: kycResponse?.occupation ? kycResponse.occupation.replace(/[^a-zA-Z0-9\s]/g, '').trim().substring(0, 50) : "",
                    annualSalary: kycResponse?.annualSalary ?? null,
                    sourceOfIncome: kycResponse?.sourceOfIncome ?? null,
                    accountPurpose: kycResponse?.accountPurpose ?? null,
                    expectedMonthlyVolume: kycResponse?.expectedMonthlyVolume ?? null,
                    addressLine2: kycResponse?.addressLine2 ?? null,
                    postalCode: decryptAES(kycResponse?.postalCode ?? null),
                    emergencyContactName: decryptAES(kycResponse?.emergencyContactName ?? ""),
                    isDefault: kycResponse?.isDefault,
                    idType: mappedKycRequirements?.includes('passport') || mappedKycRequirements?.includes('passportonly') ? 'Passport' : kycResponse?.idType,
                    isdocTypeBasedOnCountry:kycResponse?.isdocTypeBasedOnCountry

                }));
            } else {
                setErrormsg("Invalid data received");
                setApplyCardsLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setApplyCardsLoading(false);
        }
    };

    const prepareKycData = (formValues: any) => ({
        KycUpdateModel: KycUpdateModel(formValues),

    });
    const KycUpdateModel = (formattedValues: any) => {
        return {
            customerId: userInfo?.id ?? "",
            cardId: props?.route?.params?.cardId ?? "",
            firstName: formattedValues?.firstName ?? "",
            lastName: formattedValues?.lastName ?? "",
            addressLine1: formattedValues?.addressLine1 ?? "",
            city: formattedValues?.city ?? "",
            state: formattedValues?.state ?? "",
            country: formattedValues?.country ?? "",
            addressCountry: formattedValues?.addressCountry ?? "",
            // town: formattedValues?.town ?? "",
            idType: formattedValues?.idType ?? "",
            idNumber: formattedValues?.idNumber ?? "",
            docIssueDate:formattedValues?.idType?.toLowerCase()?.replace(/\s+/g, '').trim() == "hongkongid"? null: (formattedValues?.issueDate || ""),
            profilePicFront: formattedValues?.profilePicFront ?? "",
            profilePicBack: formattedValues?.profilePicBack ?? "",
            signature: formattedValues?.signature ?? "",
            docExpiryDate: formattedValues?.idType?.toLowerCase()?.replace(/\s+/g, '').trim() == "hongkongid" ? null : (encryptAES(formattedValues?.docExpiryDate) || ""),
            dob: formattedValues?.dob ?? "",
            biometric: formattedValues?.biometric ?? "",
            backDocImage: formattedValues?.idType?.toLowerCase()?.replace(/\s+/g, '')?.trim() === "passport" ? formattedValues?.profilePicFront ?? "" : formattedValues?.profilePicBack ?? "",
            gender: formattedValues?.gender ?? "",
            email: formattedValues?.email ?? "",
            mobileCode: formattedValues?.mobileCode ?? "",
            mobile: formattedValues?.mobile ?? "",
            faceImage: formattedValues?.faceImage ?? "",
            handHoldingIDPhoto: formattedValues?.handHoldingIDPhoto ?? "",
            emergencyContactName: encryptAES(formattedValues?.emergencyContactName) ?? "",
            postalCode: encryptAES(formattedValues?.postalCode) ?? "",
            cardHandHoldingIDPhoto: formattedValues?.cardHandHoldingIDPhoto ?? "",
            occupation: formattedValues?.occupation ?? "",
            ipAddress: formattedValues?.ipAddress ?? "",
            annualSalary: formattedValues?.annualSalary ?? 0,
            accountPurpose: formattedValues?.accountPurpose ?? "",
            expectedMonthlyVolume: formattedValues?.expectedMonthlyVolume ?? 0,
            requirement: keyRequirements || "",
            addressId: formattedValues?.addressId ?? null,
            addressLine2: formattedValues?.addressLine2 ?? "",
        };
    };
    const handleSaveKycData = async (values: any) => {
        if (kycReqList) {
            setBtnLoader(true);

            if (values?.dob && moment().diff(moment(values.dob), 'years') < 18) {
                setBtnLoader(false);
                setErrormsg(CREATE_KYC_ADDRESS_CONST.EXPIRY_DATE_VALIDATION_VALIDATION);
                ref?.current?.scrollTo({ y: 0, animated: true });
                return;
            }
            if (values?.docExpiryDate && values?.issueDate && moment(values.docExpiryDate).isSameOrBefore(moment(values.issueDate))) {
                setBtnLoader(false);
                setErrormsg(CREATE_KYC_ADDRESS_CONST.ISSUE_DATE_VALIDATION_VALIDATION);
                ref?.current?.scrollTo({ y: 0, animated: true });
                return;
            }
            const formattedValues = {
                ...values,
                dob: values?.dob ? moment(values.dob).format('YYYY-MM-DD') : null,
                docExpiryDate: values?.docExpiryDate ? moment(values.docExpiryDate).toISOString() : null,
                faceImage: values?.faceImage ?? null,
                signature: values?.signature ?? null,
                profilePicBack: values?.profilePicBack ?? null,
                profilePicFront: values?.profilePicFront ?? null,
                handHoldingIDPhoto: values?.handHoldingIDPhoto ?? null,
                biometric: values?.biometric ?? null,
                emergencyContactName: values?.emergencyContactName ?? "",
            };
            const applycardData = prepareKycData(formattedValues);
            let ApplyCardObj = {
                CardId: props?.route?.params?.cardId,
                kycUpdateModel: applycardData
            }
            try {
                dispatch(setApplyCardData(applycardData));
                if (props?.route?.params?.screenName === "GLOBAL_CONSTANTS.BIND_CARD_SCREEN") {
                    const response = await CardsModuleService.postQuickLinkApplyCard(ApplyCardObj)
                    if (response?.status === 200) {
                        succussRbRef?.current?.open();
                    }
                } else {
                    handleGoback();
                }

            } catch (error) {
                setBtnLoader(false);
                setErrormsg(isErrorDispaly(error));
                ref?.current?.scrollTo({ y: 0, animated: true });
            }
        }
        setBtnLoader(false);
    };
    const getListOfBeneficiaryTypes = async () => {
        try {
            const response: any = await CardsModuleService.getCoreLookups();
            if (response?.ok) {
                setData(prevState => ({
                    ...prevState,
                    beneficiaryType: response?.data?.BeneficiaryTypes
                }));

                setErrormsg("");
            } else {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(error));
        }
    };
    const selectType = (value: any, setFieldValue: any) => {
        setFormData(prevState => ({
            ...prevState,
            beneficiaryType: value,
            beneficiary: '',
            firstName: "",
            lastName: "",
            middleName: "",
            country: "",
            addressCountry:"",
            state: "",
            dob: "",
            gender: "",
            city: "",
            town: "",
            addressLine1: "",
            mobile: "",
            mobileCode: "",
            email: "",
            idType: "Passport",
            idNumber: "",
            docExpiryDate: "",
            postalCode: "",
            faceImage: "",
            signature: "",
            profilePicBack: "",
            profilePicFront: "",
            handHoldingIDPhoto: "",
            biometric: "",
            emergencyContactName: "",
            kycRequirements: "",
            idImage: null,
            address: null,
            addressId: null,
            docNumber: null,
            faceImage1: null,
            mixedPhoto: null,
            occupation: null,
            annualSalary: null,
            sourceOfIncome: null,
            accountPurpose: null,
            expectedMonthlyVolume: null,
            issueDate: null,
            addressLine2: null,
        }));
        setFieldValue('beneficiary', "");

        if (value) {
            getListBenefiary(value);
        }
    };
    const selectBeneficiary = (beneficiary: any, values: any) => {
        setFormData((prevState): any => ({
            beneficiaryType: values.beneficiaryType,
            beneficiary: beneficiary,
            ...Object.keys(prevState).reduce((acc: any, key): any => {
                if (key !== 'beneficiaryType' && key !== 'beneficiary') {
                    acc[key] = '';
                }
                return acc;
            }, {})
        }));
        const findData: any = data?.beneficiary?.find((item: any) => item?.name == beneficiary);
        if (findData) {
            getUbosDetails(findData?.id)
        }
    }
    const getListBenefiary = async (type: any) => {
        try {
            const response: any = await CardsModuleService.getBeneficiaries(type);
            if (response?.ok) {
                setData(prevState => ({
                    ...prevState,
                    beneficiary: response?.data
                }));
                setErrormsg("");
            } else {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(error));
        }
    };
    const getUbosDetails = async (id: any) => {
        try {
            const response: any = await CardsModuleService.getUbosDetails(id);
            if (response?.ok) {
                setData(prevState => ({
                    ...prevState,
                    ubosDetails: response?.data
                }));
                setFormData(prevData => ({
                    ...prevData,
                    firstName: decryptAES(response?.data?.firstName) ?? "",
                    lastName: decryptAES(response?.data?.lastName) ?? "",
                    middleName: response?.data?.middleName ?? "",
                    email: decryptAES(response?.data?.email) ?? "",
                    mobile: decryptAES(response?.data?.phoneNo || response?.data?.phoneNumber) ?? "",
                    mobileCode: decryptAES(response?.data?.phoneCode) ?? "",
                    country: response?.data?.country ?? "",
                    addressCountry: response?.data?.addressCountry ?? "",
                    city: response?.data?.city ?? "",
                    gender: response?.data?.gender ?? "",
                    dob: isUSDateFormat(response.data?.dob) && formatDateTimeDatePicker(response.data?.dob) || response.data?.dob,
                    idType: response?.data?.idType === null && "Passport" || response?.data?.idType,
                    profilePicFront: response?.data?.docDetails?.frontIdPhoto || null
                }));
                setErrormsg("");
            } else {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(error));
        }
    };
    const handleBack = () => {
        props.navigation.navigate("ApplyCard", {
            programId: props?.route?.params?.programId,
            image: props?.route?.params?.image,
            cardName: props?.route?.params?.cardName,
        })
    };
    const handleValidationSave = (validateForm: any) => {
        validateForm().then(async (a: any) => {
            if (Object.keys(a)?.length > 0) {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setErrormsg(t("GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD"));
            }
        })
    };
    useHardwareBackHandler(() => {
        props?.navigation?.goBack()
    })
    const handleGoback = () => {
        props?.navigation?.goBack()
    };
    const handleCloseError = () => {
        setErrormsg("")
    }
    const onBindSuccessDone = () => {
        succussRbRef?.current?.close();
        props?.navigation?.reset({
            index: 0,
            routes: [{
                name: 'Dashboard',
                params: { initialTab: "GLOBAL_CONSTANTS.CARDS" },
                animation: 'slide_from_left'
            }],
        });
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {applyCardsLoading && (
                <View style={[commonStyles.flex1]}>
                    <DashboardLoader />
                </View>
            )}
            {!applyCardsLoading && <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={s(64)}
            >
                <ScrollViewComponent
                    ref={ref}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    style={[commonStyles.flex1, commonStyles.screenBg]}

                >
                    <Container style={commonStyles.container}>

                        <View>

                            {!applyCardsLoading &&


                                <View style={[]}>

                                    <PageHeader title={"GLOBAL_CONSTANTS.COMPLETE_KYC"} onBackPress={handleGoback} />
                                    {errormsg && (<ErrorComponent message={errormsg} onClose={handleCloseError} />)}


                                </View>
                            }
                        </View>

                        <Formik
                            initialValues={formData}
                            enableReinitialize
                            validationSchema={Yup.lazy((values) => generateValidationSchema(kycReqList, values))}
                            onSubmit={handleSaveKycData}
                            validateOnBlur={false} // Keep this as true
                            validateOnChange={true}
                        >
                            {(formik) => {
                                const { touched, handleChange, handleSubmit, errors, handleBlur, setFieldValue, values, validateForm, setFieldError } =
                                    formik;

                                return (
                                    <>
                                        {(kycReqList?.length > 0 && userInfo?.accountType == CARDS_CONST.BUSINESS) &&
                                            <View>
                                                <Field
                                                    modalTitle={"GLOBAL_CONSTANTS.SELECT_ROLE_FOR_KYC"}
                                                    activeOpacity={0.9}
                                                    style={{ backgroundColor: 'NEW_COLOR.SCREENBG_WHITE', borderColor: 'NEW_COLOR.SEARCH_BORDER' }}
                                                    label={"GLOBAL_CONSTANTS.SELECT_ROLE_FOR_KYC"}
                                                    customContainerStyle={{}}
                                                    name={'beneficiaryType'}
                                                    onChange={(item: any) => selectType(item, setFieldValue)}
                                                    error={errors.beneficiaryType}
                                                    handleBlur={handleBlur}
                                                    data={data?.beneficiaryType}
                                                    placeholder={"GLOBAL_CONSTANTS.SELECT_ROLE_FOR_KYC"}
                                                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                    component={CustomPicker}
                                                />
                                                <View style={commonStyles.formItemSpace} />
                                                <Field
                                                    modalTitle={"GLOBAL_CONSTANTS.SELECT_INDIVIDUAL_TO_VERIFY"}
                                                    activeOpacity={0.9}
                                                    style={{ backgroundColor: 'NEW_COLOR.SCREENBG_WHITE', borderColor: 'NEW_COLOR.SEARCH_BORDER' }}
                                                    label={"GLOBAL_CONSTANTS.SELECT_INDIVIDUAL_TO_VERIFY"}
                                                    touched={touched.beneficiary}
                                                    customContainerStyle={{}}
                                                    name={'beneficiary'}
                                                    onChange={(item: any) => selectBeneficiary(item, values)}
                                                    error={errors.beneficiary}
                                                    handleBlur={handleBlur}
                                                    data={data?.beneficiary}
                                                    placeholder={"GLOBAL_CONSTANTS.SELECT_INDIVIDUAL_TO_VERIFY"}
                                                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                    component={CustomPicker}
                                                    Children={<LabelComponent text=" *" style={commonStyles.textError} />}
                                                />
                                                <View style={commonStyles.formItemSpace} />
                                            </View>}
                                        {kycReqList?.length > 0 && (
                                            <KycFields touched={touched}
                                                errors={errors}
                                                handleBlur={handleBlur}
                                                values={values}
                                                setFieldValue={setFieldValue}
                                                handleChange={handleChange}
                                                kycReqList={kycReqList}
                                                handleCloseKyc={props.closeModal}
                                                setErrors={setFieldError}
                                                cardId={props?.route?.params?.cardId}
                                                keyRequirements={keyRequirements}
                                                formData={formData} />

                                        )}
                                        <View style={[commonStyles.mt24]} />
                                        <ButtonComponent
                                            title={props?.route?.params?.screenName == FORM_DATA_CONSTANTS.BIND_CARD_SCREEN ? "GLOBAL_CONSTANTS.SUBMIT" : "GLOBAL_CONSTANTS.NEXT"}
                                            disable={undefined}
                                            loading={btnLoader}
                                            onPress={() => {
                                                handleValidationSave(validateForm)
                                                handleSubmit();
                                            }}
                                        />
                                        <View style={[commonStyles.mb43]} />
                                    </>
                                );
                            }}
                        </Formik>

                    </Container>


                </ScrollViewComponent>
                <CustomRBSheet
                    refRBSheet={succussRbRef}
                    height={s(400)}
                    draggable={false} closeOnPressMask={false}
                >
                    <BindCardSuccess onDone={onBindSuccessDone} ref={succussRbRef} />

                </CustomRBSheet>
            </KeyboardAvoidingView>}

        </ViewComponent>
    );
};

export default KycForm;
const styles = StyleSheet.create({
    opacity6: { opacity: 0.6, },
});

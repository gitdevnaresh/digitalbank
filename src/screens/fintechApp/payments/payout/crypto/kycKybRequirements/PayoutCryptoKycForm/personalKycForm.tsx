import React, { useEffect, useState, useRef } from "react";
import { Modal, KeyboardAvoidingView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {  Formik } from 'formik';
import DashboardLoader from "../../../../../../../components/loader"
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import PersonalKycFormFields from './PersonalKycFormFields';
import CreateAccountService from "../../../../../../../apiServices/createAccount";
import ScrollViewComponent from "../../../../../../../newComponents/scrollView/scrollView";
import { s } from "../../../../../../../newComponents/theme/scale";
import { getThemedCommonStyles } from "../../../../../../../components/CommonStyles";
import Container from "../../../../../../../newComponents/container/container";
import { useThemeColors } from "../../../../../../../hooks/useThemeColors";
import PageHeader from "../../../../../../../newComponents/pageHeader/pageHeader";
import ViewComponent from "../../../../../../../newComponents/view/view";
import PaymentService from "../../../../../../../apiServices/payments";
import { isErrorDispaly } from "../../../../../../../utils/helpers";
import useEncryptDecrypt from "../../../../../../../hooks/encDecHook";
import PayoutAddressForm from "../PayoutAddressForm";
import ButtonComponent from "../../../../../../../newComponents/buttons/button";
import SafeAreaViewComponent from "../../../../../../../newComponents/safeArea/safeArea";
import ErrorComponent from "../../../../../../../newComponents/errorDisplay/errorDisplay";
import { useLngTranslation } from "../../../../../../../hooks/useLngTranslation";
import { showAppToast } from "../../../../../../../newComponents/toasterMessages/ShowMessage";
import CardsModuleService from "../../../../../../../apiServices/card";
import { KYB_INFO_CONSTANTS } from "../../../../../onboarding/kybInformation/constants";
import { createPersonalKycValidationSchema } from "../validations/kybValidations";
import ProfileService from "../../../../../../../apiServices/profile";
import { getFileExtension, verifyFileTypes } from "../../../../../onboarding/constants";
import { 
    KycFormData, 
    KycRequirements, 
    KycFormDetailsResponse, 
    AddressItem, 
    PhoneCodeItem, 
    FileNames, 
    ImagesLoader, 
    ReduxState, 
    PersonalKycFormProps, 
    AddressObject,
    PhoneCodeData,
    AddressData,
    LookupData,
}  from "../../../interface";
import useCountryData from "../../../../../../../hooks/useCountryData";

interface ReactNativeFile {
    uri: string;
    type: string;
    name: string;
}

const PersonalKycForm = (props: PersonalKycFormProps) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const scrollRef = useRef<any>(null);
    const { t } = useLngTranslation();
    const { encryptAES } = useEncryptDecrypt();
    const userInfo = useSelector((state: ReduxState) => state.userReducer?.userDetails);
    const [kycRequirements, setKycRequirements] = useState<KycRequirements>();
    const [Lookups, setLookups] = useState<LookupData>();
    const [error, setError] = useState<string | undefined>();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [addressesList, setAddressesList] = useState<AddressItem[]>([]);
    const [imagesLoader, setImagesLoader] = useState<ImagesLoader>({ frontId: false, backId: false });
    const [fileNames, setFileNames] = useState<FileNames>({ frontId: null, backId: null });
    const { phoneCodePickerData, loading: countryLoading, error: countryError, clearCache } = useCountryData({ loadPhoneCodes: true });
        const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const [formData, setFormData] = useState<KycFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        phoneCode: '',
        birthDate: '',
        occupation: '',
        country: '',
        address: '',
        docType: '',
        docNumber: '',
        expiryDate: '',
        frontId: '',
        backId: ''
    });
    const validationSchema = createPersonalKycValidationSchema(t);
    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    getLookups(),
                    Addresses(),
                    props?.route?.params?.VaultData?.productId ? PayoutKycRequirements() : Promise.resolve(),
                    props?.route?.params?.VaultData?.productId ? getKycFormDetails() : Promise.resolve()
                ]);
            } finally {
                setLoading(false);
            }
        };
        initializeData();
    }, [props?.route?.params?.VaultData?.productId]);
    const handleBack = () => {
        navigation.navigate("PayOutList", {
            animation: "slide_from_left",
            initialTab: 1
        });
    };
    const Addresses = async () => {
        try {
            const response = await PaymentService.kycAddresses();
            if (response.ok) {
                const filterData = (response.data as AddressData[]).map((item: AddressData) => ({
                    ...item,
                    name: item.favoriteName
                }));
                setAddressesList(filterData);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    };
    const PayoutKycRequirements = async () => {
        try {
            const response = await PaymentService.kycRequirements(props?.route?.params?.VaultData?.productId);
            if (response.ok) {
                setKycRequirements(response.data as KycRequirements);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    };
    const getKycFormDetails = async () => {
        try {
            const response = await PaymentService.getKycFormDetails();
            if (response.ok) {
                bindKycData(response.data as KycFormDetailsResponse);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    };
    const bindKycData = (kycData: KycFormDetailsResponse) => {
        if (kycData?.sections) {
            const personalInfo = kycData.sections.PersonalInformation;
            const address = kycData.sections.Address?.[0];
            const identificationDoc = kycData.sections.IdentificationDocuments?.[0];

            const newFormData = {
                firstName: personalInfo?.firstName || '',
                lastName: personalInfo?.lastName || '',
                email: personalInfo?.email || '',
                phoneNumber: personalInfo?.phoneNumber || '',
                phoneCode: personalInfo?.phoneCode||'',
                birthDate: personalInfo?.dateOfBirth || '',
                occupation: '',
                country: address?.country || '',
                address: address?.favoriteName || '',
                docType: identificationDoc?.documentType || '',
                docNumber: identificationDoc?.documentNumber || '',
                expiryDate: identificationDoc?.expiryDate || '',
                frontId: identificationDoc?.frontDoc || '',
                backId: identificationDoc?.backDoc || ''
            };
            setFormData(newFormData);
            if (identificationDoc?.frontDoc) {
                setFileNames((prev: FileNames) => ({ ...prev, frontId: identificationDoc?.frontDoc?.split('/')?.pop() || '' }));
            }
            if (identificationDoc?.backDoc) {
                setFileNames((prev: FileNames) => ({ ...prev, backId: identificationDoc?.backDoc?.split('/')?.pop() || '' }));
            }
        }
    };
    const getLookups = async () => {
        try {
            const response = await PaymentService?.paymentsLookups();
            if (response.ok) {
                setLookups(response.data as LookupData);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    };
    const handleError = () => {
        setError(undefined);
        if (countryError) {
            clearCache();
        }
    };
    
    const handlePhoneCode = (item: PhoneCodeItem, setFieldValue: (field: string, value: string) => void) => {
        setFieldValue('phoneCode', item?.code);
    };
    const handleAddAddress = () => {
        setAddressModalVisible(true);
    };
    const handleCloseAddressModal = () => {
        setAddressModalVisible(false);
    };
    const handleAddressSubmit = async (addressObject: AddressObject) => {
        try {
            const obj = {
                id: KYB_INFO_CONSTANTS.GUID_FORMATE,
                customerId: userInfo?.id,
                favoriteName: addressObject?.favoriteName?.trim(),
                addressType: addressObject?.addressType?.trim() || "",
                country: addressObject?.country,
                state: addressObject?.state?.trim() || "",
                city: addressObject?.city?.trim(),
                addressLine1: addressObject?.addressLine1?.trim(),
                addressLine2: addressObject?.addressLine2?.trim(),
                postalCode: encryptAES(addressObject?.postalCode),
                phoneNumber: encryptAES(addressObject?.phoneNumber),
                phoneCode: encryptAES(addressObject?.phoneCode),
                email: encryptAES(addressObject?.email),
                isDefault: addressObject?.isDefault || false,
                createdBy: userInfo?.userName,
                town: addressObject?.town,
                createdDate: new Date(),
            };
            const response = await CardsModuleService.cardsAddressPost(obj);
            if (response.ok) {
                showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_ADDED"), 'success');
                setAddressModalVisible(false);
                await Addresses();
            }
            return response;
        } catch (error) {
            return error;
        }
    };
    const uploadFileToServer = async (uri: string, type: string, fileName: string, fileExtension: string, item: string, setFieldValue: (field: string, value: string) => void) => {
        setImagesLoader((prevState: ImagesLoader) => ({ ...prevState, [item]: true }));
        try {
            const formData = new FormData();
            const fileObject: ReactNativeFile = {
                uri: uri,
                type: `${type}/${fileExtension}`,
                name: fileName,
            };
            formData.append('document', fileObject as unknown as Blob);
            
            const uploadRes = await ProfileService.uploadFile(formData);
            if (uploadRes.status === 200) {
                const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                setFieldValue(item, uploadedImage);
                setFileNames((prev: FileNames) => ({ ...prev, [item]: fileName }));
                setError(undefined);
            } else {
                setError(isErrorDispaly(uploadRes));
                scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
            }
        } catch (error) {
            setError(isErrorDispaly(error));
            scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
        } finally {
            setImagesLoader((prevState: ImagesLoader) => ({ ...prevState, [item]: false }));
        }
    };
    const handleUploadImg = async (
        item: string,
        setFeilds: (field: string, value: string) => void,
        pickerOption?: 'camera' | 'library' | 'documents'
    ) => {
        try {
            if (pickerOption === 'documents') {
                await new Promise(resolve => setTimeout(resolve, 200));
                const result = await DocumentPicker.getDocumentAsync({
                    type: ['image/*', 'application/pdf'],
                    copyToCacheDirectory: true,
                });
                if (result.canceled) return;
                const selectedFile = result.assets[0];
                const { uri, mimeType, name, size } = selectedFile;
                const fileName = name || uri?.split('/')?.pop() || `file_${Date.now()}`;
                // Check file size (15MB limit)
                const fileSizeMB = size ? size / (1024 * 1024) : 0;
                if (fileSizeMB > 15) {
                    setError(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                    requestAnimationFrame(() => {
                        scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
                    });
                    return;
                }
                // Validate file type
                const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
                const isImage = mimeType?.startsWith('image/') || verifyFileTypes(fileName);
                
                if (!isPdf && !isImage) {
                    setError(t('GLOBAL_CONSTANTS.ONLY_IMAGES_AND_PDF_FILES_ARE_ACCEPTED'));
                    requestAnimationFrame(() => {
                        scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
                    });
                    return;
                }

                setFileNames((prevState: FileNames) => ({ ...prevState, [item]: fileName }));

                const fileExtension = fileName?.split('.')?.pop()?.toLowerCase() || 'pdf';
                const type = isPdf ? 'application' : 'image';

                await uploadFileToServer(uri, type, fileName, fileExtension, item, setFeilds);
                return;
            }
            const permissionResult = pickerOption === 'camera'
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert("Permission Denied", "You need to enable permissions to use this feature.");
                return;
            }
            const result = pickerOption === 'camera'
                ? await ImagePicker.launchCameraAsync({ allowsEditing: false, aspect: [1, 1], quality: 0.5 })
                : await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: false, aspect: [1, 1], quality: 0.5, cameraType: ImagePicker.CameraType.front });
            if (result.canceled) return;
            const selectedImage = result.assets[0];
            const { uri, type } = selectedImage;
            const fileName = selectedImage?.fileName || uri?.split('/')?.pop() || `image_${Date.now()}.jpg`;
            const fileExtension = getFileExtension(selectedImage?.uri);
            if (!verifyFileTypes(fileName)) {
                setError(KYB_INFO_CONSTANTS.ACCEPT_IMG_MSG);
                requestAnimationFrame(() => {
                    scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
                });
                return;
            }
            // Check file size (15MB limit)
            const fileSizeMB = selectedImage?.fileSize ? selectedImage?.fileSize / (1024 * 1024) : 0;
            if (fileSizeMB > 15) {
                setError(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                requestAnimationFrame(() => {
                    scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
                });
                return;
            }

            setFileNames((prevState: FileNames) => ({ ...prevState, [item]: fileName }));

            if (uri && type && fileExtension) {
                await uploadFileToServer(uri, type, fileName, fileExtension, item, setFeilds);
            }
        } catch (err) {
            scrollRef?.current?.scrollTo?.({ y: 0, animated: true });
            setError(isErrorDispaly(err));
        } finally {
            setImagesLoader((prevState: ImagesLoader) => ({ ...prevState, [item]: false }));
        }
    };

    const handleSubmit = async (values: KycFormData) => {
        setIsSubmitting(true);
        try {
            const kycObject = {
                kyc: {
                    requirement: kycRequirements?.kyc?.requirement || "",
                    fullName: {
                        firstName: encryptAES(values.firstName),
                        lastName: encryptAES(values.lastName)
                    },
                    basic: {
                        dob: values.birthDate,
                        email: encryptAES(values.email),
                        phoneCode: encryptAES(values.phoneCode),
                        phoneNo: encryptAES(values.phoneNumber),
                        occupation: values.occupation
                    },
                    addressDto: {
                        addressId: addressesList?.find(addr => addr?.name === values?.address)?.id || values?.address
                    },
                    kycpfc: {
                        documentType: values.docType?.toLowerCase(),
                        documentNumber: values.docNumber,
                        documentFront: values.frontId,
                        documentBack: values.backId
                    }
                }
            };

            const response = await PaymentService.saveKycDetails(kycObject);
            
            if (response.ok) {
                navigation.navigate("PaymentPending")
            } else {
                setError(isErrorDispaly(response));
                scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
            }
        } catch (error) {
            setError(isErrorDispaly(error));
            scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigation.navigate("PayOutList", {
            animation: "slide_from_left",
            initialTab: 1
        });
    };

    const handleFormSubmit = (values: KycFormData, setTouched: (touched: Record<string, boolean>) => void) => {
        validationSchema.validate(values, ).then(() => {
            handleSubmit(values);
        }).catch(() => {
            setError(t('GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD'));
            // Mark all fields as touched to show errors
            const touchedFields = Object.keys(formData).reduce((acc: Record<string, boolean>, key) => {
                acc[key] = true;
                return acc;
            }, {});
            setTouched(touchedFields);
            // Scroll to top to show error
            scrollRef?.current?.scrollTo?.({ x: 0, y: 0, animated: true });
        });
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <PageHeader
                    title={"GLOBAL_CONSTANTS.KYC_REQUIREMENTS"}
                    onBackPress={handleBack}
                />
                {(loading || countryLoading) && <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <DashboardLoader/>
                </SafeAreaViewComponent>}
                {!(loading || countryLoading) && <Formik
                    initialValues={formData}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                    validateOnChange={true}
                    validateOnBlur={true}
                >
                    {({ touched, errors, handleBlur, values, setFieldValue, setTouched }) => {
                        return (
                            <KeyboardAvoidingView 
                                style={{ flex: 1 }} 
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                keyboardVerticalOffset={s(64)}
                            >
                                <ScrollViewComponent
                                    ref={scrollRef}
                                    contentContainerStyle={{ flexGrow: 1 }}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                >
                                <ViewComponent>
                                    {(error || countryError) && <ErrorComponent message={error || countryError || ''} onClose={handleError} />}
                                    <ViewComponent style={[commonStyles.titleSectionGap]} />

                                    <PersonalKycFormFields
                                        touched={touched}
                                        errors={errors}
                                        handleBlur={handleBlur}
                                        values={values}
                                        setFieldValue={setFieldValue}
                                        Lookups={Lookups}
                                        addressesList={addressesList}
                                        imagesLoader={imagesLoader}
                                        fileNames={fileNames}
                                        setFileNames={setFileNames}
                                        handleUploadImg={handleUploadImg}
                                        handleAddAddress={handleAddAddress}
                                        maxDate={maxDate}
                                        commonStyles={commonStyles}
                                        NEW_COLOR={NEW_COLOR}
                                        t={t}
                                        kycRequirements={kycRequirements}
                                        countryCodelist={phoneCodePickerData}
                                        handlePhoneCode={handlePhoneCode}
                                    />

                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.CONTINUE"}
                                        loading={isSubmitting}
                                        disable={isSubmitting}
                                        onPress={() => handleFormSubmit(values, setTouched)}
                                    />
                                    <ViewComponent style={[commonStyles.buttongap]} />
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.CANCEL"}
                                        solidBackground={true}
                                        onPress={handleCancel}
                                    />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.sectionGap]} />
                                </ScrollViewComponent>
                            </KeyboardAvoidingView>
                        );
                    }}
                </Formik>}
            </Container>
            <Modal
                animationType="slide"
                transparent={false}
                visible={addressModalVisible}
                onRequestClose={handleCloseAddressModal}
            >
                <PayoutAddressForm
                    onClose={handleCloseAddressModal}
                    onSubmit={handleAddressSubmit}
                />
            </Modal>
        </ViewComponent>
    );
};
export default PersonalKycForm;

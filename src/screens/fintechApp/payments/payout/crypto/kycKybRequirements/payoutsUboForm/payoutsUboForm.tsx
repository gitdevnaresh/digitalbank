import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { getThemedCommonStyles } from "../../../../../../../components/CommonStyles";
import Container from "../../../../../../../newComponents/container/container";
import { useThemeColors } from "../../../../../../../hooks/useThemeColors";
import PageHeader from "../../../../../../../newComponents/pageHeader/pageHeader";
import ViewComponent from "../../../../../../../newComponents/view/view";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { isErrorDispaly, formatDateTimeAPI } from "../../../../../../../utils/helpers";
import UboFormComponent from "../../../../../../../newComponents/common/UboFormFields";
import ButtonComponent from "../../../../../../../newComponents/buttons/button";
import ErrorComponent from "../../../../../../../newComponents/errorDisplay/errorDisplay";
import CreateAccountService from "../../../../../../../apiServices/createAccount";
import ProfileService from "../../../../../../../apiServices/profile";
import * as ImagePicker from 'expo-image-picker';
import { getFileExtension, verifyFileTypes } from "../../../../../onboarding/constants";
import CustomPickerNonFormik from "../../../../../../../newComponents/pickerComponents/basic/customPickerNonFormik";
import useEncryptDecrypt from "../../../../../../../hooks/encDecHook";
import PaymentService from "../../../../../../../apiServices/payments";
import DashboardLoader from "../../../../../../../components/loader"
import { useLngTranslation } from "../../../../../../../hooks/useLngTranslation";
import SafeAreaViewComponent from "../../../../../../../newComponents/safeArea/safeArea";


interface PayoutUboFormProps {
    onClose: () => void;
    onSubmit: (uboObject: any) => void;
    editingUbo?: any;
    isEditMode?: boolean;
    selectedProgramId?:string;
}

const PayoutUboForm: React.FC<PayoutUboFormProps> = ({ onClose, onSubmit, editingUbo, isEditMode,selectedProgramId }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const [countryCodelist, setCountryCodelist] = useState<any[]>([]);
    const [countryList, setCountryList] = useState<any[]>([]);
    const [documentTypesLookUp, setDocumentTypesLookUp] = useState<any[]>([]);
    const [imagesLoader, setImagesLoader] = useState<{ frontId: boolean; backImgId: boolean }>({ frontId: false, backImgId: false });
    const [fileNames, setFileNames] = useState<{ frontId: string | null; backImgId: string | null }>({ frontId: null, backImgId: null });
    const [formActions, setFormActions] = useState<{ validateForm: () => Promise<any>; setTouched: (touched: any) => void; handleSubmit: () => void; setFieldValue: (field: string, value: any) => void } | null>(null);
    const [btnLoading, setBtnLoading] = useState(false);
    const [uboError, setUboError] = useState<string | null>(null);
    const scrollRef = useRef<any>(null);
    const today = new Date();
    const [benificiaryList, setBeneficiariesList] = useState<any[]>([]);
    const [uboDetails, setUbodetails] = useState<any>();
    const [selectedUbo, setSelectedUbo] = useState<any>();
    const [uboDetailsLoading, setDetailsLoading] = useState<boolean>(false);
    const [kycRequirements, setKycRequirements] = useState<any>();
    const [filteredDocumentTypes, setFilteredDocumentTypes] = useState<any[]>([]);
    const { decryptAES } = useEncryptDecrypt();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const { t } = useLngTranslation();
    const [uboInitValues, setUboInitValues] = useState<any>({
        firstName: "",
        lastName: "",
        middleName: '',
        uboPosition: "Shareholder",
        dob: '',
        shareHolderPercentage: "",
        phoneCode: '',
        phoneNumber: "",
        note: "",
        frontId: '',
        backImgId: '',
        docType: '',
        docDetailsid: '',
        country: '',
        email: '',
        docNumber: '',
        docExpireDate: ''
    });

    useEffect(() => {
        getListOfCountryCodeDetails();
        fetchDocumentTypes();
        fetchBenificiaryList();
        getKycRequirements();
        setSelectedUbo(null)
    }, []);
    useEffect(() => {
        if (uboDetails) {
            const safeDecrypt = (value: any) => {
                if (!value) return '';
                try {
                    const decrypted = decryptAES(value);
                    return decrypted || value;
                } catch {
                    return value;
                }
            };

            const newInitValues = {
                firstName: safeDecrypt(uboDetails.firstName) || "",
                lastName: safeDecrypt(uboDetails.lastName) || "",
                middleName: uboDetails.middleName || '',
                uboPosition: uboDetails.uboPosition || "Shareholder",
                dob: uboDetails.dob || '',
                shareHolderPercentage: uboDetails.shareHolderPercentage?.toString() || "",
                phoneCode: safeDecrypt(uboDetails.phoneCode) || '',
                phoneNumber: safeDecrypt(uboDetails.phoneNumber) || "",
                note: uboDetails.note || "",
                frontId: uboDetails.docDetails?.frontImage || uboDetails.docDetails?.frontIdPhoto || '',
                backImgId: uboDetails.docDetails?.backImage || '',
                docType: uboDetails.docDetails?.type || uboDetails.docDetails?.docType || '',
                docDetailsid: uboDetails.docDetails?.id || '',
                country: uboDetails.country || '',
                email: safeDecrypt(uboDetails.email) || '',
                docNumber: uboDetails.docDetails?.docNumber || '',
                docExpireDate: uboDetails.docDetails?.docExpiryDate || uboDetails.docDetails?.docExpireDate || ''
            };
            setUboInitValues(newInitValues);

            // Set file names if images exist
            const frontImage = uboDetails.docDetails?.frontImage || uboDetails.docDetails?.frontIdPhoto;
            const backImage = uboDetails.docDetails?.backImage || uboDetails.docDetails?.backDocImage;

            if (frontImage) {
                setFileNames(prev => ({
                    ...prev,
                    frontId: frontImage.split('/').pop() || 'existing_front_image'
                }));
            }
            if (backImage) {
                setFileNames(prev => ({
                    ...prev,
                    backImgId: backImage.split('/').pop() || 'existing_back_image'
                }));
            }
        } else if (isEditMode && editingUbo) {
            const safeDecrypt = (value: any) => {
                if (!value) return '';
                try {
                    const decrypted = decryptAES(value);
                    return decrypted || value;
                } catch {
                    return value;
                }
            };

            const newInitValues = {
                firstName: editingUbo.firstName || safeDecrypt(editingUbo.firstname) || "",
                lastName: editingUbo.lastName || safeDecrypt(editingUbo.lastname) || "",
                middleName: editingUbo.middleName || '',
                uboPosition: editingUbo.uboPosition || "Shareholder",
                dob: editingUbo.dob || '',
                shareHolderPercentage: editingUbo.shareHolderPercentage?.toString() || "",
                phoneCode: safeDecrypt(editingUbo.phoneCode) || '',
                phoneNumber: safeDecrypt(editingUbo.phoneNumber) || "",
                note: editingUbo.note || "",
                frontId: editingUbo.docDetails?.frontImage || editingUbo.docDetails?.frontIdPhoto || '',
                backImgId: editingUbo.docDetails?.backImage || '',
                docType: editingUbo.docDetails?.type || editingUbo.docDetails?.docType || '',
                docDetailsid: editingUbo.docDetails?.id || '',
                country: editingUbo.country || '',
                email: safeDecrypt(editingUbo.email) || '',
                docNumber: editingUbo.docDetails?.docNumber || '',
                docExpireDate: editingUbo.docDetails?.docExpiryDate || editingUbo.docDetails?.docExpireDate || ''
            };
            setUboInitValues(newInitValues);

            // Set file names if images exist
            const frontImage = editingUbo.docDetails?.frontImage || editingUbo.docDetails?.frontIdPhoto;
            const backImage = editingUbo.docDetails?.backImage || editingUbo.docDetails?.backDocImage;

            if (frontImage) {
                setFileNames(prev => ({
                    ...prev,
                    frontId: frontImage.split('/').pop() || 'existing_front_image'
                }));
            }
            if (backImage) {
                setFileNames(prev => ({
                    ...prev,
                    backImgId: backImage.split('/').pop() || 'existing_back_image'
                }));
            }
        } else {
            // Reset to empty values for add mode
            setUboInitValues({
                firstName: "",
                lastName: "",
                middleName: '',
                uboPosition: "Shareholder",
                dob: '',
                shareHolderPercentage: "",
                phoneCode: '',
                phoneNumber: "",
                note: "",
                frontId: '',
                backImgId: '',
                docType: '',
                docDetailsid: '',
                country: '',
                email: '',
                docNumber: '',
                docExpireDate: ''
            });
        }
    }, [isEditMode, editingUbo, decryptAES, uboDetails]);

    // Filter document types when initial values change (for edit mode)
    useEffect(() => {
        if (uboInitValues.country && kycRequirements) {
            const filtered = getFilteredDocumentTypes(uboInitValues.country);
            setFilteredDocumentTypes(filtered);
        }
    }, [uboInitValues.country, kycRequirements, documentTypesLookUp]);

    const getListOfCountryCodeDetails = async () => {
        try {
            const response: any = await CreateAccountService.getAddressLooupDetails();
            if (response?.ok) {
                setCountryCodelist(response?.data?.PhoneCodes ?? []);
            } else {
                setUboError(isErrorDispaly(response));
            }
        } catch (error) {
            setUboError(isErrorDispaly(error));
        }
    };
    const fetchBenificiaryList = async () => {
        try {
            const response: any = await PaymentService.kycBenificiariesList();
            if (response.ok) {
                setBeneficiariesList(response.data)
            }
            else {
                setUboError(isErrorDispaly(response))
            }
        }
        catch (error) {
            setUboError(isErrorDispaly(error))
        }
    }
    const getUbodetails = async (id: any) => {
        setDetailsLoading(true);
        try {
            const response: any = await PaymentService.uboDetails(id)
            if (response) {
                setUbodetails(response?.data)
            }
            else {
                setUboError(isErrorDispaly(response.data))
            }
        }
        catch (error) {
            setUboError(isErrorDispaly(error))
        }
        finally {
            setDetailsLoading(false);
        }
    }
  const getKycRequirements = async () => {
        if (!selectedProgramId) return;
        setDetailsLoading(true);
        try {
            const response: any = await PaymentService.selectedPayoutCryptokycrequirements(selectedProgramId)
            if (response) {
                setKycRequirements(response?.data)
            }
            else {
                setUboError(isErrorDispaly(response.data))
            }
        }
        catch (error) {
            setUboError(isErrorDispaly(error))
        }
        finally {
            setDetailsLoading(false);
        }
    }
  

    const fetchDocumentTypes = async () => {
        try {
            const response: any = await ProfileService.getDocumentTypes();
            if (response?.ok) {
                setDocumentTypesLookUp(response?.data?.KycDocumentTypes || []);
                setCountryList(response?.data?.countryWithTowns || []);
            } else {
                setUboError(isErrorDispaly(response));
            }
        } catch (error) {
            setUboError(isErrorDispaly(error));
        }
    };

    const getFilteredDocumentTypes = (selectedCountry: string) => {
        if (!selectedCountry || !kycRequirements?.kyb?.uboDocuments) {
            return documentTypesLookUp;
        }

        const uboDocuments = kycRequirements.kyb.uboDocuments;
        
        // Find country-specific requirement
        const countryRequirement = uboDocuments.find((doc: any) => 
            doc.countries && doc.countries.split(',').map((c: string) => c.trim()).includes(selectedCountry)
        ) || uboDocuments.find((doc: any) => doc.countries === 'Default');
        
        if (countryRequirement && countryRequirement.kycrequirements) {
            const requiredDocTypes = countryRequirement.kycrequirements.split(',').map((type: string) => type.trim());
            
            const filtered = documentTypesLookUp.filter(doc => 
                requiredDocTypes.some((reqType: string) => 
                    reqType.toUpperCase() === doc.code.toUpperCase()
                )
            );
            return filtered;
        }
        
        return documentTypesLookUp;
    };

    const handleCountryChange = (country: string) => {
        const filtered = getFilteredDocumentTypes(country);
        setFilteredDocumentTypes(filtered);
        
        // Clear document type when country changes using Formik's setFieldValue
        if (formActions?.setFieldValue) {
            formActions.setFieldValue('docType', '');
            formActions.setFieldValue('docExpireDate', '');
            formActions.setFieldValue('frontId', '');
            formActions.setFieldValue('backImgId', '');
             formActions.setFieldValue('docNumber', '');
        }
        
        // Clear file names
        setFileNames({ frontId: null, backImgId: null });
    };

    const handleUploadImg = async (
        item: string,
        setFields: (field: string, value: any) => void,
        pickerOption?: 'camera' | 'library'
    ) => {
        try {
            const permissionResult =
                pickerOption === 'camera'
                    ? await ImagePicker.requestCameraPermissionsAsync()
                    : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert("Permission Denied", "You need to enable permissions to use this feature.");
                return;
            }
            const result =
                pickerOption === 'camera'
                    ? await ImagePicker.launchCameraAsync({ allowsEditing: false, aspect: [1, 1], quality: 0.5 })
                    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, aspect: [1, 1], quality: 0.5 });

            if (!result.canceled) {
                const selectedImage = result.assets[0];
                const { uri, type } = selectedImage;
                const fileName = selectedImage.fileName || uri.split('/').pop() || `image_${Date.now()}.jpg`;
                const fileExtension = getFileExtension(selectedImage.uri);
                const isValidFileType = verifyFileTypes(fileName);

                if (!isValidFileType) {
                    setUboError("Please select a valid image file");
                    return;
                }

                setFileNames(prevState => ({
                    ...prevState,
                    [item]: fileName
                }));

                if (uri) {
                    setImagesLoader(prevState => ({
                        ...prevState,
                        [item]: true
                    }));
                    // Simulate upload - just set the URI for demo
                    setTimeout(() => {
                        setFields(item, uri);
                        setImagesLoader(prevState => ({
                            ...prevState,
                            [item]: false
                        }));
                    }, 1000);
                }
            }
        } catch (err) {
            setUboError(isErrorDispaly(err));
            setImagesLoader(prevState => ({
                ...prevState,
                [item]: false
            }));
        }
    };

    const deleteImage = (fileName: string, setFieldValue: (field: string, value: any) => void) => {
        setFieldValue(fileName, '');
        setFileNames(prevState => ({
            ...prevState,
            [fileName]: null
        }));
    };

    const handleUboSubmit = (values: any) => {
        setBtnLoading(true);
        const uboObject = {
            firstName: values?.firstName,
            lastName: values?.lastName,
            middleName: values?.middleName,
            uboPosition: values?.uboPosition,
            dob: formatDateTimeAPI(values?.dob),
            shareHolderPercentage: values?.shareHolderPercentage,
            phoneCode: values?.phoneCode,
            phoneNumber: values?.phoneNumber,
            note: values?.note,
            country: values?.country,
            email: values?.email,
            docDetails: {
                frontImage: values?.frontId || '',
                backImage: values?.backImgId || '',
                type: values?.docType || '',
                docNumber: values?.docNumber || "",
                docExpiryDate: values?.docExpireDate || ""
            }
        };

        setTimeout(() => {
            setBtnLoading(false);
            onSubmit(uboObject);
        }, 1000);
    };

    const handleValidationSave = async () => {
        if (!formActions?.validateForm || !formActions?.handleSubmit) return;

        const errors = await formActions.validateForm();
        if (Object.keys(errors).length > 0) {
            const touchedFields = Object.keys(uboInitValues).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {} as any);
            formActions.setTouched(touchedFields);
            setUboError(t('GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD'));
            setTimeout(() => {
                if (scrollRef?.current?.scrollTo) {
                    scrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
                }
            }, 100);
        } else {
            formActions.handleSubmit();
        }
    };

    const handleUboError = useCallback(() => {
        setUboError(null);
    }, []);

    const handleSelectBenificiary = (selected: any) => {
        setSelectedUbo(selected)
        // Reset form state when switching beneficiaries
        setUboError(null);
        if (selected?.id) {
            getUbodetails(selected?.id)
        } else {
            // Clear ubo details if no selection
            setUbodetails(null);
        }
    }

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
             {uboDetailsLoading && (
                             <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                                <DashboardLoader />
                            </SafeAreaViewComponent>
                        )}
            {!uboDetailsLoading&&<Container style={commonStyles.container}>
                <PageHeader
                    title={isEditMode ? "GLOBAL_CONSTANTS.EDIT_UBO" : "GLOBAL_CONSTANTS.ADD_UBO"}
                    onBackPress={onClose}
                />           
                <KeyboardAwareScrollView
                    ref={scrollRef}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                >
                    <ViewComponent>
                        {uboError && <ErrorComponent message={uboError} onClose={handleUboError} />}
                        <ViewComponent style={[commonStyles.titleSectionGap]} />

                      {  !uboDetailsLoading&&<CustomPickerNonFormik
                            label="GLOBAL_CONSTANTS.BENFICIARY"
                            placeholder="GLOBAL_CONSTANTS.SELECT_BENEFICIARIES"
                            data={benificiaryList || []}
                            value={selectedUbo?.name}
                            onChange={(selected) => {
                                handleSelectBenificiary(selected)
                            }}
                            modalTitle="GLOBAL_CONSTANTS.SELECT_BENEFICIARIES"
                        />}
                        <ViewComponent style={[commonStyles.formItemSpace]} />
                  
                        {!uboDetailsLoading && (
                            <UboFormComponent
                                key={`${isEditMode ? `edit-${editingUbo?.id}` : 'add-new'}-${selectedUbo?.id || 'no-beneficiary'}-${uboDetails?.id || 'no-details'}`}
                                onSubmit={handleUboSubmit}
                                initialValues={uboInitValues}
                                countryCodelist={countryCodelist}
                                countryList={countryList}
                                documentTypesLookUp={filteredDocumentTypes.length > 0 ? filteredDocumentTypes : documentTypesLookUp}
                                imagesLoader={imagesLoader}
                                fileNames={fileNames}
                                onUploadImg={handleUploadImg}
                                deleteImage={deleteImage}
                                innerRef={scrollRef}
                                maxDate={maxDate}
                                loading={btnLoading}
                                onValidationError={setUboError}
                                onFormReady={setFormActions}
                                onCountryChange={handleCountryChange}
                                screenName="PayoutUboForm"
                            />
                        )}
                   {  !uboDetailsLoading &&<>  <ViewComponent style={[commonStyles.mb40]} />
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.CONFIRM"}
                            loading={btnLoading}
                            disable={btnLoading}
                            onPress={handleValidationSave}
                        />
                        <ViewComponent style={[commonStyles.buttongap]} />
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.CANCEL"}
                            onPress={onClose}
                            solidBackground={true}
                        /></>}
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </KeyboardAwareScrollView>
            </Container>}
        </ViewComponent>
    );
};

export default PayoutUboForm;

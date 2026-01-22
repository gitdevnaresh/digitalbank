import React, { useState } from 'react';
import { Field } from 'formik';
import ViewComponent from '../../../../../newComponents/view/view';
import InputDefault from '../../../../../newComponents/textInputComponents/DefaultFiat';
import LabelComponent from '../../../../../newComponents/textComponets/lableComponent/lable';
import { FORM_FIELD, KYB_INFO_CONSTANTS } from './constant';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { useThemeColors } from '../../../../../hooks/useThemeColors';
import ProfileService from '../../../../../apiServices/profile';
import * as DocumentPicker from 'expo-document-picker';
import { FORM_DATA_CONSTANTS } from '../constants';
import { Alert, TextInput } from 'react-native';
import FileUpload from '../../../../../newComponents/fileUpload/fileUpload';
import * as ImagePicker from 'expo-image-picker';
import ParagraphComponent from '../../../../../newComponents/textComponets/paragraphText/paragraph';
import PhoneCodePicker from '../../../../commonScreens/phonePicker';
import DatePickerComponent from '../../../../../newComponents/datePickers/formik/datePicker';
import { useLngTranslation } from '../../../../../hooks/useLngTranslation';
import CustomPicker from '../../../../../newComponents/customPicker/CustomPicker';
import { PersonalFieldsProps } from './interface';

const PersonalFields: React.FC<PersonalFieldsProps> = ({ touched, errors, handleBlur, values, kybRequriments, handleChange, setFieldValue, setFieldTouched, countries, countryCodelist, documentTypesLookUp, countryIdType,fetchDocuments }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useLngTranslation();
    const kybRequrimentsInfo = kybRequriments?.toLowerCase()?.replace(/\s+/g, '')?.split(',') || [];
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());


    type ImageFieldKey =
        'shareholderRegistry' |
        'certificateofincorporation' |
        'profilePicFront' |
        'profilePicBack';

    const [fileNames, setFileNames] = useState({
        shareholderRegistry: "",
        certificateofincorporation: "",
        profilePicFront: "",
        profilePicBack: ""
    });
    const [loadingState, setLoadingState] = useState({
        shareholderRegistry: false,
        certificateofincorporation: false,
        profilePicFront: false,
        profilePicBack: false
    });

    const [errorMessages, setErrorMessages] = useState({
        shareholderRegistry: "",
        certificateofincorporation: "",
        profilePicFront: "",
        profilePicBack: ""
    });

    const acceptedExtensions = ['.jpg', '.jpeg', '.png'];
    const verifyFileTypes = (fileList: any) => {
        const fileName = fileList;
        if (!hasAcceptedExtension(fileName)) {
            return false;
        }
        return true;
    };
    const hasAcceptedExtension = (fileName: string) => {
        const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        return acceptedExtensions.includes(extension);
    };

    const getFileExtension = (uri: string) => {
        return uri?.split('.')?.pop()?.toLowerCase() ?? 'jpg';
    };

    const deleteImages = (fieldName: ImageFieldKey) => {
        setFieldValue(fieldName, "");
        setFileNames(prev => ({ ...prev, [fieldName]: "" }));
        setErrorMessages(prev => ({ ...prev, [fieldName]: "" }));
    };

    const uploadFileToServer = async (uri: string, type: string, fileName: string, fileExtension: string, item: string, setFeilds: (field: string, value: string) => void) => {
        try {
            const formData = new FormData();
            formData.append('document', {
                uri: uri,
                type: `${type}/${fileExtension}`,
                name: fileName,
            } as any);
            const uploadRes = await ProfileService.uploadFile(formData);
            if (uploadRes.status === 200) {
                const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                setFeilds(item, uploadedImage);
                setErrorMessages(prev => ({ ...prev, [item]: "" }));
            } else {
                setErrorMessages(prev => ({ ...prev, [item]: "Upload failed. Please try again." }));
            }
        } catch (error) {
            setErrorMessages(prev => ({ ...prev, [item]: "Upload failed. Please try again." }));
        }
    };
    const handleImageUpload = async (
        item: string,
        setFeilds: (field: string, value: string) => void,
        pickerOption?: 'camera' | 'library' | 'documents'
    ) => {
        setLoadingState(prev => ({ ...prev, [item]: true }));
        setErrorMessages(prev => ({ ...prev, [item]: "" }));

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
                const fileName = name || uri.split('/').pop() || `file_${Date.now()}`;
                const fileSizeMB = size ? size / (1024 * 1024) : 0;
                if (fileSizeMB > 15) {
                    setErrorMessages(prev => ({ ...prev, [item]: "File size must be less than 15MB" }));
                    return;
                }
                const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
                const isImage = mimeType?.startsWith('image/') || verifyFileTypes(fileName);
                if (!isPdf && !isImage) {
                    setErrorMessages(prev => ({ ...prev, [item]: "Please select a valid image or PDF file" }));
                    return;
                }
                setFileNames(prevState => ({ ...prevState, [item]: fileName }));
                const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'pdf';
                const type = isPdf ? 'application' : 'image';
                await uploadFileToServer(uri, type, fileName, fileExtension, item, setFeilds);
                return;
            }

            const permissionResult = pickerOption === 'camera'
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert("Permission Denied", FORM_DATA_CONSTANTS.ALRET_MSG);
                return;
            }

            const result = pickerOption === 'camera'
                ? await ImagePicker.launchCameraAsync({ allowsEditing: false, aspect: [1, 1], quality: 0.5 })
                : await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: false, aspect: [1, 1], quality: 0.5, cameraType: ImagePicker.CameraType.front });

            if (result.canceled) return;

            const selectedImage = result.assets[0];
            const { uri, type } = selectedImage;
            const fileName = selectedImage.fileName || uri.split('/').pop() || `image_${Date.now()}.jpg`;
            const fileExtension = getFileExtension(selectedImage.uri);

            if (!verifyFileTypes(fileName)) {
                setErrorMessages(prev => ({ ...prev, [item]: "Please select a valid image file (JPG, JPEG, PNG)" }));
                return;
            }

            const fileSizeMB = selectedImage.fileSize ? selectedImage.fileSize / (1024 * 1024) : 0;
            if (fileSizeMB > 15) {
                setErrorMessages(prev => ({ ...prev, [item]: "File size must be less than 15MB" }));
                return;
            }

            setFileNames(prevState => ({ ...prevState, [item]: fileName }));

            if (uri && type && fileExtension) {
                await uploadFileToServer(uri, type, fileName, fileExtension, item, setFeilds);
            }
        } catch (err) {
            setErrorMessages(prev => ({ ...prev, [item]: "Upload failed. Please try again." }));
        } finally {
            setLoadingState(prev => ({ ...prev, [item]: false }));
        }
    };
    const handlePersonalCountry = (selectedCountry: string) => {
        setFieldValue('country', selectedCountry);
        fetchDocuments(selectedCountry)
        // Reset ID type related fields when country changes
        setFieldValue('idType', '');
        setFieldValue('idNumber', '');
        setFieldValue('docIssueDate', null);
        setFieldValue('docExpireDate', null);
        setFieldValue('profilePicFront', '');
        setFieldValue('profilePicBack', '');
    };
    

    return (
        <ViewComponent>
            {kybRequriments?.toLowerCase()
                ?.replace(/\s+/g, '') // remove spaces
                ?.split(',')          // convert to array
                ?.includes('personalinformation')
                && (
                    <ViewComponent>
                        <ParagraphComponent text={"Personal Information"} style={[commonStyles.sectionTitle, commonStyles.mb24]} />

                        <Field
                            touched={touched?.firstName}
                            name="firstName"
                            label="First Name"
                            error={errors?.firstName}
                            handleBlur={handleBlur}
                            component={InputDefault}
                            placeholder="Enter First Name"
                            maxLength={100}
                            value={values?.firstName || ''}
                            onChange={handleChange('firstName')}
                            requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                        />
                        <ViewComponent style={commonStyles.formItemSpace} />

                        <Field
                            touched={touched?.lastName}
                            name="lastName"
                            label="Last Name"
                            error={errors?.lastName}
                            handleBlur={handleBlur}
                            component={InputDefault}
                            placeholder="Enter Last Name"
                            maxLength={100}
                            value={values?.lastName || ''}
                            onChange={handleChange('lastName')}
                            requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                        />
                        <ViewComponent style={commonStyles.formItemSpace} />

                        <DatePickerComponent name="dateOfBirth" label={"GLOBAL_CONSTANTS.DATE_OF_BIRTH"} maximumDate={maxDate} />

                        <ViewComponent style={commonStyles.formItemSpace} />
                        <Field
                            activeOpacity={0.9}
                            label={"Country"}
                            touched={touched?.country}
                            name={'country'}
                            error={errors?.country}
                            handleBlur={handleBlur}
                            customContainerStyle={{ height: 80 }}
                            data={countries}
                            placeholder={"Select Country"}
                            component={CustomPicker}
                            modalTitle={"Select Country"}
                            customBind={['name']}
                            valueField={'name'}
                            onChange={(item: any) => handlePersonalCountry(item)}
                            requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                        />

                        <ViewComponent style={commonStyles.formItemSpace} />

                        <Field
                            touched={touched?.email}
                            name={'email'}
                            label={"GLOBAL_CONSTANTS.EMAIL"}
                            error={errors?.email}
                            handleBlur={handleBlur}
                            placeholder={"GLOBAL_CONSTANTS.ENTER_EMAIL_ADDRESS"}
                            component={InputDefault}
                            keyboardType={'email-address'}
                            maxLength={50}
                            requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                        />
                        <ViewComponent style={commonStyles.formItemSpace} />

                        <LabelComponent style={[commonStyles.inputLabel]} text={"GLOBAL_CONSTANTS.PHONE_NUMBER"}>
                            <ParagraphComponent style={[commonStyles.textRed]} text={" *"} />
                        </LabelComponent>
                        <ViewComponent style={[commonStyles.relative, commonStyles.dflex]}>
                            <PhoneCodePicker
                                inputStyle={{
                                    borderRightWidth: 0,
                                    borderTopRightRadius: 0,
                                    borderBottomRightRadius: 0,
                                    borderColor: ((touched?.phoneCode && errors?.phoneCode) || (touched?.phoneNumber && errors?.phoneNumber)) ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER
                                }}
                                modalTitle={"GLOBAL_CONSTANTS.SELECT_PHONE_CODE"}
                                customBind={['name', '(', 'code', ')']}
                                data={countryCodelist}
                                placeholder={"GLOBAL_CONSTANTS.SELECT"}
                                value={values.phoneCode}
                                onChange={(item: any) => setFieldValue('phoneCode', item.code)}
                                isOnlycountry={true}
                            />
                            <ViewComponent style={[commonStyles.flex1, commonStyles.pr2]}>
                                <TextInput
                                    style={[
                                        commonStyles.textInput,
                                        commonStyles.fs14,
                                        commonStyles.fw400,
                                        {
                                            borderBottomLeftRadius: 0,
                                            borderTopLeftRadius: 0,
                                            borderColor: ((touched?.phoneCode && errors?.phoneCode) || (touched?.phoneNumber && errors?.phoneNumber)) ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER
                                        }
                                    ]}
                                    placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_PLACEHOLDER")}
                                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                    onChangeText={(text) => {
                                        const formattedText = text.replace(/\D/g, "").slice(0, 13);
                                        handleChange('phoneNumber')(formattedText);
                                    }}
                                    onBlur={handleBlur('phoneNumber')}
                                    value={values.phoneNumber}
                                    keyboardType={'phone-pad'}
                                />
                            </ViewComponent>
                        </ViewComponent>
                        {(touched.phoneCode && errors.phoneCode || touched.phoneNumber && errors.phoneNumber) &&
                            <ParagraphComponent style={[commonStyles.textRed]} text={errors.phoneCode || errors?.phoneNumber} />
                        }
                        <ViewComponent style={commonStyles.formItemSpace} />
                    </ViewComponent>)}

            {(kybRequrimentsInfo.includes('personalinformation') &&
                kybRequrimentsInfo.includes('personalidentification')) && (<ViewComponent>
                    <ParagraphComponent text={"ID Proofs"} style={[commonStyles.sectionTitle, commonStyles.mb24]} />
                    <Field
                        activeOpacity={0.9}
                        style={{ color: KYB_INFO_CONSTANTS.TRANSPARENT, backgroundColor: KYB_INFO_CONSTANTS.TRANSPARENT }}
                        label={"GLOBAL_CONSTANTS.CHOOSE_DOCUMENT_TYPE"}
                        touched={touched?.idType}
                        name={FORM_FIELD.ID_TYPE}
                        error={errors?.idType}
                        handleBlur={handleBlur}
                        customContainerStyle={{ height: 80 }}
                        data={countryIdType || []}
                        placeholder={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                        placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                        component={CustomPicker}
                        modalTitle={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                        onChange={(item: any) => {
                            setFieldValue('idType', item);
                            // Reset dependent fields when doc type changes
                            setFieldValue('idNumber', '');
                            setFieldValue('docIssueDate', null);
                            setFieldValue('docExpireDate', null);
                            setFieldValue('profilePicFront', '');
                            setFieldValue('profilePicBack', '');
                        }}
                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                    />


                    {["passport", "driverslicense", "nationalid", "hongkongid"].includes(
                        values?.idType?.toLowerCase()?.replace(/\s+/g, '')?.trim()) && (<>
                        <ViewComponent style={[commonStyles.formItemSpace]} />
                        <Field
                            activeOpacity={0.9}
                            touched={touched?.idNumber}
                            name="idNumber"
                            label={"GLOBAL_CONSTANTS.DACUMENT_NUMBER"}
                            error={errors?.idNumber}
                            handleBlur={handleBlur}
                            autoCapitalize="characters"
                            customContainerStyle={{ height: 80 }}
                            placeholder={"GLOBAL_CONSTANTS.DACUMENT_NUMBER_PLACEHOLDER"}
                            component={InputDefault}
                            maxLength={30}
                            onHandleChange={(text: any) => {
                                const formattedText = text
                                    ?.replace(/[^a-zA-Z0-9]/g, "")
                                    ?.toUpperCase();
                                handleChange('idNumber')(formattedText);
                            }}
                            requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                        />
                    </>)}
                    {["passport", "driverslicense", "nationalid", "hongkongid"].includes(
                        values?.idType?.toLowerCase()?.replace(/\s+/g, '')?.trim()) && (<>
                        <ViewComponent style={[commonStyles.formItemSpace]} />
                        <FileUpload
                            fileLoader={loadingState.profilePicFront}
                            onSelectImage={(source) => handleImageUpload('profilePicFront', setFieldValue, source)}
                            uploadedImageUri={values?.profilePicFront}
                            fileName={fileNames?.profilePicFront}
                            errorMessage={errorMessages?.profilePicFront || (touched?.profilePicFront && errors?.profilePicFront)}
                            deleteImage={() => deleteImages('profilePicFront')}
                            label={"GLOBAL_CONSTANTS.UPLOAD_YOUR_FRONT_DOCUMET"}
                            isRequired={true}
                            showImageSourceSelector={true}
                        />
                    </>)}

                    {["passport", "driverslicense", "nationalid", "hongkongid"].includes(
                        values?.idType?.toLowerCase()?.replace(/\s+/g, '')?.trim()) && (<>
                        <ViewComponent style={commonStyles.formItemSpace} />
                        <FileUpload
                            fileLoader={loadingState.profilePicBack}
                            onSelectImage={(source) => handleImageUpload('profilePicBack', setFieldValue, source)}
                            uploadedImageUri={values?.profilePicBack}
                            fileName={fileNames?.profilePicBack}
                            errorMessage={errorMessages?.profilePicBack || (touched?.profilePicBack && errors?.profilePicBack)}
                            deleteImage={() => deleteImages('profilePicBack')}
                            label={"GLOBAL_CONSTANTS.UPLOAD_BACK_DOCUMET"}
                            isRequired={true}
                            showImageSourceSelector={true}
                        />
                    </>)}

                    {["passport", "driverslicense"].includes(
                        values?.idType?.toLowerCase()?.replace(/\s+/g, '')?.trim()) && (<>
                        <ViewComponent style={[commonStyles.formItemSpace]} />
                        <DatePickerComponent
                            name='docIssueDate'
                            maximumDate={new Date(new Date().setDate(new Date().getDate() - 1))}
                            label="GLOBAL_CONSTANTS.DOCUMENT_ISSUE_DATE"
                            placeholder="GLOBAL_CONSTANTS.DATE_PLACEHOLDER"
                            required={true}
                        />
                    </>)}

                    {["passport", "driverslicense"].includes(
                        values?.idType?.toLowerCase()?.replace(/\s+/g, '')?.trim()) && (<>
                        <ViewComponent style={[commonStyles.formItemSpace]} />
                        <DatePickerComponent 
                            name='docExpireDate' 
                            minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))} 
                            label="GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE" 
                            placeholder="GLOBAL_CONSTANTS.DATE_PLACEHOLDER" 
                        />
                    </>)}
                </ViewComponent>)}

        </ViewComponent>
    );
};

export default PersonalFields;

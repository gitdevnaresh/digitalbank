
import { ScrollView, Alert } from "react-native"
import { getThemedCommonStyles } from "../../../../components/CommonStyles"
import { Field } from "formik"
import React, { useEffect, useState } from "react"
import InputDefault from '../../../../newComponents/textInputComponents/DefaultFiat'
import FileUpload from "../../../../newComponents/fileUpload/fileUpload"
import { FeePhysicalCardApplyProps } from "./constants"
import ViewComponent from "../../../../newComponents/view/view"
import { useThemeColors } from "../../../../hooks/useThemeColors"
import LabelComponent from "../../../../newComponents/textComponets/lableComponent/lable"
import CardsModuleService from "../../../../apiServices/card"
import { isErrorDispaly } from "../../../../utils/helpers"
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import ProfileService from "../../../../apiServices/profile"
import MonthYearPicker from "../../../../newComponents/datePickers/MonthYearPicker"

const FeePhysicalCardApply: React.FC<FeePhysicalCardApplyProps> = ({ envelopeNoRequired, additionalDocforActiveCard, handleBlur, values, setFieldValue, handleChange, touched, errors, cardId, dynamicFields = [] }) => {
    const [loadingState, setLoadingState] = useState<{ [key: string]: boolean }>({});
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [fileNames, setFileNames] = useState<{ [key: string]: string }>({});


    const getPlaceholder = (fieldName: string) => {
        const placeholders: { [key: string]: string } = {
            cardnumber: "GLOBAL_CONSTANTS.ENTER_CARD_NUMBER",
            envelopenumber: "GLOBAL_CONSTANTS.ENTER_ENVELOPE_NUMBER",
            expirydate: "GLOBAL_CONSTANTS.ENTER_EXPIRY_DATE_MM_YY",
            cvv: "GLOBAL_CONSTANTS.ENTER_CVV",
            cardholdername: "GLOBAL_CONSTANTS.ENTER_CARD_HOLDER_NAME",
            cardexpirydate: "GLOBAL_CONSTANTS.ENTER_CARD_EXPIRY_DATE_MM_YY",
            cardlastfourdigits: "GLOBAL_CONSTANTS.ENTER_LAST_FOUR_DIGITS",
            linkcardnumber: "GLOBAL_CONSTANTS.ENTER_LINKING_CARD_NUMBER"
        };
        return placeholders[fieldName.toLowerCase()] || `GLOBAL_CONSTANTS.ENTER ${fieldName}`;
    };



    const acceptedExtensions = ['.jpg', '.jpeg', '.png'];

    const hasAcceptedExtension = (fileName: string) => {
        const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        return acceptedExtensions.includes(extension);
    };
    const verifyFileSize = (fileSize: any) => {
        const maxSizeInBytes = 15 * 1024 * 1024; // 15MB
        return fileSize <= maxSizeInBytes;
    };

    const getFileExtension = (uri: string) => {
        return uri?.split('.')?.pop()?.toLowerCase() ?? 'jpg';
    };

    const verifyFileTypes = (fileName: string) => {
        const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        return acceptedExtensions.includes(extension);
    };
    const handleImageUpload = async (fieldName: string, setFieldValue: any, pickerOption?: 'camera' | 'library' | 'documents') => {
        setLoadingState((prev) => ({ ...prev, [fieldName]: true }));

        try {
            const permissionResult =
                pickerOption === 'camera'
                    ? await ImagePicker.requestCameraPermissionsAsync()
                    : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert("Permission Denied", "You need to enable permissions to use this feature.");
                setLoadingState(prev => ({ ...prev, [fieldName]: false }));
                return;
            }

            const result =
                pickerOption === 'camera'
                    ? await ImagePicker.launchCameraAsync({
                        allowsEditing: false,
                        aspect: [4, 3],
                        quality: 0.5,
                    })
                    : await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: false,
                        aspect: [4, 3],
                        quality: 0.5,
                    });

            if (!result.canceled && result.assets?.length > 0) {
                const asset = result.assets[0];
                const { uri, type, fileSize } = asset;

                if (!verifyFileSize(fileSize)) {
                    Alert.alert("Error", "File size exceeds the 15MB limit.");
                    setLoadingState((prev) => ({ ...prev, [fieldName]: false }));
                    return;
                }

                const localFileName = asset.fileName ?? uri.split('/').pop() ?? `image_${Date.now()}.jpg`;
                const fileExtension = getFileExtension(asset.uri);

                if (!verifyFileTypes(localFileName)) {
                    Alert.alert("Error", "Invalid file type. Only JPG, JPEG, and PNG are allowed.");
                    setLoadingState((prev) => ({ ...prev, [fieldName]: false }));
                    return;
                }

                setFileNames((prevState) => ({
                    ...prevState,
                    [fieldName]: localFileName,
                }));

                let formDataInstance = new FormData();
                formDataInstance.append('document', {
                    uri: asset.uri,
                    type: `${type || 'image'}/${fileExtension}`,
                    name: localFileName,
                } as any);

                const uploadRes: any = await ProfileService.uploadFile(formDataInstance);

                if (uploadRes.status === 200) {
                    const imageUrl = uploadRes.data?.[0] || "";
                    setFieldValue(fieldName, imageUrl);
                } else {
                    Alert.alert("Error", "Failed to upload the image.");
                }
            }
        } catch (error) {
            Alert.alert("Error", "An error occurred while uploading the image.");
        } finally {
            setLoadingState((prev) => ({ ...prev, [fieldName]: false }));
        }
    };



    const deleteImages = (fieldName: string, setFieldValue: any) => {
        setFieldValue(fieldName, "");
        setFileNames((prev) => ({ ...prev, [fieldName]: "" }));
    };
    return (

        <ViewComponent>
            <ViewComponent>
                {/* <ViewComponent style={[commonStyles.relative]}>

                    <Field
                        touched={touched.cardNumber}
                        name="cardNumber"
                        label={"GLOBAL_CONSTANTS.LINK_CARD_NUMBER"}
                        value={values.cardNumber}
                        error={errors.cardNumber}
                        handleBlur={handleBlur}
                        customContainerStyle={{}}
                        onChangeText={(val: any) => {
                            if (val.match(/[0-9/]/)) {
                                handleChange("cardNumber")(val);
                            }
                        }}
                        placeholder={"GLOBAL_CONSTANTS.ENTER_LINK_CARD_NUMBER"}
                        keyboardType={"decimal-pad"}
                        autoCapitalize="words"
                        component={InputDefault}
                        maxLength={16}
                        requiredMark={<LabelComponent style={[commonStyles.textRed]} text=" *" />}
                    />

                </ViewComponent> */}
                {/* Dynamic Fields Rendering */}
                {dynamicFields?.map((field) => (
                    <ViewComponent key={field.field} style={[commonStyles.formItemSpace]}>
                        {field.fieldType === "date" ? (
                            <MonthYearPicker
                                label={field.label}
                                value={values[field.field]}
                                onDateChange={(date) => setFieldValue(field.field, date)}
                                error={errors[field.field]}
                            />
                        ) : field.fieldType === "upload" ? (
                            <FileUpload
                                fileLoader={loadingState[field.field]}
                                onSelectImage={(source) => handleImageUpload(field.field, setFieldValue, source)}
                                uploadedImageUri={values[field.field]}
                                fileName={fileNames[field.field]}
                                errorMessage={touched[field.field] && errors[field.field]}
                                deleteImage={() => deleteImages(field.field, setFieldValue)}
                                label={field.label}
                                isRequired={field.isMandatory == "true"}
                                showImageSourceSelector={true}
                            />
                        ) : (
                            <Field
                                touched={touched[field.field]}
                                name={field.field}
                                label={field.label}
                                component={InputDefault}
                                value={values[field.field]}
                                error={errors[field.field]}
                                onChangeText={handleChange(field.field)}
                                maxLength={field.maxLength}
                                keyboardType={field.fieldType === "numeric" ? "numeric" : "default"}
                                placeholder={getPlaceholder(field.field?.toLowerCase())}
                                requiredMark={field.isMandatory ? <LabelComponent style={[commonStyles.textRed]} text=" *" /> : null}
                            />
                        )}
                    </ViewComponent>
                ))}

                {/* {envelopeNoRequired && (
                    <ViewComponent >
                        <ViewComponent style={commonStyles.formItemSpace} />
                        <Field
                            touched={touched.envelopenumber}
                            name={"envelopenumber"}
                            label={"GLOBAL_CONSTANTS.MEMBER_NUMBER"}
                            error={errors.envelopenumber}
                            handleBlur={handleBlur}
                            customContainerStyle={{}}
                            placeholder={"GLOBAL_CONSTANTS.ENTER_MEMBER_NUMBER"}
                            component={InputDefault}
                            requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                            maxLength={8}
                        />
                    </ViewComponent>
                )} */}


                {/* <ViewComponent style={[commonStyles.formItemSpace]} /> */}
                {/* {(additionalDocforActiveCard !== null) && 
                (<ViewComponent>
                    <FileUpload
                        fileLoader={loadingState["handHoldingIdPhoto"]}
                        onSelectImage={(source) => handleImageUpload("handHoldingIdPhoto", setFieldValue, source)}
                        uploadedImageUri={values?.handHoldingIdPhoto}
                        fileName={fileNames?.handHoldingIdPhoto}
                        errorMessage={touched?.handHoldingIdPhoto && errors?.handHoldingIdPhoto}
                        deleteImage={() => deleteImages('handHoldingIdPhoto', setFieldValue)}
                        label={`${additionalDocforActiveCard}`}
                        isRequired={true}
                        showImageSourceSelector={true}
                    /> */}
                   
                    {/* <ViewComponent style={[commonStyles.formItemSpace]} />
                    <ViewComponent style={[commonStyles.notebg, commonStyles.p12, commonStyles.rounded11]}>
                        <ViewComponent
                            style={[
                                commonStyles.dflex,
                                commonStyles.gap8,
                                commonStyles.mb8,
                                commonStyles.alignCenter
                            ]}
                        >
                            <MaterialIcons name="info-outline" size={s(20)} color={NEW_COLOR.NOTE_ICON} />
                            <ViewComponent style={[commonStyles.flex1]}>
                                <TextMultiLangauge
                                    style={[
                                        commonStyles.fs12,
                                        commonStyles.textlinkgrey,
                                        commonStyles.fw400,
                                        commonStyles.mb4
                                    ]}
                                    text={FORM_DATA_PLACEHOLDER.UPLOAD_NOTE1}
                                />
                            </ViewComponent>
                        </ViewComponent>
                    </ViewComponent> */}
                {/* </ViewComponent>)} */}
            </ViewComponent>
        </ViewComponent>
    )
}
export default FeePhysicalCardApply;
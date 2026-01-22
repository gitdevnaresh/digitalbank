import React from 'react';
import { Field } from 'formik';
import { TextInput } from 'react-native';
import ViewComponent from '../../../../../../../newComponents/view/view';
import InputDefault from '../../../../../../../newComponents/textInputComponents/DefaultFiat';
import CustomPicker from '../../../../../../../newComponents/customPicker/CustomPicker';
import DatePickerComponent from '../../../../../../../newComponents/datePickers/formik/datePicker';
import FileUpload from '../../../../../../../newComponents/fileUpload/fileUpload';
import LabelComponent from '../../../../../../../newComponents/textComponets/lableComponent/lable';
import ParagraphComponent from '../../../../../../../newComponents/textComponets/paragraphText/paragraph';
import TextMultiLanguage from '../../../../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import PhoneCodePicker from '../../../../../../commonScreens/phonePicker';
import { FORM_FIELD } from '../../../../../onboarding/kybInformation/constants';
import { s } from '../../../../../../../constants/theme/scale';
import { PersonalKycFormFieldsProps } from '../interface/interface';
import { KYC_FORM_FIELDS } from '../../../../constants';



const PersonalKycFormFields: React.FC<PersonalKycFormFieldsProps> = ({
    touched,
    errors,
    handleBlur,
    values,
    setFieldValue,
    Lookups,
    addressesList,
    imagesLoader,
    fileNames,
    setFileNames,
    handleUploadImg,
    handleAddAddress,
    maxDate,
    commonStyles,
    NEW_COLOR,
    t,
    kycRequirements,
    countryCodelist,
    handlePhoneCode
}) => {
    const getRequirements = () => {
        const requirements = kycRequirements?.kyc?.requirement?.split(',') || [];
        return {
            showFullName: requirements.includes('FullName'),
            showBasic: requirements.includes('Basic'),
            showAddress: requirements.includes('Address'),
            showPassport: requirements.includes('Passport'),
            showDocFront: requirements.includes('DocFront'),
            showDocBack: requirements.includes('DocBack'),
            showDocumentNumber: requirements.includes('DocumentNumber')
        };
    };
    
    const requirements = getRequirements();
    
    // Handle PhoneCodePicker selection
    const handlePhoneCodeSelection = (selectedItem: { code: string; name: string }) => {
        handlePhoneCode(selectedItem, setFieldValue);
    };
    
    return (
        <>
            {/* Full Name Section */}
            {requirements.showFullName && (
                <>
                    <Field
                        label="GLOBAL_CONSTANTS.FIRST_NAME"
                        touched={touched?.firstName}
                        name={KYC_FORM_FIELDS.FIRST_NAME}
                        error={errors?.firstName}
                        handleBlur={handleBlur}
                        placeholder="GLOBAL_CONSTANTS.ENTER_FIRST_NAME"
                        component={InputDefault}
                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                        editable={false}
                        maxLength={50}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    
                    <Field
                        label="GLOBAL_CONSTANTS.LAST_NAME"
                        touched={touched?.lastName}
                        name={KYC_FORM_FIELDS.LAST_NAME}
                        error={errors?.lastName}
                        handleBlur={handleBlur}
                        placeholder="GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER"
                        component={InputDefault}
                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                        editable={false}
                        maxLength={50}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                </>
            )}

            {/* Basic Information Section */}
            {requirements.showBasic && (
                <>
                    <Field
                        label="GLOBAL_CONSTANTS.EMAIL"
                        touched={touched?.email}
                        name={KYC_FORM_FIELDS.EMAIL}
                        error={errors?.email}
                        handleBlur={handleBlur}
                        placeholder="GLOBAL_CONSTANTS.ENTER_EMAIL"
                        component={InputDefault}
                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                        editable={false}
                        maxLength={60}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    
                    <LabelComponent text="GLOBAL_CONSTANTS.PHONE_NUMBER" style={[commonStyles.inputLabel]}>
                        <LabelComponent text="*" style={commonStyles.textError} />
                    </LabelComponent>
                    <ViewComponent style={[commonStyles.relative, commonStyles.dflex, commonStyles.pr2]}>
                        <PhoneCodePicker
                            inputStyle={{ borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderColor: touched?.phoneCode && errors?.phoneCode ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER }}
                            modalTitle="GLOBAL_CONSTANTS.SELECT_COUNTRY_CODE"
                            customBind={["name", "(", "code", ")"]}
                            data={countryCodelist}
                            value={values?.phoneCode}
                            placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_SELECT")}
                            onChange={handlePhoneCodeSelection}
                        />
                        <TextInput
                            style={[commonStyles.flex1, commonStyles.textInput, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderColor: touched?.phoneNumber && errors?.phoneNumber ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER }]}
                            placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_PLACEHOLDER")}
                            onChangeText={(text) => {
                                const formattedText = text.replace(/\D/g, "").slice(0, 13);
                                setFieldValue(KYC_FORM_FIELDS.PHONE_NUMBER, formattedText);
                            }}
                            onBlur={handleBlur(KYC_FORM_FIELDS.PHONE_NUMBER)}
                            value={values.phoneNumber}
                            keyboardType="phone-pad"
                            placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                        />
                    </ViewComponent>
                    {(touched.phoneCode || touched.phoneNumber) && (errors.phoneNumber || errors.phoneCode) && (
                        <ParagraphComponent multiLanguageAllows={true} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textError, commonStyles.mt4]} text={errors.phoneNumber || errors.phoneCode} />
                    )}
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    
                    <DatePickerComponent
                        name={KYC_FORM_FIELDS.BIRTH_DATE}
                        label="GLOBAL_CONSTANTS.DATE_OF_BIRTH"
                        maximumDate={maxDate}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    
                    <Field
                        label="GLOBAL_CONSTANTS.OCCUPATION"
                        touched={touched?.occupation}
                        name={KYC_FORM_FIELDS.OCCUPATION}
                        error={errors?.occupation}
                        handleBlur={handleBlur}
                        data={Lookups?.Occupations || []}
                        placeholder="GLOBAL_CONSTANTS.SELECT_OCCUPATION"
                        component={CustomPicker}
                        modalTitle="GLOBAL_CONSTANTS.SELECT_OCCUPATION"
                        onChange={(value: string) => setFieldValue(KYC_FORM_FIELDS.OCCUPATION, value)}
                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    
                    <Field
                        label="GLOBAL_CONSTANTS.COUNTRY"
                        touched={touched?.country}
                        name={KYC_FORM_FIELDS.COUNTRY}
                        error={errors?.country}
                        handleBlur={handleBlur}
                        data={Lookups?.Country || []}
                        placeholder="GLOBAL_CONSTANTS.SELECT_COUNTRY"
                        component={CustomPicker}
                        modalTitle="GLOBAL_CONSTANTS.SELECT_COUNTRY"
                        onChange={(value: string) => setFieldValue('country', value)}
                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                    />
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </>
            )}

            {/* Address Section */}
            {requirements.showAddress && (
                <>
                    <TextMultiLanguage style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} text="GLOBAL_CONSTANTS.ADDRESS_INFO" />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb10]}>
                        <LabelComponent style={[commonStyles.inputLabel]} text={t("GLOBAL_CONSTANTS.ADDRESS")} children={<ParagraphComponent style={[commonStyles.textRed]} text={' *'} />} />
                        <ViewComponent style={[commonStyles.actioniconbg, { marginTop: s(-8) }]}>
                            <MaterialIcons name="add" size={s(22)} color={NEW_COLOR.DARK_TEXT_WHITE} onPress={handleAddAddress} />
                        </ViewComponent>
                    </ViewComponent>
                    <Field
                        activeOpacity={0.9}
                        touched={touched?.address}
                        name={'address'}
                        modalTitle="GLOBAL_CONSTANTS.ADDRESS"
                        data={addressesList || []}
                        onChange={(value: string) => setFieldValue('address', value)}
                        error={errors?.address}
                        handleBlur={handleBlur}
                        customContainerStyle={{}}
                        placeholder="GLOBAL_CONSTANTS.SELECT_ADDRESS"
                        component={CustomPicker}
                        isOnlycountry={true}
                    />
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </>
            )}

            {/* Documents Section */}
            {(requirements.showPassport || requirements.showDocFront || requirements.showDocBack || requirements.showDocumentNumber) && (
                <>
                    <TextMultiLanguage style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} text="GLOBAL_CONSTANTS.DOCUMENTS" />
                    
                    {requirements.showPassport && (
                        <>
                            <Field
                                label="GLOBAL_CONSTANTS.DOCUMENT_TYPE"
                                touched={touched?.docType}
                                name={'docType'}
                                error={errors?.docType}
                                handleBlur={handleBlur}
                                data={Lookups?.documentTypes || []}
                                placeholder="GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"
                                component={CustomPicker}
                                modalTitle="GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"
                                onChange={(value: string) => setFieldValue('docType', value)}
                                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                            />
                            <ViewComponent style={[commonStyles.formItemSpace]} />
                        </>
                    )}
                    
                    {requirements.showDocumentNumber && (
                        <>
                            <Field
                                label="GLOBAL_CONSTANTS.DOCUMENT_NUMBER"
                                touched={touched?.docNumber}
                                name={'docNumber'}
                                error={errors?.docNumber}
                                handleBlur={handleBlur}
                                placeholder="GLOBAL_CONSTANTS.ENTER_DOCUMENT_NUMBER"
                                component={InputDefault}
                                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                maxLength={30}
                            />
                            <ViewComponent style={[commonStyles.formItemSpace]} />
                            
                            <DatePickerComponent
                                name={'expiryDate'}
                                label="GLOBAL_CONSTANTS.EXPIRY_DATE"
                                required={false}
                                minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                            />
                            <ViewComponent style={[commonStyles.formItemSpace]} />
                        </>
                    )}

                    {/* Document Upload Fields */}
                    {requirements.showDocFront && (
                        <>
                            <FileUpload
                                fileLoader={imagesLoader?.frontId}
                                onSelectImage={(source) => {
                                    handleUploadImg('frontId', setFieldValue, source);
                                }}
                                uploadedImageUri={values?.frontId}
                                fileName={fileNames?.frontId as string}
                                errorMessage={touched?.frontId ? errors?.frontId as string : ''}
                                deleteImage={() => {
                                    setFieldValue('frontId', '');
                                    setFileNames((prev: { frontId: string | null; backId: string | null }) => ({ ...prev, frontId: null }));
                                }}
                                label="GLOBAL_CONSTANTS.FRONT_ID_PHOTO"
                                isRequired={true}
                                showImageSourceSelector={true}
                                subLabel="GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"
                            />
                            <ViewComponent style={[commonStyles.formItemSpace]} />
                        </>
                    )}
                    
                    {requirements.showDocBack && (
                        <>
                            <FileUpload
                                fileLoader={imagesLoader?.backId}
                                onSelectImage={(source) => {
                                    handleUploadImg('backId', setFieldValue, source);
                                }}
                                uploadedImageUri={values?.backId}
                                fileName={fileNames?.backId as string}
                                errorMessage={touched?.backId ? errors?.backId as string : ''}
                                deleteImage={() => {
                                    setFieldValue('backId', '');
                                    setFileNames((prev: { frontId: string | null; backId: string | null }) => ({ ...prev, backId: null }));
                                }}
                                label="GLOBAL_CONSTANTS.BACK_ID_PHOTO"
                                isRequired={true}
                                showImageSourceSelector={true}
                                subLabel="GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"
                            />
                        </>
                    )}
                </>
            )}

        </>
    );
};

export default PersonalKycFormFields;
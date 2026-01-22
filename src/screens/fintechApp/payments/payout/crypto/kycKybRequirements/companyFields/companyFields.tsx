import React from "react";
import { useThemeColors } from '../../../../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../../../../components/CommonStyles';
import ViewComponent from '../../../../../../../newComponents/view/view';
import FormikTextInput from '../../../../../../../newComponents/textInputComponents/formik/textInput';
import { Field } from 'formik';
import { Data, KycKyb } from '../interface/interface';
import CustomPicker from '../../../../../../../newComponents/customPicker/CustomPicker';
import { FORM_FIELD } from '../../../../../onboarding/kybInformation/constants';
import LabelComponent from '../../../../../../../newComponents/textComponets/lableComponent/lable';
import DatePickerComponent from '../../../../../../../newComponents/datePickers/formik/datePicker';

interface BusinessDetailsFieldsProps {
    touched: any;
    errors: any;
    handleBlur: any;
    values: any;
    setFieldValue: any;
    lookups?: Data;
    kycRequirements?: KycKyb;
    formData?: any;
}

const CompanyFields: React.FC<BusinessDetailsFieldsProps> = ({ touched, errors, handleBlur, values, setFieldValue, lookups, kycRequirements, formData }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    return (
        <ViewComponent>
            <ViewComponent style={[commonStyles.titleSectionGap]} />
            <FormikTextInput
                name="RegistrationNo"
                label="GLOBAL_CONSTANTS.REGISTRATION_NUMBER"
                placeholder="GLOBAL_CONSTANTS.ENTER_REGISTRATION_NUMBER"
                placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                value={values.RegistrationNo || ''}
                onChangeText={(text: string) => setFieldValue('RegistrationNo', text)}
                onBlur={handleBlur('RegistrationNo')}
                isRequired={true}
                editable={true}
            />
            <ViewComponent style={[commonStyles.formItemSpace]} />
            <DatePickerComponent
                name="registrationDate"
                label="GLOBAL_CONSTANTS.REGISTRATION_DATE"
                mode="date"
                required={true}
                iconColor={NEW_COLOR.TEXT_WHITE}
            />
            <ViewComponent style={[commonStyles.formItemSpace]} />

            <Field
                activeOpacity={0.9}
                name={"chooseBusinessTrype"}
                label={"GLOBAL_CONSTANTS.BUSINESS_TYPE"}
                touched={touched?.docType}
                error={errors?.docType}
                handleBlur={handleBlur}
                customContainerStyle={{ height: 80 }}
                data={lookups?.BusinessTypes || []}
                placeholder={"GLOBAL_CONSTANTS.SELECT_BUSINESS_TYPE"}
                placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                component={CustomPicker}
                modalTitle={"GLOBAL_CONSTANTS.SELECT_BUSINESS_TYPE"}
                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                onChange={(value: string) => {
                    setFieldValue('chooseBusinessTrype', value);
                }}

            />

        </ViewComponent>
    );
};

export default CompanyFields;
import React, { useEffect, useState } from 'react';
import { Field } from 'formik';
import ViewComponent from '../../../../../newComponents/view/view';
import LabelComponent from '../../../../../newComponents/textComponets/lableComponent/lable';
import CustomPicker from '../../../../../newComponents/customPicker/CustomPicker';
import InputDefault from '../../../../../newComponents/textInputComponents/DefaultFiat';
import FlatListComponent from '../../../../../newComponents/flatList/flatList';
import { useThemeColors } from '../../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import CreateAccountService from '../../../../../apiServices/createAccount';

interface DynamicField {
  label: string;
  key: string;
  isMandatory: string;
  fieldType: string;
  url?: string;
}

interface DynamicFieldsProps {
  fields: DynamicField[];
  values: any;
  touched: any;
  errors: any;
  setFieldValue: (field: string, value: any) => void;
  handleBlur: (e: any) => void;
}

const DynamicFieldRenderer: React.FC<DynamicFieldsProps> = ({
  fields,
  values,
  touched,
  errors,
  setFieldValue,
  handleBlur,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [fieldData, setFieldData] = useState<any>({});
  const [loadingFields, setLoadingFields] = useState<any>({});

  const fetchDropdownData = async (url: string, fieldKey: string) => {
    if (fieldData[fieldKey]) {
      return;
    }
    
    setLoadingFields((prev: any) => ({ ...prev, [fieldKey]: true }));
    
    try {
      const response = await CreateAccountService.getDynamicLookup(url);
      
      if (response?.ok) {
        setFieldData((prev: any) => ({ ...prev, [fieldKey]: response.data }));
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setLoadingFields((prev: any) => ({ ...prev, [fieldKey]: false }));
    }
  };

  useEffect(() => {
    fields.forEach(field => {
      if (field.fieldType === 'dropdown' && field.url && !fieldData[field.key]) {
        fetchDropdownData(field.url, field.key);
      }
    });
  }, [fields]);

  const renderField = ({ item: field }: { item: DynamicField }) => {
    const fieldKey = field.key;
    
    const isDropdown = field.fieldType === 'dropdown';
    const rawData = fieldData[fieldKey];
    const dropdownData = rawData?.BankPaymentSchemes || [];
    const shouldShowPicker = isDropdown && Array.isArray(dropdownData) && dropdownData.length > 0;
    


    return (
      <ViewComponent>
          <Field
            name={fieldKey}
            label={field.label}
            modalTitle={field.label}
            placeholder={
              field.fieldType === "string"
                ? "Enter " + field.label
                : "Select " + field.label
            }
            touched={touched[fieldKey]}
            maxLength={50}
            error={errors[fieldKey]}
            handleBlur={handleBlur}
            onChange={(value: any) => {
              setFieldValue(fieldKey, value);
            }}
            component={shouldShowPicker ? CustomPicker : InputDefault}
            data={shouldShowPicker ? dropdownData : undefined}
            placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
            disabled={false}
            requiredMark={
              field.isMandatory === "true" ? (
                <LabelComponent text=" *" style={[commonStyles.textRed]} />
              ) : null
            }
          />
        </ViewComponent>
    );
  };
  
  return (
    <FlatListComponent
      data={fields}
      renderItem={renderField}
      keyExtractor={(item) => item.key}
      scrollEnabled={false}
      nestedScrollEnabled={false}
    />
  );
};

export default DynamicFieldRenderer;

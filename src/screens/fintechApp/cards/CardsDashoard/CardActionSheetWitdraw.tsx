import React, { useState } from "react";
import { Formik } from "formik";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import ViewComponent from "../../../../newComponents/view/view";
import TextMultiLangauge from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../newComponents/buttons/button";
import AmountInput from "../../../../newComponents/amountInput/amountInput";
import LabelComponent from "../../../../newComponents/textComponets/lableComponent/lable";
import { CurrencyText } from "../../../../newComponents/textComponets/currencyText/currencyText";
import { CreateWithdrawSchema } from "./schema";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import CurrencyNetworkSelector from "../../../../newComponents/currencyNetworkSelector/CurrencyNetworkSelector";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import useEncryptDecrypt from "../../../../hooks/encDecHook";

interface CardActionsSheetWithdrawProps {
  withdrawAmount?: number | string;
  selectedNetwork?: string;
  currencyCode: any[];
  networkData: any[];
  withdrawBalanceInfo: any;
  feeComissionData: any;
  buttonLoader: boolean;
  feeComissionLoading?: boolean;
  onAmountChange: (value: string, setFieldValue: (field: string, value: any) => void) => void;
  handleMinValue: (setFieldValue: (field: string, value: any) => void) => void;
  handleMaxValue: (setFieldValue: (field: string, value: any) => void) => void;
  onCurrencySelect: (value: any) => void;
  onNetworkSelect: (value: any) => void;
  onWithdrawSubmit: (values: any) => void;
  selectedCurrency: string;
  onClose?: () => void;
  ErrorMsgClose?: any
  CardsInfoData?: any
}

const CardActionsSheetWithdraw: React.FC<CardActionsSheetWithdrawProps> = ({
  withdrawAmount,
  currencyCode,
  networkData,
  withdrawBalanceInfo,
  feeComissionData,
  buttonLoader,
  onAmountChange,
  handleMinValue,
  handleMaxValue,
  onCurrencySelect,
  onNetworkSelect,
  onWithdrawSubmit,
  selectedCurrency,
  feeComissionLoading,
  onClose,
  ErrorMsgClose,
  CardsInfoData
}) => {
  const initValues = {
    amount: withdrawAmount || "",
    network: "",
    currency: "",
  };
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { decryptAES } = useEncryptDecrypt();
  const transformedNetworkData = networkData.map((item) => ({
    ...item,
    name: item.network,
    code: item.network,
  }));
  const { t } = useLngTranslation();
  const transformedCurrencyData = currencyCode.map((item) => ({
    ...item,
    name: item.currencyCode,
    code: item.currencyCode,
  }));
  const [displayAmount, setDisplayAmount] = useState(withdrawAmount?.toString() || "");
  const detailItem = (labelKey: string, rawValue: string | undefined, isSensitive: boolean = false) => {
    let decryptedOrRawValue = rawValue;
    
    if (isSensitive && typeof rawValue === 'string' && rawValue) {
      const decrypted = decryptAES(rawValue);
      decryptedOrRawValue = decrypted || rawValue; // Use original if decryption fails
    }

    const displayValue = (labelKey === "GLOBAL_CONSTANTS.CARD_NUMBER" && decryptedOrRawValue)
      ? decryptedOrRawValue.replace(/\d{4}(?=.)/g, "$& ") // Add spaces for card number
      : decryptedOrRawValue;

    return (
      <ViewComponent>
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
          <TextMultiLangauge
            text={labelKey}
            style={[commonStyles.listsecondarytext]}
          />
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
            {labelKey === "GLOBAL_CONSTANTS.AMOUNT" ? (
              <CurrencyText
                value={displayValue || "0"}
                decimalPlaces={2}
                style={[commonStyles.listprimarytext]}
              />
            ) : (
              <ParagraphComponent
                text={displayValue || "N/A"}
                style={[commonStyles.listprimarytext]}
                numberOfLines={1}
              />
            )}
          </ViewComponent>
        </ViewComponent>
        <ViewComponent style={[commonStyles.listitemGap]} />
      </ViewComponent>

    );
  };
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={[{ flexGrow: 1 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
    >
      <Formik
        initialValues={initValues}
        onSubmit={(values, { setSubmitting }) => {
          onWithdrawSubmit(values);
          setSubmitting(false);
        }}
        validationSchema={CreateWithdrawSchema(withdrawBalanceInfo)}
        enableReinitialize={false}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({
          errors,
          values,
          setFieldValue,
          handleSubmit,
          isSubmitting,
          setErrors,
          touched,
        }) => {
          // MODIFICATION: Create new handlers inside the render prop to sync local state and Formik state.
          const handleAmountInputChange = (text: string, setErrors: any) => {
            ErrorMsgClose();
            setErrors("amount", "")
            setDisplayAmount(text);
            onAmountChange(text, setFieldValue);
          };
          // method to set min  value
          const handleMinPress = () => {
            ErrorMsgClose()
            const minValue = withdrawBalanceInfo?.minLimit ?? 0;//=====
            setDisplayAmount(minValue.toString());
            handleMinValue(setFieldValue);
          };
          // method to set max  value
          const handleMaxPress = () => {
            ErrorMsgClose()
            const maxValue = withdrawBalanceInfo?.maxLimit ?? 0;//=====
            setDisplayAmount(maxValue.toString());
            handleMaxValue(setFieldValue);
          };

          return (
            <ViewComponent>
              <ViewComponent>
                {detailItem("GLOBAL_CONSTANTS.CARD_NAME", CardsInfoData?.name)}
                {detailItem("GLOBAL_CONSTANTS.CARD_NUMBER", CardsInfoData?.number, true)}
                {detailItem("GLOBAL_CONSTANTS.CURRENCY", CardsInfoData?.cardCurrency, true)}
                {detailItem("GLOBAL_CONSTANTS.AMOUNT", CardsInfoData?.amount, true)}
              </ViewComponent>
              <LabelComponent style={commonStyles.inputLabel} text="GLOBAL_CONSTANTS.CURRENCY" multiLanguageAllows>
                <LabelComponent text=" *" style={[commonStyles.textRed]} />
              </LabelComponent>
              <CurrencyNetworkSelector
                currencyData={transformedCurrencyData}
                networkData={transformedNetworkData}
                selectedCurrency={values.currency}
                selectedNetwork={values.network}
                onSelect={(currency, network) => {
                  setFieldValue("currency", currency);
                  setFieldValue("network", network);
                  setDisplayAmount("");
                  onCurrencySelect({ currencyCode: currency });
                  onNetworkSelect({ network });
                }}
              />

              <ViewComponent style={[commonStyles.formItemSpace]} />
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
                <ViewComponent style={[commonStyles.flex1]}>
                  <LabelComponent style={commonStyles.inputLabel} text="GLOBAL_CONSTANTS.AMOUNT" multiLanguageAllows>
                    <LabelComponent text=" *" style={[commonStyles.textRed]} />
                  </LabelComponent>
                </ViewComponent>
                <ViewComponent >
                  <ViewComponent style={[commonStyles.dflex, commonStyles.justifyend, commonStyles.alignCenter]}>
                    <ParagraphComponent
                      style={[commonStyles.availblelabel]}
                      text={`${t('GLOBAL_CONSTANTS.AVAILABLE_BALANCES')}`}
                    />
                    <CurrencyText
                      value={transformedNetworkData.find(n => n.code === values.network)?.amount ?? 'N/A'}
                      currency={values.currency}
                      symboles={true}
                      decimalPlaces={4}
                      style={[commonStyles.availbleamount]}
                    />
                  </ViewComponent>
                </ViewComponent>
              </ViewComponent>
              <AmountInput
                placeholder="GLOBAL_CONSTANTS.ENTER_AMOUNT"
                maxLength={16}
                onChangeText={(text: any) => { handleAmountInputChange(text, setErrors) }}
                value={displayAmount}
                onMinPress={handleMinPress}
                onMaxPress={handleMaxPress}
                minLimit={withdrawBalanceInfo?.minLimit == null ? undefined : withdrawBalanceInfo?.minLimit}//=====
                maxLimit={withdrawBalanceInfo?.maxLimit == null ? undefined : withdrawBalanceInfo?.maxLimit} //=====           
                showError={errors.amount}
                withdrawBalanceInfo={withdrawBalanceInfo}//=====
                touched={touched?.amount}
                maxDecimals={JSON.parse(CardsInfoData?.transactionAdditionalFields)?.IsAllowDecimalValue ? 8 : 0}
              />


              <ViewComponent style={[commonStyles.sectionGap]} />
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                {onClose && (
                  <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent title={"GLOBAL_CONSTANTS.CANCEL"} onPress={onClose} solidBackground={true} disable={buttonLoader || isSubmitting} />
                  </ViewComponent>
                )}
                <ViewComponent style={[commonStyles.flex1]}>
                  <ButtonComponent title={"GLOBAL_CONSTANTS.CARD_WITHDRAW_BUTTON"} loading={buttonLoader || isSubmitting} onPress={() => handleSubmit()} />
                </ViewComponent>
              </ViewComponent>
              <ViewComponent style={[commonStyles.sectionGap]} />
            </ViewComponent>
          );
        }}
      </Formik>
    </KeyboardAwareScrollView>
  );
};

export default CardActionsSheetWithdraw;

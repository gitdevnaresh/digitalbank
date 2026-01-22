import React, { useEffect, useState } from "react";
import { Formik, Field } from "formik";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { View, TouchableOpacity } from "react-native";
import * as Yup from "yup";
import moment from "moment";
import ViewComponent from "../../../../newComponents/view/view";
import TextMultiLangauge from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../newComponents/buttons/button";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import FeePhysicalCardApply from "./physicalCardApply";
import { ApplyCardFormProps, ApplyCardFormValues, AssetForSelector, feePhysicalCardApplyValidation, FORM_DATA_CONSTANTS } from "./constants";
import Loadding from "../../../commonScreens/skeltons";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import { s } from "../../../../constants/theme/scale";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CommonDropdown from '../../../../newComponents/dropDown';
import { CurrencyText } from "../../../../newComponents/textComponets/currencyText/currencyText";
import { CoinImages, getThemedCommonStyles } from "../../../../components/CommonStyles";
import ImageUri from "../../../../newComponents/imageComponents/image";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { isDecimalSmall } from "../../../../../configuration";
import CustomPicker from "../../../../newComponents/customPicker/CustomPicker";
import LabelComponent from "../../../../newComponents/textComponets/lableComponent/lable";
import CustomeditLink from "../../../../components/svgIcons/mainmenuicons/linkedit";
import CardsModuleService from "../../../../apiServices/card";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { isErrorDispaly } from "../../../../utils/helpers";
import AddCardsAddress from "./apply_card_kyc/addCardsKycAddress";
import { cardDynamicFeildRenderLoader } from "../CardsDashoard/constants";


const ApplyCardForm = (props: ApplyCardFormProps) => {
    const {
        t,
        initialFormValues,
        iHaveCard,
        setIHaveCard,
        cardsFeeInfo,
        onSubmitForm,
        selectedAssetForDisplay,
        setSelectedAssetForDisplay,
        coinWithCurrencyListForSelector,
        getApplyCardDeatilsInfo,
        cardFeeDetailsLoading,
        cardFeeLoader,
        btnLoading,
        cardId,
        dynamicFields,
        setDynamicFields
    } = props;

    const [addresses, setAddresses] = useState<any>([]);
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [addressesDetails, setAddressesDetails] = useState<any>([]);
    const [isAddAddressModalVisible, setAddAddressModalVisible] = useState<boolean>(false);
    const [fieldsLoading, setFieldsLoading] = useState(false);
    const isFocused = useIsFocused();
    const navigation = useNavigation<any>();

    const createDynamicInitialValues = (fields: any[]) => {
        const dynamicValues: Record<string, any> = {};
        fields.forEach((field) => {
            dynamicValues[field.field] = "";
        });
        return dynamicValues;
    };

    const createDynamicValidationSchema = (fields: any[]) => {
        const shape: Record<string, Yup.AnySchema> = {};
        fields.forEach((field) => {
            if (field.isMandatory === "true" || field.isMandatory === true) {
                let validation = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
                
                if (field.validation) {
                    validation = validation.matches(new RegExp(field.validation), `Enter valid ${field.label || field.field}`);
                }
                
                if (field.field?.toLowerCase().includes('expiry') || field.field?.toLowerCase().includes('expire')) {
                    validation = validation.test('not-expired', 'GLOBAL_CONSTANTS.CARD_HAS_EXPIRED', (value) => {
                        if (!value) return false;
                        const [month, year] = value.split('/');
                        const expiry = moment(`20${year}-${month}-01`).endOf('month');
                        return expiry.isSameOrAfter(moment(), 'day');
                    });
                }
                
                shape[field.field] = validation;
            }
        });
        return Yup.object().shape(shape);
    };

    const handleCurrencySelect = async (selectedItem: AssetForSelector) => {
        setSelectedAssetForDisplay(selectedItem);
        if (selectedItem.id) {
            await getApplyCardDeatilsInfo(selectedItem.id, iHaveCard?.haveCard);
        }
    };
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    useEffect(() => {
        if (isFocused) {
            getPersonalCustomerDetailsInfo();
            if (cardId) {
                getDynamicFields();
            }
        }
    }, [isFocused, cardId]);

    const getDynamicFields = async () => {
        setFieldsLoading(true);
        try {
            const res: any = await CardsModuleService.getActiveCardDynamicFeilds(cardId);
            if (res.ok) {
                const fields = Array.isArray(res?.data) ? res?.data : [];
                if (setDynamicFields) {
                    setDynamicFields(fields);
                }
            }
        } catch (error) {
            console.error(isErrorDispaly(error));
        } finally {
            setFieldsLoading(false);
        }
    };

    const getPersonalCustomerDetailsInfo = async () => {
        const pageSize = 10;
        const pageNo = 1;
        try {
            const response: any = await CardsModuleService?.cardsAddressGet(pageNo, pageSize);
            if (response?.ok) {
                const addressesList = response?.data?.data.map((item: any) => ({
                    id: item?.id,
                    favoriteName: `${item?.favoriteName || item?.fullName || item?.id} (${item?.addressType})`,
                    name: `${item?.favoriteName || item?.fullName || item?.id} (${item?.addressType})`,
                    isDefault: item?.isDefault || false,
                }));
                setAddresses(addressesList);
                setAddressesDetails(response?.data?.data);
                
                const defaultAddress = addressesList.find((addr: any) => addr.isDefault);
                if (defaultAddress && !selectedAddress) {
                    setSelectedAddress(defaultAddress);
                    const addressDetail = response?.data?.data?.find((addr: any) => addr?.id === defaultAddress?.id);
                    if (addressDetail) {
                        // Auto-bind default address data to form
                        // This will be handled in the formik render function
                    }
                }
            }
        } catch (error) {
            console.error(isErrorDispaly(error));
        }
    };

    const handleAddress = (addressName: any, setFieldValue: any) => {
        const address = addresses?.find((item: any) => item?.name === addressName);
        if (address) {
            setSelectedAddress(address);
            setFieldValue(FORM_DATA_CONSTANTS.ADDRESS, addressName);
            setFieldValue('shippingAddressId', address.id);            
            const addressDetail = addressesDetails?.find((addr: any) => addr?.id === address?.id);
            if (addressDetail) {
                setFieldValue('addressLine1', addressDetail?.addressLine1 || "");
                setFieldValue('addressLine2', addressDetail?.addressLine2 || "");
                setFieldValue('city', addressDetail?.city || "");
                setFieldValue('state', addressDetail?.state || "");
                setFieldValue('postalCode', addressDetail?.postalCode || "");
                setFieldValue('addressCountry', addressDetail?.country || "");
                setFieldValue('town', addressDetail?.town || "");
            }
        }
    };
    const handleAddAddress = () => {
        setAddAddressModalVisible(true);
    };

    const handleCloseAddAddressModal = () => {
        setAddAddressModalVisible(false);
    };

    const handleAddressSaveSuccess = () => {
        setAddAddressModalVisible(false);
        getPersonalCustomerDetailsInfo();
    };


    const selectHaveCard = async (type: any) => {
        if ((type === FORM_DATA_CONSTANTS.HAVE_CARD && iHaveCard.haveCard) || (type === FORM_DATA_CONSTANTS.SEND_CARD && iHaveCard.sendCard)) {
            return;
        }
        let newIHaveCardState = { haveCard: false, sendCard: false };
        if (type === FORM_DATA_CONSTANTS.HAVE_CARD) {
            newIHaveCardState = { haveCard: true, sendCard: false };
        } else if (type === FORM_DATA_CONSTANTS.SEND_CARD

        ) {
            newIHaveCardState = { haveCard: false, sendCard: true };
        }
        setIHaveCard(newIHaveCardState);
        if (selectedAssetForDisplay) {
            await getApplyCardDeatilsInfo(selectedAssetForDisplay.id, newIHaveCardState.haveCard);
        }
    };


    // Create combined initial values - only include dynamic fields when iHaveCard is true
    const combinedInitialValues = {
        ...initialFormValues,
        ...(iHaveCard?.haveCard ? createDynamicInitialValues(dynamicFields || []) : {})
    };

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={[{ flexGrow: 1 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
        >
            <Formik
                initialValues={combinedInitialValues}
                validationSchema={iHaveCard?.haveCard ? createDynamicValidationSchema(dynamicFields || []) : undefined}
                validateOnBlur={true}
                validateOnChange={true}
                enableReinitialize
                onSubmit={onSubmitForm}>
                {(formikProps: any) => {
                    const { touched, errors, handleBlur, values, setFieldValue, handleChange, handleSubmit }: {
                        touched: any;
                        errors: any;
                        handleBlur: any;
                        values: ApplyCardFormValues;
                        setFieldValue: any;
                        handleChange: any;
                        handleSubmit: any;
                    } = formikProps;    
                    useEffect(() => {
                        if (selectedAssetForDisplay) {
                            setFieldValue("currency", selectedAssetForDisplay.code, false);
                        } else {
                            setFieldValue("currency", "", false);
                        }
                    }, [selectedAssetForDisplay, setFieldValue]);

                    useEffect(() => {
                        const defaultAddress = addresses.find((addr: any) => addr.isDefault);
                        if (defaultAddress && !values.address) {
                            handleAddress(defaultAddress.name, setFieldValue);
                        }
                    }, [addresses, setFieldValue]);

                    return (
                        <ViewComponent>
                            <ViewComponent style={[commonStyles.coinselector]}>  
                            <CommonDropdown
                                data={coinWithCurrencyListForSelector}
                                selectedItem={selectedAssetForDisplay}
                                onSelect={handleCurrencySelect}
                                placeholder={t('GLOBAL_CONSTANTS.SELECT_CURRENCY')}
                                renderItem={(item, isSelected) => (
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, isSelected && commonStyles.inputdropdowntabactivebg, commonStyles.gap8, commonStyles.p10, commonStyles.py8, commonStyles.mt4]}>
                                        <ViewComponent style={{ width: s(32), height: s(32) }}>
                                            <ImageUri
                                                uri={CoinImages[item?.code?.toLowerCase()] || item.coinImage}
                                                width={s(30)}
                                                height={s(30)}
                                                style={{ borderRadius: s(18) }}
                                            />
                                        </ViewComponent>
                                        <ViewComponent style={commonStyles.flex1} >
                                            <ParagraphComponent style={[commonStyles.inputdropdowntext]}>
                                                {item.code}
                                            </ParagraphComponent>
                                        </ViewComponent>
                                        <CurrencyText value={item?.amount || 0} decimalPlaces={4} style={[commonStyles.availbleamount]}/>
                                    </ViewComponent>
                                )}
                                dropdownHeight={s(300)}
                            />
</ViewComponent>
                            <ViewComponent style={[commonStyles.availablecontentcenter]}>

                            {selectedAssetForDisplay && (
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyend,commonStyles.mt8]}>
                                    <ParagraphComponent
                                        style={[commonStyles.availblelabel]}
                                        text={`${t('GLOBAL_CONSTANTS.AVAILABLE_BALANCES')}`}
                                    />
                                    <CurrencyText
                                        value={selectedAssetForDisplay?.amount ?? 0}
                                        currency={selectedAssetForDisplay.code}
                                        style={[commonStyles.availbleamount]}
                                        decimalPlaces={4}
                                    />
                                </ViewComponent>
                            )}
                                                    </ViewComponent>

                            <ViewComponent style={[commonStyles.sectionGap]} />
                            {cardsFeeInfo && selectedAssetForDisplay && (<>
                                <ViewComponent style={[commonStyles.sectionGap]}>
                                    <ViewComponent>
                                        <TextMultiLangauge style={[commonStyles.transactionamounttextlabel]} text={"GLOBAL_CONSTANTS.AMOUNT_TO_BE_PAID"} />
                                    </ViewComponent>
                                    <ParagraphComponent style={[commonStyles.amountTobePaidtext]}>
                                        <CurrencyText
                                            value={cardsFeeInfo?.estimatedPaymentAmount !== null ? cardsFeeInfo?.estimatedPaymentAmount : 0}
                                            style={[commonStyles.transactionamounttext]}
                                            decimalPlaces={4}    smallDecimal={isDecimalSmall}
                                        />
                                        <ParagraphComponent text={` ${cardsFeeInfo?.paymentCurrency}`} style={[commonStyles.transactionamounttext]} />
                                    </ParagraphComponent>
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.dflex,commonStyles.gap6,commonStyles.alignStart,commonStyles.sectionGap,commonStyles.bgnote]}>
                                    <MaterialIcons name="info-outline" size={s(16)} color={NEW_COLOR.NOTE_ICON} />
                                    <TextMultiLangauge style={[commonStyles.bgNoteText,commonStyles.flex1]} text={"GLOBAL_CONSTANTS.IT_IS_EXPECT_TO_ARRIVE"} />
                                </ViewComponent>
                                {cardsFeeInfo.cardType?.toLowerCase() === 'physical' &&
                                    <ViewComponent style={[]}>
                                        <CommonTouchableOpacity onPress={() => selectHaveCard(FORM_DATA_CONSTANTS.HAVE_CARD)} >
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
                                                <MaterialCommunityIcons
                                                    name={iHaveCard?.haveCard === true ? 'checkbox-outline' : 'checkbox-blank-outline'} size={s(22)}
                                                    color={iHaveCard?.haveCard === true ? NEW_COLOR.BUTTON_BG : NEW_COLOR.TEXT_link}
                                                    onPress={() => selectHaveCard(FORM_DATA_CONSTANTS.HAVE_CARD)}
                                                />
                                                <TextMultiLangauge style={[commonStyles.checkboxcardtext, commonStyles.flex1]} text={"GLOBAL_CONSTANTS.IHAVE_THE_CARD_ON_HAND"} />
                                            </ViewComponent>
                                        </CommonTouchableOpacity>
                                        <ViewComponent style={[commonStyles.titleSectionGap]} />
                                        <CommonTouchableOpacity onPress={() => selectHaveCard(FORM_DATA_CONSTANTS.SEND_CARD)} >
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16,iHaveCard?.sendCard&&commonStyles.formItemSpace]}>
                                                <MaterialCommunityIcons
                                                    name={iHaveCard?.sendCard === true ? 'checkbox-outline' : 'checkbox-blank-outline'} size={s(22)}
                                                    color={iHaveCard?.sendCard === true ? NEW_COLOR.BUTTON_BG : NEW_COLOR.TEXT_link}
                                                    onPress={() => selectHaveCard(FORM_DATA_CONSTANTS.SEND_CARD)}
                                                />
                                                <TextMultiLangauge style={[commonStyles.checkboxcardtext, commonStyles.flex1]} text={"GLOBAL_CONSTANTS.PLEASE_SEND_A_CARD_TO_ME"} />
                                            </ViewComponent>
                                        </CommonTouchableOpacity>
                                        <ViewComponent style={[commonStyles.sectionGap,]}>

                                       {iHaveCard?.sendCard &&(<ViewComponent style={[]}>
                                            {/* ADDRESS HEADER */}
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb2]}>
                                                <LabelComponent style={[commonStyles.inputLabel]} text={t("GLOBAL_CONSTANTS.SELECT_DELIVERY_ADDRESS")}>
                                                    <LabelComponent text={"*"} style={commonStyles.textError} />
                                                </LabelComponent>
                                                <ViewComponent style={[commonStyles.actioniconbg, { marginTop: s(-8) }]}>
                                                    <MaterialIcons name="add" size={s(22)} color={NEW_COLOR.DARK_TEXT_WHITE} onPress={handleAddAddress} />
                                                </ViewComponent>
                                            </ViewComponent>

                                            {/* ADDRESS SELECTION */}
                                            <Field
                                                activeOpacity={0.9}
                                                touched={touched.address}
                                                name={FORM_DATA_CONSTANTS.ADDRESS}
                                                modalTitle={"GLOBAL_CONSTANTS.ADDRESS"}
                                                data={addresses}
                                                onChange={(value: any) => handleAddress(value, setFieldValue)}
                                                error={errors?.address}
                                                value={values?.address}
                                                handleBlur={handleBlur}
                                                customContainerStyle={{}}
                                                placeholder={"GLOBAL_CONSTANTS.SELECT_ADDRESS"}
                                                component={CustomPicker}
                                                isOnlycountry={true}
                                            />

                                            {/* SELECTED ADDRESS PREVIEW */}
                                            {values?.address && (
                                                <ViewComponent>
                                                    <View style={commonStyles.mt8} />
                                                    <TouchableOpacity style={[commonStyles.relative, commonStyles.bgnote]} disabled>
                                                        <View style={[
                                                            commonStyles.dflex,
                                                            commonStyles.gap16,
                                                            commonStyles.alignStart,
                                                            commonStyles.notebg,
                                                            commonStyles.rounded5,
                                                            commonStyles.p8,
                                                            commonStyles.mt4
                                                        ]}>
                                                            <View style={[commonStyles.flex1]}>
                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                                                                    <View style={[commonStyles.dflex, commonStyles.gap8, commonStyles.mb2]}>
                                                                        <ParagraphComponent
                                                                            style={[commonStyles.twolettertext, commonStyles.textCenter]}
                                                                            text={
                                                                                values?.address?.length > 40
                                                                                    ? `${values?.address?.slice(0, 8)}...${values?.address?.slice(-8)}`
                                                                                    : values?.address ?? "--"
                                                                            }
                                                                        />
                                                                    </View>
                                                                </ViewComponent>
                                                                <View>
                                                                    <ParagraphComponent
                                                                        text={[
                                                                            values?.addressLine1,
                                                                            values?.addressLine2,
                                                                            values?.town,
                                                                            values?.city,
                                                                            values?.state,
                                                                            values?.addressCountry?.length > 10
                                                                                ? `${values?.addressCountry?.slice(0, 8)}...${values?.addressCountry?.slice(-8)}`
                                                                                : values?.addressCountry,
                                                                            values?.postalCode
                                                                        ]?.filter(Boolean)?.join(", ") || "--"}
                                                                        style={[commonStyles.secondparatext]}
                                                                    />
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                </ViewComponent>
                                            )}
                                        </ViewComponent>)}
                                        {iHaveCard?.haveCard && (
                                            <ViewComponent style={[commonStyles.mt24]}>
                                                {fieldsLoading ? (
                                                    <Loadding contenthtml={cardDynamicFeildRenderLoader(dynamicFields?.length || 0)} />
                                                ) : (
                                                    <FeePhysicalCardApply
                                                        touched={touched}
                                                        errors={errors}
                                                        handleBlur={handleBlur}
                                                        values={values}
                                                        setFieldValue={setFieldValue}
                                                        handleChange={handleChange}
                                                        envelopeNoRequired={cardsFeeInfo?.envelopeNoRequired}
                                                        needPhotoForActiveCard={cardsFeeInfo?.needPhotoForActiveCard}
                                                        additionalDocforActiveCard={cardsFeeInfo?.additionaldocForActiveCard}
                                                        cardId={cardId}
                                                        dynamicFields={dynamicFields || []}
                                                    />
                                                )}
                                            </ViewComponent>
                                        )}
                                      </ViewComponent>
                                    </ViewComponent>
                                }
                                {cardFeeDetailsLoading && (
                                    <Loadding contenthtml={cardFeeLoader} />
                                )}
                                {!cardFeeDetailsLoading && cardsFeeInfo && (
                                    <ViewComponent style={[]}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap,commonStyles.gap8,commonStyles.listbannerbg]}>
                                            <TextMultiLangauge style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.ISSUING_FEE"} />
                                            <CurrencyText value={cardsFeeInfo?.issuingFee ?? 0} decimalPlaces={4} currency={cardsFeeInfo?.paymentCurrency} style={[commonStyles.listprimarytext]} />
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.listitemGap]} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap,commonStyles.gap8,commonStyles.listbannerbg]}>
                                            <TextMultiLangauge style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.FIRST_RECHARGE_AMOUNT"} />
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                                <CurrencyText value={cardsFeeInfo?.firstRecharge ?? 0} currency={cardsFeeInfo?.cardCurrency} style={[commonStyles.listprimarytext]} />
                                            </ViewComponent>
                                        </ViewComponent>
                                        {(iHaveCard?.haveCard || iHaveCard?.sendCard) && cardsFeeInfo.cardType?.toLowerCase() === 'physical' && <>
                                            <ViewComponent style={[commonStyles.listitemGap]} />
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap,commonStyles.gap8,commonStyles.listbannerbg]}>
                                                <TextMultiLangauge style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.FRIGHT_FEE"} />
                                                <ViewComponent style={[]}>
                                                    <CurrencyText value={cardsFeeInfo?.freightFee ?? 0} currency={cardsFeeInfo?.paymentCurrency} decimalPlaces={4} style={[commonStyles.listprimarytext]} />
                                                </ViewComponent>
                                            </ViewComponent>
                                        </>}
                                        <ViewComponent style={[commonStyles.listitemGap]} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap,commonStyles.gap8,commonStyles.listbannerbg]}>
                                            <TextMultiLangauge style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.ESTIMATED_PAYMENT_AMOUNT"} />
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter,]}>
                                                <CurrencyText value={cardsFeeInfo?.estimatedPaymentAmount ?? 0} currency={cardsFeeInfo?.paymentCurrency} decimalPlaces={4} style={[commonStyles.listprimarytext]} />
                                            </ViewComponent>
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.listitemGap]} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap,commonStyles.gap8,commonStyles.listbannerbg]}>
                                            <TextMultiLangauge style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.PAYMENT_CURRENCY"} />
                                                <ParagraphComponent text={`${cardsFeeInfo?.paymentCurrency}`} style={[commonStyles.listprimarytext]} />
                                        </ViewComponent>
                                    </ViewComponent>)}
                            </>)}
                            <ViewComponent style={[commonStyles.sectionGap]} />
                            <ViewComponent style={[commonStyles.sectionGap]} />

                            <ButtonComponent
                                title={`${t("GLOBAL_CONSTANTS.PAY")}`}
                                disable={btnLoading || !cardsFeeInfo || !selectedAssetForDisplay} // Disable if no fee info or no asset selected
                                loading={btnLoading}
                                onPress={handleSubmit}
                            />
                            <ViewComponent style={[commonStyles.mb43]} />
                        </ViewComponent>
                    );
                }}
            </Formik>
            <AddCardsAddress
                isVisible={isAddAddressModalVisible}
                onClose={handleCloseAddAddressModal}
                onSaveSuccess={handleAddressSaveSuccess}
            />
        </KeyboardAwareScrollView>
    );
};

export default ApplyCardForm;

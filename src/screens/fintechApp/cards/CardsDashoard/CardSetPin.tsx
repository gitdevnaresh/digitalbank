import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Container from '../../../../newComponents/container/container';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import ViewComponent from '../../../../newComponents/view/view';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import CardsModuleService from '../../../../apiServices/card';
import { isErrorDispaly } from '../../../../utils/helpers';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { CurrencyText } from '../../../../newComponents/textComponets/currencyText/currencyText';
import { getTabsConfigation } from '../../../../../configuration';
import ButtonComponent from '../../../../newComponents/buttons/button';
import FileUpload from '../../../../newComponents/fileUpload/fileUpload';
import SignatureDrawer from '../../../../newComponents/signature/signature';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import ProfileService from '../../../../apiServices/profile';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import KeyboardAvoidingWrapper from '../../../commonScreens/keyBoardAvoidingView';
import ScrollViewComponent from '../../../../newComponents/scrollView/scrollView';
import { s } from '../../../../newComponents/theme/scale';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import NoDataComponent from '../../../../newComponents/noData/noData';
import { showAppToast } from '../../../../newComponents/toasterMessages/ShowMessage';

const CardSetPin: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
    const { CardsInfoData, cardId } = route?.params || {};
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const currency = getTabsConfigation('CURRENCY');
    const [pinIFrameDetails, setPinIFrameDetails] = useState<string>('');
    const [webViewLoading, setWebViewLoading] = useState(false);
    const [iframeLoading, setIframeLoading] = useState(false);
    const [isSignatureDrawerVisible, setIsSignatureDrawerVisible] = useState(false);
    const [loadingState, setLoadingState] = useState({ signature: false });
    const [fileNames, setFileNames] = useState({ signature: '' });
    const { t } = useLngTranslation();
    const [errormsg, setErrormsg] = useState<Error | null>(null);
    const validationSchema = Yup.object().shape({
        signature: Yup.string().required(t('GLOBAL_CONSTANTS.IS_REQUIRED')),
    });

    useEffect(() => {
        if (cardId) {
            getCardPinIframe(cardId);
        }
    }, [cardId]);
    const getCardPinIframe = async (cardId: string) => {
        setIframeLoading(true);
        setErrormsg(null);
        try {
            const response: any = await CardsModuleService.getSetPinIframe(cardId);
            if (response?.ok) {
                setPinIFrameDetails(response?.data);
                setErrormsg(null);
            } else {
                setErrormsg(isErrorDispaly(response?.data));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setIframeLoading(false);
        }
    };
    const handleImageUpload = async (source: 'camera' | 'library', setFieldValue: any) => {
        setLoadingState(prev => ({ ...prev, signature: true }));
        try {
            const permissionResult =
                source === 'camera'
                    ? await ImagePicker.requestCameraPermissionsAsync()
                    : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) return;

            const result =
                source === 'camera'
                    ? await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.5 })
                    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.5 });

            if (result.canceled) return;

            const selectedImage = result.assets[0];

            const localUri = selectedImage.uri;
            setFieldValue('signaturePreview', localUri);

            const fileName = selectedImage.fileName || localUri.split('/').pop() || `image_${Date.now()}.jpg`;
            const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
            setFileNames(prevState => ({ ...prevState, signature: fileName }));

            const formData = new FormData();
            formData.append('document', {
                uri: localUri,
                type: `image/${fileExtension}`,
                name: fileName,
            } as any);

            const uploadRes = await ProfileService.uploadFile(formData);
            if (uploadRes?.status === 200) {
                const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : '';
                // store server value (id/path) as signature
                setFieldValue('signature', uploadedImage);
            }
        } catch (error) {
            console.error(isErrorDispaly(error));
        } finally {
            setLoadingState(prev => ({ ...prev, signature: false }));
        }
    };

    const handleDrawnSignatureSaved = async (signatureBase64: string, setFieldValue: any) => {
        setIsSignatureDrawerVisible(false);
        if (!signatureBase64) return;
        setFieldValue('signature', '');
        setLoadingState(prev => ({ ...prev, signature: true }));

        try {
            const fileName = `signature_${Date.now()}.png`;
            const filePath = FileSystem.documentDirectory + fileName;
            const base64Code = signatureBase64.split('data:image/png;base64,')[1];

            // write file locally for preview
            await FileSystem.writeAsStringAsync(filePath, base64Code, {
                encoding: FileSystem.EncodingType.Base64,
            });

            setFileNames(prevState => ({ ...prevState, signature: fileName }));
            setFieldValue('signaturePreview', filePath); // local filePath works for preview

            const formData = new FormData();
            formData.append('document', { uri: filePath, type: 'image/png', name: fileName } as any);

            const uploadRes = await ProfileService.uploadFile(formData);
            if (uploadRes?.status === 200) {
                const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : '';
                setFieldValue('signature', uploadedImage); // server path/id
            }
        } catch (error) {
            console.error(isErrorDispaly(error));
        } finally {
            setLoadingState(prev => ({ ...prev, signature: false }));
        }
    };

    const handleSetPinSave = async (values: any) => {
        try {
            const obj: any = {
                cardId,
                customerId: userInfo?.id,
                signImage: values?.signature,
            };
            const response: any = await CardsModuleService.setPin(cardId, obj);
            if (response?.ok) {
                navigation.goBack();
            }
        } catch (error) {
            console.error(isErrorDispaly(error));
        }
    };

    const handleWebViewMessage = (event: any) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.success === true || message.status === 'success' || message.type === 'success') {
                showAppToast(t("GLOBAL_CONSTANTS.PIN_SET_SUCCESSFULLY"), 'success');
                navigation.goBack();
            } else if (message.success === false || message.status === 'error' || message.type === 'error') {
                showAppToast(t("GLOBAL_CONSTANTS.PIN_SETUP_FAILED"), 'error');
                navigation.goBack();
            }
        } catch (error) {
            // Handle non-JSON messages
            const messageData = event.nativeEvent.data;
            if (messageData.includes('success') || messageData.includes('completed')) {
                showAppToast(t("GLOBAL_CONSTANTS.PIN_SET_SUCCESSFULLY"), 'success');
                navigation.goBack();
            }
        }
    };

    // whether to show iframe flow form or webview
    const handleError = useCallback(() => {
        setErrormsg(null);
    }, []);
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.container, commonStyles.flex1]}>
                <PageHeader title="GLOBAL_CONSTANTS.SET_PIN" onBackPress={() => navigation.goBack()} />
                <KeyboardAvoidingWrapper
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={s(64)}
                >
                    <ScrollViewComponent contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                        {errormsg && <ErrorComponent message={errormsg} onClose={handleError} />}

                        {(CardsInfoData?.setPinFlow?.toLowerCase() === "api")&& (
                                <Formik
                                    initialValues={{ signature: '', signaturePreview: '', signatureFileName: '' }}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSetPinSave}
                                    enableReinitialize
                                >
                                    {({ handleSubmit, touched, errors, setFieldValue, values }) => (
                                        <ViewComponent style={[commonStyles.flex1, { justifyContent: 'space-between' }]}>
                                            <ViewComponent>
                                                <ViewComponent>
                                                    <ViewComponent style={[]}>
                                                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap2, commonStyles.alignCenter]}>
                                                            <CurrencyText
                                                                prifix={currency[userInfo?.currency]}
                                                                value={parseFloat(CardsInfoData?.CardsSetAmountFee) || 0}
                                                                style={[commonStyles.sectiontitlepara, commonStyles.textWhite]}
                                                            />
                                                            <ParagraphComponent
                                                                text={t('GLOBAL_CONSTANTS.A_FEE_WILL_BE_CHARGED_TO_SET_THE_PIN')}
                                                                style={[commonStyles.sectiontitlepara]}
                                                            />
                                                        </ViewComponent>
                                                    </ViewComponent>
                                                    <ViewComponent style={[commonStyles.titleSectionGap]} />
                                                    <FileUpload
                                                        fileLoader={loadingState.signature}
                                                        onSelectImage={() => setIsSignatureDrawerVisible(true)}
                                                        uploadedImageUri={values?.signature}
                                                        errorMessage={touched.signature && errors.signature ? errors.signature : ''}
                                                        fileName={fileNames?.signature}
                                                        deleteImage={() => {
                                                            setFieldValue('signature', '');
                                                            setFileNames(prev => ({ ...prev, signature: '' }));
                                                        }}
                                                        label="GLOBAL_CONSTANTS.SIGNATURE"
                                                        isRequired={true}
                                                        subLabel="GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"
                                                    />

                                                    <SignatureDrawer
                                                        isVisible={isSignatureDrawerVisible}
                                                        onClose={() => setIsSignatureDrawerVisible(false)}
                                                        onSaveDrawnSignature={(sig) => handleDrawnSignatureSaved(sig, setFieldValue)}
                                                        onRequestUpload={() => {
                                                            setIsSignatureDrawerVisible(false);
                                                            handleImageUpload('library', setFieldValue);
                                                        }}
                                                        drawOptionTextStyle={{ color: NEW_COLOR.TEXT_WHITE ?? 'white' }}
                                                        drawingSaveButtonText={t("GLOBAL_CONSTANTS.SAVE")}
                                                        drawingCancelButtonText={t("GLOBAL_CONSTANTS.CANCEL")}
                                                    />
                                                </ViewComponent>
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.sectionGap]}>
                                                <ButtonComponent title={'GLOBAL_CONSTANTS.CONTINUE'} onPress={handleSubmit} multiLanguageAllows={true} />
                                                <ViewComponent style={[commonStyles.buttongap]} />
                                                <ButtonComponent
                                                    title={'GLOBAL_CONSTANTS.CANCEL'}
                                                    onPress={() => navigation.goBack()}
                                                    multiLanguageAllows={true}
                                                    solidBackground={true}
                                                />
                                            </ViewComponent>
                                        </ViewComponent>
                                    )}
                                </Formik>
                            )}

                        {(CardsInfoData?.setPinFlow?.toLowerCase() === "iframe" ) && (
                            <ViewComponent style={[commonStyles.flex1]}>
                                {iframeLoading ? (
                                    <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                                        <ActivityIndicator size="large" color={NEW_COLOR.PRIMARY} />
                                        <ParagraphComponent text={t("GLOBAL_CONSTANTS.LOADING_PIN_SETUP")} style={[commonStyles.mt16]} />
                                    </ViewComponent>
                                ) : pinIFrameDetails ? (
                                    <ViewComponent style={[commonStyles.flex1]}>
                                        {webViewLoading && (
                                            <ViewComponent
                                                style={[
                                                    commonStyles.flex1,
                                                    commonStyles.alignCenter,
                                                    commonStyles.justifyCenter,
                                                    { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: NEW_COLOR.BACKGROUND, zIndex: 1 },
                                                ]}
                                            >
                                                <ActivityIndicator size="large" color={NEW_COLOR.PRIMARY} />
                                            </ViewComponent>
                                        )}
                                        <WebView
                                            source={{ uri: pinIFrameDetails }}
                                            style={{ flex: 1, backgroundColor: NEW_COLOR.BACKGROUND }}
                                            onLoadStart={() => {
                                                setWebViewLoading(true);
                                            }}
                                            onLoadEnd={() => {
                                                setWebViewLoading(false);
                                            }}
                                            onMessage={handleWebViewMessage}
                                            onNavigationStateChange={(navState) => {
                                                // Check if URL indicates success
                                                if (navState?.title?.toLowerCase()?.includes('success') || navState?.title?.toLowerCase()?.includes('complete')) {
                                                    showAppToast(t("GLOBAL_CONSTANTS.PIN_SET_SUCCESSFULLY"), 'success');
                                                    navigation.goBack();
                                                } else if (navState?.title?.toLowerCase()?.includes('error') || navState?.title?.toLowerCase()?.includes('failed')) {
                                                    showAppToast(t("GLOBAL_CONSTANTS.PIN_SETUP_FAILED"), 'error');
                                                    navigation.goBack();
                                                }
                                            }}
                                            javaScriptEnabled={true}
                                            domStorageEnabled={true}
                                            keyboardDisplayRequiresUserAction={false}
                                            scrollEnabled={true}
                                            nestedScrollEnabled={true}
                                            mixedContentMode="compatibility"
                                            allowsInlineMediaPlayback={true}
                                            onError={(syntheticEvent) => {
                                                const { nativeEvent } = syntheticEvent;
                                            }}
                                        />
                                    </ViewComponent>
                                ) : (
                                    <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                                        <NoDataComponent Description={t("GLOBAL_CONSTANTS.NO_I_FRAME_URL_AVAILABLE")} />
                                    </ViewComponent>
                                )}
                            </ViewComponent>
                        )}

                    </ScrollViewComponent>
                </KeyboardAvoidingWrapper>
            </Container>
        </ViewComponent>
    );
};

export default CardSetPin;


import React, { useState, useEffect, useRef } from "react";
import { LayoutAnimation, RefreshControl, useWindowDimensions } from "react-native";
import { CARD_URIS, getThemedCommonStyles } from "../../../../components/CommonStyles";
import Container from "../../../../newComponents/container/container";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ScrollViewComponent from "../../../../newComponents/scrollView/scrollView";
import CardCarousel from "../../../../newComponents/cardsCarousal/cardsCarousal";
import CardsModuleService from "../../../../apiServices/card";
import { isErrorDispaly } from "../../../../utils/helpers";
import ViewComponent from "../../../../newComponents/view/view";
import TextMultiLangauge from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import { s } from "../../../../constants/theme/scale";
import Ionicons from '@expo/vector-icons/Ionicons';
import ImageBackgroundWrapper from "../../../../newComponents/imageComponents/ImageBackground";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import { useIsFocused, useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons, SimpleLineIcons } from "@expo/vector-icons";
import CustomRBSheet from "../../../../newComponents/models/commonBottomSheet";
import ButtonComponent from "../../../../newComponents/buttons/button";
import Loadding from "../../../commonScreens/skeltons";
import ImageUri from "../../../../newComponents/imageComponents/image";
import AntDesign from '@expo/vector-icons/AntDesign';
import RenderHTML from "react-native-render-html";
import { useSelector, useDispatch } from "react-redux";
import * as types from "../../../../redux/actionTypes/actionsType";
import KycVerifyPopup from "../../../commonScreens/kycVerify";
import { sanitizeHtmlForReactNative } from "../../../../hooks/secureDomContent";
import { CardApplicationLoader } from "../../../../skeletons/cardsSkeletons";
import { CARDS_CONST } from "../CardsDashoard/constants";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import { Card, CardDetails, FaqItem, RBSheetRef, RootState } from "./interface";
import { iconsList } from "../../../../constants/coinsList/coinsLIst";
import { useHardwareBackHandler } from "../../../../hooks/backHandleHook";
import FlatListComponent from "../../../../newComponents/flatList/flatList";
import { CREATE_KYC_ADDRESS_CONST } from "./constants";
import NoDataComponent from "../../../../newComponents/noData/noData";
import useMemberLogin from "../../../../hooks/userInfoHook";

/**
 * AllCards Component - Card Application Screen
 * 
 * OVERVIEW:
 * This component handles card application with dynamic terms and conditions.
 * It supports both static HTML content and dynamic checkbox systems.
 * 
 * KEY FEATURES:
 * 1. DYNAMIC CHECKBOX SYSTEM:
 *    - Parses JSON data from API to create interactive checkboxes
 *    - Each checkbox can contain multiple document links (E-Sign, Terms, Privacy)
 *    - Auto-enables checkboxes when ALL required documents are read
 *    - Supports any combination of document types dynamically
 * 
 * 2. DOCUMENT READING WORKFLOW:
 *    - Opens documents in RBSheet modals
 *    - Tracks which documents have been read via readDocuments state
 *    - Updates checkbox states automatically when documents are read
 * 
 * 3. ERROR HANDLING:
 *    - Shows NoDataComponent when content fails to load
 *    - Uses constants for consistent error messages
 *    - Graceful fallbacks for API failures
 * 
 * 4. REDUX INTEGRATION:
 *    - Stores accepted terms data for API submission
 *    - Maps checkbox states to accepted terms format
 * 
 * DATA STRUCTURE EXAMPLE:
 * {
 *   "noteType": "Dynamic",
 *   "note": "[{\"displayType\": \"checkbox\", \"isRequired\": true, \"title\": \"<a data-action='E_SIGN_CONSENT'>E-Sign</a>\"}]"
 * }
 */

const TARGET_CAROUSEL_ITEM_HEIGHT = s(217);
const SPACE_FOR_DOTS = s(24);

const AllCards = (props: any) => {
    const [errorMsg, setErrormsg] = useState<string>("");
    const [availableCards, setAvailableCards] = useState<Card[]>([]);
    const [activeCard, setActiveCard] = useState<Card | null>(null);
    const navigation = useNavigation<any>();
    const [cardDetails, setCardDetails] = useState<CardDetails | undefined>();
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const rbSheetRef = useRef<RBSheetRef>(null);
    const rbSheetRef1 = useRef<RBSheetRef>(null);
    const [AccordionData, setAccordionData] = useState<FaqItem[]>([]);
    const ApplyCardSkeleton = CardApplicationLoader();
    const [cardDetailLoading, setCardsDetailsLoading] = useState<boolean>(true)
    const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
    const consumptionMethod = cardDetails?.info?.find(item => item.title === "Consumption Method");
    const cardCurrency = cardDetails?.info?.find(item => item.title === "Card Currency");
    const isFocussed = useIsFocused();
    const [supportedPlatforms, setSupportedPlatforms] = useState<string[]>([]);
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const [kycModelVisible, setKycModelVisible] = useState<boolean>(false);
    const userInfo = useSelector((state: RootState) => state.userReducer.userDetails);
    const dispatch = useDispatch();
    const { width } = useWindowDimensions();
    const activeCardRef = useRef<string | null>(null);
    const rbSheetRef2 = useRef<RBSheetRef>(null)
    const dynamicRBSheetRef = useRef<RBSheetRef>(null)
    const [currentSheetType, setCurrentSheetType] = useState<'esign' | 'cardterms' | 'privacy' | null>(null)
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [screenLoading, setScreenLoading] = useState<boolean>(true);
    const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
    const [dynamicCheckboxes, setDynamicCheckboxes] = useState<{ [key: number]: boolean }>({});
    const [eSignContent, setESignContent] = useState<string>('');
    const [eSignLoading, setESignLoading] = useState<boolean>(false);
    const [eSignAgreed, setESignAgreed] = useState<boolean>(false);
    const [disabledCheckboxes, setDisabledCheckboxes] = useState<{ [key: number]: boolean }>({});
    const [eSignCheckboxes, setESignCheckboxes] = useState<{ [key: number]: boolean }>({});
    const [originalESignState, setOriginalESignState] = useState<boolean>(false);
    const [cardTermsContent, setCardTermsContent] = useState<string>('');
    const [cardTermsLoading, setCardTermsLoading] = useState<boolean>(false);
    const [privacyPolicyContent, setPrivacyPolicyContent] = useState<string>('');
    const [privacyPolicyLoading, setPrivacyPolicyLoading] = useState<boolean>(false);
    const [cardTermsAgreed, setCardTermsAgreed] = useState<boolean>(false);
    const [privacyPolicyAgreed, setPrivacyPolicyAgreed] = useState<boolean>(false);
    const [hasReadCardTerms, setHasReadCardTerms] = useState<boolean>(false);
    const [hasReadPrivacyPolicy, setHasReadPrivacyPolicy] = useState<boolean>(false);
    // DYNAMIC DOCUMENT TRACKING:
    // Tracks which documents have been read by their action type (E_SIGN_CONSENT, PRIVACY_POLICY, etc.)
    // Used to auto-enable checkboxes when all required documents for that checkbox are read
    const [readDocuments, setReadDocuments] = useState<{ [key: string]: boolean }>({});
    const [cardTermsError, setCardTermsError] = useState<string>('');
    const [privacyPolicyError, setPrivacyPolicyError] = useState<string>('');
    const [rbSheetError, setRbSheetError] = useState<string>('');
    const { getMemDetails } = useMemberLogin();
    const [cardkycModelVisible, setCardkycModelVisible] = useState(false);
    const [refresh, setRefresh] = useState<boolean>(false);

    const onRefresh = async () => {
        setRefresh(true);
        setScreenLoading(true);
        try {
            // Reset flag
            setAgreedToTerms(false);
            // Reset API status
            setApiCallsCompleted({
                allCards: false,
                cardFaqs: false,
                cardDetails: !(activeCard && activeCard.programId),
            });
            // Run APIs in parallel
            await Promise.all([
                getAllCard(),
                getCardFaqs(),
                await getcardDetails(),
                getSupportedPlatforms()

            ]);
        } catch (error) {
        } finally {
            setScreenLoading(false);
            setRefresh(false);
        }
    };
    const handleAgreeToTerms = () => {
        setAgreedToTerms(prev => !prev);
    };

    /**
     * PARSE DYNAMIC NOTE DATA
     * 
     * Converts JSON string from API into checkbox data array.
     * Only processes when noteType is 'Dynamic', otherwise returns empty array.
     * 
     * INPUT FORMAT: JSON string like:
     * "[{\"displayType\": \"checkbox\", \"isRequired\": true, \"title\": \"<a data-action='E_SIGN_CONSENT'>E-Sign</a>\"}]"
     * 
     * OUTPUT: Array of checkbox objects with title, isRequired, displayType properties
     */
    const parseNoteData = () => {
        if (cardDetails?.noteType !== 'Dynamic') {
            return [];
        }
        try {
            const parsed = cardDetails?.note ? JSON.parse(cardDetails.note) : [];
            return parsed;
        } catch (error) {
            // Return empty array if JSON parsing fails
            return [];
        }
    };

    const handleDynamicCheckboxChange = (index: number) => {
        if (disabledCheckboxes[index]) return;

        setRbSheetError('');

        setDynamicCheckboxes(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    /**
     * VALIDATION: Check if all required checkboxes are checked
     * Used to enable/disable the "I've Read" submit button
     */
    const areAllRequiredCheckboxesChecked = () => {
        const noteItems = parseNoteData();
        const allChecked = noteItems.every((item: any, index: number) =>
            !item.isRequired || dynamicCheckboxes[index]
        );
        return allChecked;
    };
    const source = {
        html: sanitizeHtmlForReactNative(cardDetails?.note) || `${cardDetails?.note || ''}`
    };
    const [apiCallsCompleted, setApiCallsCompleted] = useState({
        allCards: false,
        cardFaqs: false,
        cardDetails: true,
    });
    useFocusEffect(
        React.useCallback(() => {
            setCardkycModelVisible(false);
            setKycModelVisible(false);
        }, [])
    );
    useHardwareBackHandler(() => {
        handleBack()
    });

    useEffect(() => {
        if (isFocussed) {
            setAgreedToTerms(false)
            setDynamicCheckboxes({});
            setDisabledCheckboxes({});
            setESignCheckboxes({});
            setCardTermsAgreed(false);
            setPrivacyPolicyAgreed(false);
            setHasReadCardTerms(false);
            setHasReadPrivacyPolicy(false);
            setReadDocuments({});
            setRbSheetError('');
            setScreenLoading(true);
            const fetchData = async () => {
                setApiCallsCompleted({
                    allCards: false,
                    cardFaqs: false,
                    cardDetails: !(activeCard && activeCard.programId),
                });
                await getAllCard();
                await getCardFaqs();
            };
            fetchData();
        }
        getMemDetails(true)

    }, [isFocussed]);

    useEffect(() => {
        if (isFocussed && activeCard && activeCard.programId) {
            setCardsDetailsLoading(true);
            setApiCallsCompleted(prev => ({ ...prev, cardDetails: false }));
            getcardDetails();
            getSupportedPlatforms();

        } else if (isFocussed) {
            setCardsDetailsLoading(false);
            setApiCallsCompleted(prev => ({ ...prev, cardDetails: true }));
        }
    }, [activeCard, isFocussed]);

    useEffect(() => {
        const allDone = Object.values(apiCallsCompleted).every(status => status === true);
        if (allDone) {
            if (apiCallsCompleted.allCards && apiCallsCompleted.cardFaqs && apiCallsCompleted.cardDetails) {
                setScreenLoading(false);
            }
        }
    }, [apiCallsCompleted]);
    const getSupportedPlatforms = async () => {
        try {
            const response = await CardsModuleService.getSupportedPlatforms(activeCard?.programId);
            if (response?.ok && response?.data) {
                let platforms = response.data;
                if (typeof platforms === 'string') {
                    try {
                        platforms = JSON.parse(platforms);
                    } catch {
                        platforms = platforms.split(',').map((p: string) => p.trim()).filter(p => p.length > 0);
                    }
                }
                setSupportedPlatforms(Array.isArray(platforms) ? platforms : []);
            } else {
                setSupportedPlatforms([]);
            }
        } catch (error) {
            setSupportedPlatforms([]);
        }
    }


    /**
     * Auto-enable checkboxes when documents are read
     * Updates checkbox states based on document read status dynamically
     */
    useEffect(() => {
        const noteItems = parseNoteData();
        const updatedCheckboxes: { [key: number]: boolean } = {};

        noteItems.forEach((item: any, index: number) => {
            // Extract all links from the item title
            const linkMatches = item?.title?.match(/<a[^>]*data-action=['"](.*?)['"][^>]*>/g) || [];
            const requiredActions = linkMatches.map((match: string) => {
                const actionMatch = match.match(/data-action=['"](.*?)['"]/);;
                return actionMatch ? actionMatch[1] : null;
            }).filter(Boolean);

            if (requiredActions.length > 0) {
                // Check if all required documents for this checkbox have been read
                const allDocumentsRead = requiredActions.every((action: string) => readDocuments[action]);
                updatedCheckboxes[index] = allDocumentsRead;
            }
        });

        setDynamicCheckboxes(prev => ({
            ...prev,
            ...updatedCheckboxes
        }));
    }, [readDocuments, cardDetails?.note]);

    useEffect(() => {
        if (cardDetails?.note) {
            try {
                const parsed = JSON.parse(cardDetails.note);
                const eSignIndexes: { [key: number]: boolean } = {};
                parsed.forEach((item: any, index: number) => {
                    if (item.title?.includes('E_SIGN_CONSENT') || item.title?.includes('esign-consent')) {
                        eSignIndexes[index] = true;
                    }
                });
                setESignCheckboxes(eSignIndexes);
            } catch (error) {
                setRbSheetError(isErrorDispaly(error));
                setESignCheckboxes({});
            }
        }
    }, [cardDetails?.note]);

    const toggleItem = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded((prevState) => ({
            [index]: !prevState[index]
        }));
    };
    const getAllCard = async () => {
        setErrormsg("");
        try {
            const response = await CardsModuleService.getApplyCards(10, 1);
            if (response?.ok) {
                const fetchedCards: Card[] = Array.isArray(response.data) ? response.data as Card[] : [];
                setAvailableCards(fetchedCards);
                setErrormsg("");
                if (fetchedCards?.length > 0 && (!activeCard || !fetchedCards?.find((c: Card) => c.programId === activeCard.programId))) {
                    setActiveCard(fetchedCards[0]);
                    setActiveCardIndex(0);
                }
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error: unknown) {
            setErrormsg(isErrorDispaly(error));
        }
        finally {
            setApiCallsCompleted(prev => ({ ...prev, allCards: true }));
        }
    };
    const getcardDetails = async () => {
        try {
            const response: any = await CardsModuleService.getApplyCardDeatils(activeCard?.programId ?? "");
            if (response?.ok) {
                setCardDetails(response?.data);
                setCardsDetailsLoading(false);
                setErrormsg("");
            } else {
                setErrormsg(isErrorDispaly(response));
                setCardsDetailsLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setCardsDetailsLoading(false);
        }
        finally {
            setApiCallsCompleted(prev => ({ ...prev, cardDetails: true }));
        }
    };
    const getCardFaqs = async () => {
        try {
            const response: any = await CardsModuleService.getApplyCardFaq();
            if (response?.ok) {
                setAccordionData(response?.data?.faQs)
                setErrormsg("");
            }
        }
        catch (error) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setApiCallsCompleted(prev => ({ ...prev, cardFaqs: true }));
        }
    }
    const handleBack = () => {
        if (props?.route?.params?.screenName === "Dashboard") {
            navigation.goBack();
        } else {
            navigation?.navigate("Dashboard", { animation: "slide_from_left", initialTab: "GLOBAL_CONSTANTS.CARDS" });

        }
    }
    const handleError = () => {
        setErrormsg("");
    };

    const handleActiveCardChange = (card: Card, index: number) => {
        if (card?.programId && card.programId !== activeCardRef.current) {
            activeCardRef.current = card.programId;
            setActiveCard(card);
            setActiveCardIndex(index);
        }
    };
    const handleExpand = () => {
        setIsExpanded(!isExpanded);
    };
    const handleShowModal = () => {
        rbSheetRef?.current?.open();
    };

    const handleIconCloseModel = () => {
        rbSheetRef?.current?.close();
    };
    const closekycModel = () => {
        setKycModelVisible(false);
    }
    const cardClosekycModel = () => {
        setCardkycModelVisible(false);
    }
    const toggleOverlay = () => {
        if (userInfo?.kycStatus?.toLowerCase() !== 'approved') {
            const kycType = cardDetails?.kycType?.toLowerCase();
            if (cardDetails?.note && cardDetails?.note !== "" && (kycType?.toLowerCase() === 'na')) {
                rbSheetRef2?.current?.open();
                setAgreedToTerms(false)
                return;
            }
            if (kycType?.toLowerCase() === 'sumsub' || kycType?.toLowerCase() === 'manual') {
                setCardkycModelVisible(true);
                return;
            }

            if (kycType === "" || kycType === null || kycType === undefined) {
                if (!userInfo?.kycStatus || userInfo?.kycStatus === "Draft" || userInfo?.kycStatus === "Submitted" || userInfo?.kycStatus?.toLowerCase() === "init") {
                    setKycModelVisible(true);
                    return;
                }
            }
        } else {
            dispatch({ type: 'SET_CARD_ID', payload: activeCard?.programId });
            if (cardDetails?.note && cardDetails?.note !== "") {
                rbSheetRef2?.current?.open();
                setAgreedToTerms(false)
                 setDynamicCheckboxes({});
                   setRbSheetError('');
                return;
            }
        }

        // navigateToApplyCard();
    };
    /**
     * SUBMIT HANDLER: Process accepted terms and navigate to next screen
     * 
     * WORKFLOW:
     * 1. Maps checkbox states to accepted terms format for API
     * 2. Stores data in Redux for next screen
     * 3. Navigates to card application form
     * 
     * DATA FORMAT SENT TO API:
     * {
     *   noteType: "Dynamic",
     *   note: [{ displayType: "checkbox", isRequired: true, title: "...", accepted: true }]
     * }
     */
    const navigateToApplyCard = () => {
        navigation.navigate("ApplyCard", {
            logo: activeCard?.image,
            cardName: activeCard?.cardName,
            cardType: activeCard?.cardType || activeCard?.type,
            cardId: activeCard?.programId,
            cardPrice: activeCard?.cardPrice,
            currency: activeCard?.currency || activeCard?.cardCurrency,
            supportedPlatforms: activeCard?.supportedPlatforms,
            kycType: cardDetails?.kycType,
            isCustomerCreated:cardDetails?.isCustomerCreated

            
        });
        rbSheetRef2?.current?.close();
    };
    const CloseOverlay = () => {
        const noteItems = parseNoteData();
        // STEP 1: Map checkbox states to API format
        const acceptedTermsData = {
            note: noteItems.map((item: any, index: number) => ({
                ...item,
                accepted: dynamicCheckboxes[index] || false // Include user's acceptance status
            })),
            noteType: cardDetails?.noteType
        };
        
        // STEP 2: Store in Redux for API submission
        dispatch({
            type: types.ACCEPTED_TERMS,
            payload: acceptedTermsData
        });
        
        // Store cardId in Redux
        dispatch({ type: 'SET_CARD_ID', payload: activeCard?.programId });
        
        // STEP 3: Navigate to card application form
        navigation.navigate("ApplyCard", {
            logo: activeCard?.image,
            cardName: activeCard?.cardName,
            cardType: activeCard?.cardType || activeCard?.type,
            cardId: activeCard?.programId,
            cardPrice: activeCard?.cardPrice,
            currency: activeCard?.currency || activeCard?.cardCurrency,
            supportedPlatforms: activeCard?.supportedPlatforms,
            isCustomerCreated:cardDetails?.isCustomerCreated

        })
        rbSheetRef2?.current?.close();

    };
    const handleNavigateManualOrSumsub = () => {
        if (cardDetails?.kycType?.toLowerCase() === 'manual') {
            navigation.navigate('KycManualNavigation', {
                cardParams: {
                    logo: activeCard?.image,
                    cardName: activeCard?.cardName,
                    cardType: activeCard?.cardType || activeCard?.type,
                    cardId: activeCard?.programId,
                    cardPrice: activeCard?.cardPrice,
                    currency: activeCard?.currency || activeCard?.cardCurrency,
                    supportedPlatforms: activeCard?.supportedPlatforms,
                    kycType: cardDetails?.kycType,
                    isCustomerCreated:cardDetails?.isCustomerCreated

                }
            })
            return;
        } else if (cardDetails?.kycType?.toLowerCase() === 'sumsub') {
            navigation.navigate('SumsubNavigation', {
                cardParams: {
                    logo: activeCard?.image,
                    cardName: activeCard?.cardName,
                    cardType: activeCard?.cardType || activeCard?.type,
                    cardId: activeCard?.programId,
                    cardPrice: activeCard?.cardPrice,
                    currency: activeCard?.currency || activeCard?.cardCurrency,
                    supportedPlatforms: activeCard?.supportedPlatforms,
                    kycType: cardDetails?.kycType,
                    isCustomerCreated:cardDetails?.isCustomerCreated
                }
            })
        }
    }

    const supportedPlotforms = (
        <ViewComponent>
            <ScrollViewComponent contentContainerStyle={{ flexGrow: 1 }}>
                <ViewComponent style={[
                    commonStyles.dflex,
                    commonStyles.justifyContent,
                    commonStyles.alignCenter,
                    commonStyles.sectionGap
                ]}>
                    {supportedPlatforms?.length > 0 ? (
                        <ParagraphComponent
                            text={supportedPlatforms.map(platform => platform.trim()).join(', ')}
                            style={[
                               commonStyles.supportplatform
                            ]}
                        />
                    ) : (
                        <TextMultiLangauge
                            text="GLOBAL_CONSTANTS.NO_SUPPORTED_PLATFORMS"
                            style={[
                                commonStyles.supportplatform,
                            ]}
                        />
                    )}
                </ViewComponent>
            </ScrollViewComponent>
            <ViewComponent>
                <ButtonComponent
                    title={"GLOBAL_CONSTANTS.CLOSE"}
                    onPress={handleIconCloseModel}
                    solidBackground={true} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]} />
        </ViewComponent>
    );
    const renderKeyValuePairs = () => {
        const keyValuePairs = cardDetails?.info || [];
        const visibleKeyValuePairs = isExpanded ? keyValuePairs : keyValuePairs.slice(0, 6);
        return (
            <>
                {visibleKeyValuePairs?.map((item: { title: string; value: string }, index: number) => (
                    <ViewComponent key={`${item.title}-${index}`}>
                        {item.title === CARDS_CONST.SUPPORTED_PLOTFORMS ? null : (
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap,commonStyles.listbannerbg]}>
                                <ParagraphComponent text={item?.title} style={[commonStyles.listsecondarytext]} />
                                <ParagraphComponent text={item?.value} style={[commonStyles.listprimarytext]} />
                            </ViewComponent>
                        )}
                        {index !== keyValuePairs?.length - 1 && item.title !== CARDS_CONST.SUPPORTED_PLOTFORMS && <ViewComponent style={[commonStyles.listitemGap]} />}
                    </ViewComponent>
                ))}
                {isExpanded && (
                    <ViewComponent>
                        {supportedPlatforms?.length > 0 && (<><ViewComponent style={[commonStyles.listGap]} />
                            <CommonTouchableOpacity onPress={() => handleShowModal()}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter,commonStyles.listbannerbg]}>
                                    <ParagraphComponent text={"GLOBAL_CONSTANTS.SUPPORTED_PLOTFORMS"} style={[commonStyles.listsecondarytext]} />
                                    <SimpleLineIcons name="arrow-right" style={[]} size={s(12)} color={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                            </CommonTouchableOpacity></>)}
                        {AccordionData?.length > 0 && (<><ViewComponent style={[commonStyles.listGap]} />
                            <CommonTouchableOpacity onPress={handleShowFaqModal}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter,commonStyles.listbannerbg]}>
                                    <ParagraphComponent text={"GLOBAL_CONSTANTS.FAQS"} style={[commonStyles.listsecondarytext]} />
                                    <SimpleLineIcons name="arrow-right" style={[commonStyles.textRight, commonStyles.mt4]} size={s(12)} color={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                            </CommonTouchableOpacity></>)}
                    </ViewComponent>
                )}
            </>
        );
    };

    const renderRules = () => {
        const rules = cardDetails?.rules || [];
        const visibleRules = isExpanded ? rules : rules.slice(0, 5);
        return (
            visibleRules?.map((item: { id: string; rule: string }, index: number) => (
                <ParagraphComponent
                    key={`${item.id}-${index}`}
                    text={` ${item?.rule}`}
                    style={[commonStyles.sectionsubtitlepara, commonStyles.mt10]}
                />
            ))
        );
    };
    const faqData = (
        <ScrollViewComponent style={[]}>
            <ViewComponent >
                {AccordionData?.map((item: FaqItem, index: number) => (
                    <ViewComponent
                        key={index}
                        style={[{ borderColor: expanded[index] ? NEW_COLOR.SECTION_BORDER : NEW_COLOR.TRANSPARENT, borderWidth: 1}, commonStyles.listitemGap, commonStyles.faqaccordianborder]} >
                        <CommonTouchableOpacity onPress={() => toggleItem(index)} activeOpacity={0.8}>
         <ViewComponent
                                style={[
                                    commonStyles.dflex,
                                    commonStyles.alignCenter,
                                    commonStyles.justifyContent,
                                    commonStyles.gap16,
                                    commonStyles.activeItemBg,
                                    {
                                        borderTopLeftRadius: s(12),
                                        borderTopRightRadius: s(12),

                                        borderBottomLeftRadius: expanded[index] ? 0 : s(12),
                                        borderBottomRightRadius: expanded[index] ? 0 : s(12),
                                    }
                                ]}
                            >                                <ParagraphComponent style={[commonStyles.flex1,]} text={item?.question} />
<Ionicons
                                    name="chevron-forward"
                                    size={s(18)}
                                    color={NEW_COLOR.TEXT_WHITE}
                                    style={{
                                        transform: [{ rotate: expanded[index] ? "90deg" : "0deg" }]
                                    }}
                                />
                                                            </ViewComponent>
                            {expanded[index] && <ViewComponent style={[commonStyles.px10]}>
                                <ParagraphComponent style={[commonStyles.accordianparatext,commonStyles.mb6]}
                                    text={item?.answer} />
                            </ViewComponent>
                            }
                        </CommonTouchableOpacity>

                    </ViewComponent>
                ))}
            </ViewComponent>
        </ScrollViewComponent>
    )
    const handleShowFaqModal = () => {
        rbSheetRef1?.current?.open();
    }
    const cancelOverlay = () => {
        setAgreedToTerms(false);
        setDynamicCheckboxes({});
        rbSheetRef2?.current?.close();
    }

    const handleESignAgreement = () => {
        setESignAgreed(prev => !prev);
    };

    const handleCardTermsAgreement = () => {
        setCardTermsAgreed(prev => !prev);
        if (cardTermsError) {
            setCardTermsError('');
        }
    };

    const handlePrivacyPolicyAgreement = () => {
        setPrivacyPolicyAgreed(prev => !prev);
        if (privacyPolicyError) {
            setPrivacyPolicyError('');
        }
    };

    /**
     * DOCUMENT READ HANDLER
     * 
     * Called when user clicks "I've Read" button in document modal.
     * Marks the document as read and triggers checkbox auto-enable logic.
     * 
     * IMPORTANT: Sets both variations of action names (e.g., 'CARD_TERMS' and 'card-terms')
     * to handle different naming conventions in dynamic data.
     */
    const handleDynamicRead = () => {
        if (currentSheetType === 'esign') {
            // Mark E-Sign document as read (supports both naming conventions)
            setReadDocuments(prev => ({ ...prev, 'E_SIGN_CONSENT': true, 'esign-consent': true }));
        } else if (currentSheetType === 'cardterms') {
            setCardTermsError('');
            setHasReadCardTerms(true);
            // Mark Card Terms document as read
            setReadDocuments(prev => ({ ...prev, 'CARD_TERMS': true, 'card-terms': true }));
        } else if (currentSheetType === 'privacy') {
            setPrivacyPolicyError('');
            setHasReadPrivacyPolicy(true);
            // Mark Privacy Policy document as read
            setReadDocuments(prev => ({ ...prev, 'PRIVACY_POLICY': true, 'privacy-policy': true }));
        }

        setRbSheetError('');
        dynamicRBSheetRef?.current?.close();
    };

    const cancelDynamicOverlay = () => {
        if (currentSheetType === 'esign') {
            const noteItems = parseNoteData();
            const eSignCheckboxIndex = noteItems.findIndex((item: any) =>
                item.title?.includes('E_SIGN_CONSENT') || item.title?.includes('esign-consent')
            );

            if (eSignCheckboxIndex !== -1) {
                setDynamicCheckboxes(prev => ({
                    ...prev,
                    [eSignCheckboxIndex]: originalESignState
                }));
            }
            setESignAgreed(false);
        } else if (currentSheetType === 'cardterms') {
            // Don't modify hasReadCardTerms or main checkbox state on cancel
            setCardTermsAgreed(false);
            setCardTermsError('');
        } else if (currentSheetType === 'privacy') {
            // Don't modify hasReadPrivacyPolicy or main checkbox state on cancel
            setPrivacyPolicyAgreed(false);
            setPrivacyPolicyError('');
        }

        dynamicRBSheetRef?.current?.close();
    };

    const openDynamicSheet = async (type: 'esign' | 'cardterms' | 'privacy') => {
        setCurrentSheetType(type);

        if (type === 'esign') {
            setESignLoading(true);
            const noteItems = parseNoteData();
            const eSignCheckboxIndex = noteItems.findIndex((item: any) =>
                item.title?.includes('E_SIGN_CONSENT') || item.title?.includes('esign-consent')
            );
            const currentState = dynamicCheckboxes[eSignCheckboxIndex] || false;
            setESignAgreed(currentState);
            setOriginalESignState(currentState);

            try {
                const response = await CardsModuleService.getESignConsent();
                if (response?.ok) {
                    setESignContent((response.data as any)?.templateContent || (response.data as any)?.content);
                } else {
                    setESignContent(CREATE_KYC_ADDRESS_CONST.CONTENT_NOT_AVAILABLE);
                    setErrormsg(isErrorDispaly(response));
                }
            } catch (error) {
                setESignContent(CREATE_KYC_ADDRESS_CONST.CONTENT_NOT_AVAILABLE);
                setErrormsg(isErrorDispaly(error));
            } finally {
                setESignLoading(false);
            }
        } else if (type === 'cardterms') {
            setCardTermsLoading(true);
            const noteItems = parseNoteData();
            const cardTermsCheckboxIndex = noteItems.findIndex((item: any) =>
                item.title?.includes('CARD_TERMS') || item.title?.includes('card-terms')
            );
            const currentState = dynamicCheckboxes[cardTermsCheckboxIndex] || false;
            setCardTermsAgreed(currentState);
            setCardTermsError('');

            try {
                const response = await CardsModuleService.getCardTerms();
                if (response?.ok) {
                    setCardTermsContent((response.data as any)?.templateContent || 'No content available');
                } else {
                    setErrormsg(isErrorDispaly(response));
                }
            } catch (error) {
                setErrormsg(isErrorDispaly(error));
            } finally {
                setCardTermsLoading(false);
            }
        } else if (type === 'privacy') {
            setPrivacyPolicyLoading(true);
            const noteItems = parseNoteData();
            const privacyCheckboxIndex = noteItems.findIndex((item: any) =>
                item.title?.includes('PRIVACY_POLICY') || item.title?.includes('privacy-policy')
            );
            const currentState = dynamicCheckboxes[privacyCheckboxIndex] || false;
            setPrivacyPolicyAgreed(currentState);
            setPrivacyPolicyError('');

            try {
                const response = await CardsModuleService.getPrivacyPolicy();
                if (response?.ok) {
                    setPrivacyPolicyContent((response.data as any)?.templateContent || 'No content available');
                } else {
                    setPrivacyPolicyContent(CREATE_KYC_ADDRESS_CONST.CONTENT_NOT_AVAILABLE);
                    setErrormsg(isErrorDispaly(response));
                }
            } catch (error) {
                setPrivacyPolicyContent(CREATE_KYC_ADDRESS_CONST.CONTENT_NOT_AVAILABLE);
                setErrormsg(isErrorDispaly(error));
            } finally {
                setPrivacyPolicyLoading(false);
            }
        }

        dynamicRBSheetRef?.current?.open();
    };

    const getESignConsent = () => openDynamicSheet('esign');
    const getCardTerms = () => openDynamicSheet('cardterms');
    const getPrivacyPolicy = () => openDynamicSheet('privacy');
    const renderCardCarouselItem = (item: Card, index: number, calculatedItemWidth: number, calculatedItemHeight: number) => (
        <ImageBackgroundWrapper
            source={{ uri: item?.image }}
            style={[commonStyles.rounded12, { width: calculatedItemWidth, height: calculatedItemHeight, overflow: 'hidden' }]}
            resizeMode="cover"
            imageStyle={[commonStyles.rounded12, { width: calculatedItemWidth, height: calculatedItemHeight }]}
        >
        </ImageBackgroundWrapper>
    );
    /**
     * Render note data based on noteType
     * Dynamic: Shows interactive checkboxes with HTML parsing
     * Static: Shows simple HTML content with single agreement checkbox
     */
    const noteData = cardDetails?.noteType === 'Dynamic' ? (
        <ViewComponent style={{ flex: 1 }}>
            {rbSheetError && (
                <ErrorComponent
                    message={rbSheetError}
                    onClose={() => setRbSheetError('')}
                />
            )}
            <ScrollViewComponent style={{ flex: 1 }}>
                <TextMultiLangauge text={"GLOBAL_CONSTANTS.TERMS_AND_CONDITIONS"} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
                {parseNoteData().length === 0 && (
                    <RenderHTML
                        contentWidth={width}
                        source={source}
                        tagsStyles={{
                            body: { color: NEW_COLOR.TEXT_WHITE, fontSize: 14 },
                            li: { color: NEW_COLOR.TEXT_WHITE, fontSize: 12, }
                        }}
                        renderersProps={{
                            img: { enableExperimentalPercentWidth: true }
                        }}
                        enableExperimentalMarginCollapsing
                    />
                )}

                {parseNoteData().length > 0 ? (
                    <FlatListComponent
                        data={parseNoteData()}
                        keyExtractor={(index) => index.toString()}
                        renderItem={({ item, index }: { item: any, index: number }) => (
                            <ViewComponent>
                                <CommonTouchableOpacity onPress={() => handleDynamicCheckboxChange(index)} disabled={disabledCheckboxes[index]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                        <MaterialCommunityIcons
                                            name={dynamicCheckboxes[index] ? 'checkbox-outline' : 'checkbox-blank-outline'}
                                            size={s(24)}
                                            color={disabledCheckboxes[index] ? NEW_COLOR.TEXT_DISABLED :
                                                (dynamicCheckboxes[index] ? NEW_COLOR.BUTTON_BG : NEW_COLOR.TEXT_link)}
                                        />
                                        <ViewComponent style={[commonStyles.flex1]}>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                                <ViewComponent style={[commonStyles.flex1]}>
                                                    {(() => {
                                                        const htmlContent = item.title;
                                                        const parts = htmlContent.split(/(<a[^>]*>.*?<\/a>)/g);

                                                        return (
                                                            <ViewComponent style={[commonStyles.dflex, commonStyles.flexWrap]}>
                                                                {parts.map((part: string, partIndex: number) => {
                                                                    if (part.includes('<a')) {
                                                                        const linkMatch = part.match(/<a[^>]*data-action=['"]([^'"]*)['"][^>]*>(.*?)<\/a>/);
                                                                        if (linkMatch) {
                                                                            const action = linkMatch[1];
                                                                            const linkText = linkMatch[2];
                                                                            return (
                                                                                <CommonTouchableOpacity
                                                                                    key={partIndex}
                                                                                    onPress={() => {
                                                                                        if (action === 'E_SIGN_CONSENT' || action === 'esign-consent') {
                                                                                            getESignConsent();
                                                                                        } else if (action === 'CARD_TERMS' || action === 'card-terms') {
                                                                                            getCardTerms();
                                                                                        } else if (action === 'PRIVACY_POLICY' || action === 'privacy-policy') {
                                                                                            getPrivacyPolicy();
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <ParagraphComponent
                                                                                        text={linkText}
                                                                                        style={[commonStyles.inputbottomtextlink]}
                                                                                    />
                                                                                </CommonTouchableOpacity>
                                                                            );
                                                                        }
                                                                    }
                                                                    const cleanText = part.replace(/<[^>]*>/g, '');
                                                                    return cleanText ? (
                                                                        <ParagraphComponent
                                                                            key={partIndex}
                                                                            text={cleanText}
                                                                            style={[{ color: NEW_COLOR.TEXT_WHITE, fontSize: 14 }]}
                                                                        />
                                                                    ) : null;
                                                                })}
                                                            </ViewComponent>
                                                        );
                                                    })()}
                                                </ViewComponent>
                                            </ViewComponent>
                                        </ViewComponent>
                                    </ViewComponent>
                                </CommonTouchableOpacity>
                            </ViewComponent>
                        )}
                        ItemSeparatorComponent={() => <ViewComponent style={[commonStyles.mt10]} />}
                        scrollEnabled={false}
                    />
                ) : (
                    <NoDataComponent Description={CREATE_KYC_ADDRESS_CONST.CONTENT_NOT_AVAILABLE} />
                )}
            </ScrollViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb10]}>

                <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.CANCEL"}
                        onPress={cancelOverlay}
                        solidBackground={true}
                    />
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.IVE_READ"}
                        onPress={CloseOverlay}
                        disable={!areAllRequiredCheckboxesChecked()}
                    />
                </ViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]} />

        </ViewComponent>
    ) : (
        <ViewComponent style={{ flex: 1 }}>
            <ScrollViewComponent style={{ flex: 1 }}>
                <TextMultiLangauge text={"GLOBAL_CONSTANTS.TERMS_AND_CONDITIONS"} style={[commonStyles.sectionTitle]} />

                <RenderHTML
                    contentWidth={width}
                    source={source}
                    tagsStyles={{
                        body: { color: NEW_COLOR.TEXT_WHITE, fontSize: 14 },
                        li: { color: NEW_COLOR.TEXT_WHITE, fontSize: 12, }
                    }}
                    renderersProps={{
                        img: { enableExperimentalPercentWidth: true }
                    }}
                    enableExperimentalMarginCollapsing
                />

                <ViewComponent style={[commonStyles.mt10]}>
                    <CommonTouchableOpacity onPress={handleAgreeToTerms}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                            <MaterialCommunityIcons
                                name={agreedToTerms ? 'checkbox-outline' : 'checkbox-blank-outline'}
                                size={s(24)}
                                color={agreedToTerms ? NEW_COLOR.BUTTON_BG : NEW_COLOR.TEXT_link}
                            />
                            <TextMultiLangauge
                                style={[commonStyles.checkboxtext, commonStyles.flex1]}
                                text={"GLOBAL_CONSTANTS.AGREE_TERMS_AND_CONDITIONS"}
                            />
                        </ViewComponent>
                    </CommonTouchableOpacity>
                </ViewComponent>
            </ScrollViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb10]}>

                <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.CANCEL"}
                        onPress={cancelOverlay}
                        solidBackground={true}
                    />
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.IVE_READ"}
                        onPress={CloseOverlay}
                        disable={!agreedToTerms}
                    />
                </ViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]} />

        </ViewComponent>
    )
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {screenLoading && <DashboardLoader />}
            {!screenLoading && <Container style={[commonStyles.container]}>
                <PageHeader title={"GLOBAL_CONSTANTS.CARDS"} onBackPress={handleBack}
                />
                <ScrollViewComponent refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}>

                {errorMsg && <ErrorComponent message={errorMsg} onClose={handleError} />}
                <CardCarousel
                    data={availableCards}
                    renderItem={renderCardCarouselItem}
                    inactiveCardOpacity={0.6}
                    activeCardOpacity={1}
                    onActiveCardChange={handleActiveCardChange}
                    height={TARGET_CAROUSEL_ITEM_HEIGHT + SPACE_FOR_DOTS}
                    initialScrollIndex={activeCardIndex}
                />
                <ScrollViewComponent>
                    {cardDetailLoading && (
                        <Loadding contenthtml={ApplyCardSkeleton} />
                    )}
                    {!cardDetailLoading && cardDetails && <ViewComponent>
                        {cardDetails?.rules && (
                            <ViewComponent style={[]}>
                                {!cardDetailLoading && cardDetails && (cardDetails?.rules?.length ?? 0) > 0 && <ViewComponent style={[commonStyles.fw500, commonStyles.fs16]}>
                                    <TextMultiLangauge text={"GLOBAL_CONSTANTS.APPLICATION"} style={[commonStyles.sectionTitle, commonStyles.mt20]} />
                                    {renderRules()}
                                </ViewComponent>}
                                <ViewComponent style={[commonStyles.titleSectionGap]} />
                                {/* <TextMultiLangauge text={"GLOBAL_CONSTANTS.KYC_REQUIREMENTS"} style={[commonStyles.sectionTitle]} />
                                <ParagraphComponent text={cardDetails?.kycRequirements} style={[commonStyles.sectionsubtitlepara, commonStyles.mt6]} />
                                <ViewComponent style={[commonStyles.sectionGap]} /> */}
                                <TextMultiLangauge text={"GLOBAL_CONSTANTS.CHARGES"} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
                                       
                                <ViewComponent style={[]}>
                                     <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.listitemGap]}>
                                            <ParagraphComponent text={"GLOBAL_CONSTANTS.CARD_NAME"} style={[commonStyles.listsecondarytext]} />
                                            <ParagraphComponent text={cardDetails?.name} style={[commonStyles.listprimarytext]} />
                                        </ViewComponent>
                                    {!cardDetailLoading && cardDetails && (
                                        <>
                                            {/* <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.mb16]}>
                                                <ParagraphComponent text={"Card Name"} style={[commonStyles.listsecondarytext]} />
                                                <ParagraphComponent text={activeCard?.name || activeCard?.cardName} style={[commonStyles.listprimarytext]} />
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.mb16]}>
                                                <ParagraphComponent text={"Card Number"} style={[commonStyles.listsecondarytext]} />
                                                <ParagraphComponent text={'XXXX XXXX XXXX XXXX'} style={[commonStyles.listprimarytext]} />
                                            </ViewComponent> */}
                                            {renderKeyValuePairs()}
                                        </>
                                    )}
                                </ViewComponent>
                            </ViewComponent>
                        )}
                        <ViewComponent style={[commonStyles.titleSectionGap]} />
                        {availableCards?.length !== 0 && <CommonTouchableOpacity onPress={handleExpand}>
                            <Ionicons name="chevron-down" size={s(28)} style={[commonStyles.mxAuto, commonStyles.textCenter, { transform: [{ rotate: isExpanded ? "180deg" : "0deg" }] }]} color={NEW_COLOR.TEXT_WHITE} />
                            <ParagraphComponent style={[commonStyles.textCenter, commonStyles.listprimarytext]}>
                                {isExpanded ? "GLOBAL_CONSTANTS.SHOW_LESS" : "GLOBAL_CONSTANTS.READ_MORE"}
                            </ParagraphComponent>
                        </CommonTouchableOpacity>}
                    </ViewComponent>}
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    {availableCards?.length !== 0 && <ButtonComponent
                        title={"GLOBAL_CONSTANTS.APPLY_CARD"}
                        onPress={toggleOverlay}
                    />}
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </ScrollViewComponent>

              </ScrollViewComponent>
            </Container>}
            <CustomRBSheet refRBSheet={rbSheetRef} title="GLOBAL_CONSTANTS.SUPPORTED_PLOTFORMS" height={s(400)}>
                {supportedPlotforms}
            </CustomRBSheet>
            <CustomRBSheet modeltitle={false} refRBSheet={rbSheetRef1} title="GLOBAL_CONSTANTS.FAQS"  >
                {faqData}
            </CustomRBSheet>
            {cardkycModelVisible && (
                <KycVerifyPopup
                    closeModel={cardClosekycModel}
                    addModelVisible={cardkycModelVisible}
                    cardDetails={cardDetails}
                    activeCard={activeCard}
                    navigateToApplyCard={navigateToApplyCard}
                    navigateToSumsubNavigation={handleNavigateManualOrSumsub}
                    cardKycType={cardDetails?.kycType}
                />
            )}

            {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} cardKycType={cardDetails?.kycType} />}       
                 
            <CustomRBSheet refRBSheet={rbSheetRef2} title="GLOBAL_CONSTANTS.NOTES" height={s(600)}>
                {noteData}
            </CustomRBSheet>
            <CustomRBSheet
                refRBSheet={dynamicRBSheetRef}
                title={currentSheetType === 'esign' ? 'E-Sign Consent' : currentSheetType === 'cardterms' ? 'Card Terms' : 'Privacy Policy'}
                height={s(600)}
            >
                <ViewComponent style={{ flex: 1 }}>
                    {(currentSheetType === 'esign' && eSignLoading) || (currentSheetType === 'cardterms' && cardTermsLoading) || (currentSheetType === 'privacy' && privacyPolicyLoading) ? (
                        <DashboardLoader />
                    ) : (
                        <ScrollViewComponent style={{ flex: 1 }}>
                            <RenderHTML
                                contentWidth={width}
                                source={{
                                    html: currentSheetType === 'esign' ? eSignContent :
                                        currentSheetType === 'cardterms' ? cardTermsContent :
                                            privacyPolicyContent
                                }}
                                tagsStyles={{
                                    body: { color: NEW_COLOR.TEXT_WHITE, fontSize: 14 },
                                    p: { color: NEW_COLOR.TEXT_WHITE, fontSize: 14 },
                                    li: { color: NEW_COLOR.TEXT_WHITE, fontSize: 12 }
                                }}
                                renderersProps={{
                                    img: { enableExperimentalPercentWidth: true }
                                }}
                                enableExperimentalMarginCollapsing
                            />
                        </ScrollViewComponent>
                    )}
                    {!((currentSheetType === 'esign' && eSignLoading) || (currentSheetType === 'cardterms' && cardTermsLoading) || (currentSheetType === 'privacy' && privacyPolicyLoading)) && (
                        <>
                            <ViewComponent style={[commonStyles.sectionGap]} />
                            <CommonTouchableOpacity onPress={
                                currentSheetType === 'esign' ? handleESignAgreement :
                                    currentSheetType === 'cardterms' ? handleCardTermsAgreement :
                                        handlePrivacyPolicyAgreement
                            }>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.mb16]}>
                                    <MaterialCommunityIcons
                                        name={(currentSheetType === 'esign' ? eSignAgreed : currentSheetType === 'cardterms' ? cardTermsAgreed : privacyPolicyAgreed) ? 'checkbox-outline' : 'checkbox-blank-outline'}
                                        size={s(24)}
                                        color={(currentSheetType === 'esign' ? eSignAgreed : currentSheetType === 'cardterms' ? cardTermsAgreed : privacyPolicyAgreed) ? NEW_COLOR.BUTTON_BG : NEW_COLOR.TEXT_link}
                                    />
                                    <ParagraphComponent
                                        text={currentSheetType === 'esign' ? 'GLOBAL_CONSTANTS.AGREE_TERMS_AND_CONDITIONS' :
                                            currentSheetType === 'cardterms' ? 'I agree to the Card Terms' :
                                                'I agree to the Privacy Policy'}
                                        style={[{ color: NEW_COLOR.TEXT_WHITE, fontSize: 14 }]}
                                    />
                                </ViewComponent>
                            </CommonTouchableOpacity>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb10]}>
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <ButtonComponent
                                        title="GLOBAL_CONSTANTS.CANCEL"
                                        onPress={cancelDynamicOverlay}
                                        solidBackground={true}
                                    />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <ButtonComponent
                                        title="GLOBAL_CONSTANTS.IVE_READ"
                                        onPress={handleDynamicRead}
                                        disable={!(currentSheetType === 'esign' ? eSignAgreed : currentSheetType === 'cardterms' ? cardTermsAgreed : privacyPolicyAgreed)}
                                    />
                                </ViewComponent>
                            </ViewComponent>
                        </>
                    )}
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ViewComponent style={{ marginBottom: s(48) }} />
                </ViewComponent>
            </CustomRBSheet>
        </ViewComponent>
    );
};

export default AllCards;

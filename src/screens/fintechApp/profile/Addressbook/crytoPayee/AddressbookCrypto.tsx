import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleService } from '@ui-kitten/components';
import { View, ScrollView, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AntDesign } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import AddressbookService from '../../../../../apiServices/addressbook';
import { isErrorDispaly } from '../../../../../utils/helpers';
import { getThemedCommonStyles, statusColor } from '../../../../../components/CommonStyles';
import { ms, s } from '../../../../../constants/theme/scale';
import NoDataComponent from '../../../../../newComponents/noData/noData';
import ErrorComponent from '../../../../../newComponents/errorDisplay/errorDisplay';
import { addressBookFiatCryptoGridSk } from '../payeesSkeltons';
import { useLngTranslation } from '../../../../../hooks/useLngTranslation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import KycVerifyPopup from '../../../../commonScreens/kycVerify';
import VerifyPackage from '../../../../commonScreens/verifyPackage/verifyPackage';
import { ADD_BOOK_CONST } from '../AddressbookConstant';
import CustomRBSheet from '../../../../../newComponents/models/commonBottomSheet';
import { useThemeColors } from '../../../../../hooks/useThemeColors';
import DashboardLoader from '../../../../../components/loader';
import Loadding from '../../../../commonScreens/skeltons';
import ButtonComponent from '../../../../../newComponents/buttons/button';
import ViewComponent from '../../../../../newComponents/view/view';
import { showAppToast } from '../../../../../newComponents/toasterMessages/ShowMessage';
import ProfileEditIcon from '../../../../../components/svgIcons/mainmenuicons/editicon';
import ActiveIcon from '../../../../../components/svgIcons/mainmenuicons/active';
import Entypo from '@expo/vector-icons/Entypo';
import ScrollViewComponent from '../../../../../newComponents/scrollView/scrollView';
import ParagraphComponent from '../../../../../newComponents/textComponets/paragraphText/paragraph';


const AddressbookCrypto = React.memo((props: any) => {
    const refRBSheet = useRef<any>();
    const confirmationSheetRef = useRef<any>();
    const textInputRef = useRef<any>();
    const isFocused = useIsFocused();
    const [addressBookCryptoDetails, setAddressbookCryptoDetails] = useState<any>([]);
    const [sendCryptoPreList, setCryptoPreList] = useState<any>([]);
    const [errormsg, setErrormsg] = useState<any>("");
    const [addCryptoLoading, setAddCryptoLoading] = useState<boolean>(true);
    const [btnDtlLoading, setBtnDtlLoading] = useState<boolean>(false);
    const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
    const [selectedItemId, setSelectedItemId] = useState<string>("");
    const [selectedItemStatus, setSelectedItemStatus] = useState<string>("");
    const [addressbookCryptoView, setAddressbookCryptoView] = useState<any>(null);
    const addressBookSdk = addressBookFiatCryptoGridSk(6);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [pageNo, setPageNo] = useState(1);
    const [editErrorMsg, setEditerrormsg] = useState<any>("");
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [canLoadMore, setCanLoadMore] = useState<boolean>(true);
    const { t } = useLngTranslation();
    const [isVerifyPackage, setIsPackageVerify] = useState<boolean>(false)
    const [kycModelVisible, setKycModelVisible] = useState<boolean>(false)
    const [refresh, setRefresh] = useState<boolean>(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const styles = themedStyles(NEW_COLOR);

    useEffect(() => {
        if (isFocused) {
            setPageNo(1);
            getAddressbookGridDetails(pageNo);
        }
    }, [isFocused]);

    const handleIconClick = (val: any) => {
        setEditerrormsg("");
        setSelectedItemId(val?.id);
        setSelectedItemStatus(val?.status);
        refRBSheet?.current?.open();
        getAddressBookCryptoViewDetails(val?.id);
    };
    const getAddressBookCryptoViewDetails = async (id: any) => {
        try {
            const res: any = await AddressbookService?.getAddressbookCryptoViewDetails(id);
            if (res?.ok) {
                setAddressbookCryptoView(res?.data);
            }
            else {
                setErrormsg(isErrorDispaly(res));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    };
    const handleAddressbookCryptoEdit = () => {
        if (addressbookCryptoView?.whiteListState !== "Submitted") {
            if (addressbookCryptoView?.whiteListState.toLowerCase() === 'rejected') {
                setEditerrormsg("You can't modified rejected record.");
            } else if (addressbookCryptoView?.whiteListState.toLowerCase() === 'pending') {
                setEditerrormsg("You can't modified pending record.");
            }else if(addressbookCryptoView?.status.toLowerCase() === 'inactive'){
                setEditerrormsg("You can't modified inactive record.");
            }
            else if (addressbookCryptoView?.whiteListState.toLowerCase() === 'approved') {
                setEditerrormsg("You can't modified approved record.");
            } else if (addressbookCryptoView?.whiteListState.toLowerCase() === 'draft' || addressbookCryptoView?.whiteListState.toLowerCase() === 'submitted') {
                refRBSheet?.current?.close();
                props?.navigation?.navigate(ADD_BOOK_CONST?.ADD_CONTACT_COMPONENT, {
                    id: selectedItemId,
                    walletCode: addressbookCryptoView?.walletCode,
                    accountType:"business",
                    screenName: "Addressbook", 
                })
            }


        }
        else if (addressbookCryptoView?.whiteListState === "Submitted" && addressbookCryptoView?.status.toLowerCase() === "inactive") {
            setErrormsg("You can't modified Incative record");
            refRBSheet?.current?.close();
            return;
        }
        else {

            props?.navigation?.navigate(ADD_BOOK_CONST?.ADD_CONTACT_COMPONENT, {
                id: selectedItemId,
                walletCode: addressbookCryptoView?.walletCode,
            })
            refRBSheet?.current?.close();
        }
    };
    const onUseractiveinactiveSubmit = async () => {
        setErrormsg('')
        setBtnDtlLoading(true);
        setBtnDisabled(true);
        const statusType = selectedItemStatus === "Active" ? "disable" : "enable";
        let obj = {
            id: selectedItemId,
            tableName: "Common.PayeeAccounts",
            modifiedBy: userInfo?.name,
            info: "A full Description",
            status: selectedItemStatus === "Active" ? "Inactive" : "Active",
            type: "Crypto"
        }
        try {
            const res: any = await AddressbookService.Useractiveinactive(selectedItemId, statusType, obj);
            if (res?.ok) {
                confirmationSheetRef.current?.close();
                setAddressbookCryptoDetails([]);
                getAddressbookGridDetails(pageNo);
                setBtnDtlLoading(false);
                setBtnDisabled(false);
                showAppToast(`${t("GLOBAL_CONSTANTS.SELECTED_RECORD_HAS_BEEN")} ${selectedItemStatus?.toLocaleLowerCase() === "active" ? t("GLOBAL_CONSTANTS.INACTIVE") : t("GLOBAL_CONSTANTS.ACTIVE")}`, 'success');
            }
            else {
                setErrormsg(isErrorDispaly(res));
                setBtnDtlLoading(false);
                setBtnDisabled(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setBtnDtlLoading(false);
            setBtnDisabled(false);
        }
    };
    const getAddressbookGridDetails = async (pageNumber: number) => {
        const pageSize = 10;
        setAddCryptoLoading(true);
        setErrormsg("");
        try {
            let response: any = await AddressbookService?.getAddressbookCryptoGridData(pageNumber || pageNo, pageSize, "null");
            if (response?.ok) {
                const responseData = response?.data?.data || response?.data || [];
                const isMore = responseData.length === pageSize;
                if ((pageNumber || pageNo) === 1) {
                    setAddressbookCryptoDetails(responseData);
                    setCryptoPreList(responseData);
                } else {
                    setAddressbookCryptoDetails([
                        ...addressBookCryptoDetails,
                        ...(Array.isArray(responseData) ? responseData : [])
                    ]);
                    setCryptoPreList([
                        ...sendCryptoPreList,
                        ...(Array.isArray(responseData) ? responseData : [])
                    ]);
                }
                setIsLoadingMore(isMore);
                setCanLoadMore(isMore);
                setAddCryptoLoading(false);
                setErrormsg("");
            } else {
                setAddCryptoLoading(false);
                setErrormsg(isErrorDispaly(response));
            }
        }
        catch (error) {
            setAddCryptoLoading(false);
            setErrormsg(isErrorDispaly(error));
        }
    };
    const handleChangeSearch = (e: any) => {
        let value = e.trim();
        if (value) {
            let filterData = sendCryptoPreList.filter((item: any) => {
                return item.favoriteName?.toLowerCase().includes(value.toLowerCase()) || item.currency?.toLowerCase().includes(value.toLowerCase())
            })
            setAddressbookCryptoDetails(filterData);
        } else {
            setAddressbookCryptoDetails(sendCryptoPreList);
        }
    };

    const SearchBoxComponent = (
        <TouchableOpacity activeOpacity={1} onPress={() => textInputRef.current?.focus()}>
            <View style={commonStyles.searchContainer}>
                <AntDesign name="search1" color={NEW_COLOR.TEXT_WHITE} size={ms(22)} />
                <TextInput
                    ref={textInputRef}
                    style={[commonStyles.fs14, commonStyles.fw500, commonStyles.flex1, commonStyles.textWhite]}
                    onChangeText={(val) => handleChangeSearch(val)}
                    placeholder={t("GLOBAL_CONSTANTS.SEARCH_PAYEE")} placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                    returnKeyType='search'
                />
            </View>
        </TouchableOpacity>
    );


    const handleAddressbookCryptoViewChange = (val: any) => {
        props.navigation.navigate('AddressbookCryptoView', {
            coin: val?.currency,
            status: val?.status,
            id: val?.id
        })
    };
    const renderFooter = () => {
        if (addCryptoLoading && pageNo > 1) {
            return <Loadding contenthtml={addressBookSdk} />;
        }
        return null;
    }
    const noData = () => {
        if (!addCryptoLoading && addressBookCryptoDetails?.length <= 0) {
            return <NoDataComponent />
        }
        return null;
    }
    const handleCloseActionError = () => {
        setEditerrormsg("")
    }
    const handleError = useCallback(() => {
        setErrormsg("")
    }, [])
    const onclosePackageModel = () => {
        setIsPackageVerify(!isVerifyPackage)
    }
    const closekycModel = () => {
        setKycModelVisible(!kycModelVisible);
    }
    const handleOpenDisable = () => {
        if(addressbookCryptoView?.whiteListState?.toLowerCase() === 'submitted') {
            return setEditerrormsg(`You can't modified submitted payee.`);
        }else{
refRBSheet.current?.close()
        setTimeout(() => {
            confirmationSheetRef.current?.open()

        }, 300)
        }

        
    };

    const loadMoreData = () => {
        if (!addCryptoLoading && isLoadingMore && canLoadMore) {
            setCanLoadMore(false);
            const nextPage = pageNo + 1;
            setPageNo(nextPage);
            getAddressbookGridDetails(nextPage);
        }
    }
    const onRefresh = async () => {
        setRefresh(true);
        try {
            setPageNo(1);
            await getAddressbookGridDetails(1);
        } finally {
            setRefresh(false);
        }
    };
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {pageNo === 1 && addCryptoLoading ? (
                <DashboardLoader />
            ) : (
                <>

                    <ScrollViewComponent showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" refreshing={refresh} onRefresh={onRefresh}>

                        {errormsg &&
                            <View>
                                <ViewComponent style={[commonStyles.sectionGap]} />
                                <ErrorComponent message={errormsg} onClose={handleError} />

                            </View>
                        }
                        <ViewComponent style={[commonStyles.sectionGap]} />
                        <View style={[commonStyles.dflex, commonStyles.alignCenter]}>
                            <View style={[commonStyles.flex1]} >{SearchBoxComponent}</View>
                        </View>
                        <View style={[commonStyles.sectionGap]} />
                        <View>
                            <FlatList
                                data={addressBookCryptoDetails}
                                renderItem={({ item, index }: any) => {
                              const stateColor =  item?.status?.toLowerCase() === 'inactive'  ? NEW_COLOR.TEXT_RED : statusColor[item?.state?.toLowerCase()] || NEW_COLOR.TEXT_WHITE;
                                    
                                    return (
                                        <View>
                                            <TouchableOpacity
                                                activeOpacity={0.9}
                                                onPress={() => { handleAddressbookCryptoViewChange(item) }}
                                                style={[commonStyles.cardsbannerbg]}
                                            >
                                                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                                    <View style={[commonStyles.inputroundediconbg]}>
                                                        <ParagraphComponent
                                                            text={item?.favoriteName?.substring(0, 2).toUpperCase()}
                                                            style={[commonStyles.twolettertext]}
                                                        />
                                                    </View>

                                                    <View style={[commonStyles.flex1]}>
                                                        <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mb6]}>
                                                            <ParagraphComponent text={item?.favoriteName} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite, { width: s(140) }]} numberOfLines={1} />
                                                            <ParagraphComponent text={`${item?.currency||''} ${item?.currency? `(${item?.network})`: item?.network}`} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey, commonStyles.textRight]} numberOfLines={1} />
                                                        </View>

                                                        <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                                            <ParagraphComponent
                                                                text={item?.walletAddress && item.walletAddress.length > 30 ? `${item.walletAddress.slice(0, 10)}...${item.walletAddress.slice(-4)}` : item?.walletAddress}
                                                                style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}
                                                                numberOfLines={1}
                                                            />
                                                            <ParagraphComponent
                                                                text={item.state}
                                                                style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textRight, { color: stateColor }]}
                                                            />
                                                            
                                                        </View>
                                                    </View>
                                                    {/* <Feather name='more-vertical' onPress={() => handleIconClick(item)} color={NEW_COLOR.TEXT_WHITE} size={ms(18)} /> */}
                                                </View>
                                            </TouchableOpacity>
                                            {index !== addressBookCryptoDetails.length - 1 && <View style={[commonStyles.transactionsListGap]} />}
                                        </View>)
                                }}
                                keyExtractor={(item, index) => (item?.id ? item?.id?.toString() : index?.toString())}
                                onEndReached={loadMoreData}
                                keyboardShouldPersistTaps="handled"
                                onEndReachedThreshold={0.5}
                                ListFooterComponent={renderFooter}
                                ListEmptyComponent={noData}
                                contentContainerStyle={{ paddingBottom: s(60) }}
                                scrollEnabled={false}
                                nestedScrollEnabled={true}
                            />
                        </View>

                        <CustomRBSheet height={s(230)}

                            refRBSheet={refRBSheet}
                            modeltitle={false}
                            closeOnPressMask={true}
                            customStyles={{
                                wrapper: { backgroundColor: "rgba(0,0,0,0.7)" },
                                draggableIcon: { backgroundColor: "#5D5A5D" },
                                container: {
                                    backgroundColor: NEW_COLOR.SHEET_BG,
                                    borderTopLeftRadius: 5,
                                    borderTopRightRadius: 5,
                                },
                            }}>
                            {editErrorMsg && <ErrorComponent message={editErrorMsg} onClose={handleCloseActionError} />}
                            <TouchableOpacity onPress={handleAddressbookCryptoEdit} >
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2, }]} >
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                        <ViewComponent style={[styles.edit, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb5]}>
                                            <ProfileEditIcon width={s(18)} height={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                                        </ViewComponent>
                                        <ParagraphComponent text={"GLOBAL_CONSTANTS.EDIT"} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite,]} />
                                    </ViewComponent>
                                    <Entypo name="chevron-small-right" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                            </TouchableOpacity>
                            <ViewComponent style={[commonStyles.listGap]} />
                            <TouchableOpacity onPress={handleOpenDisable}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2, }]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                        <ViewComponent style={[styles.edit, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb5]}>
                                            <MaterialIcons name="block" size={s(24)} style={[]} color={NEW_COLOR.TEXT_WHITE} />
                                        </ViewComponent>
                                        <ParagraphComponent text={t(selectedItemStatus === "Active" ? "GLOBAL_CONSTANTS.INACTIVE" : "GLOBAL_CONSTANTS.ACTIVE")} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} />
                                    </ViewComponent>
                                    <Entypo name="chevron-small-right" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                            </TouchableOpacity>
                        </CustomRBSheet>
                        <CustomRBSheet
                            title={'GLOBAL_CONSTANTS.CONFIRM_ACTIVE_INACTIVE'}
                            refRBSheet={confirmationSheetRef}
                            height={s(250)}
                            closeOnPressMask={true}
                            customStyles={{
                                wrapper: { backgroundColor: "rgba(0,0,0,0.7)" },
                                draggableIcon: { backgroundColor: "#5D5A5D" },
                                container: {
                                    backgroundColor: NEW_COLOR.SHEET_BG,
                                    borderTopLeftRadius: 5,
                                    borderTopRightRadius: 5,
                                },
                            }}
                            onClose={() => {
                            }}
                        >
                            <View style={[commonStyles.sheetbg]}>
                                <ScrollView style={[]}>
                                    {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />}
                                    <ViewComponent style={[commonStyles.mxAuto]}>
                                        <ActiveIcon width={s(50)} height={s(50)} />

                                    </ViewComponent>
                                    <ParagraphComponent
                                        text={`${t("GLOBAL_CONSTANTS.DO_YOU_WANT_TO")} ${t(selectedItemStatus === "Active" ? "GLOBAL_CONSTANTS.INACTIVE" : "GLOBAL_CONSTANTS.ACTIVE")} ?`}
                                        style={[commonStyles.sectionTitle, commonStyles.textCenter, commonStyles.mt20]}
                                    />
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                        <ViewComponent style={[commonStyles.flex1]}>
                                            <ButtonComponent
                                                title={t("GLOBAL_CONSTANTS.NO")}
                                                onPress={() => confirmationSheetRef.current?.close()}
                                                solidBackground={true}
                                                disable={btnDtlLoading}
                                            />
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.flex1]}>
                                            <ButtonComponent
                                                title={t("GLOBAL_CONSTANTS.YES")}
                                                onPress={onUseractiveinactiveSubmit}
                                                loading={btnDtlLoading}
                                                disable={btnDisabled}
                                            />
                                        </ViewComponent>
                                    </ViewComponent>



                                    <View style={commonStyles.mb24} />
                                </ScrollView>
                            </View>
                        </CustomRBSheet>
                    </ScrollViewComponent>
                    {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} />}
                    <VerifyPackage isOpen={isVerifyPackage} onClose={onclosePackageModel} />
                </>
            )}
        </ViewComponent>
    );
});
export default AddressbookCrypto;

const themedStyles = (NEW_COLOR: any) => StyleService.create({
    initialsCircle: {
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.CIRCLE_BG,

    },
    edit: {
        width: s(40),
        height: s(40),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.CIRCLE_BG,

    },
});


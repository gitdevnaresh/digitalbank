import React, { useCallback, useEffect, useState } from 'react';
import { StyleService } from '@ui-kitten/components';
import { View, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { ADD_BOOK_CONST } from '../AddressbookConstant';
import { ms, s } from '../../../../../constants/theme/scale';
import { isErrorDispaly } from '../../../../../utils/helpers';
import Container from '../../../../../newComponents/container/container';
import NoDataComponent from '../../../../../newComponents/noData/noData';
import Icon from '../../../../../components/Icon';
import ErrorComponent from '../../../../../newComponents/errorDisplay/errorDisplay';
import { text } from '../../../../../constants/theme/mixins';
import { AntDesign } from '@expo/vector-icons';
import Images from '../../../../../assets/images';
import { useLngTranslation } from '../../../../../hooks/useLngTranslation';
import CreateAccountService from '../../../../../apiServices/createAccount';
import { useThemeColors } from '../../../../../hooks/useThemeColors';
import { useNavigation } from '@react-navigation/native';
import DashboardLoader from '../../../../../components/loader';
import PageHeader from '../../../../../newComponents/pageHeader/pageHeader';
import ParagraphComponent from '../../../../../newComponents/textComponets/paragraphText/paragraph';

const AddressbookCryptoList = React.memo((props: any) => {
    const [cryptoCoinData, setCryptoCoinData] = useState<any>([]);
    const [sendCryptoPreList, setCryptoPreList] = useState<any>([]);
    const [walletDtaLoading, setWalletDataLoading] = useState(false);
    const [errormsg, setErrormsg] = useState("");
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const styles = themedStyles(NEW_COLOR);
    const { t } = useLngTranslation();
    useEffect(() => {
        getAddressbookCryptoWallets();
    }, []);

    const SearchBoxComponent = (
        <View style={commonStyles.sectionGap}>
            <View style={commonStyles.searchContainer}>

                <TextInput
                    style={[commonStyles.searchInput, commonStyles.fs16, commonStyles.fw400]}
                    onChangeText={(val) => handleChangeSearch(val)}
                    placeholder={t("GLOBAL_CONSTANTS.SEARCH_COIN")}
                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_COLOR}
                />
                <AntDesign name="search1" color={NEW_COLOR.SEARCH_ICON} size={ms(22)} style={styles.searchIcon} />
            </View>
        </View>
    );

    const handleChangeSearch = (e: any) => {
        let value = e.trim()
        if (value) {
            let filterData = sendCryptoPreList.filter((item: any) => {
                return item.walletCode?.toLowerCase().includes(value.toLowerCase())
            })
            setCryptoCoinData(filterData);
        } else {
            setCryptoCoinData(sendCryptoPreList);
        }
    };

    const getAddressbookCryptoWallets = async () => {
        setErrormsg('')
        setWalletDataLoading(true);
        const response: any = await CreateAccountService.getPayeesLookups();
        if (response?.ok) {
            setCryptoCoinData(response?.data?.cryptoCurrency);
            setCryptoPreList(response?.data?.cryptoCurrency);
            setWalletDataLoading(false);
            setErrormsg('');
        } else {
            setErrormsg(isErrorDispaly(response));
            setWalletDataLoading(false);
        }
    };

    const backArrowAddressbookHandler = useCallback(() => {
        props.navigation.navigate("Addressbook");
    }, []);

    const handleAdressbookCryptoCoinSlct = (val: any) => {
        navigation.navigate(ADD_BOOK_CONST?.ADD_CONTACT_COMPONENT, {
            walletCode: val?.code,
            logo: val?.logo,
            screenName: "Addressbook",
            details: val?.details
        })
    };
    const cryptoList: any = {
        BTC: Images?.coins.coinbtc,
        USDT: Images?.coins.coineusdt,
        ETH: Images?.coins.coineth,
        USDC: Images?.coins.coineusdc
    };
    const handleCloseError = () => {
        setErrormsg("");
    };

    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            {walletDtaLoading ? (
                <DashboardLoader />
            ) : (
                <Container style={[commonStyles.container]}>
                    <PageHeader title={"GLOBAL_CONSTANTS.SELECT_ASSET"} onBackPress={backArrowAddressbookHandler} isrefresh={true} onRefresh={getAddressbookCryptoWallets} />
                    <View>
                        <View>{SearchBoxComponent}</View>
                        <View>
                            {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                            <>
                                {cryptoCoinData?.length > 0 &&
                                    <View>

                                        {cryptoCoinData?.map((item: any, index: any) => {
                                            return (
                                                <View key={item?.name}>
                                                    <TouchableOpacity onPress={() => handleAdressbookCryptoCoinSlct(item)}>

                                                        <View style={[commonStyles.dflex, commonStyles.flex1, commonStyles.justifyContent, commonStyles.gap10,]} key={item?.name}>

                                                            <View >
                                                                <Icon containerStyle={{}} source={cryptoList[item?.code || 'USDT']} style={{ width: s(30), height: s(30) }} />
                                                            </View>
                                                            <View style={[commonStyles.flex1,]}>
                                                                <View style={[commonStyles.dflex, commonStyles.flex1, commonStyles.justifyContent, commonStyles.gap10]}>
                                                                    <View>
                                                                        <ParagraphComponent text={item?.code} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite, commonStyles.mb2]} />
                                                                        <ParagraphComponent text={item?.name} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textLink]} />
                                                                    </View>
                                                                    {item?.amount && <View>
                                                                        <ParagraphComponent text={`${item?.amount?.toLocaleString()}`} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textRight, commonStyles.textWhite]} />
                                                                    </View>}
                                                                </View>

                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                    {index !== cryptoCoinData.length - 1 && <View style={[commonStyles.hLine, commonStyles.my10]} />}

                                                </View>

                                            )
                                        })}
                                    </View>
                                }
                                {
                                    cryptoCoinData.length < 1 && <View>

                                        <View >
                                            <NoDataComponent />
                                        </View>
                                    </View>
                                }
                            </>

                        </View>
                    </View>
                </Container>
            )}
        </SafeAreaView>
    )
})

export default AddressbookCryptoList;

const themedStyles = (NEW_COLOR: any) => StyleService.create({
    searchInput: {
        ...text(14, 16.8, 400, NEW_COLOR.TEXT_LIGHT, true),
        position: 'relative',
        zIndex: 2,
        width: "100%",
        paddingVertical: 1,
        color: NEW_COLOR.TEXT_WHITE, paddingRight: 50
    },
    searchIcon: {
        marginTop: 4,
        width: ms(22),
        height: ms(22), position: 'absolute', right: 12, top: 10
    },
    coinStyle: {
        height: 36, width: 36,
        borderRadius: 36 / 2,
        backgroundColor: "#00A478"
    },
})


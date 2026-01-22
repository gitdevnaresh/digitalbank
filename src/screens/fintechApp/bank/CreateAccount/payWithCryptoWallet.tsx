import React, { useCallback, useEffect, useState } from "react";
import {  RefreshControl, TextInput } from "react-native";
import { useSelector } from "react-redux";
import Container from "../../../../newComponents/container/container";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import { getThemedCommonStyles, CoinImages } from "../../../../components/CommonStyles";
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { isErrorDispaly } from "../../../../utils/helpers";
import { PaywithCryptoLists, PayWithWalletFiatConfirm } from "./createAccConstant";
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import CreateAccountService from "../../../../apiServices/createAccount";
import ViewComponent from "../../../../newComponents/view/view";
import ScrollViewComponent from "../../../../newComponents/scrollView/scrollView";
import NoDataComponent from '../../../../newComponents/noData/noData';
import DashboardLoader from '../../../../components/loader';
import { s, ms } from '../../../../constants/theme/scale';
import AntDesign from "react-native-vector-icons/AntDesign";
import AssetsSection from '../../Dashboard/components/AssetsSection';
import { getTabsConfigation } from '../../../../../configuration';

const PayWithCryptoWallet = React.memo((props: any) => {
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [errormsg, setErrormsg] = useState<string | null>(null);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const { selectedCurrency } = useSelector((state: any) => state.userReducer);
  const selectedBank = props.selectedBank || useSelector((state: any) => state.userReducer.selectedBank);
  const [lists, setlists] = useState<PaywithCryptoLists>({
    vaultsList: [],
    coinList: [],
    networkList: [],
  });
  const [selectedCoin, setSelectedCoin] = useState<any>(null);

  useEffect(() => { 
      getVults(); 
     }, [props?.isActiveTab]);

  const onRefresh = async () => {
    setRefresh(true);
    try {
      await getVults();
    } finally {
      setRefresh(false);
    }
  };

  const getVults = async () => {
    setIsLoading(true);
    setErrormsg("");
    try {
      const response: any = await CreateAccountService.getVaultList();
      if (response?.ok) {
        const vaultsList = response?.data || [];
        const defaultVault = vaultsList[0];
        const coins = defaultVault?.vaultDetails ? mapVaultDetailsToCoinList(defaultVault.vaultDetails) : [];
        setlists((prev) => ({ ...prev, vaultsList, coinList: vaultsList, networkList: [] }));
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to map vault details to coin list
  const mapVaultDetailsToCoinList = (vaultDetails: any[]) => {
    return vaultDetails.map((data: any) => ({
      ...data,
      name: data.code,
      image: CoinImages[data.code?.toLowerCase()] || '',
      balance: data.amount || 0,
    }));
  };
  // Filtered coin list based on search
  const filteredCoinList = React.useMemo(() => {
    if (!searchText) return lists.coinList;
    return lists.coinList.filter((item: any) =>
      item.code?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [lists.coinList, searchText]);

  const handleChangeSearch = useCallback((val: string) => {
    let value = val.trim();
    setSearchText(value);
  }, []);

  const handleContinue = async (selectedCoin: any) => {
      if (!selectedCoin?.amount || selectedCoin?.amount <= 0) {
            setErrormsg(`${t("GLOBAL_CONSTANTS.INSUFFICIENT_FUNDS")} for ${selectedCoin?.code || 'selected coin'}`);
            return;
        }
    if (!selectedCoin) return;
    setBtnLoading(true);
    const saveObj: PayWithWalletFiatConfirm = {
      walletId: selectedCoin?.id,
    };
    try {
      const response: any = await CreateAccountService.confirmPayWithWalleteCrypto(
        selectedBank?.productId,
        saveObj
      );
      if (response?.ok) {
        setBtnLoading(false);
        setSearchText('');
        props?.navigation?.navigate("payWithCryptoWalletSummery", {
          selectedAccount: selectedCurrency,
          selectedBank: selectedBank,
          selectedCoin: selectedCoin?.code,
          accountToCreate: response?.data?.accountToCreate,
          amount: response?.data?.amount,
          payingWalletCoin: response?.data?.payingWalletCoin,
          vaultName: response?.data?.vaultName,
          network: response?.data?.network,
          recieverWalletAddress: response?.data?.recieverWalletAddress || response?.data?.payingWalletAddress,
          payingWalletAddress: response?.data?.payingWalletAddress,
          payingWalletId: response?.data?.walletId,
          fromScreen:props.route.params.targetScreen
        });
      } else {
        setBtnLoading(false);
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setBtnLoading(false);
      setErrormsg(isErrorDispaly(error));
    }
  };

  const handleSelectedCoin = (item: any) => {
    if (!item?.balance || item?.balance <= 0) {
      setSelectedCoin(item);
      setErrormsg(`${t("GLOBAL_CONSTANTS.INSUFFICIENT_FUNDS")} for ${item?.code || 'selected coin'}`);
      return;
    }
    setSelectedCoin(item);
    setErrormsg('');
  };

  const handleCloseError = useCallback(() => {
    setErrormsg("");
  }, []);

  const SearchBoxComponent = (
    <ViewComponent style={{ marginBottom: s(16) }}>
      <ViewComponent style={[commonStyles.searchContainer]}>
        <AntDesign name="search1" color={NEW_COLOR.SEARCH_ICON} size={ms(22)} />
        <TextInput
          value={searchText}
          style={{
            flex: 1,
            color: NEW_COLOR.TEXT_WHITE,
            fontSize: s(16),
            paddingVertical: s(10),
            backgroundColor: 'transparent',
          }}
          onChangeText={handleChangeSearch}
          placeholder={t("GLOBAL_CONSTANTS.SEARCH")}
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_COLOR}
        />
      </ViewComponent>
    </ViewComponent>
  );
  return (
    <Container style={[commonStyles.screenBg]}>
      <ScrollViewComponent
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}
      >
        {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
        <ViewComponent style={[commonStyles.sectionGap]}>{SearchBoxComponent}</ViewComponent>
        {isLoading && (
          <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
            <DashboardLoader />
          </ViewComponent>
        )}
        {!isLoading && filteredCoinList && filteredCoinList.length > 0 && (
          <AssetsSection
            commonStyles={commonStyles}
            GraphConfiguration={getTabsConfigation('ADDS_AND_GRAPG_CONFIGURATION')}
            assets={filteredCoinList.map((item: any) => ({ ...item, amount: item.amount ?? item.balance ?? 0 }))}
            vaultsLists={lists}
            vaultCoinsLists={lists}
            handleChangeSearch={handleChangeSearch}
            handleNavigate={handleContinue}
            NEW_COLOR={NEW_COLOR}
            setCoinsList={(data: any) => setlists((prev) => ({ ...prev, coinList: data }))}
            showHeader={false}
          />
        )}
        {!isLoading && filteredCoinList.length < 1 && (
          <ViewComponent>
            <NoDataComponent />
          </ViewComponent>
        )}
      </ScrollViewComponent>
    </Container>
  );
});

export default PayWithCryptoWallet;


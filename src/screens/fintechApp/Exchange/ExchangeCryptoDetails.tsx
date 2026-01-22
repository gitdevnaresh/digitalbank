import React, { useCallback, useState } from 'react';
import { BackHandler } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {  useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getTabsConfigation, isDecimalSmall } from '../../../../configuration';
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import { CRYPTO_CONSTANTS } from './constants';
import ViewComponent from '../../../newComponents/view/view';
import ScrollViewComponent from '../../../newComponents/scrollView/scrollView';
import Container from '../../../newComponents/container/container';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import { CurrencyText } from '../../../newComponents/textComponets/currencyText/currencyText';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import ActionButton from '../../../newComponents/gradianttext/gradiantbg';
import SellExchangeIcon from '../../../components/svgIcons/mainmenuicons/buysell';
import RecentTransactions from '../../commonScreens/transactions/recentTransactions';
import KycVerifyPopup from '../../commonScreens/kycVerify';
import { RootStackParamList } from '../../../navigations/navigation-types';
import BuyExchangeIcon from '../../../components/svgIcons/mainmenuicons/buyexchange';

type ExchangeCryptoDetailsProps = NativeStackScreenProps<RootStackParamList, 'ExchangeCryptoDetails'>;

interface CryptoDetailsData {
  coinName: string;
  coinCode: string;
  coinIcon: string;
  balance: number;
  balanceInUSD: number;
}

const ExchangeCryptoDetails: React.FC<ExchangeCryptoDetailsProps> = (props) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  
  const [errormsg, setErrormsg] = useState<string>("");
  const [kycModelVisible, setKycModelVisible] = useState<boolean>(false);
  const [recentTranscationReload, setRecentTranscationReload] = useState(false);
  
  // Get coin data from navigation params
  const coinData: CryptoDetailsData = props.route?.params || {
    coinName: 'Bitcoin',
    coinCode: 'BTC',
    coinIcon: '',
    balance: 0,
    balanceInUSD: 0
  };

  const crypto = getTabsConfigation("EXCHANGE");

  const handleCloseError = useCallback(() => {
    setErrormsg("");
  }, []);

  const handleRecentTranscationReloadDetails = (reload: boolean, error?: string | null) => {
    setRecentTranscationReload(reload);
    if (error) {
      setErrormsg('');
    }
  };

  const closekycModel = () => {
    setKycModelVisible(false);
  };

  const handleBuyNav = useCallback(() => {
    if (userInfo?.kycStatus == null || userInfo?.kycStatus == CRYPTO_CONSTANTS?.DRAFT || userInfo?.kycStatus == "Submitted") {
      setKycModelVisible(true);
    } else {
      (props.navigation as any).navigate('CryptoExchange', {
        cryptoCoin: coinData?.coinCode,
        coinFullName: coinData?.coinName,
        logo: coinData?.coinIcon,
        amountInUSD: coinData?.balanceInUSD
      });
    }
  }, [coinData]);

  const handleSellNav = useCallback(() => {
    if (userInfo?.kycStatus == null || userInfo?.kycStatus == CRYPTO_CONSTANTS?.DRAFT || userInfo?.kycStatus == "Submitted") {
      setKycModelVisible(true);
    } else {
      (props.navigation as any).navigate('CryptoSellExchange', {
        cryptoCoin: coinData?.coinCode,
        coinFullName: coinData?.coinName,
        logo: coinData?.coinIcon,
        amountInUSD: coinData?.balanceInUSD
      });
    }
  }, [coinData]);

  const handleBack = useCallback(() => {
    props.navigation.goBack();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription?.remove();
    }, [handleBack])
  );

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
        <ScrollViewComponent showsVerticalScrollIndicator={false}>
          <Container style={[commonStyles.container]}>
            {/* Page Header */}
            <PageHeader title={coinData?.coinName || ''} onBackPress={handleBack} />
            
            {errormsg !== "" && (
              <ErrorComponent
                message={errormsg}
                onClose={handleCloseError}
              />
            )}
            
            
            {/* Coin Balance Section */}
            <ViewComponent>
              <CurrencyText
                value={coinData?.balance || 0}
                currency={coinData?.coinCode || ''}
                smallDecimal={isDecimalSmall}
                decimalPlaces={4}
                style={[commonStyles.transactionamounttext]}
              />
            </ViewComponent>
            
            <ViewComponent style={[commonStyles.sectionGap]} />
            
            {/* Action Buttons */}
            <ViewComponent style={[
              commonStyles.dflex,
              commonStyles.alignCenter,
              commonStyles.justifyContent,
              commonStyles.gap10
            ]}>
              {crypto?.QUCIKLINKS?.Buy && (
                <ViewComponent style={[commonStyles.flex1]}>
                  <CommonTouchableOpacity>
                    <ActionButton
                      text="Buy"
                      onPress={handleBuyNav}
                      useGradient={true}
                      customTextColor={NEW_COLOR.TEXT_ALWAYS_WHITE}
                      customIcon={<BuyExchangeIcon />}
                    />
                  </CommonTouchableOpacity>
                </ViewComponent>
              )}
              
              {crypto?.QUCIKLINKS?.Sell && (
                <ViewComponent style={[commonStyles.flex1]}>
                  <CommonTouchableOpacity>
                    <ActionButton
                      text="Sell"
                      onPress={handleSellNav}
                      customTextColor={NEW_COLOR.BUTTON_TEXT}
                      customIcon={<SellExchangeIcon />}
                    />
                  </CommonTouchableOpacity>
                </ViewComponent>
              )}
            </ViewComponent>
            
            <ViewComponent style={[commonStyles.sectionGap]} />
            
            {/* Recent Transactions */}
            <RecentTransactions accountType={"Exchange"} recentTranscationReload={recentTranscationReload} handleRecentTranscationReloadDetails={handleRecentTranscationReloadDetails} />
            
            <ViewComponent style={[commonStyles.sectionGap]}>
            {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible}/>}
            </ViewComponent>
          </Container>
        </ScrollViewComponent>
    </ViewComponent>
  );
};

export default ExchangeCryptoDetails;

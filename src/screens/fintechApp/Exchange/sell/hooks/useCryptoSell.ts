import { useState, useCallback } from "react";
import ExchangeServices from "../../../../../apiServices/exchange";
import { isErrorDispaly } from "../../../../../utils/helpers";

interface CryptoAsset {
  id: string;
  code: string;
  name: string;
  amount: number;
  image?: string;
}

interface FiatAsset {
  id: string;
  code: string;
  name: string;
  amount: number;
  image?: string;
}

export const useCryptoSell = () => {
  const [cryptoCoinData, setCryptoCoinData] = useState<CryptoAsset[]>([]);
  const [dropDownList, setDropDownList] = useState<FiatAsset[]>([]);
  const [coinDataLoading, setCoinDataLoading] = useState<boolean>(false);
  const [getDropDownObj, setDropDownObj] = useState<any>({});
  const [oneCoinValLoader, setOneCionValLoder] = useState<boolean>(false);
  const [changeAmountLoader, setChangeAmountLoader] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const getMinAxDetails = useCallback(async (selectedCryptoCoin: string) => {
    if (!selectedCryptoCoin) return;
    setOneCionValLoder(true);
    setError("");

    try {
      const response: any = await ExchangeServices.getSelectesSellMinMaxValue(selectedCryptoCoin);
      if (response?.ok) {
        setDropDownObj({ 
          min: response?.data?.min , 
          max: response?.data?.max , 
          amount: response?.data?.amount || 0,
          id: response?.data?.id ,
          code: response?.data?.code ,
          name: response?.data?.name ,
          image: response?.data?.image || ""
        });
      } else {
        const selectedCrypto = cryptoCoinData.find((crypto: any) => crypto.code === selectedCryptoCoin);
        setDropDownObj({ 
          min: 0.0001, 
          max: 10000, 
          amount: selectedCrypto?.amount || 0,
          id: selectedCrypto?.id || selectedCryptoCoin 
        });
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setOneCionValLoder(false);
    }
  }, [cryptoCoinData]);

  const getCryptoCoins = useCallback(async () => {
    setCoinDataLoading(true);
    setError("");
    try {
      const response: any = await ExchangeServices.getSelectedsellCryptoBalance();
      if (response?.ok) {
        setCryptoCoinData(response?.data?.cryptoAssets || []);
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setCoinDataLoading(false);
    }
  }, []);

  const getFiatAssetsData = useCallback(async () => {
    setError("");
    try {
      const response: any = await ExchangeServices.getSelectedsellCryptoBalance();
      if (response?.ok && response.data?.fiatAssets?.length > 0) {
        const fiatAssets = response.data.fiatAssets;
        setDropDownList(fiatAssets);
        return fiatAssets;
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    }
  }, []);

  const getSummaryDetails = useCallback(async (amount: number | string, selectedValue: string, fiatSeletedVal: string) => {
    if (!amount || !selectedValue || !fiatSeletedVal) return;
    
    try {
      const payload = {
        fromAsset: selectedValue,
        toAsset: fiatSeletedVal,
        assetValue: Number(amount)
      };
      
      const response: any = await ExchangeServices.getsummarysellDetails(payload);
      if (response?.ok) {
        setSummaryData(response.data);
        setShowSummary(true);
      }
      else{
        setError(isErrorDispaly(response));
      }
    } catch (error) {
        setError(isErrorDispaly(error));
    }
  }, []);

  const getFromAssetValue = useCallback(async (changeAmount: number | string, selectedValue: string, fiatSeletedVal: string, setCryptoConvertVal: Function) => {
    if (!changeAmount || changeAmount === 0) {
      setCryptoConvertVal("");
      setSummaryData(null);
      setShowSummary(false);
      return;
    }
    if (!selectedValue || !fiatSeletedVal) return;
    setChangeAmountLoader(true);
    setError("");
    
    try {
      const response: any = await ExchangeServices.getEnteredCryptoFiatValue(
        selectedValue,
        fiatSeletedVal,
        Number(changeAmount),
        "sell"
      );
      if (response?.ok) {
        setCryptoConvertVal(response?.data?.toAssetValue?.toFixed(2) || 0);
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setChangeAmountLoader(false);
    }
  }, []);

  const clearSummary = useCallback(() => {
    setSummaryData(null);
    setShowSummary(false);
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return {
    cryptoCoinData,
    dropDownList,
    coinDataLoading,
    getDropDownObj,
    oneCoinValLoader,
    changeAmountLoader,
    summaryData,
    showSummary,
    error,
    getMinAxDetails,
    getCryptoCoins,
    getFiatAssetsData,
    getSummaryDetails,
    getFromAssetValue,
    clearSummary,
    clearError,
    setDropDownObj
  };
};
import { useState, useCallback } from "react";
import ExchangeServices from "../../../../../apiServices/exchange";
import { isErrorDispaly } from "../../../../../utils/helpers";

export const useCryptoExchange = () => {
  const [cryptoCoinData, setCryptoCoinData] = useState<[]>([]);
  const [dropDownList, setDropDownList] = useState<[]>([]);
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
      const response: any = await ExchangeServices.getSelecteMinMaxValue(selectedCryptoCoin);
      if (response?.ok) {
        setDropDownObj({ 
          buyMin: response?.data?.min , 
          buyMax: response?.data?.max , 
          amount: response?.data?.amount || 0,
          id: response?.data?.id ,
          code: response?.data?.code ,
          name: response?.data?.name ,
          image: response?.data?.image || ""
        });
      } else {
        const selectedCrypto = cryptoCoinData.find((crypto: any) => crypto.code === selectedCryptoCoin);
        setDropDownObj({ 
          buyMin: 0.0001, 
          buyMax: 10000, 
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
      const response: any = await ExchangeServices.getSelecteCryptoBalance();
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
      const response: any = await ExchangeServices.getSelecteCryptoBalance();
      if (response?.ok && response.data?.fiatAssets?.length > 0) {
        const fiatAssets = response.data.fiatAssets;
        setDropDownList(fiatAssets);
        return fiatAssets;
      } else {
        setError(isErrorDispaly(response));
        return [];
      }
    } catch (error) {
      setError(isErrorDispaly(error));
      return [];
    }
  }, []);

  const getSummaryDetails = useCallback(async (amount: number | string, selectedValue: string, fiatSeletedVal: string) => {
    if (!amount || !selectedValue || !fiatSeletedVal) return;
    
    try {
      const payload = {
        fromAsset: fiatSeletedVal,
        toAsset: selectedValue,
        assetValue: Number(amount)
      };
      
      const response: any = await ExchangeServices.getsummaryDetails(payload);
      if (response?.ok) {
        setSummaryData(response.data);
        setShowSummary(true);
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
        "buy"
      );
      if (response?.ok) {
        const convertedValue = response?.data?.toAssetValue?.toFixed(2) || 0;
        setCryptoConvertVal(convertedValue);
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
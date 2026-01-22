import { useState, useEffect, useCallback } from 'react';
import { getCountries, getCountriesWithStates, getPhoneCodes, transformForPicker, getStatesForCountry, clearCache } from '../apiServices/countryService';
import { isErrorDispaly } from '../utils/helpers';

export interface UseCountryDataOptions {
  loadCountries?: boolean;
  loadStates?: boolean;
  loadPhoneCodes?: boolean;
  autoLoad?: boolean; // Whether to load data automatically on mount
}

export interface UseCountryDataReturn {
  countries: any[];
  countriesWithStates: any[];
  phoneCodes: any[];
  loading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  clearCache: () => void;
  getStatesForCountry: (countryId: string) => Array<{
    id?: string;
    parentId?: string;
    name: string;
    code?: string;
  }>;
  // Transformed data for pickers
  countryPickerData: Array<{ id: string; name: string; code?: string }>;
  phoneCodePickerData: Array<{ id: string; name: string; code?: string }>;
}

const useCountryData = (options: UseCountryDataOptions = {}): UseCountryDataReturn => {
  const {
    loadCountries = true,
    loadStates = false,
    loadPhoneCodes = false,
    autoLoad = true
  } = options;

  const [countries, setCountries] = useState<any[]>([]);
  const [countriesWithStates, setCountriesWithStates] = useState<any[]>([]);
  const [phoneCodes, setPhoneCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
        if(loadCountries && loadStates && loadPhoneCodes) {
        const promises = [];
        
        if (loadCountries) {
          promises.push(getCountries().then(result => {
            if (result.ok) setCountries(result.data || []);
            return result;
          }));
        }
        
        if (loadStates) {
          promises.push(getCountriesWithStates().then(result => {
            if (result.ok) setCountriesWithStates(result.data || []);
            return result;
          }));
        }
        
        if (loadPhoneCodes) {
          promises.push(getPhoneCodes().then(result => {
            if (result.ok) setPhoneCodes(result.data || []);
            return result;
          }));
        }
        
        if (promises.length > 0) {
          const results = await Promise.all(promises);
          results.forEach(result => {
            if (!result.ok) setError(result.error);
          });
        }
      }
     else if (loadCountries && loadStates) {
        const [countriesResult, statesResult] = await Promise.all([
          getCountries(),
          getCountriesWithStates()
        ]);
        
        if (countriesResult.ok) setCountries(countriesResult.data || []);
        if (statesResult.ok) setCountriesWithStates(statesResult.data || []);
        
        if (!countriesResult.ok) setError(countriesResult.error);
        if (!statesResult.ok) setError(statesResult.error);
      } else {
        const promises = [];
        
        if (loadCountries) {
          promises.push(getCountries().then(result => {
            if (result.ok) setCountries(result.data || []);
            return result;
          }));
        }
        
        if (loadStates) {
          promises.push(getCountriesWithStates().then(result => {
            if (result.ok) setCountriesWithStates(result.data || []);
            return result;
          }));
        }
        
        if (loadPhoneCodes) {
          promises.push(getPhoneCodes().then(result => {
            if (result.ok) setPhoneCodes(result.data || []);
            return result;
          }));
        }
        
        if (promises.length > 0) {
          const results = await Promise.all(promises);
          results.forEach(result => {
            if (!result.ok) setError(result.error);
          });
        }
      }
    } catch (err: any) {
      setError(isErrorDispaly(err));
    } finally {
      setLoading(false);
    }
  }, [loadCountries, loadStates, loadPhoneCodes]);

  const clearCacheData = () => {
    clearCache(); // Clear the actual cache
    setCountries([]);
    setCountriesWithStates([]);
    setPhoneCodes([]);
    setError(null);
  };

  const getStatesForCountryData = (countryId: string) => {
    return getStatesForCountry(countryId, countriesWithStates);
  };

  // Auto-load data on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [autoLoad, loadData]);

  // Transform data for pickers
  const countryPickerData = transformForPicker(countries);
  const phoneCodePickerData = transformForPicker(phoneCodes);

  return {
    countries,
    countriesWithStates,
    phoneCodes,
    loading,
    error,
    loadData,
    clearCache: clearCacheData,
    getStatesForCountry: getStatesForCountryData,
    countryPickerData,
    phoneCodePickerData
  };
};

export default useCountryData;
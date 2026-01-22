import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { ms } from '../../constants/theme/scale';
import { TextInput } from 'react-native-gesture-handler';
import { CoinImages, getThemedCommonStyles } from '../../components/CommonStyles';
import AntDesign from "@expo/vector-icons/AntDesign";
import { useLngTranslation } from '../../hooks/useLngTranslation';
import { useThemeColors } from '../../hooks/useThemeColors';
import Feather from '@expo/vector-icons/Feather';
import ImageUri from '../imageComponents/image';
import ViewComponent from '../view/view';
import { s } from '../theme/scale';
import { CurrencyText } from '../textComponets/currencyText/currencyText';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import NoDataComponent from '../noData/noData';
interface PickerItem {
  id?: string | number;
  name?: string;
  code?: string;
  [key: string]: any; // Allows for other properties
}

interface DisplayPickerItem extends PickerItem {
  displayName: string;
}

interface PickerProps {
  changeModalVisible: (visible: boolean) => void;
  data: PickerItem[];
  setData: (item: PickerItem) => void;
  customBind: Array<string>;
  selectedValue?: PickerItem | string | null | undefined; // To track the selected item
  showCountryImages?: boolean; // New flag
  isIconsDisplay?: boolean;
  isOnlycountry?: boolean;
  showBalance?: boolean; // New flag to control balance display
}

const Picker = ({ changeModalVisible, data = [], setData, customBind, selectedValue, isIconsDisplay = false, showCountryImages = false, isOnlycountry, showBalance = false }: PickerProps) => {
  const [countryList, setCountryList] = useState<DisplayPickerItem[]>([]);
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
   const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const styles = screenStyles(NEW_COLOR);

  useEffect(() => {
    const listData = data.map((item: PickerItem) => ({ ...item, displayName: (customBind ? customBind.map((property) => (item[property] ?? property)).join("") : item.name) ?? '' }))
    setCountryList([...listData]);
  }, [data, customBind]);

  const onPressItem = (option: DisplayPickerItem) => {
    changeModalVisible(false);
    const { displayName, ...itemToSet } = option;

    setData(option);
  };
  // const handleChangeSearch = (searchText: string) => {
  //   if (searchText) {
  //     const filterData = data.filter((item: PickerItem) => {
  //       return item.name?.toLowerCase().includes(searchText.toLowerCase())
  //     })
  //     const listData = filterData.map((item: PickerItem) => ({ ...item, displayName: (customBind ? customBind.map((property) => (item[property] ?? property)).join("") : item.name) ?? '' }))
  //     setCountryList([...listData]);
  //   } else {
  //     const fullListData = data.map((item: PickerItem) => ({ ...item, displayName: (customBind ? customBind.map((property) => (item[property] ?? property)).join("") : item.name) ?? '' }));
  //     setCountryList([...fullListData]);
  //   }
  // };


  const handleChangeSearch = (searchText: string) => {
    const trimmedText = searchText.trim().toLowerCase();
    if (trimmedText) {
      const filterData = data.filter((item: PickerItem) => {
        const name = item.name?.toLowerCase() || "";
        const code = item.code?.toLowerCase() || "";
        const mobileCode = item.mobileCode?.toLowerCase() || "";

        return (
          name.includes(trimmedText) ||
          code.includes(trimmedText) ||
          mobileCode.includes(trimmedText)
        );
      });

      const listData = filterData.map((item) => ({
        ...item,
        displayName: customBind
          ? customBind.map((prop) => item[prop] ?? prop).join("")
          : item.name ?? "",
      }));
      setCountryList(listData);
    } else {
      const fullListData = data.map((item) => ({
        ...item,
        displayName: customBind
          ? customBind.map((prop) => item[prop] ?? prop).join("")
          : item.name ?? "",
      }));
      setCountryList(fullListData);
    }
  };

  const renderItem = ({ item, index }: { item: DisplayPickerItem; index: number }) => (
    <React.Fragment key={item.id ?? item.name?.toString() ?? item.code ?? `picker-item-${index?.toString()}`}>
      <TouchableOpacity onPress={() => onPressItem(item)} activeOpacity={0.8}>
        <View style={[
          commonStyles.dflex,
          commonStyles.alignCenter,
          commonStyles.justifyContent,

          (typeof selectedValue === 'object' && selectedValue?.id === item.id && selectedValue?.name === item.name) && commonStyles.activeItemBg

        ]}>

          <ViewComponent style={[commonStyles.gap16, commonStyles.dflex, commonStyles.alignCenter]}>
            {(item.image && isIconsDisplay) && <ViewComponent style={{ width: s(30), height: s(30) }}><ImageUri uri={CoinImages[item?.name?.toLowerCase()]} style={{ borderRadius: s(24) }} /></ViewComponent>}
            {(item.image && showCountryImages) && <ImageUri uri={item?.image} style={{ width: s(26), height: s(26) }} />

            }
            {!item.image && isOnlycountry && <View style={[commonStyles.bottomsheetroundediconbg, item.isDefault ? {} : null]}>
              <ParagraphComponent style={[commonStyles.twolettertext]} text={item.name?.slice(0, 2)?.toUpperCase()} />
            </View>}

            <ParagraphComponent
              text={item?.displayName ?? item?.name}
              style={[commonStyles.bottomsheetprimarytext,commonStyles.mt2, commonStyles.flex1]}
            />
            {showBalance && item?.balance !== undefined && (
              <CurrencyText
                value={item.balance||0}
                decimalPlaces={4}
                style={[commonStyles.listprimarytext]}
              />
            )}
            {/* {(typeof selectedValue === 'object' && selectedValue?.id === item.id && selectedValue?.name === item.name) && (
              <Feather name="check" size={ms(18)} color={NEW_COLOR.TEXT_GREEN} />
            )} */}
          </ViewComponent>

        </View>
      </TouchableOpacity>
      {index !== countryList.length - 1 && <View style={[commonStyles.listGap]} />}
    </React.Fragment>
  );

  const SearchBoxComponent = (
    <View style={commonStyles.sectionGap}>
      <View style={commonStyles.searchContainer}>
        <AntDesign name="search1" color={NEW_COLOR.TEXT_WHITE} size={ms(22)} />

        <TextInput
          style={[commonStyles.searchInput]}
          onChangeText={(val) => handleChangeSearch(val)}
          placeholder={t("GLOBAL_CONSTANTS.SEARCH")}
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
        />
      </View>
    </View>
  );
  return (
    <View style={[styles.modal, { flex: 1 }]}>
      {SearchBoxComponent}
      <FlatList
        data={countryList}
        renderItem={renderItem}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: (typeof selectedValue === 'object' && selectedValue?.id === countryList[countryList.length - 1]?.id) ? ms(30) : 0
        }}
        keyExtractor={(item, index) => item.id ?? item.name ?? item.code ?? `picker-item-${index}`}
        ListEmptyComponent={
          <View style={[commonStyles.mt24]}>
            <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} />
          </View>
        }
      />
    </View>
  );
};
export { Picker };

const screenStyles = (NEW_COLOR: Record<string, string>) => StyleSheet.create({
  searchIcon: {
    width: ms(22),
    height: ms(22), position: 'absolute', right: 18, top: 14
  },
  modal: {
    paddingVertical: 0,
    borderRadius: 0,
  },
  coinStyle: {
    height: s(34), width: s(34),
    borderRadius: s(32) / 2,
    backgroundColor: NEW_COLOR.QUICK_LINKS,
  },
});

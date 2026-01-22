import React, { useMemo } from "react";
import { View, TextInput } from 'react-native';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { s, ms } from '../../../../constants/theme/scale';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import { formatNumberWithCommasToFixed } from '../../../../utils/fillNumberLength';
import NoDataComponent from '../../../../newComponents/noData/noData';
import { FiatAsset } from './vaultsInterface';
import FlatListComponent from '../../../../newComponents/flatList/flatList';
import ViewComponent from '../../../../newComponents/view/view';
import { CoinImages, getThemedCommonStyles } from '../../../../components/CommonStyles';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import ImageUri from '../../../../newComponents/imageComponents/image';
import { CurrencyText } from "../../../../newComponents/textComponets/currencyText/currencyText";

const EmptyListComponent: React.FC = () => {

  return (
    <ViewComponent style={[]}>
      <NoDataComponent />
    </ViewComponent>
  );
};

interface AssetListComponentProps {
  assets: FiatAsset[];
  selectedItem: FiatAsset | null;
  searchText: string;
  onSearchChange: (text: string) => void;
  onItemSelect: (item: FiatAsset) => void;
  onItemPress?: (item: FiatAsset) => void;
}

const AssetListComponent: React.FC<AssetListComponentProps> = ({
  assets,
  selectedItem,
  searchText,
  onSearchChange,
  onItemSelect,
  onItemPress
}) => {
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);

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
          onChangeText={onSearchChange}
          placeholder={t("GLOBAL_CONSTANTS.SEARCH")}
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_COLOR}
        />
      </ViewComponent>
    </ViewComponent>
  );

  return (
    <ViewComponent>
      <ViewComponent style={[commonStyles.titleSectionGap]} >{SearchBoxComponent}</ViewComponent>
      <FlatListComponent
        data={assets}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selectedItem?.id === item.id;
          return (
            <CommonTouchableOpacity
              onPress={() => {
                onItemSelect(item);
                if (onItemPress) {
                  onItemPress(item);
                }
              }}
              activeOpacity={0.85}
              style={[commonStyles.cardsbannerbg, commonStyles.transactionsListGap]}
            >
              <ViewComponent
                style={[onItemPress ? false : isSelected && commonStyles.tabactivebg, commonStyles.gap16, commonStyles.dflex, commonStyles.justifyContent]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                  <ViewComponent style={{ width: s(30), height: s(30) }}>
                    <ImageUri uri={item?.code?.toLowerCase() === 'usd' ? CoinImages['bankusd'] : CoinImages[item?.code?.toLowerCase()] || ""} />
                  </ViewComponent>
                  <ParagraphComponent text={item?.code || ""} style={[commonStyles.primarytext,commonStyles.assetslistcoin ]} />
                </ViewComponent>
                <CurrencyText value={item?.amount || 0} decimalPlaces={2} currency={item?.code} style={[commonStyles.primarytext,commonStyles.assetslistcurrency ]} />
              </ViewComponent>
            </CommonTouchableOpacity>
          );
        }}
        ListEmptyComponent={EmptyListComponent}
      />
    </ViewComponent>
  );
};

export default AssetListComponent;
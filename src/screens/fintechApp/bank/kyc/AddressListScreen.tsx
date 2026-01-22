import React, { useEffect, useState, useMemo } from 'react';
import { TouchableOpacity, KeyboardAvoidingView, Platform, Text, BackHandler } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { s } from '../../../../constants/theme/scale';
import FlatListComponent from '../../../../newComponents/flatList/flatList';
import ViewComponent from '../../../../newComponents/view/view';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import Container from '../../../../newComponents/container/container';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import DashboardLoader from '../../../../components/loader';
import SafeAreaViewComponent from '../../../../newComponents/safeArea/safeArea';
import CreateAccountService from '../../../../apiServices/createAccount';
import { isErrorDispaly } from '../../../../utils/helpers';
import { CheckBox } from 'react-native-elements';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { useDispatch, useSelector } from 'react-redux';
import SearchComponent from '../../../../newComponents/searchComponents/searchComponent';
import NoDataComponent from '../../../../newComponents/noData/noData';
import { AddressListItem, AddressListResponse, NavigationPropAddressList, RenderItemProps, ReduxState } from './interface';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import ScrollViewComponent from '../../../../newComponents/scrollView/scrollView';
import { MaterialIcons } from '@expo/vector-icons';
import AddIcon from '../../../../newComponents/addCommonIcon/addCommonIcon';

interface ItemSeparatorProps {
  style: Record<string, unknown>;
}

const ItemSeparator: React.FC<ItemSeparatorProps> = ({ style }) => (
  <ViewComponent style={style} />
);

const AddressListScreen: React.FC = (props: any) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const navigation = useNavigation<NavigationPropAddressList>();
  const [loading, setLoading] = useState<boolean>(false);
  const [errormsg, setErrormsg] = useState<string>("");
  const [addressList, setAddressList] = useState<AddressListItem[]>([]);
  const [filteredAddressList, setFilteredAddressList] = useState<AddressListItem[]>([]);
  const { selectedAddresses: reduxSelectedAddresses, userDetails: userinfo } = useSelector((state: ReduxState) => state.userReducer);
  const [selectedAddresses, setSelectedAddresses] = useState<AddressListItem[]>(reduxSelectedAddresses || []);
  const { t } = useLngTranslation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchAddressList();
    }
  }, [isFocused]);

  useEffect(() => {
    if (reduxSelectedAddresses && reduxSelectedAddresses.length > 0) {
      setSelectedAddresses(reduxSelectedAddresses);
    }
  }, [reduxSelectedAddresses]);

  useEffect(() => {
    setFilteredAddressList(addressList); // Shows all data initially
  }, [addressList]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => backHandler.remove();
  }, [navigation]);


  const fetchAddressList = async () => {
    setLoading(true);
    setErrormsg("");
    try {
      const response = await CreateAccountService.getAddressList() as AddressListResponse;
      if (response.ok && response.data) {
        setAddressList(response.data);
        setFilteredAddressList(response.data);
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      setLoading(false);
    }
  };


  const handleAddressSelect = (item: AddressListItem) => {
    setSelectedAddresses(prev => {
      const isSelected = prev.some(addr => addr.id === item.id);
      const newSelection = isSelected
        ? prev.filter(addr => addr.id !== item.id)
        : [...prev, item];
      return newSelection;
    });
  };

  const handleSearchResult = (filteredData: AddressListItem[]) => {
    setFilteredAddressList(filteredData);
  };

  const handleContinue = () => {
    // Store selected addresses in Redux
    dispatch({ type: 'SET_SELECTED_ADDRESSES', payload: selectedAddresses });

    // Navigate based on account type
    if (userinfo?.accountType === 'Personal') {
      navigation.navigate(props.route?.params.route?.name, { animation: "slide_from_left" , ...props.route?.params} );
    } else {
      navigation.navigate(props.route?.params.route?.name, { animation: "slide_from_left" , ...props.route?.params} );
    }
  };
  const handleAddNew = () => {
    navigation.navigate('BankAddPersonalInfo');
  };
  const addIcon = !loading ? (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleAddNew}
    >
      <ViewComponent style={[commonStyles.actioniconbg]}>
        <AddIcon />
      </ViewComponent>
    </TouchableOpacity>
  ) : null;

  const renderAddressItem = ({ item }: RenderItemProps) => (
    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter,]}>
      <ViewComponent style={[commonStyles.dflex, commonStyles.flex1, commonStyles.justifyContent, commonStyles.alignCenter]}>
        <CommonTouchableOpacity
          onPress={() => handleAddressSelect(item)}
          activeOpacity={0.8}
          style={[commonStyles.flex1]}
        >
          <ParagraphComponent
            style={[commonStyles.sectionSubTitleText]}
            text={item.favoriteName || item.id}
            numberOfLines={1}
          />
        </CommonTouchableOpacity>
      </ViewComponent>
      <ViewComponent style={[commonStyles.alignCenter, commonStyles.justifyCenter, { minHeight: s(34), minWidth: s(34) }]}>
        <CheckBox
          checked={selectedAddresses.some(addr => addr.id === item.id)}
          onPress={() => {
            handleAddressSelect(item);
          }}
          containerStyle={{ backgroundColor: 'transparent', borderWidth: 0, padding: 0, margin: 0 }}
          checkedColor={NEW_COLOR.TEXT_PRIMARY}
          uncheckedColor={NEW_COLOR.INPUT_BORDER}
          size={s(20)}
          iconType="material-community"
          checkedIcon="checkbox-outline"
          uncheckedIcon="checkbox-blank-outline"
        />
      </ViewComponent>
    </ViewComponent>
  );


  const renderItemSeparator = () => <ItemSeparator style={commonStyles.listitemGap} />;


  return (
    <KeyboardAvoidingView
      style={[commonStyles.flex1]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
        {loading ? (
          <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>
        ) : (
          <Container style={commonStyles.container}>
            <PageHeader
              title={t("GLOBAL_CONSTANTS.SELECT_ADDRESSES")}
              onBackPress={() => navigation.goBack()}
              rightActions={addIcon}
            />
            <ScrollViewComponent showsVerticalScrollIndicator={false}>

              {errormsg !== "" && (
                <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />
              )}

              <ViewComponent>
                <SearchComponent
                  data={addressList}
                  customBind="favoriteName"
                  onSearchResult={handleSearchResult}
                  placeholder={"GLOBAL_CONSTANTS.SEARCH_ADDRESSES"}
                />
              </ViewComponent>
              <ViewComponent style={{ flex: 1 }}>
                <FlatListComponent
                  data={filteredAddressList}
                  scrollEnabled={false}
                  keyExtractor={(item: AddressListItem) => item.id}
                  renderItem={renderAddressItem}
                  ItemSeparatorComponent={renderItemSeparator}
                  ListEmptyComponent={
                    !loading && <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_ADDRESSES_FOUND"} />
                  }

                />
              </ViewComponent>
            </ScrollViewComponent>
            {selectedAddresses.length > 0 && addressList.length > 0 && (<>
              <ViewComponent style={commonStyles.sectionGap} />

              <ButtonComponent
                title={`${t("GLOBAL_CONSTANTS.CONTINUE")} (${selectedAddresses.length})`}
                onPress={handleContinue}
              /></>
            )}
            <ViewComponent style={[commonStyles.sectionGap]} />
          </Container>
        )}
      </ViewComponent>
    </KeyboardAvoidingView>
  );
};

export default AddressListScreen;

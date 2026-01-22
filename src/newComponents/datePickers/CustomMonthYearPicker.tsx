import React, { useState } from 'react';
import { TouchableOpacity, Modal, View, Text, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import ViewComponent from '../view/view';
import LabelComponent from '../textComponets/lableComponent/lable';
import { getThemedCommonStyles } from '../../components/CommonStyles';
import ButtonComponent from '../buttons/button';
import CommonTouchableOpacity from '../touchableComponents/touchableOpacity';
import Feather from '@expo/vector-icons/Feather';
import { s } from '../theme/scale';

interface MonthYearPickerProps {
  label: string;
  value: string;
  onDateChange: (formattedDate: string) => void;
  error?: string;
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ label, value, onDateChange, error }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);

  const handleConfirm = () => {
    const month = String(selectedMonth + 1).padStart(2, '0');
    const year = String(selectedYear).slice(-2);
    onDateChange(`${month}/${year}`);
    setShowPicker(false);
  };

  const displayValue = value || 'MM/YY';

  return (
    <View>
      <LabelComponent text={label} style={[commonStyles.inputLabel]} />
      <CommonTouchableOpacity onPress={() => setShowPicker(true)}>
        <View style={[
          commonStyles.input,
          commonStyles.dflex,
          commonStyles.justifyContent,
          commonStyles.alignCenter,
          error ? commonStyles.errorBorder : null,
        ]}>
          <Text style={[
            commonStyles.phonecodetextinpu,
            { color: value ? NEW_COLOR.TEXT_WHITE : NEW_COLOR.PLACEHOLDER_TEXTCOLOR }
          ]}>
            {displayValue}
          </Text>
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Feather name="calendar" size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
          </TouchableOpacity>
        </View>
      </CommonTouchableOpacity>

      {showPicker && (
        <Modal transparent animationType="fade" visible={showPicker}>
          <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
            <View style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
              <TouchableWithoutFeedback>
                <View style={[commonStyles.bannerbg, commonStyles.rounded10, commonStyles.p10, { width: 300 }]}>
                  <View style={[commonStyles.dflex, { height: 200 }]}>
                    <ScrollView style={[commonStyles.flex1, { marginRight: 10 }]} showsVerticalScrollIndicator={false}>
                      {months.map((month, index) => (
                        <TouchableOpacity
                          key={month}
                          onPress={() => setSelectedMonth(index)}
                          style={[
                            commonStyles.p10,
                            commonStyles.alignCenter,
                            selectedMonth === index && { backgroundColor: NEW_COLOR.TEXT_PRIMARY }
                          ]}
                        >
                          <Text style={[{ color: NEW_COLOR.TEXT_WHITE, fontSize: 16 }]}>{month}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <ScrollView style={[commonStyles.flex1]} showsVerticalScrollIndicator={false}>
                      {years.map((year) => (
                        <TouchableOpacity
                          key={year}
                          onPress={() => setSelectedYear(year)}
                          style={[
                            commonStyles.p10,
                            commonStyles.alignCenter,
                            selectedYear === year && { backgroundColor: NEW_COLOR.TEXT_PRIMARY }
                          ]}
                        >
                          <Text style={[{ color: NEW_COLOR.TEXT_WHITE, fontSize: 16 }]}>{year}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap10, commonStyles.mt10]}>
                    <ViewComponent style={[commonStyles.flex1]}>
                      <ButtonComponent title="Cancel" onPress={() => setShowPicker(false)} solidBackground={true} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1]}>
                      <ButtonComponent title="OK" onPress={handleConfirm} />
                    </ViewComponent>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {error && (
        <Text style={[commonStyles.inputerrormessage]}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default MonthYearPicker;
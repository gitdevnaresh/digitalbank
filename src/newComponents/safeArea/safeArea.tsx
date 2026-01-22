import React from 'react';
import { SafeAreaView, StyleProp, ViewStyle } from 'react-native';
import { getThemedCommonStyles } from '../../components/CommonStyles';
import { useThemeColors } from '../../hooks/useThemeColors';

interface SafeAreaViewComponentProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  transparentBg?: boolean;
}

const SafeAreaViewComponent: React.FC<SafeAreaViewComponentProps> = ({ style, transparentBg = false, children, ...props }) => {
 const NEW_COLOR = useThemeColors();
 const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return (
    <SafeAreaView style={[commonStyles.flex1, transparentBg ? null : commonStyles.screenBg, style]} {...props}>
      {children}
    </SafeAreaView>
  );
};

export default SafeAreaViewComponent;


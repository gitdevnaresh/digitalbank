import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Tooltip } from '@ui-kitten/components';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getThemedCommonStyles } from '../../components/CommonStyles';
import { s } from '../../constants/theme/scale';
import { useThemeColors } from '../../hooks/useThemeColors';
import TextMultiLanguage from '../textComponets/multiLanguageText/textMultiLangauge';
import ViewComponent from '../view/view';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  onPress: () => void;
  size?: number;
  copyIconColor?: any;
};

type CopyCardRef = {
  triggerCopy: () => void;
};

const CopyCard = forwardRef<CopyCardRef, Props>(({ onPress, size, copyIconColor }, ref) => {
  const [toolTipVisible, setToolTipVisible] = useState(false);
  const clearTimer = useRef<NodeJS.Timeout>();
  const NEW_COLOR = useThemeColors();
   const commonStyles = getThemedCommonStyles(NEW_COLOR);

  useImperativeHandle(ref, () => ({
    triggerCopy: () => {
      setToolTipVisible(true);
    }
  }));

  useEffect(() => {
    if (toolTipVisible) {
      const timer = setTimeout(() => {
        setToolTipVisible(false);
      }, 2000);
      clearTimer.current = timer;
    }
    return () => {
      if (clearTimer.current) {
        clearTimeout(clearTimer.current);
      }
    };
  }, [toolTipVisible]);

  return (
    <ViewComponent>
      <TouchableOpacity
        onPress={() => {
          onPress();
          setToolTipVisible(true);
        }}
        style={{
          width: size ?? s(40),
          height: size ?? s(20),
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Ionicons
          name="copy-outline"
          size={size ?? s(20)}
          color={copyIconColor ?? NEW_COLOR.LINKPRIMARY_COLOR}
        />      </TouchableOpacity>

      {toolTipVisible && (
        <ViewComponent style={[commonStyles.copytooltip,commonStyles.px10,commonStyles.py8,{
          position: 'absolute',
          top: s(-40),
          left: s(-70),
          width: s(100),
          borderRadius: s(6),
          
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: s(110),
        }]}>
          <MaterialCommunityIcons
            name="check"
            size={s(16)}
            color={NEW_COLOR.TEXT_GREEN}
            style={{ marginRight: s(4) }}
          />
          <TextMultiLanguage
            text="GLOBAL_CONSTANTS.COPIED"
            style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textWhite,]}
          />
        </ViewComponent>
      )}
    </ViewComponent>
  );
});

export default CopyCard;

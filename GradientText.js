import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

const GradientText = ({
  text,
  fontSize = 24,
  style,
}) => {
  // Calculate a height slightly larger than the fontSize to ensure text is fully visible
  const calculatedHeight = fontSize * 1.2; // Add some padding
  return (
    <View style={[{ height: calculatedHeight, width: '100%' }, style]}>
      <Svg style={{ flex: 1 }}>
        <Defs>
          <LinearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="8.54%" stopColor="#11998E" />
            <Stop offset="102.13%" stopColor="#38EF7D" />
          </LinearGradient>
        </Defs>
        <SvgText
          fill="url(#textGradient)"
          fontSize={fontSize}
          fontWeight="bold"
          x="50%"
          y={fontSize * 0.8} // Adjust y to center text vertically within the calculated height
          textAnchor="middle"
        >
          {text}
        </SvgText>
      </Svg>
    </View>
  );
};

export default GradientText; 
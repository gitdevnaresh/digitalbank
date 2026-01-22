import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { View, StyleSheet, useColorScheme, ScrollView } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { getThemedCommonStyles } from '../../components/CommonStyles';
import { s } from '../../constants/theme/scale';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useSelector } from 'react-redux';
import CommonTouchableOpacity from '../touchableComponents/touchableOpacity';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getTabsConfigation } from '../../../configuration';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';

interface LineChartData {
  name: string;
  data: { yAxis: number; name: string }[];
  color: string;
  dataPointsColor: string;
  textColor: string;
}

interface DynamicLineChartProps {
  data: LineChartData[];
  height?: number;
  showVerticalLines?: boolean;
  spacing?: number;
  initialSpacing?: number;
  textShiftY?: number;
  textShiftX?: number;
  textFontSize?: number;
  xAxisLabels?: string[];
  screenName?: string;
  startFillColor?: string;
  endFillColor?: string;
}

const DynamicLineChart: React.FC<DynamicLineChartProps> = ({
  data = [],
  screenName = 'default',
  height,
  spacing = s(50),
  initialSpacing = 0,
  textShiftY = s(-2),
  textShiftX = s(-5),
  textFontSize = s(13),
}) => {
  const NEW_COLOR = useMemo(() => useThemeColors(), []);
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const currency = useMemo(() => getTabsConfigation('CURRENCY'), []);
  const appThemeSetting = useSelector((state: any) => state.userReducer?.appTheme);
  const colorScheme = useColorScheme();
  const backgroundSource = useMemo(() => {
    if (appThemeSetting !== 'system' && appThemeSetting !== undefined && appThemeSetting !== null) {
      return appThemeSetting === 'dark';
    }
    return colorScheme === 'dark';
  }, [appThemeSetting, colorScheme]);

  // ✅ Stable helper function
  const hexToRgba = useCallback((hex: string, alpha: number = 1): string => {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return `rgba(0,0,0,${alpha})`;
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }, []);

  // ✅ Keep same state behavior (hide/show per series)
  const [componentNames, setComponentNames] = useState(
    data?.map((model, index) => ({
      name: model?.name,
      recorder: index + 1,
      color: model?.color,
      dataLength: model?.data?.length,
      isDisplay: false,
    })) || []
  );

  // ✅ Stable label renderer
  const customLabel = useCallback(
    (val: any) => (
      <View style={{ width: s(70), marginLeft: s(12) }}>
        <ParagraphComponent
          style={[
            commonStyles.textlinkgrey,
            commonStyles.fs10,
            commonStyles.ml8,
            { transform: [{ rotate: '-20deg' }] },
          ]}
        >
          {val}
        </ParagraphComponent>
      </View>
    ),
    [commonStyles]
  );

  // ✅ Precompute processed series once (reverse + labelComponent)
  const processedSeries = useMemo(() => {
    return data.map((item) => ({
      name: item.name,
      color: item.color,
      textColor: item.textColor,
      endColor: item.endColor,
      points: (item?.data || [])
        .slice()
        .reverse()
        .map((p) => ({
          value: p?.yAxis,
          name: p?.name,
          labelComponent: () => customLabel(p?.name),
        })),
    }));
  }, [data, customLabel]);

  const allItemsEffectivelyHidden = useMemo(() => componentNames.every((item) => item.isDisplay), [componentNames]);

  // ✅ Build chartProps from memo, based on hidden flags
  const chartProps = useMemo(() => {
    const propsObj: any = {};
    processedSeries.forEach((series, index) => {
      const keySuffix = index > 0 ? index + 1 : '';
      const hidden = componentNames.find((m) => m.name === series.name)?.isDisplay === true;

      if (!hidden) {
        propsObj[`data${keySuffix}`] = series.points;
        propsObj[`color${keySuffix}`] = series.color;
        propsObj[`dataPointsColor${keySuffix}`] = series.color;
        propsObj[`textColor${keySuffix}`] = series.textColor;
        propsObj[`startFillColor${keySuffix}`] = series.color;
        propsObj[`endFillColor${keySuffix}`] = series.endColor || hexToRgba(series.color, 0.1);
      } else {
        // keep your old "flat at 0" behavior
        propsObj[`data${keySuffix}`] = series.points.map((p) => ({ ...p, value: 0 }));
      }
    });
    return propsObj;
  }, [processedSeries, componentNames, hexToRgba]);
  const [tooltipData, setTooltipData] = useState<string | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Prevent repeated setState inside pointer move
  const lastTooltipRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleClick = useCallback(
    (itemName: any) => {
      setComponentNames((prev) =>
        prev.map((model) => (model?.name === itemName ? { ...model, isDisplay: !model?.isDisplay } : model))
      );
    },
    []
  );
  // ✅ maxVal calculation stays but more direct
  const maxVal = useMemo(() => {
    const allValues = data.flatMap((item) => item.data.map((p) => p.yAxis)).filter((v) => typeof v === 'number' && !isNaN(v));
    return allValues.length > 0 ? Math.max(...allValues) : 100;
  }, [data]);

  const formatYLabel = useCallback(
    (value: any) => {
      const num = Number(value);
      const currencySymbol = currency[userInfo?.currency || 'USD'] || '';
      if (isNaN(num)) return `${currencySymbol}${value}`;
      if (Math.abs(num) >= 1_000_000_000_000) return `${currencySymbol}${(num / 1_000_000_000_000).toFixed(2).replace(/\.00$/, '')}T`;
      if (Math.abs(num) >= 1_000_000_000) return `${currencySymbol}${(num / 1_000_000_000).toFixed(2).replace(/\.00$/, '')}B`;
      if (Math.abs(num) >= 1_000_000) return `${currencySymbol}${(num / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;
      if (Math.abs(num) >= 1_000) return `${currencySymbol}${(num / 1_000).toFixed(2).replace(/\.00$/, '')}k`;
      return `${currencySymbol}${num.toFixed(2).replace(/\.00$/, '')}`;
    },
    [currency, userInfo?.currency]
  );

  const pointerLabelComponent = useCallback(
    (items: any) => {
      if (!items?.length) {
        if (tooltipData !== null) setTooltipData(null);
        return null;
      }

      const selectedItem = items.find((it: any) => it.value > 0) || items[0];
      const seriesIndex = items.indexOf(selectedItem);
      const seriesName = data[seriesIndex]?.name || 'Unknown';

      const currencySymbol = currency[userInfo?.currency || 'USD'] || '';
      const value = selectedItem.value || 0;
      const displayDate = selectedItem.name || 'N/A';
      const formattedValue = `${currencySymbol}${Number(value).toFixed(2)}`;
      const combinedText = `${displayDate} ${seriesName}: ${formattedValue}`;

      // ✅ Throttle updates
      if (lastTooltipRef.current === combinedText) return null;
      lastTooltipRef.current = combinedText;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setTooltipData(combinedText);

        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
        tooltipTimeoutRef.current = setTimeout(() => {
          lastTooltipRef.current = null;
          setTooltipData(null);
        }, 5000);
      });

      return null;
    },
    [currency, data, tooltipData, userInfo?.currency]
  );

  if (!data || data.length === 0) return <View />;
  return (
    <>
      <View>
        {tooltipData && (
          <View
            style={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: [{ translateX: -70 }],
              zIndex: 1000,
              backgroundColor: NEW_COLOR.BANNER_BG,
              borderRadius: s(8),
              paddingHorizontal: 10,
              paddingVertical: 6,
              minWidth: 140,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: NEW_COLOR.BANNER_BG,
            }}
          >
            <ParagraphComponent
              style={{
                color: NEW_COLOR.TEXT_WHITE,
                fontSize: 12,
                textAlign: 'center',
                fontWeight: '500',
              }}
            >
              {tooltipData}
            </ParagraphComponent>
          </View>
        )}

        <View style={styles.container}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ alignItems: 'center' }}>
            <LineChart
              hideDataPoints
              curved
              areaChart
              isAnimated
              {...chartProps}
              yAxisTextStyle={[commonStyles.textWhite, commonStyles.fs12]}
              hideYAxisText={screenName === 'homePayments'}
              endFillColor1={backgroundSource ? '#000' : '#fff'}
              formatYLabel={formatYLabel}
              noOfSections={5}
              spacing={s(spacing)}
              animationDuration={1000}
              maxValue={maxVal}
              dataPointsHeight1={0}
              initialSpacing={s(initialSpacing)}
              dataPointsHeight={s(0)}
              dataPointsWidth={s(0)}
              textShiftY={textShiftY}
              width={screenName === 'homePayments' ? undefined : data[0]?.data?.length * spacing + initialSpacing}
              textShiftX={textShiftX}
              textFontSize={textFontSize}
              height={height}
              yAxisLabelWidth={s(60)}
              yAxisOffset={0}
              xAxisColor={'transparent'}
              endOpacity={0.1}
              hideRules
              yAxisColor="transparent"
              xAxisThickness={3}
              yAxisThickness={1}
              xAxisLabelTextStyle={
                allItemsEffectivelyHidden
                  ? { color: 'transparent' }
                  : [commonStyles.textlinkgrey, commonStyles.fs6, commonStyles.ml8, commonStyles.mt10, commonStyles.fw200]
              }
              pointerConfig={{
                pointerStripUptoDataPoint: true,
                pointerStripColor: '#8A939A',
                pointerStripWidth: 1,
                pointerColor: '#8A939A',
                radius: 6,
                pointerLabelComponent,
              }}
            />
          </ScrollView>
        </View>

        {screenName !== 'homePayments' && screenName !== 'exchange' && (
          <View style={[commonStyles.dflex, commonStyles.flexWrap, commonStyles.justifyCenter, commonStyles.alignCenter]}>
            {componentNames?.map((item) => (
              <View key={item?.name} style={[commonStyles.dflex, commonStyles.justifyCenter, { width: '50%', marginBottom: s(8) }]}>
                <CommonTouchableOpacity
                  style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter]}
                  onPress={() => handleClick(item?.name)}
                >
                  <FontAwesome name="minus" size={s(24)} color={item?.isDisplay ? NEW_COLOR.DIVIDER_COLOR : item?.color} />
                  <ParagraphComponent
                    text={item?.name}
                    style={[
                      commonStyles?.textWhite,
                      commonStyles.fs10,
                      commonStyles.fw400,
                      item?.isDisplay ? commonStyles.textStrike : null,
                    ]}
                  />
                </CommonTouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: s(330),
  },
});

export default React.memo(DynamicLineChart);



import {  View } from "react-native";
import { ms } from "../../../../newComponents/theme/scale";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";


export const summaryLoader = (count: number) => {
    const NEW_COLOR = useThemeColors();
     const commonStyles = getThemedCommonStyles(NEW_COLOR);
    
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList?.push(i)
        }
    }
    const html = <View >
        {countList?.map((index) => (
          <View  key={index} style={[commonStyles.kpibg, { width: '100%', height: ms(45), borderRadius: ms(12),  marginBottom: ms(10), }]} />))}
    </View>;
    return html;
};

export const recipientSummaryLoader = (count: number) => {
    const NEW_COLOR = useThemeColors();
     const commonStyles = getThemedCommonStyles(NEW_COLOR);
    
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList?.push(i)
        }
    }
    const html = <View >
        {countList?.map((index) => (
          <View  key={index} style={[commonStyles.kpibg, { width: '100%', height: ms(2), borderRadius: ms(12),  marginBottom: ms(-10), }]} />))}
    </View>;
    return html;
};

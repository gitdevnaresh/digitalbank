import React from "react";
import SvgFromUrl from '../../components/svgIcon';
import ParagraphComponent from '../../newComponents/textComponets/paragraphText/paragraph';
import { s } from '../../constants/theme/scale';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles, CoinImages } from '../../components/CommonStyles';
import ViewComponent from '../../newComponents/view/view';

interface CurrencyIconProps {
  image?: string;
  uri?: string;
  size?: number;
  width?: number;
  height?: number;
}

const CurrencyIcon: React.FC<CurrencyIconProps> = ({  image, uri, size = 32, width, height }) => {
  const NEW_COLOR = useThemeColors();
   const commonStyles = getThemedCommonStyles(NEW_COLOR);
  
  const finalSize = width || height || size;
  
  // Extract currency code from uri if code is not provided
  const currencyCode =  uri;
  const imageUrl = (currencyCode ? CoinImages[currencyCode.toLowerCase()] : null) || image;
  
  if (imageUrl) {
    return <SvgFromUrl uri={imageUrl} width={s(finalSize)} height={s(finalSize)} />;
  }
  
  // Fallback: Show first two letters of currency code
  const fallbackText = currencyCode?.substring(0, 2)?.toUpperCase() || '';
  
  return (
    <ViewComponent style={[commonStyles.iconbg]}>
      <ParagraphComponent 
        text={fallbackText}
        style={[
          commonStyles.circletext
        ]}
      />
    </ViewComponent>
  );
};

export default CurrencyIcon;

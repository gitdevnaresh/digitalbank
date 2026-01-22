import React from "react";
import SvgFromUrl from '../../components/svgIcon';
import ParagraphComponent from '../../newComponents/textComponets/paragraphText/paragraph';
import { s } from '../../constants/theme/scale';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles, CoinImages } from '../../components/CommonStyles';
import ViewComponent from '../../newComponents/view/view';

interface AssetIconProps {
  image?: string;
  uri?: string;
  size?: number;
  width?: number;
  height?: number;
  style?: any;
}

const AssetIcon : React.FC<AssetIconProps> = ({  image, uri, size = 32, width, height,style }) => {
  const NEW_COLOR = useThemeColors();
   const commonStyles = getThemedCommonStyles(NEW_COLOR);  
  // Extract currency code from uri if code is not provided
  const assetCode =  uri;
  const imageUrl = image||(assetCode ? CoinImages[assetCode.toLowerCase()] : null)  ;

  if (imageUrl) {    
    return <SvgFromUrl uri={imageUrl} width={s(width||size)} height={s(height||size)} style={style} />;
  }
  
  // Fallback: Show first two letters of currency code
  const fallbackText = assetCode?.substring(0, 2)?.toUpperCase() || '';
  
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

export default AssetIcon;
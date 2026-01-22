import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import ViewComponent from "../../../newComponents/view/view";
import { s } from "../../../constants/theme/scale";
import { useThemeColors } from "../../../hooks/useThemeColors";

interface HomeactiveIconProps extends SvgProps {
  width?: number;
  height?: number;
  style?: any;
  color?: string; // will be used as fill color
}

const HomeactiveIcon: React.FC<HomeactiveIconProps> = ({
  width = s(23),
  height = s(24),
  style,
  color,
  ...props
}) => {
  const NEW_COLOR = useThemeColors();

  return (
    <ViewComponent style={style}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 51 49"
        fill="none"
        {...props}
      >
       
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M30.4828 2.58414C27.641 0.058216 23.359 0.058216 20.5173 2.58414L1.33913 19.6314C0.307157 20.5487 0.214207 22.1289 1.13151 23.1609C2.04881 24.1927 3.62898 24.2857 4.66093 23.3684L5.50003 22.6227V36.6644C5.49991 38.8807 5.49981 40.7902 5.70538 42.3194C5.92571 43.9582 6.42258 45.5292 7.69673 46.8032C8.97088 48.0774 10.5418 48.5742 12.1806 48.7947C13.7097 49.0002 15.6192 48.9999 17.8355 48.9999H33.1645C35.3808 48.9999 37.2903 49.0002 38.8195 48.7947C40.4583 48.5742 42.0293 48.0774 43.3033 46.8032C44.5775 45.5292 45.0743 43.9582 45.2948 42.3194C45.5003 40.7902 45.5003 38.8807 45.5 36.6647V22.6227L46.339 23.3684C47.371 24.2857 48.9513 24.1927 49.8685 23.1609C50.7858 22.1289 50.693 20.5487 49.661 19.6314L30.4828 2.58414ZM25.5 33.9999C24.1193 33.9999 23 35.1192 23 36.4999V41.4999C23 42.8807 21.8808 43.9999 20.5 43.9999C19.1193 43.9999 18 42.8807 18 41.4999V36.4999C18 32.3577 21.3578 28.9999 25.5 28.9999C29.6423 28.9999 33 32.3577 33 36.4999V41.4999C33 42.8807 31.8808 43.9999 30.5 43.9999C29.1193 43.9999 28 42.8807 28 41.4999V36.4999C28 35.1192 26.8808 33.9999 25.5 33.9999Z"
          fill={color || NEW_COLOR.BUTTON_BG}
        />
      </Svg>
    </ViewComponent>
  );
};

export default HomeactiveIcon;

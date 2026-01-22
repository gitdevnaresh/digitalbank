import React from "react";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import ViewComponent from "../../../../newComponents/view/view";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import TextMultiLangauge from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../newComponents/buttons/button";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import ScrollViewComponent from "../../../../newComponents/scrollView/scrollView";
import NoDataComponent from "../../../../newComponents/noData/noData";

interface CardActionsSheetCardInfoProps {
  cardSuportedPlatForms?: any[];
  iconsList: { [key: string]: JSX.Element };
  onClose?: () => void;
}

const CardActionsSheetCardInfo: React.FC<CardActionsSheetCardInfoProps> = ({
  cardSuportedPlatForms,
  iconsList,
  onClose,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  return (
    <ViewComponent style={{ flex: 1 }}>
      <ScrollViewComponent contentContainerStyle={{ flexGrow: 1 }}>
        <ViewComponent style={[
          commonStyles.dflex,
          commonStyles.justifyContent,
          commonStyles.alignCenter,
          commonStyles.sectionGap,
          { flexWrap: 'wrap' }
        ]}>
          {cardSuportedPlatForms && cardSuportedPlatForms.length > 0 ? (
            <ParagraphComponent
              text={cardSuportedPlatForms.map(platform => platform.trim()).join(', ')}
              style={[
                commonStyles.fs12,
                commonStyles.fw500,
                commonStyles.textWhite,
              ]}
            />
          ) : (
            <ViewComponent style={[commonStyles.flex1,commonStyles.justifyCenter]}>
              <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_SUPPORTED_PLATFORMS"} />
            </ViewComponent>
          )}
        </ViewComponent>
      </ScrollViewComponent>
      {onClose && (
        <ViewComponent>
          <ButtonComponent
            title={"GLOBAL_CONSTANTS.CLOSE"}
            onPress={onClose}
            solidBackground={true}
          />
        </ViewComponent>
      )}
      <ViewComponent style={[commonStyles.sectionGap]} />
    </ViewComponent>
  );
}

export default CardActionsSheetCardInfo;
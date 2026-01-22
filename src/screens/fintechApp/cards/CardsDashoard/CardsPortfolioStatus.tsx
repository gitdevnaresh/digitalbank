import React from "react";
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import ViewComponent from '../../../../newComponents/view/view';
import TextMultiLangauge from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import Loadding from '../../../commonScreens/skeltons';
import LineChartComponet from '../../../../newComponents/graphs/Linchart';
import NoDataComponent from '../../../../newComponents/noData/noData';
import { s } from '../../../../newComponents/theme/scale';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';

interface CardsPortfolioStatusProps {
  Configuration: any;
  graphDetailsLoading: boolean;
  graphDetails: any[];
  activeDays: string;
  handleYears: (item: any) => void;
  cardGraphSkelton: JSX.Element;
}

const DaysLookup = [{ code: '7D', name: '7' }, { code: '30D', name: '30' }];

const CardsPortfolioStatus: React.FC<CardsPortfolioStatusProps> = ({
  Configuration,
  graphDetailsLoading,
  graphDetails,
  activeDays,
  handleYears,
  cardGraphSkelton,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  if (!Configuration?.GRAPH?.Cards) {
    return null; // Don't render if config is off
  }

  return (
    <ViewComponent>
      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
        <TextMultiLangauge text={"GLOBAL_CONSTANTS.SPENDING"} style={[commonStyles.sectionTitle]} />
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter,]}>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}>
            {DaysLookup?.map((item: any, index: any) => (
              <React.Fragment key={item.name}>
                {activeDays === item.name ? (
                  <ViewComponent style={[commonStyles.graphactivebuttons]} >
                    <ParagraphComponent style={[commonStyles.graphactivebuttonstext]} text={item.code} />
                  </ViewComponent>
                ) : (
                  <CommonTouchableOpacity onPress={() => handleYears(item)} style={commonStyles.graphinactivebuttons} activeOpacity={0.9} >
                    <ParagraphComponent style={[activeDays === item?.name ? commonStyles.textAlwaysWhite : commonStyles.textWhite, commonStyles.graphinactivebuttonstext]} text={item?.code} />
                  </CommonTouchableOpacity>
                )}
                {index !== DaysLookup?.length - 1 && <ViewComponent style={{ height: 26, width: 1 }} />}
              </React.Fragment>
            ))}
          </ViewComponent>
        </ViewComponent>
      </ViewComponent>
      <ViewComponent style={[commonStyles.mt16]}>
        {graphDetailsLoading && <Loadding contenthtml={cardGraphSkelton} />}
        {!graphDetailsLoading && graphDetails?.length > 0 && <LineChartComponet
          data={graphDetails || []}
        />}
        {!graphDetailsLoading && graphDetails?.length <= 0 && (
          <NoDataComponent />
        )}
      </ViewComponent>
    </ViewComponent>
  );
};

export default CardsPortfolioStatus;
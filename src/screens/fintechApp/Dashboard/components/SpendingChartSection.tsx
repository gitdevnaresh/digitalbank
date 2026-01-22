import React from "react";
import ViewComponent from "../../../../newComponents/view/view";
import TextMultiLangauge from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import LineChartComponet from "../../../../newComponents/graphs/Linchart";
import NoDataComponent from "../../../../newComponents/noData/noData";
import { DaysLookup } from "../constant";
import { s } from "../../../../constants/theme/scale";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { homeanalyticsGraph } from "../../skeleton_views";
import Loadding from "../../../commonScreens/skeltons";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";


interface GraphConfiguration {
    GRAPH?: {
        Home?: boolean;
        // Add other properties if they exist
    };
    // Add other properties of GraphConfiguration
}

interface GraphDetailItemDataPoint {
    name: string;
    yAxis: number;
    color: string;
}

interface GraphDetailItem {
    name: string;
    colorByPoint?: boolean;
    data: GraphDetailItemDataPoint[];
    color?: string;
    dataPointsColor?: string; // Optional, as it's defaulted
    textColor?: string;      // Optional, as it's defaulted
}

interface DayLookupItem {
    code: string;
    name: string;
}

interface NewColor {
    TEXT_WHITE: string;
    // Add other color properties
}

interface SpendingChartSectionProps {
    GraphConfiguration: GraphConfiguration;
    graphDetails: GraphDetailItem[];
    activeYear: string;
    handleYears: (item: DayLookupItem) => void;
    graphDetailsLoading?: boolean;
    disableInternalFetch?: boolean;
}

const SpendingChartSection: React.FC<SpendingChartSectionProps> = ({ GraphConfiguration, graphDetails, activeYear, handleYears, graphDetailsLoading, disableInternalFetch }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const cardGraphSkelton = homeanalyticsGraph();

    if (!GraphConfiguration?.GRAPH?.Home) {
        return null;
    }
    return (
        <ViewComponent>
            <ViewComponent
                style={[
                    commonStyles.dflex,
                    commonStyles.alignCenter,
                    commonStyles.justifyContent,
                    commonStyles.titleSectionGap,
                ]}
            >
                <TextMultiLangauge
                    text={"GLOBAL_CONSTANTS.SPENDING"}
                    style={[commonStyles.sectionTitle]}
                />
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter,]}>
                    {DaysLookup?.map((item: DayLookupItem, index: number) => (
                        <React.Fragment key={item.name}>
                            {activeYear === item.name ? (
                                <ViewComponent
                                    style={[commonStyles.graphactivebuttons]} >
                                    <ParagraphComponent
                                        style={[commonStyles.graphactivebuttonstext]} text={item.code} />
                                </ViewComponent>
                            ) : (
                                <CommonTouchableOpacity
                                    onPress={() => handleYears(item)}
                                    style={commonStyles.graphinactivebuttons} activeOpacity={0.9} >
                                    <ParagraphComponent style={[activeYear === item?.name ? commonStyles.textAlwaysWhite : commonStyles.textWhite, commonStyles.graphinactivebuttonstext]} text={item?.code} />

                                </CommonTouchableOpacity>
                            )}
                            {index !== DaysLookup.length - 1 && <ViewComponent style={{ width: s(8) }} />}
                        </React.Fragment>
                    ))}
                </ViewComponent>
            </ViewComponent>

            <ViewComponent>
                {(() => {
                    if (graphDetailsLoading) {
                        return <Loadding contenthtml={cardGraphSkelton} />;
                    }
                    if (graphDetails?.length > 0) {
                        return (
                            <LineChartComponet
                                data={(graphDetails || []).map((item: GraphDetailItem) => ({
                                    ...item,
                                    color: item.color ?? "#000000",
                                    dataPointsColor: item.dataPointsColor ?? "#11998E",
                                    textColor: item.textColor ?? NEW_COLOR.TEXT_WHITE,
                                }))}
                            />
                        );
                    }
                    return <NoDataComponent />;
                })()}
            </ViewComponent>
        </ViewComponent>
    );
};

export default React.memo(SpendingChartSection);
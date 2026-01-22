import React, { useEffect, useState, useCallback } from "react";
import { getThemedCommonStyles } from "../../../../../../components/CommonStyles";
import { useThemeColors } from "../../../../../../hooks/useThemeColors";
import PageHeader from "../../../../../../newComponents/pageHeader/pageHeader";
import ViewComponent from "../../../../../../newComponents/view/view";
import PaymentService from "../../../../../../apiServices/payments";
import { isErrorDispaly } from "../../../../../../utils/helpers";
import ErrorComponent from "../../../../../../newComponents/errorDisplay/errorDisplay";
import DashboardLoader from "../../../../../../components/loader";
import SafeAreaViewComponent from "../../../../../../newComponents/safeArea/safeArea";
import { ScrollView } from "react-native";
import Container from "../../../../../../newComponents/container/container";
import PaymentScreen from "./fiatPayInDetails";
import { useHardwareBackHandler } from "../../../../../../hooks/backHandleHook";
import { useNavigation } from "@react-navigation/native";
import NoDataComponent from "../../../../../../newComponents/noData/noData";
import { RefreshControl } from "react-native-gesture-handler";


const FiatPayinView = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [payInView, setPayInView] = useState<any>([]);
    const [error, setError] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation<any>();



    useEffect(() => {
        fetchFiatPayinView();
    }, []);

    const fetchFiatPayinView = async () => {
        setIsLoading(true); // show loader before API call
        try {
            const response = await PaymentService.fiatView(props.route.params?.data?.id);
            if (response?.ok) {
                setError(null);
                const data: any = response?.data || [];
                setPayInView(data);
                setIsLoading(false);
            } else {
                setError(isErrorDispaly(response));
                setIsLoading(false);
            }
        } catch (e) {
            setError(isErrorDispaly(e));
        } finally {
            setIsLoading(false); // hide loader after API call
        }
    };
    const handleCloseError = useCallback(() => {
        setError(null);
    }, []);
    const handleBack = () => {
        navigation.goBack();
    }
    useHardwareBackHandler(() => {
        handleBack();
    })
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
           
                <Container style={[commonStyles.container]}>
                    <PageHeader title={"GLOBAL_CONSTANTS.FIAT_PAYIN_VIEW"} onBackPress={handleBack} />
                    {error && (<ErrorComponent message={error} onClose={handleCloseError} />)}
                     {isLoading && <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>}
                    {payInView && Object.keys(payInView).length > 0 ? (
                   (!isLoading && <ScrollView
                            horizontal={false}
                            showsVerticalScrollIndicator={false}
                            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchFiatPayinView} /> }>
                        
                            <PaymentScreen paymentData={payInView} />
                            <ViewComponent style={[commonStyles.sectionGap]} />
                        </ScrollView>)
                    ) : (
                        <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                            <NoDataComponent />
                        </ViewComponent>
                    )}
                </Container>
        </ViewComponent>
    );
};

export default FiatPayinView;

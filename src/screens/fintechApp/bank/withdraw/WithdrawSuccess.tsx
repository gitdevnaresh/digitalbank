import React from "react";
import CommonSuccess from '../../../commonScreens/successPage/commonSucces';
import ViewComponent from '../../../../newComponents/view/view';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';

const WithdrawSuccess = (props: any) => {
    const { navigation, route } = props;
    const { params } = route;
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    const handleSendAgain = () => {
        navigation.navigate('SendAmount');
    };

    const handleBackToBank = () => {
        navigation.navigate('Bank');
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <CommonSuccess
                navigation={navigation}
                successMessage={t('GLOBAL_CONSTANTS.TRANSACTION_SUCCESSFUL')}
                subtitle={`${t('GLOBAL_CONSTANTS.YOUR_TRANSACTION_OF')} ${params?.amount} ${params?.currency} ${t('GLOBAL_CONSTANTS.IS_SUCCESSFULLY_COMPLETED')}`}
                buttonText={t('GLOBAL_CONSTANTS.SEND_AGAIN')}
                buttonAction={handleSendAgain}
                secondaryButtonText={t('GLOBAL_CONSTANTS.BACK_TO_BANK')}
                secondaryButtonAction={handleBackToBank}
                amount={params?.amount}
                prifix={params?.currency}
            />
        </ViewComponent>
    );
};

export default WithdrawSuccess; 
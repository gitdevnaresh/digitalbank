import React, { useState } from 'react';
import { s } from '../../../constants/theme/scale';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import ViewComponent from '../../../newComponents/view/view';
import Container from '../../../newComponents/container/container';
import ButtonComponent from '../../../newComponents/buttons/button';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import CardLogoComponent from '../../../newComponents/arthacardlogo/cardlogo';
import { RegisterSuccessfull, } from '../../../assets/svg';
import useLogout from '../../../hooks/useLogout';

const RegistrationSuccess = React.memo((props: any) => {
    const [loading, setLoading] = useState(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logout } = useLogout();
    const handleLogout = async () => {
        setLoading(true);
        await logout(true);
        setLoading(false);
    };

    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <Container style={[commonStyles.container]}>
                <ViewComponent style={[commonStyles.titleSectionGap]} />
                <ViewComponent style={[commonStyles.mxAuto]}>
                    <CardLogoComponent />
                </ViewComponent>
                {/* <ViewComponent style={[commonStyles.titleSectionGap]} />
                <AlertsCarousel commonStyles={commonStyles} screenName='Onbaording' /> */}
                <ViewComponent style={[commonStyles.flex1]}>
                    <ViewComponent style={[commonStyles.myAuto]}>
                        <ViewComponent style={[commonStyles.mxAuto,]}>
                            <RegisterSuccessfull width={s(300)} height={s(200)} />
                        </ViewComponent>
                        <TextMultiLanguage
                            text={"GLOBAL_CONSTANTS.REGISTRATION_COMPLTED_MESSAGE"}
                            style={[
                                commonStyles.sectionTitle, commonStyles.textCenter, commonStyles.mb6
                            ]}
                        />
                        <TextMultiLanguage
                            text={"GLOBAL_CONSTANTS.THANk_YOU_FOR_SIGNINGUP_PLEASE_LOG_IN_TO_CONTINUE_YOUR_ONBOARDING_PROCESS"}
                            style={[
                                commonStyles.sectionsubtitlepara, commonStyles.textCenter
                            ]}
                        />
                    </ViewComponent>
                </ViewComponent>
                <ViewComponent style={[commonStyles.sectionGap]}>
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.LOG_IN_NOW"}
                        onPress={handleLogout}
                    />
                </ViewComponent>

            </Container>
        </ViewComponent>
        // <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
        //     <Container style={[commonStyles.container]}>
        //         <ViewComponent>
        //             <ViewComponent style={[commonStyles.mxAuto]}>
        //                 <CardLogoComponent />
        //             </ViewComponent>
        //             <ViewComponent style={[commonStyles.mxAuto]}>
        //                 <RegisterSuccessfull width={s(300)} height={s(300)} />
        //             </ViewComponent>
        //         </ViewComponent>
        //     </Container>
        // </ViewComponent>







    );
});

export default RegistrationSuccess; 

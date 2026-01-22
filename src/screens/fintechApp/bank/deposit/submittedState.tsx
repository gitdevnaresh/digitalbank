import React from "react";
import { Image, Linking } from 'react-native';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { s } from '../../../../newComponents/theme/scale';
import ViewComponent from '../../../../newComponents/view/view';
import Container from '../../../../newComponents/container/container';
import DashboardLoader from '../../../../components/loader';
import Ionicons from '@expo/vector-icons/Ionicons';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { useSelector } from 'react-redux';
import { PendingPayments } from '../../../../assets/svg';
import ScrollViewComponent from '../../../../newComponents/scrollView/scrollView';

interface SubmittedStateProps {
    onRefresh: () => void;
    loading?: boolean;
    accountStatus?: string;
    remarks?:string ;
    refresh?: boolean;
    onPullRefresh?: () => void;
}

const SubmittedState: React.FC<SubmittedStateProps> = ({ onRefresh, loading = false, accountStatus, remarks, refresh, onPullRefresh }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    const isRejected = accountStatus?.toLowerCase() === 'rejected';
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);



    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.screenBg]}>
                {loading ? (
                    <ViewComponent
                        style={[
                            commonStyles.flex1,
                            commonStyles.alignCenter,
                            commonStyles.justifyCenter,
                        ]}
                    >
                        <DashboardLoader />
                    </ViewComponent>
                ) : (
                    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
                        <ScrollViewComponent
                            style={[commonStyles.flex1]}
                            contentContainerStyle={[commonStyles.flex1]}
                            refreshing={onPullRefresh ? refresh || false : undefined}
                            onRefresh={onPullRefresh}
                        >
                            <ViewComponent
                                style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}
                            >
                                <ViewComponent style={[commonStyles.mxAuto, commonStyles.titleSectionGap]}>
                                    {isRejected ? (
                                        <Ionicons
                                            name="close-circle-outline"
                                            size={s(120)}
                                            color={NEW_COLOR.TEXT_RED}
                                        />
                                    ) : (
                                        // <Image
                                        //     source={require('../../../../assets/images/underReview.png')}
                                        //     style={[{ width: s(120), height: s(120) }, commonStyles.mxAuto]}
                                        //     resizeMode="contain"
                                        // />
                                        <PendingPayments width={s(140)} height={s(120)} />
                                    )}
                                </ViewComponent>

                                <ViewComponent style={[commonStyles.alignCenter]}>
                                    {isRejected ? (
                                        <>
                                            <TextMultiLanguage
                                                text="GLOBAL_CONSTANTS.REJECTED"
                                                style={[commonStyles.nodatascreentitle]}
                                            />
                                            <TextMultiLanguage
                                                text="GLOBAL_CONSTANTS.REJECTED_INFO"
                                                style={[
                                                    commonStyles.nodatascreenPara
                                                ]}
                                            />
                                            {/* <ParagraphComponent
                                        text={`Due To ${remarks || 'GGGGGGGGG'}`}
                                        style={[
                                            commonStyles.nodatascreenPara
                                        ]}
                                    /> */}
                                            <ParagraphComponent style={[commonStyles.mb4]}>
                                                <ParagraphComponent style={commonStyles.nodatascreenPara}>
                                                    Due to
                                                </ParagraphComponent>
                                                <ParagraphComponent style={commonStyles.nodatascreenwhite}>
                                                    {` ${remarks || ""}`}
                                                </ParagraphComponent>
                                            </ParagraphComponent>

                                            <TextMultiLanguage
                                                text="GLOBAL_CONSTANTS.PLEASE_CONTACT"
                                                style={[commonStyles.nodatascreenPara]}
                                                children={
                                                    <ParagraphComponent
                                                        text={userInfo?.metadata?.AdminEmail || ''}
                                                        style={[commonStyles.supportedemail]}
                                                        onPress={() =>
                                                            Linking.openURL(
                                                                `mailto:${userInfo?.metadata?.AdminEmail || ''}`
                                                            )
                                                        }
                                                        children={
                                                            <TextMultiLanguage
                                                                text="GLOBAL_CONSTANTS.FOR_MORE_DETAILS"
                                                                style={[
                                                                    commonStyles.nodatascreenPara
                                                                ]}
                                                            />
                                                        }
                                                    />
                                                }
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <TextMultiLanguage
                                                text={`${accountStatus?.toLowerCase() !== 'rejected' ? "GLOBAL_CONSTANTS.PENDING" : accountStatus}`}
                                                style={[
                                                    commonStyles.nodatascreentitle
                                                ]}
                                            />
                                            <TextMultiLanguage
                                                text="GLOBAL_CONSTANTS.YOUR_ACCOUNT"
                                                style={[
                                                    commonStyles.nodatascreenPara

                                                ]}
                                            />

                                        </>
                                    )}
                                </ViewComponent>
                            </ViewComponent>

                        </ScrollViewComponent>
                        <ViewComponent style={[commonStyles.sectionGap]}>
                            <ButtonComponent
                                title={isRejected ? 'GLOBAL_CONSTANTS.BANK_REAPPLY' : 'GLOBAL_CONSTANTS.REFRESH'}
                                onPress={onRefresh}
                                loading={loading}
                            />
                        </ViewComponent>
                    </ViewComponent>
                )}
            </Container>
        </ViewComponent>

    );
};

export default SubmittedState;
import React from 'react';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { View, ScrollView, Image } from 'react-native';
import { commonStyles } from '../../../newComponents/theme/commonStyles';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import Container from '../../../newComponents/container/container';

const CardTopupSuccess = React.memo((props: any) => {
    const styles = useStyleSheet(themedStyles);
    return (
        <Container style={[commonStyles.container, commonStyles.flex1]}>
            <View style={[commonStyles.mb8]} />

            <ScrollView>
                <View style={styles.successCard}>
                    <View style={[styles.textCenter, styles.auto, styles.dFlex, styles.justifyContentCenter,]}>
                        <Image
                            source={require('../../../assets/images/banklocal/success.png')} />

                    </View>
                    <ParagraphComponent style={[styles.textSuccess]} text={"GLOBAL_CONSTANTS.SUCCESS"} multiLanguageAllows={true} />

                    <ParagraphComponent
                        style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textGrey, commonStyles.textCenter]}
                        multiLanguageAllows={false}

                        text={props?.cardName}
                    />
                    {/* <ParagraphComponent
                        style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textsecondary, commonStyles.textCenter]}
                        multiLanguageAllows={true}
                        text={"GLOBAL_CONSTANTS.YOUR_WITHDRAW_OF"}
                    /> */}
                     <ParagraphComponent>
                        <ParagraphComponent
                        style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textsecondary, commonStyles.textCenter]}
                        multiLanguageAllows={true}
                        text={"GLOBAL_CONSTANTS.YOUR_WITHDRAW_OF"}
                    />
                    <ParagraphComponent
                        style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textBlack, commonStyles.textCenter]}
                        multiLanguageAllows={false}
                        text={props?.amount}

                    />
                    <ParagraphComponent
                        style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textBlack, commonStyles.textCenter]}
                        multiLanguageAllows={false}
                        text={props?.currency}
                    />
                    </ParagraphComponent>
                   
                    <ParagraphComponent
                        style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textsecondary, commonStyles.textCenter]}
                        multiLanguageAllows={true}
                        text={"GLOBAL_CONSTANTS.HAS_BEEN_SUCCESSFULLY_PROCESSED"}
                    />
                </View>
            </ScrollView>
        </Container>
    );
});

export default CardTopupSuccess;

const themedStyles = StyleService.create({
    button: {
        backgroundColor: "#0F85EE",
        borderWidth: 2,
        borderRadius: 5,
        borderColor: '#0F85EE',
        borderStyle: 'solid',
        fontSize: 18,
        fontWeight: "500",
    },
    buttonCancle: {
        borderWidth: 2,
        borderRadius: 5,
        borderColor: '#0F85EE',
        borderStyle: 'solid',
        fontSize: 18,
        fontWeight: "500",
    },
    justifyContentCenter: {
        justifyContent: "center",
    },
    dFlex: {
        flexDirection: "row",
        alignItems: 'center',
    },
    mt120: {
        marginTop: 110,
    },
    mb25: {
        marginVertical: 25,
    },
    textWhite: {
        color: "#fff",
    },
    bottomSpace: {
        marginBottom: 20,
    },
    declarationText: {
        fontSize: 22,
        fontWeight: "500",
        lineHeight: 32,
        color: "#B1B1B1",
        textAlign: "center",
    },
    auto: {
        marginVertical: "auto",
        marginHorizontal: "auto",
    },
    textSuccess: {
        fontWeight: "600",
        fontSize: 34,
        lineHeight: 41,
        textAlign: "center",
        color: "#00",
        marginTop: 30,
    },
    textCenter: {
        textAlign: "center",
    },
    successCard: {
        borderRadius: 15,
        // paddingVertical: 80,
        // paddingHorizontal: 50,
        textAlign: "center",
    },
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: "#000",
    },
    continueButton: {
        backgroundColor: "#4172F4", borderRadius: 5, height: 50, fontSize: 18, fontWeight: "500", color: "#000", marginTop: 40, marginBottom: 10,
    },
    cancelButton: {
        borderRadius: 5, height: 50, fontSize: 18, fontWeight: "500", color: "#0F85EE", marginTop: 10, marginBottom: 50,
        borderColor: "#0F85EE", backgroundColor: "#000", textColor: "#0F85EE",
    },
    my30: {
        marginVertical: 30
    },
    btnConfirmTitle: {
        fontWeight: "700",
        fontSize: 18,
        color: "#000000",
    },
});

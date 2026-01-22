import React, { useEffect, useState } from 'react';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import 'moment-timezone';
import CryptoServices from '../../../apiServices/crypto';
import { s } from '../../../constants/theme/scale';
import { NEW_COLOR } from '../../../constants/theme/variables';

import { isErrorDispaly } from '../../../utils/helpers';
import { Dimensions, View } from 'react-native';
import { tranUpdate } from './accountTransInterface';
import { useSelector } from 'react-redux';
import { getAppName } from '../../../../Environment';
import { allTransactionList } from './skeltonViews';
import ComingSoon from '../../fintechApp/comingSoon';
const { width } = Dimensions.get('window');
const isPad = width > 600;


const TransactionUpdates = React.memo((props: any) => {
    const styles = useStyleSheet(themedStyles);
    const [transactionUpdatesLoading, setTransactionUpdatesLoading] = useState(true);
    const [transactionUpdatesList, setTransactionUpdatesList] = useState<tranUpdate[]>([]);
    const userDetails = useSelector((state: any) => state.userReducer?.userDetails);
    const appName = getAppName()
    const [errormsg, setErrormsg] = useState<any>(null);
    const CustomerId = appName == 'digitalBankW2' ? userDetails?.id : 'a7b943b1-a346-49d2-aeb7-209c758e398e'
    useEffect(() => {
        if (props?.transId) {
            // transactionsUpdatesData();
        }
    }, [props?.transId]);

    const transactionsCardDesign = allTransactionList(3);
    const transactionsUpdatesData = async () => {
        setErrormsg('')
        setTransactionUpdatesLoading(true);
        try {
            const response: any = await CryptoServices.getCryptoTransactionsUpdates(CustomerId, props?.transId);
            if (response?.data && response?.ok) {
                setTransactionUpdatesList(response?.data);
                setErrormsg('')
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setTransactionUpdatesLoading(false);
        }
    };

    return (
        <View >
            <View>
                <ComingSoon pageHeader={false}  />
            </View>
        </View>
    );
});
export default TransactionUpdates;

const themedStyles = StyleService.create({
    circle: {
        backgroundColor: NEW_COLOR.ICON_BG,
        borderRadius: s(44) / 2,
        height: s(44),
        width: s(44),
    },
    line: {
        height: 40,
        width: 1,
        marginLeft: isPad ? s(20) : 20,
        marginVertical: 6
    },


});

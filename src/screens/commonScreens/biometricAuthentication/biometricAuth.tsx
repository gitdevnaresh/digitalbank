import { useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import { useDispatch, useSelector } from 'react-redux';
import { isErrorDispaly } from '../../../utils/helpers';
import { showAppToast } from '../../../newComponents/toasterMessages/ShowMessage';
import { setShouldShowNotices } from '../../../redux/actions/actions';
export default function useBiometricAuth() {
    const { t } = useLngTranslation();
    const dispatch = useDispatch();
    const showBiometricPrompt = useSelector((state: any) => state.userReducer.showBiometricPrompt);
    const authenticateUser = useCallback(async () => {
        try {
            const availableTypes = await LocalAuthentication.getEnrolledLevelAsync();
            if (availableTypes > 0) {
                const authResult = await LocalAuthentication.authenticateAsync({
                    promptMessage: t('GLOBAL_CONSTANTS.AUTHENTICATE_TO_ACCESS_APP'),
                });

                if (authResult.success) {
                    dispatch(setShouldShowNotices(true));
                    return true;
                } else {
                    return false

                }
            }
        }
        catch (error) {
            showAppToast(isErrorDispaly(error), 'error');
        }
    }, [t, showBiometricPrompt, dispatch]);

    return { authenticateUser };
}
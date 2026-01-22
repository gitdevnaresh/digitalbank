// src/hooks/useAuthActions.ts

import { useState } from 'react';
import Auth0, { useAuth0 } from 'react-native-auth0';
import { getAllEnvData } from '../../Environment';
import AuthService from '../apiServices/auth';
import { setMenuItems, setScreenPermissions } from '../redux/actions/actions';
import { useDispatch } from 'react-redux';
import { storeToken } from '../apiServices/auth0Service';
import useMemberLogin from './userInfoHook';

const { oAuthConfig } = getAllEnvData();
const auth0 = new Auth0({
    domain: oAuthConfig.issuer,
    clientId: oAuthConfig.clientId,
  });

interface AuthActions {
  isLoading: boolean;
  error: Error | null;
  login: () => Promise<void>;
  signup: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthActions = (): AuthActions => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const {authorize,clearSession} = useAuth0();
  const dispatch =useDispatch();
  const { getMemDetails } = useMemberLogin();
  const login = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const credentials = await authorize({
        scope: oAuthConfig.scope,
        audience:oAuthConfig.audience,
      });
      // console.log(JSON.stringify(credentials),'credentials');
      await storeToken(credentials?.accessToken, credentials?.refreshToken);
      setIsLoading(false);
      MenuPermission();
      getMemDetails();
      // const userInfo = await auth0.auth.userInfo({ token: credentials.accessToken });
      // console.log(credentials,'userInfo')
      // setUser(userInfo);
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const credentials = await auth0.webAuth.authorize({
        scope: oAuthConfig.scope,
        audience:oAuthConfig.audience,
        options:{screen_hint:'signup'},
      });

      await storeToken(credentials?.accessToken, credentials?.refreshToken);
      setIsLoading(false);
      MenuPermission();
      getMemDetails();
      // setUser(userInfo);
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };
  const MenuPermission = () => {
    AuthService.getMenuItems().then((res: any) => {
      if (res?.data?.length > 0) {
        dispatch(setMenuItems(res?.data));
        dispatch(setScreenPermissions([]));
      }
    }).catch((error: any) => {
      console.error("Error fetching menu items:", error);
    });
  };
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await clearSession();
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, login, signup, logout };
};
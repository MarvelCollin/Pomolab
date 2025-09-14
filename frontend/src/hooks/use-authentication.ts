import { useEffect, useCallback } from 'react';
import { UserApi } from '../apis/user-api';
import type { IUser } from '../interfaces/IUser';
import type { AppAction } from './use-app-state';

export const useAuthentication = (dispatch: React.Dispatch<AppAction>, authToken: string | null) => {
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const user = await UserApi.getCurrentUser(token);
          dispatch({ type: 'SET_AUTH', payload: { currentUser: user, authToken: token } });
        } catch (error) {
          console.error('Failed to validate existing token:', error);
          localStorage.removeItem('authToken');
        }
      }
    };
    
    checkExistingAuth();
  }, [dispatch]);

  const handleLogin = useCallback(async (user: IUser, token: string) => {
    dispatch({ type: 'SET_AUTH', payload: { currentUser: user, authToken: token } });
    localStorage.setItem('authToken', token);
    dispatch({ type: 'UPDATE_UI', payload: { showLoginModal: false } });
  }, [dispatch]);

  const handleLogout = useCallback(async () => {
    try {
      if (authToken) {
        await UserApi.logout(authToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'SET_AUTH', payload: { currentUser: null, authToken: null } });
      localStorage.removeItem('authToken');
    }
  }, [authToken, dispatch]);

  const handleShowLogin = useCallback(() => {
    dispatch({ type: 'UPDATE_UI', payload: { showLoginModal: true } });
  }, [dispatch]);

  return {
    handleLogin,
    handleLogout,
    handleShowLogin
  };
};


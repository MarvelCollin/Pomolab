import type { IUser } from '../interfaces/IUser';

export interface IAuthTriggerConfig {
  currentUser: IUser | null;
  onShowLogin: () => void;
}

export class AuthTrigger {
  private static config: IAuthTriggerConfig | null = null;

  static setConfig(config: IAuthTriggerConfig) {
    this.config = config;
  }

  static requireAuth(): boolean {
    if (!this.config) {
      console.error('AuthTrigger not configured');
      return false;
    }

    if (!this.config.currentUser) {
      this.config.onShowLogin();
      return false;
    }

    return true;
  }

  static async wrapApiCall<T>(
    operation: 'POST' | 'PUT' | 'DELETE' | 'GET',
    apiCall: () => Promise<T>
  ): Promise<T | null> {
    if (operation !== 'GET' && !this.requireAuth()) {
      return null;
    }

    try {
      return await apiCall();
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        if (this.config) {
          this.config.onShowLogin();
        }
      }
      throw error;
    }
  }

  static checkAuthForMutation(): boolean {
    return this.requireAuth();
  }
}

export const authOperations = {
  create: 'POST' as const,
  update: 'PUT' as const,
  delete: 'DELETE' as const,
  read: 'GET' as const
};

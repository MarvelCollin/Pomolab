import { useState } from 'react';
import { X, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserApi } from '../../apis/user-api';
import type { IUser } from '../../interfaces/IUser';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: IUser, token: string) => void;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  username?: string;
}

const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (email.length < 3) return 'Email must be at least 3 characters';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  if (email.length > 255) return 'Email must not exceed 255 characters';
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 255) return 'Password must not exceed 255 characters';
  return null;
};

const validateUsername = (username: string): string | null => {
  if (!username) return 'Username is required';
  if (username.length < 2) return 'Username must be at least 2 characters';
  if (username.length > 255) return 'Username must not exceed 255 characters';
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) return 'Username can only contain letters, numbers, underscores, and hyphens';
  return null;
};

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const resetForm = () => {
    setLoginData({ email: '', password: '' });
    setRegisterData({ username: '', email: '', password: '' });
    setError('');
    setValidationErrors({});
    setShowPassword(false);
  };

  const validateLoginForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    const emailError = validateEmail(loginData.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validatePassword(loginData.password);
    if (passwordError) errors.password = passwordError;
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    const usernameError = validateUsername(registerData.username);
    if (usernameError) errors.username = usernameError;
    
    const emailError = validateEmail(registerData.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validatePassword(registerData.password);
    if (passwordError) errors.password = passwordError;
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    if (!validateLoginForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await UserApi.login(loginData);
      onLogin(response.user, response.token);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    if (!validateRegisterForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await UserApi.register(registerData);
      onLogin(response.user, response.token);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      if (!window.gapi) {
        setError('Google authentication is not available. Please try again later.');
        setLoading(false);
        return;
      }

      window.gapi.load('auth2', () => {
        const authInstance = window.gapi.auth2.getAuthInstance();
        if (!authInstance) {
          window.gapi.auth2.init({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID
          }).then(() => {
            const auth = window.gapi.auth2.getAuthInstance();
            auth.signIn().then(async (googleUser: any) => {
              const accessToken = googleUser.getAuthResponse().access_token;
              const response = await UserApi.googleAuth(accessToken);
              onLogin(response.user, response.token);
              handleClose();
            });
          });
        } else {
          authInstance.signIn().then(async (googleUser: any) => {
            const accessToken = googleUser.getAuthResponse().access_token;
            const response = await UserApi.googleAuth(accessToken);
            onLogin(response.user, response.token);
            handleClose();
          });
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setValidationErrors({});
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl w-full max-w-md mx-4 p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isLoginMode ? 'Welcome Back' : 'Create Account'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    value={registerData.username}
                    onChange={(e) => {
                      setRegisterData({...registerData, username: e.target.value});
                      if (validationErrors.username) {
                        setValidationErrors({...validationErrors, username: undefined});
                      }
                    }}
                    className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/15 transition-all ${
                      validationErrors.username ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-white/40'
                    }`}
                    placeholder="Enter your username"
                  />
                </div>
                {validationErrors.username && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-300"
                  >
                    {validationErrors.username}
                  </motion.p>
                )}
              </div>
            )}

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  value={isLoginMode ? loginData.email : registerData.email}
                  onChange={(e) => {
                    if (isLoginMode) {
                      setLoginData({...loginData, email: e.target.value});
                      if (validationErrors.email) {
                        setValidationErrors({...validationErrors, email: undefined});
                      }
                    } else {
                      setRegisterData({...registerData, email: e.target.value});
                      if (validationErrors.email) {
                        setValidationErrors({...validationErrors, email: undefined});
                      }
                    }
                  }}
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/15 transition-all ${
                    validationErrors.email ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-white/40'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {validationErrors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-300"
                >
                  {validationErrors.email}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={isLoginMode ? loginData.password : registerData.password}
                  onChange={(e) => {
                    if (isLoginMode) {
                      setLoginData({...loginData, password: e.target.value});
                      if (validationErrors.password) {
                        setValidationErrors({...validationErrors, password: undefined});
                      }
                    } else {
                      setRegisterData({...registerData, password: e.target.value});
                      if (validationErrors.password) {
                        setValidationErrors({...validationErrors, password: undefined});
                      }
                    }
                  }}
                  className={`w-full pl-12 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/15 transition-all ${
                    validationErrors.password ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-white/40'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-300"
                >
                  {validationErrors.password}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white/20 hover:bg-white/30 border border-white/30 text-white font-medium rounded-lg transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              {isLoginMode ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="px-3 text-white/50 text-sm">or</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium rounded-lg transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              className="text-white/70 hover:text-white transition-colors text-sm"
            >
              {isLoginMode ? (
                <>
                  Don't have an account? <span className="font-medium text-white">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account? <span className="font-medium text-white">Sign in</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
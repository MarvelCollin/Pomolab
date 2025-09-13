import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import type { IUser } from '../../interfaces/IUser';

interface UserProfileDisplayProps {
  user: IUser;
  onLogout: () => void;
}

export default function UserProfileDisplay({ user, onLogout }: UserProfileDisplayProps) {
  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarUrl = () => {
    if (user.avatar) {
      return user.avatar;
    }
    return null;
  };

  return (
    <motion.div
      className="fixed top-4 left-4 z-30 max-w-[240px]"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <motion.div
        className="group bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl p-2.5 shadow-lg hover:bg-white/15 hover:border-white/30 transition-all duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            {getAvatarUrl() ? (
              <img
                src={getAvatarUrl()!}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/20">
                <span className="text-white font-medium text-xs">
                  {getInitials(user.username)}
                </span>
              </div>
            )}
            <motion.div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-white/20"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">
              {user.username}
            </p>
            <p className="text-white/60 text-xs truncate">
              {user.email}
            </p>
          </div>

          <motion.button
            onClick={onLogout}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-white/70 hover:text-white" />
          </motion.button>
        </div>

        <motion.div
          className="mt-2 pt-2 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          initial={{ height: 0 }}
          whileHover={{ height: 'auto' }}
        >
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Status: Online</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Active</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
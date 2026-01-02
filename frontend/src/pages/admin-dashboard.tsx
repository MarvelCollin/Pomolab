import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, CheckSquare, UsersRound, Activity, LogOut, Home, Shield } from 'lucide-react';
import { UserApi } from '../apis/user-api';
import { useLocale } from '../hooks/use-locale';
import type { IUser } from '../interfaces/IUser';

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    color: string;
    delay: number;
}

function StatCard({ icon, title, value, color, delay }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-6 shadow-2xl"
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-white/60 text-sm font-medium">{title}</p>
                    <p className="text-white text-3xl font-bold">{value}</p>
                </div>
            </div>
        </motion.div>
    );
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { t } = useLocale();
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const isAdmin = localStorage.getItem('isAdmin');

        if (!token || isAdmin !== 'true') {
            navigate('/');
            return;
        }

        setIsAuthorized(true);
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const usersData = await UserApi.getAllUsers();
            setUsers(usersData);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAdmin');
        navigate('/');
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    if (!isAuthorized) {
        return null;
    }

    const totalUsers = users.length;
    const totalTasks = users.reduce((acc, user) => acc + (user.id || 0), 0) % 100;
    const totalGroups = Math.floor(totalUsers / 3) || 1;
    const activeSessions = Math.floor(Math.random() * 10) + 5;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto"
            >
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{t('admin.dashboard')}</h1>
                            <p className="text-white/60">{t('admin.statistics')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleBackToHome}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all"
                        >
                            <Home className="w-5 h-5" />
                            {t('admin.backToHome')}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-300 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            {t('admin.logout')}
                        </motion.button>
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={<Users className="w-6 h-6 text-white" />}
                        title={t('admin.totalUsers')}
                        value={loading ? '...' : totalUsers}
                        color="bg-gradient-to-br from-blue-500 to-cyan-500"
                        delay={0.1}
                    />
                    <StatCard
                        icon={<CheckSquare className="w-6 h-6 text-white" />}
                        title={t('admin.totalTasks')}
                        value={loading ? '...' : totalTasks}
                        color="bg-gradient-to-br from-green-500 to-emerald-500"
                        delay={0.2}
                    />
                    <StatCard
                        icon={<UsersRound className="w-6 h-6 text-white" />}
                        title={t('admin.totalGroups')}
                        value={loading ? '...' : totalGroups}
                        color="bg-gradient-to-br from-purple-500 to-pink-500"
                        delay={0.3}
                    />
                    <StatCard
                        icon={<Activity className="w-6 h-6 text-white" />}
                        title={t('admin.activeSessions')}
                        value={activeSessions}
                        color="bg-gradient-to-br from-orange-500 to-amber-500"
                        delay={0.4}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white">{t('admin.users')}</h2>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-white/60">{t('common.loading')}</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-white/60">{t('admin.noData')}</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-white/5">
                                        <th className="px-6 py-4 text-left text-sm font-medium text-white/60">ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-white/60">{t('auth.username')}</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-white/60">{t('auth.email')}</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-white/60">{t('user.role')}</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-white/60">{t('user.createdAt')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                                            className="border-t border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-white/80">{user.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {user.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.username}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                                                            {user.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="text-white font-medium">{user.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-white/80">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                        ? 'bg-purple-500/30 text-purple-300'
                                                        : 'bg-blue-500/30 text-blue-300'
                                                    }`}>
                                                    {user.role || 'user'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white/60 text-sm">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="mt-8 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-6 shadow-2xl"
                >
                    <h2 className="text-xl font-bold text-white mb-4">{t('admin.recentActivity')}</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                                className="flex items-center gap-4 p-4 bg-white/5 rounded-xl"
                            >
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                <div className="flex-1">
                                    <p className="text-white/80 text-sm">
                                        {index === 0 && 'New user registered: user@example.com'}
                                        {index === 1 && 'Task completed by StudyMaster'}
                                        {index === 2 && 'New group created: Focus Session'}
                                    </p>
                                    <p className="text-white/40 text-xs mt-1">
                                        {index === 0 && '2 minutes ago'}
                                        {index === 1 && '15 minutes ago'}
                                        {index === 2 && '1 hour ago'}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

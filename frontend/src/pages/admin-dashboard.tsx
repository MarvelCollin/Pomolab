import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, CheckSquare, UsersRound, Activity, LogOut, Home, Shield, Ban } from 'lucide-react';
import { UserApi } from '../apis/user-api';
import { TaskApi } from '../apis/task-api';
import { GroupApi } from '../apis/group-api';
import { useLocale } from '../hooks/use-locale';
import type { IUser } from '../interfaces/IUser';
import type { ITask } from '../interfaces/ITask';
import type { IGroup } from '../interfaces/IGroup';

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

interface DonutChartProps {
    data: { label: string; value: number; color: string }[];
    title: string;
    delay: number;
}

function DonutChart({ data, title, delay }: DonutChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    const createArcPath = (startAngle: number, endAngle: number, radius: number = 40) => {
        const startX = 50 + radius * Math.cos((startAngle - 90) * Math.PI / 180);
        const startY = 50 + radius * Math.sin((startAngle - 90) * Math.PI / 180);
        const endX = 50 + radius * Math.cos((endAngle - 90) * Math.PI / 180);
        const endY = 50 + radius * Math.sin((endAngle - 90) * Math.PI / 180);
        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
        return `M 50 50 L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-6 shadow-2xl"
        >
            <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
            <div className="flex items-center gap-6">
                <svg viewBox="0 0 100 100" className="w-32 h-32">
                    {total === 0 ? (
                        <circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    ) : (
                        data.map((item, index) => {
                            const angle = (item.value / total) * 360;
                            const path = createArcPath(currentAngle, currentAngle + angle);
                            currentAngle += angle;
                            return (
                                <motion.path
                                    key={index}
                                    d={path}
                                    fill={item.color}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: delay + index * 0.1 }}
                                />
                            );
                        })
                    )}
                    <circle cx="50" cy="50" r="25" fill="rgba(26, 26, 46, 0.8)" />
                    <text x="50" y="55" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                        {total}
                    </text>
                </svg>
                <div className="space-y-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-white/70 text-sm">{item.label}</span>
                            <span className="text-white font-medium text-sm">({item.value})</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

interface BarChartProps {
    data: { label: string; value: number; color: string }[];
    title: string;
    delay: number;
}

function BarChart({ data, title, delay }: BarChartProps) {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-6 shadow-2xl"
        >
            <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-white/70">{item.label}</span>
                            <span className="text-white font-medium">{item.value}</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: item.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                                transition={{ duration: 0.8, delay: delay + index * 0.1 }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { t } = useLocale();
    const [users, setUsers] = useState<IUser[]>([]);
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [groups, setGroups] = useState<IGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [banningUserId, setBanningUserId] = useState<number | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const isAdmin = localStorage.getItem('isAdmin');

        if (!token || isAdmin !== 'true') {
            navigate('/');
            return;
        }

        setIsAuthorized(true);
        fetchAllData();
    }, [navigate]);

    const fetchAllData = async () => {
        try {
            const [usersData, tasksData, groupsData] = await Promise.all([
                UserApi.getAllUsers().catch(() => []),
                TaskApi.getAllTasks().catch(() => []),
                GroupApi.getAllGroups().catch(() => [])
            ]);
            setUsers(usersData);
            setTasks(tasksData);
            setGroups(groupsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
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

    const handleBanUser = async (userId: number) => {
        setBanningUserId(userId);
        try {
            await UserApi.banUser(userId);
            setUsers(users.map(u => u.id === userId ? { ...u, is_banned: true } : u));
        } catch (error) {
            console.error('Failed to ban user:', error);
        } finally {
            setBanningUserId(null);
        }
    };

    const handleUnbanUser = async (userId: number) => {
        setBanningUserId(userId);
        try {
            await UserApi.unbanUser(userId);
            setUsers(users.map(u => u.id === userId ? { ...u, is_banned: false } : u));
        } catch (error) {
            console.error('Failed to unban user:', error);
        } finally {
            setBanningUserId(null);
        }
    };

    if (!isAuthorized) {
        return null;
    }

    const totalUsers = users.length;
    const totalTasks = tasks.length;
    const totalGroups = groups.length;

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;

    const privateGroups = groups.filter(g => g.is_private).length;
    const publicGroups = groups.filter(g => !g.is_private).length;

    const taskStatusData = [
        { label: t('task.completed'), value: completedTasks, color: '#10b981' },
        { label: t('task.pending'), value: pendingTasks, color: '#f59e0b' },
        { label: t('task.inProgress'), value: inProgressTasks, color: '#3b82f6' }
    ];

    const groupTypeData = [
        { label: t('admin.private'), value: privateGroups, color: '#8b5cf6' },
        { label: t('admin.public'), value: publicGroups, color: '#06b6d4' }
    ];

    const userRoleData = [
        { label: t('admin.roleAdmin'), value: users.filter(u => u.role === 'admin').length, color: '#ec4899' },
        { label: t('admin.roleUser'), value: users.filter(u => u.role !== 'admin').length, color: '#6366f1' }
    ];

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
                        value={loading ? '...' : users.filter(u => !u.is_banned).length}
                        color="bg-gradient-to-br from-orange-500 to-amber-500"
                        delay={0.4}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <DonutChart
                        data={taskStatusData}
                        title={t('admin.tasksByStatus')}
                        delay={0.5}
                    />
                    <DonutChart
                        data={groupTypeData}
                        title={t('admin.groupsByType')}
                        delay={0.6}
                    />
                    <BarChart
                        data={userRoleData}
                        title={t('admin.usersByRole')}
                        delay={0.7}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
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
                                        <th className="px-6 py-4 text-left text-sm font-medium text-white/60">{t('admin.status')}</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-white/60">{t('user.createdAt')}</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-white/60">{t('admin.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: 0.9 + index * 0.05 }}
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
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_banned
                                                    ? 'bg-red-500/30 text-red-300'
                                                    : 'bg-green-500/30 text-green-300'
                                                    }`}>
                                                    {user.is_banned ? t('admin.bannedStatus') : t('admin.active')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white/60 text-sm">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.role !== 'admin' && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => user.is_banned ? handleUnbanUser(user.id) : handleBanUser(user.id)}
                                                        disabled={banningUserId === user.id}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${user.is_banned
                                                                ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30'
                                                                : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                                                            }`}
                                                    >
                                                        {banningUserId === user.id ? (
                                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Ban className="w-4 h-4" />
                                                        )}
                                                        {user.is_banned ? t('admin.unban') : t('admin.ban')}
                                                    </motion.button>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

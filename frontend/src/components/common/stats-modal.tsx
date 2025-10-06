import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Clock, 
  MessageCircle,
  Trophy,
  TrendingUp,
  Calendar,
  Target,
  Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import type { IStatsModalProps } from '../../interfaces/IStatsModal';
import { StatsApi, type IUserStats } from '../../apis/stats-api';
import { useToast } from './toast';

function StatsModal({ isOpen, onClose, currentUser }: IStatsModalProps) {
  const [stats, setStats] = useState<IUserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError, ToastContainer } = useToast();

  useEffect(() => {
    const loadStats = async () => {
      if (!currentUser || !isOpen) return;

      setLoading(true);
      setError(null);

      try {
        const statsData = await StatsApi.getUserStats(currentUser.id);
        setStats(statsData);
      } catch (err) {
        const errorMessage = 'Failed to load statistics';
        setError(errorMessage);
        showError(errorMessage, 'Please try again later');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [currentUser, isOpen, showError]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const taskStatusData = stats?.tasks.byStatus.map((item, index) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    color: COLORS[index % COLORS.length]
  })) || [];

  const messageActivityData = stats?.messages.last7Days.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    messages: item.count
  })) || [];

  const overviewData = [
    {
      name: 'Tasks',
      completed: stats?.tasks.completed || 0,
      pending: stats?.tasks.pending || 0,
      inProgress: stats?.tasks.inProgress || 0
    }
  ];

  const accountAge = stats?.user.created_at 
    ? Math.floor((new Date().getTime() - new Date(stats.user.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        
        <motion.div
          className="relative w-full max-w-6xl max-h-[85vh] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-white" />
              <h2 className="text-white font-semibold text-lg">Your Statistics</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-white/60 animate-spin mb-4" />
                <p className="text-white/60 text-sm">Loading your statistics...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Target className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white/60 text-xs">Total Tasks</p>
                        <p className="text-white font-bold text-2xl">{stats.tasks.total}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 text-xs">
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded">
                        {stats.tasks.completed} Done
                      </span>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">
                        {stats.tasks.inProgress} Active
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Users className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white/60 text-xs">Friends</p>
                        <p className="text-white font-bold text-2xl">{stats.friends.total}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 text-xs">
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded">
                        {stats.friends.accepted} Active
                      </span>
                      {stats.friends.pending > 0 && (
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded">
                          {stats.friends.pending} Pending
                        </span>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Trophy className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white/60 text-xs">Groups</p>
                        <p className="text-white font-bold text-2xl">{stats.groups.total}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 text-xs">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                        {stats.groups.created} Created
                      </span>
                      <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded">
                        {stats.groups.joined} Joined
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-pink-500/20 rounded-lg">
                        <MessageCircle className="w-5 h-5 text-pink-400" />
                      </div>
                      <div>
                        <p className="text-white/60 text-xs">Messages</p>
                        <p className="text-white font-bold text-2xl">{stats.messages.total}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 text-xs">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                        {stats.messages.sent} Sent
                      </span>
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded">
                        {stats.messages.received} Received
                      </span>
                    </div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-white font-semibold">Tasks by Status</h3>
                    </div>
                    {taskStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={taskStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {taskStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              color: 'white'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-60 text-white/40">
                        <p className="text-sm">No task data available</p>
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/20"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      <h3 className="text-white font-semibold">Task Overview</h3>
                    </div>
                    {stats.tasks.total > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={overviewData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
                          <YAxis stroke="rgba(255,255,255,0.6)" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              color: 'white'
                            }}
                          />
                          <Legend wrapperStyle={{ color: 'white' }} />
                          <Bar dataKey="completed" fill="#10b981" name="Completed" />
                          <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" />
                          <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-60 text-white/40">
                        <p className="text-sm">No task data available</p>
                      </div>
                    )}
                  </motion.div>
                </div>

                <motion.div
                  className="bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-white font-semibold">Message Activity (Last 7 Days)</h3>
                  </div>
                  {messageActivityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={messageActivityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
                        <YAxis stroke="rgba(255,255,255,0.6)" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        />
                        <Legend wrapperStyle={{ color: 'white' }} />
                        <Line 
                          type="monotone" 
                          dataKey="messages" 
                          stroke="#06b6d4" 
                          strokeWidth={2}
                          dot={{ fill: '#06b6d4', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Messages"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-60 text-white/40">
                      <p className="text-sm">No message data available</p>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  className="bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-white font-semibold">Account Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-white/60 text-xs mb-1">Username</p>
                      <p className="text-white font-medium">{stats.user.username}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-white/60 text-xs mb-1">Email</p>
                      <p className="text-white font-medium">{stats.user.email}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-white/60 text-xs mb-1">Account Age</p>
                      <p className="text-white font-medium">{accountAge} days</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="grid grid-cols-2 md:grid-cols-4 gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl rounded-lg p-4 border border-blue-500/30">
                    <Clock className="w-8 h-8 text-blue-400 mb-2" />
                    <p className="text-white/60 text-xs">Pending Tasks</p>
                    <p className="text-white font-bold text-xl">{stats.tasks.pending}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl rounded-lg p-4 border border-green-500/30">
                    <CheckCircle2 className="w-8 h-8 text-green-400 mb-2" />
                    <p className="text-white/60 text-xs">Completed</p>
                    <p className="text-white font-bold text-xl">{stats.tasks.completed}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl rounded-lg p-4 border border-purple-500/30">
                    <Users className="w-8 h-8 text-purple-400 mb-2" />
                    <p className="text-white/60 text-xs">Total Friends</p>
                    <p className="text-white font-bold text-xl">{stats.friends.total}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-xl rounded-lg p-4 border border-pink-500/30">
                    <MessageCircle className="w-8 h-8 text-pink-400 mb-2" />
                    <p className="text-white/60 text-xs">Messages</p>
                    <p className="text-white font-bold text-xl">{stats.messages.total}</p>
                  </div>
                </motion.div>
              </div>
            ) : null}
          </div>
        </motion.div>
        <ToastContainer />
      </motion.div>
    </AnimatePresence>
  );
}

export default memo(StatsModal);

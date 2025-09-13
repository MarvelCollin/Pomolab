import type { ITask } from '../interfaces/ITask';
import type { IMessage } from '../interfaces/IMessage';
import type { IFriend } from '../interfaces/IFriend';
import type { IGroup } from '../interfaces/IGroup';
import type { IGroupMember } from '../interfaces/IGroupMember';

export const dummyTasks: ITask[] = [
  {
    id: 1,
    title: 'Complete Project Proposal',
    description: 'Write and review the Q4 project proposal for the new client',
    owner_id: 1,
    assigned_to_id: undefined,
    group_id: undefined,
    status: 'in_progress',
    created_at: '2025-09-10T08:00:00Z',
    updated_at: '2025-09-10T10:30:00Z'
  },
  {
    id: 2,
    title: 'Review Code Changes',
    description: 'Review pull requests from the development team',
    owner_id: 1,
    assigned_to_id: undefined,
    group_id: undefined,
    status: 'pending',
    created_at: '2025-09-10T09:15:00Z',
    updated_at: '2025-09-10T09:15:00Z'
  },
  {
    id: 3,
    title: 'Team Meeting Preparation',
    description: 'Prepare agenda and materials for tomorrow\'s team standup',
    owner_id: 1,
    assigned_to_id: undefined,
    group_id: undefined,
    status: 'completed',
    created_at: '2025-09-09T16:00:00Z',
    updated_at: '2025-09-10T11:00:00Z'
  },
  {
    id: 4,
    title: 'Learn React Hooks',
    description: 'Study advanced React hooks patterns and best practices',
    owner_id: 1,
    assigned_to_id: undefined,
    group_id: undefined,
    status: 'pending',
    created_at: '2025-09-08T14:00:00Z',
    updated_at: '2025-09-10T09:00:00Z'
  },
  {
    id: 5,
    title: 'Database Schema Review',
    description: 'Review and optimize the current database schema for performance',
    owner_id: 1,
    assigned_to_id: 2,
    group_id: undefined,
    status: 'pending',
    created_at: '2025-09-10T07:30:00Z',
    updated_at: '2025-09-10T07:30:00Z'
  }
];

export const dummyMessages: IMessage[] = [
  {
    id: 1,
    from_user_id: 2,
    to_user_id: 1,
    message: 'Hey! How\'s the project proposal coming along?',
    task_id: 1,
    group_id: undefined,
    created_at: '2025-09-10T10:45:00Z',
    updated_at: '2025-09-10T10:45:00Z'
  },
  {
    id: 2,
    from_user_id: 1,
    to_user_id: 2,
    message: 'Making good progress! Should be done by end of day.',
    task_id: 1,
    group_id: undefined,
    created_at: '2025-09-10T10:50:00Z',
    updated_at: '2025-09-10T10:50:00Z'
  },
  {
    id: 3,
    from_user_id: 3,
    to_user_id: 1,
    message: 'Can you review my pull request when you have time?',
    task_id: undefined,
    group_id: undefined,
    created_at: '2025-09-10T11:15:00Z',
    updated_at: '2025-09-10T11:15:00Z'
  }
];

export const dummyFriends: IFriend[] = [
  {
    id: 1,
    user_id: 1,
    friend_id: 2,
    status: 'accepted',
    created_at: '2025-09-08T12:00:00Z',
    updated_at: '2025-09-08T12:00:00Z'
  },
  {
    id: 2,
    user_id: 1,
    friend_id: 3,
    status: 'accepted',
    created_at: '2025-09-09T09:30:00Z',
    updated_at: '2025-09-09T09:30:00Z'
  },
  {
    id: 3,
    user_id: 1,
    friend_id: 4,
    status: 'pending',
    created_at: '2025-09-10T08:00:00Z',
    updated_at: '2025-09-10T08:00:00Z'
  }
];

export const dummyGroups: IGroup[] = [
  {
    id: 1,
    name: 'Pomodoro Study Group',
    description: 'A group for focused study sessions using the Pomodoro technique',
    creator_id: 1,
    status: 'active',
    is_private: false,
    created_at: '2025-09-08T10:00:00Z',
    updated_at: '2025-09-08T10:00:00Z'
  },
  {
    id: 2,
    name: 'React Development Team',
    description: 'Frontend development team working on React projects',
    creator_id: 2,
    status: 'active',
    is_private: true,
    created_at: '2025-09-09T14:30:00Z',
    updated_at: '2025-09-09T14:30:00Z'
  }
];

export const dummyGroupMembers: IGroupMember[] = [
  {
    id: 1,
    user_id: 1,
    group_id: 1,
    role: 'creator',
    joined_at: '2025-09-08T10:00:00Z',
    created_at: '2025-09-08T10:00:00Z',
    updated_at: '2025-09-08T10:00:00Z'
  },
  {
    id: 2,
    user_id: 2,
    group_id: 1,
    role: 'member',
    joined_at: '2025-09-08T15:30:00Z',
    created_at: '2025-09-08T15:30:00Z',
    updated_at: '2025-09-08T15:30:00Z'
  },
  {
    id: 3,
    user_id: 2,
    group_id: 2,
    role: 'creator',
    joined_at: '2025-09-09T14:30:00Z',
    created_at: '2025-09-09T14:30:00Z',
    updated_at: '2025-09-09T14:30:00Z'
  },
  {
    id: 4,
    user_id: 3,
    group_id: 2,
    role: 'member',
    joined_at: '2025-09-10T09:15:00Z',
    created_at: '2025-09-10T09:15:00Z',
    updated_at: '2025-09-10T09:15:00Z'
  }
];

export const dummyUsers = [
  { id: 1, name: 'You', email: 'user@pomolab.com', avatar: '👤' },
  { id: 2, name: 'Sarah Chen', email: 'sarah@company.com', avatar: '👩‍💼' },
  { id: 3, name: 'Mike Johnson', email: 'mike@company.com', avatar: '👨‍💻' },
  { id: 4, name: 'Emma Wilson', email: 'emma@company.com', avatar: '👩‍🎨' }
];

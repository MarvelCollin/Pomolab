import type { IGroupMember } from '../interfaces/IGroupMember';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export class GroupMemberApi {
  static async getAllGroupMembers(): Promise<IGroupMember[]> {
    const response = await fetch(`${API_BASE_URL}/api/group-members`);
    if (!response.ok) {
      throw new Error('Failed to fetch group members');
    }
    return response.json();
  }

  static async getGroupMemberById(id: number): Promise<IGroupMember> {
    const response = await fetch(`${API_BASE_URL}/api/group-members/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch group member');
    }
    return response.json();
  }

  static async addGroupMember(memberData: { user_id: number; group_id: number; role?: string }): Promise<IGroupMember> {
    const response = await fetch(`${API_BASE_URL}/api/group-members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });
    if (!response.ok) {
      throw new Error('Failed to add group member');
    }
    return response.json();
  }

  static async updateGroupMember(id: number, memberData: Partial<IGroupMember>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/group-members/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });
    if (!response.ok) {
      throw new Error('Failed to update group member');
    }
  }

  static async removeGroupMember(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/group-members/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to remove group member');
    }
  }

  static async getGroupMembersByGroupId(groupId: number): Promise<IGroupMember[]> {
    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/members`);
    if (!response.ok) {
      throw new Error('Failed to fetch group members');
    }
    return response.json();
  }

  static async getGroupMembersByUserId(userId: number): Promise<IGroupMember[]> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/group-memberships`);
    if (!response.ok) {
      throw new Error('Failed to fetch user group memberships');
    }
    return response.json();
  }

  static async updateMemberRole(id: number, role: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/group-members/${id}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) {
      throw new Error('Failed to update member role');
    }
  }
}
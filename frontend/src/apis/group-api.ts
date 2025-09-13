import type { IGroup } from "../interfaces/IGroup";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export class GroupApi {
  static async getAllGroups(): Promise<IGroup[]> {
    const response = await fetch(`${API_BASE_URL}/api/groups`);
    if (!response.ok) {
      throw new Error("Failed to fetch groups");
    }
    return response.json();
  }

  static async getPublicGroups(): Promise<IGroup[]> {
    const response = await fetch(`${API_BASE_URL}/api/groups-public`);
    if (!response.ok) {
      throw new Error("Failed to fetch public groups");
    }
    return response.json();
  }

  static async searchGroups(searchTerm: string): Promise<IGroup[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new Error("Search term cannot be empty");
    }

    const trimmedSearchTerm = searchTerm.trim();
    const response = await fetch(
      `${API_BASE_URL}/api/groups-search?q=${encodeURIComponent(
        trimmedSearchTerm
      )}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.error || errorData?.message || "Failed to search groups";
      throw new Error(errorMessage);
    }

    return response.json();
  }

  static async getGroupById(id: number): Promise<IGroup> {
    const response = await fetch(`${API_BASE_URL}/api/groups/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch group");
    }
    return response.json();
  }

  static async createGroup(groupData: {
    name: string;
    description?: string;
    creator_id: number;
    is_private?: boolean;
  }): Promise<IGroup> {
    const response = await fetch(`${API_BASE_URL}/api/groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groupData),
    });
    if (!response.ok) {
      throw new Error("Failed to create group");
    }
    return response.json();
  }

  static async updateGroup(
    id: number,
    groupData: Partial<IGroup>
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groupData),
    });
    if (!response.ok) {
      throw new Error("Failed to update group");
    }
  }

  static async deleteGroup(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete group");
    }
  }

  static async getUserGroups(userId: number): Promise<IGroup[]> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/groups`);
    if (!response.ok) {
      throw new Error("Failed to fetch user groups");
    }
    return response.json();
  }

  static async getGroupMembers(groupId: number): Promise<IGroup> {
    const response = await fetch(
      `${API_BASE_URL}/api/groups/${groupId}/members`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch group members");
    }
    return response.json();
  }

  static async joinGroup(groupId: number, userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!response.ok) {
      throw new Error("Failed to join group");
    }
  }

  static async leaveGroup(groupId: number, userId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/groups/${groupId}/leave`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to leave group");
    }
  }
}

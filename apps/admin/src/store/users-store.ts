import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  status: 'online' | 'offline' | 'away';
  role: 'Member' | 'Admin' | 'Guest';
  joinedDate: string;
  teamIds: string[];
}

export const statusUserColors = {
  online: '#00cc66',
  offline: '#969696',
  away: '#ffcc00',
};

interface UsersState {
  // Data
  users: User[];
  usersById: Record<string, User>;
  usersByEmail: Record<string, User>;

  // Getters
  getAllUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  getUserByEmail: (email: string) => User | undefined;
  getUsersByRole: (role: User['role']) => User[];
  getUsersByTeam: (teamId: string) => User[];

  // Actions
  addUser: (user: User) => void;
  addUsers: (users: User[]) => void;
  updateUser: (id: string, updatedUser: Partial<User>) => void;
  deleteUser: (id: string) => void;
  clearUsers: () => void;

  // Status management
  updateUserStatus: (userId: string, newStatus: User['status']) => void;
  updateUserRole: (userId: string, newRole: User['role']) => void;

  // Team management
  addUserToTeam: (userId: string, teamId: string) => void;
  removeUserFromTeam: (userId: string, teamId: string) => void;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  // Initial state
  users: [],
  usersById: {},
  usersByEmail: {},

  // Getters
  getAllUsers: () => get().users,

  getUserById: (id: string) => get().usersById[id],

  getUserByEmail: (email: string) => get().usersByEmail[email],

  getUsersByRole: (role: User['role']) =>
    get().users.filter((user) => user.role === role),

  getUsersByTeam: (teamId: string) =>
    get().users.filter((user) => user.teamIds.includes(teamId)),

  // Actions
  addUser: (user: User) => {
    set((state) => {
      const newUsers = [...state.users, user];
      const newUsersById = { ...state.usersById, [user.id]: user };
      const newUsersByEmail = { ...state.usersByEmail, [user.email]: user };

      return {
        users: newUsers,
        usersById: newUsersById,
        usersByEmail: newUsersByEmail,
      };
    });
  },

  addUsers: (newUsers: User[]) => {
    set((state) => {
      // Merge new users with existing ones, avoiding duplicates by ID
      const existingIds = new Set(state.users.map((user) => user.id));
      const uniqueNewUsers = newUsers.filter(
        (user) => !existingIds.has(user.id),
      );
      const allUsers = [...state.users, ...uniqueNewUsers];

      // Build new lookup objects
      const newUsersById = { ...state.usersById };
      const newUsersByEmail = { ...state.usersByEmail };

      for (const user of uniqueNewUsers) {
        newUsersById[user.id] = user;
        newUsersByEmail[user.email] = user;
      }

      return {
        users: allUsers,
        usersById: newUsersById,
        usersByEmail: newUsersByEmail,
      };
    });
  },

  updateUser: (id: string, updatedUser: Partial<User>) => {
    set((state) => {
      const newUsers: User[] = state.users.map((user) =>
        user.id === id ? { ...user, ...updatedUser } : user,
      );

      // Update lookup objects
      const foundUser = newUsers.find((user) => user.id === id);
      const newUsersById = { ...state.usersById };
      const newUsersByEmail = { ...state.usersByEmail };

      if (foundUser) {
        newUsersById[id] = foundUser;
        newUsersByEmail[foundUser.email] = foundUser;
      }

      return {
        users: newUsers,
        usersById: newUsersById,
        usersByEmail: newUsersByEmail,
      };
    });
  },

  deleteUser: (id: string) => {
    set((state) => {
      const userToDelete = state.users.find((user) => user.id === id);
      const newUsers = state.users.filter((user) => user.id !== id);

      // Remove from lookup objects
      const newUsersById = { ...state.usersById };
      const newUsersByEmail = { ...state.usersByEmail };

      if (userToDelete) {
        delete newUsersById[id];
        delete newUsersByEmail[userToDelete.email];
      }

      return {
        users: newUsers,
        usersById: newUsersById,
        usersByEmail: newUsersByEmail,
      };
    });
  },

  clearUsers: () => {
    set({
      users: [],
      usersById: {},
      usersByEmail: {},
    });
  },

  // Status management
  updateUserStatus: (userId: string, newStatus: User['status']) => {
    get().updateUser(userId, { status: newStatus });
  },

  updateUserRole: (userId: string, newRole: User['role']) => {
    get().updateUser(userId, { role: newRole });
  },

  // Team management
  addUserToTeam: (userId: string, teamId: string) => {
    const user = get().getUserById(userId);
    if (user && !user.teamIds.includes(teamId)) {
      get().updateUser(userId, {
        teamIds: [...user.teamIds, teamId],
      });
    }
  },

  removeUserFromTeam: (userId: string, teamId: string) => {
    const user = get().getUserById(userId);
    if (user) {
      get().updateUser(userId, {
        teamIds: user.teamIds.filter((id) => id !== teamId),
      });
    }
  },
}));

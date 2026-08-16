export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserApi {
  id: string;
  username: string;
  display_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export const MapUser = (u: UserApi): User => ({
  id: u.id,
  username: u.username,
  displayName: u.display_name,
  email: u.email,
  createdAt: u.created_at,
  updatedAt: u.updated_at,
});

export interface UserProfileApi {
  id: string;
  username: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  login_method: LoginMethod;
  skills: string;
  timezone?: string;
  projects: number;
  tasks: number;
  completed_tasks: number;
  user_since: string;
  last_login_time: string;
}

export type LoginMethod = "password" | "google" | "both";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  loginMethod: LoginMethod;
  skills: string;
  timezone: string;
  projects: number;
  tasks: number;
  completedTasks: number;
  userSince: string;
  lastLoginTime: string;
}

export const MapUserProfile = (profile: UserProfileApi): UserProfile => ({
  id: profile.id,
  username: profile.username,
  email: profile.email,
  displayName: profile.display_name,
  avatarUrl: profile.avatar_url,
  loginMethod: profile.login_method,
  skills: profile.skills,
  timezone: profile.timezone || "UTC+05:30",
  projects: profile.projects,
  tasks: profile.tasks,
  completedTasks: profile.completed_tasks,
  userSince: profile.user_since,
  lastLoginTime: profile.last_login_time,
});

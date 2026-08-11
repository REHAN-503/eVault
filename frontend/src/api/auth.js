import { USE_MOCK } from './client';
import * as liveAuth from './live/auth';
import * as mockAuth from './mock/auth';

const auth = USE_MOCK ? mockAuth : liveAuth;

export const login = auth.login;
export const register = auth.register;
export const getCurrentUser = auth.getCurrentUser;
export const logout = auth.logout;
export const listUsers = auth.listUsers;
export const updateUserStatus = auth.updateUserStatus;

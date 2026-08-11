import { USE_MOCK } from './client';
import * as liveSystem from './live/system';
import * as mockSystem from './mock/system';

const system = USE_MOCK ? mockSystem : liveSystem;

export const getSystemStatus = system.getSystemStatus;
export const getSystemInfo = system.getSystemInfo;
export const listUsers = system.listUsers;

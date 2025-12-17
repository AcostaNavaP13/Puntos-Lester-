
import { ClientLevelName, LevelThreshold, UserRole } from './types';

export const INITIAL_LEVELS: LevelThreshold[] = [
  { name: ClientLevelName.PLATINO, minPoints: 10000 },
  { name: ClientLevelName.ORO, minPoints: 5000 },
  { name: ClientLevelName.PLATA, minPoints: 2500 },
  { name: ClientLevelName.BRONCE, minPoints: 1000 },
  { name: ClientLevelName.NUEVO, minPoints: 0 },
];

export const ADMIN_ACCESS_CODE = 'Capa2025L';

export const STORAGE_KEYS = {
  USERS: 'lester_users',
  AGENTS: 'lester_agents',
  CUSTOMERS: 'lester_customers',
  LEVELS: 'lester_levels',
  REWARDS: 'lester_rewards',
  ORDERS: 'lester_orders',
  CONFIG: 'lester_config',
  AUTH: 'lester_auth',
  THEME: 'lester_theme'
};

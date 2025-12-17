
import { STORAGE_KEYS, INITIAL_LEVELS } from '../constants';
import { Customer, Reward, Order, AppConfig, LevelThreshold, ClientLevelName, Agent } from '../types';

export const storageService = {
  get<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  },

  getAgents(): Agent[] {
    return this.get(STORAGE_KEYS.AGENTS, [] as Agent[]);
  },

  saveAgents(agents: Agent[]): void {
    this.set(STORAGE_KEYS.AGENTS, agents);
  },

  getCustomers(): Customer[] {
    return this.get(STORAGE_KEYS.CUSTOMERS, [] as Customer[]);
  },

  saveCustomers(customers: Customer[]): void {
    this.set(STORAGE_KEYS.CUSTOMERS, customers);
  },

  getLevels(): LevelThreshold[] {
    return this.get(STORAGE_KEYS.LEVELS, INITIAL_LEVELS);
  },

  saveLevels(levels: LevelThreshold[]): void {
    this.set(STORAGE_KEYS.LEVELS, levels);
  },

  getRewards(): Reward[] {
    return this.get(STORAGE_KEYS.REWARDS, [] as Reward[]);
  },

  saveRewards(rewards: Reward[]): void {
    this.set(STORAGE_KEYS.REWARDS, rewards);
  },

  getOrders(): Order[] {
    return this.get(STORAGE_KEYS.ORDERS, [] as Order[]);
  },

  saveOrders(orders: Order[]): void {
    this.set(STORAGE_KEYS.ORDERS, orders);
  },

  getConfig(): AppConfig {
    return this.get(STORAGE_KEYS.CONFIG, { pointRatio: 100 } as AppConfig);
  },

  saveConfig(config: AppConfig): void {
    this.set(STORAGE_KEYS.CONFIG, config);
  },

  calculateLevel(points: number, levels: LevelThreshold[]): ClientLevelName {
    const sorted = [...levels].sort((a, b) => b.minPoints - a.minPoints);
    for (const lvl of sorted) {
      if (points >= lvl.minPoints) return lvl.name;
    }
    return ClientLevelName.NUEVO;
  }
};

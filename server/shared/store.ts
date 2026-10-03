import crypto from 'crypto';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: 'ADMIN' | 'USER';
  plan: 'FREE' | 'PRO';
  isActive: boolean;
  verified: boolean;
  createdAt: number;
  lastLoginAt: number;
}

export interface SavedStrategyRecord {
  id: string;
  userId: string;
  name: string;
  exchange: string;
  underlying: string;
  expiry: string;
  ratioLong: number;
  ratioShort: number;
  gap: number;
  cnt: number;
  stk: string | number;
  referenceMode: string;
  optionType: string;
  minStrike: number | 'ALL';
  maxStrike: number | 'ALL';
  createdAt: number;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_RATIO_SPREAD_SALT_2026').digest('hex');
}

export const usersStore = new Map<string, UserRecord>();
export const sessionsStore = new Map<string, string>(); // token -> userId
export const savedStrategiesStore: SavedStrategyRecord[] = [];

// Seed Default Accounts
const defaultUsers: UserRecord[] = [
  {
    id: 'user_admin_001',
    email: 'admin@ratiospread.com',
    passwordHash: hashPassword('Admin123!'),
    displayName: 'System Admin',
    role: 'ADMIN',
    plan: 'PRO',
    isActive: true,
    verified: true,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    lastLoginAt: Date.now()
  },
  {
    id: 'user_pro_002',
    email: 'pro@ratiospread.com',
    passwordHash: hashPassword('Pro123!'),
    displayName: 'Pro Trader',
    role: 'USER',
    plan: 'PRO',
    isActive: true,
    verified: true,
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    lastLoginAt: Date.now()
  },
  {
    id: 'user_free_003',
    email: 'demo@ratiospread.com',
    passwordHash: hashPassword('User123!'),
    displayName: 'Free User',
    role: 'USER',
    plan: 'FREE',
    isActive: true,
    verified: true,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    lastLoginAt: Date.now()
  }
];

defaultUsers.forEach(u => usersStore.set(u.id, u));

// Pre-seed saved strategy for demo
savedStrategiesStore.push({
  id: 'strat_01',
  userId: 'user_pro_002',
  name: 'RELIANCE 1:3 Bull Spread',
  exchange: 'NSE',
  underlying: 'RELIANCE',
  expiry: '29-Oct-2026',
  ratioLong: 1,
  ratioShort: 3,
  gap: 50,
  cnt: 5,
  stk: 'AUTO',
  referenceMode: 'ATM',
  optionType: 'CE',
  minStrike: 'ALL',
  maxStrike: 'ALL',
  createdAt: Date.now()
});
export default usersStore;

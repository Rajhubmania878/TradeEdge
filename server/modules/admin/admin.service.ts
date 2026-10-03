import { usersStore, UserRecord } from '../../shared/store';

export class AdminService {
  public getAllUsers(): Omit<UserRecord, 'passwordHash'>[] {
    return Array.from(usersStore.values()).map(({ passwordHash, ...safeUser }) => safeUser);
  }

  public updateUserStatus(id: string, isActive: boolean): UserRecord | null {
    const user = usersStore.get(id);
    if (!user) return null;
    user.isActive = Boolean(isActive);
    return user;
  }

  public updateUserRole(id: string, role: 'ADMIN' | 'USER'): UserRecord | null {
    const user = usersStore.get(id);
    if (!user) return null;
    if (role === 'ADMIN' || role === 'USER') {
      user.role = role;
    }
    return user;
  }

  public updateUserPlan(id: string, plan: 'FREE' | 'PRO'): UserRecord | null {
    const user = usersStore.get(id);
    if (!user) return null;
    if (plan === 'FREE' || plan === 'PRO') {
      user.plan = plan;
    }
    return user;
  }
}

export const adminService = new AdminService();
export default adminService;

import { usersStore, sessionsStore, UserRecord } from '../../shared/store';

export class AuthRepository {
  public findUserById(id: string): UserRecord | null {
    return usersStore.get(id) || null;
  }

  public findUserByEmail(email: string): UserRecord | null {
    const cleanEmail = email.toLowerCase().trim();
    for (const user of usersStore.values()) {
      if (user.email.toLowerCase() === cleanEmail) {
        return user;
      }
    }
    return null;
  }

  public createUser(user: UserRecord): void {
    usersStore.set(user.id, user);
  }

  public createSession(token: string, userId: string): void {
    sessionsStore.set(token, userId);
  }

  public deleteSession(token: string): void {
    sessionsStore.delete(token);
  }

  public getUserIdBySession(token: string): string | null {
    return sessionsStore.get(token) || null;
  }

  public getAllUsers(): UserRecord[] {
    return Array.from(usersStore.values());
  }

  public updateUser(user: UserRecord): void {
    usersStore.set(user.id, user);
  }
}

export const authRepository = new AuthRepository();
export default authRepository;

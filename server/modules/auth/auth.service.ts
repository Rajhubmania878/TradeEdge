import { UserRecord, hashPassword } from '../../shared/store';
import { authRepository } from './auth.repository';

export class AuthService {
  public async me(token: string): Promise<UserRecord | null> {
    const userId = authRepository.getUserIdBySession(token);
    if (!userId) return null;
    return authRepository.findUserById(userId);
  }

  public async login(email: string, password: string): Promise<{ user: UserRecord; token: string } | null> {
    const cleanEmail = email.toLowerCase().trim();
    const user = authRepository.findUserByEmail(cleanEmail);
    if (!user) return null;

    const hashedPassword = hashPassword(password);
    if (user.passwordHash !== hashedPassword) return null;

    const token = `sess_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    authRepository.createSession(token, user.id);

    // Update lastLoginAt
    user.lastLoginAt = Date.now();
    authRepository.updateUser(user);

    return { user, token };
  }

  public async signup(email: string, password: string, displayName: string): Promise<UserRecord> {
    const cleanEmail = email.toLowerCase().trim();
    const existing = authRepository.findUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('Email is already registered.');
    }

    const hashedPassword = hashPassword(password);
    const newUser: UserRecord = {
      id: `user_${Date.now()}`,
      email: cleanEmail,
      passwordHash: hashedPassword,
      displayName: displayName.trim(),
      role: 'USER',
      plan: 'FREE',
      isActive: true,
      verified: true,
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    };

    authRepository.createUser(newUser);
    return newUser;
  }

  public async logout(token: string): Promise<void> {
    authRepository.deleteSession(token);
  }
}

export const authService = new AuthService();
export default authService;

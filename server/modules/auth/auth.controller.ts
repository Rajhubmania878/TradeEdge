import { Request, Response } from 'express';
import { authService } from './auth.service';
import { AuthRequest } from '../../shared/middleware/requireAuth';

export class AuthController {
  public async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated.' });
      }
      // Return user profile safely without password hash
      const { passwordHash, ...safeUser } = req.user;
      return res.json({ success: true, user: safeUser });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
    }
  }

  public async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const result = await authService.login(email, password);
      if (!result) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const { passwordHash, ...safeUser } = result.user;
      return res.json({
        success: true,
        user: safeUser,
        token: result.token
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
    }
  }

  public async signup(req: Request, res: Response) {
    try {
      const { email, password, displayName } = req.body;
      if (!email || !password || !displayName) {
        return res.status(400).json({ success: false, message: 'Email, password, and display name are required.' });
      }

      await authService.signup(email, password, displayName);
      return res.status(201).json({
        success: true,
        message: 'Account created successfully. You can now log in.'
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message || 'Signup failed.' });
    }
  }

  public async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
      }
      return res.json({
        success: true,
        message: `Password reset instructions sent for ${email}.`
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
    }
  }

  public async logout(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        await authService.logout(token);
      }
      return res.json({ success: true, message: 'Successfully logged out.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
    }
  }
}

export const authController = new AuthController();
export default authController;

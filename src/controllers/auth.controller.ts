import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, password_confirmation, phone } = req.body;

    if (!name || !email || !password || !phone) {
      res.status(422).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Name, email, password, and phone are required',
      });
      return;
    }

    if (password !== password_confirmation) {
      res.status(422).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Passwords do not match',
        errors: [{ field: 'password_confirmation', message: 'Passwords do not match' }],
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { phoneNumber: normalizedPhone }],
      },
    });

    if (existingUser) {
      const conflictField = existingUser.email === normalizedEmail ? 'email' : 'phone';
      res.status(409).json({
        status: 'error',
        code: 'RESOURCE_EXISTS',
        message: 'Email or phone number already in use',
        errors: [{ field: conflictField, message: `${conflictField === 'email' ? 'Email' : 'Phone number'} already in use` }],
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        fullName: name.trim(),
        email: normalizedEmail,
        phoneNumber: normalizedPhone,
        passwordHash,
      },
    });

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      data: {
        user: {
          id: user.id,
          name: user.fullName,
          email: user.email,
          phone_number: user.phoneNumber,
        },
        token: {
          access_token: token,
          token_type: 'Bearer',
          expires_in: 86400,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, remember_me } = req.body;

    if (!email || !password) {
      res.status(401).json({
        status: 'error',
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        status: 'error',
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        status: 'error',
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    const expiresInSeconds = remember_me ? 2592000 : 86400;
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: expiresInSeconds }
    );

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.fullName,
          email: user.email,
          phone_number: user.phoneNumber,
          avatar_url: user.avatarUrl,
        },
        token: {
          access_token: token,
          token_type: 'Bearer',
          expires_in: expiresInSeconds,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(422).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'A valid email address is required',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user && user.isActive) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'If this email is registered in our system, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userPayload = req.user as { userId: string; email: string } | undefined;
    if (!userPayload?.userId) {
      res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: 'User profile not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.fullName,
          email: user.email,
          phone_number: user.phoneNumber,
          avatar_url: user.avatarUrl,
          created_at: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    });
  }
};

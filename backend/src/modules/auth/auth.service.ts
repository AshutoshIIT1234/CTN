import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '@/entities/user.entity';
import { UserProfile } from '@/entities/user-profile.entity';
import { College } from '@/entities/college.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(College)
    private collegeRepository: Repository<College>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, username, password } = registerDto;

    // Check if email already exists
    const existingEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    // Verify if it's a college email
    const college = await this.verifyCollegeEmail(email);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Determine role based on email type
    const role = college ? UserRole.COLLEGE_USER : UserRole.GENERAL_USER;

    // Generate OTP
    const otp = this.emailService.generateOTP();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 10); // OTP valid for 10 minutes

    // Create user (not verified yet)
    const user = this.userRepository.create({
      email,
      username,
      passwordHash,
      role,
      collegeId: college?.id,
      displayName: username,
      isEmailVerified: false,
      emailVerificationToken: otp,
      emailVerificationExpires: otpExpires,
    });

    const savedUser = await this.userRepository.save(user);

    // Create user profile
    const profile = this.userProfileRepository.create({
      userId: savedUser.id,
      postCount: 0,
      commentCount: 0,
      likesReceived: 0,
    });
    await this.userProfileRepository.save(profile);

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(email, otp);
    } catch (error) {
      // If email fails, still return success but log the error
      console.error('Failed to send verification email:', error);
    }

    return {
      user: this.sanitizeUser(savedUser),
      message: 'Registration successful. Please check your email for verification code.',
      requiresVerification: true,
      college,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with college relation
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['college'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
      college: user.college,
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, otp } = verifyEmailDto;

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['college'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    if (!user.emailVerificationToken || !user.emailVerificationExpires) {
      throw new BadRequestException('No verification token found. Please request a new one.');
    }

    // Check if OTP is expired
    if (new Date() > user.emailVerificationExpires) {
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    // Verify OTP
    if (user.emailVerificationToken !== otp) {
      throw new BadRequestException('Invalid verification code');
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await this.userRepository.save(user);

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
      college: user.college,
      message: 'Email verified successfully',
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new OTP
    const otp = this.emailService.generateOTP();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 10);

    user.emailVerificationToken = otp;
    user.emailVerificationExpires = otpExpires;
    await this.userRepository.save(user);

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(email, otp);
      return {
        message: 'Verification code sent successfully',
      };
    } catch (error) {
      throw new BadRequestException('Failed to send verification email');
    }
  }

  async verifyCollegeEmail(email: string): Promise<College | null> {
    const domain = email.split('@')[1];
    if (!domain) {
      return null;
    }

    const college = await this.collegeRepository.findOne({
      where: { emailDomain: domain },
    });

    return college;
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { username } });
    return !user;
  }

  async assignRole(userId: string, role: UserRole): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.role = role;
    return await this.userRepository.save(user);
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      collegeId: user.collegeId,
    };

    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['college'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password
    if (newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters long');
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }
}

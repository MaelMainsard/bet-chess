import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AuthResponse } from './interfaces/auth-response.interface';
import { UserRecord } from 'firebase-admin/lib/auth';
import { ErrorCode } from './constant/errors.code';
import { firestore } from 'firebase-admin';
import QuerySnapshot = firestore.QuerySnapshot;
import * as dotenv from 'dotenv';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user';
dotenv.config();

@Injectable()
export class AuthService {
  private readonly CUSTOM_TOKEN_URL =
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken';
  private readonly SIGN_WITH_PASSWORD_URL =
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly userService: UserService,
    private readonly httpService: HttpService,
  ) {}

  // Create account
  async register(credentials: RegisterDto): Promise<AuthResponse> {
    if (await this.userService.usernameExists(credentials.username)) {
      throw new HttpException(
        ErrorCode.USERNAME_ALREADY_IN_USE,
        HttpStatus.CONFLICT,
      );
    }

    const userRecord: UserRecord = await this.firebaseService
      .getAuth()
      .createUser({
        email: credentials.email,
        password: credentials.password,
      });

    const user = new User({
      uid: userRecord.uid,
      email: credentials.email,
      username: credentials.username,
      point: 100,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.userService.setUser(user);

    const customToken: string = await this.firebaseService
      .getAuth()
      .createCustomToken(userRecord.uid);

    const response: any = await firstValueFrom(
      this.httpService.post(
        `${this.CUSTOM_TOKEN_URL}?key=${process.env.API_KEY}`,
        {
          token: customToken,
          returnSecureToken: true,
        },
      ),
    );

    return {
      id_token: response.data.idToken,
      expires_in: response.data.expiresIn,
      token_type: 'Bearer',
      user: user.toJSON(),
    };
  }

  // Get login token for account
  async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.SIGN_WITH_PASSWORD_URL}?key=${process.env.API_KEY}`,
          {
            email: credentials.email,
            password: credentials.password,
            returnSecureToken: true,
          },
        ),
      );

      this.userService.updateLastLogin(response.data.localId);

      return {
        id_token: response.data.idToken,
        expires_in: response.data.expiresIn,
        token_type: 'Bearer',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        ErrorCode.WRONG_EMAIL_OR_PASSWORD,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

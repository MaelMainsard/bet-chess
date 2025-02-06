import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './interfaces/user.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AuthResponse } from './interfaces/auth-response.interface';
import { UserRecord } from 'firebase-admin/lib/auth';
import { ErrorCode } from './constant/errors.code';
import { firestore } from 'firebase-admin';
import QuerySnapshot = firestore.QuerySnapshot;
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AuthService {
  private readonly USERS_COLLECTION = 'users';

  private get AUTH_BASE_URL(): string {
    const isDev:boolean = process.env.NODE_ENV === 'development';
    return isDev
      ? `http://${process.env['FIREBASE_AUTH_EMULATOR_HOST']}/identitytoolkit.googleapis.com/v1`
      : 'https://identitytoolkit.googleapis.com/v1';
  }

  private get CUSTOM_TOKEN_URL(): string {
    return `${this.AUTH_BASE_URL}/accounts:signInWithCustomToken`;
  }

  private get SIGN_WITH_PASSWORD_URL(): string {
    return `${this.AUTH_BASE_URL}/accounts:signInWithPassword`;
  }

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly httpService: HttpService,
  ) {}

  async register(credentials: RegisterDto): Promise<AuthResponse> {
    try {
      const existingUsernameQuery: QuerySnapshot = await this.firebaseService
        .getFirestore()
        .collection(this.USERS_COLLECTION)
        .where('username', '==', credentials.username)
        .get();

      if (!existingUsernameQuery.empty) {
        throw new Error(ErrorCode.USERNAME_ALREADY_IN_USE);
      }

      const userRecord: UserRecord = await this.firebaseService
        .getAuth()
        .createUser({
          email: credentials.email,
          password: credentials.password,
        });

      const userData: User = {
        email: credentials.email,
        username: credentials.username,
        point: 100,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.firebaseService
        .getFirestore()
        .collection(this.USERS_COLLECTION)
        .doc(userRecord.uid)
        .set(userData);

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
        user: {
          uid: userRecord.uid,
          email: userData.email,
          username: userData.username,
          point: userData.point,
          lastLogin: userData.lastLogin,
          updatedAt: userData.updatedAt,
          createdAt: userData.createdAt,
        },
      };
    } catch (error) {
      switch (error.message) {
        case ErrorCode.USERNAME_ALREADY_IN_USE:
          throw new HttpException(
            ErrorCode.USERNAME_ALREADY_IN_USE,
            HttpStatus.CONFLICT,
          );
        default:
          throw new HttpException(
            error.message,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }
  }

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

      const query: QuerySnapshot = await this.firebaseService
        .getFirestore()
        .collection(this.USERS_COLLECTION)
        .where('email', '==', credentials.email)
        .get();

      if (query.empty) {
        throw new HttpException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      const userDoc = query.docs[0];
      const userData: User = userDoc.data() as User;

      await this.firebaseService
        .getFirestore()
        .collection(this.USERS_COLLECTION)
        .doc(userDoc.id)
        .update({
          lastLogin: new Date(),
          updatedAt: new Date(),
        });

      return {
        id_token: response.data.idToken,
        expires_in: response.data.expiresIn,
        token_type: 'Bearer'
      };
    } catch (error) {
      throw new HttpException(
        ErrorCode.WRONG_EMAIL_OR_PASSWORD,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        throw new UnauthorizedException('No authorization header found');
      }

      const [bearer, token] = authHeader.split(' ');

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException('Invalid authorization header format');
      }

      const decodedToken = await this.firebaseService
        .getAuth()
        .verifyIdToken(token);

      const userDoc = await this.firebaseService
        .getFirestore()
        .collection('users')
        .doc(decodedToken.uid)
        .get();

      if (!userDoc.exists) {
        throw new UnauthorizedException('User not found in database');
      }

      request.user = {
        uid: decodedToken.uid,
        email: userDoc.data()!.email,
        username: userDoc.data()!.username,
        point: userDoc.data()!.point,
        lastLogin: userDoc.data()!.lastLogin.toDate(),
        createdAt: userDoc.data()!.createdAt.toDate(),
        updatedAt: userDoc.data()!.updatedAt.toDate(),
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  // Register Service
  register() {
    return { message: 'Register Business logic' };
  }

  // Login Service
  login() {
    return { message: 'Login Business logic' };
  }

  // Hash Password Service
  hashPassword() {
    return { message: 'Hash Password Business logic' };
  }

  // Compare Password Service
  comparePassword() {
    return { message: 'Compare Password Business logic' };
  }

  // Generate JWT Service
  generateJWTToken() {
    return { message: 'Generate JWT Business logic' };
  }
}

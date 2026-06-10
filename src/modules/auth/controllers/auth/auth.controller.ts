import { Controller, Post } from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register controller
  @Post('register')
  register() {
    return this.authService.register();
  }

  // Login controller
  @Post('login')
  login() {
    return this.authService.login();
  }
}

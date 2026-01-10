import { Controller, Post, Body, UseGuards, Get, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from "./dto/auth.dto";

import { ApiTags } from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  // ============================================
  // CUSTOMER ROUTES
  // ============================================

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.authService.registerCustomer(dto.email, dto.password, dto.name);
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.authService.loginCustomer(dto.email, dto.password);
  }

  @Post("refresh")
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getProfile(@Request() req: any) {
    const user = await this.authService.validateUser(req.user.sub, req.user.type);
    return { user };
  }

  // ============================================
  // PASSWORD RESET
  // ============================================

  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  // ============================================
  // STAFF ROUTES
  // ============================================

  @Post("staff/login")
  async staffLogin(@Body() dto: LoginDto) {
    return this.authService.loginStaff(dto.email, dto.password);
  }
}

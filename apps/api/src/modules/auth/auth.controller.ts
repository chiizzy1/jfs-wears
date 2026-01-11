import { Controller, Post, Body, UseGuards, Get, Request, Res, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from "./dto/auth.dto";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// Cookie expiry times
const ACCESS_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days - matches JWT for seamless UX
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService, private configService: ConfigService) {}

  /**
   * Helper to set auth cookies on response
   */
  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie("access_token", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
    res.cookie("refresh_token", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }

  /**
   * Helper to clear auth cookies
   */
  private clearAuthCookies(res: Response) {
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
  }

  // ============================================
  // CUSTOMER ROUTES
  // ============================================

  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.registerCustomer(dto.email, dto.password, dto.name);
    this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    // Still return tokens in body for mobile/API clients
    return result;
  }

  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.loginCustomer(dto.email, dto.password);
    this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    return result;
  }

  @Post("refresh")
  async refresh(@Body() dto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.refreshTokens(dto.refreshToken);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getProfile(@Request() req: any) {
    const user = await this.authService.validateUser(req.user.sub, req.user.type);
    return { user };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    this.clearAuthCookies(res);
    return { message: "Logged out successfully" };
  }

  // ============================================
  // EMAIL VERIFICATION
  // ============================================

  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() body: { email: string; token: string }) {
    return this.authService.verifyEmail(body.email, body.token);
  }

  @Post("resend-verification")
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
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
  async staffLogin(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.loginStaff(dto.email, dto.password);
    this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    return result;
  }

  @Post("staff/logout")
  @HttpCode(HttpStatus.OK)
  async staffLogout(@Res({ passthrough: true }) res: Response) {
    this.clearAuthCookies(res);
    return { message: "Logged out successfully" };
  }

  // ============================================
  // GOOGLE OAUTH
  // ============================================

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth() {
    // Passport handles redirect to Google
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthCallback(@Request() req: any, @Res() res: Response) {
    try {
      // Handle the Google user data
      const result = await this.authService.handleGoogleLogin(req.user);
      this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

      // Redirect to frontend with success
      const frontendUrl = this.configService.get<string>("FRONTEND_URL") || "http://localhost:3000";
      res.redirect(`${frontendUrl}/?login=success`);
    } catch (error) {
      const frontendUrl = this.configService.get<string>("FRONTEND_URL") || "http://localhost:3000";
      res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }
  }
}

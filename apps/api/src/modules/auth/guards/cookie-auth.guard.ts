import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";

/**
 * Cookie-based JWT Auth Guard
 *
 * Extracts JWT from httpOnly cookie first, then falls back to Authorization header.
 * This allows both browser (cookie) and API (header) authentication.
 */
@Injectable()
export class CookieAuthGuard extends AuthGuard("jwt") {
  /**
   * Extract JWT from request - checks cookie first, then header
   */
  getRequest(context: ExecutionContext): Request {
    const request = context.switchToHttp().getRequest<Request>();

    // Try to get token from cookie first
    const tokenFromCookie = request.cookies?.["access_token"];

    if (tokenFromCookie && !request.headers.authorization) {
      // Set the authorization header so passport-jwt can extract it
      request.headers.authorization = `Bearer ${tokenFromCookie}`;
    }

    return request;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException("Authentication required");
    }
    return user;
  }
}

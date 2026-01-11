import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback, Profile } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>("GOOGLE_CLIENT_ID");
    const clientSecret = configService.get<string>("GOOGLE_CLIENT_SECRET");

    // Use dummy values if not configured - strategy just won't work but won't crash
    super({
      clientID: clientID || "not-configured",
      clientSecret: clientSecret || "not-configured",
      callbackURL: configService.get<string>("GOOGLE_CALLBACK_URL") || "http://localhost:3001/api/auth/google/callback",
      scope: ["email", "profile"],
    });

    if (!clientID || !clientSecret) {
      this.logger.warn("Google OAuth not configured - set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env");
    }
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback): Promise<void> {
    const { emails, displayName, photos } = profile;

    const user = {
      email: emails?.[0]?.value,
      name: displayName,
      picture: photos?.[0]?.value,
      accessToken,
    };

    done(null, user);
  }
}

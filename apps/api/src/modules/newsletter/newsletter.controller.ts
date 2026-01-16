import { Controller, Post, Body, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { NewsletterService } from "./newsletter.service";
import { SubscribeNewsletterDto } from "./dto/newsletter.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";

@ApiTags("Newsletter")
@Controller("newsletter")
export class NewsletterController {
  constructor(private newsletterService: NewsletterService) {}

  // Public: Subscribe to newsletter
  @Post("subscribe")
  async subscribe(@Body() data: SubscribeNewsletterDto) {
    const subscriber = await this.newsletterService.subscribe(data);
    return { message: "Successfully subscribed!", email: subscriber.email };
  }

  // Public: Unsubscribe from newsletter
  @Post("unsubscribe")
  async unsubscribe(@Body("email") email: string) {
    return this.newsletterService.unsubscribe(email);
  }

  // Admin: Get all subscribers
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getAll(@Query("active") active?: string) {
    const isActive = active !== "false";
    return this.newsletterService.getAll(isActive);
  }

  // Admin: Get subscriber count
  @Get("count")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async getCount() {
    const count = await this.newsletterService.getCount();
    return { count };
  }
}

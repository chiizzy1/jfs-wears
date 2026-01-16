import { Injectable, Logger, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SubscribeNewsletterDto } from "./dto/newsletter.dto";

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(private prisma: PrismaService) {}

  async subscribe(data: SubscribeNewsletterDto) {
    // Check if already subscribed
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      // If previously unsubscribed, reactivate
      if (!existing.isActive) {
        this.logger.debug(`Reactivating subscriber: ${data.email}`);
        return this.prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            unsubscribedAt: null,
            source: data.source || existing.source,
          },
        });
      }
      throw new ConflictException("Email already subscribed");
    }

    this.logger.debug(`New subscriber: ${data.email}`);
    return this.prisma.newsletterSubscriber.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        source: data.source || "popup",
      },
    });
  }

  async unsubscribe(email: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!subscriber) {
      return { message: "Email not found" };
    }

    await this.prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    return { message: "Successfully unsubscribed" };
  }

  async getAll(active: boolean = true) {
    return this.prisma.newsletterSubscriber.findMany({
      where: { isActive: active },
      orderBy: { subscribedAt: "desc" },
    });
  }

  async getCount() {
    return this.prisma.newsletterSubscriber.count({
      where: { isActive: true },
    });
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateSettingsDto } from "./dto/settings.dto";

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    // Try to find the first settings record
    const settings = await this.prisma.storeSettings.findFirst();

    // If no settings exist, create default
    if (!settings) {
      return this.prisma.storeSettings.create({
        data: {
          storeName: "JFS Wears",
          storeEmail: "contact@jfswears.com",
          currency: "NGN",
        },
      });
    }

    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    // Get existing settings ID or create if not exists
    const settings = await this.getSettings();

    return this.prisma.storeSettings.update({
      where: { id: settings.id },
      data: dto,
    });
  }
}

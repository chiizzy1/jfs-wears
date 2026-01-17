import { Controller, Get, Put, Post, Body, Request, UseGuards, UseInterceptors, UploadedFile } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { SettingsService } from "./settings.service";
import { UpdateSettingsDto } from "./dto/settings.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import { CloudinaryService } from "../upload/cloudinary.service";
import { AuditLogService } from "../audit-log/audit-log.service";
import { AuditAction } from "@prisma/client";

@ApiTags("Settings")
@Controller("settings")
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get store settings" })
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update store settings" })
  async updateSettings(@Request() req: any, @Body() dto: UpdateSettingsDto) {
    const result = await this.settingsService.updateSettings(dto);
    await this.auditLogService.logFromRequest(req, AuditAction.SETTINGS_UPDATE, "Settings", "store", `Updated store settings`, {
      changes: Object.keys(dto),
    });
    return result;
  }

  @Post("logo")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
      },
    },
  })
  @ApiOperation({ summary: "Upload store logo" })
  @ApiBearerAuth()
  async uploadLogo(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadImage(file);
    await this.auditLogService.logFromRequest(req, AuditAction.SETTINGS_UPDATE, "Settings", "logo", `Updated store logo`, {
      logoUrl: result.secureUrl,
    });
    return { url: result.secureUrl };
  }
}

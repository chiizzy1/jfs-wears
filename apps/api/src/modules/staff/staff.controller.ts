import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { StaffService } from "./staff.service";
import { CreateStaffDto, UpdateStaffDto } from "./dto/staff.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import { CloudinaryService } from "../upload/cloudinary.service";
import { AuditLogService } from "../audit-log/audit-log.service";
import { AuditAction } from "@prisma/client";

@ApiTags("Staff")
@ApiBearerAuth()
@Controller("staff")
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly auditLogService: AuditLogService,
  ) {}

  // ============================================
  // SELF-SERVICE ENDPOINTS (accessible by any authenticated staff)
  // These must come BEFORE the :id routes to avoid conflicts
  // ============================================

  @Get("me")
  @Roles("ADMIN", "MANAGER", "STAFF")
  @ApiOperation({ summary: "Get current staff member's profile" })
  getMyProfile(@Request() req: any) {
    return this.staffService.getMyProfile(req.user.sub);
  }

  @Put("me/profile")
  @Roles("ADMIN", "MANAGER", "STAFF")
  @ApiOperation({ summary: "Update current staff member's profile" })
  updateMyProfile(@Request() req: any, @Body() body: { name?: string }) {
    return this.staffService.updateMyProfile(req.user.sub, body);
  }

  @Post("me/change-password")
  @Roles("ADMIN", "MANAGER", "STAFF")
  @ApiOperation({ summary: "Change current staff member's password" })
  async changeMyPassword(@Request() req: any, @Body() body: { currentPassword: string; newPassword: string }) {
    const result = await this.staffService.changeMyPassword(req.user.sub, body.currentPassword, body.newPassword);
    await this.auditLogService.logFromRequest(req, AuditAction.PASSWORD_CHANGE, "Staff", req.user.sub, "Changed own password");
    return result;
  }

  @Post("me/profile-image")
  @Roles("ADMIN", "MANAGER", "STAFF")
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
  @ApiOperation({ summary: "Upload profile image for current staff member" })
  async uploadMyProfileImage(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadImage(file);
    return this.staffService.updateMyProfileImage(req.user.sub, result.secureUrl);
  }

  // ============================================
  // ADMIN ENDPOINTS (for managing other staff)
  // ============================================

  @Get()
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Get all staff members" })
  findAll() {
    return this.staffService.findAll();
  }

  @Get(":id")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Get a staff member by ID" })
  findOne(@Param("id") id: string) {
    return this.staffService.findOne(id);
  }

  @Post()
  @Roles("ADMIN")
  @ApiOperation({ summary: "Create a new staff member" })
  async create(@Request() req: any, @Body() dto: CreateStaffDto) {
    const result = await this.staffService.create(dto);
    await this.auditLogService.logFromRequest(
      req,
      AuditAction.CREATE,
      "Staff",
      result.id,
      `Created staff member "${result.name}" (${result.role})`,
      { staffName: result.name, role: result.role, email: result.email },
    );
    return result;
  }

  @Put(":id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Update a staff member" })
  async update(@Request() req: any, @Param("id") id: string, @Body() dto: UpdateStaffDto) {
    const result = await this.staffService.update(id, dto);
    await this.auditLogService.logFromRequest(req, AuditAction.UPDATE, "Staff", id, `Updated staff member "${result.name}"`, {
      staffName: result.name,
      changes: Object.keys(dto),
    });
    return result;
  }

  @Delete(":id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Soft delete a staff member" })
  async remove(@Request() req: any, @Param("id") id: string) {
    const staff = await this.staffService.findOne(id);
    const result = await this.staffService.softDelete(id);
    await this.auditLogService.logFromRequest(req, AuditAction.DELETE, "Staff", id, `Deleted staff member "${staff?.name}"`, {
      staffName: staff?.name,
      email: staff?.email,
    });
    return result;
  }

  @Post(":id/restore")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Restore a deleted staff member" })
  async restore(@Request() req: any, @Param("id") id: string) {
    const result = await this.staffService.restore(id);
    await this.auditLogService.logFromRequest(req, AuditAction.RESTORE, "Staff", id, `Restored staff member "${result.name}"`, {
      staffName: result.name,
    });
    return result;
  }
}

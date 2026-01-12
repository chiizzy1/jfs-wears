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

@ApiTags("Staff")
@ApiBearerAuth()
@Controller("staff")
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService, private readonly cloudinaryService: CloudinaryService) {}

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
  changeMyPassword(@Request() req: any, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.staffService.changeMyPassword(req.user.sub, body.currentPassword, body.newPassword);
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
  create(@Body() dto: CreateStaffDto) {
    return this.staffService.create(dto);
  }

  @Put(":id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Update a staff member" })
  update(@Param("id") id: string, @Body() dto: UpdateStaffDto) {
    return this.staffService.update(id, dto);
  }

  @Delete(":id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Soft delete a staff member" })
  remove(@Param("id") id: string) {
    return this.staffService.softDelete(id);
  }

  @Post(":id/restore")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Restore a deleted staff member" })
  restore(@Param("id") id: string) {
    return this.staffService.restore(id);
  }
}

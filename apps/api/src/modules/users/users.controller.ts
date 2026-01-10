import { Controller, Get, Post, Put, Delete, Param, Query, Body, Request, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Customer endpoints
  @Put("profile")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Update current user profile" })
  async updateProfile(@Request() req: any, @Body() body: { name?: string; phone?: string }) {
    return this.usersService.updateProfile(req.user.sub, body);
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Change current user password" })
  async changePassword(@Request() req: any, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.usersService.changePassword(req.user.sub, body.currentPassword, body.newPassword);
  }

  // Admin endpoints
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Get all users (Admin/Manager)" })
  async findAll(@Query("page") page?: string, @Query("limit") limit?: string) {
    return this.usersService.findAll(Number(page) || 1, Number(limit) || 20);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Get user details" })
  async findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Soft delete a user" })
  async remove(@Param("id") id: string) {
    return this.usersService.softDelete(id);
  }

  @Post(":id/restore")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Restore a soft-deleted user" })
  async restore(@Param("id") id: string) {
    return this.usersService.restore(id);
  }

  // ============================================
  // ADDRESS ENDPOINTS
  // ============================================

  @Get("addresses")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get user addresses" })
  async getAddresses(@Request() req: any) {
    return this.usersService.getAddresses(req.user.sub);
  }

  @Post("addresses")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Create new address" })
  async createAddress(
    @Request() req: any,
    @Body()
    body: {
      firstName: string;
      lastName: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      landmark?: string;
      isDefault?: boolean;
    }
  ) {
    return this.usersService.createAddress(req.user.sub, body);
  }

  @Put("addresses/:addressId")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Update address" })
  async updateAddress(
    @Request() req: any,
    @Param("addressId") addressId: string,
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      landmark?: string;
      isDefault?: boolean;
    }
  ) {
    return this.usersService.updateAddress(req.user.sub, addressId, body);
  }

  @Delete("addresses/:addressId")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Delete address" })
  async deleteAddress(@Request() req: any, @Param("addressId") addressId: string) {
    return this.usersService.deleteAddress(req.user.sub, addressId);
  }

  @Get("addresses/default")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get default address" })
  async getDefaultAddress(@Request() req: any) {
    return this.usersService.getDefaultAddress(req.user.sub);
  }
}

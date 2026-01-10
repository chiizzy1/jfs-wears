import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { StaffService } from "./staff.service";
import { CreateStaffDto, UpdateStaffDto } from "./dto/staff.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";

@ApiTags("Staff")
@ApiBearerAuth()
@Controller("staff")
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

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

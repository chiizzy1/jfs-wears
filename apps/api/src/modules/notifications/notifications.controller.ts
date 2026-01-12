import { Controller, Get, Patch, Param, Query, UseGuards, Request } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { NotificationQueryDto } from "./dto/notifications.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";

@Controller("admin/notifications")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "MANAGER", "STAFF")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Get all notifications for the logged-in admin
   */
  @Get()
  async findAll(@Query() query: NotificationQueryDto, @Request() req: { user?: { sub: string } }) {
    const staffId = req.user?.sub;
    return this.notificationsService.findAll(query, staffId);
  }

  /**
   * Get unread notification count for badge
   */
  @Get("unread-count")
  async getUnreadCount(@Request() req: { user?: { sub: string } }) {
    const staffId = req.user?.sub;
    const count = await this.notificationsService.getUnreadCount(staffId);
    return { count };
  }

  /**
   * Mark a single notification as read
   */
  @Patch(":id/read")
  async markAsRead(@Param("id") id: string) {
    return this.notificationsService.markAsRead(id);
  }

  /**
   * Mark all notifications as read
   */
  @Patch("read-all")
  async markAllAsRead(@Request() req: { user?: { sub: string } }) {
    const staffId = req.user?.sub;
    const result = await this.notificationsService.markAllAsRead(staffId);
    return { success: true, count: result.count };
  }
}

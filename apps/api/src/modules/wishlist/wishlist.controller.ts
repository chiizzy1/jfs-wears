import { Controller, Get, Post, Delete, Param, UseGuards, Request } from "@nestjs/common";
import { WishlistService } from "./wishlist.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";

@ApiTags("Wishlist")
@ApiBearerAuth()
@Controller("wishlist")
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: "Get user wishlist" })
  async getWishlist(@Request() req: any) {
    return this.wishlistService.getWishlist(req.user.sub);
  }

  @Post(":productId")
  @ApiOperation({ summary: "Add product to wishlist" })
  async addToWishlist(@Request() req: any, @Param("productId") productId: string) {
    return this.wishlistService.addToWishlist(req.user.sub, productId);
  }

  @Delete(":productId")
  @ApiOperation({ summary: "Remove product from wishlist" })
  async removeFromWishlist(@Request() req: any, @Param("productId") productId: string) {
    return this.wishlistService.removeFromWishlist(req.user.sub, productId);
  }

  @Delete()
  @ApiOperation({ summary: "Clear entire wishlist" })
  async clearWishlist(@Request() req: any) {
    return this.wishlistService.clearWishlist(req.user.sub);
  }

  @Get(":productId/check")
  @ApiOperation({ summary: "Check if product is in wishlist" })
  async isInWishlist(@Request() req: any, @Param("productId") productId: string) {
    const inWishlist = await this.wishlistService.isInWishlist(req.user.sub, productId);
    return { inWishlist };
  }
}

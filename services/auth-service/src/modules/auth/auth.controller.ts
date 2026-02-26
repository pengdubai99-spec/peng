import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Yeni kullanıcı kaydı' })
  @ApiResponse({ status: 201, description: 'Kayıt başarılı' })
  @ApiResponse({ status: 409, description: 'E-posta veya telefon zaten kayıtlı' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Kullanıcı girişi' })
  @ApiResponse({ status: 200, description: 'Giriş başarılı' })
  @ApiResponse({ status: 401, description: 'Geçersiz kimlik bilgileri' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Access token yenileme' })
  @ApiResponse({ status: 200, description: 'Token yenilendi' })
  @ApiResponse({ status: 401, description: 'Geçersiz refresh token' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kullanıcı profili' })
  @ApiResponse({ status: 200, description: 'Profil bilgisi' })
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.sub);
  }
}

import { Controller, UsePipes, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ValidationPipe } from './pipes/validation.pipe';
import { UserService } from './users.service';
import { commonResponses } from '../api-responses/dtos/api-response';

@ApiTags('Users')
@Controller('users')
@UsePipes(ValidationPipe)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse(commonResponses.success)
  @ApiResponse(commonResponses.error)
  @ApiResponse(commonResponses.unauthorized)
  @ApiBearerAuth()
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (user) {
      const { password, refreshToken, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }
}

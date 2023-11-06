import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserDTO } from 'src/users/dtos/user.dto';
import { UsersSevice } from 'src/users/services/users.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EncryptPipe } from 'src/common/pipes/encrypt.pipe';
import { roles } from 'src/common/constant/common.constant';
import { Roles } from 'src/auth/decorators/rol.decorator';
import { Public } from 'src/auth/decorators/public.decorator';

@UseGuards(JwtAuthGuard)
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersSevice) {}

  // @Get('/')
  // @HttpCode(HttpStatus.ACCEPTED)
  // getUsers(@Query() querys: UserQueryDTO) {
  //   return this.userService.findAll(querys);
  // }

  // @Model('Users')
  // @Get('/:id')
  // @HttpCode(HttpStatus.ACCEPTED)
  // getUserById(@Param('id', ParseIntPipe) id: number) {
  //   return this.userService.findById(id);
  // }

  //@Roles(roles.admin)
  @Public()
  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body('password', EncryptPipe) password: string,
    @Body() body: UserDTO,
  ) {
    try {
      const existsMai = await this.userService.findByEmail(body.mail);
      if (existsMai) {
        throw new BadRequestException('Invalid email');
      }
      body.password = password;
      return this.userService.create(body);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
  // @Model('Users')
  // @Put('/:id')
  // @HttpCode(HttpStatus.ACCEPTED)
  // updateUser(@Param('id') id: number, @Body() user: UpdateUserDTO) {
  //   return this.userService.updateUser(id, user);
  // }
}

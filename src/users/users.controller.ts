import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { UsersService } from './users.service'
import { ZodValidationPipe } from 'src/common/pipes/zod-validate.pipes'
import { CreateUserSchema } from './validators/create-user.schema'
import type { TCreateUserZodValDto } from './validators/create-user.schema'
import { UpdateUserSchema, type TUpdateUserZodValDto } from './validators/update-user.schema'

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body(new ZodValidationPipe(CreateUserSchema)) createUserDto: TCreateUserZodValDto) {
    console.log(createUserDto)
    return this.usersService.create(createUserDto)
  }

  @Get()
  findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: TUpdateUserZodValDto) {
    return this.usersService.update(id, updateUserDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id)
  }
}

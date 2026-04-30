import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, UnprocessableEntityException } from '@nestjs/common'
import { UsersService } from './users.service'
import { ZodValidationPipe } from 'src/common/pipes/zod-validate.pipes'
import { CreateUserSchema } from './validators/create-user.schema'
import type { TCreateUserBodyDto } from './validators/create-user.schema'
import { UpdateUserSchema, type TUpdateUserZodValDto } from './validators/update-user.schema'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { diskStorageEngine } from 'src/common/multer/local-disk-storage.multer'
import { validateWithZod } from 'src/utils/zod-validation/zod-validation.utils'
import { multipleFileLocalFullPathResolver } from 'src/utils/local-file-storage/file.utils'
import { BaseUrl } from 'src/common/decorators/base-url.decorator'

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'background', maxCount: 1 }
      ],
      {
        storage: diskStorageEngine('avatar')
      }
    )
  )
  async create(
    @BaseUrl() baseUrl: string,
    @UploadedFiles() files: { avatar?: Express.Multer.File[]; background?: Express.Multer.File[] },
    // if you want a pipe validation, use this, but it cannot validate files. You will have to validate it separately.
    // @Body(new ZodValidationPipe(CreateUserSchema)) createUserDto: TCreateUserZodValDto
    @Body() TCreateUserBodyDto: TCreateUserBodyDto
  ) {
    try {
      const validatedData = await validateWithZod(CreateUserSchema, { ...TCreateUserBodyDto, ...files })
      const filesWithFullPaths = multipleFileLocalFullPathResolver(baseUrl, files)
      const storeData = { ...validatedData, avatar: filesWithFullPaths?.avatar[0], background: filesWithFullPaths?.background[0] }

      return this.usersService.create(storeData)
    } catch (error) {
      // TODO:
      // rollbackMultipleFileS3(req);
      // rollbackMultipleFileLocalUpload(req)
      if (error instanceof UnprocessableEntityException) {
        throw new UnprocessableEntityException(error)
      }
      throw error
    }
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

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { Prisma } from 'generated/prisma/client'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
    try {
      return await this.prisma.user.create({ data })
    } catch (error) {
      console.log('Create user service', error)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('User with this email already exists')
      }
      throw error
    }
  }

  findAll() {
    return this.prisma.user.findMany({ select: { id: true, email: true, name: true, createdAt: true } })
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException(`User with id ${id} not found`)
    return user
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    try {
      const userExists = await this.prisma.user.count({ where: { id } })
      if (!userExists) throw new NotFoundException(`User with id ${id} not found`)
      return await this.prisma.user.update({ where: { id }, data })
    } catch (error) {
      console.log('Update user service', error)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('User with this email already exists')
      }
      throw error
    }
  }

  async remove(id: string) {
    try {
      const userExists = await this.prisma.user.count({ where: { id } })
      if (!userExists) throw new NotFoundException(`User with id ${id} not found`)
      return this.prisma.user.delete({ where: { id } })
    } catch (error) {
      console.log('Delete user service', error)
      throw error // re-throw anything unexpected
    }
  }
}

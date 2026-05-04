import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { Prisma } from 'generated/prisma/client'

export const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): never => {
  switch (error.code) {
    case 'P2002':
      throw new ConflictException('A record with this value already exists')
    case 'P2025':
      throw new NotFoundException('Record not found')
    case 'P2003':
      throw new BadRequestException('Related record not found')
    case 'P2014':
      throw new BadRequestException('Relation violation')
    case 'P2000':
      throw new BadRequestException('Value too long for this field')
    case 'P2006':
      throw new BadRequestException('Invalid value provided for this field')
    default:
      throw error
  }
}

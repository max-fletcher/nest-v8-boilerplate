import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './users/users.module'
import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [ConfigModule.forRoot({ isGlobal: true }), UsersModule, PrismaModule]
})
export class AppModule {}

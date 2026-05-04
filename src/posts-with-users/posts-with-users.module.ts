import { Module } from '@nestjs/common';
import { PostsWithUsersService } from './posts-with-users.service';

@Module({
  providers: [PostsWithUsersService]
})
export class PostsWithUsersModule {}

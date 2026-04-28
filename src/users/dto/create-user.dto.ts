import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 300)
  name!: string

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Length(1, 300)
  email!: string

  @IsString()
  @IsNotEmpty()
  @Length(8, 50)
  password!: string
}

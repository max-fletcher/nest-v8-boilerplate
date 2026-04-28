import { IsDefined, IsEmail, IsString, Length } from 'class-validator'
export class CreateUserDto {
  @IsDefined()
  @IsString()
  @Length(3, 300)
  name!: string

  @IsDefined()
  @IsEmail()
  email!: string

  @IsDefined()
  @IsString()
  @Length(8, 50)
  password!: string
}

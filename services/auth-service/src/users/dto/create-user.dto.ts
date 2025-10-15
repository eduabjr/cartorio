import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'USER', enum: ['USER', 'ADMIN', 'CARTORIO'], required: false })
  @IsOptional()
  @IsEnum(['USER', 'ADMIN', 'CARTORIO'])
  role?: string;
}

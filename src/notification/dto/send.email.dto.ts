import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({
    description: 'Name of the User/Employee',
    example: 'Will',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'It contains email value on which mail need to be sent',
    example: 'will@company.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password of the User/Employee',
    example: 'Will',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

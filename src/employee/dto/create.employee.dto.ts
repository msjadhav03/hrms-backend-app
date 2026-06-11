import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Fullname of the employee',
    example: 'Manisha Jadhav',
  })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({
    description: 'Official Email of the employee',
    example: 'manisha@company.com',
  })
  @IsEmail()
  @IsNotEmpty()
  official_mail: string;

  @ApiProperty({
    description: 'Onboarded location of the employee',
    example: 'Location_Name',
  })
  @IsString()
  @IsNotEmpty()
  onboard_location: string;

  @ApiProperty({
    description: 'Job Title of the employee',
    example: 'Senior Software Engineer',
  })
  @IsString()
  @IsNotEmpty()
  job_title: string;

  @ApiProperty({ description: 'Salary of the employee', example: 120000 })
  @IsNumber()
  @IsNotEmpty()
  salary: number;

  @ApiProperty({
    description: 'Date of joining of the employee',
    example: '02-02-2000',
  })
  @IsDateString()
  @IsNotEmpty()
  date_of_joining: string;

  @ApiProperty({
    description: 'Working Department of the employee',
    example: 'department_Name',
  })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({
    description: 'Country of the employee',
    example: 'country_Name',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    description: 'Address Line of the Employee',
    example: 'Address XYX',
  })
  @IsString()
  @IsNotEmpty()
  address_line: string;

  @ApiProperty({ description: 'State of the employee', example: 'City_Name' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State of the employee', example: 'State_Name' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'Date of birth of employee',
    example: '03-01-2023',
  })
  @IsString()
  @IsNotEmpty()
  zip_code: string;

  @ApiProperty({
    description: 'Personal Email ID of the employee',
    example: 'personal@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  personal_email: string;

  @ApiProperty({
    description: 'Contact Number of the employee',
    example: '2232278444',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/)
  contact_number: string;

  @ApiProperty({
    description: 'Country code of employee nationality for Telecommunication',
    example: `91`,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{1,5}$/)
  country_code: string;

  @ApiProperty({ description: 'Gender of the employee', example: 'Male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({
    description: 'Marriage status of the employee',
    example: 'Single',
  })
  @IsEmail()
  @IsNotEmpty()
  married_status: string;

  @ApiProperty({ description: 'Age of the employee', example: 28 })
  @IsEmail()
  @IsNotEmpty()
  @Min(18)
  @Max(50)
  age: number;

  @ApiProperty({
    description: 'Date of birth of employee',
    example: '03-01-2023',
  })
  @IsDateString()
  @IsNotEmpty()
  date_of_birth: string;

  @ApiProperty({ description: 'Pan ID value', example: 'BQDP2344S' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
  pan_id: string;
}

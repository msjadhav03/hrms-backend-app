import {
  Injectable,
  Inject,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { CreateEmployeeDto } from './dto/create.employee.dto';
import { EmployeeModuleConstants } from '../common/constants/messages';

@Injectable()
export class EmployeeService {
  constructor(
    @Inject('PG_CONNECTION')
    private readonly db: Pool,
  ) {}
  private readonly logger = new Logger(EmployeeService.name);

  /**
   * @returns - Randomly generated 10 digit number to be used as employee code for every employee record in the database.
   */
  randomNumber = () => {
    try {
      return Math.floor(1000000000 + Math.random() * 9000000000);
    } catch (error) {
      throw InternalServerErrorException;
    }
  };

  /**
   *
   * @param password To generate password
   * @returns
   */
  async generatePassword(password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      return hashedPassword;
    } catch (error) {
      throw InternalServerErrorException;
    }
  }

  /**
   *
   * @returns return Random password string
   */
  generateRandomString() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }
    return result;
  }
  /**
   * @param createEmployeeDto - Object containing all the neccessary details to create a new employee record in the database.
   * @returns - Object containing the status and message regarding the employee creation in the database.
   */
  async createNewEmployee(createEmployeeDto: CreateEmployeeDto) {
    try {
      const query = `
      INSERT INTO employees (
        employee_code, fullname, official_mail, onboard_location, job_title, salary, 
        date_of_joining, department, country, address_line, city, state, zip_code, 
        personal_email, contact_number, country_code, gender, married_status, age, 
        date_of_birth, pan_id, is_deleted, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, false, NOW(), NOW()
      )
    `;

      const values = [
        `EMP-${this.randomNumber()}`,
        createEmployeeDto.fullname,
        createEmployeeDto.official_mail,
        createEmployeeDto.onboard_location,
        createEmployeeDto.job_title,
        createEmployeeDto.salary,
        createEmployeeDto.date_of_joining,
        createEmployeeDto.department,
        createEmployeeDto.country,
        createEmployeeDto.address_line,
        createEmployeeDto.city,
        createEmployeeDto.state,
        createEmployeeDto.zip_code,
        createEmployeeDto.personal_email,
        createEmployeeDto.contact_number,
        createEmployeeDto.country_code,
        createEmployeeDto.gender,
        createEmployeeDto.married_status,
        createEmployeeDto.age,
        createEmployeeDto.date_of_birth,
        createEmployeeDto.pan_id,
      ];

      const response = await this.db.query(query, values);
      this.logger.log(
        `${EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_CREATION_SUCCESS}`,
      );

      return {
        status: HttpStatus.OK,
        message:
          EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_CREATION_SUCCESS,
        data: {
          insertedCount: response.rowCount,
        },
      };
    } catch (error) {
      this.logger.error(
        `${EmployeeModuleConstants.ERROR_MESSAGES.EMPLOYEE_CREATION_FAILED} - ${error.message}`,
      );
      throw new InternalServerErrorException(error.message);
    }
  }
}

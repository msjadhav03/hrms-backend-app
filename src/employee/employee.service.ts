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
import { NotificationService } from '../notification/notification.service';
import { UpdateEmployeeDto } from './dto/update.employee.dto';
import { GetEmployeeDto } from './dto/get.employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @Inject('PG_CONNECTION') private readonly db: Pool,
    private readonly notificationService: NotificationService,
  ) {}
  private readonly logger = new Logger(EmployeeService.name);

  /**
   * @returns - Randomly generated 10 digit number to be used as employee code for every employee record in the database.
   */
  randomNumber = () => {
    try {
      return Math.floor(1000000000 + Math.random() * 9000000000);
    } catch (error) {
      throw new InternalServerErrorException(
        EmployeeModuleConstants.ERROR_MESSAGES
          .FAILED_GENERATING_RANDOM_PASSWORD,
      );
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
      throw new InternalServerErrorException(
        EmployeeModuleConstants.ERROR_MESSAGES.FAILED_PASSWORD_HASHING,
      );
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
      const tempPassword = this.generateRandomString();
      const hashedPassword = await this.generatePassword(tempPassword);
      const empId = `EMP-${this.randomNumber()}`;
      let role = 'hr-manger';
      if (createEmployeeDto.department != 'Human Resources') {
        role = 'user';
      }
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
        empId,
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

      await this.db.query(query, values);

      const queryUser = `
        INSERT INTO users (
          email,
          password,
          role,
          employee_id,
          is_deleted,
          created_at,
          updated_at
        )
        VALUES($1, $2, $3, $4, $5, NOW(), NOW())`;

      const userValues = [
        createEmployeeDto.official_mail,
        hashedPassword,
        role,
        empId,
        false,
      ];

      await this.db.query(queryUser, userValues);
      await this.notificationService.sendEmail({
        name: createEmployeeDto.fullname,
        email: createEmployeeDto.official_mail,
        password: tempPassword,
      });
      this.logger.log(
        `${EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_CREATION_SUCCESS}`,
      );
      return {
        status: HttpStatus.OK,
        message:
          EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_CREATION_SUCCESS,
      };
    } catch (error) {
      this.logger.error(
        `${EmployeeModuleConstants.ERROR_MESSAGES.EMPLOYEE_CREATION_FAILED} - ${error.message}`,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   *
   * @param id - Employee code of the employee to be updated
   * @param updateEmployeeDto - Object containg all the details that needs to be updated for the employee record in the database.
   * @returns - Object containing the status and message regarding the employee updation in the database.
   */
  async updateEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    try {
      let role = 'hr-manger';
      if (updateEmployeeDto.department != 'Human Resources') {
        role = 'user';
      }
      const query = `
      UPDATE employees 
      SET 
        fullname = $1, official_mail = $2, onboard_location = $3, job_title = $4, 
        salary = $5, date_of_joining = $6, department = $7, country = $8, 
        address_line = $9, city = $10, state = $11, zip_code = $12, 
        personal_email = $13, contact_number = $14, country_code = $15, 
        gender = $16, married_status = $17, age = $18, date_of_birth = $19, 
        pan_id = $20, updated_at = NOW()
      WHERE employee_code = $21 AND is_deleted = false;
    `;

      const values = [
        updateEmployeeDto.fullname,
        updateEmployeeDto.official_mail,
        updateEmployeeDto.onboard_location,
        updateEmployeeDto.job_title,
        updateEmployeeDto.salary,
        updateEmployeeDto.date_of_joining,
        updateEmployeeDto.department,
        updateEmployeeDto.country,
        updateEmployeeDto.address_line,
        updateEmployeeDto.city,
        updateEmployeeDto.state,
        updateEmployeeDto.zip_code,
        updateEmployeeDto.personal_email,
        updateEmployeeDto.contact_number,
        updateEmployeeDto.country_code,
        updateEmployeeDto.gender,
        updateEmployeeDto.married_status,
        updateEmployeeDto.age,
        updateEmployeeDto.date_of_birth,
        updateEmployeeDto.pan_id,
        id,
      ];

      const userQuery = `
      UPDATE users SET role = $1, updated_at = NOW() WHERE employee_id = $2 AND is_deleted = false;
    `;
      const userValues = [role, id];

      await this.db.query(query, values);
      await this.db.query(userQuery, userValues);
      return {
        status: HttpStatus.OK,
        message:
          EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_UPDATE_SUCCESS,
      };
    } catch (error) {
      this.logger.error(
        `${EmployeeModuleConstants.ERROR_MESSAGES.EMPLOYEE_UPDATE_FAILED} ERROR: ${error.message}`,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   *
   * @param id - Employee code of the employee whose profile data needs to be fetched from the database.
   * @returns - Object containing the status, message and employee details regarding the employee profile data fetching in the database.
   */
  async findEmployeeById(id: string) {
    try {
      const query = `SELECT e.*, u.role from employees e INNER JOIN users u ON e.employee_code = u.employee_id where e.employee_code = $1 AND e.is_deleted = false`;
      const employeeData = await this.db.query(query, [id]);

      return {
        status: HttpStatus.OK,
        message:
          EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_FETCH_SUCCESS,
        data: employeeData?.rows[0] || [],
      };
    } catch (error) {
      this.logger.error(
        `${EmployeeModuleConstants.ERROR_MESSAGES.EMPLOYEE_FETCH_FAILED} Error: ${error.message}`,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @param id - ID of employee to be deleted
   * @returns - Object containing success response
   */
  async deleteOne(id: string) {
    try {
      const queryEmployee = `DELETE from employees where employee_code=$1`;
      await this.db.query(queryEmployee, [id]);
      return {
        status: HttpStatus.OK,
        message:
          EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_DELETE_SUCCESS,
      };
    } catch (error) {
      this.logger.error(
        `${EmployeeModuleConstants.ERROR_MESSAGES.EMPLOYEE_DELETION_FAILED} Error: ${error.message}`,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @param getEmployeeDto - Object containing the pagination details like page number and page size to fetch the employee list in a paginated manner.
   * @returns - Object containing the status, message, list of employees, total count of employees, page number and page size regarding the employee fetching in the database.
   */
  async find(getEmployeeDto: GetEmployeeDto) {
    try {
      const { page, size, country, department, search } = getEmployeeDto;
      const offset = (page - 1) * size;
      let baseWhereClause = ' WHERE is_deleted = false';
      const queryValues: any[] = [];
      let index = 1;

      if (country) {
        baseWhereClause += ` AND country = $${index++}`;
        queryValues.push(country);
      }
      if (department) {
        baseWhereClause += ` AND department = $${index++}`;
        queryValues.push(department);
      }
      if (search) {
        baseWhereClause += ` AND fullname ILIKE $${index++}`;
        queryValues.push(`%${search}%`);
      }
      const countQuery = `SELECT count(*)::int FROM employees${baseWhereClause};`;
      const totalCountResult = await this.db.query(countQuery, queryValues);
      const totalCount = totalCountResult?.rows[0]?.count || 0;
      const dataQuery = `SELECT * FROM employees${baseWhereClause} LIMIT $${index++} OFFSET $${index++};`;
      const finalValues = [...queryValues, size, offset];

      const result = await this.db.query(dataQuery, finalValues);
      return {
        status: HttpStatus.OK,
        message:
          EmployeeModuleConstants.SUCCESS_MESSAGES.EMPLOYEE_FETCH_SUCCESS,
        data: result?.rows || [],
        totalCount: totalCount,
        page: page,
        size: size,
      };
    } catch (error) {
      this.logger.error(
        `${EmployeeModuleConstants.ERROR_MESSAGES.EMPLOYEE_FETCH_FAILED} Error: ${error.message}`,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @returns - Object containing the list of distinct countries and departments available in the employee records in the database to be used as filter options while fetching the salary trend, employee count trend etc.
   */
  async findFilterList() {
    try {
      const response = await this.db.query(
        `SELECT DISTINCT country from employees ORDER BY country ASC`,
      );
      console.log(response);
      const departmentList = await this.db.query(
        `SELECT DISTINCT department from employees ORDER BY department ASC`,
      );
      return {
        status: HttpStatus.OK,
        message: EmployeeModuleConstants.SUCCESS_MESSAGES.FILTER_SUCCESS,
        data: {
          country: response?.rows || [],
          department: departmentList?.rows || [],
        },
      };
    } catch (error) {
      this.logger.error(
        `${EmployeeModuleConstants.ERROR_MESSAGES.FAILED_FILTER} - Error: ${error.message}`,
      );
      throw new InternalServerErrorException(error.message);
    }
  }
}

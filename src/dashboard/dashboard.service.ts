import {
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Pool } from 'pg';
import { DashboardModuleConstants } from '../common/constants/messages';
import { FilterOptionDto } from './dto/filter.dto';

@Injectable()
export class DashboardService {
  constructor(@Inject('PG_CONNECTION') private readonly db: Pool) {}
  private readonly logger = new Logger(DashboardService.name);
  /**
   * @param filter - Optional filter to narrow down the salary trend by country and/or department
   * @returns - Dynamically built where clause based on the applied filters to be used in the salary trend query
   */
  buildQuery(filter?: FilterOptionDto) {
    try {
      let whereClause = '';
      if (filter?.department) {
        whereClause = whereClause + ` AND department = '${filter.department}'`;
      }
      if (filter?.country) {
        whereClause = whereClause + `AND country = '${filter.country}'`;
      }
      return whereClause;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @param filter - Optional filter to narrow down the salary trend by country and/or department
   * @returns Object containing the minimum, maximum and average salary based on the applied filters
   */
  async getSalaryTrend(filter?: FilterOptionDto) {
    try {
      let query = `Select min(salary), max(salary), avg(salary) from employees`;
      if (filter?.country != null || filter?.department != null) {
        let whereClause = this.buildQuery(filter);
        query = `${query} WHERE 1=1 ${whereClause}`;
      }

      console.log(query);
      const response = await this.db.query(query);
      return {
        status: HttpStatus.OK,
        message:
          DashboardModuleConstants.SUCCESS_MESSAGES
            .SUCCESS_DASHBOARD_MIN_MAX_AVG,
        data: response?.rows,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @param filter - Optional filter to narrow down the calculation by country and/or department
   * @returns - Object containing the count of employees in each department based on the applied filters
   */
  async departmentWiseTrend(filter?: FilterOptionDto) {
    try {
      const query = `SELECT department, COUNT(*) from employees where 1=1 ${filter?.country ? `AND country = '${filter.country}'` : 'AND 1=1'} ${filter?.department ? `AND department = '${filter.department}'` : 'AND 1=1'} GROUP BY department`;
      const resonse = await this.db.query(query);
      return {
        status: HttpStatus.OK,
        message:
          DashboardModuleConstants.SUCCESS_MESSAGES
            .SUCCESS_DASHBOARD_DEPARTMENT,
        data: resonse?.rows,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @param filter - Optional filter to narrow down the calculation by country and/or department
   * @returns - Object containing the minimum, maximum and average salary for the recent 10 years based on the applied filters
   */
  async getSalaryTrendRecentYears(filter?: FilterOptionDto) {
    try {
      let query = `Select min(salary), max(salary), avg(salary), EXTRACT(YEAR from date_of_joining) from employees WHERE 1=1 `;
      if (filter?.country != null || filter?.department != null) {
        let whereClause = this.buildQuery(filter);
        query = `${query} ${whereClause}`;
      }
      query = `${query} group by EXTRACT(YEAR from date_of_joining) order by EXTRACT(YEAR from date_of_joining) desc limit 10`;

      const response = await this.db.query(query);
      return {
        status: HttpStatus.OK,
        message:
          DashboardModuleConstants.SUCCESS_MESSAGES
            .SUCCESS_DASHBOARD_RECENT_SALARY,
        data: response?.rows,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}

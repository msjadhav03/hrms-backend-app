import {
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Pool } from 'pg';
import { AnalyticModuleConstants } from '../common/constants/messages';
import { GetAnalyticDto } from './dto/get.analytic.dto';

@Injectable()
export class AnalyticService {
  constructor(@Inject('PG_CONNECTION') private readonly db: Pool) {}
  private readonly logger = new Logger(AnalyticService.name);
  /**
   *
   * @param getAnalyticDto
   * @param query
   * @returns Helping function to build query
   */
  buildQuery(getAnalyticDto: GetAnalyticDto, query: string) {
    try {
      const { country } = getAnalyticDto;
      let whereClause = 'AND 1=1';
      if (country) {
        whereClause = whereClause + ` AND country = '${country}'`;
      }
      return `${query} ${whereClause}`;
    } catch (error) {
      this.logger.error(`Analytic Service : ERROR: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @param query
   * @returns Returns result of paramter based query
   */
  async fetchData(query: string) {
    try {
      const response = await this.db.query(query);
      return response.rows;
    } catch (error) {
      this.logger.error(`Analytic Service : ERROR: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findCountOfEntities(getAnalyticDto: GetAnalyticDto) {
    try {
      const { country } = getAnalyticDto;
      console.log(country);
      let whereClause = '';
      let employeeCountQuery = `SELECT COUNT(*) from employees where 1=1`;
      let departmentCountQuery = `SELECT COUNT(DISTINCT department) from employees where 1=1`;
      let jobTitleCountQuery = `SELECT COUNT(DISTINCT job_title) from employees where 1=1`;
      let countryCountQuery = `SELECT COUNT(DISTINCT country) from employees where 1=1`;
      employeeCountQuery = this.buildQuery(getAnalyticDto, employeeCountQuery);
      departmentCountQuery = this.buildQuery(
        getAnalyticDto,
        departmentCountQuery,
      );
      jobTitleCountQuery = this.buildQuery(getAnalyticDto, jobTitleCountQuery);
      countryCountQuery = this.buildQuery(getAnalyticDto, countryCountQuery);

      const data = await Promise.all([
        this.fetchData(employeeCountQuery),
        this.fetchData(departmentCountQuery),
        this.fetchData(jobTitleCountQuery),
        this.fetchData(countryCountQuery),
      ]);
      return {
        status: HttpStatus.OK,
        message: AnalyticModuleConstants.SUCCESS_MESSAGES.SUCCESS_ENTITY_COUNT,
        data: [
          {
            employeeCount: data[0][0].count,
            departmentCount: data[1][0].count,
            jobTitleCount: data[2][0].count,
            countryCount: data[3][0].count,
          },
        ],
      };
    } catch (error) {
      this.logger.error(
        `Analytic Service :${AnalyticModuleConstants.ERROR_MESSAGES.ERROR_ENTITY_COUNT}: ERROR: ${error.message}`,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   *
   * @param getAnalyticDto
   * @returns Object containing List of Positions Top paid as per the applied filter
   */
  async findTopMostPaidJobs(getAnalyticDto: GetAnalyticDto) {
    try {
      const { country } = getAnalyticDto;
      console.log(country);
      let query = `SELECT job_title,salary from employees where 1=1`;
      query = this.buildQuery(getAnalyticDto, query);
      query = query + ` ORDER BY salary DESC LIMIT 10`;
      const data = await this.fetchData(query);
      return {
        status: HttpStatus.OK,
        message:
          AnalyticModuleConstants.SUCCESS_MESSAGES.SUCCESS_TOP_MOST_PAID_JOBS,
        data: data,
      };
    } catch (error) {
      this.logger.error(
        `Analytic Service :${AnalyticModuleConstants.ERROR_MESSAGES.ERROR_TOP_MOST_PAID_JOBS}: ERROR: ${error.message}`,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @param getAnalyticDto
   * @returns List of Top most paid department as per filter value
   */

  async findTopMostPaidDepartment(getAnalyticDto: GetAnalyticDto) {
    try {
      const { country } = getAnalyticDto;
      console.log(country);
      let query = `SELECT department, SUM(salary) as total_salary from employees where 1=1`;
      query = this.buildQuery(getAnalyticDto, query);
      query =
        query + ` group by department ORDER BY total_salary DESC LIMIT 10`;
      const data = await this.fetchData(query);
      return {
        status: HttpStatus.OK,
        message:
          AnalyticModuleConstants.SUCCESS_MESSAGES
            .SUCCESS_TOP_MOST_PAID_DEPARTMENT,
        data: data,
      };
    } catch (error) {
      this.logger.error(
        `Analytic Service :${AnalyticModuleConstants.ERROR_MESSAGES.ERROR_TOP_MOST_PAID_DEPARTMENT}: ERROR: ${error.message}`,
      );
      throw new InternalServerErrorException(error.message);
    }
  }
}

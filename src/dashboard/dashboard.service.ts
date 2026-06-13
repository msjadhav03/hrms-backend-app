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
}

export const SuccessMessages = {
  TEST_SUCCESS_MESSAGE: 'Operation Succeded successfully ',
};

export const SeedingModule = {
  TAG: 'SeedingModule: APIs to Create, Delete and Seed Table',
  SUMMARY: {
    TABLE_CREATION: 'This API is responsible for table creation',
    TABLE_DROP: 'This API is responsible for table drop',
    TABLE_SEEDING: 'This API is responsible for table seeding',
  },
  SUCCESS_MESSAGES: {
    TABLE_CREATION_SUCCESS: 'Table creation success',
    TABLE_DROP_SUCCESS: 'Database tables dropped successfully',
    TABLE_SEEDING_SUCCESS: 'Table seeding success',
    BACKGROUND_TASK_SUCCESS: 'Background task completed successfully',
  },
  ERROR_MESSAGES: {
    TABLE_CREATION_FAILED: 'Table creation failed',
    TABLE_DELETION_FAILED: 'Table Deletion failed',
    BACKGROUND_PROCESS_FAILED: 'Background Process failed',
    TABLE_SEEDING_FAILED: 'Table seeding failed',
  },
};

export const DashboardModuleConstants = {
  TAG: 'Dashboard Module: APIs to fetch Department trend, Yearly Trend, Min, max and avg trend',
  SUMMARY: {
    SUMMARY_DASHBOARD_DEPARTMENT:
      'Responsible for fetching count per dashboard',
    SUMMARY_DASHBOARD_YEARLY_TREND:
      'Responsible for fetching recent yearly trend',
    SUMMARY_DASHBOARD_VARIATION_TREND:
      'Responsible for fetching Min, Max and Avg salary variation trend',
  },
  SUCCESS_MESSAGES: {
    SUCCESS_DASHBOARD_DEPARTMENT: 'Fetched Department Data Successfully',
    SUCCESS_DASHBOARD_MIN_MAX_AVG:
      'Fetched MAX, MIN and AVG Salary Data Successfully',
    SUCCESS_DASHBOARD_RECENT_SALARY: 'Fetched Recent Salary Data Successfully',
  },
  ERROR_MESSAGES: {
    ERROR_DASHBOARD_DEPARTMENT: 'Failed to Fetch Department Data',
    ERROR_DASHBOARD_MIN_MAX_AVG: 'Failed to Fetch MAX, MIN and AVG Salary Data',
    ERROR_DASHBOARD_RECENT_SALARY: 'Failed to Fetch Recent Salary Data',
  },
};

export const AnalyticModuleConstants = {
  TAG: 'Analytic Module: APIs to fetch Analytical Data',
  SUMMARY: {
    SUMMARY_ENTITY_COUNT:
      '/analytics/count-of-entities : Responsible for fetching count of entities',
    SUMMARY_TOP_MOST_PAID_JOBS:
      '/analytics/top-most-paid-jobs : Responsible for fetching top most paid jobs',
    SUMMARY_TOP_MOST_PAID_DEPARTMENT:
      '/analytics/top-most-paid-department : Responsible for fetching top most paid department',
  },
  SUCCESS_MESSAGES: {
    SUCCESS_ENTITY_COUNT: 'Organizations Entity Count Fetched Successfully',
    SUCCESS_TOP_MOST_PAID_JOBS: 'Top Most Paid Jobs Data fetched Successfully',
    SUCCESS_TOP_MOST_PAID_DEPARTMENT:
      'Top Most Paid Department Data fetched Successfully',
  },
  ERROR_MESSAGES: {
    ERROR_ENTITY_COUNT: 'Failed to Fetch Organizations Entity Count ',
    ERROR_TOP_MOST_PAID_JOBS: 'Failed to fetch Top Most Paid Jobs Data',
    ERROR_TOP_MOST_PAID_DEPARTMENT:
      'Failed to fetch Top Most Paid Department Data',
  },
};

export const EmployeeModuleConstants = {
  TAG: 'EmployeeModule: APIs to Create, Delete, Upadate and Get Employee Resource',
  SUMMARY: {
    EMPLOYEE_CREATION: 'This API is responsible for Employee Resource creation',
    EMPLOYEE_DELETED: 'This API is responsible for Employee Resource Deletion',
    EMPLOYEE_FETCH: 'This API is responsible for Employee Resource Fetching',
    EMPLOYEE_FETCH_BY_ID:
      'This API is responsible for Employee Resource Fetching by ID',
    EMPLOYEE_UPDATE: 'This API is responsible for Employee Resource Update',
  },
  SUCCESS_MESSAGES: {
    EMPLOYEE_CREATION_SUCCESS: 'Emplpyee has been onboarded successfully',
    EMPLOYEE_DELETE_SUCCESS: 'Employee has been deleted successfully',
    EMPLOYEE_FETCH_SUCCESS: 'Employee data has been successfully fetched',
    EMPLOYEE_UPDATE_SUCCESS: 'Employee Updated successfully',
  },
  ERROR_MESSAGES: {
    EMPLOYEE_CREATION_FAILED: 'Table creation failed',
    EMPLOYEE_DELETION_FAILED: 'Table Deletion failed',
    EMPLOYEE_FETCH_FAILED: 'Background Process failed',
    EMPLOYEE_UPDATE_FAILED: 'Table seeding failed',
    FAILED_PASSWORD_HASHING: 'Failed while generating hashed password',
    FAILED_GENERATING_RANDOM_PASSWORD:
      'Failed while generating random password',
  },
};

export const AuthModuleConstants = {
  TAG: 'Auth Module: Authorization and Authentication APIs',
  SUCCESS_MESSAGES: {
    LOGIN_SUCCESS: 'User has been logged Successfully',
  },
  ERROR_MESSAGES: {
    LOGIN_FAILED: 'User Login Failed',
  },
};

export const NotificationModuleConstants = {
  TAG: 'Notification Module: APIs for Send Notifications',
  SUMMARY: {
    SEND_NOTIFICATION: 'Notification APIs to send notifications',
    UPDATE_NOTIFICATION_TEMPLATE: 'Update notification mail template',
  },
  SUCCESS_MESSAGES: {
    EMAIL_SUCCESS: 'E-Mail Sent Successfully',
  },
  ERROR_MESSAGES: {
    EMAIL_FAILED: 'Failed to sent e-mail',
  },
};

export const ErrorMessages = {
  FORBIDDEN_ERROR: 'Forbidden / Unauthorized',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  NOT_FOUND: 'Not Found',
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
};

export const CommonPath = {
  TEST: '/test',
};

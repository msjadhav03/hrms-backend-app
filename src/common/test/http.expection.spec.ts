import { HttpExceptionFilter } from '../filters/http-expection.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockArgumentsHost: Partial<ArgumentsHost>;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockRequest = {
      url: '/api/v1/auth/login',
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse as Response,
        getRequest: () => mockRequest as Request,
      }),
    };
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-13T14:09:34.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch HttpException and format an standard JSON response payload', () => {
    const exceptionMessage = 'Invalid credentials provided';
    const exceptionStatus = HttpStatus.UNAUTHORIZED;
    const mockException = new HttpException(exceptionMessage, exceptionStatus);

    filter.catch(mockException, mockArgumentsHost as ArgumentsHost);
    expect(mockArgumentsHost.switchToHttp).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(exceptionStatus);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: exceptionStatus,
      timestamp: '2026-06-13T14:09:34.000Z',
      path: '/api/v1/auth/login',
      error: exceptionMessage,
    });
  });
});

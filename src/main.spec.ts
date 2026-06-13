import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string): any => {
    if (key === 'ALLOWDED_ORIGINS')
      return 'http://localhost:3000, https://myhrms.com/';
    if (key === 'PORT') return 4000;
    return null;
  }),
};

const mockAppInstance = {
  get: jest.fn().mockReturnValue(mockConfigService),
  enableCors: jest.fn(),
  listen: jest.fn().mockResolvedValue(true),
};

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAppInstance)),
  },
}));

jest.mock('@nestjs/swagger', () => {
  const originalModule = jest.requireActual('@nestjs/swagger');

  return {
    ...originalModule,
    SwaggerModule: {
      createDocument: jest.fn().mockReturnValue({}),
      setup: jest.fn(),
    },
    DocumentBuilder: jest.fn().mockImplementation(() => ({
      setTitle: jest.fn().mockReturnThis(),
      setDescription: jest.fn().mockReturnThis(),
      setVersion: jest.fn().mockReturnThis(),
      addBearerAuth: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue({}),
    })),
  };
});

describe('Main Bootstrap Pipeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.isolateModules(() => {
      require('./main');
    });
  });

  it('should initialize the NestJS Application Factory with Winston Logger configurations', () => {
    expect(NestFactory.create).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        logger: expect.any(Object),
      }),
    );
  });

  it('should construct and initialize Swagger Documentation Module matching contracts', () => {
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(
      mockAppInstance,
      expect.any(Object),
    );
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api-docs',
      mockAppInstance,
      expect.any(Object),
    );
  });

  it('should fetch variables from ConfigService and listen on the configured system port', () => {
    expect(mockConfigService.get).toHaveBeenCalledWith('PORT');
    expect(mockAppInstance.listen).toHaveBeenCalledWith(4000);
  });

  describe('CORS Configuration Engine', () => {
    it('should evaluate and pass safe origin handlers cleanly when origin header is missing', () => {
      const corsOptionsCall = jest.mocked(mockAppInstance.enableCors).mock
        .calls[0][0];
      const originValidator = corsOptionsCall.origin as Function;
      const callbackSpy = jest.fn();
      originValidator(undefined, callbackSpy);
      expect(callbackSpy).toHaveBeenCalledWith(null, true);
    });

    it('should grant access to origins from environment variable values', () => {
      const corsOptionsCall = jest.mocked(mockAppInstance.enableCors).mock
        .calls[0][0];
      const originValidator = corsOptionsCall.origin as Function;
      const callbackSpy = jest.fn();
      originValidator('https://myhrms.com/', callbackSpy);
      expect(callbackSpy).toHaveBeenCalledWith(null, true);
    });

    it('should block unauthorized external origins with an explicit CORS Error', () => {
      const corsOptionsCall = jest.mocked(mockAppInstance.enableCors).mock
        .calls[0][0];
      const originValidator = corsOptionsCall.origin as Function;
      const callbackSpy = jest.fn();
      originValidator('http://random-website.com', callbackSpy);
      expect(callbackSpy).toHaveBeenCalledWith(expect.any(Error));
      expect(callbackSpy.mock.calls[0][0].message).toBe(
        'Blocked by CORS configuration',
      );
    });
  });
});

describe('Main Bootstrap Pipeline', () => {
  it('should default to port 3000 if the config service returns null or undefined variables', async () => {
    jest.clearAllMocks();
    jest.mocked(mockConfigService.get).mockImplementation(((key: string) => {
      if (key === 'ALLOWDED_ORIGINS') return undefined;
      if (key === 'PORT') return undefined;
      return null;
    }) as any);
    jest.isolateModules(() => {
      require('./main');
    });
    await new Promise((resolve) => process.nextTick(resolve));
    expect(mockAppInstance.listen).toHaveBeenCalledWith(3000);

    const corsOptionsCall = jest.mocked(mockAppInstance.enableCors).mock
      .calls[0][0];
    const originValidator = corsOptionsCall.origin as Function;
    const callbackSpy = jest.fn();

    originValidator('http://any-domain.com', callbackSpy);
    expect(callbackSpy).toHaveBeenCalledWith(expect.any(Error));
  });
});

import { NextFunction, Request, Response } from 'express';
import { MockApiServiceSchema, KeyValuePairs, DevKitConfig, MockApiDevKit } from '../api-mock-schema.model';
import { axiosApiCall } from './axios.service';
import { HttpException } from '../exceptions/http-exception';
import { customMockTest, getApiProxyRequestConfigFromSchema, getApiResponseConfig, isMockFlow } from './schema.service';
import { getMockFile } from './app.service';
import { environment } from '../../environments/environment';

/**
 *
 * @param querystrings
 * @returns
 */
export const getQueryString = (querystrings?: KeyValuePairs<string>): string => {
   let qs = '';
   for (const [index, key] of Object.keys(querystrings).entries()) {
      // if (key !== 'mock' && key !== 'test')
      qs = index == 0 ? `?${key}=${querystrings[key]}` : `${qs}&${key}=${querystrings[key]}`;
   }
   return qs;
};

export const getBodyDevkitRequest = (body: Partial<MockApiDevKit>): any => {
   let copiedBody = null;
   if (body && body.devkitConfig) {
      copiedBody = { ...body };
      delete copiedBody.devkitConfig;
   }
   return copiedBody ?? body;
};

/**
 *
 * @param request
 * @param response
 * @param next
 * @param data
 * @param config
 * @param projectName
 *
 * All request are MOCKED by default:
 * because this is a mock development server tool
 * There's anyway the possibility to call another external API
 * Check README
 */
export const getApiResponseData = <T>(
   request: Request,
   response: Response,
   next: NextFunction,
   data: T,
   config: MockApiServiceSchema,
   projectName: string
): void => {
   if (isMockFlow(request)) {
      consumeMockApi<T>(request, response, next, data, config, projectName);
   } else {
      consumeAxiosApi(request, response, next, config, projectName);
   }
};

export const getMockResponseData = (
   request: Request,
   serviceId: string,
   serviceIdTest: string[] | null,
   projectName: string,
   next: NextFunction
): Promise<any> => {
   let mockPath = `${process.cwd()}${environment.baseFilePath}projects/${projectName}/mock/${serviceId}.mock.json`;
   const testName = customMockTest(request);
   if ((testName && typeof testName === 'string') || (serviceIdTest && serviceIdTest.length > 0)) {
      const testNameFile = testName || serviceIdTest[0];
      mockPath = `${process.cwd()}${environment.baseFilePath}projects/${projectName}/mock/test/${testNameFile}.mock.json`;
      return getMockFile(mockPath, next);
   }
   return getMockFile(mockPath, next);
};

export const consumeMockApi = <T>(
   request: Request,
   response: Response,
   next: NextFunction,
   data: T,
   config: MockApiServiceSchema,
   projectName: string
): void => {
   const responseConfig = getApiResponseConfig(config);
   if (!responseConfig) {
      next(new HttpException(500, 'ERROR Mock response Config not provided.'));
   } else {
      const { status, delay, message, headers, file } = responseConfig;
      const forceError = status > 400 && status <= 510;
      setTimeout(async () => {
         try {
            if (forceError) {
               const errorMessage = message ?? `[${projectName}] ERROR forced by configuration with status ${status}`;
               next(new HttpException(status, errorMessage));
            } else {
               if (headers && Object.keys(headers).length > 0) {
                  Object.keys(headers).forEach((headerKey) => {
                     response.set(headerKey, headers[headerKey]);
                  });
               }
               const pathToTestFile = `${process.cwd()}${environment.baseAssetsPath}assets/images/test.png`;
               if (file) {
                  response.sendFile(pathToTestFile);
               } else {
                  response.status(status).send(data);
               }
            }
         } catch (err) {
            next(err);
         }
      }, delay);
   }
};

export const consumeAxiosApi = (request: Request, response: Response, next: NextFunction, config: MockApiServiceSchema, projectName: string): void => {
   const proxyRequest = getApiProxyRequestConfigFromSchema(config);
   if (!proxyRequest) {
      next(new HttpException(500, 'ERROR baseUrl OR endpoint not provided.'));
   } else {
      axiosApiCall(request, response, next, config, projectName);
   }
};

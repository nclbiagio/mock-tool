import { NextFunction, Request } from 'express';
import { HttpException } from '../../exceptions/http-exception';
import {
   MockApiSchema,
   MockApiServiceSchema,
   DefaultMockRequestConfig,
   ApiMockRespConfig,
   ApiProxyRequestConfig,
   MockApiDevKit,
} from '../api-mock-schema.model';

/**
 *
 * @param apiSchemaJson project API schema list
 * @param path specific project API endpoint
 * @returns
 */
export const getApiConfig = (apiSchemaJson: MockApiSchema, id: string, next: NextFunction): MockApiServiceSchema => {
   const getApiSchema = apiSchemaJson.services.find((service) => service.id === id);
   if (!getApiSchema) {
      const status = 404;
      const errorMessage = `ERROR ${status}: Config Schema not found`;
      next(new HttpException(status, errorMessage));
   }
   return getApiSchema;
};

/**
 *
 * @param apiServiceSchema
 * @returns
 */
export const getApiResponseConfig = (apiServiceSchema: MockApiServiceSchema): ApiMockRespConfig => {
   const { response } = apiServiceSchema;
   const status = response.status ?? 200;
   const delay = response.delay ?? 0;
   return { ...response, status, delay };
};

export const getApiRequestConfigFromSchema = (apiServiceSchema: MockApiServiceSchema): DefaultMockRequestConfig | null => apiServiceSchema.request || {};

/**
 *
 * @param apiServiceSchema
 * @returns
 * getApiProxyRequestConfig will be called only in case of proxy server ( proxy is active when mock is set to false)
 */
export const getApiProxyRequestConfigFromSchema = (apiServiceSchema: MockApiServiceSchema): ApiProxyRequestConfig | null => apiServiceSchema.proxy;

/**
 *
 * @param request
 * @returns
 * if you want to disable mock system specify body config MockApiDevKit "mock" to false
 */
export const isMockFlow = (request: Request<Partial<MockApiDevKit>>): boolean =>
   request.body.devkitConfig === undefined || request.body?.devkitConfig?.mock === undefined || request.body?.devkitConfig?.mock !== false;

/**
 * 
 * @param request 
 * @returns 
 * If you want to try different mock response based on use cases add "file" property to devkitConfig body request
 * es: devkitConfig.file:mock1
 * If isMockFlow and customMockTest valued then RESPONSE will change based on which test you want to perform
 */
export const customMockTest = (request: Request<Partial<MockApiDevKit>>): string | undefined => request.body?.devkitConfig?.file as string;

/**
 *
 * @param request
 * @returns
 * If isMockFlow is FALSE and isTestFlow is TRUE then REQUEST will change based on which test you want to perform (TO DO)
 * es: devkitConfig.file:request1
 * This last case can be used only in case of PROJECT FLOW TEST TOOL running
 */
export const isTestFlow = (request: Request<Partial<MockApiDevKit>>): boolean => request.body?.devkitConfig?.testFlowIsActive;

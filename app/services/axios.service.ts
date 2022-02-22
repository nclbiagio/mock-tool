import { NextFunction, Request, Response } from 'express';
import { MockApiServiceSchema, KeyValuePairs } from '../api-mock-schema.model';
import axios, { Method } from 'axios';
import { getApiRequestConfigFromSchema, getApiProxyRequestConfigFromSchema, isTestFlow } from './schema.service';
import { getQueryString, getBodyDevkitRequest } from './api.service';

const getBodyRequestOnTestFlow = (request: Request, bodyFromSchema: unknown) => {
   let body = request.body;
   if (isTestFlow(request)) {
      body = bodyFromSchema ?? {};
   }
   return body;
};

const getQueryStringRequestOnTestFlow = (request: Request, qsFromSchema: KeyValuePairs<string>) => {
   let qs = request.query as KeyValuePairs<string>;
   if (isTestFlow(request)) {
      qs = qsFromSchema ?? {};
   }
   return getQueryString(qs);
};

export const getAxiosRequest = ({ body, query, headers }: Request, config: MockApiServiceSchema) => {
   const { baseUrl, endpoint } = getApiProxyRequestConfigFromSchema(config);
   const method = config.verb as Method;
   const qs = getQueryString(query as KeyValuePairs<string>);
   const parsedBody = getBodyDevkitRequest(body);
   return {
      method,
      url: `${baseUrl}${endpoint}${qs}`,
      body: parsedBody,
      headers,
   };
};

/**
 *  NOT IMPLEMENTED (TO DO)
 * @param request
 * @param config
 * @returns
 */
export const getAxiosRequestOnTestFlow = (request: Request, config: MockApiServiceSchema, projectName: string) => {
   const { baseUrl, endpoint } = getApiProxyRequestConfigFromSchema(config);
   // if devkitConfig.testFlowIsActive is TRUE but devkitConfig.file is not set
   // then recover request values from schema file
   // otherwise read file specified if present inside requests folder
   // if no requests is present throw an error
   if (request.body?.devkitConfig?.file) {
      const folder = `${process.cwd()}/projects/${projectName}`;
      console.log(folder);
   }

   const { queryString, headers, body } = getApiRequestConfigFromSchema(config);
   const bodyData = getBodyRequestOnTestFlow(request, body);
   const qs = getQueryStringRequestOnTestFlow(request, queryString);
   const getHeaders = headers ?? {};
   const method = config.verb as Method;
   return {
      method,
      url: `${baseUrl}${endpoint}${qs}`,
      body: bodyData,
      headers: { ...getHeaders },
   };
};

export const axiosApiCall = async (
   request: Request,
   response: Response,
   next: NextFunction,
   config: MockApiServiceSchema,
   projectName: string
): Promise<any> => {
   const axiosConfig = getAxiosRequest(request, config);
   // if test flow is active => devkitConfig not undefined and testFlowIsActive has been set to true
   // then call function getAxiosRequestOnTestFlow()
   try {
      const { data } = await axios(axiosConfig);
      response.status(200).send(data);
   } catch (err) {
      next(err);
   }
};

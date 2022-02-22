import { KeyValueList, KeyValuePairs, MockApiSchema, MockApiServiceSchema } from '../api-mock-schema.model';
import fs from 'fs';
import yaml from 'js-yaml';
import { ApiRequestConfig } from '../api-schema.model';
import { NextFunction } from 'express';

export const getJsonYmlFile = (filename: string, project: string): any => {
   // Get document, or throw exception on error
   try {
      const ymlPath = `${process.cwd()}/projects/${project}/yml/${filename}.yml`;
      const doc = yaml.load(fs.readFileSync(ymlPath, 'utf8'));
      return doc;
   } catch (e) {
      console.log(e);
   }
};

export const getIdFromYmlPath = (ymlPath: string, verb: string): string => {
   let getPath = ymlPath.split('/');
   getPath = getPath.map((resource) => {
      if (resource.includes('{')) {
         resource = resource.replace('{', '');
      }
      if (resource.includes('}')) {
         resource = resource.replace('}', '');
      }
      resource = `${resource.charAt(0).toUpperCase()}${resource.substring(1)}`;
      return resource;
   });
   const id = getPath.join('');
   return `${verb}${id}`;
};

export const getRequest = (ymlSchema: any, ymlPath: string, verb: string): ApiRequestConfig<unknown> => {
   const ymlParameters = ymlSchema.paths[ymlPath][verb].parameters;
   const ymlRequestBody = ymlSchema.paths[ymlPath][verb].requestBody;
   let schemaParameters = {};
   let schemaBody = {};
   if (ymlParameters) {
      schemaParameters = getYmlSchemaParameters(ymlParameters, ymlSchema);
   }
   if (ymlRequestBody && ymlRequestBody.content) {
      schemaBody = getRequestBody(ymlRequestBody, ymlSchema);
   }
   return { ...schemaParameters, ...schemaBody };
};

export const getYmlSchemaParameters = (ymlParameters: any, ymlSchema?: any): ApiRequestConfig<unknown> => {
   const pathParams: KeyValueList[] = [];
   let queryString: KeyValuePairs<string> | null = {};
   let headers: KeyValuePairs<string> = {};
   ymlParameters.forEach((param: any) => {
      if (param.in === 'query') {
         queryString = {
            ...queryString,
            [param.name]: param.example || '',
         };
      }
      if (param.in === 'path') {
         pathParams.push({
            key: param.name,
            value: param.example || '',
         });
      }
      if (param.in === 'header') {
         headers = {
            ...queryString,
            [param.name]: param.example || '',
         };
      }
   });
   return { pathParams, queryString, headers };
};

export const recursiveYmlRefSearch = (searchRef: string, ymlSchema: any, bodyObject: any, bodyObjectPathAggegator: string) => {
   let body = {
      ...bodyObject,
   };
   let bodyObjectPathAggegatorCtx = `${bodyObjectPathAggegator}`;
   const components = ymlSchema.components.schemas;
   if (components[searchRef] && components[searchRef].properties) {
      const searchRefComponentProps = components[searchRef].properties;
      Object.keys(searchRefComponentProps).forEach((property) => {
         bodyObjectPathAggegatorCtx = `${bodyObjectPathAggegator}.${property}`;
         if (searchRefComponentProps[property]['$ref']) {
            const reference = searchRefComponentProps[property]['$ref'].split('/');
            const ref = reference[reference.length - 1];
            const getUpdatedBody = recursiveYmlRefSearch(ref, ymlSchema, body, bodyObjectPathAggegatorCtx);
            body = {
               ...getUpdatedBody,
            };
         } else {
            const paths = bodyObjectPathAggegatorCtx.split('.').filter((element) => element !== '');
            paths.reduce(function (dir, value, currentIndex, sourceArray) {
               if (currentIndex < sourceArray.length - 1) {
                  if (!(dir as any)[value]) {
                     return ((dir as any)[value] = {});
                  } else {
                     return dir[value];
                  }
               } else {
                  return ((dir as any)[value] = searchRefComponentProps[value].example);
               }
            }, body);
         }
      });
   }
   return body;
};

export const getRequestBody = (ymlRequestBody: any, ymlSchema: any) => {
   let bodyObject = {};
   if (ymlRequestBody.content && ymlRequestBody.content['application/json']) {
      const ymlRequestBodySchema = ymlRequestBody.content['application/json'].schema;
      if (ymlRequestBodySchema['$ref']) {
         const componentRef = ymlRequestBodySchema['$ref'].split('/');
         const component = componentRef[componentRef.length - 1];
         const updatedBodyObject = recursiveYmlRefSearch(component, ymlSchema, bodyObject, '');
         bodyObject = {
            ...bodyObject,
            ...updatedBodyObject,
         };
      }
      if (ymlRequestBodySchema.properties) {
         const bodyProps = Object.keys(ymlRequestBodySchema.properties);
         bodyProps.forEach((prop) => {
            bodyObject = {
               ...bodyObject,
               [prop]: ymlRequestBodySchema.properties[prop].example,
            };
         });
      }
      if (ymlRequestBodySchema.type === 'Array' && ymlRequestBodySchema.items) {
      }
   }
   return { body: bodyObject };
};

export const getSchemaServices = async (project: string, path: string, next: NextFunction): Promise<MockApiSchema> => {
   try {
      const ymlSchema = await getJsonYmlFile('openAPI', project);
      const schema: MockApiSchema = { project, path, services: [] };
      if (ymlSchema) {
         Object.keys(ymlSchema.paths).forEach((ymlPath) => {
            const verbs = Object.keys(ymlSchema.paths[ymlPath]);
            verbs.forEach((verb) => {
               const status = Object.keys(ymlSchema.paths[ymlPath][verb].responses)[0];
               const id = getIdFromYmlPath(ymlPath, verb);
               const request = getRequest(ymlSchema, ymlPath, verb);
               const serviceSchema: MockApiServiceSchema = {
                  id,
                  path: ymlPath,
                  verb: verb.toUpperCase(),
                  request,
                  response: {
                     status: Number(status),
                     delay: 500,
                  },
               };
               schema.services.push(serviceSchema);
            });
         });
      }
      return schema;
   } catch (error) {
      next(error);
   }
};

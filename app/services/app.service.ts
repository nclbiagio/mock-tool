import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { MockApiSchema, MockApiServiceSchema, DefaultMockRequestConfig, KeyValueList, ProjectsList, Project } from '../api-mock-schema.model';
import { NodeProcessException } from '../../exceptions/node-process-exception';
import { getApiResponseData, getMockResponseData } from './api.service';
import { buildServicesSchema } from './data-builder.service';

export const getApiSchemaPath = (projectName: string): string => {
   return `${process.cwd()}/projects/${projectName}/${projectName}-api.schema.json`;
};

export const getFile = (filename: string, encoding?: BufferEncoding): Promise<any> => {
   const setEncoding = encoding ?? 'utf8';
   return new Promise(function (resolve, reject) {
      fs.readFile(filename, setEncoding, (err, data) => {
         if (err) {
            reject({ status: 404, err, message: `ERROR reading file ${filename}` });
         } else {
            const response = JSON.parse(data);
            resolve(response);
         }
      });
   });
};

export const getMockFile = async (filename: string, next: NextFunction) => {
   try {
      const file = await getFile(filename);
      return file;
   } catch (error) {
      next(error);
   }
};

export const getProjectApiSchema = (projectName: string): Promise<MockApiSchema> => {
   const filename = getApiSchemaPath(projectName);
   return getFile(filename);
};

export const getProjectsFile = async (): Promise<Project[]> => {
   const appProjects = await getFile(`${process.cwd()}/projects/projects.json`);
   const { projects } = appProjects as ProjectsList;
   return projects;
};

export const getProjectsSchema = async () => {
   const appProjects = await getProjectsFile();
   const projectPromises = appProjects.reduce((accumulator: Promise<MockApiSchema>[], currentProject: Project) => {
      accumulator.push(getProjectApiSchema(currentProject.id));
      return accumulator;
   }, []);
   return Promise.all(projectPromises);
};

export const getPath = (path: string) => {
   if (/{([^}]+)}/g.test(path)) {
      return path.replace(/{([^}]+)}/g, (_, elem) => {
         return `:${elem}`;
      });
   }
   return path;
};

/**
 *
 * @param router
 * @param projectName must match mock folder name
 * @returns
 */
export const generateRouterControllersForProject = async (router: Router, projectName: string): Promise<Router> => {
   try {
      // retrieve projectName-api.schema.json file and generate routes forEach service api
      // eslint-disable-next-line prefer-const
      let schema = await getProjectApiSchema(projectName);
      schema = await buildServicesSchema(schema, projectName);

      schema.services.forEach((service) => {
         const path = getPath(service.path);
         if (service.verb === 'GET') {
            // Public API endpoints
            router.get(`${path}`, async (request: Request, response: Response, next: NextFunction) => {
               await setController(request, response, next, projectName, service);
            });
         }
         if (service.verb === 'POST') {
            router.post(`${path}`, async (request: Request, response: Response, next: NextFunction) => {
               await setController(request, response, next, projectName, service);
            });
         }
      });
      return router;
   } catch (error) {
      throw new NodeProcessException(500, error.message, 'ERR');
   }
};

export const setController = async (request: Request, response: Response, next: NextFunction, projectName: string, service: MockApiServiceSchema) => {
   try {
      const mockData: unknown = await getMockResponseData(request, service.id, projectName, next);
      getApiResponseData<unknown>(request, response, next, mockData, service, projectName);
   } catch (error) {
      next(error);
   }
};

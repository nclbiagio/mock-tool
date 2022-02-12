import { Request, Response, NextFunction, Router } from 'express';
import { getApiResponseData } from './services/api.service';
import { MockApiSchema, MockApiServiceSchema } from './api-mock-schema.model';
import { getProjectsSchema } from './services/app.service';
import { getApiConfig } from './services/schema.service';
import { buildServicesSchema } from './services/data-builder.service';
import { getJsonYmlFile } from './services/yaml.service';

export const setAppControllers = (router: Router, schema: MockApiSchema, project: string, basepath: string): Router => {
   /**
    * Controller Definitions
    */
   let warning = '';
   if (basepath === '') {
      warning = `Basepath not defined. Maybe because of is not necessary. Anyway only to see the list of services will be assigned a default ones [ /${project}/v1 ]`;
      basepath = `/${project}/v1`;
   }

   const ymlDevKitApi = '/mock-tool/api/v1/get-schema-from-yaml';

   router.get('/', async (request: Request, response: Response) => {
      try {
         response.status(200).send({ status: 'SUCCESS', warning, project, basepath, ymlDevKitApi });
      } catch (e) {
         response.status(500).send({ code: 'ERR', message: e.message });
      }
   });

   router.get(ymlDevKitApi, async (request: Request, response: Response) => {
      try {
         const ymlSchema = await getJsonYmlFile('openAPI', project);
         const schema = { services: [] } as any;
         if (ymlSchema) {
            Object.keys(ymlSchema.paths).forEach((ymlPath) => {
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
               const verb = Object.keys(ymlSchema.paths[ymlPath])[0];
               const status = Object.keys(ymlSchema.paths[ymlPath][verb].responses)[0];
               schema.services.push({
                  id: `${verb}${id}`,
                  path: ymlPath,
                  verb: verb.toUpperCase(),
                  response: {
                     status: Number(status),
                     delay: 500,
                  },
               });
            });
         }

         response.status(200).send({ project, path: basepath, services: schema.services });
      } catch (e) {
         response.status(500).send({ code: 'ERR', message: e.message });
      }
   });

   // Public API endpoints
   router.get(basepath, async (request: Request, response: Response, next: NextFunction) => {
      const apiConfig: MockApiServiceSchema = getApiConfig(schema, 'getAppApi', next);
      try {
         const projectsSchema = await getProjectsSchema(); //get all projects defined
         const getActiveProjectSchema = projectsSchema.filter((schema: MockApiSchema) => schema.project === project);
         // eslint-disable-next-line prefer-const
         let activeProjectSchema = getActiveProjectSchema[0] as MockApiSchema;

         activeProjectSchema = await buildServicesSchema(activeProjectSchema, project);

         const mockResponse = [activeProjectSchema];

         getApiResponseData<unknown>(request, response, next, mockResponse, apiConfig, project);
      } catch (e) {
         response.status(500).send({ code: 'ERR02', message: e.message });
      }
   });

   // Protected API endpoints

   /**
    * configRouter.use(checkJwt) => checkJwt must be an authorization middleware
    */
   return router;
};

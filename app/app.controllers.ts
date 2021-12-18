import { Request, Response, NextFunction, Router } from 'express';
import { getApiResponseData } from './services/api.service';
import { MockApiSchema, MockApiServiceSchema } from './api-mock-schema.model';
import { getProjectsSchema } from './services/app.service';
import { getApiConfig } from './services/schema.service';
import { buildServicesSchema } from './services/data-builder.service';

export const setAppControllers = (router: Router, schema: MockApiSchema, project: string, basepath: string): Router => {
   /**
    * Controller Definitions
    */

   router.get('/', async (request: Request, response: Response) => {
      try {
         response.status(200).send({ status: 'SUCCESS', project, basepath });
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

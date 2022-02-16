import { Request, Response, NextFunction, Router } from 'express';
import { getApiResponseData } from './services/api.service';
import { MockApiSchema, MockApiServiceSchema } from './api-mock-schema.model';
import { getProjectsSchema } from './services/app.service';
import { getApiConfig } from './services/schema.service';
import { buildServicesSchema } from './services/data-builder.service';
import { getIdFromYmlPath, getJsonYmlFile } from './services/yaml.service';

export const setAppControllers = (router: Router, schema: MockApiSchema, project: string, basepath: string): Router => {
   const mockToolApi = '/mock-tool/api';
   const getSchemaYaml = `${mockToolApi}/get-schema-from-yaml`;
   const getJsonFromYml = `${mockToolApi}/get-json-from-yaml`;
   /**
    * Controller Definitions
    */
   const warnings: string[] = [];
   if (basepath === '') {
      warnings.push(`Basepath not defined in projects.json, /${project}/v1 assinged by default`);
      basepath = `/${project}/v1`;
   }

   router.get('/', async (request: Request, response: Response) => {
      try {
         response.status(200).send({ status: 'SUCCESS', warnings, project, basepath, getSchemaYaml, getJsonFromYml });
      } catch (e) {
         response.status(500).send({ code: 'ERR', message: e.message });
      }
   });

   router.get(`${getJsonFromYml}`, async (request: Request, response: Response) => {
      try {
         const ymlSchema = await getJsonYmlFile('openAPI', project);
         response.status(200).send({ ymlSchema });
      } catch (e) {
         response.status(500).send({ code: 'ERR', message: e.message });
      }
   });

   router.get(`${getSchemaYaml}`, async (request: Request, response: Response) => {
      try {
         const ymlSchema = await getJsonYmlFile('openAPI', project);
         const schema = { services: [] } as any;
         if (ymlSchema) {
            Object.keys(ymlSchema.paths).forEach((ymlPath) => {
               const verb = Object.keys(ymlSchema.paths[ymlPath])[0];
               const status = Object.keys(ymlSchema.paths[ymlPath][verb].responses)[0];
               const id = getIdFromYmlPath(ymlPath, verb);
               schema.services.push({
                  id,
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

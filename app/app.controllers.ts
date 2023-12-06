import * as child from 'child_process';
import { Request, Response, NextFunction, Router } from 'express';
import { getApiResponseData } from './services/api.service';
import { MockApiSchema, MockApiServiceSchema } from './api-mock-schema.model';
import { getProjectsSchema } from './services/app.service';
import { getApiConfig } from './services/schema.service';
import { buildServicesSchema } from './services/data-builder.service';
import { getJsonYmlFile, getSchemaServices } from './services/yaml.service';
import { AppStoreService } from './services/app-store.service';
import { getFile, getMockPath } from './utils/utils.service';
import { environment } from '../environments/environment';

export const setAppControllers = (router: Router, schema: MockApiSchema, project: string, basepath: string): Router => {
   /**
    * Controller Definitions
    */
   const warnings: string[] = [];
   if (basepath === '') {
      warnings.push(`Basepath not defined in projects.json, /${project}/v1 assinged by default`);
      basepath = `/${project}/v1`;
   }

   router.get(`/`, async (request: Request, response: Response) => {
      try {
         const appService = AppStoreService.getInstance();
         appService.appConfig = {
            ...appService.appConfig,
            status: 'SUCCESS',
            warnings,
            project,
            basepath,
            environment: 'dev',
            stack: appService.appRouterStack,
         };
         response.status(200).send(appService.appConfig);
      } catch (e) {
         response.status(500).send({ code: 'ERR', message: e.message });
      }
   });

   router.get(`/mock/api`, async (request: Request, response: Response, next: NextFunction) => {
      try {
         const projectsSchema = await getProjectsSchema(); //get all projects defined
         const getActiveProjectSchema = projectsSchema.filter((schema: MockApiSchema) => schema.project === project);
         let activeProjectSchema = getActiveProjectSchema[0] as MockApiSchema;

         activeProjectSchema = await buildServicesSchema(activeProjectSchema, project);

         const mockResponse = [activeProjectSchema];

         response.status(200).send(mockResponse);
      } catch (e) {
         response.status(500).send({ code: 'ERR02', message: e.message });
      }
   });

   router.get(`/mock/api/get-json-from-yaml`, async (request: Request, response: Response) => {
      try {
         const ymlSchema = await getJsonYmlFile('openAPI', project);
         response.status(200).send({ ymlSchema });
      } catch (e) {
         response.status(500).send({ code: 'ERR', message: e.message });
      }
   });

   router.get(`/mock/api/get-schema-from-yaml`, async (request: Request, response: Response, next: NextFunction) => {
      try {
         const schema = await getSchemaServices(project, basepath, next);
         response.status(200).send(schema);
      } catch (e) {
         response.status(500).send({ code: 'ERR', message: e.message });
      }
   });

   router.get(`/mock/api/reboot`, async (request: Request, response: Response) => {
      try {
         setTimeout(function () {
            // Listen for the 'exit' event.
            // This is emitted when our app exits.
            process.on('exit', function () {
               //  Resolve the `child_process` module, and `spawn`
               //  a new process.
               //  The `child_process` module lets us
               //  access OS functionalities by running any bash command.`.
               child.spawn(process.argv.shift(), process.argv, {
                  cwd: process.cwd(),
                  detached: true,
                  stdio: 'inherit',
               });
            });
            response.status(202);
            process.exit();
         }, 1000);
      } catch (e) {
         response.status(500).send({ code: 'ERR', message: e.message });
      }
   });

   router.get(`/mock/api/:id`, async (request: Request, response: Response) => {
      try {
         const mockPath = getMockPath(request.params.id);
         const file = await getFile(mockPath);
         response.status(200).send(file);
      } catch (e) {
         response.status(500).send({ code: 'ERR', message: e.message });
      }
   });

   return router;
};

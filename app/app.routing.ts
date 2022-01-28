import { Application, Router } from 'express';
// import { createProxyMiddleware, Filter, Options, RequestHandler } from 'http-proxy-middleware';
import * as apiAppSchema from './app-api.schema.json';
import { setAppControllers } from './app.controllers';
import { NodeProcessException } from '../exceptions/node-process-exception';
import { getProjectRouter } from './services/project.service';
import { getProjectsFile } from './services/app.service';
import { Project } from './api-mock-schema.model';
import { setTestSuiteControllers } from './test-suite/test-suite.controllers';

/**
 * Projects routing
 */

export const appRouting = async (app: Application, project: string | null): Promise<boolean> => {
   try {
      if (!project) {
         const error = 'PROJECT not defined into .env file';
         throw new NodeProcessException(500, error, `ERROR: ${error}`, error);
      }
      const getProjectsConfigs = await getProjectsFile();
      let pojectConfig: Project = null;
      /**
       * PROJECTS API Routers Definition
       */

      getProjectsConfigs.forEach((projectConf) => {
         if (projectConf.id === project) {
            pojectConfig = { ...projectConf };
         }
      });

      const getActiveRouterConf = await getProjectRouter(pojectConfig.id, pojectConfig.path);

      const basePath = `${getActiveRouterConf.path}`;
      console.log('BASE_PATH => ', basePath);

      /**
       *  Http-only Headers custom
       * TO DO get info from projects json
       */
      if (project === 'example') {
         app.use(function (req, res, next) {
            req.headers['Host'] = '';
            req.headers['Cookie'] = '';
            return next();
         });
      }

      /**
       * APP and API Router Definition
       */
      const appRouter = Router();
      const router = setAppControllers(appRouter, apiAppSchema, project, basePath);
      app.use('/', router);
      /**
       * PROJECTS API Routers Definition
       */

      if (getActiveRouterConf) {
         app.use(getActiveRouterConf.path, getActiveRouterConf.router);
      }

      /**
       * TEST SUITE API Routers Definition
       */
      /* const testSuiteRouter = Router();
      const testSuiteRouterControllers = setTestSuiteControllers(testSuiteRouter);
      app.use('/test-suite/v1/', testSuiteRouterControllers); */

      return true;
   } catch (error) {
      console.log(error);
      return false;
      //throw new NodeProcessException(500, error.message, `ERROR: ${error.message}`, error);
   }
};

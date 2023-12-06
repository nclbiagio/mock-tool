import { Router } from 'express';
import { NodeProcessException } from '../exceptions/node-process-exception';
import { generateRouterControllersForProject } from '../../app/services/app.service';

export const setProjectControllers = (router: Router, project: string): Promise<Router> => {
   return generateRouterControllersForProject(router, project);
};

export const getProjectRouter = async (
   project: string,
   path: string
): Promise<{
   path: string;
   router: Router;
}> => {
   /**
    * Router Definition
    */
   try {
      const router = await setProjectControllers(Router(), project);
      return {
         path,
         router,
      };
   } catch (error) {
      //console.log(error.message);
      throw new NodeProcessException(500, error.message, `${project} ROUTING: ${error.message}`, error);
   }
};

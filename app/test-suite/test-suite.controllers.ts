import { Request, Response, Router } from 'express';
import { TestSuiteModelApiCheck } from './test-suite.model';

export const setTestSuiteControllers = (router: Router): Router => {
   /**
    * Controller Definitions
    */

   router.get('/', async (request: Request, response: Response) => {
      try {
         const model: TestSuiteModelApiCheck = { request: 'TO BE DEFINED' };
         response.status(200).send({ status: 'SUCCESS', msg: 'TEST SUITE is active', model });
      } catch (e) {
         response.status(500).send({ code: 'ERR', message: e.message });
      }
   });

   return router;
};

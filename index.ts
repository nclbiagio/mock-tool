import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import * as dotenv from 'dotenv';
/**
 * Middlewares
 */
import { morganMiddleware } from './app/middlewares/morgan.middleware';
import { errorHandler } from './app/middlewares/error.middleware';
import { notFoundHandler } from './app/middlewares/not-found.middleware';
/**
 * App routing
 */
import { appRouting } from './app/app.routing';
import { AppStoreService } from './app/services/app-store.service';
import { getRoutesConfig } from './app/utils/utils.service';

dotenv.config();

if (!process.env.PORT) {
   console.log('Env file not set! App Exit!');
   process.exit(1);
}
/**
 * App Variables
 */
const PORT: number = parseInt(process.env.PORT as string, 10) || 7000;
const HOST = process.env.HOST || 'localhost';
const PROJECT = process.env.PROJECT || null;

const appService = AppStoreService.getInstance();
appService.appConfig = { host: HOST, port: PORT };

const app: Application = express();
app.use(helmet());
app.use(cors());
/**
 *  App Configuration
 */

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Logging
app.use(morganMiddleware);

app.use((req, res, next) => {
   // List of headers that are to be exposed to the XHR front-end object
   res.header('Access-Control-Expose-Headers', '*');
   next();
});

/********************************
 * START ROUTING
 ********************************/
appRouting(app, PROJECT).then((result: boolean) => {
   console.log(`App routing Set: [${result}]`);
   app.use(errorHandler);
   app.use(notFoundHandler);
   if (result) {
      console.log('stack is set');
      appService.appRouterStack = getRoutesConfig(app._router.stack);
   }
});
/********************************
 * END ROUTING
 ********************************/

// Start the Proxy
app.listen(PORT, HOST, () => {
   console.log(`Starting Proxy at http://${HOST}:${PORT}`);
});

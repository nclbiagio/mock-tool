import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import * as dotenv from 'dotenv';
/**
 * Middlewares
 */
import { morganMiddleware } from './middlewares/morgan.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
/**
 * App routing
 */
import { appRouting } from './app/app.routing';

dotenv.config();

if (!process.env.PORT) {
  process.exit(1);
}
/**
 * App Variables
 */
const PORT: number = parseInt(process.env.PORT as string, 10) || 7000;
const HOST = process.env.HOST || 'localhost';
const PROJECT = process.env.PROJECT || null;

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

/********************************
 * START ROUTING
 ********************************/
appRouting(app, PROJECT).then((result: boolean) => {
  console.log(`App routing Set: [${result}]`);
  app.use(errorHandler);
  app.use(notFoundHandler);
});
/********************************
 * END ROUTING
 ********************************/

// Start the Proxy
app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at http://${HOST}:${PORT}`);
});

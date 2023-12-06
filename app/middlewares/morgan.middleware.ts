import morgan, { StreamOptions } from 'morgan'; // log requests to the console
import { Logger } from '../utils/logger';

// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream: StreamOptions = {
   // Use the http severity
   write: (message) => Logger.http(message),
};

const skip = () => {
   const env = process.env.NODE_ENV || 'dev';
   return env !== 'dev';
};

export const morganMiddleware = morgan(':method :url :status :res[content-length] - :response-time ms', { stream });

import fs from 'fs';
import { AppConfig, AppStoreService } from '../services/app-store.service';
import { environment } from '../../environments/environment';

export const getMockPath = (id: string, feature?: string) => {
   const appService = AppStoreService.getInstance();
   const projectName = appService.appConfig.project;
   `${process.cwd()}${environment.baseFilePath}projects/${projectName}/mock/${id}.mock.json`;
   if (feature) {
      return `${process.cwd()}${environment.baseFilePath}projects/${projectName}/mock/${feature}/${id}.mock.json`;
   }
   return `${process.cwd()}${environment.baseFilePath}projects/${projectName}/mock/${id}.mock.json`;
};

export const getFile = (filename: string, encoding?: BufferEncoding): Promise<any> => {
   const setEncoding = encoding ?? 'utf8';
   return new Promise(function (resolve, reject) {
      fs.readFile(filename, setEncoding, (err, data) => {
         if (err) {
            reject({ status: 404, err, message: `ERROR reading file ${filename}` });
         } else {
            let response = null;
            if (data) {
               response = JSON.parse(data);
            }
            resolve(response);
         }
      });
   });
};

export const getRoutesConfig = (routerStack: any) => {
   let routesAcl: any[] = [];
   if (routerStack) {
      let routes: string[] = [];
      routerStack.forEach(function (layer: any) {
         routes = routes.concat(getRoutesOfLayer('', layer));
      });
      routesAcl = getRouteForClient(routes);
   }
   routesAcl = routesAcl.filter((r) => r.path.includes('/mock'));
   return routesAcl;
};

export const splitRoutes = (thing: any): string => {
   if (typeof thing === 'string') {
      return thing;
   } else if (thing.fast_slash) {
      return '';
   } else {
      const match = thing
         .toString()
         .replace('\\/?', '')
         .replace('(?=\\/|$)', '$')
         // eslint-disable-next-line no-useless-escape
         .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//);
      return match ? match[1].replace(/\\(.)/g, '$1') : '<complex:' + thing.toString() + '>';
   }
};

export const getRoutesOfLayer = (path: string, layer: any): string[] => {
   if (layer.method) {
      return [`${layer.method.toUpperCase()}@${path}`];
   } else if (layer.route) {
      return getRoutesOfLayer(path + splitRoutes(layer.route.path), layer.route.stack[0]);
   } else if (layer.name === 'router' && layer.handle.stack) {
      let routes: string[] = [];

      layer.handle.stack.forEach(function (stackItem: any) {
         routes = routes.concat(getRoutesOfLayer(path + splitRoutes(layer.regexp), stackItem));
      });

      return routes;
   }

   return [];
};

export const getIdFromRoute = (path: string, verb: string): string => {
   let getPath = path.split('/');
   getPath = getPath.map((resource) => {
      if (resource.includes(':')) {
         resource = resource.replace(':', '');
      }
      resource = `${resource.charAt(0).toUpperCase()}${resource.substring(1)}`;
      return resource;
   });
   const id = getPath.join('');
   return `${verb.toLocaleLowerCase()}${id}`;
};

export const getPathFromRoute = (path: string): string => {
   let getPath = path.split('/');
   getPath = getPath.map((resource) => {
      if (resource.includes(':')) {
         resource = resource.replace(':', '{');
         resource = `${resource}}`;
      }
      return resource;
   });
   const finalPath = getPath.join('/');
   return finalPath;
};

export const getRouteForClient = (routes: string[]) => {
   const routesForClient = routes.map((route) => {
      const verb = route.split('@')[0];
      const id = getIdFromRoute(route.split('@')[1], verb);
      const path = getPathFromRoute(route.split('@')[1]);
      return {
         id,
         path,
         verb,
      };
   });
   return routesForClient;
};

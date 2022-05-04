import { MockApiSchema, MockApiServiceSchema } from '../api-mock-schema.model';
import fs from 'fs';
import yaml from 'js-yaml';
import { NextFunction } from 'express';

export const getJsonYmlFile = (filename: string, project: string): any => {
   // Get document, or throw exception on error
   try {
      const ymlPath = `${process.cwd()}/projects/${project}/yml/${filename}.yml`;
      const doc = yaml.load(fs.readFileSync(ymlPath, 'utf8'));
      return doc;
   } catch (e) {
      console.log(e);
   }
};

export const getIdFromYmlPath = (ymlPath: string, verb: string): string => {
   let getPath = ymlPath.split('/');
   getPath = getPath.map((resource) => {
      if (resource.includes('{')) {
         resource = resource.replace('{', '');
      }
      if (resource.includes('}')) {
         resource = resource.replace('}', '');
      }
      resource = `${resource.charAt(0).toUpperCase()}${resource.substring(1)}`;
      return resource;
   });
   const id = getPath.join('');
   return `${verb}${id}`;
};

export const getSchemaServices = async (project: string, path: string, next: NextFunction): Promise<MockApiSchema> => {
   try {
      const ymlSchema = await getJsonYmlFile('openAPI', project);
      const schema: MockApiSchema = { project, path, services: [] };
      if (ymlSchema) {
         Object.keys(ymlSchema.paths).forEach((ymlPath) => {
            const verbs = Object.keys(ymlSchema.paths[ymlPath]);
            verbs.forEach((verb) => {
               const status = Object.keys(ymlSchema.paths[ymlPath][verb].responses)[0];
               const id = getIdFromYmlPath(ymlPath, verb);
               const serviceSchema: MockApiServiceSchema = {
                  id,
                  path: ymlPath,
                  verb: verb.toUpperCase(),
                  request: {},
                  response: {
                     status: Number(status),
                     delay: 500,
                  },
               };
               schema.services.push(serviceSchema);
            });
         });
      }
      return schema;
   } catch (error) {
      next(error);
   }
};

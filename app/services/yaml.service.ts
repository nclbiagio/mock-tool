import fs from 'fs';
import yaml from 'js-yaml';

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

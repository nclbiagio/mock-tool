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

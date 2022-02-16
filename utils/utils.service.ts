import fs from 'fs';

export const getMockPath = (projectName: string, feature: string, serviceId: string) => {
   if (feature) {
      return `projects/${projectName}/mock/${feature}/${serviceId}.json`;
   }
   return `projects/${projectName}/mock/${serviceId}.json`;
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

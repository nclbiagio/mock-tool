import { MockApiSchema, MockApiServiceSchema, DefaultMockRequestConfig } from '../app/api-mock-schema.model';

export const getMockPath = (projectName: string, feature: string, serviceId: string) => {
   if (feature) {
      return `projects/${projectName}/mock/${feature}/${serviceId}.json`;
   }
   return `projects/${projectName}/mock/${serviceId}.json`;
};

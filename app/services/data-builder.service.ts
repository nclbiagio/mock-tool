import { NodeProcessException } from '../../exceptions/node-process-exception';
import { MockApiSchema, MockApiServiceSchema, DefaultMockRequestConfig } from '../api-mock-schema.model';
import { getFile } from '../../utils/utils.service';

export const getRequestsFromFile = async (schema: MockApiSchema, projectName: string) => {
   const requestPromises = schema.services.reduce((accumulator: Promise<DefaultMockRequestConfig>[], service: MockApiServiceSchema) => {
      let folder = `${process.cwd()}/projects/${projectName}`;
      if (service.request && service.request.id) {
         folder = `${folder}/requests/${service.request.id}.request.json`;
         accumulator.push(getFile(folder));
      }
      return accumulator;
   }, []);
   return Promise.all(requestPromises);
};

export const getServicesFromFile = (schema: MockApiSchema, projectName: string) => {
   const servicePromises = schema.services.reduce((accumulator: Promise<MockApiServiceSchema>[], service: MockApiServiceSchema) => {
      let folder = `${process.cwd()}/projects/${projectName}`;
      if (service.id && (!service.path || !service.verb)) {
         folder = `${folder}/services/${service.id}.service.json`;
         accumulator.push(getFile(folder));
      }
      return accumulator;
   }, []);
   return Promise.all(servicePromises);
};

export const getMappedRequestSchemaService = (schemaServices: MockApiServiceSchema[], requests: DefaultMockRequestConfig[]) => {
   return schemaServices.map((service) => {
      if (service.request && service.request.id) {
         const getRequest = requests.find((request) => request.id === service.request.id);
         if (getRequest) {
            return {
               ...service,
               request: {
                  ...service.request,
                  ...getRequest,
               },
            };
         }
         return service;
      }
      return service;
   });
};

export const getMappedSchemaService = (schemaServices: Partial<MockApiServiceSchema[]>, servicesFromFile: MockApiServiceSchema[]) => {
   return schemaServices.map((service) => {
      if (service.id && (!service.path || !service.verb)) {
         const getService = servicesFromFile.find((serviceFromFile) => serviceFromFile.id === service.id);
         if (getService) {
            return getService;
         } else {
            throw new NodeProcessException(404, 'Services From File not Found', 'ERR');
         }
      }
      return service;
   });
};

export const buildServicesSchema = async (schema: MockApiSchema, projectName: string): Promise<MockApiSchema> => {
   let buildedSchema = { ...schema };
   let servicesListMapped = [...buildedSchema.services];
   const services = await getServicesFromFile(buildedSchema, projectName);
   if (services && services.length > 0) {
      servicesListMapped = getMappedSchemaService(buildedSchema.services, services as MockApiServiceSchema[]);
      buildedSchema = {
         ...buildedSchema,
         services: servicesListMapped,
      };
   }

   const requests = await getRequestsFromFile(buildedSchema, projectName);
   if (requests && requests.length > 0) {
      servicesListMapped = getMappedRequestSchemaService(servicesListMapped, requests as DefaultMockRequestConfig[]);
      buildedSchema = {
         ...buildedSchema,
         services: servicesListMapped,
      };
   }
   return buildedSchema;
};

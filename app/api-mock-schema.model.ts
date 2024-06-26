import { ApiSchema, ApiServiceSchema, ApiRequestConfig } from './api-schema.model';

export interface MockApiDevKit {
   devkitConfig?: DevKitConfig;
}

export interface DevKitConfig {
   mock?: boolean;
   file?: string;
   testFlowIsActive?: boolean;
}

export interface MockApiSchema extends ApiSchema {
   services: MockApiServiceSchema[];
}

export interface DefaultMockRequestConfig extends ApiRequestConfig<unknown> {
   //used to retrieve request from files in [projectName]/requests/[id].request.json  ex: common.schema.json
   id?: string;
}

export interface DefaultMockApiServiceSchema extends ApiServiceSchema {
   request: DefaultMockRequestConfig;
}

export type MockApiServiceSchema = DefaultMockApiServiceSchema & ApiMockConfig;

export interface ApiMockConfig {
   response: ApiMockRespConfig;
   proxy?: ApiProxyRequestConfig;
   dependencies?: { serviceId: string }[];
   validators?: { [field: string]: Rule[] };
   test?: string[]; //serviceId to override response mock with another file inside mock/test/[serviceId].mock.json
   description?: string;
}

export interface ApiProxyRequestConfig {
   baseUrl: string;
   endpoint: string;
}

export interface ApiMockRespConfig {
   status: number; // 200, 201, 400, 500
   message?: string;
   delay?: number;
   cacheable?: boolean;
   headers?: KeyValuePairs<string>;
   file?: boolean; //path to image
}

export type Verb = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface Rule {
   operator: RuleOperator;
   value: unknown;
}

export type RuleOperator = 'equalTo' | 'notEqualTo';

export interface KeyValueList {
   key: string;
   value: string;
}

export interface KeyValuePairs<T> {
   [key: string]: T;
}

export interface ProjectsList {
   projects: Project[];
}

export interface Project {
   id: string;
   path: string;
}

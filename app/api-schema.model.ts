export interface ApiSchema {
  project: string;
  path: string;
  services: ApiServiceSchema[];
}

export interface ApiServiceSchema {
  id: string;
  feature?: string;
  path: string;
  verb: Verb | string;
  request?: ApiRequestConfig<unknown>;
}

export interface ApiRequestConfig<T> {
  pathParams?: KeyValueList[];
  queryString?: KeyValuePairs<string>;
  body?: T;
  headers?: KeyValuePairs<string>;
}

export type Verb = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface KeyValueList {
   key: string;
   value: string;
}
export interface KeyValuePairs<T> {
   [key: string]: T;
}
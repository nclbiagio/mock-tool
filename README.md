# Dev Mock Tool Application
Built on top of Express library, this project is meant primarily has a dev tool to develop client application using custom mock responses.
## Use case
* As a Default API Mock service, returns always the same mock response. (**Recommended**) 
* As an API Mock service configurable for dynamic mock response. (**TO DO**)
* As a proxy server.
* As PROJECT FLOW TEST TOOL => test, consume and generate mocks from project API. Es: (**TO DO**)
    1) Define Config Example Flow 
    2) Extablish API dependencies 
    3) Orchestrate API and check errors
    4) Generate mocks to reuse during the flow

## Folders/files Configuration
In project root create file **.env** like this:
```ts
PORT=7000
HOST=localhost
PROJECT=example
```

In project root create folder **projects** and project file **projects.json** configured like:
```{ "projects": [{"id": "PROJECT_NAME_OF_YOUR_CHOICE", "path": "/api"}, {...] } ```
Then use the following structure below for each new **project** like **"example"**:
```
.
├── ...
├── projects                
│   ├── example      
│   │   ├──  mock
│   │   │   ├──  getExampleList.mock.json
│   │   ├──  requests
│   │   ├──  services
│   │   ├──  example-api.schema.json
│   ├── projects.json 
└── ...
```
**Request** and **Services** folders are optionals, and can be used only in case it's necessary split ```*-api.schema.json``` in multiple files. All mocks file name must match with service id added in example-api.schema.json and must have the ".mock.json" extension.

If you want to avoid the manual process you can generate this structure running this command: (**TO DO**)
```sh
yarn generate [PUT_YOUR_PROJECT_NAME]
```
## API schema basic file configuration
```*-api.schema.json``` it must follow a well-defined structure:
```ts
project: 'example'                      // Project name
path: '/api/example'                    // Base project path, used only for info and display
services: [{                            // List of all API related to project
    id: string                          // Semantic string id [verb][service method]: getExampleList
    feature: string                     // Optional for a better mock file splitting
    path: '/'                           
    verb: 'GET'                         // GET POST PUT DELETE
    request?: {
        // For `id` prop look at => ## API schema splitted file configuration
        id?: string;
        pathParams?: {  key: string; value: string; }[]
        querystring?: { [key: string]: string }
        body?: any   
        headers?: { [key: string]: string }
    }
    response: {                         // Response Mock configuration, REQUIRED
        status: number;                 // 200 > 500 || if status > 400 forceError is triggered
        message?: string;
        delay?: number;                 // Default 500 millisecond if not specified
        cacheable?: boolean;
        headers?: any;
    }
    proxy?: {                           // Look at # API endpoints usage, if mock disabled
        baseUrl: string;                
        endpoint: string;               
    }
    dependencies?: [{                   
        serviceId: string               
    }];
    validators?: { [field: string]: Rule[] };
    description?: string;
}];
```

## API schema splitted file configuration
It's possibile to split ```*-api.schema.json``` in multiple files to avoid to many services.
For example a developer can declare only the ```id``` property, if this happens the ```data-builder.service.ts``` will goes throught the ```services``` folder to get and read the ```getExampleList.service.json```. The content will be appended to the relative array element of services.
```ts
project: 'example'                      // Project name
path: '/api/example'                    // Base project path, used only for info
services: [{                            // List of all API related to project
    id: string                          // Semantic string id [verb][service method]: getExampleList
}];
```
```getExampleList.service.json``` example schema:
```ts
id: string                          // Semantic string id [verb][service method]: getExampleList
feature: string                     // Optional for a better mock file splitting
path: '/'                           
verb: 'GET'                         // GET POST PUT DELETE
request?: {
    // Here is applied the same logic to split the file only if  `id` is specified
    // this `id` used to retrieve request from files in requests/[id]-request.schema.json 
    // All the other values will be replaced
    id?: string;
    .... Look at => ## API schema basic file configuration
}
.... Look at => ## API schema basic file configuration
```

### Important notes about schema configs
* Remember that as shown above project schema file can be splitted in multiple json files
* Service id must match with a corrispective ```mock``` file in mock folders, or in case you have splitted it must match with a ```service``` or ```request``` file and folders.
* Request object when mock flow is active will be used only as information data to be displayed, it can be used on TEST PROJECT FLOW when proxy is active (**TO DO**).
    * Ex: If mock flow is disabled and a test key is specified, localhost:7000?mock=false&test=req1, then the test key req1 will be searched in request object and this params will be applied to the axios call 
* If default mock flow is deactivated the proxy object keys ```baseUrl``` and ```endpoint``` are required.
* Dependencies object ( **TO BE DEFINED** ) ( used for PROJECT TEST FLOW functionality, Define if this API depends on response of other services ) For now you can use it as infos to display.

## Start Application
Once you've configured the application structure, the server will run on default port ```7000```.
If you need to change PORT, HOST or PROJECT, change ```.env``` file. 
```sh
yarn start
```
Open ```http://localhost:7000``` in browser.

# API endpoints usage
* Mock flow is set by Default, API examples 
    * ```http://localhost:7000/example```, 
    * ```http://localhost:7000/example/1```
* To get different Mock response enable the test suite tool adding ```devkitConfig.file``` into body request
    * ```{ devkitConfig: { file: 'getExampleListV2' } }```  
* If you want to disable the mock response and proxy to another API
    * ```{ devkitConfig: { mock: false } }``` 
    * On Proxy mode everything is already configured to exclude devkitConfig from body request


# DEVELOPER notes
* Move Querystring logic to body config object
* Implement test suite tool
* Implement Validators suite tool
* Yml resources to json https://github.com/nodeca/js-yaml

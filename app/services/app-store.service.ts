export interface AppConfig {
   host: string;
   port: number;
   status?: string;
   warnings?: string[];
   project?: string;
   basepath?: string;
   environment?: 'dev' | 'prod';
   stack?: any;
}

export class AppStoreService {
   private static _instance: AppStoreService;
   private _config: AppConfig;

   // eslint-disable-next-line @typescript-eslint/no-empty-function
   private constructor() {}

   static getInstance() {
      if (this._instance) {
         return this._instance;
      }

      this._instance = new AppStoreService();
      return this._instance;
   }

   public set appConfig(data: AppConfig) {
      this._config = data;
   }

   public get appConfig() {
      return this._config;
   }

   public set appRouterStack(routerStack: any) {
      this._config = { ...this._config, stack: routerStack };
   }

   public get appRouterStack() {
      return this._config.stack;
   }
}

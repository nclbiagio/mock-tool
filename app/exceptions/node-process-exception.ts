export class NodeProcessException extends Error {
   status: number;
   message: string;
   error: string | null;

   constructor(status: number, message: string, error?: string, stack?: any) {
      super(message);
      this.status = status;
      this.message = message;
      this.error = error || null;
      this.stack = stack || null;
   }
}

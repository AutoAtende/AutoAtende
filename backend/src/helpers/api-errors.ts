// helpers/api-errors.ts
export class APIError extends Error {
    constructor(message: string, public status: number) {
      super(message);
    }
  }
  
  export class DatabaseError extends APIError {
    constructor(message: string) {
      super(message, 500);
    }
  }
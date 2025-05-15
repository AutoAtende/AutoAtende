export class Error extends global.Error {
    public type: string;
    public status?: number;
    public extra?: any;
  
    constructor(type: string, message: string, status?: number, extra?: any) {
      super(message);
      this.name = this.constructor.name;
      this.type = type;
      this.status = status;
      this.extra = extra;
  
      // Mantém o stack trace apropriado para onde o erro foi lançado
      if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  
    public toJSON() {
      return {
        type: this.type,
        message: this.message,
        status: this.status,
        extra: this.extra,
        stack: this.stack
      };
    }
  }
  
  export class ValidationError extends Error {
    constructor(message: string, extra?: any) {
      super('validation_error', message, 400, extra);
    }
  }
  
  export class AuthenticationError extends Error {
    constructor(message: string = 'Authentication required', extra?: any) {
      super('authentication_error', message, 401, extra);
    }
  }
  
  export class AuthorizationError extends Error {
    constructor(message: string = 'Permission denied', extra?: any) {
      super('authorization_error', message, 403, extra);
    }
  }
  
  export class NotFoundError extends Error {
    constructor(message: string = 'Resource not found', extra?: any) {
      super('not_found', message, 404, extra);
    }
  }
  
  export class ConflictError extends Error {
    constructor(message: string, extra?: any) {
      super('conflict', message, 409, extra);
    }
  }
  
  export class RateLimitError extends Error {
    constructor(message: string = 'Too many requests', extra?: any) {
      super('rate_limit', message, 429, extra);
    }
  }
  
  export class WhatsAppError extends Error {
    constructor(message: string, extra?: any) {
      super('whatsapp_error', message, 500, extra);
    }
  }
  
  export class DatabaseError extends Error {
    constructor(message: string, extra?: any) {
      super('database_error', message, 500, extra);
    }
  }
  
  export class CacheError extends Error {
    constructor(message: string, extra?: any) {
      super('cache_error', message, 500, extra);
    }
  }
  
  export class IntegrationError extends Error {
    constructor(message: string, extra?: any) {
      super('integration_error', message, 502, extra);
    }
  }
  
  export class TimeoutError extends Error {
    constructor(message: string = 'Operation timed out', extra?: any) {
      super('timeout', message, 504, extra);
    }
  }
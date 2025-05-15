interface OriginalUser {
    id: string;
    companyId: number;
  }
  
  declare module "../models/User" {
    interface User {
      originalUser?: OriginalUser;
    }
  }
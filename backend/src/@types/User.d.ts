export interface SafeUser {
    id: number;
    name: string;
    email: string;
    profile: string;
    companyId: number;
    super: boolean;
    tokenVersion: number;
}

export interface SerializedUser {
    id: number;
    name: string;
    email: string;
    profile: string;
    profilePic: string;
    number: string;
    color: string;
    companyId: number;
    company: {
        id: number;
        name: string;
        status: boolean;
        dueDate: Date;
        settings?: {
            key: string;
            value: string;
        }[];
    } | null;
    super: boolean;
    queues: {
        id: number;
        name: string;
        color?: string;
    }[];
    allTicket: string;
    startWork: string;
    endWork: string;
    spy: string;
    isTricked: string;
    defaultMenu: string;
    tokenVersion: number;
    ramal: string;
    notifyNewTicket: boolean;
    notifyTask: boolean;
    canManageSchedulesNodesData: boolean;
    whatsapp: {
        id: number;
        name: string;
        status?: string;
    } | null;
}

export interface SocketUser {
    id: number;
    email: string;
    companyId: number;
  }
  
  export interface AuthResponse {
    token: string;
    user: {
      id: number;
      email: string;
      companyId: number;
      profile: string;
      super: boolean;
      queues: Array<{
        id: number;
        name: string;
        color?: string;
      }>;
    };
  }

  // Adicionar ao types/user.ts
export interface TokenPayload {
    id: string;
    username: string;
    profile: string;
    super: boolean;
    companyId: number;
    iat: number;
    exp: number;
  }
  
  export interface RequestUser {
    id: string;
    profile: string;
    isSuper: boolean;
    companyId: number;
  }

  export interface IUser {
    id: number;
    name: string;
    email: string;
    password: string;
    passwordHash: string;
    tokenVersion: number;
    spy: string;
    isTricked: string;
    profile: string;
    startWork: string;
    endWork: string;
    allTicket: string;
    defaultMenu: string;
    super: boolean;
    canCreateTags: boolean;
    canManageSchedulesNodesData: boolean;
    online: boolean;
    limitAttendance: number;
    color: string;
    number: string;
    profilePic: string;
    ramal: string;
    notifyNewTicket: boolean;
    notifyTask: boolean;
    canRestartConnections: boolean;
    createdAt: Date;
    updatedAt: Date;
    companyId: number;
    whatsappId: number;
    tickets: Ticket[];
    queues: Queue[];
    quickMessages: QuickMessage[];
    ratings: UserRating[];
    responsibleTasks: Task[];
    createdTasks: Task[];
    tasks: Task[];
    taskUsers: TaskUser[];
    checkPassword(password: string): Promise<boolean>;
    incrementTokenVersion(): Promise<void>;
  }

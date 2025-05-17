// types/Settings.ts
export interface BaseSetting {
    key: string;
    value: string;
    companyId: number;
  }
  
  export interface MenuItem {
    id: string;
    name: string;
    enabled: boolean;
    order: number;
  }
  
  export interface MenuConfig {
    items: MenuItem[];
  }
  
  export enum SettingScope {
    PUBLIC = 'public',
    PRIVATE = 'private',
    SUPER = 'super',
    SAFE = 'safe'
  }
  
  export interface SettingDefinition {
    key: string;
    scope: SettingScope;
    defaultValue: string;
    description?: string;
  }
  
  // Lista de chaves públicas de configurações
  export const PUBLIC_SETTINGS: SettingDefinition[] = [
    { key: "primaryColorLight", scope: SettingScope.PUBLIC, defaultValue: "#0D3180" },
    { key: "secondaryColorLight", scope: SettingScope.PUBLIC, defaultValue: "#2CCCC3" },
    { key: "primaryColorDark", scope: SettingScope.PUBLIC, defaultValue: "#0D3180" },
    { key: "secondaryColorDark", scope: SettingScope.PUBLIC, defaultValue: "#2CCCC3" },
    { key: "appLogoLight", scope: SettingScope.PUBLIC, defaultValue: "logo.png" },
    { key: "appLogoDark", scope: SettingScope.PUBLIC, defaultValue: "logo.png" },
    { key: "appLogoFavicon", scope: SettingScope.PUBLIC, defaultValue: "favicon.ico" },
    { key: "appLogoPWAIcon", scope: SettingScope.PUBLIC, defaultValue: "pwa-icon.png" },
    { key: "appName", scope: SettingScope.PUBLIC, defaultValue: "AutoAtende" },
    { key: "loginBackground", scope: SettingScope.PUBLIC, defaultValue: "backgrounds/default.jpeg" },
    { key: "signupBackground", scope: SettingScope.PUBLIC, defaultValue: "backgrounds/default.jpeg" },
    { key: "loginPosition", scope: SettingScope.PUBLIC, defaultValue: "right" },
    { key: "signupPosition", scope: SettingScope.PUBLIC, defaultValue: "right" },
    { key: "iconColorLight", scope: SettingScope.PUBLIC, defaultValue: "#0D3180" },
    { key: "iconColorDark", scope: SettingScope.PUBLIC, defaultValue: "#2CCCC3" },
    { key: "chatlistLight", scope: SettingScope.PUBLIC, defaultValue: "#FFFFFF" },
    { key: "chatlistDark", scope: SettingScope.PUBLIC, defaultValue: "#151d28" },
    { key: "boxRightLight", scope: SettingScope.PUBLIC, defaultValue: "#F3F3F3" },
    { key: "boxRightDark", scope: SettingScope.PUBLIC, defaultValue: "#1C2531" },
    { key: "boxLeftLight", scope: SettingScope.PUBLIC, defaultValue: "#FFFFFF" },
    { key: "boxLeftDark", scope: SettingScope.PUBLIC, defaultValue: "#151d28" },
    { key: "allowSignup", scope: SettingScope.PUBLIC, defaultValue: "false" },
    { key: "privacy", scope: SettingScope.PUBLIC, defaultValue: "" },
    { key: "terms", scope: SettingScope.PUBLIC, defaultValue: "" },
    { key: "trialExpiration", scope: SettingScope.PUBLIC, defaultValue: "3" },
    { key: "copyright", scope: SettingScope.PUBLIC, defaultValue: "AutoAtende" }
  ];
  
  // Lista de chaves seguras (acessíveis por usuários não administradores)
  export const SAFE_SETTINGS: Record<string, string> = {
    groupsTab: "disabled",
    CheckMsgIsGroup: "disabled",
    soundGroupNotifications: "disabled"
  };
  
  // Constantes para uso interno 
  export const DEFAULT_COMPANY_ID = 1;
  
  // Interface para parâmetros dos serviços
  export interface SettingRequest {
    key: string;
    companyId: number;
  }
  
  export interface SettingUpdateRequest extends SettingRequest {
    value: string;
  }
  
  export interface UserSettingRequest {
    key: string;
    user: {
      profile: string;
      companyId: number;
      isSuper?: boolean;
    };
  }
  
  export interface PublicSettingRequest {
    key: string;
    companyId?: number;
  }
  
  // Lista de todas as chaves públicas (somente as chaves, para uso em verificações)
  export const PUBLIC_SETTINGS_KEYS = PUBLIC_SETTINGS.map(setting => setting.key);
  
  // Verifica se uma configuração é pública
  export function isPublicSetting(key: string): boolean {
    return PUBLIC_SETTINGS_KEYS.includes(key);
  }
  
  // Verifica se uma configuração é segura (acessível por não-admin)
  export function isSafeSetting(key: string): boolean {
    return key in SAFE_SETTINGS;
  }
  
  // Verifica se uma configuração é super (começa com _)
  export function isSuperSetting(key: string): boolean {
    return key.startsWith('_');
  }
  
  // Interface para imagem enviada
  export interface FileUploadRequest {
    file: Express.Multer.File;
    companyId: number;
  }
  
  // Interface para upload de logo
  export interface LogoUploadRequest extends FileUploadRequest {
    mode: string;
  }
  
  // Interface para upload de background
  export interface BackgroundUploadRequest extends FileUploadRequest {
    page: string;
  }
  
  // Interface para arquivo privado
  export interface PrivateFileUploadRequest extends FileUploadRequest {
    settingKey: string;
  }
type WWCustoResponse = IncomingMessage & {
    body: ReadableStream<Uint16Array> | null;
  };
  
  interface IMe {
    name: string;
    // eslint-disable-next-line camelcase
    first_name: string;
    // eslint-disable-next-line camelcase
    last_name: string;
    // eslint-disable-next-line camelcase
    profile_pic: string;
    id: string;
  }
  
  export interface Root {
    object: string;
    entry: Entry[];
  }
  
  export interface Entry {
    id: string;
    time: number;
    messaging: Messaging[];
  }
  
  export interface Messaging {
    sender: Sender;
    recipient: Recipient;
    timestamp: number;
    message: MessageX;
  }
  
  export interface Sender {
    id: string;
  }
  
  export interface Recipient {
    id: string;
  }
  
  export interface MessageX {
    mid: string;
    text: string;
    reply_to: ReplyTo;
  }
  
  export interface ReplyTo {
    mid: string;
  }
  
  type Media = {
    id?: string;
    filename?: string;
    mime_type?: string;
    caption?: string | null | undefined;
  };
  
  interface Phone {
    phone: string;   // Número de telefone
    wa_id: string;   // Identificador do WhatsApp
    type: string;    // Tipo de telefone (ex: CELL)
  }
  
  interface Name {
    first_name: string;      // Primeiro nome
    last_name: string;       // Sobrenome
    formatted_name: string;  // Nome formatado
  }
  
  interface IContact {
    name: Name;             // Objeto que contém o nome
    phones: Phone[];        // Array de objetos Phone
  }
  
  interface IContacts {
    contacts: IContact[];    // Array de objetos Contact
  }
  
  export type TMessage = {
    recipient_type: "individual";
    id: string;
    messaging_product: "whatsapp";
    to: string;
    type?: "document" | "image" | "text" | "video" | "audio" | "template" | "contacts";
    audio?: Media;
    document?: Media;
    video?: Media;
    image?: Media;
    sticker?: Media;
    contacts?: IContacts;
    text?: {
        body: string,
    },
  };
  
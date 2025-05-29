import { proto } from "bail-lite";
import {
  AuthenticationCreds,
  AuthenticationState,
  SignalDataTypeMap
} from "bail-lite";
import { initAuthCreds } from "bail-lite";
import { BufferJSON } from "bail-lite";
import Whatsapp from "../models/Whatsapp";
import fs from "fs/promises";
import path from "path";

// Cria a estrutura de diretórios necessária
const ensureAuthFolder = async (whatsappId: number) => {
  const baseDir = path.join("auth_storage", whatsappId.toString());
  try {
    await fs.mkdir(baseDir, { recursive: true });
  } catch (error) {
    console.error("Error creating auth directory:", error);
  }
  return baseDir;
};

export const useMultiFileAuthState = async (
  whatsapp: Whatsapp
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> => {
  const baseDir = await ensureAuthFolder(whatsapp.id);

  const resolveFilePath = (file: string) => 
    path.join(baseDir, `${file}.json`);

  const writeData = async (data: any, file: string) => {
    const filePath = resolveFilePath(file);
    try {
      await fs.writeFile(
        filePath,
        JSON.stringify(data, BufferJSON.replacer),
        "utf-8"
      );
    } catch (error) {
      console.error("Write error:", error);
    }
  };

  const readData = async (file: string) => {
    const filePath = resolveFilePath(file);
    try {
      // Verifica se o arquivo existe antes de ler
      await fs.access(filePath, fs.constants.F_OK);
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data, BufferJSON.reviver);
    } catch (error) {
      return null;
    }
  };

  const removeData = async (file: string) => {
    const filePath = resolveFilePath(file);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Ignora erro se arquivo não existir
    }
  };

  const creds: AuthenticationCreds =
    (await readData("creds")) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [_: string]: SignalDataTypeMap[typeof type] } = {};
          
          await Promise.all(
            ids.map(async id => {
              try {
                let value = await readData(`${type}-${id}`);
                if (type === "app-state-sync-key" && value) {
                  value = proto.Message.AppStateSyncKeyData.fromObject(value);
                }
                data[id] = value;
              } catch (error) {
                console.error("Error reading key:", error);
                data[id] = null;
              }
            })
          );

          return data;
        },
        set: async data => {
          const tasks: Promise<void>[] = [];
          
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const file = `${category}-${id}`;
              
              if (value) {
                tasks.push(writeData(value, file));
              } else {
                tasks.push(removeData(file));
              }
            }
          }

          await Promise.all(tasks);
        }
      }
    },
    saveCreds: () => {
      return writeData(creds, "creds");
    }
  };
};
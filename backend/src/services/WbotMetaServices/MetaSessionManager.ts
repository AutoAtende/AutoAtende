import { WABAClient } from "whatsapp-business";
import { logger } from "../../utils/logger";

class MetaSessionManager {
  private sessions: Map<number, WABAClient> = new Map();

  public addSession(id: number, waba: WABAClient): void {
    this.sessions.set(id, waba);
    logger.info(`Sessão Meta API adicionada: ${id}`);
  }

  public getSession(id: number): WABAClient | null {
    return this.sessions.get(id) || null;
  }

  public removeSession(id: number): boolean {
    const removed = this.sessions.delete(id);
    if (removed) {
      logger.info(`Sessão Meta API removida: ${id}`);
    }
    return removed;
  }

  public getAllSessions(): Map<number, WABAClient> {
    return this.sessions;
  }

  public sessionExists(id: number): boolean {
    return this.sessions.has(id);
  }
}

export const SessionManager = new MetaSessionManager();
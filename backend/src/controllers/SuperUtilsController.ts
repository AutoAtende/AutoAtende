import { runBackupDatabase } from "../utils/backupDatabase";
import path from 'path';
import { Request, Response } from "express";

class SuperUtilsController {
  async backup(req: Request, res: Response) {
    try {
      const zipPath = await runBackupDatabase();
      res.setHeader('Content-Disposition', `attachment; filename=${path.basename(zipPath)}`);
      res.download(zipPath);
    } catch (error) {
      res.status(500).send('Erro ao gerar backup');
    }
  }
}

export default new SuperUtilsController();
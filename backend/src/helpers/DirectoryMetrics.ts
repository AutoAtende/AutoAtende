import fs from "fs/promises";
import path from "path";
import { logger } from "../utils/logger";

interface DirectoryMetrics {
  folderSize: number;
  numberOfFiles: number;
  lastUpdate: Date | null;
}

export const calculateDirectoryMetrics = async (companyId: number): Promise<DirectoryMetrics> => {
  const publicFolder = path.resolve(__dirname, "..", "..", "public");
  const folderPath = path.join(publicFolder, `company${companyId}`);

  try {
    const exists = await fs.access(folderPath)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      return {
        folderSize: 0,
        numberOfFiles: 0,
        lastUpdate: null
      };
    }

    const files = await fs.readdir(folderPath);
    let totalSize = 0;
    let lastUpdate = new Date(0);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;
      if (stats.mtime > lastUpdate) {
        lastUpdate = stats.mtime;
      }
    }

    return {
      folderSize: totalSize,
      numberOfFiles: files.length,
      lastUpdate: files.length > 0 ? lastUpdate : null
    };

  } catch (err) {
    logger.error(`Error calculating directory metrics for company ${companyId}:`, err);
    return {
      folderSize: 0,
      numberOfFiles: 0,
      lastUpdate: null
    };
  }
};
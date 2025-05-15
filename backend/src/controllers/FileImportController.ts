import { Request, Response } from 'express';
import { join } from 'path';
import { readdir, stat } from 'fs/promises';
import Sequelize, { Op } from 'sequelize';
import Message from '../models/Message';
import Company from '../models/Company';
import { logger } from '../utils/logger';

interface FileImportProgress {
  progress: number;
  processedFiles: number;
  currentFile: string;
  errorCount: number;
}

export const startFileImport = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.body;
    const io = req.app.get('io');

    // Validate company
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get public directory path
    const publicDir = join(__dirname, '../../public');
    
    // Start import process in background
    processFiles(publicDir, companyId, io);

    return res.json({ success: true, message: 'Import started' });
  } catch (error) {
    logger.error('Error starting file import:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const processFiles = async (publicDir: string, companyId: number, io: any) => {
  try {
    const files = await getAllFiles(publicDir);
    const totalFiles = files.length;
    let processedFiles = 0;
    let errorCount = 0;

    // Get existing media entries
    const existingMedia = await Message.findAll({
      where: {
        companyId,
        mediaUrl: { [Sequelize.Op.not]: null }
      },
      attributes: ['mediaUrl']
    });

    const existingUrls = new Set(existingMedia.map(m => m.mediaUrl));

    for (const file of files) {
      try {
        const relativePath = file.replace(publicDir, '');
        const mediaUrl = `/public${relativePath}`;

        // Skip if already in database
        if (existingUrls.has(mediaUrl)) {
          processedFiles++;
          continue;
        }

        // Create message entry
        await Message.create({
          companyId,
          mediaUrl,
          mediaType: getMediaType(file),
          status: 'RECEIVED',
          isMedia: true
        });

        processedFiles++;

        // Send progress update
        const progress: FileImportProgress = {
          progress: (processedFiles / totalFiles) * 100,
          processedFiles,
          currentFile: relativePath,
          errorCount
        };

        io.emit('importProgress', progress);

      } catch (error) {
        logger.error('Error processing file:', file, error);
        errorCount++;
      }

      // Add small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    io.emit('importComplete', {
      totalProcessed: processedFiles,
      errorCount
    });

  } catch (error) {
    logger.error('Error in file processing:', error);
    io.emit('importError', { error: 'Processing failed' });
  }
};

const getAllFiles = async (dir: string): Promise<string[]> => {
  const files: string[] = [];
  
  async function scan(directory: string) {
    const entries = await readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(directory, entry.name);
      
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else {
        const stats = await stat(fullPath);
        if (stats.isFile()) {
          files.push(fullPath);
        }
      }
    }
  }

  await scan(dir);
  return files;
};

const getMediaType = (filePath: string): string => {
  const ext = filePath.split('.').pop()?.toLowerCase();
  
  const mediaTypes = {
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    mp4: 'video',
    avi: 'video',
    mp3: 'audio',
    wav: 'audio',
    pdf: 'document',
    doc: 'document',
    docx: 'document'
  };

  return mediaTypes[ext] || 'unknown';
};
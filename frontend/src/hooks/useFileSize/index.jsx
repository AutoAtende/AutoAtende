import { useState, useEffect } from 'react';

const useFileSize = (files) => {
  const [totalSize, setTotalSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const maxSize = 2048 * 1024; // 2048KB em bytes

  useEffect(() => {
    const calculateTotalSize = () => {
      const size = files.reduce((acc, file) => acc + (file.size || 0), 0);
      setTotalSize(size);
      setProgress((size / maxSize) * 100);
    };

    calculateTotalSize();
  }, [files]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const isOverLimit = totalSize > maxSize;

  return {
    totalSize,
    progress,
    isOverLimit,
    formatFileSize,
    maxSize
  };
};

export default useFileSize;
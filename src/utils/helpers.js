export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'txt':
      return '📝';
    case 'docx':
    case 'doc':
      return '📋';
    default:
      return '📄';
  }
};

export const validateFile = (file, maxSize = 10 * 1024 * 1024) => {
  const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|txt|docx)$/i)) {
    throw new Error('Tipo de archivo no permitido. Solo se permiten archivos PDF, TXT y DOCX.');
  }
  
  if (file.size > maxSize) {
    throw new Error(`El archivo es muy grande. Tamaño máximo: ${formatFileSize(maxSize)}`);
  }
  
  return true;
};
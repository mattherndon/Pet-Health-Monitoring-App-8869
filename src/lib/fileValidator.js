import { toast } from 'react-hot-toast';

/**
 * Validates a file against size and type requirements
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @returns {boolean} - Whether the file is valid
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSizeMB = 25,
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf']
  } = options;

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    toast.error(`File is too large. Maximum size is ${maxSizeMB}MB.`);
    return false;
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    // Fallback to extension check if MIME type check fails
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      toast.error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`);
      return false;
    }
  }

  return true;
};

/**
 * Formats file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Gets file icon based on file type
 * @param {string} fileName - The file name
 * @returns {string} - Icon name
 */
export const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'FiFileText';
    case 'jpg':
    case 'jpeg':
    case 'png':
      return 'FiImage';
    default:
      return 'FiFile';
  }
};
/**
 * Optimizes an image by resizing and compressing it
 * @param {File} file - The image file to optimize
 * @param {Object} options - Optimization options
 * @returns {Promise<{dataUrl: string, file: Blob}>}
 */
export const optimizeImage = async (file, options = {}) => {
  const { maxWidth = 800, maxHeight = 800, quality = 0.8, type = 'image/jpeg' } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to desired format and quality
        canvas.toBlob(
          (blob) => {
            const dataUrl = canvas.toDataURL(type, quality);
            resolve({ dataUrl, file: blob });
          },
          type,
          quality
        );
      };
      img.onerror = (err) => {
        reject(new Error('Failed to load image'));
      };
    };
    reader.onerror = (err) => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Validates an image file
 * @param {File} file - The file to validate
 * @returns {boolean}
 */
export const validateImage = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
  }

  if (file.size > maxSize) {
    throw new Error('File is too large. Maximum size is 5MB.');
  }

  return true;
};
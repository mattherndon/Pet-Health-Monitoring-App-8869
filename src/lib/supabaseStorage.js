import supabase from './supabase';

/**
 * Upload a file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (without bucket name)
 * @returns {Promise<{data, error}>} - Upload result
 */
export const uploadFile = async (file, path) => {
  try {
    const { data, error } = await supabase.storage
      .from('pet-documents')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) throw error;
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('pet-documents')
      .getPublicUrl(path);
      
    return { 
      data: {
        ...data,
        publicUrl
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { data: null, error };
  }
};

/**
 * Delete a file from Supabase Storage
 * @param {string} path - Storage path (without bucket name)
 * @returns {Promise<{data, error}>} - Delete result
 */
export const deleteFile = async (path) => {
  try {
    const { data, error } = await supabase.storage
      .from('pet-documents')
      .remove([path]);
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { data: null, error };
  }
};

/**
 * Get public URL for a file
 * @param {string} path - Storage path (without bucket name)
 * @returns {string} - Public URL
 */
export const getFileUrl = (path) => {
  const { data } = supabase.storage
    .from('pet-documents')
    .getPublicUrl(path);
    
  return data.publicUrl;
};
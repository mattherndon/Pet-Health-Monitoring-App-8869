import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { validateFile, formatFileSize, getFileIcon } from '../lib/fileValidator';
import { uploadFile } from '../lib/supabaseStorage';
import { toast } from 'react-hot-toast';

const { 
  FiUpload, 
  FiFile, 
  FiFileText, 
  FiImage, 
  FiX, 
  FiPaperclip, 
  FiCheck, 
  FiAlertTriangle 
} = FiIcons;

const DocumentUploader = ({ onUploadComplete, petId, healthLogId }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = useCallback(acceptedFiles => {
    const validFiles = acceptedFiles.filter(file => 
      validateFile(file, {
        maxSizeMB: 25,
        allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf']
      })
    );

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles.map(file => ({
        file,
        id: `${Date.now()}-${file.name}`,
        status: 'pending', // pending, uploading, success, error
        progress: 0
      }))]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf']
    },
    maxSize: 25 * 1024 * 1024 // 25MB
  });

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const uploadFiles = async () => {
    if (files.length === 0 || !petId) return;
    
    setUploading(true);
    const results = [];
    
    for (const fileObj of files) {
      if (fileObj.status === 'success') continue;
      
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'uploading' } : f
        ));
        
        // Create a path for the file in Supabase Storage
        const path = `pets/${petId}/health-logs/${healthLogId || 'new'}/${Date.now()}-${fileObj.file.name.replace(/\s+/g, '_')}`;
        
        // Upload the file
        const { data, error } = await uploadFile(fileObj.file, path);
        
        if (error) throw error;
        
        // Update file status to success
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'success', path, publicUrl: data.publicUrl } : f
        ));
        
        // Add to results
        results.push({
          name: fileObj.file.name,
          size: fileObj.file.size,
          type: fileObj.file.type,
          path,
          url: data.publicUrl
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        
        // Update file status to error
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'error', error: error.message } : f
        ));
        
        toast.error(`Failed to upload ${fileObj.file.name}`);
      }
    }
    
    setUploading(false);
    
    // Call the callback with the results
    if (results.length > 0) {
      onUploadComplete(results);
      toast.success(`${results.length} document${results.length > 1 ? 's' : ''} uploaded successfully`);
    }
  };

  const getFileIconComponent = (fileName) => {
    const iconName = getFileIcon(fileName);
    switch (iconName) {
      case 'FiFileText':
        return FiFileText;
      case 'FiImage':
        return FiImage;
      default:
        return FiFile;
    }
  };

  return (
    <div className="mb-6">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        <SafeIcon icon={FiUpload} className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">
          {isDragActive 
            ? 'Drop files here...' 
            : 'Drag & drop files here, or click to select files'
          }
        </p>
        <p className="text-xs text-gray-500 mt-1">
          JPG, PNG, PDF (max 25MB)
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Documents</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <AnimatePresence>
              {files.map((fileObj) => (
                <motion.div
                  key={fileObj.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    fileObj.status === 'error' ? 'bg-red-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full">
                      <SafeIcon 
                        icon={getFileIconComponent(fileObj.file.name)} 
                        className={`w-5 h-5 ${
                          fileObj.status === 'error' ? 'text-red-500' : 'text-blue-500'
                        }`} 
                      />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {fileObj.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(fileObj.file.size)}
                      </p>
                      {fileObj.status === 'error' && (
                        <p className="text-xs text-red-500">
                          {fileObj.error || 'Upload failed'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {fileObj.status === 'success' ? (
                      <span className="text-green-500">
                        <SafeIcon icon={FiCheck} className="w-5 h-5" />
                      </span>
                    ) : fileObj.status === 'uploading' ? (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <button
                        onClick={() => removeFile(fileObj.id)}
                        className="p-1 text-gray-500 hover:text-red-500 rounded"
                      >
                        <SafeIcon icon={FiX} className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {files.some(f => f.status === 'pending') && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiPaperclip} className="w-4 h-4" />
                    <span>Upload Documents</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
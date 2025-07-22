import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { usePets } from '../context/PetContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import DocumentUploader from '../components/DocumentUploader';
import { toast, Toaster } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

const { 
  FiPlus, 
  FiActivity, 
  FiEdit2, 
  FiTrash2, 
  FiFilter, 
  FiHeart, 
  FiDollarSign, 
  FiFileText, 
  FiX, 
  FiUpload, 
  FiPaperclip, 
  FiDownload,
  FiImage,
  FiFile,
  FiLink,
  FiEye
} = FiIcons;

const HealthLogs = () => {
  const { pets, healthLogs, addHealthLog, updateHealthLog, deleteHealthLog } = usePets();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [selectedPet, setSelectedPet] = useState('');
  const [filterType, setFilterType] = useState('');
  const [formData, setFormData] = useState({
    petId: '',
    type: 'checkup',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    documents: [],
    cost: '',
    costCategory: 'medical',
    heartRate: '',
    weight: '',
    temperature: '',
    prescription: '',
    nextVisitDate: '',
    vetName: '',
  });

  // Ref for file input
  const fileInputRef = useRef(null);

  // Health log types
  const logTypes = [
    'checkup',
    'vaccination',
    'medication',
    'surgery',
    'dental',
    'emergency',
    'lab-work',
    'specialist',
    'grooming',
    'other'
  ];

  // Cost categories
  const costCategories = [
    'medical',
    'medication',
    'food',
    'supplies',
    'grooming',
    'training',
    'boarding',
    'insurance',
    'other'
  ];

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle document upload complete
  const handleUploadComplete = (documents) => {
    setFormData(prev => ({
      ...prev,
      documents: [...(prev.documents || []), ...documents]
    }));
    toast.success(`${documents.length} document${documents.length > 1 ? 's' : ''} uploaded successfully`);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a unique ID for the health log if it's a new entry
    const healthLogId = editingLog ? editingLog.id : uuidv4();
    
    // Prepare the health log data
    const healthLogData = {
      ...formData,
      id: healthLogId,
      heartRate: formData.heartRate ? parseFloat(formData.heartRate) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      temperature: formData.temperature ? parseFloat(formData.temperature) : null,
      cost: formData.cost ? parseFloat(formData.cost) : 0,
    };

    if (editingLog) {
      updateHealthLog(editingLog.id, healthLogData);
      toast.success('Health log updated successfully');
    } else {
      addHealthLog(healthLogData);
      toast.success('Health log added successfully');
    }

    // Reset form
    setFormData({
      petId: '',
      type: 'checkup',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      documents: [],
      cost: '',
      costCategory: 'medical',
      heartRate: '',
      weight: '',
      temperature: '',
      prescription: '',
      nextVisitDate: '',
      vetName: '',
    });
    
    setShowAddForm(false);
    setEditingLog(null);
  };

  // Handle edit log
  const handleEdit = (log) => {
    setEditingLog(log);
    setFormData({
      ...log,
      date: new Date(log.date).toISOString().split('T')[0],
      nextVisitDate: log.nextVisitDate ? new Date(log.nextVisitDate).toISOString().split('T')[0] : '',
      documents: log.documents || [],
    });
    setShowAddForm(true);
  };

  // Handle delete log
  const handleDelete = (logId) => {
    if (window.confirm('Are you sure you want to delete this health log?')) {
      deleteHealthLog(logId);
      toast.success('Health log deleted successfully');
    }
  };

  // Filter logs based on selected pet and type
  const filteredLogs = healthLogs.filter(log => {
    let matchesPet = true;
    let matchesType = true;

    if (selectedPet) {
      matchesPet = log.petId === selectedPet;
    }

    if (filterType) {
      matchesType = log.type === filterType;
    }

    return matchesPet && matchesType;
  });

  // Sort logs by date (newest first)
  const sortedLogs = [...filteredLogs].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Toaster position="top-center" />
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Health Logs</h1>
            <p className="text-gray-600">Track your pets' health records and documents</p>
          </div>
          <button 
            onClick={() => {
              setShowAddForm(true);
              setEditingLog(null);
              setFormData({
                petId: selectedPet || '',
                type: 'checkup',
                date: new Date().toISOString().split('T')[0],
                notes: '',
                documents: [],
                cost: '',
                costCategory: 'medical',
                heartRate: '',
                weight: '',
                temperature: '',
                prescription: '',
                nextVisitDate: '',
                vetName: '',
              });
            }}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            Add Health Log
          </button>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Pet</label>
              <select 
                value={selectedPet} 
                onChange={(e) => setSelectedPet(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Pets</option>
                {pets.map(pet => (
                  <option key={pet.id} value={pet.id}>{pet.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {logTypes.map(type => (
                  <option key={type} value={type} className="capitalize">{type}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={() => {
                  setSelectedPet('');
                  setFilterType('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Health Logs List */}
      <div className="space-y-6">
        {sortedLogs.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <SafeIcon icon={FiActivity} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No health logs found</p>
            <button 
              onClick={() => {
                setShowAddForm(true);
                setFormData({
                  ...formData,
                  petId: selectedPet || '',
                });
              }}
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5" />
              Add Your First Health Log
            </button>
          </div>
        ) : (
          sortedLogs.map(log => {
            const pet = pets.find(p => p.id === log.petId);
            
            return (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                  <div className="flex items-center gap-4">
                    {pet?.image ? (
                      <img 
                        src={pet.image} 
                        alt={pet.name} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-500" 
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                        {pet?.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-semibold text-gray-800">{pet?.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 capitalize">{log.type}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{new Date(log.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEdit(log)}
                      className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(log.id)}
                      className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {log.heartRate && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                      <SafeIcon icon={FiHeart} className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-xs text-red-500">Heart Rate</p>
                        <p className="font-medium text-gray-800">{log.heartRate} bpm</p>
                      </div>
                    </div>
                  )}
                  
                  {log.weight && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <SafeIcon icon={FiActivity} className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-xs text-green-500">Weight</p>
                        <p className="font-medium text-gray-800">{log.weight} lbs</p>
                      </div>
                    </div>
                  )}
                  
                  {log.cost > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <SafeIcon icon={FiDollarSign} className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-blue-500 capitalize">{log.costCategory || 'Cost'}</p>
                        <p className="font-medium text-gray-800">${log.cost.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {log.notes && (
                  <div className="mb-4">
                    <p className="text-gray-600">{log.notes}</p>
                  </div>
                )}
                
                {/* Documents Section */}
                {log.documents && log.documents.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <SafeIcon icon={FiPaperclip} className="w-4 h-4" />
                      Attached Documents ({log.documents.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {log.documents.map((doc, index) => {
                        // Determine icon based on file type
                        let icon = FiFile;
                        if (doc.type && doc.type.includes('pdf')) {
                          icon = FiFileText;
                        } else if (doc.type && doc.type.includes('image')) {
                          icon = FiImage;
                        }
                        
                        return (
                          <a 
                            key={index}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <SafeIcon icon={icon} className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-gray-700 truncate max-w-[150px]">{doc.name}</span>
                            <SafeIcon icon={FiEye} className="w-3 h-3 text-gray-400" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
      
      {/* Add/Edit Health Log Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingLog ? 'Edit Health Log' : 'Add Health Log'}
              </h3>
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingLog(null);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pet *</label>
                  <select 
                    name="petId"
                    value={formData.petId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a pet</option>
                    {pets.map(pet => (
                      <option key={pet.id} value={pet.id}>{pet.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {logTypes.map(type => (
                      <option key={type} value={type} className="capitalize">{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input 
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Veterinarian</label>
                  <input 
                    type="text"
                    name="vetName"
                    value={formData.vetName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dr. Smith"
                  />
                </div>
              </div>
              
              {/* Vitals Section */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3">Vitals</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (bpm)</label>
                    <input 
                      type="number"
                      name="heartRate"
                      value={formData.heartRate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 80"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
                    <input 
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 25.5"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°F)</label>
                    <input 
                      type="number"
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 101.5"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
              
              {/* Cost Section */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3">Cost Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost ($)</label>
                    <input 
                      type="number"
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 125.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost Category</label>
                    <select 
                      name="costCategory"
                      value={formData.costCategory}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {costCategories.map(category => (
                        <option key={category} value={category} className="capitalize">{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Additional Information */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prescription</label>
                    <input 
                      type="text"
                      name="prescription"
                      value={formData.prescription}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Amoxicillin 250mg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                    <input 
                      type="date"
                      name="nextVisitDate"
                      value={formData.nextVisitDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter any additional notes..."
                  />
                </div>
              </div>
              
              {/* Document Upload Section */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <SafeIcon icon={FiPaperclip} className="w-4 h-4" />
                  Upload Documents
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Upload medical records, prescriptions, lab results, or other documents (JPG, PNG, PDF only, max 25MB)
                </p>
                
                <DocumentUploader 
                  onUploadComplete={handleUploadComplete} 
                  petId={formData.petId}
                  healthLogId={editingLog?.id || null}
                />
                
                {/* Display already uploaded documents */}
                {formData.documents && formData.documents.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Attached Documents</h5>
                    <div className="flex flex-wrap gap-2">
                      {formData.documents.map((doc, index) => {
                        // Determine icon based on file type
                        let icon = FiFile;
                        if (doc.type && doc.type.includes('pdf')) {
                          icon = FiFileText;
                        } else if (doc.type && doc.type.includes('image')) {
                          icon = FiImage;
                        }
                        
                        return (
                          <div 
                            key={index}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                          >
                            <SafeIcon icon={icon} className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-gray-700 truncate max-w-[150px]">{doc.name}</span>
                            <a 
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-blue-500 hover:text-blue-700"
                            >
                              <SafeIcon icon={FiEye} className="w-3 h-3" />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingLog(null);
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingLog ? 'Update' : 'Save'} Health Log
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HealthLogs;
import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { usePets } from '../context/PetContext';
import { useProfiles } from '../context/ProfileContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';
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
  FiEye,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock
} = FiIcons;

const Health = () => {
  const { pets, healthLogs, addHealthLog, updateHealthLog, deleteHealthLog, vetAppointments, addVetAppointment, deleteVetAppointment } = usePets();
  const { vetProfiles } = useProfiles();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('health');
  
  // Health log states
  const [showAddHealthForm, setShowAddHealthForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [selectedPet, setSelectedPet] = useState('');
  const [filterType, setFilterType] = useState('');
  const [healthFormData, setHealthFormData] = useState({
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

  // Appointment states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddAppointmentForm, setShowAddAppointmentForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [appointmentFormData, setAppointmentFormData] = useState({
    petId: '',
    type: 'checkup',
    date: '',
    time: '',
    vetId: '',
    vetName: '',
    vetPhone: '',
    notes: '',
    reminder: true
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

  // Appointment types
  const appointmentTypes = [
    'checkup',
    'vaccination',
    'surgery',
    'dental',
    'grooming',
    'emergency',
    'consultation',
    'follow-up',
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

  // Health form handlers
  const handleHealthChange = (e) => {
    const { name, value } = e.target;
    setHealthFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUploadComplete = (documents) => {
    setHealthFormData(prev => ({
      ...prev,
      documents: [...(prev.documents || []), ...documents]
    }));
    toast.success(`${documents.length} document${documents.length > 1 ? 's' : ''} uploaded successfully`);
  };

  const handleHealthSubmit = (e) => {
    e.preventDefault();
    
    const healthLogId = editingLog ? editingLog.id : uuidv4();
    
    const healthLogData = {
      ...healthFormData,
      id: healthLogId,
      heartRate: healthFormData.heartRate ? parseFloat(healthFormData.heartRate) : null,
      weight: healthFormData.weight ? parseFloat(healthFormData.weight) : null,
      temperature: healthFormData.temperature ? parseFloat(healthFormData.temperature) : null,
      cost: healthFormData.cost ? parseFloat(healthFormData.cost) : 0,
    };

    if (editingLog) {
      updateHealthLog(editingLog.id, healthLogData);
      toast.success('Health log updated successfully');
    } else {
      addHealthLog(healthLogData);
      toast.success('Health log added successfully');
    }

    resetHealthForm();
  };

  const resetHealthForm = () => {
    setHealthFormData({
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
    setShowAddHealthForm(false);
    setEditingLog(null);
  };

  const handleEditHealth = (log) => {
    setEditingLog(log);
    setHealthFormData({
      ...log,
      date: new Date(log.date).toISOString().split('T')[0],
      nextVisitDate: log.nextVisitDate ? new Date(log.nextVisitDate).toISOString().split('T')[0] : '',
      documents: log.documents || [],
    });
    setShowAddHealthForm(true);
  };

  const handleDeleteHealth = (logId) => {
    if (window.confirm('Are you sure you want to delete this health log?')) {
      deleteHealthLog(logId);
      toast.success('Health log deleted successfully');
    }
  };

  // Appointment form handlers
  const handleAppointmentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppointmentFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'vetId' && value) {
      const selectedVet = vetProfiles.find(vet => vet.id === value);
      if (selectedVet) {
        setAppointmentFormData(prev => ({
          ...prev,
          vetName: selectedVet.name,
          vetPhone: selectedVet.phone
        }));
      }
    }
  };

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    
    if (!appointmentFormData.petId || !appointmentFormData.date || !appointmentFormData.time) {
      alert('Please fill in all required fields');
      return;
    }

    const appointmentDateTime = new Date(`${appointmentFormData.date}T${appointmentFormData.time}`);
    const selectedVet = vetProfiles.find(vet => vet.id === appointmentFormData.vetId);
    
    const appointmentData = {
      ...appointmentFormData,
      date: appointmentDateTime.toISOString(),
      vetName: selectedVet ? selectedVet.name : appointmentFormData.vetName,
      vetPhone: selectedVet ? selectedVet.phone : appointmentFormData.vetPhone
    };

    addVetAppointment(appointmentData);
    
    setAppointmentFormData({
      petId: '',
      type: 'checkup',
      date: '',
      time: '',
      vetId: '',
      vetName: '',
      vetPhone: '',
      notes: '',
      reminder: true
    });
    
    setShowAddAppointmentForm(false);
    setSelectedDate(null);
    toast.success('Appointment scheduled successfully');
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setAppointmentFormData(prev => ({
      ...prev,
      date: format(date, 'yyyy-MM-dd')
    }));
    setShowAddAppointmentForm(true);
  };

  const getAppointmentsForDate = (date) => {
    return vetAppointments.filter(apt => isSameDay(new Date(apt.date), date));
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
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

  // Get upcoming appointments
  const upcomingAppointments = vetAppointments
    .filter(apt => new Date(apt.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  // Calendar setup
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Toaster position="top-center" />
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Health & Appointments</h1>
            <p className="text-gray-600">Manage your pets' health records and appointments</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setShowAddHealthForm(true);
                setEditingLog(null);
                setHealthFormData({
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
            <button 
              onClick={() => setShowAddAppointmentForm(true)}
              className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              Add Appointment
            </button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('health')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'health'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <SafeIcon icon={FiActivity} className="w-4 h-4" />
              Health Logs
            </div>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'appointments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <SafeIcon icon={FiCalendar} className="w-4 h-4" />
              Appointments
            </div>
          </button>
        </div>
      </div>

      {/* Health Logs Tab */}
      {activeTab === 'health' && (
        <div>
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

          {/* Health Logs List */}
          <div className="space-y-6">
            {sortedLogs.length === 0 ? (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <SafeIcon icon={FiActivity} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No health logs found</p>
                <button 
                  onClick={() => {
                    setShowAddHealthForm(true);
                    setHealthFormData({
                      ...healthFormData,
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
                          onClick={() => handleEditHealth(log)}
                          className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteHealth(log.id)}
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
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiChevronLeft} className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiChevronRight} className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(date => {
                  const appointments = getAppointmentsForDate(date);
                  const isCurrentMonth = isSameMonth(date, currentDate);
                  const isDayToday = isToday(date);

                  return (
                    <motion.button
                      key={date.toISOString()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDateClick(date)}
                      className={`
                        relative p-2 h-16 text-sm rounded-lg transition-colors
                        ${isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}
                        ${isDayToday ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}
                        ${appointments.length > 0 ? 'bg-purple-50 border border-purple-200' : ''}
                      `}
                    >
                      <div className="font-medium">{format(date, 'd')}</div>
                      {appointments.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Appointments</h3>
            
            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => {
                  const pet = pets.find(p => p.id === appointment.petId);
                  
                  return (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {pet?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{pet?.name}</p>
                            <p className="text-sm text-gray-600 capitalize">{appointment.type}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button className="p-1 text-gray-600 hover:text-blue-500 rounded">
                            <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteVetAppointment(appointment.id)}
                            className="p-1 text-gray-600 hover:text-red-500 rounded"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="flex items-center gap-1">
                          <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                          {format(new Date(appointment.date), 'MMM d, yyyy')}
                        </p>
                        <p className="flex items-center gap-1">
                          <SafeIcon icon={FiClock} className="w-3 h-3" />
                          {format(new Date(appointment.date), 'h:mm a')}
                        </p>
                        {appointment.vetName && <p>Dr. {appointment.vetName}</p>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Health Log Modal */}
      {showAddHealthForm && (
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
                onClick={resetHealthForm}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleHealthSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pet *</label>
                  <select 
                    name="petId"
                    value={healthFormData.petId}
                    onChange={handleHealthChange}
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
                    value={healthFormData.type}
                    onChange={handleHealthChange}
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
                    value={healthFormData.date}
                    onChange={handleHealthChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Veterinarian</label>
                  <input 
                    type="text"
                    name="vetName"
                    value={healthFormData.vetName}
                    onChange={handleHealthChange}
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
                      value={healthFormData.heartRate}
                      onChange={handleHealthChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 80"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
                    <input 
                      type="number"
                      name="weight"
                      value={healthFormData.weight}
                      onChange={handleHealthChange}
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
                      value={healthFormData.temperature}
                      onChange={handleHealthChange}
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
                      value={healthFormData.cost}
                      onChange={handleHealthChange}
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
                      value={healthFormData.costCategory}
                      onChange={handleHealthChange}
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
                      value={healthFormData.prescription}
                      onChange={handleHealthChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Amoxicillin 250mg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                    <input 
                      type="date"
                      name="nextVisitDate"
                      value={healthFormData.nextVisitDate}
                      onChange={handleHealthChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea 
                    name="notes"
                    value={healthFormData.notes}
                    onChange={handleHealthChange}
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
                  petId={healthFormData.petId}
                  healthLogId={editingLog?.id || null}
                />
                
                {/* Display already uploaded documents */}
                {healthFormData.documents && healthFormData.documents.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Attached Documents</h5>
                    <div className="flex flex-wrap gap-2">
                      {healthFormData.documents.map((doc, index) => {
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
                  onClick={resetHealthForm}
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

      {/* Add Appointment Modal */}
      {showAddAppointmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Schedule Appointment</h3>
            
            <form onSubmit={handleAppointmentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pet *</label>
                  <select
                    name="petId"
                    value={appointmentFormData.petId}
                    onChange={handleAppointmentChange}
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
                    value={appointmentFormData.type}
                    onChange={handleAppointmentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {appointmentTypes.map(type => (
                      <option key={type} value={type} className="capitalize">{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={appointmentFormData.date}
                    onChange={handleAppointmentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={appointmentFormData.time}
                    onChange={handleAppointmentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Veterinarian</label>
                  <select
                    name="vetId"
                    value={appointmentFormData.vetId}
                    onChange={handleAppointmentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select from saved vets</option>
                    {vetProfiles.map(vet => (
                      <option key={vet.id} value={vet.id}>Dr. {vet.name} - {vet.clinicName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Or Enter Vet Name</label>
                  <input
                    type="text"
                    name="vetName"
                    value={appointmentFormData.vetName}
                    onChange={handleAppointmentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dr. Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vet Phone</label>
                  <input
                    type="tel"
                    name="vetPhone"
                    value={appointmentFormData.vetPhone}
                    onChange={handleAppointmentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={appointmentFormData.notes}
                  onChange={handleAppointmentChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes about the appointment..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="reminder"
                  checked={appointmentFormData.reminder}
                  onChange={handleAppointmentChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Send reminder notification
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAppointmentForm(false);
                    setSelectedDate(null);
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Schedule Appointment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Health;
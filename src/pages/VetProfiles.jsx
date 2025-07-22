import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProfiles } from '../context/ProfileContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import VetProfileModal from '../components/VetProfileModal';
import VetDetailModal from '../components/VetDetailModal';

const { FiPlus, FiEdit2, FiTrash2, FiPhone, FiMail, FiMapPin, FiUser, FiUsers, FiChevronRight, FiGlobe, FiClock, FiAlertTriangle, FiRefreshCw, FiX, FiArrowUp, FiArrowDown, FiFilter, FiInfo, FiBriefcase, FiAward, FiHeart } = FiIcons;

const VetProfiles = () => {
  const { vetProfiles, deleteVetProfile, getClinicVets, getDuplicateGroups, deleteDuplicates } = useProfiles();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVet, setEditingVet] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [expandedClinic, setExpandedClinic] = useState(null);
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [showDuplicateManager, setShowDuplicateManager] = useState(false);
  const [selectedVet, setSelectedVet] = useState(null);

  // Sorting states
  const [clinicSortField, setClinicSortField] = useState('name');
  const [clinicSortDirection, setClinicSortDirection] = useState('asc');
  const [vetSortField, setVetSortField] = useState('name');
  const [vetSortDirection, setVetSortDirection] = useState('asc');

  // Check for duplicates on component mount
  useEffect(() => {
    const duplicates = getDuplicateGroups();
    setDuplicateGroups(duplicates);
  }, [vetProfiles, getDuplicateGroups]);

  const handleEdit = (vet) => {
    setEditingVet(vet);
  };

  const handleDelete = (vetId) => {
    deleteVetProfile(vetId);
    setShowDeleteConfirm(null);
    
    // Refresh duplicate check after deletion
    const duplicates = getDuplicateGroups();
    setDuplicateGroups(duplicates);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingVet(null);
    
    // Refresh duplicate check when modal closes
    const duplicates = getDuplicateGroups();
    setDuplicateGroups(duplicates);
  };

  const toggleClinicExpand = (clinicId) => {
    if (expandedClinic === clinicId) {
      setExpandedClinic(null);
    } else {
      setExpandedClinic(clinicId);
    }
  };

  const handleDeleteAllDuplicates = () => {
    const removedCount = deleteDuplicates();
    alert(`Removed ${removedCount} duplicate profiles`);
    setShowDuplicateManager(false);
    
    // Refresh duplicate check
    const duplicates = getDuplicateGroups();
    setDuplicateGroups(duplicates);
  };

  // Toggle clinic sort direction or change sort field
  const handleClinicSort = (field) => {
    if (field === clinicSortField) {
      setClinicSortDirection(clinicSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setClinicSortField(field);
      setClinicSortDirection('asc');
    }
  };

  // Toggle vet sort direction or change sort field
  const handleVetSort = (field) => {
    if (field === vetSortField) {
      setVetSortDirection(vetSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setVetSortField(field);
      setVetSortDirection('asc');
    }
  };

  // Separate clinics and independent vets
  const clinics = [...vetProfiles.filter(profile => profile.isClinic)]
    .sort((a, b) => {
      if (clinicSortField === 'name') {
        return clinicSortDirection === 'asc' 
          ? a.clinicName.localeCompare(b.clinicName) 
          : b.clinicName.localeCompare(a.clinicName);
      } else if (clinicSortField === 'date') {
        return clinicSortDirection === 'asc' 
          ? new Date(a.createdAt) - new Date(b.createdAt) 
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

  const independentVets = [...vetProfiles.filter(profile => !profile.isClinic && !profile.clinicId)]
    .sort((a, b) => {
      if (vetSortField === 'name') {
        return vetSortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (vetSortField === 'date') {
        return vetSortDirection === 'asc' 
          ? new Date(a.createdAt) - new Date(b.createdAt) 
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

  // Helper function to get specialty icon
  const getSpecialtyIcon = (specialty) => {
    if (!specialty) return FiUser;
    
    const specialtyLower = specialty.toLowerCase();
    if (specialtyLower.includes('cardio')) return FiHeart;
    if (specialtyLower.includes('surgery')) return FiIcons.FiScissors;
    if (specialtyLower.includes('emergency')) return FiIcons.FiAlertCircle;
    if (specialtyLower.includes('dental')) return FiIcons.FiSmile;
    if (specialtyLower.includes('dermatology')) return FiIcons.FiFeather;
    if (specialtyLower.includes('nutrition')) return FiIcons.FiCoffee;
    if (specialtyLower.includes('orthopedics')) return FiIcons.FiActivity;
    
    return FiAward;
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Veterinarian Profiles</h1>
            <p className="text-gray-600">Manage your veterinary clinics and doctors</p>
          </div>
          <div className="flex gap-2">
            {duplicateGroups.length > 0 && (
              <button
                onClick={() => setShowDuplicateManager(true)}
                className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <SafeIcon icon={FiAlertTriangle} className="w-4 h-4" />
                {duplicateGroups.length} Duplicate{duplicateGroups.length > 1 ? 's' : ''}
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              Add Vet
            </button>
          </div>
        </div>

        {/* Duplicate Alert Banner */}
        {duplicateGroups.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800">Duplicate Profiles Detected</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Found {duplicateGroups.length} group{duplicateGroups.length > 1 ? 's' : ''} of duplicate profiles. Click "Manage Duplicates" to review and clean up your data.
                </p>
              </div>
              <button
                onClick={() => setShowDuplicateManager(true)}
                className="flex items-center gap-2 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
              >
                Manage Duplicates
              </button>
            </div>
          </div>
        )}
      </div>

      {vetProfiles.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <SafeIcon icon={FiUser} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No veterinarians or clinics added yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5" />
            Add Your First Vet
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Clinics Section */}
          {clinics.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <SafeIcon icon={FiUsers} className="w-5 h-5 text-blue-500" />
                  Veterinary Clinics
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleClinicSort('name')}
                    className={`flex items-center gap-1 text-sm ${
                      clinicSortField === 'name' ? 'font-medium text-blue-500' : 'text-gray-600'
                    }`}
                  >
                    Name
                    {clinicSortField === 'name' && (
                      <SafeIcon
                        icon={clinicSortDirection === 'asc' ? FiArrowUp : FiArrowDown}
                        className="w-3 h-3"
                      />
                    )}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => handleClinicSort('date')}
                    className={`flex items-center gap-1 text-sm ${
                      clinicSortField === 'date' ? 'font-medium text-blue-500' : 'text-gray-600'
                    }`}
                  >
                    Date Added
                    {clinicSortField === 'date' && (
                      <SafeIcon
                        icon={clinicSortDirection === 'asc' ? FiArrowUp : FiArrowDown}
                        className="w-3 h-3"
                      />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {clinics.map((clinic) => {
                  const clinicVets = getClinicVets(clinic.id);
                  const isExpanded = expandedClinic === clinic.id;

                  return (
                    <motion.div
                      key={clinic.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      {/* Clinic header */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-5">
                            {clinic.avatar ? (
                              <img
                                src={clinic.avatar}
                                alt={clinic.clinicName}
                                className="w-20 h-20 rounded-lg object-cover border border-gray-200 shadow-sm"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                                {clinic.clinicName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-gray-800 text-xl mb-1">{clinic.clinicName}</h3>
                              {clinic.address && (
                                <p className="text-gray-600 flex items-center gap-1">
                                  <SafeIcon icon={FiMapPin} className="w-4 h-4 text-gray-400" />
                                  <span>{clinic.address}</span>
                                </p>
                              )}
                              {(clinic.city || clinic.state) && (
                                <p className="text-gray-600 mt-0.5">
                                  {[clinic.city, clinic.state, clinic.zipCode].filter(Boolean).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(clinic)}
                              className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              aria-label="Edit clinic"
                            >
                              <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(clinic.id)}
                              className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label="Delete clinic"
                            >
                              <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {clinic.phone && (
                            <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">
                              <SafeIcon icon={FiPhone} className="w-4 h-4 text-blue-500" />
                              <span>{clinic.phone}</span>
                            </div>
                          )}
                          {clinic.email && (
                            <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-4 py-3 rounded-lg overflow-hidden">
                              <SafeIcon icon={FiMail} className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              <span className="truncate">{clinic.email}</span>
                            </div>
                          )}
                          {clinic.website && (
                            <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-4 py-3 rounded-lg overflow-hidden">
                              <SafeIcon icon={FiGlobe} className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              <a
                                href={clinic.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {clinic.website.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          )}
                        </div>

                        {clinic.hours && (
                          <div className="flex items-start gap-2 text-gray-700 bg-gray-50 px-4 py-3 rounded-lg mt-2">
                            <SafeIcon icon={FiClock} className="w-4 h-4 text-blue-500 mt-0.5" />
                            <span>{clinic.hours}</span>
                          </div>
                        )}

                        {/* Team members toggle */}
                        <button
                          onClick={() => toggleClinicExpand(clinic.id)}
                          className={`mt-6 flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                            clinicVets.length > 0
                              ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                              : 'text-gray-400'
                          }`}
                          disabled={clinicVets.length === 0}
                          aria-expanded={isExpanded}
                          aria-controls={`clinic-team-${clinic.id}`}
                        >
                          <SafeIcon icon={FiUsers} className="w-4 h-4" />
                          <span>
                            {clinicVets.length} Veterinarian{clinicVets.length !== 1 ? 's' : ''}
                          </span>
                          <SafeIcon
                            icon={FiChevronRight}
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          />
                        </button>
                      </div>

                      {/* Team members section */}
                      {isExpanded && clinicVets.length > 0 && (
                        <div className="bg-gray-50 p-6" id={`clinic-team-${clinic.id}`}>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-700">Team Members</h4>
                            <div className="flex items-center gap-2 text-sm">
                              <button
                                onClick={() => handleVetSort('name')}
                                className={`flex items-center gap-1 ${
                                  vetSortField === 'name' ? 'font-medium text-blue-500' : 'text-gray-600'
                                }`}
                              >
                                Name
                                {vetSortField === 'name' && (
                                  <SafeIcon
                                    icon={vetSortDirection === 'asc' ? FiArrowUp : FiArrowDown}
                                    className="w-3 h-3"
                                  />
                                )}
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => handleVetSort('date')}
                                className={`flex items-center gap-1 ${
                                  vetSortField === 'date' ? 'font-medium text-blue-500' : 'text-gray-600'
                                }`}
                              >
                                Date Added
                                {vetSortField === 'date' && (
                                  <SafeIcon
                                    icon={vetSortDirection === 'asc' ? FiArrowUp : FiArrowDown}
                                    className="w-3 h-3"
                                  />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...clinicVets]
                              .sort((a, b) => {
                                if (vetSortField === 'name') {
                                  return vetSortDirection === 'asc'
                                    ? a.name.localeCompare(b.name)
                                    : b.name.localeCompare(a.name);
                                } else if (vetSortField === 'date') {
                                  return vetSortDirection === 'asc'
                                    ? new Date(a.createdAt) - new Date(b.createdAt)
                                    : new Date(b.createdAt) - new Date(a.createdAt);
                                }
                                return 0;
                              })
                              .map(vet => {
                                const SpecialtyIcon = getSpecialtyIcon(vet.specialty);
                                return (
                                  <motion.div
                                    key={vet.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                    onClick={() => setSelectedVet(vet)}
                                  >
                                    <div className="flex items-center gap-3 mb-3">
                                      {vet.avatar ? (
                                        <img
                                          src={vet.avatar}
                                          alt={vet.name}
                                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                      ) : (
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                          {vet.name.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <div>
                                        <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                          Dr. {vet.name}
                                        </h4>
                                        {vet.position && (
                                          <p className="text-sm text-gray-500">{vet.position}</p>
                                        )}
                                      </div>
                                    </div>

                                    {vet.specialty && (
                                      <div className="flex items-center gap-2 mb-3 bg-blue-50 text-blue-700 px-3 py-2 rounded-md">
                                        <SafeIcon icon={SpecialtyIcon} className="w-4 h-4" />
                                        <span className="text-sm font-medium">{vet.specialty}</span>
                                      </div>
                                    )}

                                    <div className="flex justify-end gap-1 mt-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEdit(vet);
                                        }}
                                        className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                                        aria-label={`Edit Dr. ${vet.name}`}
                                      >
                                        <SafeIcon icon={FiEdit2} className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowDeleteConfirm(vet.id);
                                        }}
                                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                        aria-label={`Delete Dr. ${vet.name}`}
                                      >
                                        <SafeIcon icon={FiTrash2} className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </motion.div>
                                );
                              })}

                            {/* Add vet to clinic button */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                              <button
                                onClick={() => {
                                  const newVetTemplate = {
                                    clinicId: clinic.id,
                                    clinicName: clinic.clinicName,
                                    isClinic: false,
                                    address: clinic.address,
                                    city: clinic.city,
                                    state: clinic.state,
                                    zipCode: clinic.zipCode,
                                    phone: clinic.phone,
                                    email: clinic.email,
                                    website: clinic.website,
                                  };
                                  setEditingVet(newVetTemplate);
                                }}
                                className="h-full min-h-[120px] w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                aria-label="Add veterinarian to clinic"
                              >
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <SafeIcon icon={FiPlus} className="w-5 h-5 text-blue-500" />
                                </div>
                                <span className="text-sm font-medium text-blue-600">Add Vet</span>
                              </button>
                            </motion.div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Independent Vets Section */}
          {independentVets.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <SafeIcon icon={FiUser} className="w-5 h-5 text-green-500" />
                  Independent Veterinarians
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVetSort('name')}
                    className={`flex items-center gap-1 text-sm ${
                      vetSortField === 'name' ? 'font-medium text-green-500' : 'text-gray-600'
                    }`}
                  >
                    Name
                    {vetSortField === 'name' && (
                      <SafeIcon
                        icon={vetSortDirection === 'asc' ? FiArrowUp : FiArrowDown}
                        className="w-3 h-3"
                      />
                    )}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => handleVetSort('date')}
                    className={`flex items-center gap-1 text-sm ${
                      vetSortField === 'date' ? 'font-medium text-green-500' : 'text-gray-600'
                    }`}
                  >
                    Date Added
                    {vetSortField === 'date' && (
                      <SafeIcon
                        icon={vetSortDirection === 'asc' ? FiArrowUp : FiArrowDown}
                        className="w-3 h-3"
                      />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {independentVets.map((vet) => {
                  // Get associated clinic information
                  const associatedClinic = vetProfiles.find(
                    clinic => clinic.id === vet.clinicId && clinic.isClinic
                  );
                  
                  const SpecialtyIcon = getSpecialtyIcon(vet.specialty);

                  return (
                    <motion.div
                      key={vet.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => setSelectedVet(vet)}
                    >
                      <div className="flex justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {vet.avatar ? (
                            <img
                              src={vet.avatar}
                              alt={vet.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm">
                              {vet.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg group-hover:text-green-600 transition-colors">Dr. {vet.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {vet.position && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <SafeIcon icon={FiBriefcase} className="w-3 h-3" />
                                  <span>{vet.position}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(vet);
                            }}
                            className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            aria-label={`Edit Dr. ${vet.name}`}
                          >
                            <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(vet.id);
                            }}
                            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label={`Delete Dr. ${vet.name}`}
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {vet.specialty && (
                        <div className="flex items-center gap-2 mb-4 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
                          <SafeIcon icon={SpecialtyIcon} className="w-4 h-4" />
                          <span className="font-medium">{vet.specialty}</span>
                        </div>
                      )}

                      {/* Contact info */}
                      <div className="space-y-2 mt-4">
                        {associatedClinic && (
                          <div className="bg-gray-50 px-4 py-3 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-700 mb-1">
                              <SafeIcon icon={FiUsers} className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{associatedClinic.clinicName}</span>
                            </div>
                            {associatedClinic.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <SafeIcon icon={FiPhone} className="w-3 h-3" />
                                <span>{associatedClinic.phone}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {vet.phone && !associatedClinic && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <SafeIcon icon={FiPhone} className="w-4 h-4 text-green-600" />
                            <span>{vet.phone}</span>
                          </div>
                        )}

                        {vet.email && !associatedClinic && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <SafeIcon icon={FiMail} className="w-4 h-4 text-green-600" />
                            <span className="truncate">{vet.email}</span>
                          </div>
                        )}
                      </div>

                      {vet.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex gap-2">
                            <SafeIcon icon={FiInfo} className="w-4 h-4 text-gray-500 mt-0.5" />
                            <p className="text-sm text-gray-600">{vet.notes}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingVet) && (
        <VetProfileModal
          vet={editingVet}
          onClose={handleCloseModal}
        />
      )}

      {/* Vet Detail Modal */}
      {selectedVet && (
        <VetDetailModal
          vet={selectedVet}
          onClose={() => setSelectedVet(null)}
          onEdit={(vet) => {
            handleEdit(vet);
            setSelectedVet(null);
          }}
        />
      )}

      {/* Duplicate Manager Modal */}
      {showDuplicateManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Duplicate Profile Manager</h3>
              <button
                onClick={() => setShowDuplicateManager(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
                aria-label="Close duplicate manager"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Found {duplicateGroups.length} group{duplicateGroups.length > 1 ? 's' : ''} of duplicate profiles. Review each group and decide which profiles to keep or delete.
              </p>
            </div>

            <div className="space-y-6">
              {duplicateGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Duplicate Group {groupIndex + 1} ({group.length} profiles)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.map((profile, profileIndex) => (
                      <div key={profile.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {profile.isClinic
                                ? profile.clinicName?.charAt(0).toUpperCase()
                                : profile.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {profile.isClinic ? profile.clinicName : `Dr. ${profile.name}`}
                              </p>
                              {!profile.isClinic && profile.specialty && (
                                <p className="text-xs text-gray-600">{profile.specialty}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(profile.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            aria-label={`Delete ${profile.isClinic ? profile.clinicName : `Dr. ${profile.name}`}`}
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          {profile.phone && <p>Phone: {profile.phone}</p>}
                          {profile.email && <p>Email: {profile.email}</p>}
                          {profile.address && <p>Address: {profile.address}</p>}
                          <p>Created: {new Date(profile.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowDuplicateManager(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleDeleteAllDuplicates}
                className="flex items-center gap-2 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
                Auto-Remove All Duplicates
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-xl max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Delete {vetProfiles.find(v => v.id === showDeleteConfirm)?.isClinic ? 'Clinic' : 'Veterinarian'}
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {vetProfiles.find(v => v.id === showDeleteConfirm)?.clinicName || 'Dr. ' + vetProfiles.find(v => v.id === showDeleteConfirm)?.name}?
              {vetProfiles.find(v => v.id === showDeleteConfirm)?.isClinic && getClinicVets(showDeleteConfirm).length > 0 && (
                <span className="block mt-2 text-red-600">
                  This will also remove {getClinicVets(showDeleteConfirm).length} associated veterinarians.
                </span>
              )}
              This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VetProfiles;
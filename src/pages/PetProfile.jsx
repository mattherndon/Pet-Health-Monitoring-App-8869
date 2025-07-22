import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePets } from '../context/PetContext';
import { useProfiles } from '../context/ProfileContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import EditPetModal from '../components/EditPetModal';

const { FiArrowLeft, FiEdit2, FiTrash2, FiActivity, FiCalendar, FiHeart, FiUser, FiPlus } = FiIcons;

const PetProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pets, healthLogs, vetAppointments, deletePet, updatePet } = usePets();
  const { vetProfiles } = useProfiles();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVetDropdown, setShowVetDropdown] = useState(false);

  const pet = pets.find(p => p.id === id);
  const petHealthLogs = healthLogs.filter(log => log.petId === id);
  const petAppointments = vetAppointments.filter(apt => apt.petId === id);

  // Get only individual vets (non-clinics)
  const availableVets = vetProfiles.filter(vet => !vet.isClinic);

  if (!pet) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="text-center py-8">
          <p className="text-gray-600">Pet not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-500 hover:text-blue-600"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deletePet(id);
    navigate('/');
  };

  const handleEdit = (updatedPet) => {
    updatePet(id, updatedPet);
    setShowEditModal(false);
  };

  const handleAssignVet = (vetId) => {
    const selectedVet = vetProfiles.find(v => v.id === vetId);
    updatePet(id, {
      ...pet,
      primaryVetId: vetId,
      primaryVetName: selectedVet ? selectedVet.name : null
    });
    setShowVetDropdown(false);
  };

  const upcomingAppointments = petAppointments
    .filter(apt => new Date(apt.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const recentHealthLogs = petHealthLogs
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Find primary vet if assigned
  const primaryVet = pet.primaryVetId 
    ? vetProfiles.find(v => v.id === pet.primaryVetId) 
    : null;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
          Back
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-6">
            {pet.image ? (
              <img
                src={pet.image}
                alt={pet.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {pet.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{pet.name}</h1>
              <p className="text-lg text-gray-600 capitalize mb-1">
                {pet.species} • {pet.breed}
              </p>
              <p className="text-gray-500">{pet.age} years old • {pet.weight} lbs</p>
              {pet.color && <p className="text-gray-500">Color: {pet.color}</p>}
              {pet.gender && <p className="text-gray-500">Gender: {pet.gender}</p>}
              {pet.microchipId && <p className="text-gray-500">Microchip ID: {pet.microchipId}</p>}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiEdit2} className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiTrash2} className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Primary Veterinarian Section */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <SafeIcon icon={FiUser} className="w-5 h-5 text-blue-500" />
              Primary Veterinarian
            </h3>
            <div className="relative">
              <button
                onClick={() => setShowVetDropdown(!showVetDropdown)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {primaryVet ? 'Change' : 'Assign'} Veterinarian
              </button>
              {showVetDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="p-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">Select Veterinarian</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {availableVets.length === 0 ? (
                      <div className="p-3 text-center text-sm text-gray-500">
                        No veterinarians available
                      </div>
                    ) : (
                      availableVets.map(vet => (
                        <button
                          key={vet.id}
                          onClick={() => handleAssignVet(vet.id)}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2"
                        >
                          {vet.avatar ? (
                            <img
                              src={vet.avatar}
                              alt={vet.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {vet.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-800">Dr. {vet.name}</p>
                            {vet.specialty && <p className="text-xs text-gray-500">{vet.specialty}</p>}
                          </div>
                        </button>
                      ))
                    )}
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={() => {
                          navigate('/vet-profiles');
                          setShowVetDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center gap-2"
                      >
                        <SafeIcon icon={FiPlus} className="w-4 h-4" />
                        Add New Veterinarian
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {primaryVet ? (
            <div className="flex items-center gap-3 mt-3">
              {primaryVet.avatar ? (
                <img
                  src={primaryVet.avatar}
                  alt={primaryVet.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                  {primaryVet.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-800">Dr. {primaryVet.name}</p>
                {primaryVet.specialty && <p className="text-sm text-gray-600">{primaryVet.specialty}</p>}
                {primaryVet.phone && (
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <SafeIcon icon={FiIcons.FiPhone} className="w-3 h-3" />
                    <span>{primaryVet.phone}</span>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No primary veterinarian assigned yet</p>
          )}
        </div>

        {pet.notes && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Notes</h3>
            <p className="text-gray-600">{pet.notes}</p>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Health History</h2>
            <button
              onClick={() => navigate('/health')}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </button>
          </div>

          {recentHealthLogs.length === 0 ? (
            <div className="text-center py-4">
              <SafeIcon icon={FiActivity} className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No health records yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentHealthLogs.map((log) => (
                <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-800 capitalize">{log.type}</span>
                    <span className="text-sm text-gray-500">{new Date(log.date).toLocaleDateString()}</span>
                  </div>
                  {log.notes && <p className="text-sm text-gray-600">{log.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h2>
            <button
              onClick={() => navigate('/health')}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </button>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-4">
              <SafeIcon icon={FiCalendar} className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-800 capitalize">{appointment.type}</span>
                    <span className="text-sm text-gray-500">{new Date(appointment.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {appointment.vetName && ` with Dr. ${appointment.vetName}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Health Vitals</h2>
          <button
            onClick={() => navigate('/heart-rate')}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            Measure Heart Rate
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Weight Tracking */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <SafeIcon icon={FiActivity} className="w-5 h-5 text-green-500" />
              <h3 className="font-medium text-gray-800">Weight</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{pet.weight} lbs</p>
          </div>

          {/* Heart Rate */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <SafeIcon icon={FiHeart} className="w-5 h-5 text-red-500" />
              <h3 className="font-medium text-gray-800">Heart Rate</h3>
            </div>
            {petHealthLogs.find(log => log.heartRate) ? (
              <p className="text-2xl font-bold text-gray-900">
                {petHealthLogs
                  .filter(log => log.heartRate)
                  .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
                  .heartRate} bpm
              </p>
            ) : (
              <p className="text-gray-500 text-sm">Not measured yet</p>
            )}
          </div>

          {/* Age */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <SafeIcon icon={FiCalendar} className="w-5 h-5 text-blue-500" />
              <h3 className="font-medium text-gray-800">Age</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{pet.age} years</p>
          </div>
        </div>
      </motion.div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditPetModal
          pet={pet}
          onClose={() => setShowEditModal(false)}
          onSave={handleEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-xl max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Pet</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {pet.name}? This will also remove all health logs and appointments.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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

export default PetProfile;
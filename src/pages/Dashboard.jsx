import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePets } from '../context/PetContext';
import { useProfiles } from '../context/ProfileContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiHeart, FiCalendar, FiActivity, FiUser, FiUsers, FiSettings, FiArrowUp, FiArrowDown } = FiIcons;

const Dashboard = () => {
  const { pets, healthLogs, vetAppointments } = usePets();
  const { vetProfiles } = useProfiles();
  const [petSortField, setPetSortField] = useState('name');
  const [petSortDirection, setPetSortDirection] = useState('asc');
  const [vetSortField, setVetSortField] = useState('name');
  const [vetSortDirection, setVetSortDirection] = useState('asc');

  // Sort pets based on current sort field and direction
  const sortedPets = [...pets].sort((a, b) => {
    if (petSortField === 'name') {
      return petSortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (petSortField === 'date') {
      return petSortDirection === 'asc' 
        ? new Date(a.createdAt) - new Date(b.createdAt) 
        : new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });

  // Sort vets based on current sort field and direction
  const sortedVets = [...vetProfiles]
    .filter(v => !v.isClinic)
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
    .slice(0, 3);

  const upcomingAppointments = vetAppointments
    .filter(apt => new Date(apt.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const recentHealthLogs = healthLogs
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  // Toggle pet sort direction or change sort field
  const handlePetSort = (field) => {
    if (field === petSortField) {
      setPetSortDirection(petSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setPetSortField(field);
      setPetSortDirection('asc');
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

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-black mb-2">Pet Dashboard</h1>
        <p className="text-gray-600">Monitor your pets' health and appointments</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          <Link
            to="/add-pet"
            className="flex items-center gap-2 bg-primary text-neutral-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            Add Pet
          </Link>
          <Link
            to="/vet-profiles"
            className="flex items-center gap-2 bg-secondary text-neutral-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
          >
            <SafeIcon icon={FiUsers} className="w-4 h-4" />
            Manage Vets
          </Link>
          <Link
            to="/user-profile"
            className="flex items-center gap-2 bg-accent-yellow text-neutral-black px-4 py-2 rounded-lg hover:bg-accent-yellow/90 transition-colors"
          >
            <SafeIcon icon={FiSettings} className="w-4 h-4" />
            User Profile
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-white p-4 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pets</p>
              <p className="text-2xl font-bold text-primary">{pets.length}</p>
            </div>
            <SafeIcon icon={FiHeart} className="w-8 h-8 text-primary" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-white p-4 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Health Logs</p>
              <p className="text-2xl font-bold text-primary-dark">{healthLogs.length}</p>
            </div>
            <SafeIcon icon={FiActivity} className="w-8 h-8 text-primary-dark" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-neutral-white p-4 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Appointments</p>
              <p className="text-2xl font-bold text-secondary">{vetAppointments.length}</p>
            </div>
            <SafeIcon icon={FiCalendar} className="w-8 h-8 text-secondary" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-neutral-white p-4 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Veterinarians</p>
              <p className="text-2xl font-bold text-primary-dark">{vetProfiles.filter(v => !v.isClinic).length}</p>
            </div>
            <SafeIcon icon={FiUser} className="w-8 h-8 text-primary-dark" />
          </div>
        </motion.div>
      </div>

      {/* My Pets */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-black">My Pets</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePetSort('name')}
                className={`flex items-center gap-1 text-sm ${
                  petSortField === 'name' ? 'font-medium text-primary' : 'text-gray-600'
                }`}
              >
                Name
                {petSortField === 'name' && (
                  <SafeIcon icon={petSortDirection === 'asc' ? FiArrowUp : FiArrowDown} className="w-3 h-3" />
                )}
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => handlePetSort('date')}
                className={`flex items-center gap-1 text-sm ${
                  petSortField === 'date' ? 'font-medium text-primary' : 'text-gray-600'
                }`}
              >
                Date Added
                {petSortField === 'date' && (
                  <SafeIcon icon={petSortDirection === 'asc' ? FiArrowUp : FiArrowDown} className="w-3 h-3" />
                )}
              </button>
            </div>
            <Link
              to="/add-pet"
              className="flex items-center gap-2 bg-primary text-neutral-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              Add Pet
            </Link>
          </div>
        </div>

        {sortedPets.length === 0 ? (
          <div className="bg-neutral-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <SafeIcon icon={FiHeart} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No pets added yet</p>
            <Link
              to="/add-pet"
              className="inline-flex items-center gap-2 bg-primary text-neutral-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5" />
              Add Your First Pet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPets.map((pet, index) => {
              // Get primary vet if assigned
              const primaryVet = pet.primaryVetId 
                ? vetProfiles.find(v => v.id === pet.primaryVetId) 
                : null;

              return (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-neutral-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <Link to={`/pet/${pet.id}`}>
                    <div className="flex items-center gap-4 mb-4">
                      {pet.image ? (
                        <img
                          src={pet.image}
                          alt={pet.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-neutral-white text-xl font-bold">
                          {pet.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-neutral-black">{pet.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{pet.species} • {pet.breed}</p>
                        <p className="text-xs text-gray-500">{pet.age} years old</p>
                      </div>
                    </div>
                  </Link>

                  {/* Show primary vet info if assigned */}
                  {primaryVet && (
                    <div className="mt-2 p-2 bg-primary-light/20 rounded-lg flex items-center gap-2">
                      <SafeIcon icon={FiUser} className="w-4 h-4 text-primary" />
                      <span className="text-sm text-primary-dark">Dr. {primaryVet.name}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-black">Recent Health Logs</h3>
            <Link
              to="/health"
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          {recentHealthLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No health logs yet</p>
          ) : (
            <div className="space-y-3">
              {recentHealthLogs.map((log) => {
                const pet = pets.find(p => p.id === log.petId);
                return (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-black">{pet?.name}</p>
                      <p className="text-sm text-gray-600">{log.type}</p>
                      <p className="text-xs text-gray-500">{new Date(log.date).toLocaleDateString()}</p>
                    </div>
                    <SafeIcon icon={FiActivity} className="w-5 h-5 text-primary-dark" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-neutral-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-black">Upcoming Appointments</h3>
            <Link
              to="/health"
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => {
                const pet = pets.find(p => p.id === appointment.petId);
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-black">{pet?.name}</p>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                      <p className="text-xs text-gray-500">{new Date(appointment.date).toLocaleDateString()}</p>
                    </div>
                    <SafeIcon icon={FiCalendar} className="w-5 h-5 text-secondary" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Access to Vet Profiles */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-black">My Veterinarians</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVetSort('name')}
                className={`flex items-center gap-1 text-sm ${
                  vetSortField === 'name' ? 'font-medium text-primary' : 'text-gray-600'
                }`}
              >
                Name
                {vetSortField === 'name' && (
                  <SafeIcon icon={vetSortDirection === 'asc' ? FiArrowUp : FiArrowDown} className="w-3 h-3" />
                )}
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => handleVetSort('date')}
                className={`flex items-center gap-1 text-sm ${
                  vetSortField === 'date' ? 'font-medium text-primary' : 'text-gray-600'
                }`}
              >
                Date Added
                {vetSortField === 'date' && (
                  <SafeIcon icon={vetSortDirection === 'asc' ? FiArrowUp : FiArrowDown} className="w-3 h-3" />
                )}
              </button>
            </div>
            <Link
              to="/vet-profiles"
              className="flex items-center gap-2 text-primary hover:text-primary-dark text-sm"
            >
              View All
            </Link>
          </div>
        </div>

        {vetProfiles.filter(v => !v.isClinic).length === 0 ? (
          <div className="bg-neutral-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <SafeIcon icon={FiUser} className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No veterinarians added yet</p>
            <Link
              to="/vet-profiles"
              className="inline-flex items-center gap-2 bg-secondary text-neutral-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              Add Veterinarian
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedVets.map((vet) => (
              <motion.div
                key={vet.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-white p-4 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  {vet.avatar ? (
                    <img
                      src={vet.avatar}
                      alt={vet.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary-dark rounded-full flex items-center justify-center text-neutral-white text-lg font-bold">
                      {vet.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-neutral-black">Dr. {vet.name}</h3>
                    {vet.specialty && <p className="text-xs text-gray-600">{vet.specialty}</p>}
                    {vet.phone && <p className="text-xs text-gray-500">{vet.phone}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
            {vetProfiles.filter(v => !v.isClinic).length > 3 && (
              <Link
                to="/vet-profiles"
                className="bg-neutral-white p-4 rounded-xl shadow-sm border border-gray-100 hover:bg-gray-100 flex items-center justify-center"
              >
                <span className="text-primary">View {vetProfiles.filter(v => !v.isClinic).length - 3} more...</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
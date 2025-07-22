import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePets } from '../context/PetContext';
import { useProfiles } from '../context/ProfileContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiCalendar, FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2, FiActivity } = FiIcons;

const Appointments = () => {
  const { pets, vetAppointments, addVetAppointment, deleteVetAppointment } = usePets();
  const { vetProfiles } = useProfiles();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.petId || !formData.date || !formData.time) {
      alert('Please fill in all required fields');
      return;
    }

    const appointmentDateTime = new Date(`${formData.date}T${formData.time}`);
    
    // Get vet info if selected
    const selectedVet = vetProfiles.find(vet => vet.id === formData.vetId);
    
    const appointmentData = {
      ...formData,
      date: appointmentDateTime.toISOString(),
      vetName: selectedVet ? selectedVet.name : formData.vetName,
      vetPhone: selectedVet ? selectedVet.phone : formData.vetPhone
    };

    addVetAppointment(appointmentData);
    
    setFormData({
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
    
    setShowAddForm(false);
    setSelectedDate(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-fill vet info when vet is selected
    if (name === 'vetId' && value) {
      const selectedVet = vetProfiles.find(vet => vet.id === value);
      if (selectedVet) {
        setFormData(prev => ({
          ...prev,
          vetName: selectedVet.name,
          vetPhone: selectedVet.phone
        }));
      }
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setFormData(prev => ({
      ...prev,
      date: format(date, 'yyyy-MM-dd')
    }));
    setShowAddForm(true);
  };

  const getAppointmentsForDate = (date) => {
    return vetAppointments.filter(apt => isSameDay(new Date(apt.date), date));
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const upcomingAppointments = vetAppointments
    .filter(apt => new Date(apt.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Appointments</h1>
            <p className="text-gray-600">Schedule and manage vet appointments</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/health"
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <SafeIcon icon={FiActivity} className="w-4 h-4" />
              View Health Logs
            </Link>
            <button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              Add Appointment
            </button>
          </div>
        </div>
      </div>

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
                      <p>{format(new Date(appointment.date), 'MMM d, yyyy')}</p>
                      <p>{format(new Date(appointment.date), 'h:mm a')}</p>
                      {appointment.vetName && <p>Dr. {appointment.vetName}</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Schedule Appointment</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Veterinarian</label>
                  <select
                    name="vetId"
                    value={formData.vetId}
                    onChange={handleChange}
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
                    value={formData.vetName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dr. Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vet Phone</label>
                  <input
                    type="tel"
                    name="vetPhone"
                    value={formData.vetPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes about the appointment..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="reminder"
                  checked={formData.reminder}
                  onChange={handleChange}
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
                    setShowAddForm(false);
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

export default Appointments;
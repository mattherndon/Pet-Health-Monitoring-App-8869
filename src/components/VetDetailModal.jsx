import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { 
  FiX, FiUser, FiBriefcase, FiMail, FiPhone, 
  FiMapPin, FiGlobe, FiClock, FiHeart, FiAward,
  FiCalendar, FiEdit2
} = FiIcons;

const VetDetailModal = ({ vet, onClose, onEdit }) => {
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

  const SpecialtyIcon = getSpecialtyIcon(vet.specialty);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Veterinarian Profile</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
              aria-label="Close"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-start gap-6 mb-8">
            {vet.avatar ? (
              <img
                src={vet.avatar}
                alt={vet.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {vet.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Dr. {vet.name}</h3>
                  {vet.position && (
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <SafeIcon icon={FiBriefcase} className="w-4 h-4" />
                      {vet.position}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onEdit(vet)}
                  className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="Edit profile"
                >
                  <SafeIcon icon={FiEdit2} className="w-5 h-5" />
                </button>
              </div>

              {/* Specialty Badge */}
              {vet.specialty && (
                <div className="inline-flex items-center gap-2 mt-3 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
                  <SafeIcon icon={SpecialtyIcon} className="w-5 h-5" />
                  <span className="font-medium">{vet.specialty}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h4 className="font-semibold text-gray-800 mb-4">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vet.phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <SafeIcon icon={FiPhone} className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-800">{vet.phone}</p>
                  </div>
                </div>
              )}
              {vet.email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <SafeIcon icon={FiMail} className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800">{vet.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clinic Information */}
          {vet.clinicName && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">Practice Location</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <SafeIcon icon={FiMapPin} className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Clinic</p>
                    <p className="text-gray-800 font-medium">{vet.clinicName}</p>
                    {vet.address && (
                      <p className="text-gray-600 mt-1">
                        {vet.address}
                        {(vet.city || vet.state) && (
                          <span className="block">
                            {[vet.city, vet.state, vet.zipCode].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {vet.website && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      <SafeIcon icon={FiGlobe} className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <a
                        href={vet.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {vet.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}

                {vet.hours && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      <SafeIcon icon={FiClock} className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hours</p>
                      <p className="text-gray-800">{vet.hours}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Information */}
          {(vet.notes || vet.createdAt) && (
            <div className="space-y-4">
              {vet.notes && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
                  <p className="text-gray-600">{vet.notes}</p>
                </div>
              )}
              {vet.createdAt && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                  <span>Added on {new Date(vet.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VetDetailModal;
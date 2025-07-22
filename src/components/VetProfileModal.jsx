import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useProfiles } from '../context/ProfileContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { optimizeImage, validateImage } from '../lib/imageOptimizer';
import { scrapeVetInfo, validateScrapedData, getScrapingHints } from '../lib/vetScraper';

const { FiSave, FiX, FiImage, FiTrash2, FiGlobe, FiDownload, FiAlertTriangle, FiCheck, FiUsers, FiInfo, FiLink, FiMapPin, FiPhone, FiAlert } = FiIcons;

const VetProfileModal = ({ vet, onClose }) => {
  const { addVetProfile, updateVetProfile, vetProfiles, isDuplicate, findSimilarProfiles } = useProfiles();
  const [formData, setFormData] = useState({
    name: vet?.name || '',
    specialty: vet?.specialty || '',
    clinicName: vet?.clinicName || '',
    phone: vet?.phone || '',
    email: vet?.email || '',
    website: vet?.website || '',
    address: vet?.address || '',
    city: vet?.city || '',
    state: vet?.state || '',
    zipCode: vet?.zipCode || '',
    hours: vet?.hours || '',
    emergencyPhone: vet?.emergencyPhone || '',
    notes: vet?.notes || '',
    avatar: vet?.avatar || null,
    isClinic: vet?.isClinic !== undefined ? vet.isClinic : true, // Default to clinic
    clinicId: vet?.clinicId || null,
    position: vet?.position || '',
  });
  const [imagePreview, setImagePreview] = useState(vet?.avatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [similarProfiles, setSimilarProfiles] = useState([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  // Web scraping states
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeResults, setScrapeResults] = useState(null);
  const [showScrapePreview, setShowScrapePreview] = useState(false);
  const [showTeamPreview, setShowTeamPreview] = useState(false);
  const [createTeamMembers, setCreateTeamMembers] = useState(false);

  const specialties = [
    'General Practice', 'Emergency Medicine', 'Surgery', 'Cardiology', 'Dermatology',
    'Oncology', 'Orthopedics', 'Ophthalmology', 'Dentistry', 'Exotic Animals',
    'Internal Medicine', 'Neurology', 'Radiology', 'Behavior', 'Nutrition',
    'Rehabilitation', 'Other'
  ];

  // Get clinics for dropdown (exclude current vet if editing)
  const availableClinics = vetProfiles
    .filter(profile => profile.isClinic && (!vet || profile.id !== vet.id))
    .sort((a, b) => a.clinicName.localeCompare(b.clinicName));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = { ...formData, [name]: type === 'checkbox' ? checked : value };
    setFormData(newFormData);

    // Check for duplicates and similar profiles as user types
    if ((name === 'name' || name === 'clinicName' || name === 'phone' || name === 'email') && value.trim()) {
      const similar = findSimilarProfiles(newFormData);
      setSimilarProfiles(similar);
      const isDupe = isDuplicate(newFormData, vet?.id);
      setShowDuplicateWarning(isDupe);
      
      if (isDupe) {
        setError('This profile appears to be a duplicate of an existing entry.');
      } else if (similar.length > 0) {
        setError(`Found ${similar.length} similar profile(s). Please review before saving.`);
      } else {
        setError(null);
      }
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      setError(null);
      validateImage(file);
      const optimized = await optimizeImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8,
        type: 'image/jpeg'
      });
      setImagePreview(optimized.dataUrl);
      setFormData(prev => ({ ...prev, avatar: optimized.dataUrl }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, avatar: null }));
  };

  // Web scraping functionality with improved AI approach and server-side support
  const handleScrapeWebsite = async () => {
    if (!scrapeUrl.trim()) {
      setError('Please enter a website URL');
      return;
    }
    
    setIsScraping(true);
    setError(null);
    setScrapeResults(null);
    
    try {
      const results = await scrapeVetInfo(scrapeUrl.trim());
      setScrapeResults(results);
      setShowScrapePreview(true);
    } catch (err) {
      setError('Failed to scrape website: ' + err.message);
    } finally {
      setIsScraping(false);
    }
  };

  const applyScrapeResults = () => {
    if (scrapeResults?.success && scrapeResults.data) {
      const scrapedData = scrapeResults.data;
      
      // Map the scraped data to our form data structure
      const newFormData = {
        ...formData,
        name: formData.isClinic ? '' : (scrapedData.name || formData.name),
        specialty: formData.isClinic ? '' : (scrapedData.specialty || formData.specialty),
        clinicName: scrapedData.clinicName || formData.clinicName,
        phone: scrapedData.phone || formData.phone,
        email: scrapedData.email || formData.email,
        website: scrapedData.website || formData.website,
        address: scrapedData.address || formData.address,
        city: scrapedData.city || formData.city,
        state: scrapedData.state || formData.state,
        zipCode: scrapedData.zipCode || formData.zipCode,
        hours: scrapedData.hours || formData.hours,
        isClinic: true // Scraping always creates a clinic first
      };
      
      setFormData(newFormData);
      
      // Check for duplicates with scraped data
      const similar = findSimilarProfiles(newFormData);
      setSimilarProfiles(similar);
      const isDupe = isDuplicate(newFormData, vet?.id);
      setShowDuplicateWarning(isDupe);
      
      setShowScrapePreview(false);
      
      if (scrapedData.team && scrapedData.team.length > 0) {
        setShowTeamPreview(true);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.clinicName && formData.isClinic) {
      setError('Please enter a clinic name');
      return;
    }
    
    if (!formData.isClinic && !formData.clinicId && !formData.name) {
      setError('Please enter a veterinarian name');
      return;
    }
    
    // Final duplicate check
    if (showDuplicateWarning) {
      setError('Cannot save: This profile is a duplicate of an existing entry.');
      return;
    }
    
    try {
      // Handle team member creation after clinic is saved
      if (createTeamMembers && scrapeResults?.data?.team && formData.isClinic) {
        let clinicId;
        
        if (vet) {
          updateVetProfile(vet.id, { ...formData, name: '', specialty: '' });
          clinicId = vet.id;
        } else {
          const clinic = addVetProfile({ ...formData, name: '', specialty: '' });
          clinicId = clinic.id;
        }
        
        scrapeResults.data.team.forEach(member => {
          try {
            addVetProfile({
              name: member.name,
              specialty: member.specialty || '',
              position: member.role || '',
              avatar: member.image || null,
              clinicName: formData.clinicName,
              phone: formData.phone,
              email: formData.email,
              website: formData.website,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              clinicId: clinicId,
              isClinic: false
            });
          } catch (err) {
            console.warn(`Skipped duplicate team member: ${member.name}`);
          }
        });
      } else {
        if (vet) {
          updateVetProfile(vet.id, formData);
        } else {
          addVetProfile(formData);
        }
      }
      
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const selectTeamMember = (member) => {
    if (!formData.isClinic) {
      setFormData(prev => ({
        ...prev,
        name: member.name,
        specialty: member.specialty || prev.specialty,
        position: member.role || prev.position
      }));
    }
    
    setShowTeamPreview(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {vet ? 'Edit' : 'Add'} {formData.isClinic ? 'Veterinary Clinic' : 'Veterinarian'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Entity Type Selection */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Profile Type:</h3>
              <div className="flex p-1 bg-gray-100 rounded-full">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isClinic: true, clinicId: null, name: '' }))}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    formData.isClinic ? 'bg-primary text-neutral-white' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Clinic
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isClinic: false, clinicId: null }))}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    !formData.isClinic ? 'bg-primary text-neutral-white' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Veterinarian
                </button>
              </div>
            </div>
          </div>

          {/* Duplicate Warning */}
          {(showDuplicateWarning || similarProfiles.length > 0) && (
            <div className={`mb-6 p-4 rounded-lg border ${
              showDuplicateWarning ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start gap-3">
                <SafeIcon 
                  icon={showDuplicateWarning ? FiAlertTriangle : FiAlert} 
                  className={`w-5 h-5 mt-0.5 ${showDuplicateWarning ? 'text-red-500' : 'text-yellow-500'}`} 
                />
                <div>
                  <h4 className={`font-semibold ${showDuplicateWarning ? 'text-red-800' : 'text-yellow-800'}`}>
                    {showDuplicateWarning ? 'Duplicate Profile Detected' : 'Similar Profiles Found'}
                  </h4>
                  <p className={`text-sm mt-1 ${showDuplicateWarning ? 'text-red-700' : 'text-yellow-700'}`}>
                    {showDuplicateWarning 
                      ? 'This profile appears to be identical to an existing entry.' 
                      : `Found ${similarProfiles.length} similar profile(s). Please review to avoid duplicates.`}
                  </p>
                  
                  {similarProfiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {similarProfiles.slice(0, 3).map((similar, index) => (
                        <div key={index} className="p-2 bg-white rounded border">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold">
                              {similar.profile.isClinic 
                                ? similar.profile.clinicName?.charAt(0).toUpperCase() 
                                : similar.profile.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {similar.profile.isClinic ? similar.profile.clinicName : `Dr. ${similar.profile.name}`}
                              </p>
                              <p className="text-xs text-gray-600">
                                {similar.reasons.join(', ')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {similarProfiles.length > 3 && (
                        <p className="text-xs text-gray-600">
                          ...and {similarProfiles.length - 3} more similar profiles
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Web Scraping Section - Only show for clinics */}
          {formData.isClinic && (
            <div className="mb-6 p-4 bg-[#EDFBF6] border border-primary-dark rounded-lg">
              <h3 className="text-lg font-semibold text-primary-dark mb-3 flex items-center gap-2">
                <SafeIcon icon={FiGlobe} className="w-5 h-5" />
                AI Auto-fill
              </h3>
              <p className="text-sm text-primary-dark mb-4">
                Enter a veterinary clinic website URL to extract comprehensive information
              </p>
              
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <input
                  type="url"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  placeholder="https://example-vet-clinic.com"
                  className="flex-1 px-3 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleScrapeWebsite}
                  disabled={isScraping}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-neutral-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScraping ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <SafeIcon icon={FiDownload} className="w-4 h-4" />
                  )}
                  {isScraping ? 'Extracting...' : 'Extract Info'}
                </button>
              </div>
              
              {scrapeUrl && (
                <div className="mt-2 flex items-start gap-2">
                  <SafeIcon icon={FiInfo} className="w-4 h-4 text-primary-dark mt-0.5" />
                  <p className="text-xs text-primary-dark">
                    {getScrapingHints(scrapeUrl)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              showDuplicateWarning ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <SafeIcon 
                icon={FiAlertTriangle} 
                className={`w-5 h-5 ${showDuplicateWarning ? 'text-red-500' : 'text-yellow-500'}`} 
              />
              <p className={`text-sm ${showDuplicateWarning ? 'text-red-700' : 'text-yellow-700'}`}>
                {error}
              </p>
            </div>
          )}

          {/* Profile Photo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.isClinic ? 'Clinic Logo' : 'Profile Photo'}
            </label>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                {imagePreview ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                    <img 
                      src={imagePreview} 
                      alt={formData.isClinic ? "Clinic preview" : "Vet preview"} 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-0 right-0 p-1 bg-accent-red text-neutral-white rounded-full"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <SafeIcon icon={FiImage} className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div>
                <label className="block">
                  <span className="sr-only">Choose photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary-light/80"
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">JPEG, PNG or WebP. Max 5MB.</p>
              </div>
            </div>
          </div>
          
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {formData.isClinic ? (
              // Show all fields for clinics
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinic Name *
                  </label>
                  <input
                    type="text"
                    name="clinicName"
                    value={formData.clinicName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Animal Hospital"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="vet@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
              </>
            ) : (
              // Show limited fields for individual vets
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Veterinarian Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Dr. Smith"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position/Title
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Medical Director"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Associated Clinic
                  </label>
                  <select
                    name="clinicId"
                    value={formData.clinicId || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select associated clinic</option>
                    {availableClinics.map(clinic => (
                      <option key={clinic.id} value={clinic.id}>{clinic.clinicName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialty
                  </label>
                  <select
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select specialty</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>
                
                {/* Only show clinic phone number as read-only if associated with a clinic */}
                {formData.clinicId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clinic Phone Number
                    </label>
                    <input
                      type="tel"
                      value={availableClinics.find(c => c.id === formData.clinicId)?.phone || ''}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
                      disabled
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Only show address and additional information for clinics */}
          {formData.isClinic && (
            <>
              {/* Address Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="12345"
                  />
                </div>
              </div>
              
              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hours
                  </label>
                  <input
                    type="text"
                    name="hours"
                    value={formData.hours}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Mon-Fri 8AM-6PM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </>
          )}

          {/* Notes field for both types */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Additional notes..."
            />
          </div>

          {/* Team member creation option */}
          {formData.isClinic && scrapeResults?.data?.team && scrapeResults.data.team.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3 mb-2">
                <input
                  type="checkbox"
                  id="createTeamMembers"
                  checked={createTeamMembers}
                  onChange={() => setCreateTeamMembers(!createTeamMembers)}
                  className="h-5 w-5 mt-0.5 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <div>
                  <label htmlFor="createTeamMembers" className="font-semibold text-green-800 cursor-pointer">
                    Automatically create {scrapeResults.data.team.length} team members
                  </label>
                  <p className="text-sm text-green-700">
                    This will create individual profiles for each team member found on the website.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTeamPreview(true)}
                className="mt-2 flex items-center gap-2 text-sm text-primary hover:text-primary-dark"
              >
                <SafeIcon icon={FiUsers} className="w-4 h-4" />
                <span>View team members ({scrapeResults.data.team.length})</span>
              </button>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={showDuplicateWarning}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                showDuplicateWarning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-neutral-white hover:bg-primary-dark'
              }`}
            >
              <SafeIcon icon={FiSave} className="w-5 h-5" />
              {vet ? 'Update' : 'Save'} {formData.isClinic ? 'Clinic' : 'Veterinarian'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Scrape Results Preview Modal */}
      {showScrapePreview && scrapeResults && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-60">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Extracted Clinic Information
                </h3>
                <button
                  onClick={() => setShowScrapePreview(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>
              
              {scrapeResults.success ? (
                <div>
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500" />
                    <p className="text-green-700 text-sm">{scrapeResults.message}</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {scrapeResults.data.clinicName && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-600">Clinic Name:</span>
                        <span className="text-gray-800 max-w-xs text-right">
                          {scrapeResults.data.clinicName}
                        </span>
                      </div>
                    )}
                    
                    {scrapeResults.data.address && (
                      <div className="flex items-start justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-600 flex items-center gap-1">
                          <SafeIcon icon={FiMapPin} className="w-4 h-4 text-gray-500" />
                          Address:
                        </span>
                        <div className="text-right text-gray-800">
                          <div>{scrapeResults.data.address}</div>
                          {scrapeResults.data.city && (
                            <div>
                              {scrapeResults.data.city}, {scrapeResults.data.state} {scrapeResults.data.zipCode}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {scrapeResults.data.phone && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-600 flex items-center gap-1">
                          <SafeIcon icon={FiPhone} className="w-4 h-4 text-gray-500" />
                          Phone:
                        </span>
                        <span className="text-gray-800">{scrapeResults.data.phone}</span>
                      </div>
                    )}
                    
                    {Object.entries(scrapeResults.data).map(([key, value]) => {
                      if (
                        ['clinicName', 'address', 'city', 'state', 'zipCode', 'phone', 'meta', 'team'].includes(key) ||
                        typeof value === 'object' ||
                        !value
                      ) {
                        return null;
                      }
                      
                      return (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-gray-800 max-w-xs text-right">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {scrapeResults.data.team && scrapeResults.data.team.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <SafeIcon icon={FiUsers} className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-blue-800">
                          {scrapeResults.data.team.length} Team Members Found
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">
                        We found {scrapeResults.data.team.length} veterinarians on this website.
                        You can view and select them after applying this information.
                      </p>
                    </div>
                  )}
                  
                  {scrapeResults.data.website && (
                    <div className="mb-4 flex justify-center">
                      <a
                        href={scrapeResults.data.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark"
                      >
                        <SafeIcon icon={FiLink} className="w-4 h-4" />
                        Visit Website
                      </a>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowScrapePreview(false)}
                      className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={applyScrapeResults}
                      className="flex-1 py-2 px-4 bg-primary text-neutral-white rounded-lg hover:bg-primary-dark"
                    >
                      Apply Information
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-red-500" />
                    <p className="text-red-700 text-sm">{scrapeResults.message}</p>
                  </div>
                  <button
                    onClick={() => setShowScrapePreview(false)}
                    className="w-full py-2 px-4 bg-gray-500 text-neutral-white rounded-lg hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Team Preview Modal */}
      {showTeamPreview && scrapeResults?.data?.team && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-60">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Veterinary Team at {scrapeResults.data.clinicName || "Clinic"}
                </h3>
                <button
                  onClick={() => setShowTeamPreview(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {scrapeResults.data.team.map((teamMember, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => selectTeamMember(teamMember)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {teamMember.image ? (
                        <img
                          src={teamMember.image}
                          alt={teamMember.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '';
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      
                      <div
                        className={`w-12 h-12 rounded-full bg-primary text-neutral-white flex items-center justify-center text-lg font-bold ${
                          teamMember.image ? 'hidden' : ''
                        }`}
                      >
                        {teamMember.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {teamMember.name}
                        </h4>
                        {teamMember.role && (
                          <p className="text-sm text-gray-600">
                            {teamMember.role}
                          </p>
                        )}
                        {teamMember.specialty && (
                          <p className="text-xs text-primary">
                            {teamMember.specialty}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {teamMember.bio && (
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {teamMember.bio}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={() => setShowTeamPreview(false)}
                  className="py-2 px-6 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VetProfileModal;
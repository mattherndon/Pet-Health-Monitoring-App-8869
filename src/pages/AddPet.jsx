import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {usePets} from '../context/PetContext';
import {useProfiles} from '../context/ProfileContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {optimizeImage, validateImage} from '../lib/imageOptimizer';

const {FiSave, FiArrowLeft, FiImage, FiTrash2, FiUser} = FiIcons;

const AddPet = () => {
  const navigate = useNavigate();
  const {addPet} = usePets();
  const {vetProfiles} = useProfiles();

  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    weight: '',
    color: '',
    gender: 'male',
    microchipId: '',
    notes: '',
    image: null,
    primaryVetId: '',
    primaryVetName: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  // Get only individual vets (non-clinics)
  const availableVets = vetProfiles.filter(vet => !vet.isClinic);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.breed || !formData.age) {
      alert('Please fill in all required fields');
      return;
    }

    // Find the selected vet to get the name
    const selectedVet = formData.primaryVetId ? vetProfiles.find(v => v.id === formData.primaryVetId) : null;

    addPet({
      ...formData,
      age: parseFloat(formData.age),
      weight: parseFloat(formData.weight) || 0,
      primaryVetName: selectedVet ? selectedVet.name : null
    });

    navigate('/');
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setError(null);
      validateImage(file);
      const optimized = await optimizeImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
        type: 'image/jpeg'
      });
      setImagePreview(optimized.dataUrl);
      setFormData(prev => ({...prev, image: optimized.dataUrl}));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({...prev, image: null}));
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-neutral-black mb-4"
        >
          <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-neutral-black mb-2">Add New Pet</h1>
        <p className="text-gray-600">Enter your pet's information</p>
      </div>

      <motion.form
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        onSubmit={handleSubmit}
        className="bg-neutral-white p-6 rounded-xl shadow-sm border border-gray-100"
      >
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              {imagePreview ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                  <img src={imagePreview} alt="Pet preview" className="w-full h-full object-cover" />
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
                  <div className="w-6 h-6 border-2 border-neutral-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div>
              <label className="block">
                <span className="sr-only">Choose profile photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary-light/80"
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">JPEG, PNG or WebP. Max 5MB.</p>
              {error && <p className="mt-1 text-xs text-accent-red">{error}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pet Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter pet name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Species</label>
            <select
              name="species"
              value={formData.species}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="bird">Bird</option>
              <option value="rabbit">Rabbit</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Breed *</label>
            <input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter breed"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age (years) *</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter age"
              min="0"
              step="0.1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter weight"
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter color"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Microchip ID</label>
            <input
              type="text"
              name="microchipId"
              value={formData.microchipId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter microchip ID"
            />
          </div>

          {/* Primary Veterinarian Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <SafeIcon icon={FiUser} className="w-4 h-4" />
              Primary Veterinarian
            </label>
            <select
              name="primaryVetId"
              value={formData.primaryVetId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select a veterinarian</option>
              {availableVets.length > 0 ? (
                availableVets.map(vet => (
                  <option key={vet.id} value={vet.id}>
                    Dr. {vet.name} {vet.specialty ? `(${vet.specialty})` : ''}
                  </option>
                ))
              ) : (
                <option value="" disabled>No veterinarians available</option>
              )}
            </select>
            {availableVets.length === 0 && (
              <p className="mt-1 text-xs text-primary">
                <button
                  type="button"
                  onClick={() => navigate('/vet-profiles')}
                  className="underline hover:text-primary-dark"
                >
                  Add veterinarians
                </button>{' '}
                to assign a primary vet
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Additional notes about your pet..."
          />
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-neutral-white py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors"
          >
            <SafeIcon icon={FiSave} className="w-5 h-5" />
            Save Pet
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default AddPet;
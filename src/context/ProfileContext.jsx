import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

export const useProfiles = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState({
    id: 'user-profile',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    avatar: null,
    preferences: {
      notifications: true,
      emailReminders: true,
      smsReminders: false
    }
  });
  
  const [vetProfiles, setVetProfiles] = useState([]);

  useEffect(() => {
    // Load data from localStorage
    const savedUserProfile = localStorage.getItem('userProfile');
    const savedVetProfiles = localStorage.getItem('vetProfiles');
    
    if (savedUserProfile) {
      setUserProfile(JSON.parse(savedUserProfile));
    }
    
    if (savedVetProfiles) {
      const profiles = JSON.parse(savedVetProfiles);
      // Remove duplicates on load
      const cleanedProfiles = removeDuplicates(profiles);
      setVetProfiles(cleanedProfiles);
      
      // Update localStorage if duplicates were found
      if (cleanedProfiles.length !== profiles.length) {
        localStorage.setItem('vetProfiles', JSON.stringify(cleanedProfiles));
        console.log(`Removed ${profiles.length - cleanedProfiles.length} duplicate vet profiles`);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('vetProfiles', JSON.stringify(vetProfiles));
  }, [vetProfiles]);

  // Function to remove duplicates from an array of vet profiles
  const removeDuplicates = (profiles) => {
    const seen = new Map();
    const uniqueProfiles = [];
    
    profiles.forEach(profile => {
      const key = createDuplicateKey(profile);
      if (!seen.has(key)) {
        seen.set(key, true);
        uniqueProfiles.push(profile);
      }
    });
    
    return uniqueProfiles;
  };

  // Create a unique key for duplicate detection
  const createDuplicateKey = (profile) => {
    if (profile.isClinic) {
      // For clinics: check clinicName + address + phone
      return `clinic_${(profile.clinicName || '').toLowerCase().trim()}_${(profile.address || '').toLowerCase().trim()}_${(profile.phone || '').replace(/\D/g, '')}`;
    } else {
      // For vets: check name + clinicName + specialty
      return `vet_${(profile.name || '').toLowerCase().trim()}_${(profile.clinicName || '').toLowerCase().trim()}_${(profile.specialty || '').toLowerCase().trim()}`;
    }
  };

  // Check if a profile would be a duplicate
  const isDuplicate = (newProfile, excludeId = null) => {
    const newKey = createDuplicateKey(newProfile);
    
    return vetProfiles.some(existing => {
      if (excludeId && existing.id === excludeId) {
        return false; // Skip the profile being edited
      }
      
      // Only compare clinics with clinics and vets with vets
      if (existing.isClinic !== newProfile.isClinic) {
        return false;
      }
      
      const existingKey = createDuplicateKey(existing);
      return existingKey === newKey;
    });
  };

  // Find similar profiles (for suggestions)
  const findSimilarProfiles = (newProfile) => {
    const similar = [];
    
    vetProfiles.forEach(existing => {
      if (newProfile.isClinic && existing.isClinic) {
        // Check clinic similarities
        const nameMatch = (newProfile.clinicName || '').toLowerCase().includes((existing.clinicName || '').toLowerCase()) || 
                         (existing.clinicName || '').toLowerCase().includes((newProfile.clinicName || '').toLowerCase());
        const phoneMatch = newProfile.phone && existing.phone && 
                         newProfile.phone.replace(/\D/g, '') === existing.phone.replace(/\D/g, '');
        const emailMatch = newProfile.email && existing.email && 
                         newProfile.email.toLowerCase() === existing.email.toLowerCase();
        
        if (nameMatch || phoneMatch || emailMatch) {
          similar.push({
            profile: existing,
            reasons: [
              nameMatch && 'Similar clinic name',
              phoneMatch && 'Same phone number',
              emailMatch && 'Same email address'
            ].filter(Boolean)
          });
        }
      } else if (!newProfile.isClinic && !existing.isClinic) {
        // Check vet similarities
        const nameMatch = (newProfile.name || '').toLowerCase() === (existing.name || '').toLowerCase();
        const clinicMatch = (newProfile.clinicName || '').toLowerCase() === (existing.clinicName || '').toLowerCase();
        const specialtyMatch = (newProfile.specialty || '').toLowerCase() === (existing.specialty || '').toLowerCase();
        
        if (nameMatch || (clinicMatch && clinicMatch !== '' && specialtyMatch)) {
          similar.push({
            profile: existing,
            reasons: [
              nameMatch && 'Same veterinarian name',
              (clinicMatch && specialtyMatch) && 'Same clinic and specialty'
            ].filter(Boolean)
          });
        }
      }
    });
    
    return similar;
  };

  const updateUserProfile = (updates) => {
    setUserProfile(prev => ({
      ...prev,
      ...updates
    }));
  };

  const addVetProfile = (vet) => {
    // Check for duplicates before adding
    if (isDuplicate(vet)) {
      throw new Error('A similar profile already exists. Please check for duplicates.');
    }
    
    const newVet = {
      ...vet,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setVetProfiles(prev => [...prev, newVet]);
    return newVet;
  };

  const updateVetProfile = (vetId, updates) => {
    // Check for duplicates before updating (excluding the current profile)
    if (isDuplicate(updates, vetId)) {
      throw new Error('This update would create a duplicate profile. Please check for existing similar profiles.');
    }
    
    setVetProfiles(prev => 
      prev.map(vet => 
        vet.id === vetId 
          ? { ...vet, ...updates } 
          : vet
      )
    );
  };

  const deleteVetProfile = (vetId) => {
    // First, remove the vet profile itself
    setVetProfiles(prev => {
      const filteredProfiles = prev.filter(vet => vet.id !== vetId);
      
      // Then, update any veterinarians that were associated with this clinic
      if (prev.find(v => v.id === vetId && v.isClinic)) {
        return filteredProfiles.map(vet => 
          vet.clinicId === vetId 
            ? { ...vet, clinicId: null } 
            : vet
        );
      }
      
      return filteredProfiles;
    });
  };

  // Bulk delete duplicates
  const deleteDuplicates = () => {
    const originalLength = vetProfiles.length;
    const cleanedProfiles = removeDuplicates(vetProfiles);
    setVetProfiles(cleanedProfiles);
    const removedCount = originalLength - cleanedProfiles.length;
    return removedCount;
  };

  // Get duplicate groups for manual review
  const getDuplicateGroups = () => {
    const groups = new Map();
    
    vetProfiles.forEach(profile => {
      const key = createDuplicateKey(profile);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(profile);
    });
    
    // Return only groups with more than one profile
    return Array.from(groups.values()).filter(group => group.length > 1);
  };

  // Get all vets associated with a clinic
  const getClinicVets = (clinicId) => {
    return vetProfiles.filter(vet => vet.clinicId === clinicId);
  };

  // Get a clinic by ID
  const getClinic = (clinicId) => {
    return vetProfiles.find(vet => vet.id === clinicId && vet.isClinic);
  };

  // Get all clinics
  const getClinics = () => {
    return vetProfiles.filter(vet => vet.isClinic);
  };

  const value = {
    userProfile,
    vetProfiles,
    updateUserProfile,
    addVetProfile,
    updateVetProfile,
    deleteVetProfile,
    getClinicVets,
    getClinic,
    getClinics,
    isDuplicate,
    findSimilarProfiles,
    deleteDuplicates,
    getDuplicateGroups,
    removeDuplicates
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
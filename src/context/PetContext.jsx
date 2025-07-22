import React, { createContext, useContext, useState, useEffect } from 'react';

const PetContext = createContext();

export const usePets = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePets must be used within a PetProvider');
  }
  return context;
};

export const PetProvider = ({ children }) => {
  const [pets, setPets] = useState([]);
  const [healthLogs, setHealthLogs] = useState([]);
  const [vetAppointments, setVetAppointments] = useState([]);

  useEffect(() => {
    // Load data from localStorage
    const savedPets = localStorage.getItem('pets');
    const savedHealthLogs = localStorage.getItem('healthLogs');
    const savedVetAppointments = localStorage.getItem('vetAppointments');

    if (savedPets) setPets(JSON.parse(savedPets));
    if (savedHealthLogs) setHealthLogs(JSON.parse(savedHealthLogs));
    if (savedVetAppointments) setVetAppointments(JSON.parse(savedVetAppointments));
  }, []);

  useEffect(() => {
    localStorage.setItem('pets', JSON.stringify(pets));
  }, [pets]);

  useEffect(() => {
    localStorage.setItem('healthLogs', JSON.stringify(healthLogs));
  }, [healthLogs]);

  useEffect(() => {
    localStorage.setItem('vetAppointments', JSON.stringify(vetAppointments));
  }, [vetAppointments]);

  const addPet = (pet) => {
    const newPet = {
      ...pet,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setPets(prev => [...prev, newPet]);
    return newPet; // Return the new pet so we can use it immediately
  };

  const updatePet = (petId, updates) => {
    setPets(prev => 
      prev.map(pet => 
        pet.id === petId ? { ...pet, ...updates } : pet
      )
    );
  };

  const deletePet = (petId) => {
    setPets(prev => prev.filter(pet => pet.id !== petId));
    setHealthLogs(prev => prev.filter(log => log.petId !== petId));
    setVetAppointments(prev => prev.filter(apt => apt.petId !== petId));
  };

  const addHealthLog = (log) => {
    const newLog = {
      ...log,
      id: log.id || Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setHealthLogs(prev => [...prev, newLog]);
    return newLog;
  };

  const updateHealthLog = (logId, updates) => {
    setHealthLogs(prev => 
      prev.map(log => 
        log.id === logId ? { ...log, ...updates } : log
      )
    );
  };

  const deleteHealthLog = (logId) => {
    setHealthLogs(prev => prev.filter(log => log.id !== logId));
  };

  const addVetAppointment = (appointment) => {
    const newAppointment = {
      ...appointment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setVetAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  };

  const updateVetAppointment = (appointmentId, updates) => {
    setVetAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId ? { ...apt, ...updates } : apt
      )
    );
  };

  const deleteVetAppointment = (appointmentId) => {
    setVetAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
  };

  // Calculate total health costs for a pet or all pets
  const getHealthCosts = (petId = null, category = null, startDate = null, endDate = null) => {
    let filteredLogs = [...healthLogs];

    // Filter by pet if specified
    if (petId) {
      filteredLogs = filteredLogs.filter(log => log.petId === petId);
    }

    // Filter by category if specified
    if (category && category !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.costCategory === category);
    }

    // Filter by date range if specified
    if (startDate) {
      const start = new Date(startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.date) <= end);
    }

    // Calculate total
    const total = filteredLogs.reduce((sum, log) => sum + (Number(log.cost) || 0), 0);

    // Group by category
    const byCategory = {};
    filteredLogs.forEach(log => {
      const cat = log.costCategory || 'other';
      byCategory[cat] = (byCategory[cat] || 0) + (Number(log.cost) || 0);
    });

    return {
      total,
      byCategory,
      logs: filteredLogs
    };
  };

  const value = {
    pets,
    healthLogs,
    vetAppointments,
    addPet,
    updatePet,
    deletePet,
    addHealthLog,
    updateHealthLog,
    deleteHealthLog,
    addVetAppointment,
    updateVetAppointment,
    deleteVetAppointment,
    getHealthCosts
  };

  return (
    <PetContext.Provider value={value}>
      {children}
    </PetContext.Provider>
  );
};
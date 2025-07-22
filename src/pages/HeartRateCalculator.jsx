import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePets } from '../context/PetContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { toast } from 'react-hot-toast';
import HeartRateReference from '../components/HeartRateReference';
import { Button, Card } from '../components/ui';

const { FiHeart, FiPlay, FiPause, FiRotateCcw, FiSave, FiInfo, FiArrowLeft, FiActivity } = FiIcons;

const HeartRateCalculator = () => {
  const { pets, healthLogs, addHealthLog } = usePets();
  const [selectedPet, setSelectedPet] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [heartBeats, setHeartBeats] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [heartRate, setHeartRate] = useState(0);
  const [heartRateStatus, setHeartRateStatus] = useState(null);

  // Get selected pet data
  const selectedPetData = pets.find(pet => pet.id === selectedPet);

  // Get normal heart rate range based on species
  const getNormalRange = (species) => {
    const ranges = {
      dog: { min: 70, max: 120 },
      cat: { min: 140, max: 220 },
      bird: { min: 200, max: 400 },
      rabbit: { min: 130, max: 325 },
    };
    return ranges[species?.toLowerCase()] || null;
  };

  const normalRange = selectedPetData ? getNormalRange(selectedPetData.species) : null;

  // Format time display (MM:SS)
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Start timer
  const startTimer = () => {
    if (!selectedPet) {
      toast.error('Please select a pet first');
      return;
    }
    setIsTimerRunning(true);
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  // Pause timer
  const pauseTimer = () => {
    clearInterval(timerInterval);
    setIsTimerRunning(false);
    calculateHeartRate();
  };

  // Reset everything
  const resetTimer = () => {
    clearInterval(timerInterval);
    setIsTimerRunning(false);
    setTimeElapsed(0);
    setHeartBeats(0);
    setHeartRate(0);
    setHeartRateStatus(null);
  };

  // Increment heart beats
  const incrementHeartBeats = () => {
    if (isTimerRunning) {
      setHeartBeats(prev => prev + 1);
    }
  };

  // Calculate heart rate
  const calculateHeartRate = () => {
    if (timeElapsed === 0 || heartBeats === 0) return;
    
    // Calculate beats per minute
    const bpm = Math.round((heartBeats / timeElapsed) * 60);
    setHeartRate(bpm);
    
    // Determine status based on normal range
    if (normalRange) {
      if (bpm < normalRange.min) {
        setHeartRateStatus('low');
      } else if (bpm > normalRange.max) {
        setHeartRateStatus('high');
      } else {
        setHeartRateStatus('normal');
      }
    }
  };

  // Get heart rate status for a specific measurement
  const getHeartRateStatus = (bpm, pet) => {
    const range = getNormalRange(pet.species);
    if (!range) return null;
    
    if (bpm < range.min) return 'low';
    if (bpm > range.max) return 'high';
    return 'normal';
  };

  // Save heart rate measurement
  const saveHeartRate = () => {
    if (!heartRate || !selectedPet) return;
    
    const healthLog = {
      petId: selectedPet,
      type: 'heart-rate',
      date: new Date().toISOString(),
      heartRate: heartRate,
      notes: `Heart rate measured: ${heartRate} BPM (${heartRateStatus})`
    };
    
    addHealthLog(healthLog);
    toast.success('Heart rate measurement saved successfully');
    resetTimer();
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Get recent heart rate measurements for selected pet
  const recentHeartRates = selectedPet
    ? healthLogs
        .filter(log => log.petId === selectedPet && log.type === 'heart-rate' && log.heartRate)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(log => ({
          id: log.id,
          heartRate: log.heartRate,
          date: new Date(log.date).toLocaleDateString()
        }))
    : [];

  // Updated color mapping for heart rate status
  const getStatusColor = (status) => {
    switch (status) {
      case 'low': return 'text-[#4DB7C8] bg-[#DDF2F5] border-[#4DB7C8]/30';
      case 'high': return 'text-[#E55C5C] bg-[#FFE8E8] border-[#E55C5C]/30';
      case 'normal': return 'text-[#4CB78D] bg-[#EDFAF6] border-[#4CB78D]/30';
      default: return 'text-[#444444] bg-[#FAFAFA] border-[#CCCCCC]';
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto min-h-screen bg-[#FAFAFA]">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-[#444444] hover:text-[#222222] mb-6 transition-colors" aria-label="Return to dashboard">
          <SafeIcon icon={FiArrowLeft} className="w-5 h-5" aria-hidden="true" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#222222] mb-3 font-heading">Heart Rate Monitor</h1>
          <p className="text-[#444444] text-lg font-sans">Track your pet's heartbeat with ease</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Calculator */}
        <div className="lg:col-span-2">
          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-[#CCCCCC]/20 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="bg-[#4DB7C8] p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <SafeIcon icon={FiHeart} className="w-7 h-7" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-2xl font-heading">Heart Rate Monitor</h2>
                  <p className="text-[#DDF2F5]/90 font-sans">Real-time measurement</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              {/* Pet Selection */}
              <div className="mb-8">
                <label htmlFor="pet-select" className="block text-[#222222] font-heading text-lg mb-3">
                  Select Your Pet
                </label>
                <select 
                  id="pet-select"
                  value={selectedPet} 
                  onChange={(e) => setSelectedPet(e.target.value)}
                  className="w-full px-4 py-3 border border-[#CCCCCC] rounded-xl focus:ring-2 focus:ring-[#4DB7C8] focus:border-transparent bg-white text-[#444444] font-sans transition-all"
                  aria-label="Select your pet"
                >
                  <option value="">Choose a pet</option>
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Heart Rate Reference */}
              {selectedPetData && (
                <HeartRateReference 
                  selectedSpecies={selectedPetData.species} 
                  className="mb-8"
                />
              )}
              
              {/* Timer Display */}
              <div className="text-center mb-8">
                <div className="bg-[#FAFAFA] rounded-2xl p-8 mb-6 border border-[#CCCCCC]/20">
                  {/* Time Display */}
                  <div className="mb-6" aria-live="polite">
                    <div className="text-6xl font-bold text-[#222222] mb-2 font-heading tracking-wider" aria-label={`Timer: ${formatTime(timeElapsed)}`}>
                      {formatTime(timeElapsed)}
                    </div>
                    <div className="text-lg text-[#444444] font-sans" aria-label={`${heartBeats} heartbeats counted`}>
                      {heartBeats} beats counted
                    </div>
                  </div>
                  
                  {/* Heart Rate Result */}
                  {heartRate > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`inline-block px-6 py-4 rounded-xl border ${getStatusColor(heartRateStatus)}`}
                      aria-live="polite"
                    >
                      <div className="flex items-center gap-4">
                        <SafeIcon icon={FiHeart} className="w-8 h-8" aria-hidden="true" />
                        <div className="text-left">
                          <div className="text-3xl font-heading" aria-label={`${heartRate} beats per minute`}>{heartRate} BPM</div>
                          {heartRateStatus && (
                            <div className="text-sm font-sans mt-1">
                              {heartRateStatus === 'normal' ? 'Normal Range' : 
                               heartRateStatus === 'high' ? 'Above Normal' : 
                               'Below Normal'}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Control Buttons */}
                <div className="flex justify-center gap-4 mb-8">
                  {!isTimerRunning ? (
                    <Button
                      onClick={startTimer}
                      disabled={!selectedPet}
                      variant="success"
                      icon={FiPlay}
                      className="px-8 py-3 text-lg shadow-lg shadow-[#4CB78D]/20"
                      aria-label="Start timer"
                    >
                      Start Timer
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseTimer}
                      variant="accent"
                      icon={FiPause}
                      className="px-8 py-3 text-lg shadow-lg shadow-[#F0A06F]/20"
                      aria-label="Pause timer"
                    >
                      Pause Timer
                    </Button>
                  )}
                  
                  <Button
                    onClick={resetTimer}
                    variant="danger"
                    icon={FiRotateCcw}
                    className="px-8 py-3 text-lg shadow-lg shadow-red-500/20"
                    aria-label="Reset timer and counts"
                  >
                    Reset
                  </Button>
                </div>
                
                {/* Heart Beat Counter */}
                <button
                  onClick={incrementHeartBeats}
                  disabled={!isTimerRunning}
                  className={`w-full py-8 px-6 rounded-2xl transition-all text-xl font-heading ${
                    isTimerRunning ? 'bg-[#4DB7C8] text-white hover:bg-[#3DA7B8] shadow-lg shadow-[#4DB7C8]/20' : 
                    'bg-[#DDF2F5] text-[#4DB7C8]/50 cursor-not-allowed'
                  }`}
                  aria-label="Tap for each heartbeat"
                  aria-disabled={!isTimerRunning}
                  aria-live="polite"
                >
                  <div className="flex items-center justify-center gap-3">
                    <SafeIcon icon={FiHeart} className="w-8 h-8" aria-hidden="true" />
                    <span>Tap for Each Heartbeat</span>
                  </div>
                </button>
                
                {/* Save Button */}
                {heartRate > 0 && selectedPet && (
                  <Button
                    onClick={saveHeartRate}
                    variant="accent"
                    icon={FiSave}
                    fullWidth
                    className="mt-6 py-4 px-6 text-lg shadow-lg shadow-[#F0A06F]/20"
                    aria-label="Save heart rate measurement"
                  >
                    Save Measurement
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Heart Rate Reference for Mobile */}
          {!selectedPetData && (
            <HeartRateReference className="lg:hidden" />
          )}
          
          {/* Recent Measurements */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-[#CCCCCC]/20 overflow-hidden"
          >
            <div className="bg-[#4DB7C8] p-4 text-white">
              <h3 className="font-heading text-lg flex items-center gap-2">
                <SafeIcon icon={FiActivity} className="w-5 h-5" aria-hidden="true" />
                Recent Measurements
              </h3>
            </div>
            
            <div className="p-4">
              {selectedPet ? (
                recentHeartRates.length > 0 ? (
                  <div className="space-y-3" role="region" aria-label="Recent heart rate measurements">
                    {recentHeartRates.map((record) => {
                      const status = getHeartRateStatus(record.heartRate, selectedPetData);
                      return (
                        <motion.div
                          key={record.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 bg-[#FAFAFA] rounded-xl border border-[#CCCCCC]/20"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <SafeIcon icon={FiHeart} className="w-4 h-4 text-[#4DB7C8]" aria-hidden="true" />
                                <span className="font-heading text-[#222222] text-lg" aria-label={`${record.heartRate} beats per minute`}>
                                  {record.heartRate} BPM
                                </span>
                              </div>
                              <p className="text-sm text-[#444444] font-sans">{record.date}</p>
                            </div>
                            <span 
                              className={`px-3 py-1 rounded-full text-xs font-sans ${getStatusColor(status)}`}
                              aria-label={status}
                            >
                              {status === 'normal' ? 'Normal' : status === 'high' ? 'High' : 'Low'}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8" aria-live="polite">
                    <SafeIcon icon={FiHeart} className="w-12 h-12 text-[#CCCCCC] mx-auto mb-3" aria-hidden="true" />
                    <p className="text-[#444444] mb-1 font-sans">No measurements yet</p>
                    <p className="text-sm text-[#666666] font-sans">Start measuring to see history</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8" aria-live="polite">
                  <SafeIcon icon={FiInfo} className="w-12 h-12 text-[#CCCCCC] mx-auto mb-3" aria-hidden="true" />
                  <p className="text-[#444444] font-sans">Select a pet to view measurements</p>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* How To Use Instructions */}
          <Card className="p-6">
            <h3 className="font-medium text-gray-800 mb-3">How to Use</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
              <li>Select your pet from the dropdown</li>
              <li>Click "Start Timer" to begin measurement</li>
              <li>Place two fingers on your pet's chest behind the left elbow or on the inside of the thigh where the leg meets the body</li>
              <li>Tap the "Tap for Each Heartbeat" button every time you feel a heartbeat</li>
              <li>Continue for at least 15 seconds for accuracy</li>
              <li>Click "Pause Timer" when done</li>
              <li>Review the calculated heart rate</li>
              <li>Click "Save Measurement" to record the result</li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HeartRateCalculator;
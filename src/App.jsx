import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QuestProvider } from '@questlabs/react-sdk';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import PetProfile from './pages/PetProfile';
import Health from './pages/Health';
import HeartRateCalculator from './pages/HeartRateCalculator';
import AddPet from './pages/AddPet';
import UserProfile from './pages/UserProfile';
import VetProfiles from './pages/VetProfiles';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import { PetProvider } from './context/PetContext';
import { ProfileProvider } from './context/ProfileContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import questConfig from './config/questConfig';
import '@questlabs/react-sdk/dist/style.css';
import './App.css';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <QuestProvider
      apiKey={questConfig.APIKEY}
      entityId={questConfig.ENTITYID}
      apiType="PRODUCTION"
    >
      <AuthProvider>
        <PetProvider>
          <ProfileProvider>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
                {/* Only show Navigation on authenticated routes */}
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route
                    path="*"
                    element={
                      <ProtectedRoute>
                        <>
                          <Navigation />
                          <main className="pb-16">
                            <Routes>
                              <Route path="/" element={<Dashboard />} />
                              <Route path="/pet/:id" element={<PetProfile />} />
                              <Route path="/health" element={<Health />} />
                              <Route path="/heart-rate" element={<HeartRateCalculator />} />
                              <Route path="/add-pet" element={<AddPet />} />
                              <Route path="/user-profile" element={<UserProfile />} />
                              <Route path="/vet-profiles" element={<VetProfiles />} />
                              <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                          </main>
                        </>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </Router>
          </ProfileProvider>
        </PetProvider>
      </AuthProvider>
    </QuestProvider>
  );
}

export default App;
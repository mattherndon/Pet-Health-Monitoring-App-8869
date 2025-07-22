import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnBoarding } from '@questlabs/react-sdk';
import questConfig from '../config/questConfig';

const Onboarding = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  
  const handleComplete = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Visual Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-dark items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <h1 className="text-4xl font-bold mb-6">Let's Get Started!</h1>
          <p className="text-lg opacity-90">
            Tell us about yourself and your pets so we can provide the best experience.
          </p>
        </div>
      </div>

      {/* Right: Onboarding Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Let's Get Started!</h1>
            <p className="text-gray-600">Complete your profile setup</p>
          </div>

          <OnBoarding
            userId={localStorage.getItem('userId')}
            token={localStorage.getItem('token')}
            questId={questConfig.QUEST_ONBOARDING_QUESTID}
            answer={answers}
            setAnswer={setAnswers}
            getAnswers={handleComplete}
            singleChoose="modal1"
            multiChoice="modal2"
          >
            <OnBoarding.Header />
            <OnBoarding.Content />
            <OnBoarding.Footer />
          </OnBoarding>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
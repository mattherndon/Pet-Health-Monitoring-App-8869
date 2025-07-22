import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Card } from './ui';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHeart, FiInfo } = FiIcons;

/**
 * Heart Rate Reference component for displaying normal heart rate ranges by species
 * Includes accessibility features for better screen reader support
 */
const HeartRateReference = ({ selectedSpecies, className = '' }) => {
  // Define heart rate ranges for different species
  const heartRateRanges = {
    dog: {
      min: 70,
      max: 120,
      notes: "Varies by size: smaller dogs tend to have faster heart rates (up to 140 bpm), while larger dogs may have slower rates (as low as 60 bpm)."
    },
    cat: {
      min: 140,
      max: 220,
      notes: "Cats' heart rates are typically higher when awake and lower when relaxed or sleeping."
    },
    rabbit: {
      min: 130,
      max: 325,
      notes: "Rabbits have a wide normal range and their heart rate can increase dramatically when stressed."
    },
    bird: {
      min: 200,
      max: 400,
      notes: "Varies greatly by species size. Smaller birds like canaries may have rates up to 1000 bpm."
    },
    other: {
      min: 60,
      max: 400,
      notes: "Heart rates vary widely among different species. Consult a veterinarian for specific reference ranges."
    }
  };

  // Get range for selected species or default to general info
  const range = selectedSpecies ? heartRateRanges[selectedSpecies.toLowerCase()] || heartRateRanges.other : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="p-4 border-l-4 border-primary">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary-50 rounded-full">
            <SafeIcon icon={FiHeart} className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 flex items-center gap-2" id="heart-rate-reference-title">
              Heart Rate Reference
              {!selectedSpecies && (
                <span className="text-sm text-gray-500 font-normal">(Select a pet to see specific ranges)</span>
              )}
            </h3>
            
            {range ? (
              <div aria-labelledby="heart-rate-reference-title">
                <p className="mt-2 text-lg font-semibold text-primary">
                  {range.min} - {range.max} <span className="text-sm font-normal">beats per minute</span>
                </p>
                
                <div className="mt-2 flex items-start gap-2">
                  <SafeIcon icon={FiInfo} className="w-4 h-4 text-blue-500 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-gray-600">{range.notes}</p>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  <span aria-hidden="true">* </span>
                  <span>
                    Heart rates outside these ranges may indicate stress, pain, or medical conditions. 
                    Always consult your veterinarian if concerned.
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  Different species have different normal heart rate ranges. 
                  Select a pet to view specific reference values.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                  <div>
                    <span className="font-medium">Dogs:</span> 70-120 bpm
                  </div>
                  <div>
                    <span className="font-medium">Cats:</span> 140-220 bpm
                  </div>
                  <div>
                    <span className="font-medium">Rabbits:</span> 130-325 bpm
                  </div>
                  <div>
                    <span className="font-medium">Birds:</span> 200-400 bpm
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

HeartRateReference.propTypes = {
  selectedSpecies: PropTypes.string,
  className: PropTypes.string
};

export default HeartRateReference;
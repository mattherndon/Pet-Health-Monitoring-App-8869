import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Badge, Avatar } from '../ui';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar } = FiIcons;

/**
 * Modernized pet card component for dashboard
 * Accessibility improvements:
 * - Added proper ARIA attributes
 * - Better focus management
 * - Enhanced keyboard navigation
 * - Improved screen reader support
 */
const PetCard = ({
  id,
  name,
  species,
  breed,
  age,
  image,
  nextAppointment,
  status,
  className = '',
  ...props
}) => {
  // Define status badge variants
  const statusVariants = {
    healthy: 'success',
    attention: 'warning',
    treatment: 'info',
    critical: 'danger',
  };
  
  // Generate a descriptive label for screen readers
  const getAriaLabel = () => {
    let label = `${name}, ${species}`;
    if (breed) label += `, ${breed}`;
    if (age) label += `, ${age} ${Number(age) === 1 ? 'year' : 'years'} old`;
    if (status) label += `, status: ${status}`;
    if (nextAppointment) label += `, next appointment: ${nextAppointment}`;
    return label;
  };
  
  return (
    <Card 
      interactive
      className={`p-0 overflow-hidden ${className}`}
      {...props}
    >
      <Link 
        to={`/pet/${id}`} 
        className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
        aria-label={getAriaLabel()}
      >
        <div className="relative">
          {/* Pet image or avatar */}
          <div className="h-32 overflow-hidden bg-gradient-to-r from-primary-50 to-secondary-50">
            {image ? (
              <img 
                src={image} 
                alt={`${name} the ${species}`} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Avatar 
                  name={name} 
                  size="xl" 
                  className="border-4 border-white"
                  alt={`Avatar for ${name}`}
                />
              </div>
            )}
          </div>
          
          {/* Status badge */}
          {status && (
            <div className="absolute top-3 right-3">
              <Badge 
                variant={statusVariants[status] || 'default'}
                size="sm"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-800">{name}</h3>
          <p className="text-sm text-gray-600">
            {species} • {breed} • {age} {Number(age) === 1 ? 'year' : 'years'}
          </p>
          
          {/* Next appointment */}
          {nextAppointment && (
            <div className="mt-4 p-2 bg-gray-50 rounded-lg flex items-center gap-2 text-sm" aria-label={`Next visit: ${nextAppointment}`}>
              <SafeIcon icon={FiCalendar} className="w-4 h-4 text-primary" aria-hidden="true" />
              <div>
                <span className="text-gray-600">Next visit:</span>
                <span className="ml-1 font-medium">{nextAppointment}</span>
              </div>
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
};

PetCard.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  species: PropTypes.string.isRequired,
  breed: PropTypes.string,
  age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  image: PropTypes.string,
  nextAppointment: PropTypes.string,
  status: PropTypes.oneOf(['healthy', 'attention', 'treatment', 'critical']),
  className: PropTypes.string
};

export default PetCard;
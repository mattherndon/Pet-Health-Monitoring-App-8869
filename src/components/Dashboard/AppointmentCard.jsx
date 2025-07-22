import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { format, isToday, isTomorrow, isThisWeek, parseISO } from 'date-fns';
import { Card, Badge, Avatar } from '../ui';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiClock, FiMapPin } = FiIcons;

/**
 * Modernized appointment card component for dashboard
 * Accessibility improvements:
 * - Added proper ARIA attributes
 * - Improved screen reader support
 * - Better semantic HTML
 */
const AppointmentCard = ({
  id,
  petName,
  petImage,
  date,
  time,
  type,
  location,
  vetName,
  status = 'upcoming',
  className = '',
  ...props
}) => {
  // Format date display based on proximity
  const formatAppointmentDate = (dateString) => {
    const appointmentDate = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    
    if (isToday(appointmentDate)) {
      return 'Today';
    } else if (isTomorrow(appointmentDate)) {
      return 'Tomorrow';
    } else if (isThisWeek(appointmentDate)) {
      return format(appointmentDate, 'EEEE'); // Day name
    } else {
      return format(appointmentDate, 'MMM d, yyyy');
    }
  };
  
  // Define status badge variants
  const statusVariants = {
    upcoming: 'primary',
    completed: 'success',
    cancelled: 'danger',
    rescheduled: 'warning',
  };
  
  // Format the appointment date
  const formattedDate = formatAppointmentDate(date);

  // Generate descriptive label for screen readers
  const getAriaLabel = () => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const formattedDateTime = format(dateObj, 'MMMM d, yyyy');
    
    let label = `${type} appointment for ${petName}`;
    label += `, ${formattedDateTime}`;
    if (time) label += ` at ${time}`;
    if (location) label += ` at ${location}`;
    if (vetName) label += ` with Dr. ${vetName}`;
    label += `, status: ${status}`;
    
    return label;
  };
  
  return (
    <Card 
      className={`p-4 ${className}`}
      {...props}
      aria-label={getAriaLabel()}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Avatar 
            name={petName} 
            src={petImage} 
            size="md" 
            alt={`Avatar for ${petName}`}
          />
          
          <div>
            <h3 className="font-medium text-gray-800">{petName}</h3>
            <p className="text-sm text-gray-500 capitalize">{type}</p>
          </div>
        </div>
        
        <Badge 
          variant={statusVariants[status] || 'default'} 
          size="sm"
          aria-label={`Status: ${status}`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <SafeIcon icon={FiCalendar} className="w-4 h-4 text-primary" aria-hidden="true" />
          <span className="text-gray-700">{formattedDate}</span>
        </div>
        
        {time && (
          <div className="flex items-center gap-2 text-sm">
            <SafeIcon icon={FiClock} className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-gray-700">{time}</span>
          </div>
        )}
        
        {location && (
          <div className="flex items-center gap-2 text-sm">
            <SafeIcon icon={FiMapPin} className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-gray-700">{location}</span>
          </div>
        )}
        
        {vetName && (
          <div className="mt-3 text-sm text-gray-500">
            with Dr. {vetName}
          </div>
        )}
      </div>
    </Card>
  );
};

AppointmentCard.propTypes = {
  id: PropTypes.string.isRequired,
  petName: PropTypes.string.isRequired,
  petImage: PropTypes.string,
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  time: PropTypes.string,
  type: PropTypes.string.isRequired,
  location: PropTypes.string,
  vetName: PropTypes.string,
  status: PropTypes.oneOf(['upcoming', 'completed', 'cancelled', 'rescheduled']),
  className: PropTypes.string
};

export default AppointmentCard;
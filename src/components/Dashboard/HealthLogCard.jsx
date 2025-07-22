import React from 'react';
import PropTypes from 'prop-types';
import { format, parseISO } from 'date-fns';
import { Card, Badge } from '../ui';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiActivity, 
  FiCalendar, 
  FiFileText, 
  FiHeart, 
  FiDollarSign 
} = FiIcons;

/**
 * Modernized health log card component for dashboard
 * Accessibility improvements:
 * - Added proper ARIA attributes
 * - Improved screen reader support
 * - Better semantic HTML
 */
const HealthLogCard = ({
  id,
  petName,
  type,
  date,
  notes,
  metrics = {},
  documents = [],
  className = '',
  ...props
}) => {
  // Define type icons and colors
  const typeIcons = {
    checkup: { icon: FiActivity, color: 'text-blue-500', bg: 'bg-blue-50' },
    vaccination: { icon: FiActivity, color: 'text-green-500', bg: 'bg-green-50' },
    medication: { icon: FiActivity, color: 'text-purple-500', bg: 'bg-purple-50' },
    surgery: { icon: FiActivity, color: 'text-red-500', bg: 'bg-red-50' },
    dental: { icon: FiActivity, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    emergency: { icon: FiActivity, color: 'text-red-500', bg: 'bg-red-50' },
    'lab-work': { icon: FiActivity, color: 'text-blue-500', bg: 'bg-blue-50' },
    specialist: { icon: FiActivity, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    grooming: { icon: FiActivity, color: 'text-pink-500', bg: 'bg-pink-50' },
    other: { icon: FiActivity, color: 'text-gray-500', bg: 'bg-gray-50' },
    'heart-rate': { icon: FiHeart, color: 'text-red-500', bg: 'bg-red-50' },
  };
  
  // Get type config
  const typeConfig = typeIcons[type] || typeIcons.other;
  const TypeIcon = typeConfig.icon;
  
  // Format date
  const formattedDate = typeof date === 'string' 
    ? format(parseISO(date), 'MMM d, yyyy')
    : format(date, 'MMM d, yyyy');
  
  // Generate descriptive label for screen readers
  const getAriaLabel = () => {
    let label = `${type} log for ${petName} on ${formattedDate}`;
    
    // Add metrics information
    if (metrics.heartRate) label += `, heart rate: ${metrics.heartRate} bpm`;
    if (metrics.weight) label += `, weight: ${metrics.weight} lbs`;
    if (metrics.cost) label += `, cost: $${metrics.cost}`;
    
    // Add document count
    if (documents.length > 0) {
      label += `, ${documents.length} document${documents.length !== 1 ? 's' : ''}`;
    }
    
    return label;
  };
    
  return (
    <Card 
      className={`p-4 ${className}`}
      {...props}
      aria-label={getAriaLabel()}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${typeConfig.bg}`} aria-hidden="true">
          <SafeIcon icon={TypeIcon} className={`w-5 h-5 ${typeConfig.color}`} />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="font-medium text-gray-800 capitalize">{type}</h3>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <SafeIcon icon={FiCalendar} className="w-3 h-3" aria-hidden="true" />
              <span>{formattedDate}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-1">{petName}</p>
          
          {/* Display metrics if available */}
          {Object.keys(metrics).length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3" role="group" aria-label="Health metrics">
              {metrics.heartRate && (
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                  <SafeIcon icon={FiHeart} className="w-4 h-4 text-red-500" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-red-500">Heart Rate</p>
                    <p className="text-sm font-medium">{metrics.heartRate} bpm</p>
                  </div>
                </div>
              )}
              
              {metrics.weight && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <SafeIcon icon={FiActivity} className="w-4 h-4 text-blue-500" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-blue-500">Weight</p>
                    <p className="text-sm font-medium">{metrics.weight} lbs</p>
                  </div>
                </div>
              )}
              
              {metrics.cost && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <SafeIcon icon={FiDollarSign} className="w-4 h-4 text-green-500" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-green-500">Cost</p>
                    <p className="text-sm font-medium">${metrics.cost}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Notes */}
          {notes && (
            <p className="mt-3 text-sm text-gray-600 line-clamp-2">{notes}</p>
          )}
          
          {/* Documents */}
          {documents.length > 0 && (
            <div className="mt-3 flex items-center gap-1 text-sm text-primary">
              <SafeIcon icon={FiFileText} className="w-4 h-4" aria-hidden="true" />
              <span aria-label={`${documents.length} attached document${documents.length !== 1 ? 's' : ''}`}>
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

HealthLogCard.propTypes = {
  id: PropTypes.string.isRequired,
  petName: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  notes: PropTypes.string,
  metrics: PropTypes.shape({
    heartRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    temperature: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cost: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  documents: PropTypes.array,
  className: PropTypes.string
};

export default HealthLogCard;
import React from 'react';
import { Leaf, Calendar, Star, ExternalLink, ThermometerSun, Droplets, Sun, Clock, Sprout, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SavedPlantCard = ({ plant }) => {
  const navigate = useNavigate();
  
  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800';
    if (confidence >= 70) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric' 
      });
    } catch (e) {
      return 'Recently';
    }
  };

  const handleViewDetails = () => {
    // Check if plant-details route exists, otherwise use dashboard
    navigate('/plant-details', { state: { plant } });
  };

  // Check if image is valid (not a blob URL and not empty)
  const isValidImage = (imageUrl) => {
    if (!imageUrl) return false;
    if (imageUrl.startsWith('blob:')) return false; // Blob URLs are temporary
    if (imageUrl.trim() === '') return false;
    return true;
  };

  // Handle image error
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    // Replace with leaf icon
    const parent = e.target.parentElement;
    if (parent) {
      parent.innerHTML = `
        <div class="w-full h-full bg-gradient-to-br from-green-100 to-emerald-200 flex flex-col items-center justify-center">
          <Leaf class="w-12 h-12 text-green-400 mb-2" />
          <span class="text-xs text-green-600">Image not available</span>
        </div>
      `;
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-green-300">
      
      {/* Plant Image - FIXED with blob URL check */}
      <div className="relative h-48 overflow-hidden">
        {isValidImage(plant?.plantImage) ? (
          <img 
            src={plant.plantImage} 
            alt={plant.plantName || 'Plant image'}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-200 flex flex-col items-center justify-center">
            <Leaf className="w-12 h-12 text-green-400 mb-2" />
            <span className="text-xs text-green-600">
              {plant?.plantImage?.startsWith('blob:') ? 'Image expired' : 'No image'}
            </span>
          </div>
        )}
        
        {/* Confidence Badge - UPDATED with your button style */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${getConfidenceColor(plant?.confidence)}`}>
          {Math.round(plant?.confidence || 0)}% match
        </div>
        
        {/* Plant Type Badge - UPDATED with your button style */}
        {plant?.plantType && (
          <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 text-xs rounded-full">
            {plant.plantType}
          </div>
        )}
      </div>
      
      {/* Plant Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-lg text-gray-800 truncate">
              {plant?.plantName || 'Unnamed Plant'}
            </h3>
            <p className="text-sm text-gray-600 italic">
              {plant?.scientificName || 'Unknown species'}
            </p>
          </div>
          <button
            onClick={handleViewDetails}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="View Details"
          >
            <ExternalLink className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        {/* Plant Stats */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Identified {formatDate(plant?.identifiedDate)}</span>
          </div>
          
          {plant?.detailedInfo?.growingConditions && (
            <div className="flex items-center gap-3 text-xs">
              {plant.detailedInfo.growingConditions.sunlight && (
                <div className="flex items-center gap-1" title="Sunlight">
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span className="text-gray-500">☀️</span>
                </div>
              )}
              {plant.detailedInfo.growingConditions.water && (
                <div className="flex items-center gap-1" title="Water">
                  <Droplets className="w-3 h-3 text-blue-500" />
                  <span className="text-gray-500">💧</span>
                </div>
              )}
              {plant.detailedInfo.growingConditions.temperature && (
                <div className="flex items-center gap-1" title="Temperature">
                  <ThermometerSun className="w-3 h-3 text-red-500" />
                  <span className="text-gray-500">🌡️</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Quick Info */}
        {plant?.detailedInfo && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {plant.detailedInfo.characteristics?.description || 
               plant.detailedInfo.identification?.commonName || 
               'No description available'}
            </p>
          </div>
        )}
        
        {/* Family Info - UPDATED with your button style */}
        {plant?.detailedInfo?.identification?.family && (
          <div className="mb-4">
            <span className="inline-block bg-black text-white px-3 py-1 text-xs rounded-full">
              Family: {plant.detailedInfo.identification.family}
            </span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            View Details
          </button>
          <button
            onClick={() => navigate('/plantDoctor', { state: { plant } })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            title="Check Health"
          >
            🩺
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedPlantCard;
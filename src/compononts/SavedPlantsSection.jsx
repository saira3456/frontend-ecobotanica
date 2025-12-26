import React, { useState } from 'react';
import SavedPlantCard from './SavedPlantCard';
import { Loader2, ChevronDown, Camera, Plus, Stethoscope, Upload, Leaf, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { plantsAPI, getUserId } from "../api/axios";

const SavedPlantsSection = ({ plants, loading, onRefresh }) => {
  const [showAll, setShowAll] = useState(false);
  const [showManualAddModal, setShowManualAddModal] = useState(false);
  const [manualPlantData, setManualPlantData] = useState({
    plantName: '',
    scientificName: '',
    plantImage: '',
    plantType: 'plant',
    description: ''
  });
  const [addingPlant, setAddingPlant] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();
  const userId = getUserId();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-3 text-gray-600">Loading saved plants...</span>
      </div>
    );
  }

  // Ensure plants is always an array
  const plantsArray = plants || [];

  // Handle image upload for manual add
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setManualPlantData(prev => ({
        ...prev,
        plantImage: file // Store the file object for upload
      }));
      setImagePreview(imageUrl); // For preview
    }
  };

  // Handle manual plant addition

const handleManualAdd = async () => {
  if (!manualPlantData.plantName.trim()) {
    alert('Please enter plant name');
    return;
  }

  if (!userId) {
    alert('Please login to add plants');
    navigate('/login');
    return;
  }

  setAddingPlant(true);
  try {
    // Prepare plant data
    const plantData = {
      userId: userId,
      plantName: manualPlantData.plantName.trim(),
      scientificName: manualPlantData.scientificName.trim() || 'Unknown',
      plantType: manualPlantData.plantType,
      confidence: 0,
      detailedInfo: {
        identification: {
          commonName: manualPlantData.plantName.trim(),
          scientificName: manualPlantData.scientificName.trim() || 'Unknown',
          family: 'Manually added'
        },
        characteristics: {
          description: manualPlantData.description || 'Manually added plant'
        }
      },
      careTips: ['Water when soil is dry', 'Provide indirect sunlight'],
      funFact: 'Manually added to your collection'
    };

    let saveResult;

    // If there's an image file, use FormData like in Plant Identification
    if (manualPlantData.plantImage instanceof File) {
      console.log('📤 Uploading with FormData...');
      
      const formData = new FormData();
      formData.append('plantImage', manualPlantData.plantImage);
      formData.append('data', JSON.stringify(plantData));
      
      saveResult = await plantsAPI.savePlantWithImage(formData);
    } else {
      // If no image, use regular JSON API
      console.log('📤 Saving plant data only...');
      plantData.plantImage = ''; // Ensure empty string if no image
      saveResult = await plantsAPI.savePlant(plantData);
    }

    if (saveResult.data.success) {
      // Refresh plants list
      if (onRefresh) onRefresh();
      // Reset form
      resetForm();
      setShowManualAddModal(false);
      alert('✅ Plant added successfully!');
    } else {
      throw new Error(saveResult.data.message || 'Failed to save plant');
    }

  } catch (error) {
    console.error('Error adding plant:', error);
    
    // Check if it's a network error or server error
    if (error.response) {
      console.error('Server response error:', error.response.data);
      alert(`Server error: ${error.response.data?.message || error.response.statusText}`);
    } else if (error.request) {
      console.error('No response received:', error.request);
      alert('Network error: Please check your connection');
    } else {
      // Fallback to localStorage
      try {
        const savedPlants = JSON.parse(localStorage.getItem('savedPlants') || '[]');
        const newPlant = {
          id: Date.now(),
          userId: userId,
          plantName: manualPlantData.plantName,
          scientificName: manualPlantData.scientificName || 'Unknown',
          plantImage: imagePreview || '',
          identifiedDate: new Date().toISOString(),
          confidence: 0,
          plantType: manualPlantData.plantType,
          detailedInfo: {
            identification: {
              commonName: manualPlantData.plantName,
              scientificName: manualPlantData.scientificName || 'Unknown'
            }
          },
          note: 'Manually added (local storage)'
        };
        
        savedPlants.push(newPlant);
        localStorage.setItem('savedPlants', JSON.stringify(savedPlants));
        
        resetForm();
        setShowManualAddModal(false);
        if (onRefresh) onRefresh();
        alert('✅ Plant added locally!');
      } catch (localError) {
        console.error('Local save error:', localError);
        alert('❌ Failed to add plant: ' + error.message);
      }
    }
  } finally {
    setAddingPlant(false);
  }
};
  // Reset form data
  const resetForm = () => {
    setManualPlantData({
      plantName: '',
      scientificName: '',
      plantImage: '',
      plantType: 'plant',
      description: ''
    });
    setImagePreview(null);
  };

  // Close modal and reset form
  const closeModal = () => {
    setShowManualAddModal(false);
    resetForm();
  };

  if (plantsArray.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">🌿</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Saved Plants Yet</h3>
        <p className="text-gray-500 mb-6">Identify and save plants to see them here!</p>
        
        {/* Action Buttons Section */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <button
            onClick={() => navigate('/plantIdentification')}
            className="flex items-center gap-2 bg-black text-white px-3 py-1 text-xs rounded-full hover:bg-gray-800 transition-colors"
          >
            <Camera className="w-3 h-3" />
            Identify Plant
          </button>
          
          <button
            onClick={() => setShowManualAddModal(true)}
            className="flex items-center gap-2 bg-black text-white px-3 py-1 text-xs rounded-full hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Plant Manually
          </button>
          
         
        </div>

        {/* Manual Add Modal */}
        {showManualAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-semibold text-gray-800">Add Plant Manually</h3>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  {/* Plant Image */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Plant Image (Optional)</label>
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Plant preview" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setImagePreview(null);
                            setManualPlantData(prev => ({ ...prev, plantImage: '' }));
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Click to upload image</span>
                          <span className="text-xs text-gray-400 mt-1">Optional</span>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Plant Name *
                    </label>
                    <input
                      type="text"
                      value={manualPlantData.plantName}
                      onChange={(e) => setManualPlantData(prev => ({ ...prev, plantName: e.target.value }))}
                      placeholder="e.g., Snake Plant"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Scientific Name
                    </label>
                    <input
                      type="text"
                      value={manualPlantData.scientificName}
                      onChange={(e) => setManualPlantData(prev => ({ ...prev, scientificName: e.target.value }))}
                      placeholder="e.g., Dracaena trifasciata"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Plant Type
                    </label>
                    <select
                      value={manualPlantData.plantType}
                      onChange={(e) => setManualPlantData(prev => ({ ...prev, plantType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="plant">Plant</option>
                      <option value="flower">Flower</option>
                      <option value="succulent">Succulent</option>
                      <option value="herb">Herb</option>
                      <option value="tree">Tree</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Description
                    </label>
                    <textarea
                      value={manualPlantData.description}
                      onChange={(e) => setManualPlantData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the plant..."
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleManualAdd}
                      disabled={addingPlant || !manualPlantData.plantName.trim()}
                      className="flex-1 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {addingPlant ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add Plant
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Determine which plants to show
  const plantsToShow = showAll ? plantsArray : plantsArray.slice(0, 4);
  const hasMorePlants = plantsArray.length > 4;

  return (
    <div className="space-y-6">
      {/* Header with Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Your Plant Collection</h2>
          <p className="text-gray-500 mt-1">
            {plantsArray.length} {plantsArray.length === 1 ? 'plant' : 'plants'} saved
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/plantIdentification')}
            className="flex items-center gap-2 bg-black text-white px-3 py-1 text-xs rounded-full hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            <Camera className="w-3 h-3" />
            Identify Plant
          </button>
          
          <button
            onClick={() => setShowManualAddModal(true)}
            className="flex items-center gap-2 bg-black text-white px-3 py-1 text-xs rounded-full hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3 h-3" />
            Add Plant Manually
          </button>
          
          
        </div>
      </div>

      {/* Plants Grid - Simple */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plantsToShow.map((plant, index) => (
          <SavedPlantCard 
            key={plant.id || plant._id || index} 
            plant={plant} 
          />
        ))}
      </div>

      {/* See More Button - Only show if there are more than 4 plants */}
      {hasMorePlants && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 bg-black text-white px-3 py-1 text-xs rounded-full hover:bg-gray-800 transition-colors"
          >
            {showAll ? 'Show Less' : `See ${plantsArray.length - 4} More`}
            <ChevronDown className={`w-3 h-3 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* Manual Add Modal (when plants exist) */}
      {showManualAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Leaf className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Add Plant Manually</h3>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Plant Image */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Plant Image (Optional)</label>
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Plant preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          setManualPlantData(prev => ({ ...prev, plantImage: '' }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload image</span>
                        <span className="text-xs text-gray-400 mt-1">Optional</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Plant Name *
                  </label>
                  <input
                    type="text"
                    value={manualPlantData.plantName}
                    onChange={(e) => setManualPlantData(prev => ({ ...prev, plantName: e.target.value }))}
                    placeholder="e.g., Snake Plant"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Scientific Name
                  </label>
                  <input
                    type="text"
                    value={manualPlantData.scientificName}
                    onChange={(e) => setManualPlantData(prev => ({ ...prev, scientificName: e.target.value }))}
                    placeholder="e.g., Dracaena trifasciata"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Plant Type
                  </label>
                  <select
                    value={manualPlantData.plantType}
                    onChange={(e) => setManualPlantData(prev => ({ ...prev, plantType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="plant">Plant</option>
                    <option value="flower">Flower</option>
                    <option value="succulent">Succulent</option>
                    <option value="herb">Herb</option>
                    <option value="tree">Tree</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Description
                  </label>
                  <textarea
                    value={manualPlantData.description}
                    onChange={(e) => setManualPlantData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the plant..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleManualAdd}
                    disabled={addingPlant || !manualPlantData.plantName.trim()}
                    className="flex-1 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {addingPlant ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Plant
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedPlantsSection;
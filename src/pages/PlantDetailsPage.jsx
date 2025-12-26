import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Leaf, Calendar, Star, ThermometerSun, Droplets, Sun, 
  Thermometer, Gauge, Scissors, Flower, Sparkles, Bookmark, 
  Share2, Download, Printer, Trash2, ChevronRight, Clock
} from 'lucide-react';
import api, { plantsAPI } from '../api/axios';

const PlantDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { plantId } = useParams();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Get plant data from location state or fetch from API
  useEffect(() => {
    const fetchPlantDetails = async () => {
      try {
        if (location.state?.plant) {
          // Use plant data passed from SavedPlantCard
          setPlant(location.state.plant);
        } else if (plantId) {
          // Fetch plant from API using plantId
          const response = await plantsAPI.getPlantById(plantId);
          if (response.data.success) {
            setPlant(response.data.plant);
          }
        }
      } catch (error) {
        console.error('Error fetching plant details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantDetails();
  }, [plantId, location.state]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDeletePlant = async () => {
    setDeleting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Get correct plant ID
      const idToDelete = plantId || plant?._id || plant?.id;
      
      if (!idToDelete) {
        console.error('No plant ID found for deletion');
        return;
      }

      if (!user?.id && !user?._id) {
        console.error('No user ID found');
        return;
      }

      // Call delete API
      await plantsAPI.deletePlant(idToDelete, user.id || user._id);
      
      // Remove from localStorage if exists
      const savedPlants = JSON.parse(localStorage.getItem('savedPlants') || '[]');
      const updatedPlants = savedPlants.filter(p => 
        p.id !== idToDelete && p._id !== idToDelete
      );
      localStorage.setItem('savedPlants', JSON.stringify(updatedPlants));
      
      // Navigate to dashboard
      navigate('/user-dashboard');
    } catch (error) {
      console.error('Error deleting plant:', error);
      alert('Failed to delete plant. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Recently';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800';
    if (confidence >= 70) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
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
        <div class="w-full h-96 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
          <Leaf class="w-32 h-32 text-green-300" />
        </div>
      `;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plant details...</p>
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Plant Not Found</h2>
          <p className="text-gray-500 mb-6">The plant you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/user-dashboard')}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {plant.plantName || 'Unnamed Plant'}
                </h1>
                <p className="text-gray-600 italic">
                  {plant.scientificName || 'Unknown species'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Print"
              >
                <Printer className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-600"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Plant Image & Basic Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Plant Image - FIXED with blob URL check */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {isValidImage(plant?.plantImage) ? (
                <img
                  src={plant.plantImage}
                  alt={plant.plantName}
                  className="w-full h-96 object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                  <Leaf className="w-32 h-32 text-green-300" />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full ${getConfidenceColor(plant.confidence)} text-sm font-medium`}>
                    {Math.round(plant.confidence || 0)}% Confidence
                  </div>
                  <div className="px-3 py-1 bg-black text-white text-xs rounded-full font-medium">
                    {plant.plantType?.toUpperCase() || 'PLANT'}
                  </div>
                </div>
                
                <p className="text-gray-700">
                  {plant.detailedInfo?.characteristics?.description || 
                   'No description available for this plant.'}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg">
              <div className="border-b">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-4 px-6 text-center font-medium ${
                      activeTab === 'overview'
                        ? 'border-b-2 border-green-500 text-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('care')}
                    className={`flex-1 py-4 px-6 text-center font-medium ${
                      activeTab === 'care'
                        ? 'border-b-2 border-green-500 text-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Care Guide
                  </button>
                  <button
                    onClick={() => setActiveTab('problems')}
                    className={`flex-1 py-4 px-6 text-center font-medium ${
                      activeTab === 'problems'
                        ? 'border-b-2 border-green-500 text-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Common Problems
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {plant.detailedInfo?.identification && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Leaf className="w-5 h-5 text-green-600" />
                          Identification
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Common Name</p>
                            <p className="font-semibold text-gray-800">{plant.detailedInfo.identification.commonName}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Scientific Name</p>
                            <p className="font-semibold text-gray-800 italic">{plant.detailedInfo.identification.scientificName}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Family</p>
                            <p className="font-semibold text-gray-800">{plant.detailedInfo.identification.family}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {plant.detailedInfo?.characteristics && Object.keys(plant.detailedInfo.characteristics).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Flower className="w-5 h-5 text-blue-600" />
                          Characteristics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(plant.detailedInfo.characteristics).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm font-medium text-gray-700 capitalize mb-1">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </p>
                              <p className="text-gray-800">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {plant.detailedInfo?.commonUses && plant.detailedInfo.commonUses.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Uses</h3>
                        <div className="flex flex-wrap gap-2">
                          {plant.detailedInfo.commonUses.map((use, index) => (
                            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {use}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {plant.detailedInfo?.funFact && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Did You Know?
                        </h3>
                        <p className="text-green-700">{plant.detailedInfo.funFact}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'care' && (
                  <div className="space-y-6">
                    {plant.detailedInfo?.growingConditions && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <ThermometerSun className="w-5 h-5 text-amber-600" />
                          Growing Conditions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(plant.detailedInfo.growingConditions).map(([key, value]) => {
                            const getIcon = () => {
                              switch (key) {
                                case 'sunlight': return <Sun className="w-8 h-8 text-amber-500" />;
                                case 'water': return <Droplets className="w-8 h-8 text-blue-500" />;
                                case 'temperature': return <Thermometer className="w-8 h-8 text-red-500" />;
                                case 'humidity': return <Gauge className="w-8 h-8 text-purple-500" />;
                                case 'soil': return <Leaf className="w-8 h-8 text-green-500" />;
                                default: return <Leaf className="w-8 h-8 text-gray-500" />;
                              }
                            };

                            return (
                              <div key={key} className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="flex justify-center mb-2">{getIcon()}</div>
                                <p className="text-sm font-medium text-gray-700 capitalize mb-1">{key}</p>
                                <p className="text-sm text-gray-600">{value}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {plant.detailedInfo?.careInstructions && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Scissors className="w-5 h-5 text-cyan-600" />
                          Care Instructions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {Object.entries(plant.detailedInfo.careInstructions).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-gray-700 capitalize mb-2">{key}</h4>
                              <p className="text-gray-600">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {plant.detailedInfo?.propagation && (
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-purple-800 mb-2">Propagation</h3>
                        <p className="text-purple-700">{plant.detailedInfo.propagation}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'problems' && (
                  <div className="space-y-6">
                    {plant.detailedInfo?.toxicity && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Toxicity Warning</h3>
                        <p className="text-red-700">{plant.detailedInfo.toxicity}</p>
                      </div>
                    )}

                    {plant.detailedInfo?.commonProblems && plant.detailedInfo.commonProblems.length > 0 ? (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Problems & Solutions</h3>
                        <div className="space-y-4">
                          {plant.detailedInfo.commonProblems.map((problem, index) => (
                            <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                              <h4 className="font-semibold text-gray-800 mb-2">{problem.problem}</h4>
                              <div className="space-y-2">
                                <p className="text-sm">
                                  <span className="font-medium text-gray-700">Symptoms:</span>{' '}
                                  <span className="text-gray-600">{problem.symptoms}</span>
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium text-gray-700">Solution:</span>{' '}
                                  <span className="text-gray-600">{problem.solution}</span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No common problems recorded for this plant.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Plant Info</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Identified</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(plant.identifiedDate || new Date())}
                    </p>
                  </div>
                </div>
                
                {plant.detailedInfo?.identification?.family && (
                  <div className="flex items-center gap-3">
                    <Leaf className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Family</p>
                      <p className="font-medium text-gray-800">{plant.detailedInfo.identification.family}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Confidence Score</p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {Math.round(plant.confidence || 0)}%
                      </span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${plant.confidence || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

           

           

            {/* Last Checked */}
            {plant.lastChecked && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Last checked: {formatDate(plant.lastChecked)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">
              Delete Plant?
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete "{plant.plantName}"? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlant}
                disabled={deleting}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Plant'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantDetailsPage;
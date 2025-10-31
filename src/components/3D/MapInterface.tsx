import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigationStore } from '@/stores/navigationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Navigation, 
  X, 
  Filter,
  Clock,
  Users,
  Plane,
  ShoppingBag,
  Utensils,
  Shield,
  Car,
  Info,
  ArrowLeft,
  Target,
  Play,
  Square
} from 'lucide-react';
import AirportScene from './AirportScene';
import ChatBot from '../ChatBot';

interface MapInterfaceProps {
  userType: 'passenger' | 'visitor';
  onBack: () => void;
}

const MapInterface: React.FC<MapInterfaceProps> = ({ userType, onBack }) => {
  const { t, language } = useLanguage();
  const {
    locations,
    selectedLocation,
    currentPath,
    isNavigating,
    searchQuery,
    activeFilters,
    userPosition,
    isTracking,
    selectLocation,
    navigateTo,
    stopNavigation,
    setSearchQuery,
    toggleFilter,
    setUserPosition,
    startTracking,
    stopTracking,
    setUserType
  } = useNavigationStore();

  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setUserType(userType);
    // Simulate initial user position
    if (!userPosition) {
      setUserPosition({
        position: [5, 0, 5],
        terminal: 'Central',
        lastUpdated: new Date()
      });
    }
  }, [userType, userPosition, setUserPosition, setUserType]);

  // Simulate location tracking
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        // Simulate slight position changes
        const currentPos = userPosition?.position || [5, 0, 5];
        const newPos: [number, number, number] = [
          currentPos[0] + (Math.random() - 0.5) * 0.5,
          currentPos[1],
          currentPos[2] + (Math.random() - 0.5) * 0.5
        ];
        
        setUserPosition({
          position: newPos,
          terminal: userPosition?.terminal || 'Central',
          lastUpdated: new Date()
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isTracking, userPosition, setUserPosition]);

  const filterTypes = [
    { id: 'gate', label: 'Portes', icon: Plane, color: 'bg-blue-500' },
    { id: 'shop', label: 'Boutiques', icon: ShoppingBag, color: 'bg-purple-500' },
    { id: 'restaurant', label: 'Restaurants', icon: Utensils, color: 'bg-orange-500' },
    { id: 'security', label: 'Sécurité', icon: Shield, color: 'bg-red-500' },
    { id: 'baggage', label: 'Bagages', icon: Car, color: 'bg-blue-400' },
    { id: 'service', label: 'Services', icon: Info, color: 'bg-green-500' },
    { id: 'parking', label: 'Parking', icon: Car, color: 'bg-gray-500' }
  ];

  // Filter locations based on search and filters
  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilters.length === 0 || activeFilters.includes(location.type);
    const matchesUserType = userType === 'passenger' || 
                           (userType === 'visitor' && ['baggage', 'service', 'restaurant', 'shop', 'parking'].includes(location.type));
    
    return matchesSearch && matchesFilter && matchesUserType;
  });

  const handleLocationSelect = (location: any) => {
    selectLocation(location);
    setShowLocationDetails(true);
  };

  const handleNavigate = (location: any) => {
    navigateTo(location);
    setShowLocationDetails(false);
  };

  const getTypeIcon = (type: string) => {
    const filterType = filterTypes.find(f => f.id === type);
    return filterType ? filterType.icon : MapPin;
  };

  const getWaitTimeColor = (waitTime?: number) => {
    if (!waitTime) return 'bg-gray-500';
    if (waitTime < 10) return 'bg-green-500';
    if (waitTime < 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-background flex" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* 3D Map */}
      <div className="flex-1 relative">
        <AirportScene />
        
        {/* Map Controls Overlay */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="flex items-center justify-between">
            <Button onClick={onBack} variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-2">
              <Button
                onClick={isTracking ? stopTracking : startTracking}
                variant={isTracking ? "destructive" : "hero"}
                size="sm"
                className="bg-background/80 backdrop-blur-sm"
              >
                {isTracking ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isTracking ? 'Arrêter' : 'Suivre'}
              </Button>
              
              {isNavigating && (
                <Button
                  onClick={stopNavigation}
                  variant="outline"
                  size="sm"
                  className="bg-background/80 backdrop-blur-sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Arrêter Navigation
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Current Navigation Info */}
        <AnimatePresence>
          {currentPath && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10"
            >
              <Card className="bg-primary text-primary-foreground shadow-hero">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Navigation className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">Navigation vers {currentPath.end.name}</div>
                      <div className="text-sm opacity-90">
                        Distance: {currentPath.distance.toFixed(0)}m • 
                        Temps estimé: {currentPath.estimatedTime} min
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side Panel */}
      <div className="w-96 bg-background border-l border-border overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              {userType === 'passenger' ? 'Navigation Passager' : 'Navigation Visiteur'}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Position: {userPosition?.terminal || 'Recherche...'}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un lieu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className="w-full justify-between"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtres ({activeFilters.length})
              </div>
            </Button>
            
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 space-y-2"
                >
                  {filterTypes.map(filter => (
                    <Button
                      key={filter.id}
                      onClick={() => toggleFilter(filter.id)}
                      variant={activeFilters.includes(filter.id) ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                    >
                      <filter.icon className="h-4 w-4 mr-2" />
                      {filter.label}
                    </Button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Current Location Info */}
          {userPosition && (
            <Card className="bg-accent/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-medium">Votre Position</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Terminal: {userPosition.terminal}<br />
                  Dernière mise à jour: {userPosition.lastUpdated.toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Locations List */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Lieux ({filteredLocations.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredLocations.map(location => {
                const IconComponent = getTypeIcon(location.type);
                return (
                  <Card
                    key={location.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedLocation?.id === location.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleLocationSelect(location)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            filterTypes.find(f => f.id === location.type)?.color || 'bg-gray-500'
                          }`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{location.name}</div>
                            {location.terminal && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Terminal {location.terminal}
                              </Badge>
                            )}
                            {location.description && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {location.description}
                              </div>
                            )}
                            {location.waitTime && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                <span className="text-xs">Attente: {location.waitTime} min</span>
                                <div className={`w-2 h-2 rounded-full ${getWaitTimeColor(location.waitTime)}`} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Location Details Modal */}
      <AnimatePresence>
        {showLocationDetails && selectedLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLocationDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {React.createElement(getTypeIcon(selectedLocation.type), { className: "h-5 w-5" })}
                      {selectedLocation.name}
                    </CardTitle>
                    <Button
                      onClick={() => setShowLocationDetails(false)}
                      variant="ghost"
                      size="icon"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedLocation.terminal && (
                    <Badge variant="outline">Terminal {selectedLocation.terminal}</Badge>
                  )}
                  
                  {selectedLocation.description && (
                    <p className="text-muted-foreground">{selectedLocation.description}</p>
                  )}
                  
                  {selectedLocation.waitTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Temps d'attente: {selectedLocation.waitTime} minutes</span>
                      <div className={`w-3 h-3 rounded-full ${getWaitTimeColor(selectedLocation.waitTime)}`} />
                    </div>
                  )}
                  
                  {selectedLocation.open !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${selectedLocation.open ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span>{selectedLocation.open ? 'Ouvert' : 'Fermé'}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleNavigate(selectedLocation)}
                      variant="hero"
                      className="flex-1"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Navigation
                    </Button>
                    <Button
                      onClick={() => setShowLocationDetails(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Fermer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chatbot */}
      <ChatBot isMinimal={true} />
    </div>
  );
};

export default MapInterface;
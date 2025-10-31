import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  ArrowLeft,
  Clock,
  MapPin,
  Plane,
  Package,
  QrCode,
  Share2,
  Eye,
  AlertCircle,
  CheckCircle,
  Car
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import MapInterface from './3D/MapInterface';
import ChatBot from './ChatBot';

interface FlightInfo {
  flightNumber: string;
  origin: string;
  arrivalTime: string;
  status: 'On Time' | 'Delayed' | 'Landed' | 'Arrived';
  gate: string;
  terminal: string;
  baggage?: string;
}

interface VisitorInterfaceProps {
  onBack: () => void;
}

const VisitorInterface: React.FC<VisitorInterfaceProps> = ({ onBack }) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'main' | 'map' | 'tracking'>('main');
  const [flightSearch, setFlightSearch] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [selectedFlight, setSelectedFlight] = useState<FlightInfo | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [meetingPoint, setMeetingPoint] = useState<string | null>(null);

  const mockArrivals: FlightInfo[] = [
    {
      flightNumber: 'AF1234',
      origin: 'Paris CDG',
      arrivalTime: '14:30',
      status: 'On Time',
      gate: 'A5',
      terminal: 'A',
      baggage: 'Carrousel 1'
    },
    {
      flightNumber: 'BA567',
      origin: 'London Aero Way',
      arrivalTime: '15:15',
      status: 'Landed',
      gate: 'B8',
      terminal: 'B',
      baggage: 'Carrousel 3'
    },
    {
      flightNumber: 'EK123',
      origin: 'Dubai DXB',
      arrivalTime: '16:00',
      status: 'Delayed',
      gate: 'B12',
      terminal: 'B',
      baggage: 'Carrousel 2'
    },
    {
      flightNumber: 'LH890',
      origin: 'Frankfurt FRA',
      arrivalTime: '16:45',
      status: 'On Time',
      gate: 'A10',
      terminal: 'A',
      baggage: 'Carrousel 1'
    }
  ];

  const filteredFlights = mockArrivals.filter(flight => 
    flight.flightNumber.toLowerCase().includes(flightSearch.toLowerCase()) ||
    flight.origin.toLowerCase().includes(flightSearch.toLowerCase())
  );

  const handleFlightSelect = (flight: FlightInfo) => {
    setSelectedFlight(flight);
    // Suggest meeting point based on flight status
    if (flight.status === 'Landed' || flight.status === 'Arrived') {
      setMeetingPoint(`Zone d'arrivée Terminal ${flight.terminal} - près du ${flight.baggage}`);
    } else {
      setMeetingPoint(`Café Terminal ${flight.terminal} - Zone d'attente`);
    }
  };

  const handleTrackingCodeSubmit = () => {
    if (!trackingCode) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer le code de suivi",
        variant: "destructive"
      });
      return;
    }

    setIsTracking(true);
    toast({
      title: "Suivi activé",
      description: "Vous pouvez maintenant suivre votre proche en temps réel",
    });

    // Simulate passenger tracking
    setTimeout(() => {
      toast({
        title: "Passager localisé",
        description: "Votre proche est actuellement au contrôle sécurité Terminal A",
      });
    }, 3000);
  };

  const handlePackagePickup = () => {
    toast({
      title: "Service colis",
      description: "Veuillez vous présenter au comptoir de service avec votre pièce d'identité",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Time': return 'bg-green-500';
      case 'Delayed': return 'bg-yellow-500';
      case 'Landed': return 'bg-blue-500';
      case 'Arrived': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Landed':
      case 'Arrived':
        return CheckCircle;
      case 'Delayed':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  if (currentView === 'map') {
    return <MapInterface userType="visitor" onBack={() => setCurrentView('main')} />;
  }

  return (
    <div className="min-h-screen bg-secondary/30 p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary">Espace Visiteur</h1>
              <p className="text-muted-foreground">Accueillez vos proches et naviguez facilement</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight Search */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    Recherche de Vols d'Arrivée
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Numéro de vol ou ville d'origine (ex: AF1234, Paris)"
                      value={flightSearch}
                      onChange={(e) => setFlightSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredFlights.map(flight => {
                      const StatusIcon = getStatusIcon(flight.status);
                      return (
                        <Card
                          key={flight.flightNumber}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedFlight?.flightNumber === flight.flightNumber ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => handleFlightSelect(flight)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div>
                                  <div className="font-bold text-lg">{flight.flightNumber}</div>
                                  <div className="text-sm text-muted-foreground">{flight.origin}</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-semibold">Arrivée</div>
                                  <div className="text-lg">{flight.arrivalTime}</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-semibold">Terminal</div>
                                  <div className="text-xl font-bold text-primary">{flight.terminal}</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-semibold">Porte</div>
                                  <div className="text-xl font-bold text-primary">{flight.gate}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusIcon className="h-4 w-4" />
                                <Badge className={`${getStatusColor(flight.status)} text-white`}>
                                  {flight.status}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {selectedFlight && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Vol sélectionné: {selectedFlight.flightNumber}</h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Récupération bagages:</span>
                          <div className="font-medium">{selectedFlight.baggage}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Point de rencontre suggéré:</span>
                          <div className="font-medium text-sm">{meetingPoint}</div>
                        </div>
                      </div>
                      <Button
                        onClick={() => setCurrentView('map')}
                        variant="hero"
                        className="w-full"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Navigation vers la Zone d'Arrivée
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Meet & Greet Tracking */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Suivi Meet & Greet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Entrez le code de suivi fourni par votre proche pour le suivre en temps réel
                  </p>
                  
                  {!isTracking ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Code de suivi (ex: ABC123)"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                        className="flex-1"
                      />
                      <Button onClick={handleTrackingCodeSubmit} variant="accent">
                        <Eye className="h-4 w-4 mr-2" />
                        Suivre
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Suivi actif - Code: {trackingCode}</span>
                      </div>
                      
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <div>
                              <div className="font-medium">Position actuelle</div>
                              <div className="text-sm text-muted-foreground">Contrôle sécurité - Terminal A</div>
                              <div className="text-xs text-muted-foreground">Dernière mise à jour: maintenant</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setCurrentView('map')}
                          variant="outline"
                          className="flex-1"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Voir sur la Carte
                        </Button>
                        <Button
                          onClick={() => setIsTracking(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          Arrêter le Suivi
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Services Visiteur</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setCurrentView('map')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Carte de l'Aéroport
                  </Button>
                  
                  <Button
                    onClick={handlePackagePickup}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Récupération de Colis
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Car className="h-4 w-4 mr-2" />
                    Zone de Dépose
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <QrCode className="h-4 w-4 mr-2" />
                    Code d'Accès Temporaire
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Information Panel */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Informations Utiles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Zones Accessibles</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Zone d'arrivée publique</li>
                      <li>• Boutiques et restaurants</li>
                      <li>• Récupération bagages (avec autorisation)</li>
                      <li>• Points de rencontre désignés</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Services Disponibles</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Information et assistance</li>
                      <li>• Récupération de colis</li>
                      <li>• Zones d'attente confortables</li>
                      <li>• Wi-Fi gratuit</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium text-sm">Astuce</span>
                    </div>
                    <p className="text-xs text-blue-600">
                      Demandez le code Meet & Greet à votre proche avant son départ pour un suivi en temps réel
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Chatbot */}
      <ChatBot isMinimal={true} />
    </div>
  );
};

export default VisitorInterface;
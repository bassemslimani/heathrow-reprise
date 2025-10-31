import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, 
  QrCode, 
  Camera, 
  ArrowLeft,
  Clock,
  MapPin,
  Bell,
  Users,
  Wifi,
  ShoppingBag,
  AlertTriangle,
  CheckCircle,
  Share2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import MapInterface from './3D/MapInterface';
import ChatBot from './ChatBot';

interface FlightInfo {
  flightNumber: string;
  destination: string;
  gate: string;
  terminal: string;
  departureTime: string;
  status: 'On Time' | 'Delayed' | 'Boarding' | 'Departed';
  boardingTime: string;
}

interface PassengerInterfaceProps {
  onBack: () => void;
}

const PassengerInterface: React.FC<PassengerInterfaceProps> = ({ onBack }) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'main' | 'map' | 'notifications' | 'services'>('main');
  const [ticketInput, setTicketInput] = useState('');
  const [flightInfo, setFlightInfo] = useState<FlightInfo | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [meetGreetCode, setMeetGreetCode] = useState('');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'Boarding commencé',
      message: 'Embarquement pour le vol AF1234 a commencé - Porte A5',
      time: '10:30',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Retard de vol',
      message: 'Votre vol vers Londres a 15 minutes de retard',
      time: '09:45',
      read: false
    },
    {
      id: 3,
      type: 'success',
      title: 'Check-in confirmé',
      message: 'Votre check-in a été confirmé avec succès',
      time: '08:20',
      read: true
    }
  ]);

  const handleTicketScan = () => {
    setIsScanning(true);
    // Simulate ticket scanning
    setTimeout(() => {
      const mockFlightInfo: FlightInfo = {
        flightNumber: 'AF1234',
        destination: 'Paris CDG',
        gate: 'A5',
        terminal: 'A',
        departureTime: '14:30',
        status: 'On Time',
        boardingTime: '14:00'
      };
      setFlightInfo(mockFlightInfo);
      setIsScanning(false);
      toast({
        title: "Billet scanné",
        description: "Informations de vol récupérées avec succès",
      });
    }, 2000);
  };

  const handleManualEntry = () => {
    if (!ticketInput) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre numéro de billet",
        variant: "destructive"
      });
      return;
    }

    const mockFlightInfo: FlightInfo = {
      flightNumber: ticketInput.toUpperCase(),
      destination: 'New York JFK',
      gate: 'B12',
      terminal: 'B',
      departureTime: '16:45',
      status: 'Boarding',
      boardingTime: '16:15'
    };
    setFlightInfo(mockFlightInfo);
    toast({
      title: "Vol trouvé",
      description: "Informations récupérées avec succès",
    });
  };

  const generateMeetGreetCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setMeetGreetCode(code);
    toast({
      title: "Code Meet & Greet généré",
      description: `Code: ${code}. Partagez ce code avec votre proche.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Time': return 'bg-green-500';
      case 'Delayed': return 'bg-yellow-500';
      case 'Boarding': return 'bg-blue-500';
      case 'Departed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Bell;
    }
  };

  if (currentView === 'map') {
    return <MapInterface userType="passenger" onBack={() => setCurrentView('main')} />;
  }

  return (
    <div className="min-h-screen bg-secondary/30 p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
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
              <h1 className="text-3xl font-bold text-primary">Espace Passager</h1>
              <p className="text-muted-foreground">Gérez votre voyage et naviguez facilement</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentView('notifications')}
              variant="outline"
              size="icon"
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight Information */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    Informations de Vol
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!flightInfo ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">
                          Scannez votre billet ou entrez votre numéro de vol
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          placeholder="Numéro de billet/vol (ex: AF1234)"
                          value={ticketInput}
                          onChange={(e) => setTicketInput(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={handleManualEntry} variant="outline">
                          Valider
                        </Button>
                      </div>
                      
                      <div className="text-center">
                        <Button
                          onClick={handleTicketScan}
                          variant="hero"
                          disabled={isScanning}
                          className="w-full"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          {isScanning ? 'Scan en cours...' : 'Scanner le Billet'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold">{flightInfo.flightNumber}</h3>
                          <p className="text-muted-foreground">{flightInfo.destination}</p>
                        </div>
                        <Badge className={`${getStatusColor(flightInfo.status)} text-white`}>
                          {flightInfo.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="font-semibold">Terminal</div>
                          <div className="text-2xl font-bold text-primary">{flightInfo.terminal}</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="font-semibold">Porte</div>
                          <div className="text-2xl font-bold text-primary">{flightInfo.gate}</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="font-semibold">Départ</div>
                          <div className="text-lg font-bold">{flightInfo.departureTime}</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="font-semibold">Embarquement</div>
                          <div className="text-lg font-bold">{flightInfo.boardingTime}</div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => setCurrentView('map')}
                        variant="hero"
                        className="w-full"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Navigation vers la Porte {flightInfo.gate}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Meet & Greet */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Système Meet & Greet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Permettez à vos proches de suivre votre arrivée en temps réel
                  </p>
                  
                  {!meetGreetCode ? (
                    <Button onClick={generateMeetGreetCode} variant="accent" className="w-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Générer Code de Suivi
                    </Button>
                  ) : (
                    <div className="text-center p-4 bg-accent/10 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">Code de suivi</div>
                      <div className="text-3xl font-bold text-accent tracking-widest">{meetGreetCode}</div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Partagez ce code avec votre proche pour qu'il puisse vous suivre
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Share2 className="h-4 w-4 mr-2" />
                        Partager
                      </Button>
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
                  <CardTitle>Actions Rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setCurrentView('map')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Carte 3D Interactive
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Boutiques & Restaurants
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Wifi className="h-4 w-4 mr-2" />
                    Wi-Fi Gratuit
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Temps d'Attente Sécurité
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Notifications */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications Récentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.slice(0, 3).map(notification => {
                    const IconComponent = getNotificationIcon(notification.type);
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border ${!notification.read ? 'bg-accent/10 border-accent/20' : 'bg-muted/50'}`}
                      >
                        <div className="flex items-start gap-2">
                          <IconComponent className={`h-4 w-4 mt-0.5 ${
                            notification.type === 'warning' ? 'text-yellow-500' :
                            notification.type === 'success' ? 'text-green-500' :
                            'text-blue-500'
                          }`} />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{notification.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {notification.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <Button
                    onClick={() => setCurrentView('notifications')}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  >
                    Voir toutes les notifications
                  </Button>
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

export default PassengerInterface;
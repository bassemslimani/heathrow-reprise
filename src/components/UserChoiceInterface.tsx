import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, 
  Users, 
  ArrowLeft,
  Volume2,
  Luggage,
  MapPin
} from 'lucide-react';
import ChatBot from './ChatBot';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

interface UserChoiceInterfaceProps {
  userData: UserData;
  onBack: () => void;
  onPassengerChoice: () => void;
  onVisitorChoice: () => void;
}

const UserChoiceInterface: React.FC<UserChoiceInterfaceProps> = ({ 
  userData, 
  onBack, 
  onPassengerChoice, 
  onVisitorChoice 
}) => {
  const { t, language } = useLanguage();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [showChoices, setShowChoices] = useState(false);

  useEffect(() => {
    // Play welcome audio
    const welcomeText = `${t('welcome_user')} ${userData.firstName}, ${t('passenger_or_visitor')}`;
    const utterance = new SpeechSynthesisUtterance(welcomeText);
    
    const voices = speechSynthesis.getVoices();
    let voice = voices.find(v => 
      v.lang.startsWith(language === 'ar' ? 'ar' : language === 'fr' ? 'fr' : 'en')
    );
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    speechSynthesis.speak(utterance);

    // Show choices after welcome message
    const timer = setTimeout(() => {
      setShowWelcomeMessage(false);
      setShowChoices(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [userData.firstName, t, language]);

  const playWelcomeAudio = () => {
    const welcomeText = `${t('welcome_user')} ${userData.firstName}, ${t('passenger_or_visitor')}`;
    const utterance = new SpeechSynthesisUtterance(welcomeText);
    
    const voices = speechSynthesis.getVoices();
    let voice = voices.find(v => 
      v.lang.startsWith(language === 'ar' ? 'ar' : language === 'fr' ? 'fr' : 'en')
    );
    
    if (voice) {
      utterance.voice = voice;
    }
    
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-accent rounded-full animate-ping" />
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-primary rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-secondary rounded-full animate-bounce" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-6 left-6 z-10"
      >
        <Button onClick={onBack} variant="ghost" size="icon" className="text-foreground hover:bg-accent/10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </motion.div>

      <div className="text-center z-10 max-w-2xl mx-auto">
        {/* Welcome Message Animation */}
        <AnimatePresence>
          {showWelcomeMessage && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2, repeat: Infinity, ease: "easeInOut"
                }}
                className="w-24 h-24 mx-auto bg-primary rounded-full flex items-center justify-center shadow-hero mb-6"
              >
                <Plane className="h-12 w-12 text-primary-foreground" />
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t('welcome_user')} {userData.firstName}!
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t('passenger_or_visitor')}
              </p>

              <Button
                onClick={playWelcomeAudio}
                variant="ghost"
                size="icon"
                className="mt-4 text-primary hover:bg-accent/10"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Choice Cards */}
        <AnimatePresence>
          {showChoices && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            >
              {/* Passenger Card */}
              <motion.div
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card 
                  className="bg-card border-border cursor-pointer h-full shadow-card hover:shadow-elegant transition-all duration-300"
                  onClick={onPassengerChoice}
                >
                  <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                    <div>
                      <div className="w-20 h-20 mx-auto bg-accent rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <Luggage className="h-10 w-10 text-accent-foreground" />
                      </div>
                      
                      <h2 className="text-2xl font-bold text-foreground mb-4">
                        {t('passenger')}
                      </h2>
                      
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        Suivez vos vols, naviguez dans l'aéroport avec la carte 3D, recevez des notifications personnalisées et partagez votre position.
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Plane className="h-4 w-4" />
                        <span>Suivi des vols en temps réel</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Navigation 3D de l'aéroport</span>
                      </div>
                    </div>

                    <Button
                      variant="default"
                      size="lg"
                      className="w-full mt-6 bg-accent hover:bg-accent/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPassengerChoice();
                      }}
                    >
                      {t('passenger')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Visitor Card */}
              <motion.div
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card 
                  className="bg-card border-border cursor-pointer h-full shadow-card hover:shadow-elegant transition-all duration-300"
                  onClick={onVisitorChoice}
                >
                  <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                    <div>
                      <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <Users className="h-10 w-10 text-primary-foreground" />
                      </div>
                      
                      <h2 className="text-2xl font-bold text-foreground mb-4">
                        {t('visitor')}
                      </h2>
                      
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        Localisez les arrivées, utilisez le système Meet & Greet, trouvez les points de rencontre et naviguez facilement.
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Système Meet & Greet</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Localisation des arrivées</span>
                      </div>
                    </div>

                    <Button
                      variant="default"
                      size="lg"
                      className="w-full mt-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onVisitorChoice();
                      }}
                    >
                      {t('visitor')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Chatbot */}
      <ChatBot isMinimal={true} />
    </div>
  );
};

export default UserChoiceInterface;
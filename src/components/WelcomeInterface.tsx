import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import ChatBot from './ChatBot';
import aerowayLogo from '@/assets/aeroway-logo.png';

interface WelcomeInterfaceProps {
  onContinue: () => void;
}

const WelcomeInterface: React.FC<WelcomeInterfaceProps> = ({ onContinue }) => {
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageSelection, setShowLanguageSelection] = useState(false);
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);

  const languages = [
    { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
    { code: 'ar' as Language, name: 'العربية', flag: '🇩🇿' },
    { code: 'en' as Language, name: 'English', flag: '🇬🇧' }
  ];

  useEffect(() => {
    // Show language selection after logo animation
    const timer = setTimeout(() => {
      setShowLanguageSelection(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Play welcome audio when language is selected and component mounts
    if (!hasPlayedWelcome && showLanguageSelection) {
      playWelcomeAudio();
      setHasPlayedWelcome(true);
    }
  }, [showLanguageSelection, language, hasPlayedWelcome]);

  const playWelcomeAudio = () => {
    const utterance = new SpeechSynthesisUtterance(t('welcome_message'));
    
    // Set language-specific voice
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
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    // Reset welcome audio flag to play in new language
    setHasPlayedWelcome(false);
  };

  const handleContinue = () => {
    onContinue();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-ping" />
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-accent rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-secondary rounded-full animate-bounce" />
      </div>

      <div className="text-center z-10">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 1.5, 
            ease: "easeOut",
            type: "spring",
            stiffness: 100
          }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2, repeat: Infinity, ease: "easeInOut"
              }}
              className="mb-6"
            >
              <img src={aerowayLogo} alt="Aero Way" className="h-40 w-auto mx-auto" />
            </motion.div>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              {t('welcome_message')}
            </motion.p>

            {/* Audio Button */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
              className="mt-4"
            >
              <Button
                onClick={playWelcomeAudio}
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-accent/10"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Language Selection */}
        <AnimatePresence>
          {showLanguageSelection && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Card className="bg-card border-border shadow-elegant p-8 max-w-md mx-auto">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  {t('choose_language')}
                </h2>
                
                <div className="grid gap-4 mb-6">
                  {languages.map((lang) => (
                    <motion.div
                      key={lang.code}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => handleLanguageSelect(lang.code)}
                        variant={language === lang.code ? "hero" : "outline"}
                        className={`w-full h-12 text-lg ${language === lang.code ? '' : 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground'}`}
                        dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                      >
                        <span className="text-2xl mr-3">{lang.flag}</span>
                        {lang.name}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    onClick={handleContinue}
                    variant="hero"
                    size="lg"
                    className="w-full text-lg py-6"
                  >
                    {t('continue')}
                  </Button>
                </motion.div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Chatbot */}
      <ChatBot isMinimal={true} />
    </div>
  );
};

export default WelcomeInterface;
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  MessageCircle, 
  X, 
  Minus, 
  Mic, 
  MicOff, 
  Volume2, 
  Send,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { useSpeechSynthesis } from 'react-speech-kit';

// Type declarations for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatBotProps {
  isMinimal?: boolean;
  onClose?: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isMinimal = false, onClose }) => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showInitialPrompt, setShowInitialPrompt] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const { speak, cancel, speaking } = useSpeechSynthesis();

  // Predefined responses based on the requirements
  const botResponses: { [key: string]: string } = {
    "comment fonctionne l'application": t('a1'),
    "how does the application work": t('a1'),
    "كيف يعمل التطبيق": t('a1'),
    "que puis-je faire": t('a2'),
    "what can i do": t('a2'),
    "ماذا يمكنني أن أفعل": t('a2'),
    
    // Common airport questions
    "où est mon terminal": "Je peux vous aider à localiser votre terminal. Avez-vous votre numéro de billet ?",
    "where is my terminal": "I can help you locate your terminal. Do you have your ticket number?",
    "أين المحطة الخاصة بي": "يمكنني مساعدتك في تحديد موقع المحطة. هل لديك رقم التذكرة؟",
    
    "retard de vol": "En cas de retard, vérifiez les écrans d'information ou l'application vous enverra une notification automatique.",
    "flight delay": "In case of delay, check the information screens or the app will send you an automatic notification.",
    "تأخير الرحلة": "في حالة التأخير، تحقق من شاشات المعلومات أو ستتلقى إشعارًا تلقائيًا من التطبيق.",
    
    "aide": "Je suis là pour vous aider ! Vous pouvez me poser des questions sur l'aéroport, vos vols, ou l'utilisation de l'application.",
    "help": "I'm here to help! You can ask me questions about the airport, your flights, or how to use the app.",
    "помощь": "أنا هنا لمساعدتك! يمكنك سؤالي عن المطار أو رحلاتك أو كيفية استخدام التطبيق."
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Set language based on current app language
      const speechLang = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';
      recognitionRef.current.lang = speechLang;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  const handleChatIconClick = () => {
    if (!isOpen) {
      setShowInitialPrompt(true);
    } else {
      setIsOpen(false);
      setShowInitialPrompt(false);
    }
  };

  const handleYesClick = () => {
    setShowInitialPrompt(false);
    setIsOpen(true);
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      text: t('chatbot_greeting'),
      isBot: true,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const handleNoClick = () => {
    setShowInitialPrompt(false);
    setIsOpen(false);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Generate bot response
    setTimeout(() => {
      const lowerInput = inputText.toLowerCase();
      let response = "Je comprends votre question. Laissez-moi vous aider avec cela.";
      
      // Find matching response
      for (const [key, value] of Object.entries(botResponses)) {
        if (lowerInput.includes(key.toLowerCase())) {
          response = value;
          break;
        }
      }

      // Default helpful responses based on language
      if (language === 'ar') {
        response = "أفهم سؤالك. دعني أساعدك في ذلك. يمكنك سؤالي عن الرحلات، الخدمات، أو التنقل في المطار.";
      } else if (language === 'en') {
        response = "I understand your question. Let me help you with that. You can ask me about flights, services, or navigating the airport.";
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setInputText('');
  };

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSpeak = (text: string) => {
    if (speaking) {
      cancel();
    } else {
      const voices = speechSynthesis.getVoices();
      let voice = voices.find(v => v.lang.startsWith(language === 'ar' ? 'ar' : language === 'fr' ? 'fr' : 'en'));
      
      speak({
        text,
        voice: voice,
        rate: 0.9,
        pitch: 1
      });
    }
  };

  const toggleExpanded = (messageId: string) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId);
  };

  if (isMinimal && !isOpen && !showInitialPrompt) {
    return (
      <Button
        onClick={handleChatIconClick}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-hero z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  if (showInitialPrompt) {
    return (
      <Card className="fixed bottom-20 right-6 w-80 p-4 shadow-hero z-50 bg-background border border-primary/20">
        <p className="text-sm mb-4">{t('chatbot_greeting')}</p>
        <div className="flex gap-2">
          <Button onClick={handleYesClick} variant="hero" size="sm" className="flex-1">
            {t('yes')}
          </Button>
          <Button onClick={handleNoClick} variant="outline" size="sm" className="flex-1">
            {t('no')}
          </Button>
        </div>
      </Card>
    );
  }

  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-hero z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-hero z-50 bg-background border border-primary/20 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">AeroWay Assistant</span>
        </div>
        <div className="flex gap-1">
          <Button
            onClick={() => setIsMinimized(true)}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
              setShowInitialPrompt(false);
              onClose?.();
            }}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-2 ${!message.isBot ? 'justify-end' : ''}`}>
            {message.isBot && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[70%] ${!message.isBot ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
              <p className="text-sm">
                {expandedMessage === message.id || message.text.length <= 100 
                  ? message.text 
                  : `${message.text.substring(0, 100)}...`
                }
              </p>
              {message.text.length > 100 && (
                <Button
                  onClick={() => toggleExpanded(message.id)}
                  variant="ghost"
                  size="sm"
                  className="h-6 p-1 mt-1"
                >
                  {expandedMessage === message.id ? t('close') : t('see_more')}
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${expandedMessage === message.id ? 'rotate-180' : ''}`} />
                </Button>
              )}
              {message.isBot && (
                <Button
                  onClick={() => handleSpeak(message.text)}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 mt-1"
                >
                  <Volume2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('type_question')}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          />
          <Button
            onClick={handleVoiceInput}
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            className="shrink-0"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button onClick={handleSendMessage} variant="hero" size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatBot;
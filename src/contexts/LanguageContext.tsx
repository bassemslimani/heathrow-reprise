import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  fr: {
    // Welcome Interface
    welcome_message: "Bienvenue chez AeroWay : l'alliance d'intelligence et du mouvement",
    choose_language: "Choisissez votre langue",
    continue: "Continuer",
    
    // Chatbot
    chatbot_greeting: "Bonjour, je suis là pour vous aider si vous avez besoin ?",
    yes: "Oui",
    no: "Non",
    type_question: "Tapez votre question...",
    send: "Envoyer",
    see_more: "Voir plus",
    close: "Fermer",
    minimize: "Réduire",
    
    // Registration
    register_title: "Créer un compte",
    login_title: "Se connecter",
    first_name: "Prénom",
    last_name: "Nom",
    birth_date: "Date de naissance",
    birth_place: "Lieu de naissance",
    city: "Ville",
    country: "Pays",
    phone: "Numéro de téléphone",
    email: "Email",
    national_id: "Numéro d'identité nationale",
    password: "Mot de passe",
    confirm_password: "Confirmer le mot de passe",
    accept_terms: "J'accepte les conditions générales d'utilisation",
    create_account: "Créer le compte",
    account_created: "Compte créé avec succès !",
    
    // Choice Interface
    welcome_user: "Bienvenue",
    passenger_or_visitor: "Êtes-vous aujourd'hui passager ou visiteur ?",
    passenger: "Passager",
    visitor: "Visiteur",
    
    // Chatbot Questions
    q1: "Comment fonctionne l'application ?",
    a1: "AeroWay est votre assistant intelligent pour l'aéroport. Vous pouvez suivre vos vols, naviguer avec la carte 3D, recevoir des notifications et utiliser le système Meet & Greet.",
    q2: "Que puis-je faire avec cette application ?",
    a2: "Vous pouvez : suivre vos vols en temps réel, naviguer dans l'aéroport avec la carte 3D, recevoir des notifications personnalisées, utiliser le chatbot vocal, et partager votre localisation avec vos proches.",
    
    // Error messages
    error_fill_required: "Veuillez remplir tous les champs obligatoires",
    error_password_match: "Les mots de passe ne correspondent pas",
    error_email_exists: "Cet email existe déjà",
  },
  
  ar: {
    // Welcome Interface
    welcome_message: "مرحباً بكم في AeroWay: تحالف الذكاء والحركة",
    choose_language: "اختر لغتك",
    continue: "متابعة",
    
    // Chatbot
    chatbot_greeting: "مرحباً، أنا هنا لمساعدتك إذا كنت بحاجة؟",
    yes: "نعم",
    no: "لا",
    type_question: "اكتب سؤالك...",
    send: "إرسال",
    see_more: "عرض المزيد",
    close: "إغلاق",
    minimize: "تصغير",
    
    // Registration
    register_title: "إنشاء حساب",
    login_title: "تسجيل الدخول",
    first_name: "الاسم الأول",
    last_name: "اسم العائلة",
    birth_date: "تاريخ الميلاد",
    birth_place: "مكان الميلاد",
    city: "المدينة",
    country: "البلد",
    phone: "رقم الهاتف",
    email: "البريد الإلكتروني",
    national_id: "رقم الهوية الوطنية",
    password: "كلمة المرور",
    confirm_password: "تأكيد كلمة المرور",
    accept_terms: "أوافق على الشروط والأحكام",
    create_account: "إنشاء الحساب",
    account_created: "تم إنشاء الحساب بنجاح!",
    
    // Choice Interface
    welcome_user: "مرحباً",
    passenger_or_visitor: "هل أنت اليوم مسافر أم زائر؟",
    passenger: "مسافر",
    visitor: "زائر",
    
    // Chatbot Questions
    q1: "كيف يعمل التطبيق؟",
    a1: "AeroWay هو مساعدك الذكي في المطار. يمكنك تتبع رحلاتك، والتنقل بالخريطة ثلاثية الأبعاد، وتلقي الإشعارات واستخدام نظام Meet & Greet.",
    q2: "ماذا يمكنني أن أفعل مع هذا التطبيق؟",
    a2: "يمكنك: تتبع رحلاتك في الوقت الفعلي، والتنقل في المطار بالخريطة ثلاثية الأبعاد، وتلقي إشعارات مخصصة، واستخدام الدردشة الصوتية، ومشاركة موقعك مع أحبائك.",
    
    // Error messages
    error_fill_required: "يرجى ملء جميع الحقول المطلوبة",
    error_password_match: "كلمات المرور غير متطابقة",
    error_email_exists: "هذا البريد الإلكتروني موجود بالفعل",
  },
  
  en: {
    // Welcome Interface
    welcome_message: "Welcome to AeroWay: the alliance of intelligence and movement",
    choose_language: "Choose your language",
    continue: "Continue",
    
    // Chatbot
    chatbot_greeting: "Hello, I'm here to help you if you need assistance?",
    yes: "Yes",
    no: "No",
    type_question: "Type your question...",
    send: "Send",
    see_more: "See more",
    close: "Close",
    minimize: "Minimize",
    
    // Registration
    register_title: "Create Account",
    login_title: "Sign In",
    first_name: "First Name",
    last_name: "Last Name",
    birth_date: "Date of Birth",
    birth_place: "Place of Birth",
    city: "City",
    country: "Country",
    phone: "Phone Number",
    email: "Email",
    national_id: "National ID Number",
    password: "Password",
    confirm_password: "Confirm Password",
    accept_terms: "I accept the terms and conditions",
    create_account: "Create Account",
    account_created: "Account created successfully!",
    
    // Choice Interface
    welcome_user: "Welcome",
    passenger_or_visitor: "Are you today a passenger or visitor?",
    passenger: "Passenger",
    visitor: "Visitor",
    
    // Chatbot Questions
    q1: "How does the application work?",
    a1: "AeroWay is your intelligent airport assistant. You can track flights, navigate with 3D maps, receive notifications, and use the Meet & Greet system.",
    q2: "What can I do with this application?",
    a2: "You can: track flights in real-time, navigate the airport with 3D maps, receive personalized notifications, use voice chatbot, and share your location with loved ones.",
    
    // Error messages
    error_fill_required: "Please fill in all required fields",
    error_password_match: "Passwords do not match",
    error_email_exists: "This email already exists",
  }
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('aeroWay_language') as Language;
    if (savedLanguage && ['fr', 'ar', 'en'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('aeroWay_language', lang);
    // Set document direction for Arabic
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
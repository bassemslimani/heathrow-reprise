import React, { useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import WelcomeInterface from '@/components/WelcomeInterface';
import RegistrationInterface from '@/components/RegistrationInterface';
import UserChoiceInterface from '@/components/UserChoiceInterface';
import PassengerInterface from '@/components/PassengerInterface';
import VisitorInterface from '@/components/VisitorInterface';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FlightInformation from '@/components/FlightInformation';
import ServiceCards from '@/components/ServiceCards';
import Footer from '@/components/Footer';

type AppScreen = 'welcome' | 'registration' | 'choice' | 'passenger' | 'visitor' | 'aeroway';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleContinueFromWelcome = () => {
    setCurrentScreen('registration');
  };

  const handleRegistrationComplete = (registrationData: any) => {
    setUserData({
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      email: registrationData.email,
      phone: registrationData.phone
    });
    setCurrentScreen('choice');
  };

  const handlePassengerChoice = () => {
    setCurrentScreen('passenger');
  };

  const handleVisitorChoice = () => {
    setCurrentScreen('visitor');
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
  };

  const handleBackToChoice = () => {
    setCurrentScreen('choice');
  };

  // Show original Aero Way site for demo purposes
  if (currentScreen === 'aeroway') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <FlightInformation />
          <ServiceCards />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen">
        {currentScreen === 'welcome' && (
          <WelcomeInterface onContinue={handleContinueFromWelcome} />
        )}
        
        {currentScreen === 'registration' && (
          <RegistrationInterface 
            onBack={handleBackToWelcome}
            onRegistrationComplete={handleRegistrationComplete}
          />
        )}
        
        {currentScreen === 'choice' && userData && (
          <UserChoiceInterface
            userData={userData}
            onBack={handleBackToWelcome}
            onPassengerChoice={handlePassengerChoice}
            onVisitorChoice={handleVisitorChoice}
          />
        )}
        
        {currentScreen === 'passenger' && (
          <PassengerInterface onBack={handleBackToChoice} />
        )}
        
        {currentScreen === 'visitor' && (
          <VisitorInterface onBack={handleBackToChoice} />
        )}
      </div>
    </LanguageProvider>
  );
};

export default Index;

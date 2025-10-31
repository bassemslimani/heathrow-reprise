# Frontend Integration Guide

This guide shows how to integrate the backend API services into your existing React components.

## Quick Reference

All API services are located in `src/services/` and can be imported like this:

```typescript
import { authService, flightsService, chatbotService, servicesService } from '@/services';
```

## 1. RegistrationInterface.tsx

Replace the mock registration in `handleSubmit` function:

```typescript
// BEFORE (lines ~117-126):
try {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));

  toast({
    title: "Succès",
    description: t('account_created'),
  });

  onRegistrationComplete(formData);
}

// AFTER:
import { authService } from '@/services';

try {
  const response = await authService.register({
    nom: formData.lastName,
    prenom: formData.firstName,
    email: formData.email,
    password: formData.password,
    telephone: formData.phone,
    num_identite: formData.nationalId,
    date_naissance: formData.birthDate,
    lieu_naissance: formData.birthPlace,
    ville: formData.city,
    pays: formData.country,
    role: 'passenger', // or 'visitor' based on user selection
  });

  toast({
    title: "Succès",
    description: t('account_created'),
  });

  // User is now logged in (token saved automatically)
  onRegistrationComplete(response.user);
} catch (error: any) {
  toast({
    title: "Erreur",
    description: error.response?.data?.detail || "Registration failed",
    variant: "destructive"
  });
}
```

## 2. PassengerInterface.tsx

### A. Ticket Validation

Replace `handleManualEntry` function (lines ~98-122):

```typescript
// BEFORE:
const handleManualEntry = () => {
  if (!ticketInput) {
    toast({ title: "Erreur", description: "...", variant: "destructive" });
    return;
  }

  const mockFlightInfo: FlightInfo = {
    flightNumber: ticketInput.toUpperCase(),
    // ... mock data
  };
  setFlightInfo(mockFlightInfo);
};

// AFTER:
import { authService, flightsService } from '@/services';

const handleManualEntry = async () => {
  if (!ticketInput) {
    toast({ title: "Erreur", description: "...", variant: "destructive" });
    return;
  }

  try {
    setIsLoading(true);

    // Validate ticket with backend
    const validationResult = await authService.validateTicket(ticketInput);

    // Get flight information
    if (validationResult.data?.flight) {
      const flightData = validationResult.data.flight;
      setFlightInfo({
        flightNumber: flightData.flight_number,
        destination: flightData.destination || '',
        gate: flightData.gate || '',
        terminal: flightData.terminal || '',
        departureTime: flightData.departure_time || '',
        status: flightData.status as any,
        boardingTime: flightData.boarding_time || ''
      });

      toast({ title: "Vol trouvé", description: "..." });
    }
  } catch (error: any) {
    toast({
      title: "Erreur",
      description: error.response?.data?.detail || "Ticket validation failed",
      variant: "destructive"
    });
  } finally {
    setIsLoading(false);
  }
};
```

### B. Meet & Greet Code Generation

Replace `generateMeetGreetCode` function (lines ~124-131):

```typescript
// BEFORE:
const generateMeetGreetCode = () => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  setMeetGreetCode(code);
  toast({ title: "Code généré", description: `Code: ${code}` });
};

// AFTER:
import { servicesService } from '@/services';

const generateMeetGreetCode = async () => {
  try {
    const meetGreet = await servicesService.generateMeetGreetCode();
    setMeetGreetCode(meetGreet.tracking_code);

    toast({
      title: "Code Meet & Greet généré",
      description: `Code: ${meetGreet.tracking_code}. Partagez ce code avec votre proche.`,
    });
  } catch (error: any) {
    toast({
      title: "Erreur",
      description: error.response?.data?.detail || "Failed to generate code",
      variant: "destructive"
    });
  }
};
```

## 3. VisitorInterface.tsx

### A. Load Real Arrivals

Add this effect to load real arrival flights:

```typescript
import { flightsService, Flight } from '@/services';
import { useState, useEffect } from 'react';

const [arrivals, setArrivals] = useState<Flight[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadArrivals = async () => {
    try {
      const flights = await flightsService.searchArrivals({ limit: 20 });
      setArrivals(flights);
    } catch (error) {
      console.error('Failed to load arrivals:', error);
    } finally {
      setLoading(false);
    }
  };

  loadArrivals();
}, []);

// Update filteredFlights to use real data:
const filteredFlights = arrivals.filter(flight =>
  flight.flight_number.toLowerCase().includes(flightSearch.toLowerCase()) ||
  (flight.origin && flight.origin.toLowerCase().includes(flightSearch.toLowerCase()))
);
```

### B. Track Passenger by Code

Replace `handleTrackingCodeSubmit` function (lines ~105-128):

```typescript
// BEFORE:
const handleTrackingCodeSubmit = () => {
  if (!trackingCode) return;

  setIsTracking(true);
  toast({ title: "Suivi activé", ... });

  setTimeout(() => {
    toast({ title: "Passager localisé", ... });
  }, 3000);
};

// AFTER:
import { servicesService } from '@/services';

const handleTrackingCodeSubmit = async () => {
  if (!trackingCode) {
    toast({ title: "Erreur", description: "...", variant: "destructive" });
    return;
  }

  try {
    setLoading(true);
    const trackingInfo = await servicesService.trackPassenger(trackingCode);

    setIsTracking(true);
    setPassengerLocation(trackingInfo.current_location || 'Unknown');

    toast({
      title: "Suivi activé",
      description: `${trackingInfo.passenger_name} - ${trackingInfo.current_location}`,
    });
  } catch (error: any) {
    toast({
      title: "Erreur",
      description: error.response?.data?.detail || "Invalid tracking code",
      variant: "destructive"
    });
  } finally {
    setLoading(false);
  }
};
```

## 4. ChatBot.tsx

Replace the chatbot message handling:

```typescript
// BEFORE (lines ~140-182):
const handleSendMessage = () => {
  if (!inputText.trim()) return;

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    text: inputText,
    isBot: false,
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);

  // Mock response
  setTimeout(() => {
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: "Mock response...",
      isBot: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);
  }, 1000);

  setInputText('');
};

// AFTER:
import { chatbotService } from '@/services';
import { getUserData } from '@/services';

const [sessionId, setSessionId] = useState(() => {
  const saved = localStorage.getItem('chat_session_id');
  return saved || `session_${Date.now()}`;
});

useEffect(() => {
  localStorage.setItem('chat_session_id', sessionId);
}, [sessionId]);

const handleSendMessage = async () => {
  if (!inputText.trim()) return;

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    text: inputText,
    isBot: false,
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  setInputText('');

  try {
    const userData = getUserData();
    const response = await chatbotService.sendMessage({
      message: inputText,
      session_id: sessionId,
      user_id: userData?.id,
      language: language // 'fr', 'en', or 'ar'
    });

    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: response.message,
      isBot: true,
      timestamp: new Date(response.timestamp)
    };

    setMessages(prev => [...prev, botMessage]);
  } catch (error: any) {
    console.error('Chatbot error:', error);
    const errorMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
      isBot: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, errorMessage]);
  }
};
```

## 5. Loading States

Add loading states to your components:

```typescript
const [isLoading, setIsLoading] = useState(false);

// In JSX:
<Button
  onClick={handleSubmit}
  disabled={isLoading}
>
  {isLoading ? 'Chargement...' : 'Soumettre'}
</Button>
```

## 6. Error Handling

Use consistent error handling:

```typescript
try {
  const result = await authService.login(credentials);
  // Success handling
} catch (error: any) {
  const errorMessage = error.response?.data?.detail ||
                        error.message ||
                        'An error occurred';

  toast({
    title: "Erreur",
    description: errorMessage,
    variant: "destructive"
  });
}
```

## 7. Authentication State

Create an auth context or use the existing user data:

```typescript
import { getUserData, isAuthenticated, removeAuthToken } from '@/services';

// Check if user is logged in
const isLoggedIn = isAuthenticated();

// Get current user
const currentUser = getUserData();

// Logout
const handleLogout = () => {
  removeAuthToken();
  // Redirect to home page
  window.location.href = '/';
};
```

## 8. Type Definitions

The services already export TypeScript types:

```typescript
import type {
  User,
  Flight,
  ChatMessage,
  Service,
  MeetGreet
} from '@/services';

// Use in your component state
const [user, setUser] = useState<User | null>(null);
const [flights, setFlights] = useState<Flight[]>([]);
```

## Common Patterns

### Pattern 1: Fetch Data on Mount

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await flightsService.getAllFlights();
      setFlights(data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    }
  };

  fetchData();
}, []);
```

### Pattern 2: Form Submission

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsSubmitting(true);

  try {
    const result = await authService.register(formData);
    toast({ title: "Success", ... });
    onComplete(result);
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.response?.data?.detail,
      variant: "destructive"
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

### Pattern 3: Search with Debounce

```typescript
import { useEffect, useState } from 'react';

const [searchTerm, setSearchTerm] = useState('');
const [results, setResults] = useState([]);

useEffect(() => {
  const timer = setTimeout(async () => {
    if (searchTerm) {
      const data = await flightsService.searchArrivals({
        flight_number: searchTerm
      });
      setResults(data);
    }
  }, 500); // Debounce 500ms

  return () => clearTimeout(timer);
}, [searchTerm]);
```

## Testing the Integration

1. **Registration**: Try registering a new user
2. **Login**: Login with the registered credentials
3. **Ticket Validation**: Use flight numbers: AF1234, BA567, EK123, LH890
4. **Meet & Greet**: Generate code and track from visitor interface
5. **Chatbot**: Send messages in different languages
6. **Flights**: View flight list and search

## Debugging Tips

1. **Check Network Tab**: F12 → Network to see API calls
2. **Console Errors**: F12 → Console for error messages
3. **Backend Logs**: Check terminal running the backend
4. **Supabase Logs**: Check Supabase Dashboard → Logs

## Next Steps

- Add proper loading skeletons
- Implement retry logic for failed requests
- Add optimistic UI updates
- Cache frequently accessed data
- Add pagination for long lists

---

For more details, check the API documentation at `http://localhost:8000/docs`

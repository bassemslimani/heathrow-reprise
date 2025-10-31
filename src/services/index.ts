/**
 * Services Index
 * Centralized export for all API services
 */
export { default as authService } from './authService';
export { default as flightsService } from './flightsService';
export { default as chatbotService } from './chatbotService';
export { default as servicesService } from './servicesService';
export { default as apiClient, setAuthToken, getAuthToken, removeAuthToken, setUserData, getUserData, isAuthenticated } from './api';

// Export types
export type { RegisterData, LoginData, User, AuthResponse } from './authService';
export type { Flight, FlightSearchParams, ArrivalSearchParams } from './flightsService';
export type { ChatMessage, ChatRequest, ChatResponse } from './chatbotService';
export type { Service, Space, MeetGreet, MeetGreetUpdate } from './servicesService';

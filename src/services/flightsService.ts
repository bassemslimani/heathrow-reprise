/**
 * Flights Service
 * Handles flight information and queries
 */
import apiClient from './api';

export interface Flight {
  id: string;
  flight_number: string;
  airline: string;
  origin?: string;
  destination?: string;
  departure_time?: string;
  arrival_time?: string;
  gate?: string;
  terminal?: string;
  status: 'On Time' | 'Delayed' | 'Boarding' | 'Departed' | 'Landed' | 'Arrived' | 'Cancelled';
  boarding_time?: string;
  baggage_claim?: string;
  created_at: string;
  updated_at?: string;
}

export interface FlightSearchParams {
  status?: string;
  terminal?: string;
  limit?: number;
}

export interface ArrivalSearchParams {
  origin?: string;
  flight_number?: string;
  limit?: number;
}

class FlightsService {
  /**
   * Get all flights with optional filtering
   */
  async getAllFlights(params?: FlightSearchParams): Promise<Flight[]> {
    const response = await apiClient.get<Flight[]>('/api/flights', { params });
    return response.data;
  }

  /**
   * Get flight information by flight number
   */
  async getFlightByNumber(flightNumber: string): Promise<Flight> {
    const response = await apiClient.get<Flight>(`/api/flights/${flightNumber}`);
    return response.data;
  }

  /**
   * Get current user's flight based on their ticket number
   */
  async getUserFlight(): Promise<Flight> {
    const response = await apiClient.get<Flight>('/api/flights/user/my-flight');
    return response.data;
  }

  /**
   * Search for arrival flights
   */
  async searchArrivals(params?: ArrivalSearchParams): Promise<Flight[]> {
    const response = await apiClient.get<Flight[]>('/api/flights/arrivals/search', { params });
    return response.data;
  }

  /**
   * Get flights by terminal
   */
  async getFlightsByTerminal(terminal: string): Promise<Flight[]> {
    return this.getAllFlights({ terminal });
  }

  /**
   * Get flights by status
   */
  async getFlightsByStatus(status: string): Promise<Flight[]> {
    return this.getAllFlights({ status });
  }
}

export default new FlightsService();

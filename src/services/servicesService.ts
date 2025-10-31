/**
 * Services Service
 * Handles airport services, spaces, and meet & greet functionality
 */
import apiClient from './api';

export interface Service {
  id: string;
  name: string;
  category: 'shop' | 'restaurant' | 'cafe' | 'lounge' | 'bank' | 'pharmacy' | 'other';
  location: string;
  terminal?: string;
  description?: string;
  opening_hours?: string;
  image_url?: string;
  created_at: string;
}

export interface Space {
  id: string;
  name: string;
  category: 'gate' | 'security' | 'baggage' | 'restroom' | 'information' | 'waiting_area' | 'parking' | 'other';
  location: string;
  terminal?: string;
  description?: string;
  opening_hours?: string;
  image_url?: string;
  coordinates?: { x: number; y: number; z: number };
  created_at: string;
}

export interface MeetGreet {
  id: string;
  tracking_code: string;
  passenger_id: string;
  passenger_name: string;
  flight_id?: string;
  current_location?: string;
  status: 'active' | 'completed' | 'expired';
  created_at: string;
  expires_at?: string;
  last_updated: string;
}

export interface MeetGreetUpdate {
  current_location?: string;
  status?: 'active' | 'completed' | 'expired';
}

class ServicesService {
  // ============ Services ============

  /**
   * Get all airport services
   */
  async getAllServices(params?: { category?: string; terminal?: string; limit?: number }): Promise<Service[]> {
    const response = await apiClient.get<Service[]>('/api/services', { params });
    return response.data;
  }

  /**
   * Get services by category
   */
  async getServicesByCategory(category: string): Promise<Service[]> {
    const response = await apiClient.get<Service[]>(`/api/services/${category}`);
    return response.data;
  }

  // ============ Spaces ============

  /**
   * Get all airport spaces
   */
  async getAllSpaces(params?: { category?: string; terminal?: string; limit?: number }): Promise<Space[]> {
    const response = await apiClient.get<Space[]>('/api/spaces', { params });
    return response.data;
  }

  // ============ Meet & Greet ============

  /**
   * Generate a Meet & Greet tracking code
   */
  async generateMeetGreetCode(): Promise<MeetGreet> {
    const response = await apiClient.post<MeetGreet>('/api/meet-greet/generate');
    return response.data;
  }

  /**
   * Track a passenger by tracking code
   */
  async trackPassenger(trackingCode: string): Promise<MeetGreet> {
    const response = await apiClient.get<MeetGreet>(`/api/meet-greet/track/${trackingCode}`);
    return response.data;
  }

  /**
   * Update passenger location
   */
  async updatePassengerLocation(trackingCode: string, update: MeetGreetUpdate): Promise<MeetGreet> {
    const response = await apiClient.patch<MeetGreet>(`/api/meet-greet/${trackingCode}`, update);
    return response.data;
  }

  /**
   * Deactivate Meet & Greet tracking
   */
  async deactivateMeetGreet(trackingCode: string): Promise<void> {
    await apiClient.delete(`/api/meet-greet/${trackingCode}`);
  }
}

export default new ServicesService();

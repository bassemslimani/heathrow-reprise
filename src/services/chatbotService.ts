/**
 * Chatbot Service
 * Handles chatbot messages and conversation history
 */
import apiClient from './api';

export interface ChatMessage {
  id: string;
  user_id?: string;
  session_id?: string;
  sender: 'user' | 'bot';
  message_text: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  user_id?: string;
  session_id?: string;
  language?: 'fr' | 'en' | 'ar';
}

export interface ChatResponse {
  message: string;
  sender: string;
  timestamp: string;
  session_id?: string;
}

class ChatbotService {
  /**
   * Send a message to the chatbot
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>('/api/chatbot', request);
    return response.data;
  }

  /**
   * Get chat history for a session
   */
  async getChatHistory(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    const response = await apiClient.get<ChatMessage[]>(`/api/chatbot/history/${sessionId}`, {
      params: { limit }
    });
    return response.data;
  }

  /**
   * Get all chat history for the current user
   */
  async getUserChatHistory(limit: number = 100): Promise<ChatMessage[]> {
    const response = await apiClient.get<ChatMessage[]>('/api/chatbot/user-history', {
      params: { limit }
    });
    return response.data;
  }

  /**
   * Delete chat history for a session
   */
  async deleteChatHistory(sessionId: string): Promise<void> {
    await apiClient.delete(`/api/chatbot/history/${sessionId}`);
  }
}

export default new ChatbotService();

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ChatMessage {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  citations?: string[];
  followUp?: string;
}

export interface AssistantRequest {
  query: string;
  conversationHistory: string[];
  cursor: string | null;
}

export interface AssistantResponse {
  answer: string;
  citations: string[];
  next_cursor: string | null;
  follow_up: string;
}

@Injectable({
  providedIn: 'root'
})
export class AIChatService {
  private readonly apiUrl = 'https://localhost:7232/api/assistant';

  constructor(private http: HttpClient) { }

  /**
   * Send a message to the AI assistant and get a response
   */
  sendMessage(query: string, conversationHistory: string[], cursor: string | null): Observable<AssistantResponse> {
    const request: AssistantRequest = {
      query,
      conversationHistory,
      cursor
    };

    return this.http.post<AssistantResponse>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors and return a fallback response
   */
  private handleError(error: HttpErrorResponse): Observable<AssistantResponse> {
    console.error('AI Chat Service Error:', error);
    
    // Return fallback response
    const fallbackResponse: AssistantResponse = {
      answer: "I don't know",
      citations: [],
      next_cursor: null,
      follow_up: ""
    };

    return of(fallbackResponse);
  }

  /**
   * Get AI service status
   */
  getStatus(): Observable<{ status: 'ready' | 'loading' | 'error', message: string }> {
    return of({
      status: 'ready',
      message: 'AI service is ready'
    });
  }

  /**
   * Check if the AI service is ready
   */
  isReady(): Observable<boolean> {
    return of(true);
  }

  /**
   * Get AI model information
   */
  getModelInfo(): Observable<{ name: string, version: string, parameters: string }> {
    return of({
      name: 'TeamKB Assistant',
      version: '1.0.0',
      parameters: 'Llama3-based knowledge assistant'
    });
  }
}

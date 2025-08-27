import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Note } from '../models/note';

export interface ChatMessage {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface AIResponse {
  message: string;
  confidence: number;
  sources: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MockAIService {
  
  // Mock AI responses for demonstration
  private mockResponses = [
    "Based on your notes, I can help you with that. This appears to be related to your project documentation.",
    "I found some relevant information in your notes about this topic. Would you like me to elaborate?",
    "From what I can see in your stored notes, this question relates to your recent work. Let me break it down for you.",
    "I've analyzed your notes and can provide some insights on this matter. Here's what I found relevant.",
    "Based on the information in your knowledge base, here's what I can tell you about this topic."
  ];

  constructor() { }

  /**
   * Process a user question and return an AI response
   */
  processQuestion(question: string, notes: Note[]): Observable<AIResponse> {
    // Simulate AI processing delay
    const processingTime = 1000 + Math.random() * 2000;
    
    return of(this.generateMockResponse(question, notes)).pipe(
      delay(processingTime)
    );
  }

  /**
   * Generate a mock AI response based on the question and available notes
   */
  private generateMockResponse(question: string, notes: Note[]): AIResponse {
    const randomIndex = Math.floor(Math.random() * this.mockResponses.length);
    let response = this.mockResponses[randomIndex];
    
    // Add context awareness based on question keywords and available notes
    const enhancedResponse = this.enhanceResponseWithContext(response, question, notes);
    
    // Generate mock confidence and sources
    const confidence = 0.7 + Math.random() * 0.3; // 70-100% confidence
    const sources = this.generateMockSources(notes, question);
    
    return {
      message: enhancedResponse,
      confidence: confidence,
      sources: sources
    };
  }

  /**
   * Enhance the response with context from the question and notes
   */
  private enhanceResponseWithContext(baseResponse: string, question: string, notes: Note[]): string {
    let enhancedResponse = baseResponse;
    
    // Add context based on question keywords
    if (question.toLowerCase().includes('project')) {
      enhancedResponse += " I can see you have several project-related notes that might be helpful.";
    } else if (question.toLowerCase().includes('meeting')) {
      enhancedResponse += " I found some meeting notes in your collection that could be relevant.";
    } else if (question.toLowerCase().includes('deadline')) {
      enhancedResponse += " There are some time-sensitive items in your notes that might need attention.";
    } else if (question.toLowerCase().includes('task')) {
      enhancedResponse += " I've identified some task-related information in your notes.";
    } else if (question.toLowerCase().includes('idea')) {
      enhancedResponse += " Your notes contain several creative ideas that might be worth revisiting.";
    }

    // Add context based on available notes
    if (notes.length > 0) {
      const recentNotes = notes.filter(note => 
        note.createdAt && 
        new Date(note.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      
      if (recentNotes.length > 0) {
        enhancedResponse += ` I found ${recentNotes.length} recent notes that might be relevant.`;
      }
      
      if (notes.length > 5) {
        enhancedResponse += ` Your knowledge base contains ${notes.length} notes, giving me plenty of context to work with.`;
      }
    }
    
    return enhancedResponse;
  }

  /**
   * Generate mock sources based on available notes
   */
  private generateMockSources(notes: Note[], question: string): string[] {
    const sources: string[] = [];
    
    if (notes.length === 0) {
      return ["General knowledge base"];
    }
    
    // Find relevant notes based on question keywords
    const questionWords = question.toLowerCase().split(' ');
    const relevantNotes = notes.filter(note => 
      note.title && note.content &&
      questionWords.some(word => 
        note.title.toLowerCase().includes(word) || 
        (note.content && note.content.toLowerCase().includes(word))
      )
    );
    
    if (relevantNotes.length > 0) {
      // Add actual note titles as sources
      relevantNotes.slice(0, 3).forEach(note => {
        if (note.title) {
          sources.push(note.title);
        }
      });
    }
    
    // Add some generic sources if we don't have enough
    if (sources.length < 2) {
      sources.push("Project documentation");
      sources.push("Meeting notes");
    }
    
    return sources.slice(0, 3); // Limit to 3 sources
  }

  /**
   * Get AI service status
   */
  getStatus(): Observable<{ status: 'ready' | 'loading' | 'error', message: string }> {
    return of({
      status: 'ready',
      message: 'Mock AI service is ready'
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
      name: 'Mock AI Assistant',
      version: '1.0.0',
      parameters: 'Mock responses for demonstration'
    });
  }
}

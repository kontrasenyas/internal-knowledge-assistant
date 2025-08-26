import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Note } from '../../models/note';

interface ChatMessage {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chat',
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css'],
  standalone: false
})
export class AIChatComponent implements OnInit {
  @Input() notes: Note[] = [];
  
  questionControl = new FormControl('');
  isProcessing = false;
  chatHistory: ChatMessage[] = [];
  
  // Mock AI responses for demonstration
  private mockResponses = [
    "Based on your notes, I can help you with that. This appears to be related to your project documentation.",
    "I found some relevant information in your notes about this topic. Would you like me to elaborate?",
    "From what I can see in your stored notes, this question relates to your recent work. Let me break it down for you.",
    "I've analyzed your notes and can provide some insights on this matter. Here's what I found relevant.",
    "Based on the information in your knowledge base, here's what I can tell you about this topic."
  ];

  ngOnInit(): void {
    // Add a welcome message
    this.chatHistory.push({
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your AI assistant. I can help you find information from your notes. Ask me anything!',
      timestamp: new Date()
    });
  }

  askQuestion(): void {
    const question = this.questionControl.value?.trim();
    if (!question) return;

    // Add user question to chat
    this.chatHistory.push({
      id: Date.now(),
      type: 'user',
      content: question,
      timestamp: new Date()
    });

    this.isProcessing = true;
    this.questionControl.setValue('');

    // Simulate AI processing delay
    setTimeout(() => {
      const mockResponse = this.getMockResponse(question);
      this.chatHistory.push({
        id: Date.now() + 1,
        type: 'ai',
        content: mockResponse,
        timestamp: new Date()
      });
      this.isProcessing = false;
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  }

  private getMockResponse(question: string): string {
    // Simple logic to provide varied responses
    const randomIndex = Math.floor(Math.random() * this.mockResponses.length);
    let response = this.mockResponses[randomIndex];
    
    // Add some context awareness based on question keywords
    if (question.toLowerCase().includes('project')) {
      response += " I can see you have several project-related notes that might be helpful.";
    } else if (question.toLowerCase().includes('meeting')) {
      response += " I found some meeting notes in your collection that could be relevant.";
    } else if (question.toLowerCase().includes('deadline')) {
      response += " There are some time-sensitive items in your notes that might need attention.";
    }
    
    return response;
  }

  clearChat(): void {
    this.chatHistory = [{
      id: Date.now(),
      type: 'ai',
      content: 'Chat history cleared. How can I help you today?',
      timestamp: new Date()
    }];
  }

  get isReady(): boolean {
    return true; // Always ready since it's mock
  }

  get isLoading(): boolean {
    return this.isProcessing;
  }

  get hasError(): boolean {
    return false; // No errors in mock implementation
  }

  get errorMessage(): string {
    return '';
  }

  getStatusClass(): string {
    return 'status-ready';
  }

  getStatusText(): string {
    return 'Ready';
  }
}

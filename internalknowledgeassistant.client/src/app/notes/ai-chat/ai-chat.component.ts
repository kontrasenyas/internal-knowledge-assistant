import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Note } from '../../models/note';
import { AIChatService, ChatMessage, AssistantResponse } from '../../services/ai-chat.service';

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
  currentCursor: string | null = null;
  
  constructor(private aiChatService: AIChatService) {}

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

    // Use the AI chat service to get a response
    this.aiChatService.sendMessage(question, this.getConversationHistory(), this.currentCursor).subscribe({
      next: (response: AssistantResponse) => {
        this.chatHistory.push({
          id: Date.now() + 1,
          type: 'ai',
          content: response.answer,
          timestamp: new Date(),
          citations: response.citations,
          followUp: response.follow_up
        });
        
        // Store the next cursor for "Show More" functionality
        this.currentCursor = response.next_cursor;
        
        this.isProcessing = false;
      },
      error: (error: any) => {
        console.error('Error getting AI response:', error);
        this.chatHistory.push({
          id: Date.now() + 1,
          type: 'ai',
          content: 'Sorry, I encountered an error while processing your question. Please try again.',
          timestamp: new Date()
        });
        this.isProcessing = false;
      }
    });
  }

  clearChat(): void {
    this.chatHistory = [{
      id: Date.now(),
      type: 'ai',
      content: 'Chat history cleared. How can I help you today?',
      timestamp: new Date()
    }];
    this.currentCursor = null;
  }

  /**
   * Get conversation history as an array of strings for the API
   */
  private getConversationHistory(): string[] {
    return this.chatHistory
      .filter(message => message.type === 'user')
      .map(message => message.content);
  }

  /**
   * Request more information using the current cursor
   */
  showMore(): void {
    if (this.currentCursor) {
      this.questionControl.setValue('more');
      this.askQuestion();
    }
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

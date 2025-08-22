import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  standalone: false,
  template: `
    <div class="search-container">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search notes...</mat-label>
        <input 
          matInput 
          [(ngModel)]="searchQuery" 
          (ngModelChange)="onSearchChange()"
          placeholder="Search by title or content..."
          class="search-input"
        >
        <mat-icon matSuffix>search</mat-icon>
        <button 
          *ngIf="searchQuery" 
          matSuffix 
          mat-icon-button 
          (click)="clearSearch()"
          aria-label="Clear search"
        >
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>
    </div>
  `,
  styles: [`
    .search-container {
      margin-bottom: 20px;
      width: 100%;
    }
    
    .search-field {
      width: 100%;
      max-width: 500px;
    }
    
    .search-input {
      font-size: 16px;
    }
  `]
})
export class SearchBarComponent {
  @Output() searchChange = new EventEmitter<string>();
  
  searchQuery = '';

  onSearchChange(): void {
    this.searchChange.emit(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchChange.emit('');
  }
}

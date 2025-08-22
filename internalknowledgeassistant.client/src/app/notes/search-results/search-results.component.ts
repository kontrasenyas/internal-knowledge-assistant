import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-search-results',
  standalone: false,
  template: `
    <div *ngIf="searchQuery && totalResults !== undefined" class="search-results-info">
      <div class="results-header">
        <mat-icon>search</mat-icon>
        <span class="results-text">
          Search results for "{{ searchQuery }}"
        </span>
      </div>
      
      <div class="results-stats">
        <span class="results-count">
          {{ filteredResults }} of {{ totalResults }} notes found
        </span>
        
        <div *ngIf="searchTime" class="search-time">
          <mat-icon>schedule</mat-icon>
          <span>{{ searchTime }}ms</span>
        </div>
      </div>
      
      <div *ngIf="hasFilters" class="active-filters">
        <mat-icon>filter_list</mat-icon>
        <span>Filters applied</span>
      </div>
    </div>
  `,
  styles: [`
    .search-results-info {
      background-color: #e3f2fd;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
      border-left: 4px solid #1976d2;
    }

    .results-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .results-header mat-icon {
      color: #1976d2;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .results-text {
      font-weight: 500;
      color: #1976d2;
      font-size: 16px;
    }

    .results-stats {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 8px;
    }

    .results-count {
      color: #424242;
      font-size: 14px;
    }

    .search-time {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 12px;
    }

    .search-time mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .active-filters {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 12px;
      font-style: italic;
    }

    .active-filters mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
  `]
})
export class SearchResultsComponent {
  @Input() searchQuery: string = '';
  @Input() totalResults: number = 0;
  @Input() filteredResults: number = 0;
  @Input() searchTime?: number;
  @Input() hasFilters: boolean = false;
}

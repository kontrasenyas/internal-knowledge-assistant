import { Component, EventEmitter, Output } from '@angular/core';

export interface SearchFilters {
  query: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasContent: boolean;
  sortBy: 'title' | 'createdAt' | 'content';
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-advanced-search',
  standalone: false,
  template: `
    <mat-expansion-panel class="advanced-search-panel">
      <mat-expansion-panel-header>
        <mat-panel-title>
          <mat-icon>tune</mat-icon>
          Advanced Search
        </mat-panel-title>
      </mat-expansion-panel-header>
      
      <div class="advanced-search-content">
        <div class="search-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search query</mat-label>
            <input 
              matInput 
              [(ngModel)]="filters.query" 
              (ngModelChange)="onFiltersChange()"
              placeholder="Search by title or content..."
            >
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>

        <div class="filters-row">
          <mat-form-field appearance="outline" class="date-field">
            <mat-label>From date</mat-label>
            <input 
              matInput 
              [matDatepicker]="fromPicker"
              [(ngModel)]="filters.dateFrom"
              (ngModelChange)="onFiltersChange()"
            >
            <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
            <mat-datepicker #fromPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="date-field">
            <mat-label>To date</mat-label>
            <input 
              matInput 
              [matDatepicker]="toPicker"
              [(ngModel)]="filters.dateTo"
              (ngModelChange)="onFiltersChange()"
            >
            <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
            <mat-datepicker #toPicker></mat-datepicker>
          </mat-form-field>
        </div>

        <div class="filters-row">
          <mat-checkbox 
            [(ngModel)]="filters.hasContent"
            (ngModelChange)="onFiltersChange()"
            class="content-checkbox"
          >
            Only notes with content
          </mat-checkbox>

          <mat-form-field appearance="outline" class="sort-field">
            <mat-label>Sort by</mat-label>
            <mat-select [(ngModel)]="filters.sortBy" (ngModelChange)="onFiltersChange()">
              <mat-option value="title">Title</mat-option>
              <mat-option value="createdAt">Date Created</mat-option>
              <mat-option value="content">Content Length</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="sort-field">
            <mat-label>Sort order</mat-label>
            <mat-select [(ngModel)]="filters.sortOrder" (ngModelChange)="onFiltersChange()">
              <mat-option value="asc">Ascending</mat-option>
              <mat-option value="desc">Descending</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="actions-row">
          <button 
            mat-button 
            color="warn" 
            (click)="clearFilters()"
            class="clear-button"
          >
            <mat-icon>clear</mat-icon>
            Clear Filters
          </button>
        </div>
      </div>
    </mat-expansion-panel>
  `,
  styles: [`
    .advanced-search-panel {
      margin-bottom: 20px;
      width: 100%;
    }

    .advanced-search-content {
      padding: 16px 0;
    }

    .search-row {
      margin-bottom: 16px;
    }

    .search-field {
      width: 100%;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .date-field {
      min-width: 150px;
    }

    .sort-field {
      min-width: 120px;
    }

    .content-checkbox {
      margin-right: 16px;
    }

    .actions-row {
      display: flex;
      justify-content: flex-end;
    }

    .clear-button {
      margin-left: auto;
    }

    @media (max-width: 768px) {
      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }
      
      .date-field,
      .sort-field {
        width: 100%;
      }
    }
  `]
})
export class AdvancedSearchComponent {
  @Output() filtersChange = new EventEmitter<SearchFilters>();
  
  filters: SearchFilters = {
    query: '',
    hasContent: false,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };

  onFiltersChange(): void {
    this.filtersChange.emit({ ...this.filters });
  }

  clearFilters(): void {
    this.filters = {
      query: '',
      hasContent: false,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    this.filtersChange.emit(this.filters);
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Note } from '../models/note';
import { NoteService } from '../services/note.service';
import { NoteDialogComponent } from './note-dialog/note-dialog.component';
import { SearchFilters } from './advanced-search/advanced-search.component';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css'],
  standalone: false
})
export class NotesComponent implements OnInit, OnDestroy {
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  loading = false;
  searchQuery = '';
  currentFilters: SearchFilters = {
    query: '',
    hasContent: false,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private noteService: NoteService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.setupSearch();
    this.loadNotes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.performSearch(query);
      });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.currentFilters.query = query;
    this.searchSubject.next(query);
  }

  onAdvancedFiltersChange(filters: SearchFilters): void {
    this.currentFilters = filters;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.notes];

    // Apply text search
    if (this.currentFilters.query.trim()) {
      const searchTerm = this.currentFilters.query.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm) ||
        (note.content && note.content.toLowerCase().includes(searchTerm))
      );
    }

    // Apply date filters
    if (this.currentFilters.dateFrom) {
      filtered = filtered.filter(note => {
        if (!note.createdAt) return false;
        const noteDate = new Date(note.createdAt);
        return noteDate >= this.currentFilters.dateFrom!;
      });
    }

    if (this.currentFilters.dateTo) {
      filtered = filtered.filter(note => {
        if (!note.createdAt) return false;
        const noteDate = new Date(note.createdAt);
        return noteDate <= this.currentFilters.dateTo!;
      });
    }

    // Apply content filter
    if (this.currentFilters.hasContent) {
      filtered = filtered.filter(note => 
        note.content && note.content.trim().length > 0
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.currentFilters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt ? new Date(a.createdAt) : new Date(0);
          bValue = b.createdAt ? new Date(b.createdAt) : new Date(0);
          break;
        case 'content':
          aValue = (a.content || '').length;
          bValue = (b.content || '').length;
          break;
        default:
          aValue = a.createdAt ? new Date(a.createdAt) : new Date(0);
          bValue = b.createdAt ? new Date(b.createdAt) : new Date(0);
      }

      if (this.currentFilters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    this.filteredNotes = filtered;
  }

  private performSearch(query: string): void {
    if (!query.trim()) {
      this.applyFilters();
      return;
    }

    this.loading = true;
    this.noteService.searchNotes(query).subscribe({
      next: (results) => {
        this.filteredNotes = results;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching notes:', error);
        this.snackBar.open('Error searching notes', 'Close', { duration: 3000 });
        this.loading = false;
        // Fallback to client-side search
        this.applyFilters();
      }
    });
  }

  loadNotes(): void {
    this.loading = true;
    this.noteService.getNotes().subscribe({
      next: (notes) => {
        this.notes = notes;
        this.filteredNotes = [...notes];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notes:', error);
        this.snackBar.open('Error loading notes', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  openNoteDialog(note?: Note): void {
    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '500px',
      data: note ? { ...note } : {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.updateNote(result);
        } else {
          this.createNote(result);
        }
      }
    });
  }

  createNote(note: Note): void {
    this.noteService.createNote(note).subscribe({
      next: (newNote) => {
        this.notes.push(newNote);
        this.filteredNotes.push(newNote); // Update filtered notes
        this.snackBar.open('Note created successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error creating note:', error);
        this.snackBar.open('Error creating note', 'Close', { duration: 3000 });
      }
    });
  }

  updateNote(note: Note): void {
    this.noteService.updateNote(note.id!, note).subscribe({
      next: () => {
        const index = this.notes.findIndex(n => n.id === note.id);
        if (index !== -1) {
          this.notes[index] = note;
          this.filteredNotes[index] = note; // Update filtered notes
        }
        this.snackBar.open('Note updated successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating note:', error);
        this.snackBar.open('Error updating note', 'Close', { duration: 3000 });
      }
    });
  }

  deleteNote(id: number): void {
    if (confirm('Are you sure you want to delete this note?')) {
      this.noteService.deleteNote(id).subscribe({
        next: () => {
          this.notes = this.notes.filter(note => note.id !== id);
          this.filteredNotes = this.filteredNotes.filter(note => note.id !== id); // Update filtered notes
          this.snackBar.open('Note deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting note:', error);
          this.snackBar.open('Error deleting note', 'Close', { duration: 3000 });
        }
      });
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}

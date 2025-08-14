import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Note } from '../models/note';
import { NoteService } from '../services/note.service';
import { NoteDialogComponent } from './note-dialog/note-dialog.component';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css'],
  standalone: false
})
export class NotesComponent implements OnInit {
  notes: Note[] = [];
  loading = false;

  constructor(
    private noteService: NoteService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.loading = true;
    this.noteService.getNotes().subscribe({
      next: (notes) => {
        this.notes = notes;
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

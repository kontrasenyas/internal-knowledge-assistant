import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Note } from '../../models/note';

@Component({
  selector: 'app-note-dialog',
  templateUrl: './note-dialog.component.html',
  styleUrls: ['./note-dialog.component.css'],
  standalone: false
})
export class NoteDialogComponent implements OnInit {
  noteForm: FormGroup;
  isEditMode: boolean;
  dialogTitle: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Note
  ) {
    this.isEditMode = !!data.id;
    this.dialogTitle = this.isEditMode ? 'Edit Note' : 'Create New Note';
    
    this.noteForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', [Validators.maxLength(2000)]]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      this.noteForm.patchValue({
        title: this.data.title,
        content: this.data.content || ''
      });
    }
  }

  onSubmit(): void {
    if (this.noteForm.valid) {
      const noteData: Note = {
        ...this.noteForm.value,
        id: this.data.id
      };
      this.dialogRef.close(noteData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const field = this.noteForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.getError('maxlength').requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot exceed ${maxLength} characters`;
    }
    return '';
  }
}

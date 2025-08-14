import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly _apiUrl: string;

  constructor() {
    this._apiUrl = environment.apiUrl;
  }

  get apiUrl(): string {
    return this._apiUrl;
  }

  get notesEndpoint(): string {
    return `${this._apiUrl}/notes`;
  }

  get isProduction(): boolean {
    return environment.production;
  }
}

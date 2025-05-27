import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchFilterService {
  isLoading: boolean = false;

  constructor() { }
}

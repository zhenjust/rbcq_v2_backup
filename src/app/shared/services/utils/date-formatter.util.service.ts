import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateFormatterUtilService {
  transformDate(dateString: string): string {
    if (!dateString) {
      return '';
    }

    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      // Format as YYYY-MM-DD
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }
  
  formatToShortDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const yy = d.getFullYear().toString().slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}${mm}${dd}`;
  }

  formatBillingDate(dateString: string): string {
      const yearSuffix = dateString.substring(0, 2);
      const month = dateString.substring(2, 4);
      const day = dateString.substring(4, 6);
      const year = `20${yearSuffix}`;
      const formattedDate = `${year}-${month}-${day}`;
      return formattedDate;
  }

  formatDateTime(date: string): string {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    // const seconds = dateObj.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  formatDateOnly(date: string): string {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
}

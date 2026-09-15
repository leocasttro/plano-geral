import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iniciais',
  standalone: true
})
export class IniciaisPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value || typeof value !== 'string') return '?';
    
    const parts = value.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    
    const first = parts[0];
    const last = parts[parts.length - 1];
    return (first.charAt(0) + last.charAt(0)).toUpperCase();
  }
}

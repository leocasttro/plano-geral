import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Pipe({
  name: 'linkify',
  standalone: true
})
export class LinkifyPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string | undefined | null): SafeHtml {
    if (!text) {
      return this.sanitizer.bypassSecurityTrustHtml('Nenhuma descrição informada.');
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    let safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    let linkedText = safeText.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary
        text-decoration-underline">${url}</a>`;
    });

    linkedText = linkedText.replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(linkedText);
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.html',
  styleUrls: ['./toast-container.scss'],
})
export class ToastContainer {
  constructor(public toastService: ToastService) {}
}

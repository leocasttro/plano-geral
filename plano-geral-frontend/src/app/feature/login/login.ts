import {Component} from '@angular/core';
import {AuthService} from '../../domain/auth/auth.service';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgbModalModule} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModalModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})

export class Login {
  email = '';
  senha = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  entrar() {
    this.loading = true;
    this.error = '';

    this.authService.login({email: this.email, senha: this.senha}).subscribe({
      next: () => {
        this.router.navigate(['/planoGeral']);
      },
      error: (err) => {
        this.error = err.error.message ?? 'Erro ao fazer login';
        this.loading = false;
      },
    });
  }
}

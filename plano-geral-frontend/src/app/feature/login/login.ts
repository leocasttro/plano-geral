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

  recuperandoSenha = false;
  mensagemSucesso = '';

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

  solicitarRecuperacaoSenha(event: Event) {
    event.preventDefault();
    this.error = '';
    this.mensagemSucesso = '';

    if (!this.email) {
      this.error = 'Por favor, digite seu e-mail no campo acima para recuperar a senha.';
      return;
    }

    this.recuperandoSenha = true;
    this.authService.requestPasswordReset({ email: this.email }).subscribe({
      next: (res) => {
        this.mensagemSucesso = res.message || 'Link de cuperação enviado para o seu e-mail.';
        this.recuperandoSenha = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Erro ao solicitar recuperação de senha.';
        this.recuperandoSenha = false;
      }
    });
  }
}

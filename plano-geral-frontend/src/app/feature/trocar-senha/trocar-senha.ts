import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';
import { AuthService } from '../../domain/auth/auth.service';

@Component({
  selector: 'app-trocar-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trocar-senha.html',
  styleUrl: './trocar-senha.scss',
})
export class TrocarSenha implements OnInit {
  email = '';
  token = '';
  novaSenha = '';
  confirmacaoSenha = '';
  loading = false;
  error = '';
  success = '';

  hastoken = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      this.email = params['email'] ?? '';
      this.token = params['token'] ?? '';

      if (this.token) {
        this.hastoken = true;
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true,
        });
      } else {
        this.hastoken = false;
        this.error = '';
      }
    });
  }

  submeterFormulario() {
    if (this.hastoken) {
      this.confirmar();
    }
  }


  confirmar(): void {
    this.error = '';
    this.success = '';

    if (!this.email || !this.token) {
      this.error = 'Link de troca de senha inválido ou incompleto.';
      return;
    }

    if (!this.novaSenha || !this.confirmacaoSenha) {
      this.error = 'Informe e confirme a nova senha.';
      return;
    }

    if (this.novaSenha.length < 6) {
      this.error = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }

    if (this.novaSenha !== this.confirmacaoSenha) {
      this.error = 'As senhas não conferem.';
      return;
    }

    this.loading = true;

    this.authService
      .confirmPasswordChange({
        email: this.email,
        token: this.token,
        novaSenha: this.novaSenha,
        confirmacaoSenha: this.confirmacaoSenha,
      })
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: () => {
          this.success = 'Senha alterada com sucesso. Redirecionando para o login...';
          setTimeout(() => this.router.navigate(['/login']), 1200);
        },
        error: (err) => {
          this.error = err.error?.error ?? 'Erro ao alterar senha.';
        },
      });
  }
}

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, take } from 'rxjs';
import { CriarUsuarioDTO, UsuarioDTO } from '../../domain/usuario/usuario.model';
import { UsuarioApi } from '../../domain/usuario/usuario.api';

type AbaConfiguracao = 'usuarios' | 'perfis';

type PerfilConfig = {
  id: string;
  nome: string;
  resumo: string;
  descricao: string;
  permissoes: string[];
};

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracoes.html',
  styleUrl: './configuracoes.scss',
})
export class Configuracoes implements OnInit {
  usuarios: UsuarioDTO[] = [];
  abaAtiva: AbaConfiguracao = 'usuarios';
  loading = false;
  saving = false;
  error = '';
  success = '';

  novoUsuario: CriarUsuarioDTO = {
    nome: '',
    email: '',
    senha: '',
    perfil: 'USER',
  };

  perfisConfig: PerfilConfig[] = [
    {
      id: 'ADMIN',
      nome: 'Administrador',
      resumo: 'Acesso completo',
      descricao: 'Controle completo do sistema e das configurações.',
      permissoes: ['Criar usuários', 'Alterar perfis', 'Ver relatórios', 'Gerenciar projetos e tarefas'],
    },
    {
      id: 'MANAGER',
      nome: 'Gestor',
      resumo: 'Coordenação operacional',
      descricao: 'Acompanha operação e pode coordenar projetos e tarefas.',
      permissoes: ['Gerenciar projetos', 'Atribuir responsáveis', 'Acompanhar prazos'],
    },
    {
      id: 'USER',
      nome: 'Colaborador',
      resumo: 'Execução de tarefas',
      descricao: 'Executa tarefas e atualiza o próprio trabalho.',
      permissoes: ['Visualizar tarefas vinculadas', 'Comentar', 'Atualizar status'],
    },
    {
      id: 'VIEWER',
      nome: 'Leitor',
      resumo: 'Somente consulta',
      descricao: 'Acesso de consulta para acompanhamento.',
      permissoes: ['Visualizar informações permitidas', 'Acompanhar prazos'],
    },
  ];

  constructor(
    private usuarioApi: UsuarioApi,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.loading = true;
    this.error = '';

    this.usuarioApi
      .buscarTodosAdmin()
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (usuarios) => {
          this.usuarios = usuarios;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Erro ao carregar usuários.';
        },
      });
  }

  selecionarAba(aba: AbaConfiguracao): void {
    this.abaAtiva = aba;
  }

  criarUsuario(): void {
    this.error = '';
    this.success = '';

    if (!this.novoUsuario.nome.trim() || !this.novoUsuario.email.trim() || !this.novoUsuario.senha.trim()) {
      this.error = 'Preencha nome, email e senha.';
      return;
    }

    this.saving = true;

    this.usuarioApi
      .criar({
        nome: this.novoUsuario.nome.trim(),
        email: this.novoUsuario.email.trim(),
        senha: this.novoUsuario.senha,
        perfil: this.novoUsuario.perfil,
      })
      .pipe(
        take(1),
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (usuario) => {
          this.usuarios = [...this.usuarios, usuario].sort((a, b) => a.nome.localeCompare(b.nome));
          this.novoUsuario = { nome: '', email: '', senha: '', perfil: 'USER' };
          this.success = 'Usuário criado com sucesso.';
        },
        error: (err) => {
          console.error(err);
          this.error = err.error?.error ?? 'Erro ao criar usuário.';
        },
      });
  }

  alterarPerfil(usuario: UsuarioDTO, perfil: string): void {
    if (usuario.perfil === perfil) return;

    this.error = '';
    this.success = '';

    this.usuarioApi
      .alterarPerfil(usuario.id, perfil)
      .pipe(take(1))
      .subscribe({
        next: (atualizado) => {
          this.atualizarUsuario(atualizado);
          this.success = 'Perfil atualizado.';
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.error = err.error?.error ?? 'Erro ao alterar perfil.';
          this.cdr.detectChanges();
        },
      });
  }

  alterarStatus(usuario: UsuarioDTO): void {
    this.error = '';
    this.success = '';

    this.usuarioApi
      .alterarStatus(usuario.id, !usuario.ativo)
      .pipe(take(1))
      .subscribe({
        next: (atualizado) => {
          this.atualizarUsuario(atualizado);
          this.success = atualizado.ativo ? 'Usuário ativado.' : 'Usuário desativado.';
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.error = err.error?.error ?? 'Erro ao alterar status.';
          this.cdr.detectChanges();
        },
      });
  }

  contarPerfil(perfil: string): number {
    return this.usuarios.filter((usuario) => usuario.perfil === perfil).length;
  }

  nomePerfil(perfil?: string | null): string {
    return this.perfisConfig.find((item) => item.id === perfil)?.nome ?? 'Sem perfil';
  }

  resumoPerfil(perfil?: string | null): string {
    return this.perfisConfig.find((item) => item.id === perfil)?.resumo ?? 'Perfil não definido';
  }

  totalAtivos(): number {
    return this.usuarios.filter((usuario) => usuario.ativo).length;
  }

  private atualizarUsuario(usuario: UsuarioDTO): void {
    this.usuarios = this.usuarios.map((item) =>
      item.id === usuario.id ? usuario : item,
    );
  }
}

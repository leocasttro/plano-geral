import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjetoDTO } from '../../../domain/projeto/projetoModel';
import { TituloTarefaCatalogoDTO } from '../../../domain/titulo-tarefa/titulo-tarefa.model';
import { UsuarioDTO } from '../../../domain/usuario/usuario.model';
import { PeriodoFilterComponent } from '../periodo-filter/periodo-filter';
import { FiltrosOperacionais } from './filtros-operacionais.model';

import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-filtros-operacionais',
  standalone: true,
  imports: [CommonModule, FormsModule, PeriodoFilterComponent, NgSelectModule],
  templateUrl: './filtros-operacionais.html',
  styleUrl: './filtros-operacionais.scss',
})
export class FiltrosOperacionaisComponent implements OnChanges {
  @Input() projetos: ProjetoDTO[] = [];
  @Input() usuarios: UsuarioDTO[] = [];
  @Input() catalogos: TituloTarefaCatalogoDTO[] = [];
  @Input() filtros: FiltrosOperacionais = {};
  @Input() helperText =
    'O filtro de usuário considera o responsável da tarefa. Projeto, usuário e período funcionam de forma independente. Atividade principal e subatividade dependem do componente selecionado.';

  @Output() filtrosChange = new EventEmitter<FiltrosOperacionais>();

  projetoFiltroLabel(projeto: ProjetoDTO): string {
    return projeto.centroCusto
      ? `${projeto.nome} · CC ${projeto.centroCusto}`
      : projeto.nome;
  }

  searchProjetoFn = (term: string, item: ProjetoDTO) => {
    term = term.toLowerCase();
    const label = this.projetoFiltroLabel(item).toLowerCase();
    return label.includes(term);
  };

  componentesFiltro: string[] = [];
  atividadesPrincipaisFiltro: string[] = [];
  subatividadesFiltro: string[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['catalogos'] || changes['filtros']) {
      this.atualizarListas();
    }
  }

  private atualizarListas() {
    this.componentesFiltro = this.valoresUnicosCatalogo('componente', this.catalogos);
    
    if (!this.filtros.componente) {
      this.atividadesPrincipaisFiltro = [];
    } else {
      this.atividadesPrincipaisFiltro = this.valoresUnicosCatalogo(
        'atividadePrincipal',
        this.catalogos.filter((item) =>
          this.valorCatalogoIgual(item.componente, this.filtros.componente),
        ),
      );
    }

    if (!this.filtros.componente || !this.filtros.atividadePrincipal) {
      this.subatividadesFiltro = [];
    } else {
      this.subatividadesFiltro = this.valoresUnicosCatalogo(
        'subatividade',
        this.catalogos.filter(
          (item) =>
            this.valorCatalogoIgual(item.componente, this.filtros.componente) &&
            this.valorCatalogoIgual(item.atividadePrincipal, this.filtros.atividadePrincipal),
        ),
      );
    }
  }

  alterarProjeto(projetoId: string): void {
    this.emitir({ projetoId });
  }

  alterarUsuario(usuarioId: string): void {
    this.emitir({ usuarioId });
  }

  alterarComponente(componente: string): void {
    this.emitir({
      componente,
      atividadePrincipal: '',
      subatividade: '',
    });
  }

  alterarAtividadePrincipal(atividadePrincipal: string): void {
    this.emitir({
      atividadePrincipal,
      subatividade: '',
    });
  }

  alterarSubatividade(subatividade: string): void {
    this.emitir({ subatividade });
  }

  alterarPeriodo(periodo: { inicio: string; fim: string }): void {
    this.emitir(periodo);
  }

  limpar(): void {
    this.filtrosChange.emit({});
  }

  private emitir(parcial: FiltrosOperacionais): void {
    this.filtrosChange.emit({
      ...this.filtros,
      ...parcial,
    });
  }

  private valoresUnicosCatalogo(
    campo: keyof Pick<TituloTarefaCatalogoDTO, 'componente' | 'atividadePrincipal' | 'subatividade'>,
    catalogos: TituloTarefaCatalogoDTO[],
  ): string[] {
    return Array.from(
      new Set(
        catalogos
          .map((item) => item[campo]?.trim())
          .filter((valor): valor is string => !!valor),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }

  private valorCatalogoIgual(valor: string | null | undefined, filtro?: string): boolean {
    return (valor ?? '').trim() === (filtro ?? '').trim();
  }
}

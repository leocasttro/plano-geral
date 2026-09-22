const fs = require('fs');
const file = 'src/app/shared/components/filtros-operacionais/filtros-operacionais.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { Component, EventEmitter, Input, Output } from '@angular/core';",
  "import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';"
);

content = content.replace(
  "export class FiltrosOperacionaisComponent {",
  "export class FiltrosOperacionaisComponent implements OnChanges {"
);

const oldGetters = `  get componentesFiltro(): string[] {
    return this.valoresUnicosCatalogo('componente', this.catalogos);
  }

  get atividadesPrincipaisFiltro(): string[] {
    if (!this.filtros.componente) {
      return [];
    }

    return this.valoresUnicosCatalogo(
      'atividadePrincipal',
      this.catalogos.filter((item) =>
        this.valorCatalogoIgual(item.componente, this.filtros.componente),
      ),
    );
  }

  get subatividadesFiltro(): string[] {
    if (!this.filtros.componente || !this.filtros.atividadePrincipal) {
      return [];
    }

    return this.valoresUnicosCatalogo(
      'subatividade',
      this.catalogos.filter(
        (item) =>
          this.valorCatalogoIgual(item.componente, this.filtros.componente) &&
          this.valorCatalogoIgual(item.atividadePrincipal, this.filtros.atividadePrincipal),
      ),
    );
  }`;

const newProperties = `  componentesFiltro: string[] = [];
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
  }`;

content = content.replace(oldGetters, newProperties);

fs.writeFileSync(file, content);

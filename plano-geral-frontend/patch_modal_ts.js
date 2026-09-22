const fs = require('fs');
const file = 'src/app/shared/modals/modal-cadastro-tarefa.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/onComponenteChange\(\): void \{/, 'onComponenteChange(val: string): void {\n    this.componenteSelecionado = val ?? "";');
content = content.replace(/onAtividadePrincipalChange\(\): void \{/, 'onAtividadePrincipalChange(val: string): void {\n    this.atividadePrincipalSelecionada = val ?? "";');
content = content.replace(/onSubatividadeChange\(\): void \{/, 'onSubatividadeChange(val: string): void {\n    this.subatividadeSelecionada = val ?? "";');

fs.writeFileSync(file, content);

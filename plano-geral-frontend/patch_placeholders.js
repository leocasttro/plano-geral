const fs = require('fs');
const file = 'src/app/shared/modals/modal-cadastro-tarefa.html';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\[ngModel\]="componenteSelecionado"/g, '[ngModel]="componenteSelecionado || null"');
content = content.replace(/\[ngModel\]="atividadePrincipalSelecionada"/g, '[ngModel]="atividadePrincipalSelecionada || null"');
content = content.replace(/\[ngModel\]="subatividadeSelecionada"/g, '[ngModel]="subatividadeSelecionada || null"');
content = content.replace(/\[ngModel\]="projetoId"/g, '[ngModel]="projetoId || null"');

fs.writeFileSync(file, content);

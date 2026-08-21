# Operador Nota 1.000

Entrega digital do Projeto de Excelência Operacional da F. P. Construtora Ltda.

## Desenvolvimento

```bash
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`.

## Acesso protegido

O site usa uma única combinação de login e senha. Copie `.env.example` para `.env.local` e preencha `AUTH_LOGIN`, `AUTH_PASSWORD` e `AUTH_SECRET` (um valor longo e aleatório). Na Vercel, cadastre essas mesmas três variáveis em **Settings → Environment Variables** e faça um novo deploy.

## Atualização dos dados

1. Coloque os relatórios mensais `.xlsx` do Analisador da Máquina na pasta local `edu/outros_relatorios`.
2. Execute:

```bash
npm run import:edu
```

O importador valida os relatórios e atualiza `app/data/machine-readings.json`. A pasta `edu` permanece ignorada pelo Git; o JSON normalizado é o artefato usado no site.

Aliases, nomes revelados no pódio, vínculos de chassi e avaliações humanas ficam em `app/data/project-data.ts`. Cada janela acompanha o intervalo indicado no respectivo relatório mensal.

O consumo consolidado usa a média aritmética simples das máquinas. Ociosidade e produtividade preservam a consolidação pelas horas operadas. Os ganhos e as projeções de economia comparam a referência de maio diretamente com a última janela disponível.

## Qualidade

```bash
npm run lint
npm test
npm run build
```

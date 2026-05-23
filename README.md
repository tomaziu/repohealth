# RepoHealth

[![CI](https://github.com/tomaziu/repohealth/actions/workflows/ci.yml/badge.svg)](https://github.com/tomaziu/repohealth/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

RepoHealth é uma ferramenta para medir e melhorar a saúde de repositórios.

Ela analisa sinais que ajudam outras pessoas a usar, confiar e contribuir com um projeto: README, licença, `.gitignore`, testes, CI, templates de issue, template de pull request, política de segurança, changelog e instruções para ferramentas de IA.

O projeto tem uma CLI e uma interface gráfica local em português brasileiro.

## Por que usar

Muitos projetos bons acabam parecendo abandonados ou difíceis de usar porque o repositório não explica o básico. O RepoHealth mostra uma nota de 0 a 100, aponta o que está faltando e consegue criar arquivos iniciais sem sobrescrever nada que já existe.

Use o RepoHealth para:

- preparar um projeto antes de publicar no GitHub;
- melhorar a documentação inicial de um repositório;
- criar arquivos de comunidade com segurança;
- verificar se um repo está pronto para receber contribuidores;
- automatizar uma nota mínima de qualidade em CI.

## Funcionalidades

- Interface gráfica local com `repohealth ui`
- CLI em português brasileiro por padrão
- Suporte a inglês com `--lang en`
- Nota de saúde do repositório de 0 a 100
- Explicação clara de cada problema encontrado
- Relatório Markdown para baixar, anexar ou colar em uma IA
- Geração segura de arquivos com `repohealth fix`
- Saída JSON para automações
- Gate de nota mínima para CI com `--min-score`
- Sem dependências externas em runtime

## Instalação local

Clone o repositório:

```bash
git clone https://github.com/tomaziu/repohealth.git
cd repohealth
```

Rode a CLI:

```bash
node ./src/cli.mjs scan
```

Abra a interface gráfica:

```bash
node ./src/cli.mjs ui
```

Gere um relatório Markdown:

```bash
node ./src/cli.mjs report --output repohealth-report.md
```

## Uso rápido

Escanear o repositório atual:

```bash
node ./src/cli.mjs scan
```

Escanear outro projeto:

```bash
node ./src/cli.mjs scan "C:\caminho\para\meu-projeto"
```

Abrir a interface para outro projeto:

```bash
node ./src/cli.mjs ui "C:\caminho\para\meu-projeto"
```

Ver o que seria criado, sem alterar arquivos:

```bash
node ./src/cli.mjs fix "C:\caminho\para\meu-projeto" --dry-run
```

Criar os arquivos iniciais:

```bash
node ./src/cli.mjs fix "C:\caminho\para\meu-projeto"
```

Gerar relatório para compartilhar ou colar em uma IA:

```bash
node ./src/cli.mjs report "C:\caminho\para\meu-projeto" --output repohealth-report.md
```

## Interface gráfica

O comando abaixo inicia um servidor local e tenta abrir o navegador automaticamente:

```bash
node ./src/cli.mjs ui
```

Escolher uma porta:

```bash
node ./src/cli.mjs ui --port 4790
```

Iniciar sem abrir o navegador:

```bash
node ./src/cli.mjs ui --no-open
```

Na interface, o botão **Relatório** baixa um arquivo `.md` com a nota, prioridades, checks e um prompt pronto para pedir ajuda a uma IA.

## Comandos da CLI

```bash
repohealth scan [caminho] [--json] [--min-score <número>] [--lang pt-BR|en]
repohealth fix [caminho] [--dry-run] [--json] [--lang pt-BR|en]
repohealth report [caminho] [--output <arquivo>] [--lang pt-BR|en]
repohealth ui [caminho] [--port <número>] [--no-open] [--lang pt-BR|en]
repohealth help
repohealth version
```

Enquanto o pacote não estiver instalado globalmente, use:

```bash
node ./src/cli.mjs <comando>
```

## Exemplo de saída

```text
Nota RepoHealth: 78/100 (C)
Caminho: C:\meu-projeto

OK       README
         README.md está presente e tem informação suficiente.
FALHA    Testes
         Adicione testes ou um script de teste para aumentar a confiança nas mudanças.
AVISO    Changelog
         Adicione CHANGELOG.md quando o projeto começar a publicar versões.
```

## O que é verificado

O RepoHealth verifica:

- qualidade do README;
- licença;
- `.gitignore`;
- metadados do pacote;
- guia de contribuição;
- templates de issue;
- template de pull request;
- integração contínua;
- testes;
- política de segurança;
- exemplo de variáveis de ambiente;
- changelog;
- instruções para contribuidores com IA.

## Segurança

O comando `fix` só cria arquivos que ainda não existem. Ele não sobrescreve README, licença, templates ou qualquer outro arquivo já presente no projeto analisado.

Antes de aplicar mudanças, você pode usar:

```bash
node ./src/cli.mjs fix --dry-run
```

O comando `report` não altera o projeto analisado. Ele apenas imprime ou salva um arquivo Markdown com o diagnóstico.

## Desenvolvimento

Rodar a CLI localmente:

```bash
node ./src/cli.mjs scan
```

Abrir a UI local:

```bash
node ./src/cli.mjs ui
```

Rodar testes:

```bash
npm test
```

## Roadmap

- Mais checks por linguagem
- Geração opcional de workflow GitHub Actions
- Validação de links Markdown
- Badge de nota do repositório
- Arquivo de configuração
- Mais templates para bibliotecas, apps e projetos de documentação

## Contribuição

Contribuições são bem-vindas. Leia [CONTRIBUTING.md](CONTRIBUTING.md) antes de abrir um pull request.

## Licença

Este projeto usa a licença MIT. Veja [LICENSE](LICENSE) para detalhes.

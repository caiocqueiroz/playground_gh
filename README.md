# Experimento: Code Scanning (CodeQL) - Default Setup vs Advanced Workflow

## Objetivo

Este repositório contém um experimento para validar como o Code Scanning (CodeQL) do GitHub se comporta quando uma nova linguagem é introduzida apenas em um Pull Request, comparando:
- **Default Setup**: Configuração automática do CodeQL
- **Advanced Workflow**: Workflow personalizado do CodeQL

## Estrutura do Repositório

```
playground_gh/
├── js-vuln/          # Aplicação JavaScript vulnerável (ESTE PR)
│   ├── index.js      # App Express com vulnerabilidades intencionais
│   └── package.json  # Dependências do Node.js
├── .gitignore        # Ignora artefatos do Node.js
└── README.md         # Este arquivo
```

## Fase 1: Setup Inicial com JavaScript (ESTE PR)

### 1.1. Código JavaScript Vulnerável

O diretório `js-vuln/` contém uma aplicação Express.js com vulnerabilidades intencionais:

**Vulnerabilidades incluídas:**
- **Command Injection**: O endpoint `/ping` usa `child_process.exec()` com input do usuário não validado
- **Hardcoded Secret**: Uma chave de API está codificada diretamente no código para testar Secret Scanning

**Como executar:**
```bash
cd js-vuln
npm install
npm start
```

**Teste da vulnerabilidade:**
```bash
# Ping normal
curl "http://localhost:3000/ping?host=example.com"

# Command injection (exemplo de ataque)
curl "http://localhost:3000/ping?host=example.com;ls+-la"
```

### 1.2. Habilitar GitHub Advanced Security

**Pré-requisitos:**
- Repositório deve estar em uma organização com GitHub Advanced Security habilitado
- Ou ser um repositório público

**Passos:**

1. Acesse: `Settings` → `Code security and analysis`
2. Habilite:
   - ✅ **Dependency graph**
   - ✅ **Dependabot alerts**
   - ✅ **Dependabot security updates**
   - ✅ **Secret scanning**
   - ✅ **Code scanning** → Selecione **"Set up"** → **"Default"**

### 1.3. Configurar Code Scanning com Default Setup

**O que é Default Setup:**
- GitHub configura automaticamente o CodeQL
- Analisa linguagens detectadas no repositório
- Executa em commits para `main` e em PRs
- Sem necessidade de criar workflow YAML

**Passos para habilitar:**

1. Vá em: `Settings` → `Code security and analysis` → `Code scanning`
2. Clique em **"Set up"** → Selecione **"Default"**
3. Configure:
   - **Languages**: JavaScript/TypeScript (detectado automaticamente)
   - **Query suite**: Default
   - **Events**: Push to default branch, Pull requests

4. Clique em **"Enable CodeQL"**

### 1.4. Primeira Análise no Branch `main`

Após habilitar o Default Setup:

1. **Merge deste PR para `main`**
2. GitHub executará automaticamente a análise do CodeQL
3. Aguarde a conclusão da análise (pode levar alguns minutos)
4. Verifique os alertas:
   - Acesse: `Security` → `Code scanning`
   - Deve aparecer: **"Uncontrolled command line"** ou similar para command injection
   - Secret scanning também pode alertar sobre a chave hardcoded

**Resultado esperado:**
- ✅ JavaScript analisado no `main`
- ✅ Vulnerabilidade de command injection detectada
- ✅ Baseline estabelecido para comparação futura

## Fase 2: Teste com Nova Linguagem em PR (PRÓXIMO PR)

### 2.1. Objetivo do Teste

Validar se o **Default Setup** analisa código Python introduzido apenas em um PR (não presente em `main`).

### 2.2. Passos para o Próximo PR

**Criar um novo PR que adiciona:**

```
playground_gh/
└── py-vuln/          # Nova aplicação Python vulnerável
    ├── app.py        # Flask app com SQL injection
    └── requirements.txt
```

**Código Python vulnerável (exemplo):**

```python
# py-vuln/app.py
from flask import Flask, request
import sqlite3

app = Flask(__name__)

# VULNERABILITY: SQL Injection
@app.route('/user')
def get_user():
    user_id = request.args.get('id')
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    # SQL injection - user input directly concatenated
    query = f"SELECT * FROM users WHERE id = {user_id}"
    cursor.execute(query)
    result = cursor.fetchone()
    return str(result)

if __name__ == '__main__':
    app.run(debug=True)
```

### 2.3. Resultados Esperados

**Com Default Setup:**
- ❓ **Questão a validar**: O CodeQL analisa Python no PR antes do merge?
- 🔍 Verificar em: PR checks → "Code scanning results / CodeQL"
- **Hipótese**: Default setup pode NÃO analisar linguagem nova até que esteja em `main`

**Sem análise no PR:**
- ⚠️ Vulnerabilidade Python só será detectada APÓS merge
- 🚨 Código vulnerável pode entrar em `main` sem alerta prévio

## Fase 3: Advanced Workflow para Pré-merge Analysis (PR FUTURO)

### 3.1. Quando Usar Advanced Workflow

Se o Default Setup **não analisar** a nova linguagem (Python) no PR, adicione um Advanced Workflow.

### 3.2. Criar Workflow Customizado

**Arquivo a criar**: `.github/workflows/codeql-analysis.yml`

```yaml
name: "CodeQL Advanced"

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 0'  # Semanal

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: [ 'javascript', 'python' ]

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: ${{ matrix.language }}
        queries: security-and-quality

    - name: Autobuild
      uses: github/codeql-action/autobuild@v3

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3
      with:
        category: "/language:${{matrix.language}}"
```

### 3.3. Migrar de Default para Advanced

**Passos:**

1. Desabilite Default Setup:
   - `Settings` → `Code security and analysis` → `Code scanning` → **"Disable"**
2. Crie o arquivo `.github/workflows/codeql-analysis.yml` com conteúdo acima
3. Commit e push
4. GitHub detectará o workflow e passará a usar Advanced setup

### 3.4. Resultados Esperados com Advanced

- ✅ **JavaScript E Python** analisados em PRs
- ✅ Vulnerabilidades detectadas **antes** do merge
- ✅ Controle total sobre linguagens, queries e eventos
- ✅ Análise de código em qualquer linguagem presente no PR

## Fase 4: Comparação e Conclusões

### Critérios de Comparação

| Aspecto | Default Setup | Advanced Workflow |
|---------|---------------|-------------------|
| **Configuração** | Automática (sem YAML) | Manual (workflow YAML) |
| **Linguagens** | Auto-detectadas em `main` | Especificadas explicitamente |
| **Nova linguagem em PR** | ❓ A validar | ✅ Sim (se configurado) |
| **Flexibilidade** | Limitada | Total controle |
| **Manutenção** | GitHub gerencia | Manual |
| **Custom queries** | Não | Sim |
| **Scheduled scans** | Sim | Sim (configurável) |

### Comandos Úteis

**Verificar status do CodeQL:**
```bash
# Via GitHub CLI
gh api repos/caiocqueiroz/playground_gh/code-scanning/alerts

# Ver último workflow run
gh run list --workflow="CodeQL"
```

**Forçar nova análise:**
```bash
# Criar commit vazio para triggerar workflow
git commit --allow-empty -m "Trigger CodeQL analysis"
git push
```

## Resultados Esperados do Experimento

### Sucesso - Default Setup
- ✅ Detecta JavaScript em `main` após merge deste PR
- ❓ Analisa Python em PR (antes do merge) → **A VALIDAR**

### Sucesso - Advanced Workflow
- ✅ Detecta ambas linguagens (JS e Python)
- ✅ Analisa em PRs antes do merge
- ✅ Controle total sobre configuração

## Recursos e Documentação

- [About code scanning](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning)
- [CodeQL Default Setup](https://docs.github.com/en/code-security/code-scanning/enabling-code-scanning/configuring-default-setup-for-code-scanning)
- [CodeQL Advanced Setup](https://docs.github.com/en/code-security/code-scanning/creating-an-advanced-setup-for-code-scanning/configuring-advanced-setup-for-code-scanning)
- [Supported languages](https://codeql.github.com/docs/codeql-overview/supported-languages-and-frameworks/)

## Próximos Passos

1. ✅ **Merge deste PR** → Estabelecer baseline JavaScript
2. ⏳ **Habilitar Default Setup** → Analisar vulnerabilidades JS
3. ⏳ **Criar PR com Python** → Validar comportamento com nova linguagem
4. ⏳ **Adicionar Advanced Workflow** (se necessário) → Garantir análise pré-merge

---

**Autor**: Experimento de validação CodeQL  
**Data**: 2026  
**Repositório**: caiocqueiroz/playground_gh

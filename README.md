# playground_gh

Kio's playground - Ferramenta para análise de rate limits da API do GitHub

## Descrição

Este projeto permite analisar os rate limits da API do GitHub para um usuário específico usando um Personal Access Token (PAT). É especialmente útil quando você está usando um PAT para registrar runners a nível de enterprise e precisa acompanhar os limites de taxa desse usuário.

## Instalação

```bash
npm install
```

## Funcionalidades

### 1. CLI - Verificação via Linha de Comando

Verifique os rate limits diretamente pela linha de comando:

```bash
# Usando o token como argumento
node checkRateLimit.js <SEU_TOKEN>

# Ou usando variável de ambiente
GITHUB_TOKEN=<SEU_TOKEN> node checkRateLimit.js

# Ou usando npm script
GITHUB_TOKEN=<SEU_TOKEN> npm run check-rate-limit
```

**Exemplo de saída:**

```
=== Rate Limit do GitHub ===
Usuário: username

Core API:
  Limite: 5000
  Usado: 150 (3.00%)
  Restante: 4850
  Reset: 2026-01-14T14:30:00.000Z

Search API:
  Limite: 30
  Usado: 5 (16.67%)
  Restante: 25
  Reset: 2026-01-14T14:30:00.000Z

GraphQL API:
  Limite: 5000
  Usado: 0 (0.00%)
  Restante: 5000
  Reset: 2026-01-14T14:30:00.000Z

Integration Manifest:
  Limite: 5000
  Usado: 0 (0.00%)
  Restante: 5000
  Reset: 2026-01-14T14:30:00.000Z
```

### 2. API HTTP

Inicie o servidor HTTP:

```bash
npm start
```

Faça uma requisição para verificar os rate limits:

```bash
curl -H "Authorization: Bearer <SEU_TOKEN>" http://127.0.0.1:3000/rate-limit
```

**Resposta JSON:**

```json
{
  "usuario": "username",
  "resources": {
    "core": {
      "limit": 5000,
      "remaining": 4850,
      "reset": "2026-01-14T14:30:00.000Z",
      "used": 150,
      "percentual_usado": "3.00%"
    },
    "search": {
      "limit": 30,
      "remaining": 25,
      "reset": "2026-01-14T14:30:00.000Z",
      "used": 5,
      "percentual_usado": "16.67%"
    },
    "graphql": {
      "limit": 5000,
      "remaining": 5000,
      "reset": "2026-01-14T14:30:00.000Z",
      "used": 0,
      "percentual_usado": "0.00%"
    },
    "integration_manifest": {
      "limit": 5000,
      "remaining": 5000,
      "reset": "2026-01-14T14:30:00.000Z",
      "used": 0,
      "percentual_usado": "0.00%"
    }
  }
}
```

## Informações sobre Rate Limits

A API do GitHub possui diferentes tipos de rate limits:

- **Core API**: Operações gerais da API REST (5.000 requisições/hora para usuários autenticados)
- **Search API**: Operações de busca (30 requisições/minuto)
- **GraphQL API**: Queries GraphQL (5.000 pontos/hora)
- **Integration Manifest**: Conversão de manifestos de integração (5.000 requisições/hora)

## Como obter um Personal Access Token (PAT)

1. Acesse as configurações do GitHub: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Dê um nome descritivo ao token
4. Selecione os escopos necessários (no mínimo `read:user` para verificar rate limits)
5. Clique em "Generate token"
6. Copie o token gerado (você não poderá vê-lo novamente!)

## Contexto de Uso

Esta ferramenta é particularmente útil quando você está:

- Usando um PAT para registrar self-hosted runners a nível de enterprise
- Monitorando o consumo de API durante automações
- Precisando acompanhar quando os limites serão resetados
- Debugando problemas relacionados a rate limiting

## Segurança

⚠️ **Importante**: Nunca commite ou compartilhe seu Personal Access Token. Sempre use variáveis de ambiente ou outras formas seguras de gerenciar tokens.

## Licença

ISC


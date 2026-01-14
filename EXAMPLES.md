# Exemplos de Uso

## CLI - Linha de Comando

### Exemplo 1: Usando token como argumento
```bash
node checkRateLimit.js ghp_seu_token_aqui
```

### Exemplo 2: Usando variável de ambiente
```bash
export GITHUB_TOKEN=ghp_seu_token_aqui
node checkRateLimit.js
```

### Exemplo 3: Usando npm script
```bash
export GITHUB_TOKEN=ghp_seu_token_aqui
npm run check-rate-limit
```

## API HTTP

### Exemplo 1: Iniciar o servidor
```bash
npm start
```

### Exemplo 2: Fazer requisição com curl
```bash
curl -H "Authorization: Bearer ghp_seu_token_aqui" \
     http://127.0.0.1:3000/rate-limit
```

### Exemplo 3: Fazer requisição com wget
```bash
wget --header="Authorization: Bearer ghp_seu_token_aqui" \
     -qO- http://127.0.0.1:3000/rate-limit
```

### Exemplo 4: Fazer requisição com JavaScript (fetch)
```javascript
fetch('http://127.0.0.1:3000/rate-limit', {
  headers: {
    'Authorization': 'Bearer ghp_seu_token_aqui'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erro:', error));
```

## Casos de Uso Comuns

### Monitorar rate limits de forma periódica
```bash
#!/bin/bash
# Script para monitorar rate limits a cada 5 minutos

export GITHUB_TOKEN=ghp_seu_token_aqui

while true; do
  echo "=== $(date) ==="
  node checkRateLimit.js
  sleep 300  # 5 minutos
done
```

### Verificar rate limits antes de executar automação
```bash
#!/bin/bash
# Verifica se há rate limit disponível antes de executar uma operação

export GITHUB_TOKEN=ghp_seu_token_aqui

# Obter informações de rate limit
RATE_INFO=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
            http://127.0.0.1:3000/rate-limit)

# Extrair o número de requests restantes (requer jq)
REMAINING=$(echo $RATE_INFO | jq -r '.resources.core.remaining')

if [ "$REMAINING" -lt 100 ]; then
  echo "Alerta: Apenas $REMAINING requests restantes!"
  exit 1
else
  echo "Rate limit OK: $REMAINING requests disponíveis"
  # Executar sua automação aqui
fi
```

### Integração com GitHub Actions
```yaml
# .github/workflows/check-rate-limit.yml
name: Check Rate Limit

on:
  schedule:
    - cron: '0 */6 * * *'  # A cada 6 horas
  workflow_dispatch:

jobs:
  check-rate-limit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Check rate limit
        env:
          GITHUB_TOKEN: ${{ secrets.PAT_TOKEN }}
        run: node checkRateLimit.js
```

## Notas Importantes

1. **Segurança**: Nunca exponha seu token em logs ou repositórios públicos
2. **Permissões**: O token precisa ter pelo menos a permissão `read:user`
3. **Rate Limits**: A própria consulta de rate limit conta como uma requisição
4. **Reset Time**: O horário de reset é em UTC (ISO 8601)

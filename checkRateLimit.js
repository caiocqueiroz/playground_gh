#!/usr/bin/env node

const { checkRateLimit, displayRateLimit } = require('./rateLimit');

/**
 * Script CLI para verificar os rate limits da API do GitHub
 * Uso: node checkRateLimit.js [TOKEN]
 * 
 * Se o TOKEN não for fornecido como argumento, o script tentará usar
 * a variável de ambiente GITHUB_TOKEN
 */

async function main() {
    // Obtém o token dos argumentos da linha de comando ou da variável de ambiente
    const token = process.argv[2] || process.env.GITHUB_TOKEN;

    if (!token) {
        console.error('Erro: Token do GitHub não fornecido.');
        console.error('\nUso:');
        console.error('  node checkRateLimit.js <TOKEN>');
        console.error('  ou');
        console.error('  GITHUB_TOKEN=<TOKEN> node checkRateLimit.js');
        console.error('\nOnde <TOKEN> é seu Personal Access Token do GitHub');
        process.exit(1);
    }

    try {
        console.log('Consultando rate limits da API do GitHub...');
        const rateLimitInfo = await checkRateLimit(token);
        displayRateLimit(rateLimitInfo);
    } catch (error) {
        console.error('\nErro ao consultar rate limits:', error.message);
        process.exit(1);
    }
}

main();

const { Octokit } = require('@octokit/rest');

/**
 * Calcula o percentual de uso
 * @param {number} used - Número de requisições usadas
 * @param {number} limit - Limite total de requisições
 * @returns {string} Percentual formatado
 */
function calcularPercentualUsado(used, limit) {
    return ((used / limit) * 100).toFixed(2) + '%';
}

/**
 * Obtém informações sobre os rate limits da API do GitHub para um usuário específico
 * @param {string} token - Personal Access Token (PAT) do GitHub
 * @returns {Promise<Object>} Informações detalhadas sobre os rate limits (usuario, resources)
 */
async function checkRateLimit(token) {
    if (!token) {
        throw new Error('Token de autenticação é obrigatório');
    }

    try {
        const octokit = new Octokit({
            auth: token
        });

        // Obtém informações do rate limit
        const { data } = await octokit.rest.rateLimit.get();

        // Obtém informações do usuário autenticado
        const { data: user } = await octokit.rest.users.getAuthenticated();

        return {
            usuario: user.login,
            resources: {
                core: {
                    limit: data.resources.core.limit,
                    remaining: data.resources.core.remaining,
                    reset: new Date(data.resources.core.reset * 1000).toISOString(),
                    used: data.resources.core.used,
                    percentual_usado: calcularPercentualUsado(data.resources.core.used, data.resources.core.limit)
                },
                search: {
                    limit: data.resources.search.limit,
                    remaining: data.resources.search.remaining,
                    reset: new Date(data.resources.search.reset * 1000).toISOString(),
                    used: data.resources.search.used,
                    percentual_usado: calcularPercentualUsado(data.resources.search.used, data.resources.search.limit)
                },
                graphql: {
                    limit: data.resources.graphql.limit,
                    remaining: data.resources.graphql.remaining,
                    reset: new Date(data.resources.graphql.reset * 1000).toISOString(),
                    used: data.resources.graphql.used,
                    percentual_usado: calcularPercentualUsado(data.resources.graphql.used, data.resources.graphql.limit)
                },
                integration_manifest: {
                    limit: data.resources.integration_manifest.limit,
                    remaining: data.resources.integration_manifest.remaining,
                    reset: new Date(data.resources.integration_manifest.reset * 1000).toISOString(),
                    used: data.resources.integration_manifest.used,
                    percentual_usado: calcularPercentualUsado(data.resources.integration_manifest.used, data.resources.integration_manifest.limit)
                }
            }
        };
    } catch (error) {
        if (error.status === 401) {
            throw new Error('Token inválido ou sem permissões adequadas');
        }
        throw error;
    }
}

/**
 * Exibe as informações de rate limit de forma formatada
 * @param {Object} rateLimitInfo - Informações do rate limit retornadas por checkRateLimit
 */
function displayRateLimit(rateLimitInfo) {
    console.log('\n=== Rate Limit do GitHub ===');
    console.log(`Usuário: ${rateLimitInfo.usuario}\n`);

    console.log('Core API:');
    console.log(`  Limite: ${rateLimitInfo.resources.core.limit}`);
    console.log(`  Usado: ${rateLimitInfo.resources.core.used} (${rateLimitInfo.resources.core.percentual_usado})`);
    console.log(`  Restante: ${rateLimitInfo.resources.core.remaining}`);
    console.log(`  Reset: ${rateLimitInfo.resources.core.reset}\n`);

    console.log('Search API:');
    console.log(`  Limite: ${rateLimitInfo.resources.search.limit}`);
    console.log(`  Usado: ${rateLimitInfo.resources.search.used} (${rateLimitInfo.resources.search.percentual_usado})`);
    console.log(`  Restante: ${rateLimitInfo.resources.search.remaining}`);
    console.log(`  Reset: ${rateLimitInfo.resources.search.reset}\n`);

    console.log('GraphQL API:');
    console.log(`  Limite: ${rateLimitInfo.resources.graphql.limit}`);
    console.log(`  Usado: ${rateLimitInfo.resources.graphql.used} (${rateLimitInfo.resources.graphql.percentual_usado})`);
    console.log(`  Restante: ${rateLimitInfo.resources.graphql.remaining}`);
    console.log(`  Reset: ${rateLimitInfo.resources.graphql.reset}\n`);

    console.log('Integration Manifest:');
    console.log(`  Limite: ${rateLimitInfo.resources.integration_manifest.limit}`);
    console.log(`  Usado: ${rateLimitInfo.resources.integration_manifest.used} (${rateLimitInfo.resources.integration_manifest.percentual_usado})`);
    console.log(`  Restante: ${rateLimitInfo.resources.integration_manifest.remaining}`);
    console.log(`  Reset: ${rateLimitInfo.resources.integration_manifest.reset}\n`);
}

module.exports = {
    checkRateLimit,
    displayRateLimit
};

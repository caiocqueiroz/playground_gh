const http = require('http');
const url = require('url');
const { checkRateLimit } = require('./rateLimit');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    // Endpoint para verificar rate limit
    if (parsedUrl.pathname === '/rate-limit') {
        // Obtém o token do header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
                error: 'Token de autenticação não fornecido. Use o header Authorization: Bearer <TOKEN>' 
            }));
            return;
        }
        
        const token = authHeader.substring(7); // Remove 'Bearer '
        
        try {
            const rateLimitInfo = await checkRateLimit(token);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(rateLimitInfo, null, 2));
        } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }
    
    // Endpoint padrão
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, World!\n\nEndpoints disponíveis:\n- GET /rate-limit (requer Authorization: Bearer <TOKEN>)\n');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    console.log(`\nPara verificar rate limits, faça uma requisição para:`);
    console.log(`curl -H "Authorization: Bearer <TOKEN>" http://${hostname}:${port}/rate-limit`);
});


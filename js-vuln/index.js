const express = require('express');
const { exec } = require('child_process');

const app = express();
const port = 3000;

// Hardcoded secret for Secret Scanning test
const API_SECRET_KEY = 'ghp_1234567890abcdefghijklmnopqrstuvwxyzAB';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Vulnerable endpoint: Command injection via unvalidated user input
app.get('/ping', (req, res) => {
    const host = req.query.host;
    
    if (!host) {
        return res.status(400).send('Please provide a host parameter');
    }
    
    // VULNERABILITY: Command injection - user input directly passed to exec
    // An attacker could send: /ping?host=example.com;ls+-la
    exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).send(`Error: ${error.message}`);
        }
        if (stderr) {
            return res.status(500).send(`stderr: ${stderr}`);
        }
        res.send(`<pre>${stdout}</pre>`);
    });
});

app.get('/', (req, res) => {
    res.send('Welcome to the vulnerable ping service. Try /ping?host=example.com');
});

app.listen(port, () => {
    console.log(`Vulnerable app listening at http://localhost:${port}`);
    console.log(`Using API key: ${API_SECRET_KEY}`);
});

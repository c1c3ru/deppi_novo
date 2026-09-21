#!/usr/bin/env node
/**
 * Script de configuração única (rodar localmente, uma vez) para obter o
 * refresh token da conta deppi.maracanau@ifce.edu.br para o Google Calendar.
 *
 * Não depende de nenhum pacote do projeto (nem googleapis, nem ts-node) —
 * só módulos nativos do Node. Roda leve em qualquer máquina, sem precisar
 * de "npm install" antes.
 *
 * Como usar:
 *   1. No Google Cloud Console, no OAuth Client (Web application) usado,
 *      adicione "http://localhost:8085/oauth2callback" em
 *      "Authorized redirect URIs".
 *   2. GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy node backend/scripts/get-google-refresh-token.js
 *      (rode isso na SUA máquina, não no servidor — precisa abrir um
 *      navegador e receber o redirect de volta em localhost)
 *   3. Abra a URL impressa no terminal, faça login com
 *      deppi.maracanau@ifce.edu.br e aceite a permissão.
 *   4. O terminal vai imprimir o refresh_token — copie para a variável de
 *      ambiente GOOGLE_REFRESH_TOKEN (.env / secrets do deploy).
 */
const http = require('http');
const https = require('https');
const { URL, URLSearchParams } = require('url');

const REDIRECT_URI = 'http://localhost:8085/oauth2callback';
const PORT = 8085;
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.events.freebusy',
];

function exchangeCodeForTokens(clientId, clientSecret, code) {
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  }).toString();

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode !== 200) {
              reject(new Error(`Google respondeu ${res.statusCode}: ${data}`));
            } else {
              resolve(parsed);
            }
          } catch (error) {
            reject(error);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function main() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      'Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET antes de rodar este script.'
    );
    process.exit(1);
  }

  const authUrl =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent', // força reenvio do refresh_token mesmo se já autorizado antes
      scope: SCOPES.join(' '),
    }).toString();

  console.log('\nAbra esta URL no navegador (logado com a conta do DEPPI):\n');
  console.log(authUrl);
  console.log('\nAguardando autorização...\n');

  const server = http.createServer(async (req, res) => {
    if (!req.url) return;

    const url = new URL(req.url, REDIRECT_URI);
    const code = url.searchParams.get('code');

    if (url.pathname !== '/oauth2callback' || !code) {
      res.writeHead(404);
      res.end();
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h2>Autorizado! Pode fechar esta aba e voltar ao terminal.</h2>');

    try {
      const tokens = await exchangeCodeForTokens(clientId, clientSecret, code);
      console.log('\nRefresh token obtido com sucesso:\n');
      console.log(tokens.refresh_token);
      console.log(
        '\nAdicione isso como GOOGLE_REFRESH_TOKEN nas variáveis de ambiente do backend.\n'
      );
    } catch (error) {
      console.error('Erro ao trocar o código por tokens:', error);
    } finally {
      server.close();
      process.exit(0);
    }
  });

  server.listen(PORT);
}

main();

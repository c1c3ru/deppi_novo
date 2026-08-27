/**
 * Script de configuração única (rodar localmente, uma vez) para obter o
 * refresh token da conta deppi.maracanau@ifce.edu.br para o Google Calendar.
 *
 * Como usar:
 *   1. No Google Cloud Console, no OAuth Client (Web application) usado,
 *      adicione "http://localhost:8085/oauth2callback" em
 *      "Authorized redirect URIs".
 *   2. cd backend
 *   3. GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy npx ts-node scripts/get-google-refresh-token.ts
 *   4. Abra a URL impressa no terminal, faça login com
 *      deppi.maracanau@ifce.edu.br e aceite a permissão.
 *   5. O terminal vai imprimir o refresh_token — copie para a variável de
 *      ambiente GOOGLE_REFRESH_TOKEN (.env / secrets do deploy).
 */
import { google } from 'googleapis';
import * as http from 'http';
import { URL } from 'url';

const REDIRECT_URI = 'http://localhost:8085/oauth2callback';
const PORT = 8085;

async function main() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      'Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET antes de rodar este script.'
    );
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // força reenvio do refresh_token mesmo se já autorizado antes
    scope: ['https://www.googleapis.com/auth/calendar.events'],
  });

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
    res.end(
      '<h2>Autorizado! Pode fechar esta aba e voltar ao terminal.</h2>'
    );

    try {
      const { tokens } = await oauth2Client.getToken(code);
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

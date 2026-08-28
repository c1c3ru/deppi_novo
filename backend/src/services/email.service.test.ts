const sendMail = jest.fn().mockResolvedValue(undefined);
const verify = jest.fn((callback: (error: Error | null) => void) => callback(null));

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(() => ({
      sendMail,
      verify,
    })),
  },
}));

const OFFICIAL_EMAIL = 'conhecaifce@maracanau.ifce.edu.br';

function loadEmailService(): typeof import('./email.service') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('./email.service');
}

describe('EmailService — remetente e destinatário oficiais do DEPPI', () => {
  beforeEach(() => {
    jest.resetModules();
    sendMail.mockClear();
    delete process.env.EMAIL_FROM;
    delete process.env.EMAIL_CONTACT_TO;
  });

  it('usa o novo e-mail institucional como remetente ao enviar e-mail de contato', async () => {
    const { emailService } = loadEmailService();

    await emailService.sendContactEmail({
      name: 'Fulano',
      email: 'visitante@escola.edu.br',
      subject: 'Dúvida',
      message: 'Olá',
    });

    expect(sendMail).toHaveBeenCalledTimes(1);
    const payload = sendMail.mock.calls[0][0];
    expect(payload.from).toContain(OFFICIAL_EMAIL);
    expect(payload.to).toBe(OFFICIAL_EMAIL);
  });

  it('não referencia mais o e-mail antigo do DEPPI em nenhum payload disparado', async () => {
    const { emailService } = loadEmailService();

    await emailService.sendVisitPendingEmail(
      'escola@exemplo.edu.br',
      'Escola Exemplo',
      '2026-09-01'
    );
    await emailService.sendVisitConfirmationEmail(
      'escola@exemplo.edu.br',
      'Escola Exemplo',
      '2026-09-01',
      ['Lab A']
    );
    await emailService.sendPasswordEmail(
      'usuario@exemplo.edu.br',
      'Usuário',
      'senha123'
    );

    for (const call of sendMail.mock.calls) {
      const payload = call[0];
      expect(JSON.stringify(payload)).not.toContain('deppi.maracanau@ifce.edu.br');
      expect(payload.from).toContain(OFFICIAL_EMAIL);
    }
  });

  it('respeita EMAIL_CONTACT_TO quando definido via variável de ambiente', async () => {
    process.env.EMAIL_CONTACT_TO = 'outro-endereco@maracanau.ifce.edu.br';
    const { emailService } = loadEmailService();

    await emailService.sendContactEmail({
      name: 'Fulano',
      email: 'visitante@escola.edu.br',
      subject: 'Dúvida',
      message: 'Olá',
    });

    const payload = sendMail.mock.calls[0][0];
    expect(payload.to).toBe('outro-endereco@maracanau.ifce.edu.br');
  });
});

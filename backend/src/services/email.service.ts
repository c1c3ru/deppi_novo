import nodemailer from 'nodemailer';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });

    // Verify connection configuration
    this.transporter.verify((error) => {
      if (error) {
        logger.error('Error configuring email service:', error);
      } else {
        logger.info('Email service is ready to send messages');
      }
    });
  }

  public async sendContactEmail(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    try {
      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.from}>`,
        to: 'deppi.maracanau@ifce.edu.br', // The destination requested by the user
        replyTo: data.email,
        subject: `[Contato Site] ${data.subject}`,
        html: `
          <h3>Nova Mensagem de Contato do Site DEPPI</h3>
          <p><strong>Nome:</strong> ${data.name}</p>
          <p><strong>E-mail:</strong> ${data.email}</p>
          <p><strong>Assunto:</strong> ${data.subject}</p>
          <hr>
          <p><strong>Mensagem:</strong></p>
          <p>${data.message.replace(/\n/g, '<br>')}</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(
        `Contact email sent from ${data.email} to deppi.maracanau@ifce.edu.br`
      );
    } catch (error) {
      logger.error('Error sending contact email:', error);
      throw new Error('Falha ao enviar e-mail de contato');
    }
  }

  public async sendPasswordEmail(
    to: string,
    name: string,
    password: string
  ): Promise<void> {
    try {
      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.from}>`,
        to: to,
        subject: 'Sua Senha de Acesso - Central de Boletins DEPPI',
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
            <h2 style="color: #2f8132; text-align: center;">Portal DEPPI - IFCE Maracanaú</h2>
            <p>Olá, <strong>${name}</strong>!</p>
            <p>Conforme solicitado, uma senha de acesso temporária foi gerada para o seu perfil (SIAPE).</p>
            <div style="background: #f4f4f4; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
              <span style="font-size: 0.85rem; color: #666; display: block; margin-bottom: 5px;">Sua senha de acesso:</span>
              <strong style="font-size: 1.5rem; letter-spacing: 2px;">${password}</strong>
            </div>
            <p>Para sua segurança, após realizar o primeiro login, você poderá alterar sua senha no painel administrativo.</p>
            <p>Acesse o portal em: <a href="http://localhost:4200/login" style="color: #2f8132;">Acessar Portal de Boletins</a></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 0.8rem; color: #999; text-align: center;">Este é um e-mail automático, por favor não responda.</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Password email sent successfully to ${to}`);
    } catch (error) {
      logger.error('Error sending password email:', error);
      throw new Error('Falha ao enviar e-mail com a senha');
    }
  }
}

export const emailService = new EmailService();

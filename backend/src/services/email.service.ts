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

    public async sendContactEmail(data: { name: string; email: string; subject: string; message: string }): Promise<void> {
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
            logger.info(`Contact email sent from ${data.email} to deppi.maracanau@ifce.edu.br`);
        } catch (error) {
            logger.error('Error sending contact email:', error);
            throw new Error('Falha ao enviar e-mail de contato');
        }
    }
}

export const emailService = new EmailService();

import nodemailer from 'nodemailer';

export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT ?? 587),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendPasswordChangeConfirmation(to: string, nome: string, link: string) {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
      to,
      subject: 'Defina sua senha - Prosul',
      html: `
        <p>Olá, ${nome}.</p>
        <p>Seu acesso ao sistema Prosul foi criado.</p>
        <p>Clique no link abaixo para definir sua senha:</p>
        <p><a href="${link}">Definir senha</a></p>
        <p>Esse link expira em 30 minutos.</p>
      `,
    });
  }
}

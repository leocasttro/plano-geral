import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { LoginUser } from '../../../application/use-cases/auth/LoginUser';
import { authConfig } from '../../config/auth';
import { ConfirmPasswordChange } from '../../../application/use-cases/auth/ConfirmPasswordChange';
import { resetLoginRateLimit } from '../middlewares/loginRateLimiter';
import { RequestPasswordReset } from '../../../application/use-cases/auth/RequestPasswordReset';

type Deps = {
  loginUser: LoginUser;
  confirmPasswordChange: ConfirmPasswordChange;
  requestPasswordReset: RequestPasswordReset;
};

export class AuthController {
  constructor(private deps: Deps) {}

  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      const user = await this.deps.loginUser.execute({ email, senha });
      resetLoginRateLimit(req);

      const token = jwt.sign(
        {
          sub: user.id,
          nome: user.nome,
          perfil: user.perfil,
        },
        authConfig.jwtSecret,
        { expiresIn: authConfig.jwtExpiresIn }
      );

      return res.json({
        token,
        user: user.toJSON(),
      });
    } catch {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
  }

  async confirmPasswordChange(req: Request, res: Response) {
    try {
      await this.deps.confirmPasswordChange.execute(req.body);
      return res.json({ message: 'Senha alterada com sucesso' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'E-mail é obrigatório' });
      }

      await this.deps.requestPasswordReset.execute(email);

      return res.json({ message: 'E-mail enviado para redefinir a senha.' });
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
    }
  }
}

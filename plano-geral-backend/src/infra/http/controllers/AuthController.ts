import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { LoginUser } from '../../../application/use-cases/auth/LoginUser';
import { authConfig } from '../../config/auth';
import { ConfirmPasswordChange } from '../../../application/use-cases/auth/ConfirmPasswordChange';

type Deps = {
  loginUser: LoginUser;
  confirmPasswordChange: ConfirmPasswordChange;
};

export class AuthController {
  constructor(private deps: Deps) {}

  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      const user = await this.deps.loginUser.execute({ email, senha });

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
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
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
}

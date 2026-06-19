import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { LoginUser } from '../../../application/use-cases/auth/LoginUser';
import { authConfig } from '../../config/auth';

type Deps = {
  loginUser: LoginUser;
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
}

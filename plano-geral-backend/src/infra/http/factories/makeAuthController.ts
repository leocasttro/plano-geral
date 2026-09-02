import {UserTypeORMRepository} from '../../database/typeorm/entities/repositories/UserTypeORMRepository';
import {AuthController} from '../controllers/AuthController';
import {LoginUser} from '../../../application/use-cases/auth/LoginUser';
import { ConfirmPasswordChange } from '../../../application/use-cases/auth/ConfirmPasswordChange';
import { RequestPasswordReset } from '../../../application/use-cases/auth/RequestPasswordReset';
import { MailService } from '../../../application/services/MailService';

export function makeAuthController() {
  const userRepo = new UserTypeORMRepository();
  const mailService = new MailService;

  return new AuthController({
    loginUser: new LoginUser(userRepo),
    confirmPasswordChange: new ConfirmPasswordChange(userRepo),
    requestPasswordReset: new RequestPasswordReset(userRepo, mailService),
  });
}

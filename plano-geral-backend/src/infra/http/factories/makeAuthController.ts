import {UserTypeORMRepository} from '../../database/typeorm/entities/repositories/UserTypeORMRepository';
import {AuthController} from '../controllers/AuthController';
import {LoginUser} from '../../../application/use-cases/auth/LoginUser';
import { ConfirmPasswordChange } from '../../../application/use-cases/auth/ConfirmPasswordChange';

export function makeAuthController() {
  const userRepo = new UserTypeORMRepository();

  return new AuthController({
    loginUser: new LoginUser(userRepo),
    confirmPasswordChange: new ConfirmPasswordChange(userRepo),
  });
}

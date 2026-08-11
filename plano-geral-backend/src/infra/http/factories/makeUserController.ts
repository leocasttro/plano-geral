import { CreateUser } from "../../../application/use-cases/usuario/CreateUser";
import { GetAllUsers } from "../../../application/use-cases/usuario/GetAllUsers";
import { AlterarPerfilUsuario } from "../../../application/use-cases/usuario/AlterarPerfilUsuario";
import { AlterarStatusUsuario } from "../../../application/use-cases/usuario/AlterarStatusUsuario";
import { GetAllUsersAdmin } from "../../../application/use-cases/usuario/GetAllUsersAdmin";
import { DeleteUser } from "../../../application/use-cases/usuario/DeleteUser";
import { UserTypeORMRepository } from "../../database/typeorm/entities/repositories/UserTypeORMRepository";
import { UsersController } from "../controllers/UsersController";
import { MailService } from "../../../application/services/MailService";

export function makeUserController() {
  const repo = new UserTypeORMRepository();
  const mailService = new MailService();

  return new UsersController({
    createUser: new CreateUser(repo, mailService),
    getAllUsers: new GetAllUsers(repo),
    getAllUsersAdmin: new GetAllUsersAdmin(repo),
    alterarPerfilUsuario: new AlterarPerfilUsuario(repo),
    alterarStatusUsuario: new AlterarStatusUsuario(repo),
    deleteUser: new DeleteUser(repo),
  })
}

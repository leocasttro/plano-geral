import { CreateUser } from "../../../application/use-cases/usuario/CreateUser";
import { GetAllUsers } from "../../../application/use-cases/usuario/GetAllUsers";
import { AlterarPerfilUsuario } from "../../../application/use-cases/usuario/AlterarPerfilUsuario";
import { AlterarStatusUsuario } from "../../../application/use-cases/usuario/AlterarStatusUsuario";
import { GetAllUsersAdmin } from "../../../application/use-cases/usuario/GetAllUsersAdmin";
import { UserTypeORMRepository } from "../../database/typeorm/entities/repositories/UserTypeORMRepository";
import { UsersController } from "../controllers/UsersController";

export function makeUserController() {
  const repo = new UserTypeORMRepository();

  return new UsersController({
    createUser: new CreateUser(repo),
    getAllUsers: new GetAllUsers(repo),
    getAllUsersAdmin: new GetAllUsersAdmin(repo),
    alterarPerfilUsuario: new AlterarPerfilUsuario(repo),
    alterarStatusUsuario: new AlterarStatusUsuario(repo),
  })
}

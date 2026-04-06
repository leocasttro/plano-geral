import { CreateUser } from "../../../application/use-cases/usuario/CreateUser";
import { GetAllUsers } from "../../../application/use-cases/usuario/GetAllUsers";
import { UserTypeORMRepository } from "../../database/typeorm/entities/repositories/UserTypeORMRepository";
import { UsersController } from "../controllers/UsersController";

export function makeUserController() {
  const repo = new UserTypeORMRepository();

  return new UsersController({
    createUser: new CreateUser(repo),
    getAllUsers: new GetAllUsers(repo),
  })
}

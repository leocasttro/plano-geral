import { Request, Response } from 'express';
import { CreateUser } from '../../../application/use-cases/usuario/CreateUser';
import { GetAllUsers } from '../../../application/use-cases/usuario/GetAllUsers';


type Deps = {
  createUser: CreateUser,
  getAllUsers: GetAllUsers,
};

export class UsersController {
  constructor(private deps: Deps) {}

  async create(req: Request, res: Response) {
    try {
      const user = await this.deps.createUser.execute(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const users = await this.deps.getAllUsers.execute();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // async findById(req: Request, res: Response) {
  //   try {
  //     const user = await this.getUserById.execute(req.params.id);
  //     res.json(user);
  //   } catch (error: any) {
  //     res.status(404).json({ error: error.message });
  //   }
  // }
}

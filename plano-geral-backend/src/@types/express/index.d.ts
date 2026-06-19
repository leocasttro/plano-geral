declare namespace Express {
  export interface Request {
    user: {
      id: string;
      nome: string;
      perfil: string;
    };
  }
}

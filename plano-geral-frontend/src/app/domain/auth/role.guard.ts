import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { ToastService } from "../../shared/toast/toast.service";

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  const rolesPermitidas = route.data['roles'] as Array<string>;

  if (!rolesPermitidas || rolesPermitidas.length === 0) {
    return true;
  }

  const usuario = authService.usuario();

  if (usuario && usuario.perfil && rolesPermitidas.includes(usuario.perfil)) {
    return true;
  }

  toastService.warning('Você não tem permissão para acessar esta tela.', 'Acesso Restrito');
  return router.createUrlTree(['/planoGeral']);
}

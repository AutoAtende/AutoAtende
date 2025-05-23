import React, { useContext, Suspense, useEffect } from "react";
import { Route as RouterRoute, Redirect, useLocation } from "react-router-dom";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { AutoAtendeLoading } from "../components/Loading/AutoAtendeLoading";
import { usePublicSettings } from "../context/PublicSettingsContext";

const CustomRoute = ({ component: Component, isPrivate = false, componentProps = {}, ...rest}) => {
  const { isAuth, loading, user } = useContext(AuthContext);
  const { loadPublicSettings } = usePublicSettings();
  const location = useLocation();

  // Efeito para carregar configurações públicas em rotas públicas
  useEffect(() => {
    // Se for uma rota pública, garantir que as configurações públicas estejam carregadas
    if (!isPrivate) {
      // Carregar configurações públicas (não força atualização para aproveitar o cache)
      loadPublicSettings();
    }
  }, [isPrivate, loadPublicSettings, location.pathname]);

  if (loading) {
    return <BackdropLoading />;
  }
// IMPORTANTE: Verificação prioritária para rotas de landing page (/l/)
  // Isto deve ser verificado primeiro, antes de qualquer outra lógica de redirecionamento
  const currentPath = location.pathname || rest.path;
  if (currentPath && currentPath.startsWith('/l/')) {
    console.log("Rota pública de landing page detectada:", currentPath);
    return (
      <Suspense fallback={<AutoAtendeLoading />}>
        <RouterRoute
          {...rest}
          render={props => <Component {...props} {...componentProps} />}
        />
      </Suspense>
    );
  }

  // Para outras rotas, continue com a lógica normal de autenticação
  const getRedirectPath = () => {
    // Verificação de segurança para o objeto location
    if (!location) {
      console.warn("Location object is undefined in CustomRoute");
      return isPrivate && !isAuth ? "/login" : null;
    }

    const { pathname } = location;

    // Se não estiver autenticado e a rota for privada, vai para login
    if (!isAuth && isPrivate) {
      console.log("Redirecionando para login: usuário não autenticado em rota privada");
      return "/login";
    }

    // Se estiver autenticado e tentar acessar login/signup/home
    if (isAuth && !isPrivate && ["/login", "/signup"].includes(pathname)) {
      // Redireciona baseado no perfil do usuário
      if (user?.profile === "admin") {
        console.log("Redirecionando usuário admin para dashboard");
        return "/dashboard";
      }
      console.log("Redirecionando usuário para tickets");
      return "/tickets";
    }

    return null;
  };

  const redirectPath = getRedirectPath();

  if (redirectPath) {
    return (
      <Redirect
        to={{
          pathname: redirectPath,
          state: { from: location }
        }}
      />
    );
  }

  return (
    <Suspense fallback={<AutoAtendeLoading />}>
      <RouterRoute
        {...rest}
        render={props => <Component {...props} {...componentProps} />}
      />
    </Suspense>
  );
};

export default CustomRoute;
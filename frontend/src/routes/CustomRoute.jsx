import React, { useContext, useEffect } from "react";
import { Route as RouterRoute, Redirect } from "react-router-dom";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { AutoAtendeLoading } from "../components/Loading/AutoAtendeLoading";
import { usePublicSettings } from "../context/PublicSettingsContext";

const CustomRoute = ({ component: Component, isPrivate = false, ...rest }) => {
  const { isAuth, loading, user } = useContext(AuthContext);
  const { loadPublicSettings } = usePublicSettings();

  // Efeito para carregar configurações públicas em rotas públicas
  useEffect(() => {
    // Se for uma rota pública, garantir que as configurações públicas estejam carregadas
    if (!isPrivate) {
      // Carregar configurações públicas (não força atualização para aproveitar o cache)
      loadPublicSettings();
    }
  }, [isPrivate, loadPublicSettings, rest.location.pathname]);

  if (loading) {
    return <BackdropLoading />;
  }

  const getRedirectPath = () => {
    // Se não estiver autenticado e a rota for privada, vai para home
    if (!isAuth && isPrivate) {
      return "/login";
    }

    // Se estiver autenticado e tentar acessar login/signup/home
    if (isAuth && !isPrivate && ["/home", "/login", "/signup"].includes(rest.location.pathname)) {
      // Redireciona baseado no perfil do usuário
      if (user?.profile === "admin") {
        return "/dashboard";
      }
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
          state: { from: rest.location }
        }}
      />
    );
  }

  return (
    <React.Suspense fallback={<AutoAtendeLoading />}>
      <RouterRoute
        {...rest}
        render={props => <Component {...props} />}
      />
    </React.Suspense>
  );
};

export default CustomRoute;
import React, { useContext, Suspense } from "react";
import { Route as RouterRoute, Redirect } from "react-router-dom";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { AutoAtendeLoading } from "../components/Loading/AutoAtendeLoading";

const CustomRoute = ({ component: Component, isPrivate = false, ...rest }) => {
  const { isAuth, loading, user } = useContext(AuthContext);

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
    <Suspense fallback={<AutoAtendeLoading />}>
      <RouterRoute
        {...rest}
        render={props => <Component {...props} />}
      />
    </Suspense>
  );
};

export default CustomRoute;
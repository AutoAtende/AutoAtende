export const getProfileType = (profile) => {
    switch (profile) {
      case "admin":
        return "Administrador";
      case "superv":
        return "Supervisor";
      case "user":
        return "Usuário";
      default:
        return null;
    }
  };
export const removeMask = (value) => {
    if (!value) return "";
    return value.replace(/\D/g, "");
  };
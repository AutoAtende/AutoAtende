export const GetPublicPath = () => {
  const publicFolder = process.env.BACKEND_PUBLIC_PATH;

  if (!publicFolder) {
    throw new Error("BACKEND_PUBLIC_PATH is not defined");
  }

  return publicFolder;
};

export default GetPublicPath;

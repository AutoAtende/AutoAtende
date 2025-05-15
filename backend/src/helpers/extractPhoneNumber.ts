export const extractPhoneNumber = (str: string) => {
  try {
    const match = str.match(/^(\d+):/);
    return match ? match[1] : null;
  } catch (error) {
    return str;
  }
};

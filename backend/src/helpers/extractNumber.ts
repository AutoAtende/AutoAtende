export const extractNumber = (id: string): string | null => {
    const match = id.match(/^(\d{12}):\d+@s\.whatsapp\.net$/);
    return match ? match[1] : null;
  };
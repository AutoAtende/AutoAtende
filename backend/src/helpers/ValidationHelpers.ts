// helpers/ValidationHelpers.ts
export const isValidCPF = (cpf: string): boolean => {
    if (!cpf) return false;
    
    // Remove non-numeric characters
    cpf = cpf.replace(/[^\d]/g, '');
    
    // Must have 11 digits
    if (cpf.length !== 11) return false;
    
    // Check if all digits are the same (invalid)
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // CPF validation algorithm
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  };
  
  export const isValidEmail = (email: string): boolean => {
    if (!email) return false;
    
    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  export const isValidPhone = (phone: string): boolean => {
    if (!phone) return false;
    
    // Remove non-numeric characters
    phone = phone.replace(/[^\d]/g, '');
    
    // Check length (minimum 10 digits - DDD + number)
    return phone.length >= 10 && phone.length <= 13;
  };
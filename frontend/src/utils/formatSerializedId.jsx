import { parsePhoneNumber } from 'libphonenumber-js'; 

const getFlagEmoji = (countryCode) => {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
}

const formatSerializedId = (serializedId) => {
  if (!serializedId) return '';
  
  let number = serializedId.replace('@c.us', '');

  if (!number.startsWith('+')) {
    number = `+${number}`;
  }

  const parsedNumber = parsePhoneNumber(number);
  if (!parsedNumber) {
      return '';
  }

  const formatedNumber = parsedNumber.formatInternational();
  
  // Obtém o código do país (ex: "BR", "US", etc.)
  const countryCode = parsedNumber.country;
  
  if (countryCode) {
    const flag = getFlagEmoji(countryCode);
    // Substitui o código do país pela bandeira
    return formatedNumber.replace(`+${parsedNumber.countryCallingCode}`, flag);
  }

  return formatedNumber;
};

export default formatSerializedId;
/**
 * @description Essa função irá retornar apenas numeros e excluir letras e caracteres especiais.
 */
export const clearSpecialCharactersAndLetters = (input: string): string => {
    if (!input) {
      return ''
    }
    const onlyNumbers = input.replace(/\D/g, '')
    return onlyNumbers
  }
  
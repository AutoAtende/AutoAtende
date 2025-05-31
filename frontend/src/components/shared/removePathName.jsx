

/**
 * Remove o nome do caminho de uma string de caminho fornecida.
 *
 * @param {string} path - O caminho completo de onde o nome do caminho será removido.
 * @returns {string} - O caminho sem o nome do caminho inicial. Se não houver correspondência, retorna uma string vazia.
 */
export const removePathName = (path) => {
    const regex = /[^/]+\/[^/]+\/(.+)/;
    const match = path.match(regex);
    return match ? match[1] : '';
};

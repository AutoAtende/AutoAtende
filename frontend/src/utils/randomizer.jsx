export function randomizarCaminho(chanceA) {
  const chanceA = chanceA; // 20% de chance para o caminho A
  const numeroAleatorio = Math.random(); // Gere um número aleatório entre 0 e 1

  if (numeroAleatorio < chanceA) {
    // Escolha o caminho A
    return "A";
  } else {
    // Escolha o caminho B
    return "B";
  }
}

/**
 * Função para fazer scroll para o topo
 * @param {} scrollRef 
 * @description const scrollRef = useRef(null);
 */
export const scrollToTop = (scrollRef) => {
    // const scrollRef = useRef(null);
    if (scrollRef.current) {
      // Se a ref existir, faz o scroll para o topo
      scrollRef.current.scrollTop = 0;
    } else {
      // Se não houver ref, faz o scroll para o topo da página
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
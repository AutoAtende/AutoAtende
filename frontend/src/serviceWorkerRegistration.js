export function register() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registrado com sucesso:', registration.scope);
          
          // Força atualização do service worker ao carregar a página
          registration.update();

          // Atualiza a página quando um novo service worker é ativado
          registration.addEventListener('activate', () => {
            window.location.reload();
          });
        })
        .catch(error => {
          console.error('Erro ao registrar ServiceWorker:', error);
        });
    });
  }
}
  
  export function unregister() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(registration => {
          registration.unregister();
        })
        .catch(error => {
          console.error(error.message);
        });
    }
  }
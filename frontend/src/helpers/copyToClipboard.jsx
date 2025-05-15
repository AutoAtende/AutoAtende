const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        Document.execCommand('copy');
      } catch (err) {
        console.error('Falha ao copiar texto:', err);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };
  
  export { copyToClipboard };
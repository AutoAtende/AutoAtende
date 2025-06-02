// src/hooks/useNotificationSound.js
import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook personalizado para gerenciar sons de notificação
 * Fornece controle mais preciso sobre reprodução de áudio
 */
const useNotificationSound = (audioSrc, volume = 0.5) => {
  const audioRef = useRef(null);
  const isInitialized = useRef(false);

  // Inicializar o áudio
  useEffect(() => {
    if (!audioSrc) return;

    try {
      audioRef.current = new Audio(audioSrc);
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
      audioRef.current.preload = 'auto';
      
      // Adicionar listeners de eventos
      audioRef.current.addEventListener('canplaythrough', () => {
        isInitialized.current = true;
        console.log('Áudio de notificação carregado e pronto');
      });

      audioRef.current.addEventListener('error', (error) => {
        console.error('Erro ao carregar áudio de notificação:', error);
        isInitialized.current = false;
      });

      // Carregar o áudio
      audioRef.current.load();

    } catch (error) {
      console.error('Erro ao inicializar áudio de notificação:', error);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('canplaythrough', () => {});
        audioRef.current.removeEventListener('error', () => {});
        audioRef.current = null;
      }
    };
  }, [audioSrc]);

  // Atualizar volume quando mudar
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  // Função para reproduzir o som
  const playSound = useCallback(async () => {
    if (!audioRef.current || !isInitialized.current || volume === 0) {
      console.warn('Áudio não está pronto ou volume está em 0');
      return false;
    }

    try {
      // Resetar posição do áudio para o início
      audioRef.current.currentTime = 0;
      
      // Reproduzir o áudio
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('Som de notificação reproduzido com sucesso');
        return true;
      }
    } catch (error) {
      console.error('Erro ao reproduzir som de notificação:', error);
      
      // Tentar reproduzir novamente após interação do usuário
      if (error.name === 'NotAllowedError') {
        console.warn('Reprodução de áudio bloqueada - aguardando interação do usuário');
        
        // Adicionar listener para próxima interação
        const handleUserInteraction = async () => {
          try {
            await audioRef.current.play();
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            console.log('Áudio desbloqueado após interação do usuário');
            
            // Remover listeners
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
          } catch (retryError) {
            console.error('Erro ao desbloquear áudio:', retryError);
          }
        };

        document.addEventListener('click', handleUserInteraction, { once: true });
        document.addEventListener('keydown', handleUserInteraction, { once: true });
        document.addEventListener('touchstart', handleUserInteraction, { once: true });
      }
      
      return false;
    }
  }, [volume]);

  // Função para testar o som
  const testSound = useCallback(() => {
    console.log('Testando som de notificação...');
    return playSound();
  }, [playSound]);

  // Função para verificar se está pronto
  const isReady = useCallback(() => {
    return isInitialized.current && audioRef.current && audioRef.current.readyState >= 3;
  }, []);

  // Função para obter estado atual
  const getStatus = useCallback(() => {
    return {
      isReady: isReady(),
      volume: audioRef.current?.volume || 0,
      duration: audioRef.current?.duration || 0,
      src: audioRef.current?.src || '',
      readyState: audioRef.current?.readyState || 0
    };
  }, [isReady]);

  return {
    playSound,
    testSound,
    isReady,
    getStatus
  };
};

export default useNotificationSound;
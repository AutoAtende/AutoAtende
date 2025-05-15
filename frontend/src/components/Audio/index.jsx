import React, { useState, useEffect } from "react";
import CustomAudioPlayer from "./CustomAudioPlayer";

const Audio = ({ url, onPlay, waveformBase64 }) => {
  // Detecção melhorada de dispositivos e navegadores
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOSChrome = isIOS && /CriOS/.test(navigator.userAgent);
  
  const [audioUrl, setAudioUrl] = useState(url);
  const [isOGVLoaded, setIsOGVLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  
  // Efeito para preparar a URL do áudio adequada para dispositivo
  useEffect(() => {
    // Para iOS, preparar a URL correta
    if (isIOS) {
      // Verificar formatos de áudio compatíveis
      const audioTest = document.createElement('audio');
      const canPlayOgg = audioTest.canPlayType('audio/ogg') !== '';
      const canPlayMp3 = audioTest.canPlayType('audio/mpeg') !== '';
      const canPlayMp4 = audioTest.canPlayType('audio/mp4') !== '';
      
      console.log(`Compatibilidade iOS - OGG: ${canPlayOgg}, MP3: ${canPlayMp3}, MP4: ${canPlayMp4}`);
      
      // Se o áudio for OGG e não for suportado, tentar alternativas
      if (url.toLowerCase().endsWith('.ogg') && !canPlayOgg) {
        // Tentar MP3 ou MP4 como alternativa
        const alternativeUrl = canPlayMp3 
          ? url.replace(/\.ogg$/i, '.mp3')
          : url.replace(/\.ogg$/i, '.mp4');
        
        console.log('iOS detectado, usando alternativa:', alternativeUrl);
        setAudioUrl(alternativeUrl);
      }
      
      // Verificar e carregar OGVLoader para iOS
      if (typeof window.OGVLoader === 'undefined') {
        loadOGVScripts()
          .then(() => setIsOGVLoaded(true))
          .catch(err => {
            console.error('Erro ao carregar OGV:', err);
            // Se falhar em carregar OGV, exibir fallback
            setShowFallback(true);
          });
      } else {
        setIsOGVLoaded(true);
      }
    }
  }, [url, isIOS]);

  // Tentar reprodução após algumas tentativas malsucedidas
  useEffect(() => {
    let errorCount = 0;
    
    const handleAudioError = () => {
      errorCount++;
      if (errorCount > 2) {
        setShowFallback(true);
      }
    };
    
    window.addEventListener('audio-error', handleAudioError);
    
    return () => {
      window.removeEventListener('audio-error', handleAudioError);
    };
  }, []);
  
  // Função para carregar OGV de forma mais robusta
  const loadOGVScripts = async () => {
    return new Promise((resolve, reject) => {
      try {
        // Verificar se já existe
        if (document.getElementById('ogv-loader')) {
          console.log('OGVLoader já existe no DOM');
          if (window.OGVLoader) {
            window.OGVLoader.base = '/ogv';
            return resolve(true);
          }
        }
        
        const script = document.createElement('script');
        script.id = 'ogv-loader';
        script.src = '/ogv/ogv.js';
        script.async = true;
        
        script.onload = () => {
          console.log('OGVLoader carregado com sucesso!');
          
          // Configurar o OGVLoader
          if (window.OGVLoader) {
            window.OGVLoader.base = '/ogv';
            resolve(true);
          } else {
            reject(new Error('OGVLoader carregado mas não disponível'));
          }
        };
        
        script.onerror = (error) => {
          console.error('Falha ao carregar OGVLoader:', error);
          reject(error);
        };
        
        document.head.appendChild(script);
      } catch (err) {
        console.error('Erro ao configurar OGVLoader:', err);
        reject(err);
      }
    });
  };
  
  // Lidar com erros de reprodução
  const handlePlayError = () => {
    setShowFallback(true);
  };
  
  return (
    <>
      {/* Player principal */}
      <CustomAudioPlayer 
        src={audioUrl} 
        onPlay={onPlay} 
        waveformBase64={waveformBase64}
        onError={handlePlayError}
        />
      
        {/* Fallback visível apenas para iOS em caso de problemas */}
        {isIOS && showFallback && (
          <div style={{ 
            margin: '10px 0',
            textAlign: 'center'
          }}>
            <audio 
              controls 
              src={audioUrl}
              style={{
                width: '100%',
                maxWidth: '400px'
              }}
              preload="auto"
              playsInline={true}
            />
          </div>
        )}
      </>
    );
  };
  
  export default Audio;
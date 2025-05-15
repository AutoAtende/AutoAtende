import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  PlayArrow, 
  Pause, 
  GetApp
} from '@mui/icons-material';
import { 
  Box, 
  CircularProgress, 
  IconButton, 
  Typography 
} from "@mui/material";
import './OgvAudioPlayer.css';

const LS_NAME = 'audioMessageRate';

const CustomAudioPlayer = ({ src, onPlay, waveformBase64 }) => {
  const audioRef = useRef(null);
  const ogvPlayerRef = useRef(null);
  const audioContextRef = useRef(null);
  const waveContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const fallbackAudioRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [audioRate, setAudioRate] = useState(parseFloat(localStorage.getItem(LS_NAME) || "1"));
  const [waveformData, setWaveformData] = useState(null);
  const [useNativeFallback, setUseNativeFallback] = useState(false);
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOSChrome = isIOS && /CriOS/.test(navigator.userAgent);

  const generateRandomWaveform = useCallback(() => {
    const numberOfBars = 64;
    const waveform = [];
    
    for (let i = 0; i < numberOfBars; i++) {
      waveform.push(30 + Math.random() * 70);
    }
    
    return waveform;
  }, []);

  // Função para decodificar Base64 em ArrayBuffer
  function decodeBase64ToArrayBuffer(waveformBase64) {
    if (!waveformBase64) return null;
    
    try {
      const binaryString = atob(waveformBase64); // Decodifica de base64 para binário
      const arrayBuffer = new ArrayBuffer(binaryString.length); // Cria um ArrayBuffer do tamanho da string binária
      const bufferView = new Uint8Array(arrayBuffer);

      // Preenche o ArrayBuffer com os dados binários
      for (let i = 0; i < binaryString.length; i++) {
        bufferView[i] = binaryString.charCodeAt(i); // Preenche com os valores binários
      }
    
      return bufferView;
    } catch (error) {
      console.error('Erro ao decodificar waveform Base64:', error);
      return null;
    }
  }

  // Verificar compatibilidade de formato de áudio
  const checkAudioCompatibility = useCallback(() => {
    // Verificar compatibilidade com diferentes formatos
    const audioTest = document.createElement('audio');
    
    const formats = {
      mp3: audioTest.canPlayType('audio/mpeg'),
      mp4: audioTest.canPlayType('audio/mp4'),
      aac: audioTest.canPlayType('audio/aac'),
      ogg: audioTest.canPlayType('audio/ogg; codecs="vorbis"'),
      opus: audioTest.canPlayType('audio/ogg; codecs="opus"'),
      webm: audioTest.canPlayType('audio/webm; codecs="vorbis"')
    };
    
    console.log('Formatos de áudio compatíveis:', formats);
    
    // Determinar o melhor formato para este dispositivo
    let bestFormat = 'mp3'; // Padrão
    
    if (formats.mp4 === 'probably') bestFormat = 'mp4';
    else if (formats.aac === 'probably') bestFormat = 'aac';
    
    // No iOS, priorizar formatos nativamente suportados
    if (isIOS) {
      if (formats.mp4 === 'probably' || formats.mp4 === 'maybe') bestFormat = 'mp4';
      else if (formats.aac === 'probably' || formats.aac === 'maybe') bestFormat = 'aac';
      else if (formats.mp3 === 'probably' || formats.mp3 === 'maybe') bestFormat = 'mp3';
    }
    
    return { formats, bestFormat };
  }, [isIOS]);

  // Inicializar OGVPlayer melhorado
  const initializeOGVPlayer = useCallback(async (audioUrl) => {
    if (!isIOS) return null;
    
    return new Promise((resolve, reject) => {
      try {
        if (typeof window.OGVLoader === 'undefined') {
          console.warn('OGVLoader não disponível. Carregando dinamicamente...');
          
          const script = document.createElement('script');
          script.id = 'ogv-loader';
          script.src = '/ogv/ogv.js';
          script.async = true;
          
          script.onload = () => {
            console.log('OGVLoader carregado com sucesso');
            if (window.OGVLoader) {
              window.OGVLoader.base = '/ogv';
              initOGVPlayer(audioUrl, resolve, reject);
            } else {
              reject(new Error('OGVLoader foi carregado mas não está disponível'));
            }
          };
          
          script.onerror = (err) => {
            console.error('Falha ao carregar OGVLoader:', err);
            reject(err);
          };
          
          document.head.appendChild(script);
        } else {
          initOGVPlayer(audioUrl, resolve, reject);
        }
      } catch (err) {
        console.error('Erro ao inicializar OGVLoader:', err);
        reject(err);
      }
    });
  }, [isIOS]);

  // Função auxiliar para criar o player OGV
  const initOGVPlayer = (audioUrl, resolve, reject) => {
    try {
      const ogvPlayer = new window.OGVPlayer({
        mediaType: 'audio',
        codec: 'opus,vorbis',
        forceWebGL: false
      });
      
      ogvPlayer.src = audioUrl;
      ogvPlayer.preload = 'auto';
      
      // Garantir visibilidade no DOM, mesmo que oculto
      const audioContainer = document.createElement('div');
      audioContainer.className = 'audio-container-ogv';
      audioContainer.style.height = '1px';
      audioContainer.style.width = '1px';
      audioContainer.style.overflow = 'hidden';
      audioContainer.style.position = 'absolute';
      audioContainer.style.left = '-9999px';
      audioContainer.appendChild(ogvPlayer);
      document.body.appendChild(audioContainer);
      
      // Confirmar se o player foi criado corretamente
      setTimeout(() => {
        if (ogvPlayer) {
          resolve(ogvPlayer);
        } else {
          reject(new Error('OGVPlayer não inicializado corretamente'));
        }
      }, 500);
    } catch (err) {
      console.error('Erro ao criar OGVPlayer:', err);
      reject(err);
    }
  };

  const fetchAudioData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const randomWaveform = generateRandomWaveform();
      setWaveformData(randomWaveform);
      
      if (!isIOS) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        
        try {
          const response = await fetch(src);
          if (!response.ok) {
            throw new Error(`Erro ao buscar áudio: ${response.status} ${response.statusText}`);
          }
          
          const arrayBuffer = await response.arrayBuffer();
          const decodedData = await audioContextRef.current.decodeAudioData(arrayBuffer);
          let waveform = [];
          
          if (waveformBase64) {
            const decodedWaveform = decodeBase64ToArrayBuffer(waveformBase64);
            if (decodedWaveform) {
              waveform = decodedWaveform;
            } else {
              // Fallback para gerar waveform a partir dos dados de áudio
              waveform = generateWaveformFromAudio(decodedData);
            }
          } else {
            waveform = generateWaveformFromAudio(decodedData);
          }
          
          setWaveformData(waveform);
        } catch (error) {
          console.error('Erro na análise do áudio:', error);
          // Manter o waveform aleatório em caso de erro
        }
      } else {
        // Para iOS, tentar detectar formato correto
        checkAudioCompatibility();
      }
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      setIsLoading(false);
    }
  }, [src, isIOS, generateRandomWaveform, checkAudioCompatibility, waveformBase64]);

  // Função para gerar waveform a partir de dados de áudio
  const generateWaveformFromAudio = (audioData) => {
    const channelData = audioData.getChannelData(0);
    const numberOfBars = 64;
    const samplesPerBar = Math.floor(channelData.length / numberOfBars);
    const waveform = [];
    
    for (let i = 0; i < numberOfBars; i++) {
      let sum = 0;
      for (let j = 0; j < samplesPerBar; j++) {
        const index = i * samplesPerBar + j;
        if (index < channelData.length) {
          sum += Math.abs(channelData[index]);
        }
      }
      const average = sum / samplesPerBar;
      waveform.push(30 + (average * 85)); // Aumento na altura
    }
    
    return waveform;
  };

  useEffect(() => {
    fetchAudioData();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(err => 
          console.warn('Erro ao fechar AudioContext:', err)
        );
      }
    };
  }, [fetchAudioData]);

  useEffect(() => {
    if (!isIOS && audioRef.current) {
      const audio = audioRef.current;
      
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setIsLoading(false);
      };
      
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      
      const handlePlay = () => {
        setIsPlaying(true);
        if (onPlay) onPlay();
      };
      
      const handlePause = () => {
        setIsPlaying(false);
      };
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
      };
    }
  }, [isIOS, onPlay]);

  // Efeito para lidar com fallback de áudio nativo em iOS
  useEffect(() => {
    if (isIOS && fallbackAudioRef.current) {
      const audio = fallbackAudioRef.current;
      
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setIsLoading(false);
      };
      
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      
      const handlePlay = () => {
        setIsPlaying(true);
        if (onPlay) onPlay();
      };
      
      const handlePause = () => {
        setIsPlaying(false);
      };
      
      const handleError = (error) => {
        console.error('Erro no fallback de áudio:', error);
        setIsLoading(false);
      };
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('error', handleError);
      
      // Tentar pré-carregar em iOS
      audio.load();
      
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('error', handleError);
      };
    }
  }, [isIOS, onPlay]);

  // Nova implementação melhorada para OGVPlayer em iOS
  useEffect(() => {
    if (isIOS) {
      // Tentar inicializar OGVPlayer primeiramente
      initializeOGVPlayer(src)
        .then(ogvPlayer => {
          ogvPlayerRef.current = ogvPlayer;
          
          const handleLoadedMetadata = () => {
            setDuration(ogvPlayer.duration);
            setIsLoading(false);
          };
          
          const handleTimeUpdate = () => {
            setCurrentTime(ogvPlayer.currentTime);
          };
          
          const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
          };
          
          const handlePlay = () => {
            setIsPlaying(true);
            if (onPlay) onPlay();
          };
          
          const handlePause = () => {
            setIsPlaying(false);
          };
          
          ogvPlayer.addEventListener('loadedmetadata', handleLoadedMetadata);
          ogvPlayer.addEventListener('timeupdate', handleTimeUpdate);
          ogvPlayer.addEventListener('ended', handleEnded);
          ogvPlayer.addEventListener('play', handlePlay);
          ogvPlayer.addEventListener('pause', handlePause);
          
          // Tentar carregar o conteúdo
          ogvPlayer.load();
          
          return () => {
            try {
              ogvPlayer.removeEventListener('loadedmetadata', handleLoadedMetadata);
              ogvPlayer.removeEventListener('timeupdate', handleTimeUpdate);
              ogvPlayer.removeEventListener('ended', handleEnded);
              ogvPlayer.removeEventListener('play', handlePlay);
              ogvPlayer.removeEventListener('pause', handlePause);
              
              ogvPlayer.pause();
              const container = ogvPlayer.parentNode;
              if (container && container.parentNode) {
                container.parentNode.removeChild(container);
              }
            } catch (error) {
              console.warn('Erro ao limpar OGVPlayer:', error);
            }
          };
        })
        .catch(error => {
          console.warn('Erro ao inicializar OGVPlayer, usando fallback nativo:', error);
          setUseNativeFallback(true);
        });
    }
  }, [src, isIOS, onPlay, initializeOGVPlayer]);

  useEffect(() => {
    if (canvasRef.current && waveformData) {
      const canvas = canvasRef.current;
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;
      offscreenCanvasRef.current = offscreenCanvas;
      
      const offCtx = offscreenCanvas.getContext('2d');
      
      offCtx.fillStyle = '#E0E0E0';
      const barWidth = Math.max(2, (canvas.width / waveformData.length) - 1);
      const barSpacing = 3; // Espaçamento aumentado
      
      waveformData.forEach((height, index) => {
        const x = index * (barWidth + barSpacing);
        const barHeight = (height / 100) * canvas.height;
        offCtx.fillRect(
          x, 
          (canvas.height - barHeight) / 2, 
          barWidth, 
          barHeight
        );
      });
      
      updateCanvas();
    }
  }, [waveformData]);

  const updateCanvas = useCallback(() => {
    if (!canvasRef.current || !waveformData) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (offscreenCanvasRef.current) {
      ctx.drawImage(offscreenCanvasRef.current, 0, 0);
    }
    
    const progress = duration > 0 ? currentTime / duration : 0;
    const progressWidth = canvas.width * progress;
    
    ctx.fillStyle = '#6FB1E3'; // Azul claro
    
    const barWidth = Math.max(2, (canvas.width / waveformData.length) - 1);
    const barSpacing = 3; // Espaçamento aumentado
    
    waveformData.forEach((height, index) => {
      const x = index * (barWidth + barSpacing);
      const barHeight = (height / 100) * canvas.height;
      
      if (x <= progressWidth) {
        ctx.fillRect(
          x, 
          (canvas.height - barHeight) / 2, 
          barWidth, 
          barHeight
        );
      }
    });
    
  }, [currentTime, duration, waveformData]);

  useEffect(() => {
    updateCanvas();
  }, [currentTime, updateCanvas]);

  useEffect(() => {
    if (isIOS) {
      if (ogvPlayerRef.current) {
        ogvPlayerRef.current.playbackRate = audioRate;
      }
      if (fallbackAudioRef.current && useNativeFallback) {
        fallbackAudioRef.current.playbackRate = audioRate;
      }
    } else if (audioRef.current) {
      audioRef.current.playbackRate = audioRate;
    }
    localStorage.setItem(LS_NAME, audioRate);
  }, [audioRate, isIOS, useNativeFallback]);

  const handlePlayPause = () => {
    if (isLoading) return;
    
    if (!isIOS && audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    if (isIOS) {
      if (useNativeFallback && fallbackAudioRef.current) {
        if (isPlaying) {
          fallbackAudioRef.current.pause();
        } else {
          // No iOS, precisamos de interação para reproduzir
          const playPromise = fallbackAudioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Erro ao reproduzir áudio (fallback):', error);
              // Se falhou, tentar uma vez com interação do usuário
              if (error.name === 'NotAllowedError') {
                setTimeout(() => {
                  const userInteractionPlay = () => {
                    document.removeEventListener('click', userInteractionPlay);
                    fallbackAudioRef.current.play().catch(err => 
                      console.error('Ainda sem permissão para reproduzir:', err)
                    );
                  };
                  document.addEventListener('click', userInteractionPlay, { once: true });
                }, 0);
              }
            });
          }
        }
      } else if (ogvPlayerRef.current) {
        if (isPlaying) {
          ogvPlayerRef.current.pause();
        } else {
          ogvPlayerRef.current.play();
        }
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error('Erro ao reproduzir áudio:', error);
        });
      }
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (event) => {
    if (isLoading || !duration) return;
    
    const waveContainer = waveContainerRef.current;
    const rect = waveContainer.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
    const newTime = percentage * duration;
    
    setCurrentTime(newTime);
    
    if (isIOS) {
      if (useNativeFallback && fallbackAudioRef.current) {
        fallbackAudioRef.current.currentTime = newTime;
      } else if (ogvPlayerRef.current) {
        ogvPlayerRef.current.currentTime = newTime;
      }
    } else if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const toggleRate = () => {
    let newRate = null;
  
    switch (audioRate) {
      case 0.5:
        newRate = 1;
        break;
      case 1:
        newRate = 1.5;
        break;
      case 1.5:
        newRate = 2;
        break;
      case 2:
        newRate = 0.5;
        break;
      default:
        newRate = 1;
        break;
    }
  
    setAudioRate(newRate);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleDownload = () => {
    const filename = src.split('/').pop();
    
    fetch(src)
      .then(response => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(err => console.error('Erro ao baixar arquivo:', err));
  };

  return (
    <Box className="whatsapp-audio-player" p={1} bgcolor="#f5f5f5" borderRadius="8px" boxShadow={1}>
      {/* Player padrão para não-iOS */}
      {!isIOS && (
        <audio
          ref={audioRef}
          src={src}
          preload="auto"
          style={{ display: 'none' }}
        />
      )}
      
      {/* Fallback nativo para iOS */}
      {isIOS && useNativeFallback && (
        <audio
          ref={fallbackAudioRef}
          src={src}
          preload="auto"
          playsInline={true}
          style={{ display: 'none' }}
        />
      )}
      
      <Box display="flex" alignItems="center" width="100%">
        <IconButton onClick={toggleRate} size="small" title={`Velocidade: ${audioRate}x`}>
          <Typography variant="caption" fontWeight="bold">
            {audioRate}x
          </Typography>
        </IconButton>
        <IconButton onClick={handlePlayPause} disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        
        <Box
          ref={waveContainerRef}
          onClick={handleSeek}
          flexGrow={1}
          display="flex"
          alignItems="center"
          height="50px"
          mx={1}
          style={{ cursor: 'pointer' }}
        >
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={80}
            style={{ width: '100%', height: '24px' }}
          />
        </Box>
        
        <Box display="flex" flexDirection="column" alignItems="center">
          <IconButton onClick={handleDownload} title="Baixar áudio" size="small">
            <GetApp />
          </IconButton>
        </Box>
      </Box>

      <Box display="flex" justifyContent="space-between" width="100%" mt={-2} px={0.5}>
        <Typography variant="caption" style={{ color: '#666', fontSize: '0.75rem' }}>
          {formatTime(currentTime)}
        </Typography>
        <Typography variant="caption" style={{ color: '#666', fontSize: '0.75rem' }}>
          {formatTime(duration)}
        </Typography>
      </Box>
    </Box>
  );
};

export default CustomAudioPlayer;
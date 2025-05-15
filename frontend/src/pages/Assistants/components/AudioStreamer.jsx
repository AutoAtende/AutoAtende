import React, { useEffect, useState, useRef } from 'react';
import { Box, IconButton, CircularProgress, Typography } from '@mui/material';
import { Mic, Stop, VolumeUp, VolumeMute } from '@mui/icons-material';
import { useSocketContext } from '../../context/Socket/SocketContext';
import { useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { toast } from '../../helpers/toast';

const PREFIX = 'AudioStreamer';

const classes = {
  root: `${PREFIX}-root`,
  controlsContainer: `${PREFIX}-controlsContainer`,
  waveform: `${PREFIX}-waveform`,
  statusText: `${PREFIX}-statusText`
};

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    marginBottom: theme.spacing(2)
  }
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  [`&.${classes.controlsContainer}`]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1)
  }
}));

const Waveform = styled(Box)(({ theme }) => ({
  [`&.${classes.waveform}`]: {
    width: '100%',
    height: 40,
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
    position: 'relative',
    overflow: 'hidden'
  }
}));

const StatusText = styled(Typography)(({ theme }) => ({
  [`&.${classes.statusText}`]: {
    marginTop: theme.spacing(1),
    textAlign: 'center',
    fontStyle: 'italic'
  }
}));

// Este componente é experimental e demonstra como implementar streaming de áudio bidirecional
const AudioStreamer = () => {
  const { ticketId } = useParams();
  const { joinAudioStream, leaveAudioStream, sendAudioChunk, listenAudioChunks } = useSocketContext();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Pronto para iniciar streaming de áudio');
  
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioQueueRef = useRef([]);
  
  useEffect(() => {
    // Entrar no streaming de áudio ao montar o componente
    joinAudioStream(ticketId);
    
    // Configurar áudio context para visualização
    setupAudioContext();
    
    // Escutar por chunks de áudio recebidos
    const cleanup = listenAudioChunks(ticketId, handleIncomingAudioChunk);
    
    return () => {
      cleanup();
      leaveAudioStream(ticketId);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (mediaRecorderRef.current) {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          // Ignorar erro se o mediaRecorder já estiver parado
        }
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [ticketId, joinAudioStream, leaveAudioStream, listenAudioChunks]);
  
  const setupAudioContext = () => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      // Iniciar visualizador
      drawWaveform();
    } catch (error) {
      console.error('Erro ao configurar áudio context:', error);
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Conectar stream ao visualizador
      if (audioContextRef.current && analyserRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
      }
      
      // Configurar MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result.split(',')[1];
            // Enviar chunk para o servidor via socket
            sendAudioChunk(ticketId, base64data, false);
          };
          reader.readAsDataURL(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Enviar flag de último chunk
        sendAudioChunk(ticketId, '', true);
        setIsRecording(false);
        setStatusMessage('Streaming interrompido');
      };
      
      // Iniciar gravação em chunks de 100ms
      mediaRecorder.start(100);
      setIsRecording(true);
      setStatusMessage('Enviando áudio em streaming...');
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      toast.error('Erro ao acessar microfone. Verifique as permissões do navegador.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      } catch (error) {
        console.error('Erro ao parar gravação:', error);
      }
    }
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const handleIncomingAudioChunk = async (data) => {
    try {
      const { chunk, last } = data;
      
      if (!chunk && last) {
        // Último chunk recebido, processar a fila de áudio
        processAudioQueue();
        return;
      }
      
      if (!chunk) return;
      
      // Converter base64 para blob
      const byteCharacters = atob(chunk);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/webm' });
      
      // Adicionar à fila de áudio
      audioQueueRef.current.push(blob);
      
      if (!isPlaying) {
        setIsPlaying(true);
        processAudioQueue();
      }
    } catch (error) {
      console.error('Erro ao processar chunk de áudio:', error);
    }
  };
  
  const processAudioQueue = async () => {
    if (audioQueueRef.current.length === 0) {
      setIsPlaying(false);
      setStatusMessage('Aguardando áudio...');
      return;
    }
    
    try {
      // Obter próximo blob da fila
      const blob = audioQueueRef.current.shift();
      
      // Criar URL para o blob
      const url = URL.createObjectURL(blob);
      
      // Reproduzir áudio
      const audio = new Audio(url);
      
      audio.onended = () => {
        URL.revokeObjectURL(url);
        processAudioQueue();
      };
      
      if (!isMuted) {
        await audio.play();
        setStatusMessage('Reproduzindo áudio...');
      } else {
        // Se estiver mudo, pular para o próximo
        audio.onended();
      }
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      processAudioQueue();
    }
  };
  
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) {
      animationRef.current = requestAnimationFrame(drawWaveform);
      return;
    }
    
    const canvasCtx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      if (isRecording) {
        analyserRef.current.getByteFrequencyData(dataArray);
        
        canvasCtx.fillStyle = 'rgb(240, 240, 240)';
        canvasCtx.fillRect(0, 0, width, height);
        
        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = dataArray[i] / 2;
          
          canvasCtx.fillStyle = isRecording ? 'rgb(255, 0, 0)' : 'rgb(0, 122, 255)';
          canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight);
          
          x += barWidth + 1;
        }
      } else {
        canvasCtx.fillStyle = 'rgb(240, 240, 240)';
        canvasCtx.fillRect(0, 0, width, height);
        
        // Desenhar linha estática quando não estiver gravando
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, height / 2);
        canvasCtx.lineTo(width, height / 2);
        canvasCtx.strokeStyle = 'rgb(200, 200, 200)';
        canvasCtx.stroke();
      }
    };
    
    draw();
  };
  
  return (
    <Root className={classes.root}>
      <ControlsContainer className={classes.controlsContainer}>
        <IconButton
          color={isRecording ? 'error' : 'primary'}
          onClick={toggleRecording}
        >
          {isRecording ? <Stop /> : <Mic />}
        </IconButton>
        
        <IconButton
          color="primary"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeMute /> : <VolumeUp />}
        </IconButton>
      </ControlsContainer>
      
      <Waveform className={classes.waveform}>
        <canvas
          ref={canvasRef}
          width="300"
          height="40"
          style={{ width: '100%', height: '100%' }}
        />
      </Waveform>
      
      <StatusText className={classes.statusText} variant="caption" color="textSecondary">
        {statusMessage}
      </StatusText>
    </Root>
  );
};

export default AudioStreamer;
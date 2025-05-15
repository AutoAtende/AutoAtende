class AudioRecorderService {
  constructor(options = {}) {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.options = {
      mimeType: null, // Será determinado dinamicamente
      audioBitsPerSecond: 128000,
      ...options
    };
    this.timeoutId = null;
    this.audioContext = null;
    this.recordingStartTime = null;
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    this.isMacOS = /Mac OS X/.test(navigator.userAgent);
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.isIOSChrome = this.isIOS && /CriOS/.test(navigator.userAgent);
    this.chunkCollected = false;
    this.dataAvailableListenerAdded = false;
    this.isRecording = false;
  }

  async startRecording() {
    try {
      // Verificar se já está gravando para evitar instâncias duplas
      if (this.isRecording) {
        console.warn('[AudioRecorder] Tentativa de iniciar uma gravação já em andamento');
        return false;
      }

      // Limpar dados de gravações anteriores
      this.audioChunks = [];
      this.chunkCollected = false;
      this.dataAvailableListenerAdded = false;
      this.recordingStartTime = new Date();
      this.isRecording = true; // Definir estado como gravando

      console.log(`Iniciando gravação no dispositivo. iOS: ${this.isIOS}, Safari: ${this.isSafari}, MacOS: ${this.isMacOS}`);

      // Verificar comportamento de permissões
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
          console.log('Status de permissão do microfone:', permissionStatus.state);

          if (permissionStatus.state === 'denied') {
            console.error('Permissão de microfone negada pelo usuário');
            this.isRecording = false;
            throw new Error('permission_denied');
          }
        } catch (permErr) {
          // Alguns navegadores não suportam a API de permissões
          console.warn('Verificação de permissão não suportada:', permErr);
        }
      }

      // Em iOS/Safari/Mac, precisamos lidar com permissões de forma diferente
      if (this.isIOS || this.isSafari || this.isMacOS) {
        console.log("[AudioRecorder] Usando configuração específica para iOS/Safari/Mac");
        await this._initAudioContext();
      }

      // Forçar limpeza de recursos anteriores antes de iniciar nova gravação
      this._cleanupResources();

      // Configurações para obter melhor compatibilidade com todos os dispositivos
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Configurações universais para melhor compatibilidade entre plataformas
          sampleRate: 44100,
          channelCount: 1
        }
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Determinar o melhor formato suportado
      this.options.mimeType = this._getBestSupportedMimeType();
      console.log(`[AudioRecorder] Formato selecionado: ${this.options.mimeType}`);

      const recorderOptions = {
        audioBitsPerSecond: this.options.audioBitsPerSecond
      };

      if (this.options.mimeType) {
        recorderOptions.mimeType = this.options.mimeType;
      }

      this.mediaRecorder = new MediaRecorder(this.stream, recorderOptions);

      // Adicionar event listener para dataavailable
      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          console.log(`[AudioRecorder] Chunk recebido: ${event.data.size} bytes, tipo: ${event.data.type}`);
          this.audioChunks.push(event.data);
          this.chunkCollected = true;
        } else {
          console.warn('[AudioRecorder] Chunk vazio recebido');
        }
      });
      
      // Adicionar um handler para erro
      this.mediaRecorder.addEventListener('error', (error) => {
        console.error('[AudioRecorder] Erro no MediaRecorder:', error);
        this.isRecording = false;
      });

      // Garantir que dados sejam coletados em intervalos frequentes
      // Intervalos mais curtos para garantir melhor compatibilidade
      const timeSlice = (this.isIOS || this.isSafari || this.isMacOS) ? 500 : 1000;

      // Configurar um timeout de segurança para gravações longas (5 minutos)
      this.timeoutId = setTimeout(() => {
        console.log("[AudioRecorder] Timeout de segurança atingido");
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.stopRecording();
        }
      }, 5 * 60 * 1000);

      // Verificar estado do MediaRecorder antes de iniciar
      if (this.mediaRecorder.state === 'inactive') {
        // Iniciar gravação com coleta frequente
        this.mediaRecorder.start(timeSlice);
        console.log('Gravação iniciada com sucesso');
        return true;
      } else {
        console.warn(`[AudioRecorder] MediaRecorder já está em estado: ${this.mediaRecorder.state}`);
        this.isRecording = false;
        return false;
      }
      
    } catch (error) {
      console.error('[AudioRecorder] Erro ao iniciar gravação:', error);
      this._cleanupResources();
      this.isRecording = false;

      // Retorno mais detalhado do erro
      throw error;
    }
  }

  async stopRecording() {
    return new Promise((resolve, reject) => {
      try {
        if (!this.isRecording) {
          console.warn('[AudioRecorder] Tentativa de parar gravação que não está ativa');
          reject(new Error('Gravador não está ativo'));
          return;
        }
        
        // Definir estado como não gravando
        this.isRecording = false;

        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }

        if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
          console.warn('[AudioRecorder] Tentativa de parar gravação inativa');
          this._cleanupResources();
          reject(new Error('Gravador não está ativo'));
          return;
        }

        // Verificar duração mínima (para evitar cliques acidentais)
        const recordingDuration = new Date() - this.recordingStartTime;
        console.log(`[AudioRecorder] Duração da gravação: ${recordingDuration}ms`);

        if (recordingDuration < 500) {
          console.warn('[AudioRecorder] Gravação muito curta, descartando');
          this._cleanupResources();
          reject(new Error('Gravação muito curta'));
          return;
        }

        // Função para processar os chunks de áudio após o stop
        const processRecording = () => {
          try {
            // Aguardar um pequeno atraso para garantir que todos os chunks sejam coletados
            setTimeout(async () => {
              try {
                console.log(`[AudioRecorder] Processando ${this.audioChunks.length} chunks coletados.`);

                // Se não temos chunks ou a duração é muito curta, rejeitar
                if (this.audioChunks.length === 0) {
                  console.warn('[AudioRecorder] Nenhum dado de áudio coletado');
                  this._cleanupResources();
                  reject(new Error('Nenhum áudio foi gravado'));
                  return;
                }
                
                // Criar um log detalhado dos chunks para diagnóstico
                let totalSize = 0;
                this.audioChunks.forEach((chunk, index) => {
                  totalSize += chunk.size;
                  console.log(`[AudioRecorder] Chunk ${index + 1}: ${chunk.size} bytes, tipo: ${chunk.type}`);
                });
                console.log(`[AudioRecorder] Total de chunks: ${this.audioChunks.length}, tamanho total: ${totalSize} bytes`);

                // Criar o blob e converter para formato universal, se necessário
                let finalBlob = this._createFinalAudioBlob();
                console.log(`[AudioRecorder] Gravação finalizada (pré-processamento): ${finalBlob.size} bytes, tipo: ${finalBlob.type}`);
                
                // Verificar se precisamos converter para formato universal (MP3)
                if (this.isMacOS || this.isSafari || this.isIOS) {
                  try {
                    finalBlob = await this._normalizeAudioFormat(finalBlob);
                    console.log(`[AudioRecorder] Áudio normalizado para compatibilidade: ${finalBlob.size} bytes, tipo: ${finalBlob.type}`);
                  } catch (conversionError) {
                    console.warn('[AudioRecorder] Falha na normalização, usando blob original:', conversionError);
                  }
                }

                this._cleanupResources();
                resolve(finalBlob);
              } catch (err) {
                console.error('[AudioRecorder] Erro ao processar gravação:', err);
                this._cleanupResources();
                reject(err);
              }
            }, 500); // Aumentar o atraso para garantir coleta completa
          } catch (error) {
            console.error('[AudioRecorder] Erro ao processar gravação:', error);
            this._cleanupResources();
            reject(error);
          }
        };

        // Adicionar um último evento dataavailable forçado para garantir que todos os dados sejam capturados
        this.mediaRecorder.requestData();

        // Agora adicionamos o listener de stop para processar após parar
        this.mediaRecorder.addEventListener('stop', processRecording, { once: true });

        // Finalmente paramos a gravação
        this.mediaRecorder.stop();
      } catch (error) {
        console.error('[AudioRecorder] Erro ao parar gravação:', error);
        this.isRecording = false;
        this._cleanupResources();
        reject(error);
      }
    });
  }

  cancelRecording() {
    try {
      if (!this.isRecording) {
        console.warn('[AudioRecorder] Tentativa de cancelar gravação que não está ativa');
        return true;
      }
      
      this.isRecording = false;
      
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }

      console.log('[AudioRecorder] Cancelando gravação');
      this._cleanupResources();
      return true;
    } catch (error) {
      console.error('[AudioRecorder] Erro ao cancelar gravação:', error);
      this.isRecording = false;
      this._cleanupResources();
      return false;
    }
  }

  getRecordingState() {
    if (!this.isRecording) return 'inactive';
    return this.mediaRecorder ? this.mediaRecorder.state : 'inactive';
  }

  async prepareForUpload(audioBlob) {
    try {
      // Verificar se o blob é válido e tem tamanho adequado
      if (!audioBlob || audioBlob.size < 500) {
        console.warn(`[AudioRecorder] Blob inválido ou muito pequeno: ${audioBlob?.size || 0} bytes`);
        throw new Error('Áudio inválido ou muito pequeno');
      }

      console.log(`[AudioRecorder] Preparando blob para upload: ${audioBlob.size} bytes, tipo: ${audioBlob.type}`);

      // Se estamos em Mac/Safari, já podemos ter convertido para um formato universal
      let processedBlob = audioBlob;
      
      // Se ainda assim não for MP3 ou formato compatível, tentar converter
      if (!processedBlob.type.includes('mp3') && !processedBlob.type.includes('mpeg')) {
        try {
          processedBlob = await this._normalizeAudioFormat(processedBlob);
          console.log(`[AudioRecorder] Blob convertido para compatibilidade: ${processedBlob.size} bytes, tipo: ${processedBlob.type}`);
        } catch (err) {
          console.warn("[AudioRecorder] Não foi possível converter o áudio para um formato universal:", err);
          // Continuar com o blob original, mas ajustar o tipo para MP3 para forçar o processamento correto
          processedBlob = new Blob([audioBlob], { type: 'audio/mp3' });
        }
      }

      // Obter a extensão correta baseada no tipo MIME
      const extension = 'mp3'; // Forçar MP3 para maior compatibilidade
      // Mantém o nome com o formato original "audio-record-site" para preservar a lógica existente
      const filename = `audio-record-site-${new Date().getTime()}.${extension}`;

      console.log(`[AudioRecorder] Arquivo preparado: ${filename}, tipo: ${processedBlob.type}, tamanho: ${processedBlob.size} bytes`);

      return new File([processedBlob], filename, {
        type: 'audio/mp3', // Forçamos o tipo para MP3, independente do blob real
        lastModified: new Date().getTime()
      });
    } catch (error) {
      console.error('[AudioRecorder] Erro ao preparar áudio para upload:', error);
      throw new Error('Falha ao processar o áudio gravado');
    }
  }

  // Métodos privados auxiliares

  _cleanupResources() {
    console.log('[AudioRecorder] Limpando recursos');

    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (err) {
          console.warn('[AudioRecorder] Erro ao parar track:', err);
        }
      });
      this.stream = null;
    }

    if (this.audioContext) {
      try {
        if (this.audioContext.state !== 'closed') {
          this.audioContext.close().catch(err =>
            console.warn('[AudioRecorder] Erro ao fechar AudioContext:', err)
          );
        }
      } catch (err) {
        console.warn('[AudioRecorder] Erro ao fechar AudioContext:', err);
      }
      this.audioContext = null;
    }

    this.mediaRecorder = null;
  }

  _getBestSupportedMimeType() {
    // Lista de formatos em ordem de preferência
    let preferredTypes = [
      'audio/mp3',               // Forçar MP3 como primeira opção para compatibilidade universal
      'audio/mpeg',              // Alternativa MP3
      'audio/webm;codecs=opus',  // WebM é bem suportado em Chrome/Firefox
      'audio/webm',              
      'audio/aac',               // Para iOS
      'audio/mp4',               // Boa opção para Safari/iOS
      'audio/ogg;codecs=opus',   
      'audio/ogg',               
      'audio/wav',               
      ''                         // Deixar o navegador escolher
    ];

    // Para iOS/Safari/Mac, priorizar formatos compatíveis
    if (this.isIOS || this.isSafari || this.isMacOS) {
      preferredTypes = [
        'audio/mp3',
        'audio/mpeg',
        'audio/aac',
        'audio/mp4',
        ...preferredTypes
      ];
    }

    for (const mimeType of preferredTypes) {
      if (!mimeType || MediaRecorder.isTypeSupported(mimeType)) {
        console.log(`[AudioRecorder] Formato suportado encontrado: ${mimeType || 'default'}`);
        return mimeType;
      }
    }

    console.log('[AudioRecorder] Nenhum formato específico suportado, usando padrão do navegador');
    return '';  // Deixar o navegador decidir como último recurso
  }

  _createFinalAudioBlob() {
    // Se não temos chunks, algo deu errado
    if (this.audioChunks.length === 0) {
      throw new Error('Nenhum áudio foi gravado');
    }

    // Determinar o tipo MIME para o blob final - forçar MP3 para compatibilidade
    let mimeType = 'audio/mp3';

    // Se temos chunks com tipo definido e não estamos em Mac/Safari
    if (!this.isMacOS && !this.isSafari && this.audioChunks[0].type && !this.audioChunks[0].type.includes('mp3')) {
      mimeType = this.audioChunks[0].type;
    }

    console.log(`[AudioRecorder] Criando blob final com ${this.audioChunks.length} chunks, tipo: ${mimeType}`);

    return new Blob(this.audioChunks, { type: mimeType });
  }

  async _initAudioContext() {
    try {
      // Para dispositivos Apple/Safari, precisamos inicializar o AudioContext antes
      const AudioContext = window.AudioContext || window.webkitAudioContext;

      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioContext({ sampleRate: 44100 });
      }

      // Criar e iniciar um oscilador silencioso para "ativar" o contexto de áudio
      const oscillator = this.audioContext.createOscillator();
      oscillator.frequency.value = 0; // Silencioso
      oscillator.connect(this.audioContext.destination);
      oscillator.start(0);
      oscillator.stop(0.1); // Parar após 100ms

      // Ativar o contexto se estiver suspenso
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('[AudioRecorder] AudioContext resumido para iOS/Safari/Mac');
      }

      console.log('[AudioRecorder] AudioContext inicializado para iOS/Safari/Mac');
    } catch (err) {
      console.warn('[AudioRecorder] Erro ao inicializar AudioContext:', err);
      // Continuar mesmo com erro, pois pode funcionar sem isso
    }
  }

  // Método para normalizar o formato de áudio para compatibilidade universal
  async _normalizeAudioFormat(audioBlob) {
    return new Promise((resolve, reject) => {
      try {
        // Verificar se o navegador suporta conversão via AudioContext
        if (!window.AudioContext && !window.webkitAudioContext) {
          console.warn('[AudioRecorder] AudioContext não suportado para conversão');
          resolve(audioBlob); // Retornar o blob original
          return;
        }

        console.log('[AudioRecorder] Iniciando normalização de áudio para compatibilidade universal');
        
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        
        // Criar um objeto URL do blob para carregar como fonte de áudio
        const blobUrl = URL.createObjectURL(audioBlob);
        
        // Carregar o áudio como um buffer
        fetch(blobUrl)
          .then(response => response.arrayBuffer())
          .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
          .then(audioBuffer => {
            // Criar um novo buffer de áudio para resampling se necessário
            const sampleRate = 44100; // Taxa de amostragem padrão para máxima compatibilidade
            const numberOfChannels = 1; // Mono é mais compatível entre plataformas
            
            // Verificar se precisamos realmente fazer resampling
            let resampledBuffer = audioBuffer;
            
            if (audioBuffer.sampleRate !== sampleRate || audioBuffer.numberOfChannels !== numberOfChannels) {
              console.log(`[AudioRecorder] Realizando resampling de ${audioBuffer.sampleRate}Hz/${audioBuffer.numberOfChannels} canais para ${sampleRate}Hz/${numberOfChannels} canal`);
              
              // Criar novo buffer com configurações padronizadas
              const offlineContext = new OfflineAudioContext(numberOfChannels, audioBuffer.duration * sampleRate, sampleRate);
              const source = offlineContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(offlineContext.destination);
              source.start(0);
              
              // Renderizar e processar
              offlineContext.startRendering().then(normalizedBuffer => {
                this._encodeToMP3(normalizedBuffer, resolve, reject);
              }).catch(err => {
                console.error('[AudioRecorder] Erro no resampling:', err);
                resolve(audioBlob); // Fallback para blob original
              });
            } else {
              // Se já está no formato correto, codificar diretamente
              this._encodeToMP3(resampledBuffer, resolve, reject);
            }
          })
          .catch(err => {
            console.error('[AudioRecorder] Erro ao processar áudio para normalização:', err);
            URL.revokeObjectURL(blobUrl);
            resolve(audioBlob); // Fallback para blob original
          });
      } catch (error) {
        console.error('[AudioRecorder] Erro na conversão de áudio:', error);
        resolve(audioBlob); // Retornar o blob original em caso de erro
      }
    });
  }

  // Método auxiliar para codificar para MP3
  _encodeToMP3(audioBuffer, resolve, reject) {
    try {
      // Como não temos um codificador MP3 nativo no navegador,
      // vamos criar um WAV de alta qualidade em formato PCM como alternativa
      // e mudar seu MIME type para forçar o processamento posterior pelo backend
      
      const interleaved = this._interleaveChannels(audioBuffer);
      const dataView = this._encodeWAV(interleaved, audioBuffer.sampleRate);
      const audioBlob = new Blob([dataView], { type: 'audio/mp3' });
      
      console.log(`[AudioRecorder] Áudio normalizado criado: ${audioBlob.size} bytes, tipo: ${audioBlob.type}`);
      resolve(audioBlob);
    } catch (err) {
      console.error('[AudioRecorder] Erro na codificação de áudio:', err);
      reject(err);
    }
  }

  // Métodos auxiliares para criar WAV de alta qualidade
  _interleaveChannels(audioBuffer) {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numberOfChannels;
    const result = new Float32Array(length);
    let offset = 0;
    let channel = 0;
    
    // Converter para mono caso seja estéreo
    if (numberOfChannels === 1) {
      return audioBuffer.getChannelData(0);
    }
    
    // Criar um buffer mono combinando todos os canais
    for (let i = 0; i < audioBuffer.length; i++) {
      for (channel = 0; channel < numberOfChannels; channel++) {
        result[offset++] = audioBuffer.getChannelData(channel)[i];
      }
    }
    
    return result;
  }

  _encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // RIFF identifier
    this._writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 36 + samples.length * 2, true);
    // RIFF type
    this._writeString(view, 8, 'WAVE');
    // format chunk identifier
    this._writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (1 = PCM)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, 1, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    this._writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, samples.length * 2, true);

    this._floatTo16BitPCM(view, 44, samples);

    return view;
  }

  _floatTo16BitPCM(output, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }

  _writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

export default AudioRecorderService;
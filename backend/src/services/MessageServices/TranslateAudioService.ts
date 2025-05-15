const speech = require("@google-cloud/speech").v1p1beta1;
const client = new speech.SpeechClient();

const fs = require("fs");

const TranslateAudioService = async filePath => {
  try {
    const file = fs.readFileSync(filePath);
    const audioBytes = file.toString("base64");

    const audio = {
      content: audioBytes
    };

    const config = {
      encoding: "MP3",
      sampleRateHertz: 44100,
      languageCode: "pt-BR",
      audioChannelCount: 1,
      enableWordTimeOffsets: true,
      model: "latest_long",
      enableWordConfidence: true,
      enableSpokenPunctuation: false
    };

    const request = {
      audio,
      config
    };

    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join("\n");

    return transcription;
  } catch (error) {
    console.error("Erro ao transcrever o áudio:", error);
    return null;
  }
};

export default TranslateAudioService;

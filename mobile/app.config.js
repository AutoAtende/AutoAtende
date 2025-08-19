export default {
  expo: {
    name: "AutoAtende",
    slug: "autoatende-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.autoatende.mobile",
      buildNumber: "1.0.0",
      infoPlist: {
        NSCameraUsageDescription: "Este app precisa acessar a câmera para capturar fotos e vídeos para envio aos clientes.",
        NSMicrophoneUsageDescription: "Este app precisa acessar o microfone para gravar mensagens de áudio.",
        NSPhotoLibraryUsageDescription: "Este app precisa acessar a galeria para enviar imagens aos clientes."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.autoatende.mobile",
      versionCode: 1,
      permissions: [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "NOTIFICATIONS",
        "VIBRATE",
        "WAKE_LOCK"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-notifications",
      [
        "expo-camera",
        {
          "cameraPermission": "Permitir que $(PRODUCT_NAME) acesse sua câmera para capturar fotos e vídeos."
        }
      ],
      [
        "expo-media-library",
        {
          "photosPermission": "Permitir que $(PRODUCT_NAME) acesse suas fotos para envio aos clientes.",
          "savePhotosPermission": "Permitir que $(PRODUCT_NAME) salve fotos na galeria."
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};
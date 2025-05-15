import React from "react";
import { toast } from '../../helpers/toast';
import ErrorPage from '../../layout/ErrorPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0,
      deviceInfo: null,
      browserInfo: null
    };
  }

  componentDidMount() {
    this.collectDeviceInfo();
  }

  collectDeviceInfo() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const vendor = navigator.vendor;
    
    const deviceInfo = {
      isIOS: /iPad|iPhone|iPod/.test(userAgent) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1),
      isSafari: /^((?!chrome|android).)*safari/i.test(userAgent),
      isChrome: /CriOS|Chrome/.test(userAgent) && vendor === "Google Inc.",
      userAgent,
      platform,
      vendor,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
      systemFeatures: {
        notificationSupport: 'Notification' in window,
        serviceWorkerSupport: 'serviceWorker' in navigator,
        webSocketSupport: 'WebSocket' in window,
        indexedDBSupport: 'indexedDB' in window,
        localStorageSupport: (() => {
          try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
          } catch (e) {
            return false;
          }
        })()
      }
    };

    this.setState({ deviceInfo });
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const { deviceInfo } = this.state;
    
    const errorDetails = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo?.componentStack,
      device: deviceInfo,
      route: window.location.pathname,
      localStorage: this.getSafeLocalStorage(),
      features: {
        notifications: this.checkNotificationPermission(),
        cookies: navigator.cookieEnabled,
      }
    };

    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
      errorDetails
    }));

    if (process.env.NODE_ENV === 'development') {
      console.group('📱 Detalhes do Erro iOS:');
      console.log('📍 Contexto do Dispositivo:', {
        isIOS: deviceInfo?.isIOS,
        browser: deviceInfo?.isSafari ? 'Safari' : deviceInfo?.isChrome ? 'Chrome' : 'Outro',
        userAgent: deviceInfo?.userAgent
      });
      console.log('❌ Tipo do Erro:', error.name);
      console.log('💬 Mensagem:', error.message);
      console.log('📚 Stack:', error.stack);
      console.log('🔍 Component Stack:', errorInfo?.componentStack);
      console.log('⚙️ Recursos do Sistema:', deviceInfo?.systemFeatures);
      console.groupEnd();
    }

    this.showErrorNotification();
  }

  checkNotificationPermission() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }

  getSafeLocalStorage() {
    try {
      const relevantKeys = ['token', 'companyId', 'userId', 'language'];
      return relevantKeys.reduce((acc, key) => {
        acc[key] = localStorage.getItem(key) ? 'present' : 'absent';
        return acc;
      }, {});
    } catch (e) {
      return 'localStorage indisponível';
    }
  }

  showErrorNotification() {
    const { deviceInfo } = this.state;
    let message = 'Ocorreu um erro inesperado.';
    
    if (deviceInfo?.isIOS) {
      message += ' Detectamos que você está usando um dispositivo iOS.';
      if (deviceInfo?.isSafari) {
        message += ' Recomendamos tentar usar o Chrome para iOS.';
      }
    }
    
    toast.error(message);
  }

  handleReload = () => {
    try {
      const essentialData = ['token', 'companyId', 'userId'].reduce((acc, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      }, {});
      
      localStorage.clear();
      
      Object.entries(essentialData).forEach(([key, value]) => {
        if (value) localStorage.setItem(key, value);
      });
      
      window.location.reload(true);
    } catch (err) {
      console.error('Erro durante reload:', err);
      window.location.href = '/';
    }
  };



  render() {
    const { hasError, error, errorDetails, deviceInfo } = this.state;
  
    if (hasError) {
      let errorMessage = 'Ocorreu um erro inesperado na aplicação.';
      
      if (deviceInfo?.isIOS) {
        errorMessage = `Detectamos um erro no seu dispositivo iOS ${deviceInfo.isSafari ? 'usando Safari' : 'usando Chrome'}. `;
        errorMessage += deviceInfo.isSafari 
          ? 'Recomendamos tentar usar o Chrome como alternativa.'
          : 'Por favor, verifique se seu navegador está atualizado.';
      }
  
      const isDevelopment = process.env.NODE_ENV === 'development';
      const isDevUrl = window.location.hostname === 'dev.autoatende.com';
      const showTechnicalDetails = isDevelopment || isDevUrl;
  
      const technicalDetails = showTechnicalDetails
        ? {
            error: error?.toString(),
            componentStack: errorDetails?.componentStack,
            deviceInfo: JSON.stringify(deviceInfo, null, 2),
            systemFeatures: JSON.stringify(deviceInfo?.systemFeatures, null, 2)
          }
        : null;
  

  
      return (
        <ErrorPage
          errorMessage={errorMessage}
          errorDetails={technicalDetails}
          onReload={this.handleReload}
          deviceInfo={deviceInfo}
        />
      );
    }
  
    return this.props.children;
  }
}

export default ErrorBoundary;
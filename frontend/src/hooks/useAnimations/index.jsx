import { useSpring } from 'react-spring';

export const useMessageAnimation = (delay = 0) => 
  useSpring({
    from: { 
      opacity: 0, 
      transform: 'translateY(20px)'
    },
    to: { 
      opacity: 1, 
      transform: 'translateY(0)'
    },
    delay,
    config: { 
      tension: 300, 
      friction: 20 
    }
  });

export const useFloatingAnimation = () => 
  useSpring({
    from: { transform: 'translateY(0)' },
    to: async (next) => {
      while (true) {
        await next({ transform: 'translateY(-4px)' });
        await next({ transform: 'translateY(4px)' });
      }
    },
    config: { 
      tension: 300, 
      friction: 10 
    }
  });

export const useTypingAnimation = () => 
  useSpring({
    from: { width: '0%' },
    to: async (next) => {
      while (true) {
        await next({ width: '100%' });
        await next({ width: '0%' });
      }
    },
    config: { duration: 1000 }
  });
'use client'

import { ReactNode } from 'react'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { AuthProvider } from '@/context/Auth/AuthContext'
import { ColorModeProvider, useColorMode } from '@/context/ColorModeContext'
import { PublicSettingsProvider } from '@/context/PublicSettingsContext'
import { SocketProvider } from '@/context/SocketContext'

interface ProvidersProps {
  children: ReactNode
}

function ThemeWrapper({ children }: { children: ReactNode }) {
  const { mode } = useColorMode();
  
  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ColorModeProvider>
      <PublicSettingsProvider>
        <ThemeWrapper>
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            autoHideDuration={3000}
          >
            <AuthProvider>
              <SocketProvider>
                {children}
              </SocketProvider>
            </AuthProvider>
          </SnackbarProvider>
        </ThemeWrapper>
      </PublicSettingsProvider>
    </ColorModeProvider>
  )
}
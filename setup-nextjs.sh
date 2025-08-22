#!/bin/bash

# Script para setup inicial do Next.js SSR

echo "🚀 Iniciando setup do Next.js SSR..."

# Criar diretório para o novo frontend
cd /Users/lucassaud/Documents/GitHub/Fonte/
mkdir -p frontend-ssr
cd frontend-ssr

echo "📦 Criando projeto Next.js..."

# Criar projeto Next.js com configurações otimizadas
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

echo "🔧 Configurando dependências essenciais..."

# Instalar dependências essenciais do projeto atual
npm install \
  axios \
  socket.io-client \
  react-hook-form \
  @hookform/resolvers \
  yup \
  date-fns \
  clsx \
  @headlessui/react \
  @heroicons/react \
  notistack \
  zustand \
  swr

echo "🎨 Configurando Tailwind CSS..."

# Criar configuração customizada do Tailwind
cat > tailwind.config.ts << 'EOF'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        sidebar: '#1a1a1a',
        background: '#f8fafc',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
export default config
EOF

echo "⚙️ Configurando Next.js..."

# Criar next.config.js otimizado
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@headlessui/react', '@heroicons/react'],
  },
  
  // Configuração para integração com o backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/:path*',
      },
    ];
  },
  
  // Otimizações de performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configurações de imagem
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Bundle analyzer (opcional)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      );
      return config;
    },
  }),
};

module.exports = nextConfig;
EOF

echo "🏗️ Criando estrutura de pastas..."

# Criar estrutura de pastas
mkdir -p src/{components,lib,hooks,services,types,store}
mkdir -p src/components/{ui,forms,layout,features}
mkdir -p src/app/{dashboard,login,contacts,tickets}

echo "🔐 Configurando variáveis de ambiente..."

# Criar arquivo de ambiente
cat > .env.local << 'EOF'
# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Other configurations
NEXT_PUBLIC_APP_NAME="AutoAtende"
NEXT_PUBLIC_COMPANY_NAME="AutoAtende"
EOF

echo "📝 Criando tipos TypeScript..."

# Criar tipos básicos
cat > src/types/index.ts << 'EOF'
export interface User {
  id: number;
  name: string;
  email: string;
  profile: string;
  companyId: number;
}

export interface Company {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  status: boolean;
}

export interface Ticket {
  id: number;
  status: string;
  lastMessage: string;
  contact: Contact;
  user?: User;
  queue?: Queue;
  updatedAt: string;
}

export interface Contact {
  id: number;
  name: string;
  number: string;
  profilePicUrl?: string;
}

export interface Queue {
  id: number;
  name: string;
  color: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}
EOF

echo "🛠️ Criando serviços de API..."

# Criar serviço de API
cat > src/services/api.ts << 'EOF'
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 10000,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
EOF

echo "🎯 Criando layout principal..."

# Criar layout principal
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AutoAtende - Sistema de Atendimento',
  description: 'Sistema completo de atendimento e gestão de clientes',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
EOF

echo "✅ Setup concluído!"
echo ""
echo "🎉 Próximos passos:"
echo "1. cd frontend-ssr"
echo "2. npm run dev"
echo "3. Abrir http://localhost:3000"
echo ""
echo "📚 Para desenvolvimento:"
echo "- Componentes: src/components/"
echo "- Páginas: src/app/"
echo "- API: src/services/"
echo "- Tipos: src/types/"
echo ""
echo "🔗 Documentação do plano completo: MIGRATION_PLAN.md"
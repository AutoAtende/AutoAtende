# Plano de Migração Frontend para Server-Side Rendering

## Análise Atual
- Frontend React com +100 dependências pesadas
- Bundle muito grande afetando performance no cliente
- Muitos componentes complexos (Material-UI, React Query, etc.)

## Estratégia Recomendada: Next.js

### Fase 1: Preparação (1-2 dias)
1. **Criar novo projeto Next.js**
   ```bash
   npx create-next-app@latest frontend-ssr --typescript --tailwind --eslint
   ```

2. **Análise de dependências**
   - Identificar dependências essenciais vs desnecessárias
   - Verificar compatibilidade com SSR
   - Planejar substituições quando necessário

### Fase 2: Configuração Base (2-3 dias)
1. **Setup do ambiente**
   - Configurar next.config.js
   - Setup do Tailwind CSS
   - Configurar variáveis de ambiente

2. **Estrutura de pastas**
   ```
   frontend-ssr/
   ├── pages/           # Rotas automáticas
   ├── components/      # Componentes reutilizáveis
   ├── lib/            # Utilitários e configurações
   ├── hooks/          # Custom hooks
   ├── services/       # API calls
   └── public/         # Assets estáticos
   ```

3. **Configurar integração com backend**
   - API Routes para proxy do backend
   - Configurar CORS adequadamente
   - Setup de autenticação SSR

### Fase 3: Migração Gradual (1-2 semanas)
1. **Prioridade por complexidade:**
   - Login/Auth (crítico)
   - Dashboard principal
   - Listagens simples (usuários, contatos)
   - Funcionalidades complexas (chat, tickets)

2. **Componentes por categoria:**
   - **Forms**: Migrar para React Hook Form (mais leve)
   - **Tables**: Usar tabelas nativas com paginação SSR
   - **Modals**: Converter para server actions quando possível
   - **Charts**: Lazy load no cliente apenas quando necessário

### Fase 4: Otimizações (3-5 dias)
1. **Performance**
   - Implementar ISR (Incremental Static Regeneration)
   - Code splitting inteligente
   - Lazy loading de componentes pesados
   - Otimização de imagens com next/image

2. **SEO e UX**
   - Meta tags dinâmicas
   - Loading states otimizados
   - Progressive enhancement

## Benefícios Esperados

### Performance
- **Redução de 70-80% no JavaScript inicial**
- **Time to First Byte (TTFB) < 200ms**
- **First Contentful Paint (FCP) < 1s**

### Experiência do Usuário
- **Carregamento instantâneo percebido**
- **Melhor experiência em dispositivos lentos**
- **Funcionalidade offline básica**

### SEO
- **Indexação completa pelo Google**
- **Meta tags dinâmicas**
- **Structured data automático**

## Dependências a Reduzir/Substituir

### Pesadas → Alternativas Leves
- `@mui/material` → TailwindUI + Headless UI
- `react-query` → SWR (mais leve) ou fetch nativo
- `recharts` → Chart.js com lazy loading
- `react-spring` → CSS animations + Framer Motion (seletivo)

### Manter (SSR-friendly)
- `react-hook-form` ✅
- `axios` ✅ (mas considerar fetch nativo)
- `date-fns` ✅
- `socket.io-client` ✅ (client-side apenas)

## Estrutura de Implementação

### 1. Layout Principal
```javascript
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

### 2. Páginas com SSR
```javascript
// app/dashboard/page.js
export default async function Dashboard() {
  const data = await fetch('http://backend:3000/api/dashboard', {
    cache: 'no-store' // ou revalidate: 60
  })
  const dashboardData = await data.json()
  
  return <DashboardComponent data={dashboardData} />
}
```

### 3. Componentes Interativos (Client-side)
```javascript
// components/ChatWidget.js
'use client'
import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

export default function ChatWidget() {
  // Lógica client-side apenas quando necessário
}
```

## Cronograma Estimado
- **Total: 3-4 semanas**
- **MVP funcional: 2 semanas**
- **Migração completa: 4 semanas**
- **Otimizações finais: 1 semana**

## Próximos Passos
1. Criar branch `migration/nextjs-ssr`
2. Setup inicial do Next.js
3. Migrar componente mais crítico (Login)
4. Testar integração com backend
5. Migração gradual por módulos
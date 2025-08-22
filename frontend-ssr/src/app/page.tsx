import { redirect } from 'next/navigation'

// Página raiz que redireciona para o dashboard
export default function HomePage() {
  redirect('/dashboard')
}
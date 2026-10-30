import type { ReactNode } from 'react'
import { AuthProvider } from '../features/auth/context/AuthProvider.jsx'

export default function AppProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

import type { ReactNode } from 'react'
import { AuthProvider } from '../auth/AuthProvider.jsx'

export default function AppProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

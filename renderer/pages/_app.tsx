import React from 'react'
import type { AppProps } from 'next/app'
import { BLEProvider } from '../contexts/BLEContext'
import { DialogProvider } from '../contexts/DialogContext'
import { AuthProvider } from '../contexts/AuthContext'

import '../styles/globals.css'

function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <BLEProvider>
        <DialogProvider>

          <div className="min-h-screen relative">
            <Component {...pageProps} />
          </div>

        </DialogProvider>
      </BLEProvider>
    </AuthProvider>
  )
}

export default App

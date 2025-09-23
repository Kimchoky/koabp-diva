import React from 'react'
import type { AppProps } from 'next/app'
import { BLEProvider } from '../contexts/BLEContext'
import { DialogProvider } from '../contexts/DialogContext'

import '../styles/globals.css'
import ComponentDemo from "../components/ComponentDemo";

function App({ Component, pageProps }: AppProps) {
  return (
    <BLEProvider>
      <DialogProvider>

        <div className="min-h-screen relative">
          <Component {...pageProps} />
        </div>

      </DialogProvider>
    </BLEProvider>
  )
}

export default App

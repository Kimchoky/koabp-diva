import React from 'react'
import type { AppProps } from 'next/app'
import { BLEProvider } from '../contexts/BLEContext'
import { DialogProvider } from '../contexts/DialogContext'

import '../styles/globals.css'
import DialogDemo from "../components/DialogDemo";

function App({ Component, pageProps }: AppProps) {
  return (
    <BLEProvider>
      <DialogProvider>

        <div className="min-h-screen relative">
          <Component {...pageProps} />
          <DialogDemo />
        </div>

      </DialogProvider>
    </BLEProvider>
  )
}

export default App

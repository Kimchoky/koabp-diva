import React from 'react'
import type { AppProps } from 'next/app'
import { BLEProvider } from '../contexts/BLEContext'

import '../styles/globals.css'

function App({ Component, pageProps }: AppProps) {
  return (
    <BLEProvider>
      <Component {...pageProps} />
    </BLEProvider>
  )
}

export default App

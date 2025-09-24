import React from 'react'
import type {AppProps} from 'next/app'
import {BLEProvider} from '../contexts/BLEContext'
import {DialogProvider} from '../contexts/DialogContext'
import {AuthProvider} from '../contexts/AuthContext'

import '../styles/globals.css'
import {VStack} from "../components/ui/Stack";
import LogWindow from "../components/ui/LogWindow";
import ThemeToggle from "../components/ThemeToggle";

function App({Component, pageProps}: AppProps) {
  return (
    <AuthProvider>
      <BLEProvider>
        <DialogProvider>

          <div className="min-h-screen relative">
            <Component {...pageProps} />
            <ThemeToggle/>
            <LogWindow />
          </div>

        </DialogProvider>
      </BLEProvider>
    </AuthProvider>
  )
}

export default App

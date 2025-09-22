import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useBLE } from '../contexts/BLEContext'

export default function BLETestPage() {
  const {
    bleState,
    logs,
    startScan,
    stopScan,
    connect,
    disconnect,
    discoverServices,
    writeData,
    readData,
    subscribeNotifications,
    unsubscribeNotifications,
    clearLogs,
  } = useBLE()

  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [selectedCharacteristic, setSelectedCharacteristic] = useState<string>('')
  const [writeDataInput, setWriteDataInput] = useState<string>('')
  const [subscribedCharacteristics, setSubscribedCharacteristics] = useState<Set<string>>(new Set())

  const handleStartScan = async () => {
    await startScan(10000) // 10초 스캔
  }

  const handleConnect = async () => {
    if (selectedDevice) {
      await connect(selectedDevice)
    }
  }

  const handleDiscoverServices = async () => {
    await discoverServices()
  }

  const handleWriteData = async (paramInput?: string) => {
    if (selectedCharacteristic && (paramInput || writeDataInput)) {
      try {
        const data = (paramInput || writeDataInput).split(',').map(hex => {
          hex = hex.trim()
          if (hex.startsWith('0x'))
            hex = hex.slice(2)

          return parseInt(hex, 16)
        })
        await writeData(selectedCharacteristic, data)
      } catch (error) {
        console.error('Invalid hex data:', error)
      }
    }
  }

  const handleReadData = async () => {
    if (selectedCharacteristic) {
      await readData(selectedCharacteristic)
    }
  }

  const handleSubscribeNotifications = async () => {
    if (selectedCharacteristic) {
      await subscribeNotifications(selectedCharacteristic)
      setSubscribedCharacteristics(prev => new Set(prev).add(selectedCharacteristic))
    }
  }

  const handleUnsubscribeNotifications = async () => {
    if (selectedCharacteristic) {
      await unsubscribeNotifications(selectedCharacteristic)
      setSubscribedCharacteristics(prev => {
        const newSet = new Set(prev)
        newSet.delete(selectedCharacteristic)
        return newSet
      })
    }
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'poweredOn': return 'text-green-600'
      case 'poweredOff': return 'text-red-600'
      case 'unknown': return 'text-gray-600'
      default: return 'text-yellow-600'
    }
  }

  return (
    <React.Fragment>
      <Head>
        <title>BLE Test - Nextron App</title>
      </Head>
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">BLE Test Dashboard</h1>

          <div className="mb-4">
            <Link href="/home" className="text-blue-600 hover:text-blue-800 underline">
              ← Back to Home
            </Link>
          </div>

          {/* Status Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">BLE Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-gray-600">State:</span>
                <div className={`font-semibold ${getStateColor(bleState.state)}`}>
                  {bleState.state}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Scanning:</span>
                <div className={`font-semibold ${bleState.isScanning ? 'text-blue-600' : 'text-gray-600'}`}>
                  {bleState.isScanning ? 'Yes' : 'No'}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Connected:</span>
                <div className={`font-semibold ${bleState.isConnected ? 'text-green-600' : 'text-gray-600'}`}>
                  {bleState.isConnected ? 'Yes' : 'No'}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Device:</span>
                <div className="font-semibold text-gray-800 truncate">
                  {bleState.connectedDevice || 'None'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scan and Connect Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Device Discovery</h2>

              <div className="space-y-4">
                <div className="flex space-x-2">
                  <button
                    onClick={handleStartScan}
                    disabled={bleState.isScanning || bleState.state !== 'poweredOn'}
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    Start Scan
                  </button>
                  <button
                    onClick={stopScan}
                    disabled={!bleState.isScanning}
                    className="bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    Stop Scan
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discovered Devices ({bleState.devices.length})
                  </label>
                  <select
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  >
                    <option value="">Select a device...</option>
                    {bleState.devices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name} ({device.id}) - RSSI: {device.rssi}dBm
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleConnect}
                    disabled={!selectedDevice || bleState.isConnected}
                    className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    Connect
                  </button>
                  <button
                    onClick={disconnect}
                    disabled={!bleState.isConnected}
                    className="bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    Disconnect
                  </button>
                  <button
                    onClick={handleDiscoverServices}
                    disabled={!bleState.isConnected}
                    className="bg-purple-500 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    Discover Services
                  </button>
                </div>
              </div>
            </div>

            {/* Services and Characteristics Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Services & Characteristics</h2>

              {bleState.services.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Characteristics
                    </label>
                    <select
                      value={selectedCharacteristic}
                      onChange={(e) => setSelectedCharacteristic(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
                    >
                      <option value="">Select a characteristic...</option>
                      {bleState.services.map((service) =>
                        service.characteristics.map((char) => (
                          <option key={char.uuid} value={char.uuid}>
                            {char.uuid} [{char.properties.join(', ')}]
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="text-sm text-gray-600">
                    Services: {bleState.services.length},
                    Total Characteristics: {bleState.services.reduce((total, service) => total + service.characteristics.length, 0)}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  No services discovered yet. Connect to a device and discover services.
                </div>
              )}
            </div>

            {/* Data Operations Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Data Operations</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send Command
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={()=>handleWriteData('0x02, 0x08, 0x11, 0x11, 0x00, 0x00, 0x00, 0x03')}
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    Start BP
                  </button>
                  <button
                    onClick={()=>handleWriteData('0x02, 0x08, 0x11, 0x33, 0x00, 0x00, 0x00, 0x03')}
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    Stop BP
                  </button>
                </div>
              </div>


              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Write Data (hex bytes separated by commas)
                  </label>
                  <input
                    type="text"
                    value={writeDataInput}
                    onChange={(e) => setWriteDataInput(e.target.value)}
                    placeholder="e.g., 01, 02, 03, FF   or  0x01, 0x02, 0xF3, 0x33"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={()=>handleWriteData()}
                    disabled={!selectedCharacteristic || !writeDataInput}
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    Write Data
                  </button>
                  <button
                    onClick={handleReadData}
                    disabled={!selectedCharacteristic}
                    className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    Read Data
                  </button>
                  <button
                    onClick={handleSubscribeNotifications}
                    disabled={!selectedCharacteristic || subscribedCharacteristics.has(selectedCharacteristic)}
                    className="bg-purple-500 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    Subscribe
                  </button>
                  <button
                    onClick={handleUnsubscribeNotifications}
                    disabled={!selectedCharacteristic || !subscribedCharacteristics.has(selectedCharacteristic)}
                    className="bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    Unsubscribe
                  </button>
                </div>

                {subscribedCharacteristics.size > 0 && (
                  <div className="text-sm text-green-600">
                    Subscribed to: {Array.from(subscribedCharacteristics).join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Logs Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Activity Logs</h2>
                <button
                  onClick={clearLogs}
                  className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                >
                  Clear Logs
                </button>
              </div>

              <div className="bg-gray-50 rounded-md p-4 h-64 overflow-y-auto">
                <div className="space-y-1 text-sm font-mono">
                  {logs.length === 0 ? (
                    <div className="text-gray-500">No logs yet...</div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="text-gray-800">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
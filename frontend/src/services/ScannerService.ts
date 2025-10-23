// ScannerService.ts
// Serviço para integração com scanners de documentos (Kodak i2600, etc.)

export interface ScannerDevice {
  id: string
  name: string
  type: 'twain' | 'sane' | 'usb' | 'camera' | 'multifuncional' | 'all-in-one'
  manufacturer?: string
  model?: string
  capabilities?: ScannerCapabilities
  deviceType?: 'scanner' | 'multifunctional' | 'all-in-one' | 'printer-scanner'
}

export interface ScannerCapabilities {
  resolutions: number[]
  colorModes: ('color' | 'grayscale' | 'blackwhite')[]
  pageSizes: string[]
  duplex: boolean
  autoFeed: boolean
}

export interface ScanConfig {
  resolution: number
  colorMode: 'color' | 'grayscale' | 'blackwhite'
  pageSize: string
  quality: number
  autoCrop?: boolean
  autoDeskew?: boolean
  autoRotate?: boolean
}

export interface ScanResult {
  success: boolean
  imageData?: Blob
  imageUrl?: string
  format: string
  width?: number
  height?: number
  error?: string
}

export class ScannerService {
  private static instance: ScannerService
  private scanners: ScannerDevice[] = []
  private isInitialized = false

  static getInstance(): ScannerService {
    if (!ScannerService.instance) {
      ScannerService.instance = new ScannerService()
    }
    return ScannerService.instance
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🔧 Inicializando ScannerService...')
      
      // Detectar scanners disponíveis
      await this.detectScanners()
      
      this.isInitialized = true
      console.log('✅ ScannerService inicializado com sucesso')
      return true
    } catch (error) {
      console.error('❌ Erro ao inicializar ScannerService:', error)
      return false
    }
  }

  async detectScanners(): Promise<ScannerDevice[]> {
    try {
      console.log('🔍 Detectando scanners e impressoras multifuncionais...')
      this.scanners = []

      // 1. Tentar TWAIN (Windows) - Scanners e Multifuncionais
      if (window.electronAPI?.detectTwainScanners) {
        try {
          const twainScanners = await window.electronAPI.detectTwainScanners()
          this.scanners.push(...twainScanners.map((s: any) => ({
            id: `twain_${s.id}`,
            name: s.name,
            type: this.determineDeviceType(s.name, s.manufacturer),
            manufacturer: s.manufacturer,
            model: s.model,
            capabilities: s.capabilities,
            deviceType: this.determineDeviceCategory(s.name, s.manufacturer)
          })))
          console.log('📷 Dispositivos TWAIN detectados:', twainScanners.length)
        } catch (error) {
          console.log('⚠️ TWAIN não disponível:', error)
        }
      }

      // 2. Tentar SANE (Linux) - Scanners e Multifuncionais
      if (window.electronAPI?.detectSaneScanners) {
        try {
          const saneScanners = await window.electronAPI.detectSaneScanners()
          this.scanners.push(...saneScanners.map((s: any) => ({
            id: `sane_${s.id}`,
            name: s.name,
            type: this.determineDeviceType(s.name, s.manufacturer),
            manufacturer: s.manufacturer,
            model: s.model,
            capabilities: s.capabilities,
            deviceType: this.determineDeviceCategory(s.name, s.manufacturer)
          })))
          console.log('📷 Dispositivos SANE detectados:', saneScanners.length)
        } catch (error) {
          console.log('⚠️ SANE não disponível:', error)
        }
      }

      // 3. Detectar Impressoras Multifuncionais
      try {
        const multifuncionais = await this.detectMultifunctionalPrinters()
        this.scanners.push(...multifuncionais)
        console.log('🖨️ Impressoras multifuncionais detectadas:', multifuncionais.length)
      } catch (error) {
        console.log('⚠️ Detecção de multifuncionais falhou:', error)
      }

      // 4. Tentar USB Web API
      try {
        const usbScanners = await this.detectUSBScanners()
        this.scanners.push(...usbScanners)
        console.log('📷 Scanners USB detectados:', usbScanners.length)
      } catch (error) {
        console.log('⚠️ USB Web API não disponível:', error)
      }

      // 5. Fallback: Câmera como scanner
      try {
        const cameraScanner = await this.detectCameraScanner()
        if (cameraScanner) {
          this.scanners.push(cameraScanner)
          console.log('📷 Câmera detectada como scanner')
        }
      } catch (error) {
        console.log('⚠️ Câmera não disponível:', error)
      }

      console.log('📷 Total de dispositivos detectados:', this.scanners.length)
      return this.scanners
    } catch (error) {
      console.error('❌ Erro ao detectar dispositivos:', error)
      return []
    }
  }

  private async detectMultifunctionalPrinters(): Promise<ScannerDevice[]> {
    const multifuncionais: ScannerDevice[] = []
    
    try {
      // Detectar via Windows WMI (se disponível no Electron)
      if (window.electronAPI?.detectMultifunctionalPrinters) {
        const printers = await window.electronAPI.detectMultifunctionalPrinters()
        multifuncionais.push(...printers.map((p: any) => ({
          id: `multifuncional_${p.id}`,
          name: p.name,
          type: 'multifuncional' as const,
          manufacturer: p.manufacturer,
          model: p.model,
          capabilities: {
            resolutions: [150, 300, 600, 1200],
            colorModes: ['color', 'grayscale', 'blackwhite'],
            pageSizes: ['A4', 'Letter', 'Legal'],
            duplex: p.hasDuplex || false,
            autoFeed: true
          },
          deviceType: 'multifunctional' as const
        })))
      }

      // Detectar via USB (impressoras multifuncionais)
      try {
        const usbMultifuncionais = await this.detectUSBMultifunctionalPrinters()
        multifuncionais.push(...usbMultifuncionais)
      } catch (error) {
        console.log('⚠️ Erro ao detectar multifuncionais USB:', error)
      }

    } catch (error) {
      console.log('⚠️ Erro ao detectar impressoras multifuncionais:', error)
    }

    return multifuncionais
  }

  private async detectUSBMultifunctionalPrinters(): Promise<ScannerDevice[]> {
    const multifuncionais: ScannerDevice[] = []
    
    try {
      if (!navigator.usb) {
        throw new Error('WebUSB não disponível')
      }

      // Filtrar por classes de dispositivo multifuncional
      const devices = await navigator.usb.requestDevice({
        filters: [
          { classCode: 7 }, // Printer class
          { classCode: 6 }, // Still Image class
          { classCode: 1 }  // Audio/Video class (algumas multifuncionais)
        ]
      })

      for (const device of devices) {
        const deviceName = device.productName || 'Dispositivo USB'
        const isMultifunctional = this.isMultifunctionalDevice(deviceName, device.manufacturerName)
        
        if (isMultifunctional) {
          multifuncionais.push({
            id: `usb_multifuncional_${device.serialNumber || device.productId}`,
            name: deviceName,
            type: 'multifuncional' as const,
            manufacturer: device.manufacturerName,
            model: deviceName,
            capabilities: {
              resolutions: [150, 300, 600, 1200],
              colorModes: ['color', 'grayscale', 'blackwhite'],
              pageSizes: ['A4', 'Letter', 'Legal'],
              duplex: true,
              autoFeed: true
            },
            deviceType: 'multifunctional' as const
          })
        }
      }
    } catch (error) {
      console.log('⚠️ Erro ao detectar multifuncionais USB:', error)
    }

    return multifuncionais
  }

  private async detectUSBScanners(): Promise<ScannerDevice[]> {
    const scanners: ScannerDevice[] = []
    
    try {
      // Verificar se WebUSB está disponível
      if (!navigator.usb) {
        throw new Error('WebUSB não disponível')
      }

      // Solicitar acesso a dispositivos USB
      const devices = await navigator.usb.requestDevice({
        filters: [
          { classCode: 7 }, // Printer/Scanner class
          { classCode: 6 }  // Still Image class
        ]
      })

      for (const device of devices) {
        scanners.push({
          id: `usb_${device.serialNumber || device.productId}`,
          name: device.productName || 'Scanner USB',
          type: 'usb',
          manufacturer: device.manufacturerName,
          model: device.productName,
          capabilities: {
            resolutions: [150, 300, 600, 1200],
            colorModes: ['color', 'grayscale', 'blackwhite'],
            pageSizes: ['A4', 'Letter', 'Legal'],
            duplex: false,
            autoFeed: true
          },
          deviceType: 'scanner' as const
        })
      }
    } catch (error) {
      console.log('⚠️ Erro ao detectar scanners USB:', error)
    }

    return scanners
  }

  private async detectCameraScanner(): Promise<ScannerDevice | null> {
    try {
      if (!navigator.mediaDevices) {
        throw new Error('MediaDevices não disponível')
      }

      // Verificar se há câmera disponível
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      
      if (videoDevices.length > 0) {
        return {
          id: 'camera_scanner',
          name: 'Câmera do Dispositivo',
          type: 'camera',
          capabilities: {
            resolutions: [300, 600, 1200],
            colorModes: ['color', 'grayscale'],
            pageSizes: ['A4', 'Letter'],
            duplex: false,
            autoFeed: false
          },
          deviceType: 'scanner' as const
        }
      }
    } catch (error) {
      console.log('⚠️ Erro ao detectar câmera:', error)
    }

    return null
  }

  private determineDeviceType(name: string, manufacturer?: string): 'twain' | 'sane' | 'usb' | 'camera' | 'multifuncional' | 'all-in-one' {
    const deviceName = (name + ' ' + (manufacturer || '')).toLowerCase()
    
    // Verificar se é multifuncional
    if (this.isMultifunctionalDevice(name, manufacturer)) {
      return 'multifuncional'
    }
    
    // Verificar se é all-in-one
    if (this.isAllInOneDevice(name, manufacturer)) {
      return 'all-in-one'
    }
    
    // Verificar se é scanner dedicado
    if (this.isDedicatedScanner(name, manufacturer)) {
      return 'twain' // Assume TWAIN para scanners dedicados
    }
    
    return 'twain' // Default
  }

  private determineDeviceCategory(name: string, manufacturer?: string): 'scanner' | 'multifunctional' | 'all-in-one' | 'printer-scanner' {
    const deviceName = (name + ' ' + (manufacturer || '')).toLowerCase()
    
    if (this.isMultifunctionalDevice(name, manufacturer)) {
      return 'multifunctional'
    }
    
    if (this.isAllInOneDevice(name, manufacturer)) {
      return 'all-in-one'
    }
    
    if (this.isPrinterScannerDevice(name, manufacturer)) {
      return 'printer-scanner'
    }
    
    return 'scanner'
  }

  private isMultifunctionalDevice(name: string, manufacturer?: string): boolean {
    const deviceName = (name + ' ' + (manufacturer || '')).toLowerCase()
    
    const multifunctionalKeywords = [
      'multifuncional', 'multifunction', 'all-in-one', 'mfp', 'officejet',
      'laserjet', 'deskjet', 'pixma', 'workforce', 'ecotank', 'imageclass',
      'brother', 'canon', 'hp', 'epson', 'samsung', 'xerox', 'lexmark',
      'print', 'copy', 'scan', 'fax'
    ]
    
    return multifunctionalKeywords.some(keyword => deviceName.includes(keyword))
  }

  private isAllInOneDevice(name: string, manufacturer?: string): boolean {
    const deviceName = (name + ' ' + (manufacturer || '')).toLowerCase()
    
    const allInOneKeywords = [
      'all-in-one', 'all in one', 'aio', 'multifuncional', 'multifunction',
      'officejet', 'laserjet', 'pixma', 'workforce', 'ecotank'
    ]
    
    return allInOneKeywords.some(keyword => deviceName.includes(keyword))
  }

  private isDedicatedScanner(name: string, manufacturer?: string): boolean {
    const deviceName = (name + ' ' + (manufacturer || '')).toLowerCase()
    
    const scannerKeywords = [
      'scanner', 'scan', 'kodak', 'i2600', 'i2800', 'i2400', 'i3600',
      'canoscan', 'epson', 'perfection', 'v600', 'v800', 'v850'
    ]
    
    return scannerKeywords.some(keyword => deviceName.includes(keyword))
  }

  private isPrinterScannerDevice(name: string, manufacturer?: string): boolean {
    const deviceName = (name + ' ' + (manufacturer || '')).toLowerCase()
    
    const printerScannerKeywords = [
      'print', 'printer', 'scan', 'scanner', 'copy', 'copier'
    ]
    
    // Deve conter pelo menos "print" ou "scan"
    const hasPrint = printerScannerKeywords.some(keyword => 
      keyword === 'print' && deviceName.includes(keyword)
    )
    const hasScan = printerScannerKeywords.some(keyword => 
      keyword === 'scan' && deviceName.includes(keyword)
    )
    
    return hasPrint && hasScan
  }

  async scanDocument(scannerId: string, config: ScanConfig): Promise<ScanResult> {
    try {
      console.log('📷 Iniciando digitalização...', { scannerId, config })
      
      const scanner = this.scanners.find(s => s.id === scannerId)
      if (!scanner) {
        throw new Error('Scanner não encontrado')
      }

      let result: ScanResult

      switch (scanner.type) {
        case 'twain':
          result = await this.scanWithTwain(scanner, config)
          break
        case 'sane':
          result = await this.scanWithSane(scanner, config)
          break
        case 'usb':
          result = await this.scanWithUSB(scanner, config)
          break
        case 'multifuncional':
        case 'all-in-one':
          result = await this.scanWithMultifunctional(scanner, config)
          break
        case 'camera':
          result = await this.scanWithCamera(scanner, config)
          break
        default:
          throw new Error('Tipo de dispositivo não suportado')
      }

      console.log('✅ Digitalização concluída:', result)
      return result
    } catch (error) {
      console.error('❌ Erro na digitalização:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        format: 'unknown'
      }
    }
  }

  private async scanWithTwain(scanner: ScannerDevice, config: ScanConfig): Promise<ScanResult> {
    if (!window.electronAPI?.scanWithTwain) {
      throw new Error('API TWAIN não disponível')
    }

    const result = await window.electronAPI.scanWithTwain({
      scannerId: scanner.id,
      config: {
        resolution: config.resolution,
        colorMode: config.colorMode,
        pageSize: config.pageSize,
        quality: config.quality
      }
    })

    return {
      success: result.success,
      imageData: result.imageData,
      imageUrl: result.imageUrl,
      format: result.format || 'jpeg',
      width: result.width,
      height: result.height,
      error: result.error
    }
  }

  private async scanWithSane(scanner: ScannerDevice, config: ScanConfig): Promise<ScanResult> {
    if (!window.electronAPI?.scanWithSane) {
      throw new Error('API SANE não disponível')
    }

    const result = await window.electronAPI.scanWithSane({
      scannerId: scanner.id,
      config: {
        resolution: config.resolution,
        colorMode: config.colorMode,
        pageSize: config.pageSize,
        quality: config.quality
      }
    })

    return {
      success: result.success,
      imageData: result.imageData,
      imageUrl: result.imageUrl,
      format: result.format || 'jpeg',
      width: result.width,
      height: result.height,
      error: result.error
    }
  }

  private async scanWithMultifunctional(scanner: ScannerDevice, config: ScanConfig): Promise<ScanResult> {
    try {
      console.log('🖨️ Iniciando digitalização com impressora multifuncional...')
      
      // Tentar via TWAIN primeiro (mais comum para multifuncionais)
      if (window.electronAPI?.scanWithTwain) {
        try {
          const result = await window.electronAPI.scanWithTwain({
            scannerId: scanner.id,
            config: {
              resolution: config.resolution,
              colorMode: config.colorMode,
              pageSize: config.pageSize,
              quality: config.quality,
              deviceType: 'multifunctional'
            }
          })

          return {
            success: result.success,
            imageData: result.imageData,
            imageUrl: result.imageUrl,
            format: result.format || 'jpeg',
            width: result.width,
            height: result.height,
            error: result.error
          }
        } catch (error) {
          console.log('⚠️ TWAIN falhou, tentando método alternativo...')
        }
      }

      // Fallback: usar API específica para multifuncionais
      if (window.electronAPI?.scanWithMultifunctional) {
        const result = await window.electronAPI.scanWithMultifunctional({
          deviceId: scanner.id,
          config: {
            resolution: config.resolution,
            colorMode: config.colorMode,
            pageSize: config.pageSize,
            quality: config.quality,
            autoCrop: config.autoCrop,
            autoDeskew: config.autoDeskew,
            autoRotate: config.autoRotate
          }
        })

        return {
          success: result.success,
          imageData: result.imageData,
          imageUrl: result.imageUrl,
          format: result.format || 'jpeg',
          width: result.width,
          height: result.height,
          error: result.error
        }
      }

      // Fallback final: usar câmera
      console.log('⚠️ APIs específicas não disponíveis, usando câmera como fallback...')
      return await this.scanWithCamera(scanner, config)

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro na digitalização multifuncional',
        format: 'unknown'
      }
    }
  }

  private async scanWithUSB(scanner: ScannerDevice, config: ScanConfig): Promise<ScanResult> {
    // Implementação para scanners USB via WebUSB
    throw new Error('Scanner USB não implementado ainda')
  }

  private async scanWithCamera(scanner: ScannerDevice, config: ScanConfig): Promise<ScanResult> {
    try {
      // Usar câmera para capturar imagem
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Câmera traseira se disponível
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })

      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      // Aguardar o vídeo carregar
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve
      })

      // Criar canvas para capturar frame
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Não foi possível criar contexto do canvas')
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      // Parar stream
      stream.getTracks().forEach(track => track.stop())

      // Converter para blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            resolve({
              success: true,
              imageData: blob,
              imageUrl: url,
              format: 'jpeg',
              width: canvas.width,
              height: canvas.height
            })
          } else {
            resolve({
              success: false,
              error: 'Erro ao converter imagem',
              format: 'unknown'
            })
          }
        }, 'image/jpeg', config.quality / 100)
      })
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro na captura',
        format: 'unknown'
      }
    }
  }

  getAvailableScanners(): ScannerDevice[] {
    return this.scanners
  }

  isReady(): boolean {
    return this.isInitialized && this.scanners.length > 0
  }
}

// Instância singleton
export const scannerService = ScannerService.getInstance()

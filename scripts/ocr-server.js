const express = require('express')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = 3001

// Middleware para parsing JSON
app.use(express.json({ limit: '50mb' }))

// Endpoint para processar OCR
app.post('/api/ocr-process', async (req, res) => {
  try {
    const { imageData } = req.body
    
    if (!imageData) {
      return res.status(400).json({
        status: 'error',
        message: 'Dados da imagem não fornecidos'
      })
    }

    console.log('📸 Processando imagem com OCR...')

    // Caminho para o script Python
    const pythonScript = path.join(__dirname, 'ocr_processor.py')
    
    // Executar o script Python
    const pythonProcess = spawn('python', [pythonScript, imageData])
    
    let output = ''
    let errorOutput = ''

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output)
          console.log('✅ OCR processado com sucesso')
          res.json(result)
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse do resultado:', parseError)
          res.status(500).json({
            status: 'error',
            message: 'Erro ao processar resultado do OCR'
          })
        }
      } else {
        console.error('❌ Erro no processamento Python:', errorOutput)
        res.status(500).json({
          status: 'error',
          message: `Erro no processamento: ${errorOutput}`
        })
      }
    })

    pythonProcess.on('error', (error) => {
      console.error('❌ Erro ao executar Python:', error)
      res.status(500).json({
        status: 'error',
        message: 'Erro ao executar processamento OCR'
      })
    })

  } catch (error) {
    console.error('❌ Erro no servidor:', error)
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    })
  }
})

// Endpoint de teste
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servidor OCR funcionando!',
    timestamp: new Date().toISOString()
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor OCR rodando na porta ${PORT}`)
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/ocr-process`)
  console.log(`🧪 Teste: http://localhost:${PORT}/api/test`)
})

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason)
})


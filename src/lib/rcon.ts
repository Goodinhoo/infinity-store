import net from 'net'

export class RconClient {
  private host: string
  private port: number
  private password: string
  private socket: net.Socket | null = null
  private requestId = 0

  constructor(host: string, port = 25575, password = '') {
    this.host = host
    this.port = port
    this.password = password
  }

  private createPacket(id: number, type: number, body: string): Buffer {
    const bodyBuf = Buffer.from(body, 'utf-8')
    const length = 4 + 4 + bodyBuf.length + 2
    const buf = Buffer.alloc(4 + length)

    buf.writeInt32LE(length, 0)
    buf.writeInt32LE(id, 4)
    buf.writeInt32LE(type, 8)
    bodyBuf.copy(buf, 12)
    buf.writeUInt8(0, 12 + bodyBuf.length)
    buf.writeUInt8(0, 13 + bodyBuf.length)

    return buf
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const sock = new net.Socket()
      this.socket = sock

      const timeoutTimer = setTimeout(() => {
        sock.destroy()
        reject(new Error(`Timeout ao ligar ao servidor RCON em ${this.host}:${this.port}`))
      }, 7000)

      sock.connect(this.port, this.host, () => {
        // Authenticate
        this.requestId++
        const authPacket = this.createPacket(this.requestId, 3, this.password)

        const onData = (data: Buffer) => {
          clearTimeout(timeoutTimer)

          // Parse response
          if (data.length >= 12) {
            const resId = data.readInt32LE(4)
            const resType = data.readInt32LE(8)

            if (resId === -1) {
              sock.destroy()
              reject(new Error('Falha na autenticação RCON: Password incorreta.'))
              return
            }

            if (resId === this.requestId || resType === 2) {
              sock.removeListener('data', onData)
              resolve()
              return
            }
          }
        }

        sock.on('data', onData)
        sock.write(authPacket)
      })

      sock.on('error', (err) => {
        clearTimeout(timeoutTimer)
        reject(new Error(`Erro de conexão RCON (${this.host}:${this.port}): ${err.message}`))
      })
    })
  }

  public send(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error('Socket RCON não está ligado.'))
      }

      this.requestId++
      const reqId = this.requestId
      const cmdPacket = this.createPacket(reqId, 2, command)

      const timeoutTimer = setTimeout(() => {
        reject(new Error(`Timeout a aguardar resposta do comando: ${command}`))
      }, 7000)

      let responseBuffer = ''

      const onData = (data: Buffer) => {
        if (data.length >= 12) {
          const resId = data.readInt32LE(4)
          const payload = data.toString('utf-8', 12, data.length - 2)

          if (resId === reqId) {
            responseBuffer += payload
            clearTimeout(timeoutTimer)
            this.socket?.removeListener('data', onData)
            resolve(responseBuffer.trim())
          }
        }
      }

      this.socket.on('data', onData)
      this.socket.write(cmdPacket)
    })
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.end()
      this.socket.destroy()
      this.socket = null
    }
  }

  public static async executeCommand(
    host: string,
    port: number,
    password: string,
    command: string
  ): Promise<string> {
    const client = new RconClient(host, port, password)
    try {
      await client.connect()
      const response = await client.send(command)
      client.disconnect()
      return response
    } catch (err) {
      client.disconnect()
      throw err
    }
  }
}

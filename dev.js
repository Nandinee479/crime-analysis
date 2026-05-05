const { spawn } = require('child_process');
const { platform } = require('os');
const readline = require('readline');

let electronStarted = false
let viteUrl = null

const vite = spawn('npx', ['vite'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
  env: process.env
})

const viteReader = readline.createInterface({ input: vite.stdout })
viteReader.on('line', (line) => {
  process.stdout.write(line + '\n')
  const match = line.match(/Local:\s+(https?:\/\/[^\s]+)/)
  if (match && !viteUrl) {
    viteUrl = match[1]
    startElectron(viteUrl)
  }
})

vite.stderr.on('data', (data) => {
  process.stderr.write(data)
})

vite.on('close', (code) => {
  if (!electronStarted) {
    process.stderr.write(`Vite exited before Electron started (code: ${code})\n`)
  }
  process.exit(code)
})

function startElectron(url) {
  if (electronStarted) return
  electronStarted = true

  const electronCmd = platform() === 'win32' ? 'cross-env' : 'cross-env'
  const electronArgs = platform() === 'win32'
    ? ['NODE_ENV=development', `VITE_DEV_SERVER_URL=${url}`, 'electron', '.']
    : ['NODE_ENV=development', `VITE_DEV_SERVER_URL=${url}`, 'electron', '.']

  const electron = spawn(electronCmd, electronArgs, {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, VITE_DEV_SERVER_URL: url }
  })

  electron.on('close', (code) => {
    vite.kill()
    process.exit(code)
  })
}

setTimeout(() => {
  if (!electronStarted) {
    const fallbackUrl = 'http://localhost:5173'
    startElectron(fallbackUrl)
  }
}, 10000)

// Handle process termination
process.on('SIGINT', () => {
  vite.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  vite.kill();
  process.exit(0);
});
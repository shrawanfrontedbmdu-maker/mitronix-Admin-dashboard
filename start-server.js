import { spawn } from 'child_process'

console.log('Starting mock API server...')

const serverProcess = spawn('npm', ['start'], {
  cwd: 'server',
  stdio: 'inherit',
  shell: true
})

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`)
})

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...')
  serverProcess.kill('SIGINT')
  process.exit(0)
})

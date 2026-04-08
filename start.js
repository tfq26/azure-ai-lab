const { spawn } = require('child_process');
const path = require('path');

console.log("\x1b[32m%s\x1b[0m", "Starting Azure AI Lab Workshop...");
console.log("Spinning up both Frontend and Backend concurrently...\n");

// Utility to run shell commands cleanly in parallel
const runCommand = (command, args, directory, prefix, color) => {
    const cwd = path.join(__dirname, directory);
    
    // Spawn the process (shell: true helps resolve commands like npm/bun natively)
    const proc = spawn(command, args, { cwd, shell: true });

    proc.stdout.on('data', (data) => {
        const lines = data.toString().trim().split('\n');
        lines.forEach(line => {
            if (line) console.log(`${color}[${prefix}]\x1b[0m ${line}`);
        });
    });

    proc.stderr.on('data', (data) => {
        const lines = data.toString().trim().split('\n');
        lines.forEach(line => {
            if (line) console.error(`${color}[${prefix} ERROR]\x1b[0m ${line}`);
        });
    });

    proc.on('close', (code) => {
        console.log(`${color}[${prefix}]\x1b[0m Process exited with code ${code}`);
    });
    
    return proc;
};

// 1. Start the Node.js Express Backend
// Cyan color for backend logs
runCommand('npm', ['run', 'dev'], 'backend', 'BACKEND', '\x1b[36m');

// 2. Start the React/Vite Frontend
// Magenta color for frontend logs (Using 'bun dev' for speed assuming students use it, or 'npm run dev' fallback)
runCommand('bun', ['dev'], 'frontend', 'FRONTEND', '\x1b[35m');

// Graceful shutdown
process.on('SIGINT', () => {
    console.log("\n\x1b[31mShutting down all processes...\x1b[0m");
    process.exit();
});

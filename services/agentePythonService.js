const { spawn } = require('child_process');
const path = require('path');

const executarAgentePython = (mensagem, idUsuario) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../python_agents/agente_ollama.py');

    const pyProcess = spawn('python3', [scriptPath, JSON.stringify({ mensagem, idUsuario })]);

    let output = '';
    let errorOutput = '';

    pyProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pyProcess.on('close', (code) => {
      if (code !== 0) {
        reject(errorOutput);
      } else {
        try {
          resolve(JSON.parse(output));
        } catch {
          resolve(output);
        }
      }
    });
  });
};

module.exports = { executarAgentePython };

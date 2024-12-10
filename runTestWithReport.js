const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ruta de la carpeta de tests
const testsDir = path.join(__dirname, 'tests');

// Obtiene el nombre del archivo de prueba desde los argumentos de la línea de comandos
const testFile = process.argv[2];

// Función para ejecutar un archivo de prueba con cobertura y capturar la salida
function runTestFile(filePath) {
    return new Promise((resolve) => {
        exec(`npx nyc node ${filePath}`, (error, stdout, stderr) => {
            resolve({
                file: path.basename(filePath),
                output: stdout || '',
                error: error ? (stderr || error.message) : null,
                status: error ? 'Fallo' : 'Exitoso'
            });
        });
    });
}

// Función principal para ejecutar las pruebas, generar cobertura y un reporte personalizado
(async () => {
    const results = [];
    let testFiles = [];

    // Si se proporciona un archivo específico, solo ejecuta ese archivo
    if (testFile) {
        const filePath = path.join(testsDir, testFile);
        if (fs.existsSync(filePath)) {
            testFiles = [filePath];
        } else {
            console.error(`El archivo de prueba ${testFile} no existe en la carpeta 'tests'.`);
            process.exit(1);
        }
    } else {
        // Si no se proporciona un archivo específico, ejecuta todos los archivos .js en la carpeta 'tests',
        // excluyendo 'img.spec.js' y 'analyze.spec.js'
        testFiles = fs.readdirSync(testsDir)
            .filter(file => file.endsWith('.js') && file !== 'img.spec.js' && file !== 'analyze.spec.js') // Excluir archivos específicos
            .map(file => path.join(testsDir, file));

        if (testFiles.length === 0) {
            console.error("No se encontraron archivos de prueba en la carpeta 'tests'.");
            process.exit(1);
        }
    }

    // Ejecutar cada archivo de prueba en secuencia
    for (const filePath of testFiles) {
        console.log(`Ejecutando prueba: ${path.basename(filePath)}`);
        const result = await runTestFile(filePath);
        results.push(result);
    }

    // Generar el reporte de cobertura de código con nyc
    exec('npx nyc report --reporter=html', (error) => {
        if (error) {
            console.error('Error al generar el reporte de cobertura:', error.message);
        } else {
            console.log('Reporte de cobertura generado en: ./coverage/index.html');
        }
    });

    // Generar el reporte HTML personalizado
    const htmlReportPath = path.join(__dirname, 'custom-report', 'test-report.html');
    fs.mkdirSync(path.dirname(htmlReportPath), { recursive: true });

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte de Pruebas</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f6f9;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                }
                h1 {
                    color: #d52b1e; /* Rojo de McDonald's */
                    text-align: center;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: #fff;
                    padding: 20px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    border-left: 5px solid #ffc72c; /* Amarillo de McDonald's */
                }
                .summary {
                    margin: 20px 0;
                    padding: 15px;
                    background-color: #fef6e4; /* Fondo amarillo claro */
                    border-left: 5px solid #ffc72c;
                    color: #333;
                }
                .error {
                    color: #d52b1e; /* Rojo de McDonald's */
                    font-weight: bold;
                }
                pre {
                    background: #f9f9f9;
                    padding: 15px;
                    border-radius: 5px;
                    overflow-x: auto;
                    border-left: 5px solid #d52b1e;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                }
                .status-pass {
                    color: #4CAF50; /* Verde para éxito */
                    font-weight: bold;
                }
                .status-fail {
                    color: #d52b1e; /* Rojo para fallos */
                    font-weight: bold;
                }
                .title-section {
                    color: #d52b1e;
                    font-size: 1.3em;
                    margin-top: 30px;
                    border-bottom: 2px solid #ffc72c;
                    padding-bottom: 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Reporte de Pruebas</h1>
                <div class="summary">
                    <p><strong>Resumen de Ejecución:</strong></p>
                    <p>Total de pruebas: ${results.length}</p>
                    <p>Éxitos: ${results.filter(r => r.status === 'Exitoso').length}</p>
                    <p>Fallos: ${results.filter(r => r.status === 'Fallo').length}</p>
                    <p><a href="../coverage/index.html" target="_blank">Ver Reporte de Cobertura</a></p>
                </div>
                ${results.map(result => `
                    <div class="title-section">Prueba: ${result.file}</div>
                    <p><strong>Estado:</strong> ${result.status === 'Exitoso' ? `<span class="status-pass">Exitoso</span>` : `<span class="status-fail">Fallo</span>`}</p>
                    <h2>Output</h2>
                    <pre>${result.output.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                    ${result.error ? `<h2>Errores</h2><pre class="error">${result.error.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>` : '<p>No se encontraron errores.</p>'}
                `).join('')}
                <div class="footer">
                    <p>Generado el ${new Date().toLocaleString()}</p>
                </div>
            </div>
        </body>
        </html>
    `;

    fs.writeFileSync(htmlReportPath, htmlContent);
    console.log('Reporte personalizado generado en:', htmlReportPath);
})();

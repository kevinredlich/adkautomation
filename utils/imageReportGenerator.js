const fs = require('fs');
const path = require('path');

const REPORT_PATH = path.join(__dirname, '../custom-report/test-report-img.html');

function initializeHtmlReport() {
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte de Imágenes</title>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f4f6f9; color: #333; margin: 0; padding: 20px; }
                h1 { color: #d52b1e; text-align: center; }
                .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; }
                .product-error { color: #d52b1e; font-weight: bold; }
                .product-success { color: #4CAF50; font-weight: bold; }
                .product-warning { color: #FFA500; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Reporte de Imágenes</h1>
    `;
    fs.writeFileSync(REPORT_PATH, htmlContent);
}

function writeToHtmlReport(content) {
    fs.appendFileSync(REPORT_PATH, content);
}

function finalizeHtmlReport() {
    const footerContent = `
                <div class="footer">
                    <p>Generado el ${new Date().toLocaleString()}</p>
                </div>
            </div>
        </body>
        </html>
    `;
    fs.appendFileSync(REPORT_PATH, footerContent);
}

module.exports = {
    initializeHtmlReport,
    writeToHtmlReport,
    finalizeHtmlReport
};

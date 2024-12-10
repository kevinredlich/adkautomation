const { _electron: electron } = require('playwright');

// Ruta al ejecutable de la aplicación Kevin
const appPath = '/Applications/McDonald\'s ADK.app/Contents/MacOS/McDonald\'s ADK';

// Ruta al ejecutable Totem ECONOCOM OFICINA
//const appPath = 'C:/Users/acrelec/AppData/Local/Programs/mcd-adk-front';



async function launchApp() {
    // Iniciar la aplicación con configuraciones
    const electronApp = await electron.launch({
        executablePath: appPath,
        args: ['--disable-gpu', '--disable-software-rasterizer']
    });

    const window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded'); // Esperar a que cargue la ventana principal

    // Establecer tamaño de ventana a 1920x1080
    // await window.setViewportSize({ width: 1080, height: 1080 });

    return { electronApp, window };
}

async function closeApp(electronApp) {
    await electronApp.close(); // Cerrar la aplicación
}

module.exports = { launchApp, closeApp }; // Exportar funciones

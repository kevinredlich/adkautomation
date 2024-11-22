const { launchApp, closeApp } = require('../electron-playwright'); // Asegúrate de que la ruta sea correcta

async function startApp() {
    const { electronApp, window } = await launchApp();
    return { electronApp, window };
}

async function stopApp(electronApp) {
    await closeApp(electronApp);
}

// Función genérica que encapsula el ciclo de vida completo de la app
async function runWithApp(testFunction) {
    const { electronApp, window } = await startApp();

    try {
        await testFunction(window); // Ejecuta la función de prueba pasando la ventana
    } catch (error) {
        console.error('Error durante la ejecución del test:', error.message);
    } finally {
        await stopApp(electronApp); // Asegura que la app se cierre
    }
}

module.exports = { startApp, stopApp, runWithApp };

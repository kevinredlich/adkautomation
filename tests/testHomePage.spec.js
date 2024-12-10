const { runWithApp } = require('../utils/appManager'); // Importar el gestor de la app
const HomePageActions = require('../pages/attractScreen/attractScreenActions'); // Importa las acciones de la pantalla principal

// Función de prueba específica para la pantalla principal
async function testHomePage(window) {
    const homePage = new HomePageActions(window);

    // Ejecutar acciones de prueba en la pantalla principal
    await homePage.AttractButton();
    await homePage.LanguageBtn();
    await homePage.AccesibilityButton();

    console.log("Prueba completada exitosamente en HomePage.");
}

// Ejecutar la función de prueba usando `runWithApp`
runWithApp(testHomePage);

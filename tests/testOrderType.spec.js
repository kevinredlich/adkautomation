const { runWithApp } = require('../utils/appManager'); // Importa el gestor de la app
const HomePageActions = require('../pages/orderType/orderTypeActions'); // Importa las acciones de la pantalla principal


// Función de prueba específica para validar la selección del tipo de pedido
async function testOrderType(window) {
    const homePage = new HomePageActions(window);

    // Método para iniciar sesión
    await homePage.AttractButton()

    // Verificar los textos en los botones de selección
    await homePage.verifyOrderTypeTexts();

    // Hacer clic en el botón "Para comer aquí"
    await homePage.clickPickUp();

    // Esperar un momento o validar la navegación (si es aplicable)

    // Hacer clic en el botón "Para llevar"
    await homePage.clickTakeOut();

    await homePage.clickSpanishBtn();

    // Esperar un momento o validar la navegación (si es aplicable)
    console.log("Pruebas de selección de tipo de pedido completadas.");
}

// Ejecutar la prueba usando `runWithApp`
runWithApp(testOrderType);

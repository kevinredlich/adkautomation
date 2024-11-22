const orderTypeSelectors = require('./orderTypeSelectors'); // Importar los selectores de la pantalla principal

class HomePageActions {
    constructor(window) {
        this.window = window;
    }

    // Método para verificar el texto en los botones de selección
    async verifyOrderTypeTexts() {
        // Verificar texto "Para comer aquí"
        const pickUpText = await this.window.locator(selectors.pickUpBtn).textContent();
        if (pickUpText.trim() !== 'Para comer aquí') {
            throw new Error(`Texto inesperado en el botón de "Para comer aquí": ${pickUpText}`);
        }

        // Verificar texto "Para llevar"
        const takeOutText = await this.window.locator(selectors.takeOutBtn).textContent();
        if (takeOutText.trim() !== 'Para llevar') {
            throw new Error(`Texto inesperado en el botón de "Para llevar": ${takeOutText}`);
        }

        console.log("Textos en los botones de selección verificados correctamente.");
    }

    // Método para hacer clic en el botón "Para comer aquí"
    async clickPickUp() {
        await this.window.locator(selectors.pickUpBtn).click();
        console.log('Botón "Para comer aquí" clicado exitosamente.');
    }

    // Método para hacer clic en el botón "Para llevar"
    async clickTakeOut() {
        await this.window.locator(selectors.takeOutBtn).click();
        console.log('Botón "Para llevar" clicado exitosamente.');
    }
}

module.exports = HomePageActions;

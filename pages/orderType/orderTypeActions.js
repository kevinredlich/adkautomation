const orderTypeSelectors = require('./orderTypeSelectors');
const attractScreenSelector = require('../attractScreen/attractScreenSelector');


class orderTypeActions {
    constructor(window) {
        this.window = window;
    }
    // Método para selecciónar botón de Continuar 
    async AttractButton() {
        await this.window.waitForSelector(attractScreenSelector.attractButton, { state: 'visible', timeout: 5000 });
        console.log("Botón de Continuar sin Login esta visible");
        await this.window.click(attractScreenSelector.attractButton, { force: true });
    }

    // Método para verificar el texto en los botones de selección
    async verifyOrderTypeTexts() {
        // Verificar texto "Para comer aquí"
        const pickUpText = await this.window.locator(orderTypeSelectors.pickUpBtn).textContent();
        if (pickUpText.trim() !== 'Para comer aquí') {
            throw new Error(`Texto inesperado en el botón de "Para comer aquí": ${pickUpText}`);
        }

        // Verificar texto "Para llevar"
        const takeOutText = await this.window.locator(orderTypeSelectors.takeOutBtn).textContent();
        if (takeOutText.trim() !== 'Para llevar') {
            throw new Error(`Texto inesperado en el botón de "Para llevar": ${takeOutText}`);
        } 
        
        const spanishBtn = await this.window.locator(orderTypeSelectors.spanishBtn).textContent();
        if(spanishBtn.trim() !== 'Español') {
            console.log(spanishBtn) 
            throw new Error(`Texto inesperado en el botón de "Español: ${spanishBtn}`)
            }

        console.log("Textos en los botones de selección verificados correctamente.")
    }



     // Método para hacer clic en el botón "Para comer aquí"
    async clickPickUp() {
        await this.window.locator(orderTypeSelectors.pickUpBtn).click();
        console.log('Botón "Para comer aquí" clicado exitosamente.');
    }

    // Método para hacer clic en el botón "Para llevar"
    async clickTakeOut() {
        await this.window.locator(orderTypeSelectors.takeOutBtn).click();
        console.log('Botón "Para llevar" clicado exitosamente.');
    } 
    async clickSpanishBtn() {
        await this.window.locator(orderTypeSelectors.spanishBtn).click()
        console.log('Botón Spanish clicado exitosamente')
    }
}

module.exports = orderTypeActions;

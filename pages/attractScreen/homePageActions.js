// pages/homePageActions.js
const selectors = require('./homePageSelectors');

// Todos los metodos para la verificación de los elementos que se encuentren en la homePage (Attract Screen)
class HomePageActions {
    constructor(window) {
        this.window = window;
    }

    // Método para hacer clic en el botón de atracción
    async AttractButton() {
        await this.window.waitForSelector(selectors.attractButton, { state: 'visible', timeout: 5000 });
        await this.window.click(selectors.attractButton, { force: true });
        console.log("Botón con el selector [data-test='btn-attract'] clicado exitosamente.");
    }
    // Método para verificar que el footer existe

}
module.exports = HomePageActions;

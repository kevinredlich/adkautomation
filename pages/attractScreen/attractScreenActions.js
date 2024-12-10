const attractScreenSelector = require('./attractScreenSelector');

// Todos los metodos para la verificación de los elementos que se encuentren en la homePage (Attract Screen)
class attractScreenActions {
    constructor(window) {
        this.window = window;
    }

    // Método para hacer clic en el botón de atracción
    async AttractButton() {
        await this.window.waitForSelector(attractScreenSelector.attractButton, { state: 'visible', timeout: 5000 });
        console.log("Botón de Continuar sin Login esta visible");
        await this.window.click(attractScreenSelector.attractButton, { force: true });
    }
    
    async LanguageBtn() {
        await this.window.waitForSelector(attractScreenSelector.languageButton, { state: 'visible', timeout: 5000})
        console.log("Botón de Selección de Idioma esta visible.")
        await this.window.click(attractScreenSelector.languageButton, { force: true })
    }

    async AccesibilityButton() {
        await this.window.waitForSelector(attractScreenSelector.accaccessibilityButton, { state: 'visible', timeout: 5000})
        console.log("Botón de Accesibilidad esta visible")
        await this.window.click(attractScreenSelector.accaccessibilityButton, { force: true })
    }


}
module.exports = attractScreenActions;

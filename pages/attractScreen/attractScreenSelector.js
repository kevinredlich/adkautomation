// Todos los selectores que se encuentren en la home page (Attract Screen)
const attractScreenSelectors = {
    
    attractButton: '[data-test="btn-attract"]',
    languageButton: 'button:has-text("Otros idiomas")', // REFACTORIZAR CUANDO TENGAMOS SELECTOR UNICO
    accaccessibilityButton: 'button:has-text("Accesibilidad")', // REFACTORIZAR CUANDO TENGAMOIS SELECTOR UNICO
};

module.exports = attractScreenSelectors;

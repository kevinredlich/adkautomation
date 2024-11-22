const { test } = require('@playwright/test');
const { initializeHtmlReport, writeToHtmlReport, finalizeHtmlReport } = require('../utils/imageReportGenerator');
const { checkImageQuality, QUALITY_THRESHOLD_MIN } = require('../utils/imageUtils');

const CATALOG_URL = 'https://mcd-totem-backend.q.smartadk.com/catalog/lite';

test.setTimeout(120000);

test('Verificar aspect ratio y calidad de imágenes de productos', async ({ request }) => {
    initializeHtmlReport();

    const response = await request.get(CATALOG_URL);

    if (!response.ok()) {
        console.error('Error al obtener datos del catálogo:', response.status());
        writeToHtmlReport('<p>Error al obtener datos del catálogo.</p>');
        finalizeHtmlReport();
        return;
    }

    const catalogData = await response.json();
    let hasErrors = false;

    for (const category of catalogData) {
        writeToHtmlReport(`<h2>Categoría: ${category.title}</h2>`);

        const productPromises = category.products.map(product => processImage(request, product));
        const results = await Promise.all(productPromises);

        if (results.some(result => result.hasErrors)) hasErrors = true;
    }

    if (hasErrors) {
        console.log('\nAlgunas imágenes tienen problemas de calidad o de aspect ratio.');
        writeToHtmlReport('<p><strong>Algunas imágenes tienen problemas de calidad o de aspect ratio.</strong></p>');
    } else {
        console.log('\nTodas las imágenes cumplen con el aspect ratio y la calidad esperada.');
        writeToHtmlReport('<p><strong>Todas las imágenes cumplen con el aspect ratio y la calidad esperada.</strong></p>');
    }

    finalizeHtmlReport();
});

async function processImage(request, product) {
    const imageUrl = product.imageUrl;
    const result = await checkImageQuality(request, imageUrl);

    if (result) {
        const errors = [];

        if (!result.isCorrectAspectRatio) {
            errors.push(`Aspect ratio incorrecto: ${result.aspectRatio.toFixed(2)} (Error de ASPECT RATIO)`);
        }

        console.log(`Nivel de calidad de la imagen ${product.name}: ${result.quality.toFixed(2)}`);

        if (result.quality < QUALITY_THRESHOLD_MIN) {
            errors.push(`Imagen de baja calidad: ${result.quality.toFixed(2)} (Error de CALIDAD)`);
        }

        if (errors.length > 0) {
            console.log(`❌ ${product.name} - Problemas con la imagen:`);
            errors.forEach(error => console.log(`   - ${error}`));
            console.log(`   URL: ${imageUrl}`);
            writeToHtmlReport(`
                <div class="product-error">
                    <p><strong>${product.name}</strong> - Problemas con la imagen:</p>
                    <ul>
                        ${errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                    <p>URL: <a href="${imageUrl}" target="_blank">${imageUrl}</a></p>
                </div>
            `);
            return { hasErrors: true };
        } else {
            console.log(`✅ ${product.name} - Imagen correcta y de buena calidad.`);
            writeToHtmlReport(`
                <div class="product-success">
                    <p>✅ <strong>${product.name}</strong> - Imagen correcta y de buena calidad.</p>
                </div>
            `);
            return { hasErrors: false };
        }
    } else {
        console.log(`⚠️ No se pudo verificar la imagen de ${product.name}.`);
        writeToHtmlReport(`
            <div class="product-warning">
                <p>⚠️ No se pudo verificar la imagen de ${product.name}.</p>
            </div>
        `);
        return { hasErrors: true };
    }
}

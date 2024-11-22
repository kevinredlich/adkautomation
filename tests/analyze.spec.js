const sharp = require('sharp');
const { test } = require('@playwright/test');
const { initializeHtmlReport, writeToHtmlReport, finalizeHtmlReport } = require('../utils/imageReportGenerator');

const DISPLAY_WIDTH = 208;
const DISPLAY_HEIGHT = 208;
const EXPECTED_ASPECT_RATIO = 1;
const ASPECT_RATIO_TOLERANCE = 0.05;
const QUALITY_THRESHOLD_MIN = 1000;

// Tiempo máximo para la ejecución del test
test.setTimeout(300000);

// Función principal del test
test('Analizar imágenes desde el catálogo', async ({ request }) => {
    const CATALOG_URL = 'https://mcd-totem-backend.q.smartadk.com/catalog/lite';

    console.log(`Obteniendo productos del endpoint: ${CATALOG_URL}`);
    initializeHtmlReport();

    const response = await request.get(CATALOG_URL);
    if (!response.ok()) {
        console.error(`Error al obtener el catálogo: ${response.statusText}`);
        writeToHtmlReport('<p>Error al obtener el catálogo.</p>');
        finalizeHtmlReport();
        return;
    }

    const catalogData = await response.json();
    console.time('Procesamiento completo');

    // Procesar categorías en paralelo
    const categoryPromises = catalogData.map(async (category) => {
        console.log(`\nProcesando categoría: ${category.title}`);

        // Procesar productos de la categoría en paralelo
        const productPromises = category.products.map(product => processImage(request, product));
        return await Promise.all(productPromises);
    });

    const results = (await Promise.all(categoryPromises)).flat();

    console.timeEnd('Procesamiento completo');

    if (results.length > 0) {
        categorizeAndDisplayResults(results);
    } else {
        console.log('No se analizaron imágenes.');
    }

    finalizeHtmlReport();
});

// Procesar cada imagen
async function processImage(request, product) {
    const imageUrl = product.imageUrl;

    try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            console.error(`Error al descargar la imagen ${imageUrl}: ${imageResponse.statusText}`);
            writeToHtmlReport(`<p>Error al descargar la imagen: ${imageUrl}</p>`);
            return null;
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const metadata = await sharp(Buffer.from(imageBuffer)).metadata();
        const quality = await calculateImageQuality(Buffer.from(imageBuffer));

        const aspectRatio = metadata.width / metadata.height;
        const isCorrectAspectRatio = Math.abs(aspectRatio - EXPECTED_ASPECT_RATIO) <= ASPECT_RATIO_TOLERANCE;

        const errors = [];
        if (!isCorrectAspectRatio) errors.push('Aspect ratio incorrecto');
        if (quality < QUALITY_THRESHOLD_MIN) errors.push('Baja calidad');

        if (errors.length > 0) {
            console.log(`❌ Producto: ${product.name}`);
            errors.forEach(error => console.log(`   - ${error}`));
            console.log(`   URL: ${imageUrl}`);
            console.log(`   Aspect Ratio: ${aspectRatio.toFixed(2)}, Calidad: ${quality.toFixed(2)}\n`);

            writeToHtmlReport(`
                <div class="product-error">
                    <p><strong>${product.name}</strong> - Problemas con la imagen:</p>
                    <ul>
                        ${errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                    <p>URL: <a href="${imageUrl}" target="_blank">${imageUrl}</a></p>
                </div>
            `);
            return {
                productId: product.identifier || 'No ID',
                productName: product.name || 'Sin nombre',
                imageUrl,
                aspectRatio,
                quality,
                isCorrectAspectRatio,
                hasErrors: true,
            };
        } else {
            console.log(`✅ Producto: ${product.name}`);
            console.log(`   Imagen correcta: URL: ${imageUrl}`);
            console.log(`   Aspect Ratio: ${aspectRatio.toFixed(2)}, Calidad: ${quality.toFixed(2)}\n`);

            writeToHtmlReport(`
                <div class="product-success">
                    <p>✅ <strong>${product.name}</strong> - Imagen correcta y de buena calidad.</p>
                </div>
            `);
            return {
                productId: product.identifier || 'No ID',
                productName: product.name || 'Sin nombre',
                imageUrl,
                aspectRatio,
                quality,
                isCorrectAspectRatio,
                hasErrors: false,
            };
        }
    } catch (error) {
        console.error(`⚠️ Error al procesar la imagen del producto ${product.name || 'Sin nombre'}:`, error);
        writeToHtmlReport(`<p>⚠️ Error al procesar la imagen: ${product.name || 'Sin nombre'}.</p>`);
        return null;
    }
}

// Calcular calidad de imagen
async function calculateImageQuality(imageBuffer) {
    const { data } = await sharp(imageBuffer)
        .resize(DISPLAY_WIDTH, DISPLAY_HEIGHT, { fit: 'cover' })
        .greyscale()
        .convolve({ width: 3, height: 3, kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] })
        .raw()
        .toBuffer({ resolveWithObject: true });

    const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
    const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;

    return variance;
}

// Clasificar y mostrar resultados
function categorizeAndDisplayResults(results) {
    const filteredResults = results.filter(result => result !== null);
    const qualities = filteredResults.map(result => result.quality);

    const min = Math.min(...qualities);
    const max = Math.max(...qualities);
    const avg = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;

    const thresholdMalo = avg / 2;
    const thresholdBueno = avg;
    const thresholdExcelente = max - (max - avg) / 3;

    const categories = { malo: [], bueno: [], excelente: [] };
    let aspectRatioErrors = 0; // Contador para imágenes con aspect ratio incorrecto

    filteredResults.forEach(result => {
        if (!result.isCorrectAspectRatio) aspectRatioErrors++;

        if (result.quality < thresholdMalo) {
            categories.malo.push(result);
        } else if (result.quality <= thresholdBueno) {
            categories.bueno.push(result);
        } else {
            categories.excelente.push(result);
        }
    });

    // Escribir resultados en el reporte HTML
    writeToHtmlReport(`
        <h2>Resultados del análisis:</h2>
        <p>Imágenes de baja calidad (Malo): ${categories.malo.length}</p>
        <p>Imágenes de calidad aceptable (Bueno): ${categories.bueno.length}</p>
        <p>Imágenes de alta calidad (Excelente): ${categories.excelente.length}</p>
        <p>Imágenes con Aspect Ratio incorrecto: ${aspectRatioErrors}</p>
    `);

    // Imprimir resultados en consola
    console.log('\n=== Clasificación de imágenes ===');
    console.log(`- Malo: ${categories.malo.length}`);
    console.log(`- Bueno: ${categories.bueno.length}`);
    console.log(`- Excelente: ${categories.excelente.length}`);
    console.log(`- Aspect Ratio incorrecto: ${aspectRatioErrors}`);
}
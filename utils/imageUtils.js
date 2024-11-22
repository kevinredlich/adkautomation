const sharp = require('sharp');

const EXPECTED_ASPECT_RATIO = 1;
const ASPECT_RATIO_TOLERANCE = 0.05;
const DISPLAY_WIDTH = 208;
const DISPLAY_HEIGHT = 208;
const QUALITY_THRESHOLD_MIN = 1000;

async function checkImageQuality(request, imageUrl) {
    const MAX_RETRIES = 3;
    let attempt = 0;
    let imageResponse;

    while (attempt < MAX_RETRIES) {
        try {
            imageResponse = await request.get(imageUrl, { timeout: 10000 });
            if (!imageResponse.ok()) {
                console.error(`Error al descargar la imagen ${imageUrl}:`, imageResponse.status());
                return null;
            }
            break;
        } catch (error) {
            console.error(`Intento ${attempt + 1} fallido para descargar la imagen ${imageUrl}:`, error);
            attempt += 1;
            if (attempt === MAX_RETRIES) {
                console.error(`Error permanente tras ${MAX_RETRIES} intentos.`);
                return null;
            }
        }
    }

    try {
        const imageBuffer = await imageResponse.body();
        const metadata = await sharp(imageBuffer).metadata();

        const aspectRatio = metadata.width / metadata.height;
        const isCorrectAspectRatio = Math.abs(aspectRatio - EXPECTED_ASPECT_RATIO) <= ASPECT_RATIO_TOLERANCE;

        const quality = await calculateImageQuality(imageBuffer);

        return {
            url: imageUrl,
            aspectRatio,
            width: metadata.width,
            height: metadata.height,
            isCorrectAspectRatio,
            quality
        };
    } catch (error) {
        console.error(`Error al verificar la calidad de la imagen ${imageUrl}:`, error);
        return null;
    }
}

async function calculateImageQuality(imageBuffer) {
    try {
        const { data } = await sharp(imageBuffer)
            .resize(DISPLAY_WIDTH, DISPLAY_HEIGHT, { fit: 'cover' })
            .greyscale()
            .convolve({ width: 3, height: 3, kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] })
            .raw()
            .toBuffer({ resolveWithObject: true });

        const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
        const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;

        return variance;
    } catch (error) {
        console.error('Error al calcular la calidad de la imagen:', error);
        return 0;
    }
}

module.exports = {
    checkImageQuality,
    calculateImageQuality,
    QUALITY_THRESHOLD_MIN
};

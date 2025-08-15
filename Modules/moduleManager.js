import * as DynamicFilters from './DynamicFilters/DynamicFilters.js';
import * as InteractiveItems from './InteractiveItems/InteractiveItems.js';
import * as ImageModal from './ImageModal/ImageModal.js';
import * as CornerDecorations from './CornerDecorations/CornerDecorations.js'
import * as TiltCards from './TiltCards/TiltCards.js'
import * as LoadImagesOptimized from './LoadImagesOptimized/LoadImagesOptimized.js';

export {
    DynamicFilters,
    InteractiveItems,
    ImageModal,
    CornerDecorations,
    TiltCards,
    LoadImagesOptimized
};

const modules = {
    DynamicFilters,
    InteractiveItems,
    ImageModal,
    CornerDecorations,
    TiltCards,
    LoadImagesOptimized
};

export async function LoadModules() {
    const loaders = Object.entries(modules)
        .filter(([_, mod]) => mod.hasCss)
        .map(([moduleName]) => loadCss(moduleName));

    await Promise.all(loaders);
}


async function loadCss(moduleName) {
    const cssUrl = `./Modules/${moduleName}/${moduleName}.css`;
    try {
        const cssRes = await fetch(cssUrl, { method: 'HEAD' });
        const contentType = cssRes.headers.get('content-type') || '';
        if (cssRes.ok && contentType.includes('css')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssUrl;
            document.head.insertBefore(link, document.head.firstChild);
        } else {
            throw new Error(`CSS not loaded — status: ${cssRes.status}`);
        }

    } catch (ex) {
        console.warn(`CSS not found or failed to load for ${moduleName}`, ex);
    }
}
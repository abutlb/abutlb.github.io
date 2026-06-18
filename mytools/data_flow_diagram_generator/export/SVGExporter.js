// export/SVGExporter.js

export class SVGExporter {
    static export(renderer, filename = 'مخطط-DFD') {
        const svgStr = renderer.buildExportSVG();
        if (!svgStr) return false;

        const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = filename + '.svg';
        a.click();
        URL.revokeObjectURL(url);
        return true;
    }
}

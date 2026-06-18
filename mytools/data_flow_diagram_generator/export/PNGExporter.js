// export/PNGExporter.js

export class PNGExporter {
    static export(renderer, filename = 'مخطط-DFD', scale = 2) {
        return new Promise((resolve, reject) => {
            const svgStr = renderer.buildExportSVG();
            if (!svgStr) { reject('no content'); return; }

            const blob = new Blob([svgStr], { type: 'image/svg+xml' });
            const url  = URL.createObjectURL(blob);
            const img  = new Image();

            img.onload = () => {
                const c   = document.createElement('canvas');
                c.width   = img.width  * scale;
                c.height  = img.height * scale;
                const ctx = c.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, c.width, c.height);
                ctx.scale(scale, scale);
                ctx.drawImage(img, 0, 0);

                const a    = document.createElement('a');
                a.href     = c.toDataURL('image/png');
                a.download = filename + '.png';
                a.click();
                URL.revokeObjectURL(url);
                resolve();
            };

            img.onerror = () => { URL.revokeObjectURL(url); reject('image load failed'); };
            img.src = url;
        });
    }

    static exportPDF(renderer, filename = 'مخطط-DFD') {
        return new Promise((resolve, reject) => {
            const svgStr = renderer.buildExportSVG();
            if (!svgStr) { reject('no content'); return; }

            const blob = new Blob([svgStr], { type: 'image/svg+xml' });
            const url  = URL.createObjectURL(blob);
            const img  = new Image();

            img.onload = () => {
                const c   = document.createElement('canvas');
                c.width   = img.width  * 2;
                c.height  = img.height * 2;
                const ctx = c.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, c.width, c.height);
                ctx.scale(2, 2);
                ctx.drawImage(img, 0, 0);

                const { jsPDF } = window.jspdf;
                const orient = img.width > img.height ? 'l' : 'p';
                const pdf    = new jsPDF({ orientation: orient, unit: 'px', format: [img.width, img.height] });
                pdf.addImage(c.toDataURL('image/png'), 'PNG', 0, 0, img.width, img.height);
                pdf.save(filename + '.pdf');
                URL.revokeObjectURL(url);
                resolve();
            };

            img.onerror = () => { URL.revokeObjectURL(url); reject('image load failed'); };
            img.src = url;
        });
    }
}

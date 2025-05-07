document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const qrText = document.getElementById('qr-text');
    const fgColor = document.getElementById('foreground-color');
    const bgColor = document.getElementById('background-color');
    const cornerRadius = document.getElementById('corner-radius');
    const cornerRadiusValue = document.getElementById('corner-radius-value');
    const logoUpload = document.getElementById('logo-upload');
    const errorCorrection = document.getElementById('error-correction');
    const qrSize = document.getElementById('qr-size');
    const qrSizeValue = document.getElementById('qr-size-value');
    const generateBtn = document.getElementById('generate-btn');
    const qrContainer = document.getElementById('qr-container');
    const downloadPng = document.getElementById('download-png');
    const downloadSvg = document.getElementById('download-svg');
    const downloadPdf = document.getElementById('download-pdf');
    
    // Variables
    let qrCanvas = null;
    let qrInstance = null;
    let logoImage = null;
    
    // Initialize download buttons as disabled
    downloadPng.disabled = true;
    downloadSvg.disabled = true;
    downloadPdf.disabled = true;
    
    // Update range input values
    cornerRadius.addEventListener('input', function() {
        cornerRadiusValue.textContent = `${this.value}%`;
    });
    
    qrSize.addEventListener('input', function() {
        qrSizeValue.textContent = this.value;
    });
    
    // Handle logo upload
    logoUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                logoImage = new Image();
                logoImage.src = event.target.result;
                logoImage.onload = function() {
                    // Auto-generate QR code if text is already entered
                    if (qrText.value.trim()) {
                        generateQRCode();
                    }
                };
            };
            reader.readAsDataURL(file);
        } else {
            logoImage = null;
        }
    });
    
    // Generate QR code
    generateBtn.addEventListener('click', generateQRCode);
    
    // Also generate QR code when pressing Enter in the text field
    qrText.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateQRCode();
        }
    });
    
    function generateQRCode() {
        const text = qrText.value.trim();
        if (!text) {
            alert('الرجاء إدخال نص أو عنوان URL لرمز QR الخاص بك');
            return;
        }
        
        // Clear previous QR code
        qrContainer.innerHTML = '';
        
        // Calculate size based on the slider value (5-10)
        const size = parseInt(qrSize.value) * 30; // Scale to reasonable pixel size
        
        // Create QR instance
        qrInstance = new QRious({
            element: document.createElement('canvas'),
            value: text,
            size: size,
            foreground: fgColor.value,
            background: bgColor.value,
            level: errorCorrection.value,
            padding: 10
        });
        
        qrCanvas = qrInstance.element;
        
        // Apply rounded corners and logo if needed
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = qrCanvas.width;
        finalCanvas.height = qrCanvas.height;
        const ctx = finalCanvas.getContext('2d');
        
        // Draw rounded rectangle if corner radius > 0
        const radius = parseInt(cornerRadius.value) * qrCanvas.width / 200;
        
        if (radius > 0) {
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(qrCanvas.width - radius, 0);
            ctx.quadraticCurveTo(qrCanvas.width, 0, qrCanvas.width, radius);
            ctx.lineTo(qrCanvas.width, qrCanvas.height - radius);
            ctx.quadraticCurveTo(qrCanvas.width, qrCanvas.height, qrCanvas.width - radius, qrCanvas.height);
            ctx.lineTo(radius, qrCanvas.height);
            ctx.quadraticCurveTo(0, qrCanvas.height, 0, qrCanvas.height - radius);
            ctx.lineTo(0, radius);
            ctx.quadraticCurveTo(0, 0, radius, 0);
            ctx.closePath();
            ctx.clip();
        }
        
        // Draw QR code
        ctx.drawImage(qrCanvas, 0, 0, qrCanvas.width, qrCanvas.height);
        
        // Add logo if uploaded
        if (logoImage) {
            const logoSize = qrCanvas.width / 4;
            const logoX = (qrCanvas.width - logoSize) / 2;
            const logoY = (qrCanvas.height - logoSize) / 2;
            
            // Draw white background for logo
            ctx.fillStyle = 'white';
            ctx.fillRect(logoX, logoY, logoSize, logoSize);
            
            // Draw logo
            ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
        }
        
        // Display the final QR code
        qrContainer.innerHTML = '';
        qrContainer.appendChild(finalCanvas);
        
        // Enable download buttons
        downloadPng.disabled = false;
        downloadSvg.disabled = false;
        downloadPdf.disabled = false;
    }
    
    // Download as PNG
    downloadPng.addEventListener('click', function() {
        if (!qrContainer.querySelector('canvas')) {
            alert('الرجاء إنشاء رمز QR أولاً');
            return;
        }
        
        const canvas = qrContainer.querySelector('canvas');
        const link = document.createElement('a');
        link.download = 'qr-gen-code.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
    
    // Download as SVG
    downloadSvg.addEventListener('click', function() {
        if (!qrContainer.querySelector('canvas')) {
            alert('الرجاء إنشاء رمز QR أولاً');
            return;
        }
        
        const canvas = qrContainer.querySelector('canvas');
        const svgData = canvasToSVG(canvas);
        
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = 'qr-gen-code.svg';
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
    });
    
    // Download as PDF
    downloadPdf.addEventListener('click', function() {
        if (!qrContainer.querySelector('canvas')) {
            alert('الرجاء إنشاء رمز QR أولاً');
            return;
        }
        
        const canvas = qrContainer.querySelector('canvas');
        const imgData = canvas.toDataURL('image/png');
        
        // Create PDF using jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
        });
        
        // Add title
        pdf.setFontSize(16);
        pdf.text('QR-Gen Code', 105, 20, { align: 'center' });
        
        // Calculate dimensions to fit on page
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = 100;
        const imgHeight = 100;
        const imgX = (pageWidth - imgWidth) / 2;
        const imgY = 30;
        
        // Add QR code
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight);
        
        // Add content info
        pdf.setFontSize(12);
        pdf.text(`المحتوى: ${qrText.value.substring(0, 50)}${qrText.value.length > 50 ? '...' : ''}`, 105, imgY + imgHeight + 10, { align: 'center' });
        
        // Add generation date
        const date = new Date();
        pdf.setFontSize(10);
        pdf.text(`تم الإنشاء في: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`, 105, pageHeight - 10, { align: 'center' });
        
        // Save PDF
        pdf.save('qr-gen-code.pdf');
    });
    
    // Helper function to convert canvas to SVG
    function canvasToSVG(canvas) {
        const width = canvas.width;
        const height = canvas.height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
        
        // Background
        svg += `<rect width="${width}" height="${height}" fill="${bgColor.value}"/>`;
        
        // QR code pixels
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3] / 255;
                
                // Only add non-background colored pixels
                if (!(r === 255 && g === 255 && b === 255) && a > 0) {
                    const color = `rgba(${r},${g},${b},${a})`;
                    svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
                }
            }
        }
        
        svg += '</svg>';
        return svg;
    }
    
    // Initialize with default values
    cornerRadiusValue.textContent = `${cornerRadius.value}%`;
    qrSizeValue.textContent = qrSize.value;
});

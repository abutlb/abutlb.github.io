document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const qrType = document.getElementById('qr-type');
    const qrText = document.getElementById('qr-text');
    const fgColor = document.getElementById('foreground-color');
    const bgColor = document.getElementById('background-color');
    const fgHex = document.getElementById('foreground-hex');
    const bgHex = document.getElementById('background-hex');
    const transparentBg = document.getElementById('transparent-bg');
    const cornerRadius = document.getElementById('corner-radius');
    const logoUpload = document.getElementById('logo-upload');
    const logoSize = document.getElementById('logo-size');
    const logoSizeValue = document.getElementById('logo-size-value');
    const logoRounded = document.getElementById('logo-rounded');
    const errorCorrection = document.getElementById('error-correction');
    const qrSize = document.getElementById('qr-size');
    const qrSizeValue = document.getElementById('qr-size-value');
    const qrMargin = document.getElementById('qr-margin');
    const qrMarginValue = document.getElementById('qr-margin-value');
    const generateBtn = document.getElementById('generate-btn');
    const qrContainer = document.getElementById('qr-container');
    const downloadPng = document.getElementById('download-png');
    const downloadSvg = document.getElementById('download-svg');
    const downloadPdf = document.getElementById('download-pdf');
    const colorPresets = document.querySelectorAll('.color-preset');
    const qrInputGroups = document.querySelectorAll('.qr-input-group');
    const qrStyleBtns = document.querySelectorAll('.qr-style-btn');
    
    // Variables
    let qrCodeStyling = null;
    let logoImage = null;
    let currentQRStyle = 'square';
    
    // Initialize download buttons as disabled
    downloadPng.disabled = true;
    downloadSvg.disabled = true;
    downloadPdf.disabled = true;
    
    // Color synchronization
    function syncColors() {
        fgColor.addEventListener('input', function() {
            fgHex.value = this.value.toUpperCase();
            if (getCurrentQRContent()) generateQRCode();
        });
        
        bgColor.addEventListener('input', function() {
            bgHex.value = this.value.toUpperCase();
            if (getCurrentQRContent()) generateQRCode();
        });
        
        fgHex.addEventListener('input', function() {
            if (isValidHex(this.value)) {
                fgColor.value = this.value;
                if (getCurrentQRContent()) generateQRCode();
            }
        });
        
        bgHex.addEventListener('input', function() {
            if (isValidHex(this.value)) {
                bgColor.value = this.value;
                if (getCurrentQRContent()) generateQRCode();
            }
        });
    }
    
    // Validate hex color
    function isValidHex(hex) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }
    
    // QR Type switching
    qrType.addEventListener('change', function() {
        // Hide all input groups
        qrInputGroups.forEach(group => {
            group.classList.add('hidden');
        });
        
        // Show selected input group
        let selectedGroup;
        if (this.value === 'text' || this.value === 'url') {
            selectedGroup = document.getElementById('text-input');
        } else {
            selectedGroup = document.getElementById(`${this.value}-input`);
        }
        
        if (selectedGroup) {
            selectedGroup.classList.remove('hidden');
        }
        
        // Clear previous QR code when type changes
        clearQRCode();
    });
    
    // Color preset handlers
    colorPresets.forEach(preset => {
        preset.addEventListener('click', function() {
            const color = this.dataset.color;
            const isForground = this.closest('.grid').children[0].contains(this);
            
            if (isForground) {
                fgColor.value = color;
                fgHex.value = color.toUpperCase();
            } else {
                if (color === 'transparent') {
                    transparentBg.checked = true;
                    bgColor.value = '#FFFFFF';
                    bgHex.value = '#FFFFFF';
                } else {
                    transparentBg.checked = false;
                    bgColor.value = color;
                    bgHex.value = color.toUpperCase();
                }
            }
            
            if (getCurrentQRContent()) generateQRCode();
        });
    });
    
    // Transparent background handler
    transparentBg.addEventListener('change', function() {
        if (this.checked) {
            bgColor.disabled = true;
            bgHex.disabled = true;
        } else {
            bgColor.disabled = false;
            bgHex.disabled = false;
        }
        
        if (getCurrentQRContent()) generateQRCode();
    });
    
    // QR Style handlers
    qrStyleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            qrStyleBtns.forEach(b => {
                b.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/30');
                b.classList.add('border-gray-300');
            });
            
            // Add active class to clicked button
            this.classList.remove('border-gray-300');
            this.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/30');
            
            // Update current style
            currentQRStyle = this.dataset.style;
            
            // Regenerate QR code with new style
            if (getCurrentQRContent()) generateQRCode();
        });
    });
    
    // Update corner radius checkbox
    cornerRadius.addEventListener('change', function() {
        if (getCurrentQRContent()) generateQRCode();
    });
    
    qrSize.addEventListener('input', function() {
        qrSizeValue.textContent = `${this.value}px`;
        if (getCurrentQRContent()) generateQRCode();
    });
    
    qrMargin.addEventListener('input', function() {
        qrMarginValue.textContent = this.value;
        if (getCurrentQRContent()) generateQRCode();
    });
    
    logoSize.addEventListener('input', function() {
        logoSizeValue.textContent = `${this.value}%`;
        if (getCurrentQRContent() && logoImage) generateQRCode();
    });
    
    logoRounded.addEventListener('change', function() {
        if (getCurrentQRContent() && logoImage) generateQRCode();
    });
    
    // Handle logo upload with preview
    logoUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('حجم الملف كبير جداً. يرجى اختيار صورة أصغر من 2 ميجابايت.');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                logoImage = event.target.result;
                // Auto-generate QR code if content is already entered
                if (getCurrentQRContent()) {
                    generateQRCode();
                }
            };
            reader.readAsDataURL(file);
        } else {
            logoImage = null;
            if (getCurrentQRContent()) generateQRCode();
        }
    });
    
    // Generate QR code with enhanced features
    generateBtn.addEventListener('click', generateQRCode);
    
    // Also generate QR code when pressing Enter in the text field
    qrText.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateQRCode();
        }
    });
    
    // Live preview on text change
    qrText.addEventListener('input', function() {
        if (this.value.trim()) {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(generateQRCode, 500);
        } else {
            clearQRCode();
        }
    });
    
    // Add event listeners for all QR type inputs
    function addQRTypeListeners() {
        const inputs = [
            'wifi-ssid', 'wifi-password', 'wifi-security', 'wifi-hidden',
            'contact-firstname', 'contact-lastname', 'contact-phone', 'contact-email', 'contact-organization',
            'email-address', 'email-subject', 'email-body',
            'sms-phone', 'sms-message',
            'phone-number',
            'location-lat', 'location-lng'
        ];
        
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', function() {
                    if (getCurrentQRContent()) {
                        clearTimeout(this.timeout);
                        this.timeout = setTimeout(generateQRCode, 500);
                    }
                });
            }
        });
    }
    
    // Get current QR content based on type
    function getCurrentQRContent() {
        const type = qrType.value;
        
        switch(type) {
            case 'text':
            case 'url':
                return qrText.value.trim();
                
            case 'wifi':
                const ssid = document.getElementById('wifi-ssid').value.trim();
                const password = document.getElementById('wifi-password').value.trim();
                const security = document.getElementById('wifi-security').value;
                const hidden = document.getElementById('wifi-hidden').checked;
                
                if (!ssid) return '';
                
                return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
                
            case 'contact':
                const firstName = document.getElementById('contact-firstname').value.trim();
                const lastName = document.getElementById('contact-lastname').value.trim();
                const phone = document.getElementById('contact-phone').value.trim();
                const email = document.getElementById('contact-email').value.trim();
                const org = document.getElementById('contact-organization').value.trim();
                
                if (!firstName && !lastName && !phone && !email) return '';
                
                const fullName = `${firstName} ${lastName}`.trim();
                return `BEGIN:VCARD\nVERSION:3.0\nFN:${fullName}\nORG:${org}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
                
            case 'email':
                const emailAddr = document.getElementById('email-address').value.trim();
                const subject = document.getElementById('email-subject').value.trim();
                const body = document.getElementById('email-body').value.trim();
                
                if (!emailAddr) return '';
                
                return `mailto:${emailAddr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                
            case 'sms':
                const smsPhone = document.getElementById('sms-phone').value.trim();
                const smsMessage = document.getElementById('sms-message').value.trim();
                
                if (!smsPhone) return '';
                
                return `sms:${smsPhone}?body=${encodeURIComponent(smsMessage)}`;
                
            case 'phone':
                const phoneNum = document.getElementById('phone-number').value.trim();
                
                if (!phoneNum) return '';
                
                return `tel:${phoneNum}`;
                
            case 'location':
                const lat = document.getElementById('location-lat').value.trim();
                const lng = document.getElementById('location-lng').value.trim();
                
                if (!lat || !lng) return '';
                
                return `geo:${lat},${lng}`;
                
            default:
                return '';
        }
    }
    
    function clearQRCode() {
        qrContainer.innerHTML = '<p class="text-gray-400 dark:text-gray-500 text-center">سيظهر رمز QR الخاص بك هنا</p>';
        downloadPng.disabled = true;
        downloadSvg.disabled = true;
        downloadPdf.disabled = true;
        qrCodeStyling = null;
    }
    
    function generateQRCode() {
        const content = getCurrentQRContent();
        if (!content) {
            alert('الرجاء إدخال البيانات المطلوبة لرمز QR الخاص بك');
            return;
        }
        
        try {
            // Clear previous QR code
            qrContainer.innerHTML = '';
            
            // Map styles to qr-code-styling formats
            const styleMapping = {
                'square': 'square',
                'dots': 'dots',
                'rounded': 'rounded'
            };
            
            // Determine background color
            const backgroundColor = transparentBg.checked ? 'transparent' : bgColor.value;
            
            // Create QR code options
            const qrOptions = {
                width: parseInt(qrSize.value),
                height: parseInt(qrSize.value),
                type: "canvas",
                data: content,
                margin: parseInt(qrMargin.value),
                qrOptions: {
                    typeNumber: 0,
                    mode: 'Byte',
                    errorCorrectionLevel: errorCorrection.value
                },
                imageOptions: {
                    hideBackgroundDots: true,
                    imageSize: parseInt(logoSize.value) / 100,
                    margin: 0,
                    crossOrigin: "anonymous",
                },
                dotsOptions: {
                    color: fgColor.value,
                    type: styleMapping[currentQRStyle] || 'square'
                },
                backgroundOptions: {
                    color: backgroundColor,
                },
                cornersSquareOptions: {
                    color: fgColor.value,
                    type: "square"
                },
                cornersDotOptions: {
                    color: fgColor.value,
                    type: "square"
                }
            };
            
            // Add logo if uploaded
            if (logoImage) {
                qrOptions.image = logoImage;
                qrOptions.imageOptions.hideBackgroundDots = true;
                qrOptions.imageOptions.imageSize = parseInt(logoSize.value) / 100;
                qrOptions.imageOptions.margin = logoRounded.checked ? 0 : 5;
            }
            
            // Apply corner radius if checked
            if (cornerRadius.checked) {
                qrOptions.cornersSquareOptions.type = "extra-rounded";
                qrOptions.cornersDotOptions.type = "dot";
            }
            
            // Create QR code
            qrCodeStyling = new QRCodeStyling(qrOptions);
            
            // Append to container
            qrCodeStyling.append(qrContainer);
            
            // Enable download buttons
            downloadPng.disabled = false;
            downloadSvg.disabled = false;
            downloadPdf.disabled = false;
            
        } catch (error) {
            console.error('خطأ في إنشاء رمز QR:', error);
            alert('حدث خطأ في إنشاء رمز QR. يرجى المحاولة مرة أخرى.');
        }
    }
    
    // Enhanced download functions
    downloadPng.addEventListener('click', function() {
        if (!qrCodeStyling) {
            alert('الرجاء إنشاء رمز QR أولاً');
            return;
        }
        
        qrCodeStyling.download({
            name: `qr-code-${Date.now()}`,
            extension: "png"
        });
    });
    
    downloadSvg.addEventListener('click', function() {
        if (!qrCodeStyling) {
            alert('الرجاء إنشاء رمز QR أولاً');
            return;
        }
        
        qrCodeStyling.download({
            name: `qr-code-${Date.now()}`,
            extension: "svg"
        });
    });
    
    downloadPdf.addEventListener('click', function() {
        if (!qrCodeStyling) {
            alert('الرجاء إنشاء رمز QR أولاً');
            return;
        }
        
        // For PDF, we'll get the canvas and create PDF using jsPDF
        const canvas = qrContainer.querySelector('canvas');
        if (!canvas) {
            alert('الرجاء إنشاء رمز QR أولاً');
            return;
        }
        
        const imgData = canvas.toDataURL('image/png');
        
        // Create PDF using jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Add title
        pdf.setFontSize(20);
        pdf.setTextColor(67, 97, 238);
        pdf.text('QR-Gen Professional', 105, 25, { align: 'center' });
        
        // Add QR code
        const qrSizeMM = 120;
        const qrX = (210 - qrSizeMM) / 2;
        const qrY = 40;
        
        pdf.addImage(imgData, 'PNG', qrX, qrY, qrSizeMM, qrSizeMM);
        
        // Add details
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text('تفاصيل رمز QR:', 20, qrY + qrSizeMM + 20);
        
        const qrContent = getCurrentQRContent();
        const qrTypeName = qrType.options[qrType.selectedIndex].text;
        
        const details = [
            `النوع: ${qrTypeName}`,
            `المحتوى: ${qrContent.substring(0, 60)}${qrContent.length > 60 ? '...' : ''}`,
            `الحجم: ${qrSize.value}px`,
            `النمط: ${currentQRStyle}`,
            `مستوى التصحيح: ${errorCorrection.options[errorCorrection.selectedIndex].text}`,
            `خلفية شفافة: ${transparentBg.checked ? 'نعم' : 'لا'}`,
            `تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}`,
            `الوقت: ${new Date().toLocaleTimeString('ar-SA')}`
        ];
        
        let yPos = qrY + qrSizeMM + 30;
        details.forEach(detail => {
            pdf.text(detail, 20, yPos);
            yPos += 8;
        });
        
        // Add footer
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text('تم إنشاء هذا المستند بواسطة QR-Gen Professional', 105, 280, { align: 'center' });
        
        pdf.save(`qr-code-professional-${Date.now()}.pdf`);
    });
    
    // Initialize
    syncColors();
    addQRTypeListeners();
    
    // Initialize with default values
    qrSizeValue.textContent = `${qrSize.value}px`;
    qrMarginValue.textContent = qrMargin.value;
    logoSizeValue.textContent = `${logoSize.value}%`;
    fgHex.value = fgColor.value.toUpperCase();
    bgHex.value = bgColor.value.toUpperCase();
});

        // Sample Size Calculator Logic
        class SampleSizeCalculator {
            constructor() {
                this.zScores = {
                    90: 1.645,
                    95: 1.96,
                    99: 2.576
                };
                this.initializeEventListeners();
            }

            initializeEventListeners() {
                document.getElementById('calculate-btn').addEventListener('click', () => this.calculate());
                
                // Example buttons
                document.querySelectorAll('.example-btn').forEach(btn => {
                    btn.addEventListener('click', () => this.loadExample(btn));
                });
                
                // Download, copy, and print buttons
                document.getElementById('copy-result').addEventListener('click', () => this.copyResult());
                document.getElementById('download-pdf').addEventListener('click', () => this.downloadPDF());
                document.getElementById('print-report').addEventListener('click', () => this.generatePrintReport());
                
                // Auto-calculate on input change (with debounce)
                const inputs = ['population-size', 'margin-error', 'confidence-level', 'expected-proportion', 'response-rate'];
                inputs.forEach(id => {
                    const element = document.getElementById(id);
                    element.addEventListener('input', this.debounce(() => {
                        if (this.hasValidInputs()) {
                            this.calculate();
                        }
                    }, 500));
                });
            }

            debounce(func, wait) {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            }

            hasValidInputs() {
                const marginError = parseFloat(document.getElementById('margin-error').value);
                const expectedProportion = parseFloat(document.getElementById('expected-proportion').value);
                return marginError > 0 && expectedProportion > 0 && expectedProportion <= 100;
            }

            calculate() {
                try {
                    // Get input values
                    const populationSize = document.getElementById('population-size').value ? 
                        parseInt(document.getElementById('population-size').value) : null;
                    const marginError = parseFloat(document.getElementById('margin-error').value) / 100;
                    const confidenceLevel = parseInt(document.getElementById('confidence-level').value);
                    const expectedProportion = parseFloat(document.getElementById('expected-proportion').value) / 100;
                    const responseRate = document.getElementById('response-rate').value ? 
                        parseFloat(document.getElementById('response-rate').value) / 100 : null;

                    // Validation
                    if (!marginError || marginError <= 0 || marginError > 1) {
                        throw new Error('هامش الخطأ يجب أن يكون بين 0.1% و 100%');
                    }
                    if (!expectedProportion || expectedProportion <= 0 || expectedProportion > 1) {
                        throw new Error('النسبة المتوقعة يجب أن تكون بين 1% و 100%');
                    }
                    if (populationSize && populationSize < 1) {
                        throw new Error('حجم المجتمع يجب أن يكون أكبر من صفر');
                    }
                    if (responseRate && (responseRate <= 0 || responseRate > 1)) {
                        throw new Error('معدل الاستجابة يجب أن يكون بين 1% و 100%');
                    }

                    // Calculate sample size
                    const result = this.calculateSampleSize(
                        populationSize, marginError, confidenceLevel, expectedProportion, responseRate
                    );

                    // Display results
                    this.displayResults(result);

                } catch (error) {
                    alert('خطأ في الحساب: ' + error.message);
                }
            }

            calculateSampleSize(populationSize, marginError, confidenceLevel, expectedProportion, responseRate) {
                const zScore = this.zScores[confidenceLevel];
                const p = expectedProportion;
                const q = 1 - p;

                // Basic sample size calculation (infinite population)
                let sampleSize = Math.pow(zScore, 2) * p * q / Math.pow(marginError, 2);

                // Finite population correction if population size is provided
                let adjustedSampleSize = sampleSize;
                if (populationSize && populationSize > 0) {
                    adjustedSampleSize = sampleSize / (1 + (sampleSize - 1) / populationSize);
                }

                // Round up to ensure adequate sample size
                adjustedSampleSize = Math.ceil(adjustedSampleSize);

                // Adjust for response rate if provided
                let adjustedForResponse = null;
                if (responseRate && responseRate > 0) {
                    adjustedForResponse = Math.ceil(adjustedSampleSize / responseRate);
                }

                return {
                    basicSampleSize: Math.ceil(sampleSize),
                    adjustedSampleSize: adjustedSampleSize,
                    adjustedForResponse: adjustedForResponse,
                    zScore: zScore,
                    marginError: marginError * 100,
                    confidenceLevel: confidenceLevel,
                    expectedProportion: expectedProportion * 100,
                    populationSize: populationSize,
                    responseRate: responseRate ? responseRate * 100 : null
                };
            }

            displayResults(result) {
                // Show results container
                document.getElementById('results-container').classList.remove('hidden');

                // Display main result
                document.getElementById('sample-size-number').textContent = result.adjustedSampleSize.toLocaleString('ar');

                // Display adjusted result if response rate is provided
                const adjustedResult = document.getElementById('adjusted-result');
                if (result.adjustedForResponse) {
                    document.getElementById('adjusted-sample-size').textContent = result.adjustedForResponse.toLocaleString('ar');
                    adjustedResult.classList.remove('hidden');
                } else {
                    adjustedResult.classList.add('hidden');
                }

                // Check for warnings
                this.checkForWarnings(result);

                // Generate interpretation
                this.generateInterpretation(result);

                // Store result for copying/downloading
                this.currentResult = result;
            }

            checkForWarnings(result) {
                const warningResult = document.getElementById('warning-result');
                const warningText = document.getElementById('warning-text');

                let showWarning = false;
                let warningMessage = '';

                // Check if sample size is too large compared to population
                if (result.populationSize && result.adjustedSampleSize > result.populationSize * 0.5) {
                    showWarning = true;
                    warningMessage = `حجم العينة المطلوب (${result.adjustedSampleSize.toLocaleString('ar')}) كبير جداً مقارنة بحجم المجتمع (${result.populationSize.toLocaleString('ar')}). قد يكون من الأفضل إجراء دراسة شاملة بدلاً من العينة.`;
                }
                // Check if sample size equals or exceeds population
                else if (result.populationSize && result.adjustedSampleSize >= result.populationSize) {
                    showWarning = true;
                    warningMessage = `حجم العينة المطلوب يساوي أو يتجاوز حجم المجتمع. يُنصح بإجراء دراسة شاملة لجميع أفراد المجتمع.`;
                }
                // Check for very low response rate
                else if (result.responseRate && result.responseRate < 30) {
                    showWarning = true;
                    warningMessage = `معدل الاستجابة المتوقع منخفض جداً (${result.responseRate}%). قد تحتاج لاستراتيجيات إضافية لزيادة المشاركة.`;
                }

                if (showWarning) {
                    warningText.textContent = warningMessage;
                    warningResult.classList.remove('hidden');
                } else {
                    warningResult.classList.add('hidden');
                }
            }

            generateInterpretation(result) {
                const interpretationText = document.getElementById('interpretation-text');
                
                let interpretation = `بناءً على المعايير المحددة، `;
                
                if (result.populationSize) {
                    interpretation += `من مجتمع قوامه ${result.populationSize.toLocaleString('ar')} فرد، `;
                }
                
                interpretation += `تحتاج إلى عينة من ${result.adjustedSampleSize.toLocaleString('ar')} مشارك `;
                interpretation += `للحصول على نتائج بمستوى ثقة ${result.confidenceLevel}% `;
                interpretation += `وهامش خطأ ${result.marginError}%. `;

                if (result.adjustedForResponse) {
                    const additional = result.adjustedForResponse - result.adjustedSampleSize;
                    interpretation += `\n\nبسبب معدل الاستجابة المتوقع (${result.responseRate}%)، `;
                    interpretation += `يُنصح بدعوة ${result.adjustedForResponse.toLocaleString('ar')} شخص `;
                    interpretation += `(${additional.toLocaleString('ar')} إضافي) لضمان الحصول على العدد المطلوب من المشاركين الفعليين.`;
                }

                interpretation += `\n\nهذا الحساب يستند إلى القيمة المعيارية Z = ${result.zScore} `;
                interpretation += `والنسبة المتوقعة ${result.expectedProportion}%.`;

                interpretationText.textContent = interpretation;
            }

            loadExample(button) {
                const data = button.dataset;
                
                document.getElementById('population-size').value = data.population;
                document.getElementById('margin-error').value = data.margin;
                document.getElementById('confidence-level').value = data.confidence;
                document.getElementById('expected-proportion').value = data.proportion;
                document.getElementById('response-rate').value = data.response;

                // Auto calculate
                this.calculate();
            }

            copyResult() {
                if (!this.currentResult) return;

                const result = this.currentResult;
                let text = `نتائج حساب حجم العينة:\n\n`;
                text += `حجم العينة المطلوب: ${result.adjustedSampleSize.toLocaleString('ar')}\n`;
                
                if (result.adjustedForResponse) {
                    text += `الحجم مع تعويض عدم الاستجابة: ${result.adjustedForResponse.toLocaleString('ar')}\n`;
                }
                
                text += `\nالمعايير المستخدمة:\n`;
                if (result.populationSize) {
                    text += `• حجم المجتمع: ${result.populationSize.toLocaleString('ar')}\n`;
                }
                text += `• هامش الخطأ: ${result.marginError}%\n`;
                text += `• مستوى الثقة: ${result.confidenceLevel}%\n`;
                text += `• النسبة المتوقعة: ${result.expectedProportion}%\n`;
                if (result.responseRate) {
                    text += `• معدل الاستجابة المتوقع: ${result.responseRate}%\n`;
                }

                navigator.clipboard.writeText(text).then(() => {
                    // Show success message
                    const btn = document.getElementById('copy-result');
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check"></i>تم النسخ!';
                    btn.classList.remove('bg-green-500', 'hover:bg-green-600');
                    btn.classList.add('bg-green-600');
                    
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.classList.remove('bg-green-600');
                        btn.classList.add('bg-green-500', 'hover:bg-green-600');
                    }, 2000);
                }).catch(() => {
                    alert('فشل في نسخ النتيجة');
                });
            }

            downloadPDF() {
                if (!this.currentResult) return;

                // Prevent multiple clicks
                const btn = document.getElementById('download-pdf');
                if (btn.disabled) return;
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء PDF...';

                setTimeout(() => {
                    try {
                        this.generateArabicPDF();
                    } catch (error) {
                        console.error('Error generating PDF:', error);
                        alert('حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.');
                    } finally {
                        // Re-enable button
                        btn.disabled = false;
                        btn.innerHTML = '<i class="fas fa-file-pdf"></i>تحميل PDF';
                    }
                }, 100);
            }

            generateAdvancedPDF() {
                const result = this.currentResult;
                const currentDate = new Date().toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                // Create individual pages as separate elements
                const pages = [];

                // PAGE 1: Cover Page
                const page1 = document.createElement('div');
                page1.style.cssText = `
                    width: 210mm; 
                    height: 297mm; 
                    padding: 40mm; 
                    display: flex; 
                    flex-direction: column; 
                    justify-content: center; 
                    align-items: center; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    text-align: center; 
                    position: relative;
                    font-family: 'Tajawal', Arial, sans-serif;
                    direction: rtl;
                    box-sizing: border-box;
                `;
                page1.innerHTML = `
                    <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 60px; border-radius: 20px; border: 2px solid rgba(255,255,255,0.2);">
                        <h1 style="margin: 0 0 20px 0; font-size: 36px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                            تقرير حساب حجم العينة الإحصائية
                        </h1>
                        <p style="margin: 0 0 30px 0; font-size: 18px; opacity: 0.9;">
                            Sample Size Calculation Report
                        </p>
                        
                        <div style="background: rgba(255,255,255,0.2); padding: 30px; border-radius: 15px; margin: 30px 0;">
                            <div style="font-size: 48px; font-weight: bold; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                                ${result.adjustedSampleSize.toLocaleString('ar')}
                            </div>
                            <div style="font-size: 20px; opacity: 0.9;">
                                حجم العينة المطلوب
                            </div>
                        </div>
                        
                        <div style="margin-top: 40px; font-size: 16px; opacity: 0.9;">
                            <p style="margin: 10px 0;">مستوى الثقة: <strong>${result.confidenceLevel}%</strong></p>
                            <p style="margin: 10px 0;">هامش الخطأ: <strong>±${result.marginError}%</strong></p>
                            <p style="margin: 10px 0;">تاريخ الإنشاء: <strong>${currentDate}</strong></p>
                        </div>
                    </div>
                    
                    <div style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; opacity: 0.8; font-size: 12px;">
                        <p style="margin: 0;">إعداد: <strong>عبدالله التويجري</strong></p>
                        <p style="margin: 5px 0 0 0;">abutlb.github.io</p>
                    </div>
                `;
                pages.push(page1);

                // PAGE 2: Executive Summary
                const page2 = document.createElement('div');
                page2.style.cssText = `
                    width: 210mm; 
                    height: 297mm; 
                    padding: 30mm; 
                    position: relative;
                    font-family: 'Tajawal', Arial, sans-serif;
                    direction: rtl;
                    box-sizing: border-box;
                    background: white;
                `;
                page2.innerHTML = `
                    <div style="text-align: center; margin-bottom: 40px; padding: 25px; background: linear-gradient(135deg, #4361ee, #7c3aed); color: white; border-radius: 15px;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">الملخص التنفيذي</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Executive Summary</p>
                    </div>

                    <div style="background: #f0f9ff; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px; border: 2px solid #4361ee;">
                        <h2 style="color: #4361ee; margin: 0 0 20px 0; font-size: 24px;">النتيجة الرئيسية</h2>
                        <div style="font-size: 56px; font-weight: bold; color: #1f2937; margin: 20px 0;">
                            ${result.adjustedSampleSize.toLocaleString('ar')}
                        </div>
                        <p style="margin: 0; color: #6b7280; font-size: 20px; font-weight: 500;">حجم العينة المطلوب للدراسة</p>
                    </div>

                    ${result.adjustedForResponse ? `
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 15px; margin-bottom: 30px; border: 2px solid #f59e0b;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <span style="background: #f59e0b; color: white; padding: 8px 20px; border-radius: 10px; font-size: 16px; font-weight: bold;">
                                توصية مهمة
                            </span>
                        </div>
                        <div style="text-align: center;">
                            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 20px;">العدد المطلوب دعوته</h3>
                            <div style="font-size: 42px; font-weight: bold; color: #92400e; margin: 10px 0;">
                                ${result.adjustedForResponse.toLocaleString('ar')}
                            </div>
                            <p style="color: #92400e; font-size: 16px; margin: 10px 0;">شخص يجب دعوته للمشاركة</p>
                        </div>
                    </div>
                    ` : ''}

                    <div style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
                        <p style="margin: 0;">إعداد: <strong>عبدالله التويجري</strong> | abutlb.github.io</p>
                    </div>
                `;
                pages.push(page2);

                // Continue with other pages...
                // PAGE 3: Parameters Details
                const page3 = document.createElement('div');
                page3.style.cssText = `
                    width: 210mm; 
                    height: 297mm; 
                    padding: 30mm; 
                    position: relative;
                    font-family: 'Tajawal', Arial, sans-serif;
                    direction: rtl;
                    box-sizing: border-box;
                    background: white;
                `;
                page3.innerHTML = `
                    <div style="text-align: center; margin-bottom: 40px; padding: 25px; background: linear-gradient(135deg, #4361ee, #7c3aed); color: white; border-radius: 15px;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">المعايير والمتغيرات</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Parameters & Variables Analysis</p>
                    </div>

                    <div style="display: grid; gap: 20px; margin-bottom: 40px;">
                        ${result.populationSize ? `
                        <div style="background: #f9fafb; padding: 25px; border-radius: 12px; border-right: 6px solid #4361ee;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h3 style="margin: 0; color: #4361ee; font-size: 18px;">حجم المجتمع الكلي</h3>
                                <span style="font-size: 24px; color: #4361ee; font-weight: bold;">${result.populationSize.toLocaleString('ar')} فرد</span>
                            </div>
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                العدد الإجمالي للوحدات في المجتمع المستهدف للدراسة
                            </p>
                        </div>
                        ` : `
                        <div style="background: #f9fafb; padding: 25px; border-radius: 12px; border-right: 6px solid #4361ee;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h3 style="margin: 0; color: #4361ee; font-size: 18px;">حجم المجتمع</h3>
                                <span style="font-size: 20px; color: #4361ee; font-weight: bold;">غير محدود / كبير جداً</span>
                            </div>
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                مجتمع كبير أو غير معروف الحجم (أكثر من 100,000)
                            </p>
                        </div>
                        `}
                        
                        <div style="background: #fef2f2; padding: 25px; border-radius: 12px; border-right: 6px solid #dc2626;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h3 style="margin: 0; color: #dc2626; font-size: 18px;">هامش الخطأ المقبول</h3>
                                <span style="font-size: 24px; color: #dc2626; font-weight: bold;">±${result.marginError}%</span>
                            </div>
                            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                النسبة المئوية للخطأ المسموح به في النتائج النهائية
                            </p>
                        </div>
                    </div>

                    <div style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
                        <p style="margin: 0;">إعداد: <strong>عبدالله التويجري</strong> | abutlb.github.io</p>
                    </div>
                `;
                pages.push(page3);

                // Now generate PDF using jsPDF with proper page handling
                this.generatePDFFromPages(pages, result);
            }

            generatePDFFromPages(pages, result) {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
                let pageNumber = 0;

                const processNextPage = (index) => {
                    if (index >= pages.length) {
                        // All pages processed, save the PDF
                        const fileName = `sample-size-report-${new Date().toISOString().split('T')[0]}-عبدالله-التويجري.pdf`;
                        doc.save(fileName);
                        
                        // Show success message
                        const btn = document.getElementById('download-pdf');
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '<i class="fas fa-check text-green-500"></i> تم التحميل بنجاح!';
                        setTimeout(() => {
                            btn.innerHTML = originalText;
                        }, 3000);
                        return;
                    }

                    // Add page to document body temporarily
                    const page = pages[index];
                    document.body.appendChild(page);

                    // Convert page to canvas
                    html2canvas(page, {
                        scale: 1.5,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff',
                        width: page.offsetWidth,
                        height: page.offsetHeight,
                        windowWidth: page.offsetWidth,
                        windowHeight: page.offsetHeight
                    }).then(canvas => {
                        // Remove page from DOM
                        document.body.removeChild(page);

                        // Add new page if not first page
                        if (pageNumber > 0) {
                            doc.addPage();
                        }
                        pageNumber++;

                        // Add image to PDF
                        const imgWidth = 210; // A4 width in mm
                        const imgHeight = 297; // A4 height in mm
                        const imgData = canvas.toDataURL('image/png', 1.0);
                        
                        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

                        // Process next page
                        setTimeout(() => processNextPage(index + 1), 100);
                    }).catch(error => {
                        console.error('Error processing page:', error);
                        // Remove page from DOM even if error
                        if (document.body.contains(page)) {
                            document.body.removeChild(page);
                        }
                        // Continue with next page
                        setTimeout(() => processNextPage(index + 1), 100);
                    });
                };

                // Start processing pages
                processNextPage(0);
            }

            generateArabicPDF() {
                const result = this.currentResult;
                const currentDate = new Date().toLocaleDateString('ar-SA', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                });

                // Check if html2canvas is available for advanced PDF, otherwise use fallback
                if (window.html2canvas) {
                    this.generateAdvancedPDF();
                } else {
                    this.generateFallbackPDF();
                }
            }

            generateAdvancedPDF() {
                const result = this.currentResult;
                const currentDate = new Date().toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                // Create individual pages as separate elements
                const pages = [];

                // PAGE 1: Cover Page
                const page1 = document.createElement('div');
                page1.style.cssText = `
                    width: 794px; 
                    height: 1123px; 
                    padding: 60px; 
                    display: flex; 
                    flex-direction: column; 
                    justify-content: center; 
                    align-items: center; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    text-align: center; 
                    position: relative;
                    font-family: 'Tajawal', Arial, sans-serif;
                    direction: rtl;
                    box-sizing: border-box;
                `;
                page1.innerHTML = `
                    <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 80px 60px; border-radius: 25px; border: 2px solid rgba(255,255,255,0.2); width: 100%; max-width: 600px;">
                        <h1 style="margin: 0 0 30px 0; font-size: 42px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); line-height: 1.2;">
                            تقرير حساب حجم العينة الإحصائية
                        </h1>
                        <p style="margin: 0 0 40px 0; font-size: 20px; opacity: 0.9;">
                            Sample Size Calculation Report
                        </p>
                        
                        <div style="background: rgba(255,255,255,0.2); padding: 40px; border-radius: 20px; margin: 40px 0;">
                            <div style="font-size: 64px; font-weight: bold; margin-bottom: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                                ${result.adjustedSampleSize.toLocaleString('ar')}
                            </div>
                            <div style="font-size: 24px; opacity: 0.9; font-weight: 500;">
                                حجم العينة المطلوب
                            </div>
                        </div>
                        
                        <div style="margin-top: 50px; font-size: 18px; opacity: 0.9; line-height: 1.6;">
                            <p style="margin: 15px 0;">مستوى الثقة: <strong>${result.confidenceLevel}%</strong></p>
                            <p style="margin: 15px 0;">هامش الخطأ: <strong>±${result.marginError}%</strong></p>
                            <p style="margin: 15px 0;">تاريخ الإنشاء: <strong>${currentDate}</strong></p>
                        </div>
                    </div>
                    
                    <div style="position: absolute; bottom: 40px; left: 0; right: 0; text-align: center; opacity: 0.8; font-size: 14px;">
                        <p style="margin: 0 0 5px 0;">إعداد: <strong>عبدالله التويجري</strong></p>
                        <p style="margin: 0;">abutlb.github.io</p>
                    </div>
                `;
                pages.push(page1);

                // PAGE 2: Parameters Details
                const page2 = document.createElement('div');
                page2.style.cssText = `
                    width: 794px; 
                    height: 1123px; 
                    padding: 60px; 
                    position: relative;
                    font-family: 'Tajawal', Arial, sans-serif;
                    direction: rtl;
                    box-sizing: border-box;
                    background: white;
                    color: #1f2937;
                `;
                page2.innerHTML = `
                    <div style="text-align: center; margin-bottom: 50px; padding: 30px; background: linear-gradient(135deg, #4361ee, #7c3aed); color: white; border-radius: 20px;">
                        <h1 style="margin: 0; font-size: 32px; font-weight: bold;">المعايير المستخدمة في الحساب</h1>
                        <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">Parameters Used in Calculation</p>
                    </div>

                    <div style="margin-bottom: 50px;">
                        ${result.populationSize ? `
                        <div style="background: #f0f9ff; padding: 30px; border-radius: 15px; margin-bottom: 25px; border: 2px solid #3b82f6;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h3 style="margin: 0; color: #1e40af; font-size: 22px; font-weight: bold;">حجم المجتمع الكلي</h3>
                                <span style="font-size: 28px; color: #1e40af; font-weight: bold;">${result.populationSize.toLocaleString('ar')} فرد</span>
                            </div>
                            <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                                العدد الإجمالي للوحدات في المجتمع المستهدف للدراسة. هذا الرقم يؤثر على حجم العينة المطلوب حيث يتم تطبيق تصحيح المجتمع المحدود.
                            </p>
                        </div>
                        ` : `
                        <div style="background: #f0f9ff; padding: 30px; border-radius: 15px; margin-bottom: 25px; border: 2px solid #3b82f6;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h3 style="margin: 0; color: #1e40af; font-size: 22px; font-weight: bold;">حجم المجتمع</h3>
                                <span style="font-size: 22px; color: #1e40af; font-weight: bold;">غير محدود / كبير جداً</span>
                            </div>
                            <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                                مجتمع كبير جداً أو غير معروف الحجم (أكثر من 100,000). في هذه الحالة لا يتم تطبيق تصحيح المجتمع المحدود.
                            </p>
                        </div>
                        `}
                        
                        <div style="background: #fef2f2; padding: 30px; border-radius: 15px; margin-bottom: 25px; border: 2px solid #dc2626;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h3 style="margin: 0; color: #dc2626; font-size: 22px; font-weight: bold;">هامش الخطأ المقبول</h3>
                                <span style="font-size: 28px; color: #dc2626; font-weight: bold;">±${result.marginError}%</span>
                            </div>
                            <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                                النسبة المئوية للخطأ المسموح به في النتائج النهائية. كلما قل هامش الخطأ، زادت دقة النتائج ولكن زاد حجم العينة المطلوب.
                            </p>
                        </div>

                        <div style="background: #f0fdf4; padding: 30px; border-radius: 15px; margin-bottom: 25px; border: 2px solid #22c55e;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h3 style="margin: 0; color: #15803d; font-size: 22px; font-weight: bold;">مستوى الثقة</h3>
                                <span style="font-size: 28px; color: #15803d; font-weight: bold;">${result.confidenceLevel}%</span>
                            </div>
                            <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                                درجة اليقين بأن النتائج تمثل المجتمع الحقيقي. ${result.confidenceLevel}% يعني أن النتائج ستكون صحيحة في ${result.confidenceLevel} حالة من أصل 100 لو تم تكرار الدراسة.
                            </p>
                        </div>

                        <div style="background: #faf5ff; padding: 30px; border-radius: 15px; border: 2px solid #8b5cf6;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h3 style="margin: 0; color: #7c3aed; font-size: 22px; font-weight: bold;">النسبة المتوقعة</h3>
                                <span style="font-size: 28px; color: #7c3aed; font-weight: bold;">${result.expectedProportion}%</span>
                            </div>
                            <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                                التقدير المبدئي لنسبة الأشخاص الذين سيجيبون إيجابياً أو يحملون الخاصية المدروسة في المجتمع.
                            </p>
                        </div>
                    </div>

                    <div style="position: absolute; bottom: 40px; left: 0; right: 0; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
                        <p style="margin: 0;">إعداد: <strong>عبدالله التويجري</strong> | abutlb.github.io</p>
                    </div>
                `;
                pages.push(page2);

                // PAGE 3: Statistical Formula
                const page3 = document.createElement('div');
                page3.style.cssText = `
                    width: 794px; 
                    height: 1123px; 
                    padding: 60px; 
                    position: relative;
                    font-family: 'Tajawal', Arial, sans-serif;
                    direction: rtl;
                    box-sizing: border-box;
                    background: white;
                    color: #1f2937;
                `;
                page3.innerHTML = `
                                        <!-- Statistical Formula Section -->
                    <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #475569;">
                        <div style="text-align: center; margin-bottom: 15px;">
                            <h2 style="color: #fbbf24; margin: 0; font-size: 18px; font-weight: bold;">📊 الأساس الإحصائي للحساب</h2>
                            <p style="color: #cbd5e1; margin: 5px 0 0 0; font-size: 12px;">Statistical Foundation of the Calculation</p>
                        </div>

                        <!-- Formula Type Indicator -->
                        <div style="text-align: center; margin-bottom: 15px;">
                            <div style="display: inline-block; background: ${result.populationSize ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; font-size: 12px;">
                                ${result.populationSize ? '🎯 مجتمع محدود الحجم' : '🌐 مجتمع كبير أو غير محدود'}
                            </div>
                        </div>

                        <!-- Main Formula Display -->
                        <div style="background: #0f172a; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #475569;">
                            <div style="text-align: center; margin-bottom: 8px;">
                                <span style="color: #94a3b8; font-size: 11px;">الصيغة المستخدمة:</span>
                            </div>
                            
                            <div style="font-family: 'Times New Roman', serif; font-size: 18px; text-align: center; direction: ltr; line-height: 1.5;">
                                ${result.populationSize ? `
                                <!-- Finite Population Formula -->
                                <div style="color: #ffffff; margin-bottom: 10px;">
                                    <span style="color: #60a5fa; font-style: italic; font-size: 20px; font-weight: bold;">n</span>
                                    <span style="color: #e2e8f0; margin: 0 8px; font-size: 18px;">=</span>
                                </div>
                                
                                <div style="background: rgba(16,185,129,0.15); padding: 10px; border-radius: 6px; margin: 8px 0; border: 1px solid #10b981;">
                                    <div style="color: #10b981; font-size: 14px; margin-bottom: 3px;">
                                        Z² × p × (1 - p) / e²
                                    </div>
                                    <div style="border-top: 1px solid #64748b; margin: 5px 0; padding-top: 5px; color: #f59e0b; font-size: 12px;">
                                        1 + [(Z² × p × (1-p) / e²) - 1] / N
                                    </div>
                                </div>
                                
                                <div style="color: #94a3b8; font-size: 10px; margin-top: 5px;">
                                    (تصحيح المجتمع المحدود)
                                </div>
                                ` : `
                                <!-- Infinite Population Formula -->
                                <div style="color: #ffffff;">
                                    <span style="color: #60a5fa; font-style: italic; font-size: 22px; font-weight: bold;">n</span>
                                    <span style="color: #e2e8f0; margin: 0 12px; font-size: 20px;">=</span>
                                    <span style="background: rgba(16,185,129,0.15); padding: 8px 15px; border-radius: 6px; color: #10b981; border: 1px solid #10b981; font-size: 16px;">
                                        Z² × p × (1 - p) / e²
                                    </span>
                                </div>
                                `}
                            </div>
                        </div>

                        <!-- Variables Explanation -->
                        <div style="background: rgba(51,65,85,0.4); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                            <h4 style="color: #fbbf24; margin: 0 0 10px 0; font-size: 14px; text-align: center; font-weight: bold;">
                                🔍 شرح المتغيرات
                            </h4>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
                                <div style="background: rgba(96,165,250,0.1); padding: 8px; border-radius: 4px; border-right: 2px solid #60a5fa; direction: rtl;">
                                    <div style="color: #60a5fa; font-weight: bold; margin-bottom: 3px; font-size: 11px;">
                                        n = حجم العينة
                                    </div>
                                    <div style="color: #cbd5e1; font-size: 9px;">
                                        عدد الوحدات اللازمة
                                    </div>
                                </div>
                                
                                <div style="background: rgba(139,92,246,0.1); padding: 8px; border-radius: 4px; border-right: 2px solid #8b5cf6; direction: rtl;">
                                    <div style="color: #8b5cf6; font-weight: bold; margin-bottom: 3px; font-size: 11px;">
                                        Z = ${result.zScore}
                                    </div>
                                    <div style="color: #cbd5e1; font-size: 9px;">
                                        ثقة ${result.confidenceLevel}%
                                    </div>
                                </div>
                                
                                <div style="background: rgba(6,182,212,0.1); padding: 8px; border-radius: 4px; border-right: 2px solid #06b6d4; direction: rtl;">
                                    <div style="color: #06b6d4; font-weight: bold; margin-bottom: 3px; font-size: 11px;">
                                        p = ${result.expectedProportion}%
                                    </div>
                                    <div style="color: #cbd5e1; font-size: 9px;">
                                        النسبة المتوقعة
                                    </div>
                                </div>
                                
                                <div style="background: rgba(244,63,94,0.1); padding: 8px; border-radius: 4px; border-right: 2px solid #f43f5e; direction: rtl;">
                                    <div style="color: #f43f5e; font-weight: bold; margin-bottom: 3px; font-size: 11px;">
                                        e = ${result.marginError}%
                                    </div>
                                    <div style="color: #cbd5e1; font-size: 9px;">
                                        هامش الخطأ
                                    </div>
                                </div>
                                
                                ${result.populationSize ? `
                                <div style="grid-column: span 2; background: rgba(16,185,129,0.1); padding: 8px; border-radius: 4px; border-right: 2px solid #10b981; direction: rtl;">
                                    <div style="color: #10b981; font-weight: bold; margin-bottom: 3px; font-size: 11px;">
                                        N = ${result.populationSize.toLocaleString('ar')}
                                    </div>
                                    <div style="color: #cbd5e1; font-size: 9px;">
                                        حجم المجتمع الكلي
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Formula Application Context -->
                        <div style="background: rgba(59,130,246,0.1); padding: 10px; border-radius: 6px; border: 1px solid #3b82f6; margin-bottom: 8px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                <span style="color: #3b82f6; font-size: 14px;">💡</span>
                                <h4 style="color: #3b82f6; margin: 0; font-size: 12px; font-weight: bold;">متى نستخدم هذه الصيغة؟</h4>
                            </div>
                            
                            <div style="color: #cbd5e1; font-size: 10px; line-height: 1.4;">
                                ${result.populationSize ? `
                                <p style="margin: 0 0 4px 0;">
                                    🎯 <strong>للمجتمعات المحدودة:</strong> حجم معروف ومحدود
                                </p>
                                <p style="margin: 0;">
                                    ✅ <strong>الفائدة:</strong> تقليل حجم العينة مع نفس الدقة
                                </p>
                                ` : `
                                <p style="margin: 0 0 4px 0;">
                                    🌐 <strong>للمجتمعات الكبيرة:</strong> غير محدود الحجم
                                </p>
                                <p style="margin: 0;">
                                    ✅ <strong>الاستخدام:</strong> الأسلوب المعياري للبحوث الكبيرة
                                </p>
                                `}
                            </div>
                        </div>

                        <!-- Statistical Accuracy Note -->
                        <div style="text-align: center; padding: 8px; background: rgba(251,191,36,0.1); border-radius: 4px; border: 1px dashed #fbbf24;">
                            <span style="color: #fbbf24; font-size: 10px; font-weight: bold;">
                                📈 دقة الحساب: ${result.confidenceLevel}% ثقة مع هامش خطأ ±${result.marginError}%
                            </span>
                        </div>
                    </div>

                    <div style="position: absolute; bottom: 40px; left: 0; right: 0; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
                        <p style="margin: 0;">إعداد: <strong>عبدالله التويجري</strong> | abutlb.github.io</p>
                    </div>
                `;
                pages.push(page3);

                // PAGE 4: Recommendations
                const page4 = document.createElement('div');
                page4.style.cssText = `
                    width: 794px; 
                    height: 1123px; 
                    padding: 60px; 
                    position: relative;
                    font-family: 'Tajawal', Arial, sans-serif;
                    direction: rtl;
                    box-sizing: border-box;
                    background: white;
                    color: #1f2937;
                `;
                page4.innerHTML = `
                    <div style="text-align: center; margin-bottom: 40px; padding: 25px; background: linear-gradient(135deg, #4361ee, #7c3aed); color: white; border-radius: 15px;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">التوصيات والإرشادات</h1>
                        <p style="margin: 12px 0 0 0; font-size: 14px; opacity: 0.9;">Recommendations & Guidelines</p>
                    </div>

                    ${result.adjustedForResponse ? `
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 15px; margin-bottom: 25px; border: 2px solid #f59e0b;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <span style="background: #f59e0b; color: white; padding: 8px 20px; border-radius: 10px; font-size: 14px; font-weight: bold;">
                                🎯 توصية مهمة
                            </span>
                        </div>
                        <div style="text-align: center;">
                            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">خطة الدعوة للمشاركة</h3>
                            <div style="background: rgba(255,255,255,0.7); padding: 20px; border-radius: 12px;">
                                <p style="color: #92400e; font-size: 14px; margin: 0 0 12px 0; line-height: 1.5;">
                                    بناءً على معدل الاستجابة المتوقع (<strong>${result.responseRate}%</strong>)، يُنصح بدعوة:
                                </p>
                                <div style="font-size: 36px; font-weight: bold; color: #92400e; margin: 15px 0;">
                                    ${result.adjustedForResponse.toLocaleString('ar')} شخص
                                </div>
                                <p style="color: #92400e; font-size: 13px; margin: 12px 0 0 0;">
                                    للحصول على <strong>${result.adjustedSampleSize.toLocaleString('ar')}</strong> مشارك فعلي
                                </p>
                            </div>
                        </div>
                    </div>
                    ` : ''}

                    <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 15px; padding: 25px; margin-bottom: 25px;">
                        <h3 style="color: #15803d; margin: 0 0 20px 0; font-size: 18px; text-align: center;">
                            <span style="background: #22c55e; color: white; padding: 6px 12px; border-radius: 8px; font-size: 12px; margin-left: 8px;">✅</span>
                            أفضل الممارسات
                        </h3>
                        <div style="display: grid; gap: 15px;">
                            <div style="background: white; padding: 20px; border-radius: 12px; border-right: 4px solid #22c55e;">
                                <h4 style="color: #15803d; margin: 0 0 10px 0; font-size: 15px; font-weight: bold;">العشوائية في الاختيار</h4>
                                <p style="margin: 0; color: #166534; font-size: 13px; line-height: 1.5;">
                                    استخدم طرق الاختيار العشوائي لضمان تمثيل عادل لجميع فئات المجتمع وتجنب التحيز في النتائج.
                                </p>
                            </div>
                            <div style="background: white; padding: 20px; border-radius: 12px; border-right: 4px solid #22c55e;">
                                <h4 style="color: #15803d; margin: 0 0 10px 0; font-size: 15px; font-weight: bold;">المتابعة والتذكير</h4>
                                <p style="margin: 0; color: #166534; font-size: 13px; line-height: 1.5;">
                                    أرسل تذكيرات مهذبة للمشاركين وراقب معدل الاستجابة يومياً لاتخاذ إجراءات تصحيحية عند الحاجة.
                                </p>
                            </div>
                            <div style="background: white; padding: 20px; border-radius: 12px; border-right: 4px solid #22c55e;">
                                <h4 style="color: #15803d; margin: 0 0 10px 0; font-size: 15px; font-weight: bold;">جودة البيانات</h4>
                                <p style="margin: 0; color: #166534; font-size: 13px; line-height: 1.5;">
                                    تحقق من اكتمال البيانات وصحتها قبل بدء التحليل، واستبعد الاستجابات غير المكتملة أو غير الصحيحة.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style="position: absolute; bottom: 40px; left: 0; right: 0; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 12px;">
                        <p style="margin: 0;">إعداد: <strong>عبدالله التويجري</strong> | abutlb.github.io</p>
                    </div>
                `;

                pages.push(page4);

                // Now generate PDF using the separate pages approach
                this.generatePDFFromPages(pages, result);
            }

                        generatePrintReport() {
                if (!this.currentResult) return;

                const result = this.currentResult;
                const currentDate = new Date().toLocaleDateString('ar-SA', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                });

                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html lang="ar" dir="rtl">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>تقرير حساب حجم العينة الإحصائية</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
                        <style>
                            body { font-family: 'Tajawal', sans-serif; }
                            @media print {
                                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                .no-print { display: none !important; }
                                @page { margin: 0.5in; }
                            }
                        </style>
                    </head>
                    <body class="bg-white text-gray-900 text-sm leading-tight">
                        <!-- Print Controls -->
                        <div class="no-print mb-4 text-center space-x-2 space-x-reverse">
                            <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium">
                                🖨️ طباعة التقرير
                            </button>
                            <button onclick="window.close()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium">
                                ✖️ إغلاق
                            </button>
                        </div>

                        <!-- Report Container -->
                        <div class="max-w-4xl mx-auto bg-white">
                            <!-- Header -->
                            <div class="border-b-4 border-blue-600 pb-4 mb-6">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h1 class="text-2xl font-bold text-blue-800 mb-1">تقرير حساب حجم العينة الإحصائية</h1>
                                        <p class="text-gray-600">Statistical Sample Size Calculation Report</p>
                                    </div>
                                    <div class="text-left text-xs text-gray-500">
                                        <p>تاريخ الإنشاء: ${currentDate}</p>
                                        <p>رقم التقرير: SS-${Date.now().toString().slice(-8)}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Executive Summary -->
                            <div class="grid grid-cols-3 gap-4 mb-6">
                                <div class="col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h2 class="text-lg font-bold text-blue-800 mb-3">📊 الملخص التنفيذي</h2>
                                    <div class="bg-white p-3 rounded border border-blue-100">
                                        <div class="text-center">
                                            <div class="text-3xl font-bold text-blue-600 mb-1">${result.adjustedSampleSize.toLocaleString('ar')}</div>
                                            <p class="text-sm text-gray-700 font-medium">حجم العينة المطلوب</p>
                                            ${result.adjustedForResponse ? `
                                            <div class="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                                <div class="text-lg font-bold text-yellow-700">${result.adjustedForResponse.toLocaleString('ar')}</div>
                                                <p class="text-xs text-yellow-600">مع تعديل معدل الاستجابة</p>
                                            </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>

                                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <h3 class="text-sm font-bold text-gray-800 mb-3">🎯 مؤشرات الجودة</h3>
                                    <div class="space-y-2 text-xs">
                                        <div class="flex justify-between">
                                            <span>مستوى الثقة:</span>
                                            <span class="font-bold text-green-600">${result.confidenceLevel}%</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span>هامش الخطأ:</span>
                                            <span class="font-bold text-red-600">±${result.marginError}%</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span>دقة التقدير:</span>
                                            <span class="font-bold text-blue-600">${100 - result.marginError}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Main Content -->
                            <div class="grid grid-cols-2 gap-6 mb-6">
                                <!-- Study Parameters -->
                                <div>
                                    <h3 class="text-lg font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-1">📋 معايير الدراسة</h3>
                                    <div class="space-y-3">
                                        <div class="bg-gray-50 p-3 rounded border border-gray-200">
                                            <div class="grid grid-cols-2 gap-2 text-xs">
                                                <div class="flex justify-between">
                                                    <span class="text-gray-600">حجم المجتمع:</span>
                                                    <span class="font-bold">${result.populationSize ? result.populationSize.toLocaleString('ar') : 'غير محدود'}</span>
                                                </div>
                                                <div class="flex justify-between">
                                                    <span class="text-gray-600">النسبة المتوقعة:</span>
                                                    <span class="font-bold text-purple-600">${result.expectedProportion}%</span>
                                                </div>
                                                <div class="flex justify-between">
                                                    <span class="text-gray-600">القيمة المعيارية:</span>
                                                    <span class="font-bold text-indigo-600">${result.zScore}</span>
                                                </div>
                                                ${result.responseRate ? `
                                                <div class="flex justify-between">
                                                    <span class="text-gray-600">معدل الاستجابة:</span>
                                                    <span class="font-bold text-orange-600">${result.responseRate}%</span>
                                                </div>
                                                ` : ''}
                                            </div>
                                        </div>

                                        <!-- Formula -->
                                        <div class="bg-gray-900 text-white p-3 rounded">
                                            <h4 class="text-xs font-bold text-yellow-400 mb-2">الصيغة المستخدمة:</h4>
                                            <div class="text-xs font-mono text-green-400 text-center" style="direction: ltr;">
                                                ${result.populationSize ? 
                                                    'n = [Z² × p × (1-p) / e²] ÷ [1 + (Z² × p × (1-p) / e² - 1) / N]' : 
                                                    'n = Z² × p × (1-p) / e²'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Recommendations -->
                                <div>
                                    <h3 class="text-lg font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-1">💡 التوصيات والإرشادات</h3>
                                    <div class="space-y-3">
                                        <!-- Implementation Steps -->
                                        <div class="bg-green-50 border border-green-200 rounded p-3">
                                            <h4 class="text-sm font-bold text-green-800 mb-2">خطوات التنفيذ:</h4>
                                            <ol class="text-xs text-green-700 space-y-1">
                                                <li>1. حدد إطار المعاينة بدقة</li>
                                                <li>2. استخدم الاختيار العشوائي</li>
                                                <li>3. ادع ${result.adjustedForResponse ? result.adjustedForResponse.toLocaleString('ar') : result.adjustedSampleSize.toLocaleString('ar')} شخص</li>
                                                <li>4. راقب معدل الاستجابة يومياً</li>
                                            </ol>
                                        </div>

                                        <!-- Quality Assurance -->
                                        <div class="bg-blue-50 border border-blue-200 rounded p-3">
                                            <h4 class="text-sm font-bold text-blue-800 mb-2">ضمان الجودة:</h4>
                                            <ul class="text-xs text-blue-700 space-y-1">
                                                <li>• تحقق من اكتمال البيانات</li>
                                                <li>• احتفظ بسجل توثيق دقيق</li>
                                                <li>• قم بالتحليل الأولي سريعاً</li>
                                                <li>• استبعد الاستجابات غير الصحيحة</li>
                                            </ul>
                                        </div>

                                        ${result.populationSize && result.adjustedSampleSize > result.populationSize * 0.3 ? `
                                        <div class="bg-yellow-50 border border-yellow-300 rounded p-3">
                                            <h4 class="text-sm font-bold text-yellow-800 mb-1">⚠️ تنبيه:</h4>
                                            <p class="text-xs text-yellow-700">حجم العينة كبير نسبياً. فكر في دراسة شاملة.</p>
                                        </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>

                            <!-- Technical Details -->
                            <div class="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
                                <h3 class="text-sm font-bold text-gray-800 mb-3">🔧 التفاصيل التقنية والحسابات</h3>
                                <div class="grid grid-cols-4 gap-4 text-xs">
                                    <div class="text-center bg-white p-2 rounded border">
                                        <div class="font-bold text-blue-600">العينة الأساسية</div>
                                        <div class="text-gray-700">${result.basicSampleSize.toLocaleString('ar')}</div>
                                    </div>
                                    ${result.populationSize ? `
                                    <div class="text-center bg-white p-2 rounded border">
                                        <div class="font-bold text-green-600">بعد التصحيح</div>
                                        <div class="text-gray-700">${result.adjustedSampleSize.toLocaleString('ar')}</div>
                                    </div>
                                    <div class="text-center bg-white p-2 rounded border">
                                        <div class="font-bold text-purple-600">نسبة التمثيل</div>
                                        <div class="text-gray-700">${((result.adjustedSampleSize/result.populationSize) * 100).toFixed(1)}%</div>
                                    </div>
                                    ` : `
                                    <div class="text-center bg-white p-2 rounded border">
                                        <div class="font-bold text-green-600">نوع المجتمع</div>
                                        <div class="text-gray-700">كبير</div>
                                    </div>
                                    <div class="text-center bg-white p-2 rounded border">
                                        <div class="font-bold text-purple-600">طريقة الحساب</div>
                                        <div class="text-gray-700">معيارية</div>
                                    </div>
                                    `}
                                    ${result.adjustedForResponse ? `
                                    <div class="text-center bg-white p-2 rounded border">
                                        <div class="font-bold text-orange-600">إضافي للاستجابة</div>
                                        <div class="text-gray-700">${(result.adjustedForResponse - result.adjustedSampleSize).toLocaleString('ar')}</div>
                                    </div>
                                    ` : `
                                    <div class="text-center bg-white p-2 rounded border">
                                        <div class="font-bold text-gray-600">دقة الحساب</div>
                                        <div class="text-gray-700">عالية</div>
                                    </div>
                                    `}
                                </div>
                            </div>

                            <!-- Footer -->
                            <div class="border-t-2 border-gray-300 pt-4 flex justify-between items-center text-xs text-gray-600">
                                <div>
                                    <p><strong>المصدر:</strong> حاسبة حجم العينة الإحصائية</p>
                                    <p><strong>المنهجية:</strong> الصيغ الإحصائية المعتمدة دولياً</p>
                                </div>
                                <div class="text-left">
                                    <p><strong>تنويه:</strong> يُنصح بمراجعة خبير إحصائي للدراسات المعقدة</p>
                                    <p><strong>الصفحة:</strong> 1 من 1</p>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                `);

                printWindow.document.close();
                printWindow.focus();
                
                // Auto-print after a short delay
                setTimeout(() => {
                    printWindow.print();
                }, 500);
            }



            generateFallbackPDF() {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                const result = this.currentResult;

                // Use English text to avoid Arabic rendering issues
                doc.setFontSize(20);
                doc.text('Sample Size Calculation Report', 105, 30, { align: 'center' });
                
                doc.setFontSize(12);
                doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
                
                let yPos = 70;
                
                // Main result
                doc.setFontSize(16);
                doc.text('Required Sample Size:', 20, yPos);
                doc.setFontSize(24);
                doc.text(result.adjustedSampleSize.toString(), 120, yPos);
                
                yPos += 20;
                
                if (result.adjustedForResponse) {
                    doc.setFontSize(14);
                    doc.text('Adjusted for Response Rate:', 20, yPos);
                    doc.setFontSize(18);
                    doc.text(result.adjustedForResponse.toString(), 120, yPos);
                    yPos += 15;
                }
                
                yPos += 10;
                doc.setFontSize(14);
                doc.text('Parameters Used:', 20, yPos);
                yPos += 10;
                
                doc.setFontSize(12);
                const params = [
                    `Population Size: ${result.populationSize ? result.populationSize.toLocaleString() : 'Infinite/Large'}`,
                    `Margin of Error: ±${result.marginError}%`,
                    `Confidence Level: ${result.confidenceLevel}%`,
                    `Expected Proportion: ${result.expectedProportion}%`
                ];
                
                if (result.responseRate) {
                    params.push(`Response Rate: ${result.responseRate}%`);
                }
                
                params.forEach(param => {
                    doc.text(param, 25, yPos);
                    yPos += 8;
                });
                
                yPos += 10;
                doc.setFontSize(14);
                doc.text('Statistical Formula:', 20, yPos);
                yPos += 10;
                
                doc.setFontSize(10);
                if (result.populationSize) {
                    doc.text('n = [Z² × p × (1-p) / e²] / [1 + (Z² × p × (1-p) / e² - 1) / N]', 25, yPos);
                } else {
                    doc.text('n = Z² × p × (1-p) / e²', 25, yPos);
                }
                
                yPos += 8;
                doc.text(`Where: Z=${result.zScore}, p=${result.expectedProportion/100}, e=${result.marginError/100}`, 25, yPos);
                
                const fileName = `sample-size-report-${new Date().toISOString().split('T')[0]}.pdf`;
                doc.save(fileName);
            }


        }

        // Dark Mode Toggle Function
        function toggleDarkMode() {
            document.documentElement.classList.toggle('dark');
            document.body.classList.toggle('dark-mode');
            
            if (document.documentElement.classList.contains('dark')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        }

        // Initialize everything when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize Sample Size Calculator
            new SampleSizeCalculator();

            // Initialize dark mode
            if (localStorage.getItem('theme') === 'dark' || 
                (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
                document.body.classList.add('dark-mode');
            }
            
            document.getElementById('themeToggle').addEventListener('click', toggleDarkMode);
            
            // Tab switching functionality
            const tabButtons = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');
            
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Remove active class from all buttons and hide all contents
                    tabButtons.forEach(btn => btn.classList.remove('active', 'opacity-100'));
                    tabContents.forEach(content => content.classList.add('hidden'));
                    
                    // Add active class to clicked button and show corresponding content
                    button.classList.add('active', 'opacity-100');
                    const targetTab = document.getElementById(`${button.dataset.tab}-tab`);
                    if (targetTab) {
                        targetTab.classList.remove('hidden');
                    }
                });
            });
            
            // Set current year in footer
            document.getElementById('currentYear').textContent = new Date().getFullYear();
            
            // Set last updated date
            const lastUpdatedElement = document.getElementById('lastUpdated');
            if (lastUpdatedElement) {
                const currentDate = new Date();
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                lastUpdatedElement.textContent = currentDate.toLocaleDateString('ar-SA', options);
            }

            // Add smooth scrolling to results when calculated
            const originalDisplayResults = SampleSizeCalculator.prototype.displayResults;
            SampleSizeCalculator.prototype.displayResults = function(result) {
                originalDisplayResults.call(this, result);
                
                // Smooth scroll to results
                setTimeout(() => {
                    document.getElementById('results-container').scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }, 100);
            };

            // Add input validation feedback
            const inputs = ['population-size', 'margin-error', 'expected-proportion', 'response-rate'];
            inputs.forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    input.addEventListener('blur', function() {
                        validateInput(this);
                    });
                    
                    input.addEventListener('focus', function() {
                        // Remove error styling on focus
                        this.classList.remove('border-red-500', 'bg-red-50');
                        this.classList.add('border-gray-300');
                    });
                }
            });

            function validateInput(input) {
                const value = parseFloat(input.value);
                let isValid = true;
                let errorMessage = '';

                switch (input.id) {
                    case 'population-size':
                        if (input.value && (isNaN(value) || value < 1)) {
                            isValid = false;
                            errorMessage = 'حجم المجتمع يجب أن يكون رقم أكبر من صفر';
                        }
                        break;
                    case 'margin-error':
                        if (isNaN(value) || value <= 0 || value > 50) {
                            isValid = false;
                            errorMessage = 'هامش الخطأ يجب أن يكون بين 0.1% و 50%';
                        }
                        break;
                    case 'expected-proportion':
                        if (isNaN(value) || value <= 0 || value > 99) {
                            isValid = false;
                            errorMessage = 'النسبة المتوقعة يجب أن تكون بين 1% و 99%';
                        }
                        break;
                    case 'response-rate':
                        if (input.value && (isNaN(value) || value <= 0 || value > 100)) {
                            isValid = false;
                            errorMessage = 'معدل الاستجابة يجب أن يكون بين 1% و 100%';
                        }
                        break;
                }

                if (!isValid) {
                    input.classList.add('border-red-500', 'bg-red-50');
                    input.classList.remove('border-gray-300');
                    
                    // Show error message
                    let errorDiv = input.parentNode.querySelector('.error-message');
                    if (!errorDiv) {
                        errorDiv = document.createElement('div');
                        errorDiv.className = 'error-message text-sm text-red-600 mt-1';
                        input.parentNode.appendChild(errorDiv);
                    }
                    errorDiv.textContent = errorMessage;
                } else {
                    input.classList.remove('border-red-500', 'bg-red-50');
                    input.classList.add('border-gray-300');
                    
                    // Remove error message
                    const errorDiv = input.parentNode.querySelector('.error-message');
                    if (errorDiv) {
                        errorDiv.remove();
                    }
                }
            }

            // Keyboard shortcuts
            document.addEventListener('keydown', function(e) {
                // Ctrl/Cmd + Enter to calculate
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById('calculate-btn').click();
                }
                
                // Escape to clear results
                if (e.key === 'Escape') {
                    const resultsContainer = document.getElementById('results-container');
                    if (!resultsContainer.classList.contains('hidden')) {
                        resultsContainer.classList.add('hidden');
                    }
                }
            });

            // Add loading state to calculate button
            const calculateBtn = document.getElementById('calculate-btn');
            const originalCalculate = SampleSizeCalculator.prototype.calculate;
            SampleSizeCalculator.prototype.calculate = function() {
                calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i>جاري الحساب...';
                calculateBtn.disabled = true;
                
                setTimeout(() => {
                    try {
                        originalCalculate.call(this);
                    } finally {
                        calculateBtn.innerHTML = '<i class="fas fa-calculator ml-2"></i>احسب حجم العينة';
                        calculateBtn.disabled = false;
                    }
                }, 300);
            };

            // Add tooltips enhancement for better UX
            document.querySelectorAll('.help-icon').forEach(icon => {
                icon.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.2)';
                });
                
                icon.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                });
            });

            // Add print functionality
            window.printResults = function() {
                if (window.sampleCalculator && window.sampleCalculator.currentResult) {
                    const printWindow = window.open('', '_blank');
                    const result = window.sampleCalculator.currentResult;
                    
                    printWindow.document.write(`
                        <!DOCTYPE html>
                        <html dir="rtl">
                        <head>
                            <title>نتائج حساب حجم العينة</title>
                            <style>
                                body { font-family: Arial, sans-serif; direction: rtl; text-align: right; }
                                .header { text-align: center; margin-bottom: 30px; }
                                .result { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 10px 0; }
                                .params { background: #f9fafb; padding: 15px; border-radius: 8px; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>نتائج حساب حجم العينة</h1>
                                <p>تاريخ الحساب: ${new Date().toLocaleDateString('ar-SA')}</p>
                            </div>
                            <div class="result">
                                <h2>حجم العينة المطلوب: ${result.adjustedSampleSize.toLocaleString('ar')}</h2>
                                ${result.adjustedForResponse ? `<p>الحجم مع تعويض عدم الاستجابة: ${result.adjustedForResponse.toLocaleString('ar')}</p>` : ''}
                            </div>
                            <div class="params">
                                <h3>المعايير المستخدمة:</h3>
                                ${result.populationSize ? `<p>حجم المجتمع: ${result.populationSize.toLocaleString('ar')}</p>` : ''}
                                <p>هامش الخطأ: ${result.marginError}%</p>
                                <p>مستوى الثقة: ${result.confidenceLevel}%</p>
                                <p>النسبة المتوقعة: ${result.expectedProportion}%</p>
                                ${result.responseRate ? `<p>معدل الاستجابة المتوقع: ${result.responseRate}%</p>` : ''}
                            </div>
                        </body>
                        </html>
                    `);
                    
                    printWindow.document.close();
                    printWindow.focus();
                    setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                    }, 250);
                }
            };

            // Store calculator instance globally for print function
            window.sampleCalculator = new SampleSizeCalculator();
        });
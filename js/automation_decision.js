document.addEventListener('DOMContentLoaded', function() {
    console.log('Automation Decision Calculator loaded');
    
    // Elements
    const form = document.getElementById('automationForm');
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    const frequencySelect = document.getElementById('frequency');
    const customFrequency = document.getElementById('customFrequency');
    const evaluationSelect = document.getElementById('evaluationPeriod');
    const customEvaluation = document.getElementById('customEvaluation');
    const resultsContainer = document.getElementById('resultsContainer');
    const calculationResults = document.getElementById('calculationResults');
    
    let chart = null;

    // Set current year
    if (document.getElementById('currentYear')) {
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }

    // Event Listeners
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');
        calculateAutomation();
    });
    
    loadSampleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Loading sample data');
        loadSampleData();
    });
    
    frequencySelect.addEventListener('change', toggleCustomFrequency);
    evaluationSelect.addEventListener('change', toggleCustomEvaluation);

    // Live calculation on input change
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(function() {
            if (hasMinimumRequiredData()) {
                console.log('Live calculation triggered');
                calculateAutomation();
            }
        }, 800));
        
        input.addEventListener('change', function() {
            if (hasMinimumRequiredData()) {
                console.log('Change calculation triggered');
                calculateAutomation();
            }
        });
    });

    function hasMinimumRequiredData() {
        const buildTime = document.getElementById('buildTime').value;
        const manualTime = document.getElementById('manualTime').value;
        return buildTime && manualTime && parseFloat(buildTime) > 0 && parseFloat(manualTime) > 0;
    }

    function loadSampleData() {
        console.log('Loading sample data...');
        
        document.getElementById('taskName').value = 'إعداد تقرير أسبوعي للمبيعات';
        document.getElementById('buildTime').value = '4';
        document.getElementById('buildTimeUnit').value = 'hours';
        document.getElementById('manualTime').value = '45';
        document.getElementById('manualTimeUnit').value = 'minutes';
        document.getElementById('automatedTime').value = '2';
        document.getElementById('automatedTimeUnit').value = 'minutes';
        document.getElementById('frequency').value = 'weekly';
        document.getElementById('evaluationPeriod').value = '12';
        
        // Clear any existing results first
        if (resultsContainer) resultsContainer.classList.remove('hidden');
        if (calculationResults) calculationResults.classList.add('hidden');
        
        toggleCustomFrequency();
        toggleCustomEvaluation();
        
        // Calculate after loading sample data
        setTimeout(() => {
            calculateAutomation();
        }, 100);
    }

    function toggleCustomFrequency() {
        const isCustom = frequencySelect.value === 'custom';
        customFrequency.classList.toggle('hidden', !isCustom);
        
        if (!isCustom && hasMinimumRequiredData()) {
            calculateAutomation();
        }
    }

    function toggleCustomEvaluation() {
        const isCustom = evaluationSelect.value === 'custom';
        customEvaluation.classList.toggle('hidden', !isCustom);
        
        if (!isCustom && hasMinimumRequiredData()) {
            calculateAutomation();
        }
    }

    function calculateAutomation() {
        console.log('Calculating automation...');
        
        // Get form data
        const data = getFormData();
        
        // Validate required fields
        if (!data.buildTimeMinutes || !data.manualTimeMinutes || data.buildTimeMinutes <= 0 || data.manualTimeMinutes <= 0) {
            console.log('Invalid data - missing required values:', data);
            return;
        }

        console.log('Form data:', data);

        // Calculate results
        const results = performCalculations(data);
        console.log('Calculation results:', results);
        
        // Display results
        displayResults(results, data);
    }

    function getFormData() {
        const buildTimeElement = document.getElementById('buildTime');
        const manualTimeElement = document.getElementById('manualTime');
        
        if (!buildTimeElement || !manualTimeElement) {
            console.error('Required form elements not found');
            return { buildTime: 0, manualTime: 0 };
        }

        const buildTime = parseFloat(buildTimeElement.value);
        const buildTimeUnit = document.getElementById('buildTimeUnit').value;
        const manualTime = parseFloat(manualTimeElement.value);
        const manualTimeUnit = document.getElementById('manualTimeUnit').value;
        const automatedTime = parseFloat(document.getElementById('automatedTime').value) || 0;
        const automatedTimeUnit = document.getElementById('automatedTimeUnit').value;
        const frequency = document.getElementById('frequency').value;
        const evaluationPeriod = document.getElementById('evaluationPeriod').value;
        const taskName = document.getElementById('taskName').value || 'المهمة';

        // Debug log
        console.log('Raw values:', { buildTime, manualTime, automatedTime, buildTimeUnit, manualTimeUnit, automatedTimeUnit });

        // Validate input values
        if (isNaN(buildTime) || isNaN(manualTime) || buildTime <= 0 || manualTime <= 0) {
            console.log('Invalid input values:', { buildTime, manualTime });
            return { buildTime: 0, manualTime: 0, automatedTime: 0 };
        }

        // Convert build time to minutes
        let buildTimeMinutes = buildTime;
        if (buildTimeUnit === 'hours') buildTimeMinutes *= 60;
        if (buildTimeUnit === 'days') buildTimeMinutes *= 60 * 24;

        // Convert manual time to minutes
        let manualTimeMinutes = manualTime;
        if (manualTimeUnit === 'hours') manualTimeMinutes *= 60;

        // Convert automated time to minutes
        let automatedTimeMinutes = automatedTime;
        if (automatedTimeUnit === 'seconds') automatedTimeMinutes /= 60;
        else if (automatedTimeUnit === 'minutes') automatedTimeMinutes = automatedTime;
        else if (automatedTimeUnit === 'hours') automatedTimeMinutes *= 60;

        // Calculate frequency per month
        let frequencyPerMonth = 1;
        if (frequency === 'daily') frequencyPerMonth = 30;
        else if (frequency === 'weekly') frequencyPerMonth = 4.33;
        else if (frequency === 'monthly') frequencyPerMonth = 1;
        else if (frequency === 'yearly') frequencyPerMonth = 1/12;
        else if (frequency === 'custom') {
            const customCount = parseFloat(document.getElementById('customCount').value) || 1;
            const customPeriod = document.getElementById('customPeriod').value;
            
            if (customPeriod === 'days') frequencyPerMonth = customCount * (30/30);
            else if (customPeriod === 'weeks') frequencyPerMonth = customCount * (30/7);
            else if (customPeriod === 'months') frequencyPerMonth = customCount;
        }

        // Get evaluation period in months
        let evaluationMonths = 12;
        if (evaluationPeriod === 'custom') {
            evaluationMonths = parseFloat(document.getElementById('customEvaluationMonths').value) || 12;
        } else {
            evaluationMonths = parseFloat(evaluationPeriod);
        }

        const result = {
            taskName,
            buildTime: buildTimeMinutes,
            manualTime: manualTimeMinutes,
            automatedTime: automatedTimeMinutes,
            buildTimeMinutes,
            manualTimeMinutes,
            automatedTimeMinutes,
            frequencyPerMonth,
            evaluationMonths
        };

        console.log('Processed form data:', result);
        return result;
    }

    function performCalculations(data) {
        const { buildTimeMinutes, manualTimeMinutes, automatedTimeMinutes, frequencyPerMonth, evaluationMonths } = data;

        // Total executions during evaluation period
        const totalExecutions = frequencyPerMonth * evaluationMonths;
        
        // Total time with manual execution
        const totalManualTimeMinutes = totalExecutions * manualTimeMinutes;
        
        // Total time with automation (build time + automated execution time for each run)
        const totalAutomatedTimeMinutes = buildTimeMinutes + (totalExecutions * automatedTimeMinutes);
        
        // Time saved (manual time - automated time)
        const totalTimeSavedMinutes = totalManualTimeMinutes - totalAutomatedTimeMinutes;
        
        // Net time benefit 
        const netTimeBenefit = totalTimeSavedMinutes;
        
        // Break-even point (in months) - when automated total time equals manual total time
        const timeSavedPerMonth = frequencyPerMonth * (manualTimeMinutes - automatedTimeMinutes);
        const breakEvenMonths = timeSavedPerMonth > 0 ? buildTimeMinutes / timeSavedPerMonth : Infinity;
        
        // Calculate time saved per month and per year for practical evaluation
        const timeSavedPerMonthMinutes = timeSavedPerMonth;
        const timeSavedPerYearMinutes = timeSavedPerMonth * 12;
        
        // Smart decision with practical thresholds
        const decisionLevel = getSmartDecision(totalTimeSavedMinutes, timeSavedPerMonthMinutes, timeSavedPerYearMinutes, breakEvenMonths, evaluationMonths);
        
        // Basic decision (mathematically positive)
        const isWorthIt = netTimeBenefit > 0;
        
        // ROI percentage - comparing total time investment vs time saved
        const totalInvestment = buildTimeMinutes;
        const roi = totalInvestment > 0 ? (totalTimeSavedMinutes / totalInvestment) * 100 : 0;

        return {
            totalExecutions,
            totalTimeSavedMinutes,
            totalManualTimeMinutes,
            totalAutomatedTimeMinutes,
            buildTimeMinutes,
            automatedTimeMinutes,
            netTimeBenefit,
            breakEvenMonths,
            timeSavedPerMonthMinutes,
            timeSavedPerYearMinutes,
            isWorthIt,
            decisionLevel,
            roi
        };
    }

    function getSmartDecision(totalSaved, monthlySaved, yearlySaved, breakEven, evaluationPeriod) {
        console.log('Smart Decision Input:', { totalSaved, monthlySaved, yearlySaved, breakEven });
        
        // If not profitable at all
        if (totalSaved <= 0) {
            console.log('Decision: Not worth it');
            return {
                level: 'not-worth-it',
                title: 'لا تؤتمت',
                message: 'الأتمتة غير مجدية رقمياً',
                icon: '❌',
                color: 'red',
                advice: 'فكر في تحسين العملية اليدوية بدلاً من الأتمتة'
            };
        }

        // Convert to hours for easier evaluation
        const monthlyHours = monthlySaved / 60;
        const yearlyHours = yearlySaved / 60;
        
        console.log('Hours calculation:', { monthlyHours, yearlyHours });

        // Very minimal benefit - not practically worth it
        if (yearlyHours < 2) { // Less than 2 hours per year
            console.log('Decision: Minimal benefit');
            return {
                level: 'minimal-benefit',
                title: 'فائدة ضئيلة جداً',
                message: `توفر ${formatTime(yearlySaved)} فقط في السنة`,
                icon: '🤏',
                color: 'orange',
                advice: 'رغم أن الأرقام إيجابية، الفائدة قليلة جداً لا تستحق الجهد'
            };
        }

        // Small benefit - questionable
        if (monthlyHours < 1) { // Less than 1 hour per month
            console.log('Decision: Small benefit');
            return {
                level: 'small-benefit',
                title: 'فائدة محدودة',
                message: `توفر ${formatTime(monthlySaved)} شهرياً`,
                icon: '🤔',
                color: 'yellow',
                advice: 'فكر مرتين: هل تستحق الجهد المطلوب للأتمتة؟'
            };
        }

        // Good benefit - worth considering
        if (monthlyHours < 4) { // 1-4 hours per month
            console.log('Decision: Good benefit');
            return {
                level: 'good-benefit',
                title: 'فائدة جيدة',
                message: `توفر ${formatTime(monthlySaved)} شهرياً`,
                icon: '👍',
                color: 'blue',
                advice: 'أتمتة مفيدة، لكن تأكد من استقرار العملية'
            };
        }

        // Excellent benefit - definitely worth it
        console.log('Decision: Excellent benefit');
        return {
            level: 'excellent-benefit',
            title: 'فائدة ممتازة!',
            message: `توفر ${formatTime(monthlySaved)} شهرياً`,
            icon: '🚀',
            color: 'green',
            advice: 'أتمتة ممتازة! ابدأ فوراً'
        };
    }

    function displayResults(results, data) {
        console.log('Displaying results...');
        
        const { isWorthIt, totalTimeSavedMinutes, breakEvenMonths, netTimeBenefit, roi, totalExecutions, decisionLevel } = results;
        
        // Update quick stats in header
        updateQuickStats(results);
        
        // Hide initial message and show results
        resultsContainer.classList.add('hidden');
        calculationResults.classList.remove('hidden');

        // Decision card using smart decision
        const decisionCard = document.getElementById('decisionCard');
        const decisionIcon = document.getElementById('decisionIcon');
        const decisionText = document.getElementById('decisionText');
        const decisionReason = document.getElementById('decisionReason');

        // Clear any existing advice elements
        const existingAdvice = decisionCard.querySelector('.advice-text');
        if (existingAdvice) {
            existingAdvice.remove();
        }

        // Apply smart decision styling
        const colorClass = getColorClass(decisionLevel.color);
        decisionCard.className = `text-center p-6 rounded-xl border-2 ${colorClass.border}`;
        decisionIcon.textContent = decisionLevel.icon;
        decisionIcon.className = `text-6xl mb-3 ${colorClass.text}`;
        decisionText.textContent = decisionLevel.title;
        decisionText.className = `text-2xl font-bold ${colorClass.text} mb-2`;
        decisionReason.textContent = decisionLevel.message;

        // Add advice if available
        if (decisionLevel.advice) {
            const adviceElement = document.createElement('p');
            adviceElement.className = 'advice-text text-sm text-slate-600 dark:text-slate-400 mt-3 italic';
            adviceElement.textContent = decisionLevel.advice;
            decisionCard.appendChild(adviceElement);
        }

        // Update stats
        document.getElementById('timeSaved').textContent = formatTime(totalTimeSavedMinutes);
        
        const breakEvenText = breakEvenMonths < 1 ? 
            `${Math.round(breakEvenMonths * 30)} يوم` : 
            `${Math.round(breakEvenMonths * 10) / 10} شهر`;
        document.getElementById('breakEvenPoint').textContent = breakEvenText;

        // Update additional info
        updateAdditionalInfo(results, data);
        
        // Update chart
        updateChart(results, data);
    }

    function getColorClass(color) {
        const colorMap = {
            'red': { border: 'border-red-500 bg-red-50 dark:bg-red-900/20', text: 'text-red-500' },
            'orange': { border: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-500' },
            'yellow': { border: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-500' },
            'blue': { border: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-500' },
            'green': { border: 'border-green-500 bg-green-50 dark:bg-green-900/20', text: 'text-green-500' }
        };
        return colorMap[color] || colorMap['blue'];
    }

    function updateQuickStats(results) {
        const { totalTimeSavedMinutes, timeSavedPerMonthMinutes, breakEvenMonths, roi, decisionLevel } = results;
        
        // Update time saved - show monthly savings for better context
        const timeSavedDisplay = document.getElementById('timeSaved-display');
        if (timeSavedDisplay) {
            timeSavedDisplay.textContent = formatTime(timeSavedPerMonthMinutes) + '/شهر';
        }
        
        // Update break even
        const breakEvenDisplay = document.getElementById('breakEven-display');
        if (breakEvenDisplay) {
            const breakEvenText = breakEvenMonths < 1 ? 
                `${Math.round(breakEvenMonths * 30)} يوم` : 
                `${Math.round(breakEvenMonths * 10) / 10} شهر`;
            breakEvenDisplay.textContent = breakEvenText;
        }
        
        // Update ROI
        const roiDisplay = document.getElementById('roi-display');
        if (roiDisplay) {
            roiDisplay.textContent = `${Math.round(roi)}%`;
        }
        
        // Update recommendation with smart decision
        const recommendationDisplay = document.getElementById('recommendation-display');
        if (recommendationDisplay) {
            const colorClass = getColorClass(decisionLevel.color);
            recommendationDisplay.textContent = decisionLevel.icon + ' ' + decisionLevel.title;
            recommendationDisplay.className = `text-xl font-bold ${colorClass.text}`;
        }
    }

    function updateAdditionalInfo(results, data) {
        const { totalExecutions, roi, buildTimeMinutes, totalManualTimeMinutes, totalAutomatedTimeMinutes, 
                timeSavedPerMonthMinutes, timeSavedPerYearMinutes, decisionLevel } = results;
        const infoList = document.getElementById('infoList');
        
        const timeSavedPerExecution = data.manualTimeMinutes - data.automatedTimeMinutes;
        const efficiencyImprovement = data.manualTimeMinutes > 0 ? ((timeSavedPerExecution / data.manualTimeMinutes) * 100) : 0;
        
        const infos = [
            `عدد مرات تنفيذ المهمة: ${Math.round(totalExecutions)} مرة`,
            `وقت البناء المطلوب: ${formatTime(buildTimeMinutes)}`,
            `توفير الوقت لكل تنفيذ: ${formatTime(timeSavedPerExecution)}`,
            `⭐ الوقت الموفر شهرياً: ${formatTime(timeSavedPerMonthMinutes)}`,
            `🎯 الوقت الموفر سنوياً: ${formatTime(timeSavedPerYearMinutes)}`,
            `تحسن الكفاءة: ${Math.round(efficiencyImprovement)}%`,
            `العائد على الاستثمار: ${Math.round(roi)}%`,
            `فترة التقييم: ${data.evaluationMonths} شهر`
        ];

        // Add practical assessment
        if (decisionLevel.level === 'minimal-benefit') {
            infos.push(`⚠️ تقييم عملي: الفائدة ضئيلة جداً`);
        } else if (decisionLevel.level === 'small-benefit') {
            infos.push(`🤔 تقييم عملي: فائدة محدودة`);
        } else if (decisionLevel.level === 'good-benefit') {
            infos.push(`👍 تقييم عملي: فائدة جيدة`);
        } else if (decisionLevel.level === 'excellent-benefit') {
            infos.push(`🚀 تقييم عملي: فائدة ممتازة`);
        }

        const iconMap = {
            'minimal-benefit': 'fa-exclamation-triangle text-orange-400',
            'small-benefit': 'fa-question-circle text-yellow-400',
            'good-benefit': 'fa-thumbs-up text-blue-400',
            'excellent-benefit': 'fa-rocket text-green-400',
            'not-worth-it': 'fa-times-circle text-red-400'
        };

        const defaultIcon = 'fa-check-circle text-green-400';

        infoList.innerHTML = infos.map((info, index) => {
            const icon = index === infos.length - 1 && decisionLevel ? 
                iconMap[decisionLevel.level] || defaultIcon : defaultIcon;
            return `<li class="flex items-center"><i class="fas ${icon} ml-2"></i>${info}</li>`;
        }).join('');
    }

    function updateChart(results, data) {
        const ctx = document.getElementById('comparisonChart');
        if (!ctx) {
            console.error('Chart canvas not found');
            return;
        }
        
        // Destroy existing chart
        if (chart) {
            chart.destroy();
        }

        const chartCtx = ctx.getContext('2d');

        // Prepare data for chart - two clear lines showing when automation becomes profitable
        const timePoints = [];
        const manualWorkLine = [];
        const automationLine = [];

        const maxMonths = Math.min(24, data.evaluationMonths); // Show more months for better visualization
        
        // Add starting point (month 0)
        timePoints.push('البداية');
        manualWorkLine.push(0); // Manual work starts at 0
        automationLine.push(Math.round(data.buildTimeMinutes / 60 * 10) / 10); // Automation starts with build time
        
        for (let i = 1; i <= maxMonths; i++) {
            timePoints.push(`الشهر ${i}`);
            
            // Total executions up to this month
            const totalExecutions = data.frequencyPerMonth * i;
            
            // Manual work: starts from 0, increases linearly
            const totalManualTime = totalExecutions * data.manualTimeMinutes;
            
            // Automation: starts from build time, increases slowly with automated execution time
            const totalAutomatedTime = data.buildTimeMinutes + (totalExecutions * data.automatedTimeMinutes);
            
            // Convert to hours for display
            manualWorkLine.push(Math.round(totalManualTime / 60 * 10) / 10);
            automationLine.push(Math.round(totalAutomatedTime / 60 * 10) / 10);
            
            console.log(`Month ${i}:`, {
                executions: totalExecutions,
                manualHours: Math.round(totalManualTime / 60 * 10) / 10,
                automationHours: Math.round(totalAutomatedTime / 60 * 10) / 10,
                difference: Math.round((totalManualTime - totalAutomatedTime) / 60 * 10) / 10
            });
        }

        try {
            chart = new Chart(chartCtx, {
                type: 'line',
                data: {
                    labels: timePoints,
                    datasets: [
                        {
                            label: '🔴 العمل اليدوي (ساعة)',
                            data: manualWorkLine,
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.05)',
                            tension: 0.1,
                            borderWidth: 4,
                            pointBackgroundColor: '#ef4444',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 3,
                            pointRadius: 6,
                            fill: false
                        },
                        {
                            label: '🟣 الأتمتة (بناء + تنفيذ)',
                            data: automationLine,
                            borderColor: '#8b5cf6',
                            backgroundColor: 'rgba(139, 92, 246, 0.05)',
                            tension: 0.1,
                            borderWidth: 4,
                            pointBackgroundColor: '#8b5cf6',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 3,
                            pointRadius: 6,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'نقطة التقاء الخطين = نقطة التعادل',
                            color: '#e2e8f0',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        annotation: {
                            annotations: {
                                breakEvenLine: {
                                    type: 'line',
                                    yMin: 0,
                                    yMax: 0,
                                    borderColor: '#fbbf24',
                                    borderWidth: 2,
                                    borderDash: [5, 5],
                                    label: {
                                        content: 'نقطة التعادل',
                                        enabled: true,
                                        position: 'start'
                                    }
                                }
                            }
                        },
                        legend: {
                            labels: {
                                color: '#e2e8f0',
                                font: {
                                    size: 12
                                },
                                usePointStyle: true,
                                padding: 20
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { 
                                color: '#cbd5e1',
                                font: {
                                    size: 11
                                }
                            },
                            grid: { 
                                color: 'rgba(203, 213, 225, 0.1)',
                                borderColor: 'rgba(203, 213, 225, 0.2)'
                            }
                        },
                        y: {
                            ticks: { 
                                color: '#cbd5e1',
                                font: {
                                    size: 11
                                },
                                callback: function(value) {
                                    return value.toFixed(1) + ' ساعة';
                                }
                            },
                            grid: { 
                                color: 'rgba(203, 213, 225, 0.1)',
                                borderColor: 'rgba(203, 213, 225, 0.2)',
                                drawBorder: true
                            },
                            title: {
                                display: true,
                                text: 'الوقت التراكمي (بالساعات)',
                                color: '#cbd5e1',
                                font: {
                                    size: 12,
                                    weight: 'bold'
                                }
                            },
                            beginAtZero: true
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
            
            console.log('Chart created successfully');
        } catch (error) {
            console.error('Error creating chart:', error);
        }
    }

    function formatTime(minutes) {
        if (minutes < 60) {
            return `${Math.round(minutes)} دقيقة`;
        } else if (minutes < 1440) {
            const hours = Math.round(minutes / 60 * 10) / 10;
            return `${hours} ساعة`;
        } else {
            const days = Math.round(minutes / 1440 * 10) / 10;
            return `${days} يوم`;
        }
    }

    function getFrequencyText() {
        const frequency = document.getElementById('frequency').value;
        if (frequency === 'daily') return 'يومياً';
        if (frequency === 'weekly') return 'أسبوعياً';
        if (frequency === 'monthly') return 'شهرياً';
        if (frequency === 'yearly') return 'سنوياً';
        if (frequency === 'custom') {
            const count = document.getElementById('customCount').value || 1;
            const period = document.getElementById('customPeriod').value;
            const periodText = period === 'days' ? 'أيام' : period === 'weeks' ? 'أسابيع' : 'أشهر';
            return `${count} مرات كل ${periodText}`;
        }
        return 'غير محدد';
    }

    function debounce(func, wait) {
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

    // Initialize with sample data after a short delay
    setTimeout(() => {
        loadSampleData();
    }, 1000);
    
    // Clear any calculation on page load
    if (resultsContainer) resultsContainer.classList.remove('hidden');
    if (calculationResults) calculationResults.classList.add('hidden');
});
// Global variables for charts
let comparisonChart = null;
let ownershipPieChart = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize slider values
    updateSliderValue('simulationYears', 'simulationYearsValue');
    updateSliderValue('rentIncrease', 'rentIncreaseValue');
    updateSliderValue('downPayment', 'downPaymentValue');
    updateSliderValue('interestRate', 'interestRateValue');
    updateSliderValue('maintenanceCost', 'maintenanceCostValue');
    
    // Add event listeners for real-time updates
    const inputs = ['familySize', 'currentAge', 'simulationYears', 'currentRent', 'rentIncrease', 'housePrice', 'downPayment', 'loanTerm', 'interestRate', 'maintenanceCost'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('change', calculateAndDisplay);
        document.getElementById(id).addEventListener('input', function() {
            if (this.type === 'range') {
                updateSliderValue(this.id, this.id + 'Value');
            }
        });
    });
});

// Update slider display values
function updateSliderValue(sliderId, displayId) {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);
    const value = slider.value;
    
    switch(sliderId) {
        case 'simulationYears':
            display.textContent = value + ' سنة';
            break;
        case 'rentIncrease':
        case 'downPayment':
        case 'interestRate':
        case 'maintenanceCost':
            display.textContent = value + '%';
            break;
        default:
            display.textContent = value;
    }
}

// Format number with commas for better readability
function formatNumber(num) {
    return Math.round(num).toLocaleString('ar-SA') + ' ريال';
}

// Calculate monthly mortgage payment
function calculateMonthlyPayment(principal, rate, years) {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    
    if (monthlyRate === 0) {
        return principal / numPayments;
    }
    
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return monthlyPayment;
}

// Calculate rent costs over time
function calculateRentCosts(currentRent, rentIncrease, years) {
    const rentCosts = [];
    let totalRent = 0;
    
    for (let year = 1; year <= years; year++) {
        const yearlyRent = currentRent * 12 * Math.pow(1 + rentIncrease / 100, year - 1);
        totalRent += yearlyRent;
        rentCosts.push({
            year: year,
            yearlyRent: yearlyRent,
            totalRent: totalRent
        });
    }
    
    return rentCosts;
}

// Calculate ownership costs over time
function calculateOwnershipCosts(housePrice, downPaymentPercent, loanTerm, interestRate, maintenancePercent, years) {
    const downPayment = housePrice * (downPaymentPercent / 100);
    const loanAmount = housePrice - downPayment;
    const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
    const annualMaintenance = housePrice * (maintenancePercent / 100);
    
    const ownershipCosts = [];
    let totalOwnership = downPayment;
    let remainingLoanBalance = loanAmount;
    
    for (let year = 1; year <= years; year++) {
        let yearlyPayment = 0;
        
        if (year <= loanTerm) {
            yearlyPayment = monthlyPayment * 12;
            
            // Calculate principal paid this year (simplified)
            const monthlyRate = interestRate / 100 / 12;
            for (let month = 1; month <= 12; month++) {
                const interestPortion = remainingLoanBalance * monthlyRate;
                const principalPortion = monthlyPayment - interestPortion;
                remainingLoanBalance -= principalPortion;
            }
        }
        
        const yearlyMaintenance = annualMaintenance;
        const totalYearlyOwnership = yearlyPayment + yearlyMaintenance;
        totalOwnership += totalYearlyOwnership;
        
        ownershipCosts.push({
            year: year,
            yearlyPayment: yearlyPayment,
            yearlyMaintenance: yearlyMaintenance,
            totalYearly: totalYearlyOwnership,
            totalOwnership: totalOwnership,
            remainingLoan: Math.max(0, remainingLoanBalance)
        });
    }
    
    return {
        costs: ownershipCosts,
        downPayment: downPayment,
        monthlyPayment: monthlyPayment,
        totalInterest: (monthlyPayment * loanTerm * 12) - loanAmount
    };
}

// Main calculation function
function calculateAndDisplay() {
    // Get input values
    const familySize = parseInt(document.getElementById('familySize').value);
    const currentAge = parseInt(document.getElementById('currentAge').value);
    const years = parseInt(document.getElementById('simulationYears').value);
    const currentRent = parseFloat(document.getElementById('currentRent').value);
    const rentIncrease = parseFloat(document.getElementById('rentIncrease').value);
    const housePrice = parseFloat(document.getElementById('housePrice').value);
    const downPaymentPercent = parseFloat(document.getElementById('downPayment').value);
    const loanTerm = parseInt(document.getElementById('loanTerm').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    const maintenancePercent = parseFloat(document.getElementById('maintenanceCost').value);
    
    // Calculate costs
    const rentCosts = calculateRentCosts(currentRent, rentIncrease, years);
    const ownershipData = calculateOwnershipCosts(housePrice, downPaymentPercent, loanTerm, interestRate, maintenancePercent, years);
    
    // Display summary
    const totalRentCost = rentCosts[rentCosts.length - 1].totalRent;
    const totalOwnershipCost = ownershipData.costs[ownershipData.costs.length - 1].totalOwnership;
    const costDifference = totalOwnershipCost - totalRentCost;
    
    document.getElementById('totalRentCost').textContent = formatNumber(totalRentCost);
    document.getElementById('totalOwnershipCost').textContent = formatNumber(totalOwnershipCost);
    document.getElementById('costDifference').textContent = formatNumber(Math.abs(costDifference));
    
    // Update charts
    updateComparisonChart(rentCosts, ownershipData.costs);
    updateOwnershipPieChart(ownershipData);
    updateDetailsTable(rentCosts, ownershipData.costs);
    updateSmartRecommendation(costDifference, totalRentCost, totalOwnershipCost, housePrice, years);
}

// Update comparison chart
function updateComparisonChart(rentCosts, ownershipCosts) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    const years = rentCosts.map(item => `السنة ${item.year}`);
    const rentData = rentCosts.map(item => item.totalRent);
    const ownershipData = ownershipCosts.map(item => item.totalOwnership);
    
    comparisonChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'إجمالي تكلفة الإيجار',
                data: rentData,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.1
            }, {
                label: 'إجمالي تكلفة التملك',
                data: ownershipData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        font: {
                            family: 'Segoe UI'
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('ar-SA') + ' ريال';
                        }
                    }
                }
            }
        }
    });
}

// Update ownership pie chart
function updateOwnershipPieChart(ownershipData) {
    const ctx = document.getElementById('ownershipPieChart').getContext('2d');
    
    if (ownershipPieChart) {
        ownershipPieChart.destroy();
    }
    
    const totalMaintenance = ownershipData.costs.reduce((sum, item) => sum + item.yearlyMaintenance, 0);
    
    ownershipPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['الدفعة المقدمة', 'إجمالي الفوائد', 'الصيانة'],
            datasets: [{
                data: [
                    ownershipData.downPayment,
                    ownershipData.totalInterest,
                    totalMaintenance
                ],
                backgroundColor: [
                    '#8b5cf6',
                    '#f59e0b',
                    '#ef4444'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Segoe UI'
                        }
                    }
                }
            }
        }
    });
}

// Update details table
function updateDetailsTable(rentCosts, ownershipCosts) {
    const tableBody = document.getElementById('detailsTableBody');
    tableBody.innerHTML = '';
    
    for (let i = 0; i < rentCosts.length; i++) {
        const rent = rentCosts[i];
        const ownership = ownershipCosts[i];
        const difference = ownership.totalOwnership - rent.totalRent;
        
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50';
        row.innerHTML = `
            <td class="p-3">${rent.year}</td>
            <td class="p-3">${formatNumber(rent.yearlyRent)}</td>
            <td class="p-3">${formatNumber(rent.totalRent)}</td>
            <td class="p-3">${formatNumber(ownership.totalYearly)}</td>
            <td class="p-3">${formatNumber(ownership.totalOwnership)}</td>
            <td class="p-3 ${difference > 0 ? 'text-red-600' : 'text-green-600'}">
                ${difference > 0 ? '+' : ''}${formatNumber(difference)}
            </td>
        `;
        tableBody.appendChild(row);
    }
}

// Update smart recommendation
function updateSmartRecommendation(costDifference, totalRentCost, totalOwnershipCost, housePrice, years) {
    const recommendationDiv = document.getElementById('smartRecommendation');
    
    let recommendation = '';
    let emoji = '';
    let color = '';
    
    const savingsPercentage = Math.abs(costDifference) / totalRentCost * 100;
    const equityBuilt = housePrice; // Simplified - assuming full equity after loan term
    
    if (costDifference < 0) {
        // Ownership is cheaper
        if (savingsPercentage > 20) {
            emoji = '🏠💰';
            color = 'text-green-600';
            recommendation = `<strong>التملك هو الخيار الأفضل!</strong><br>
                ستوفر ${formatNumber(Math.abs(costDifference))} على مدى ${years} سنة.<br>
                بالإضافة إلى بناء أصل عقاري بقيمة ${formatNumber(housePrice)}.`;
        } else {
            emoji = '🏠✅';
            color = 'text-green-500';
            recommendation = `<strong>التملك خيار جيد</strong><br>
                ستوفر ${formatNumber(Math.abs(costDifference))} مع بناء أصل عقاري.`;
        }
    } else {
        // Rent is cheaper
        if (savingsPercentage > 20) {
            emoji = '🏘️💡';
            color = 'text-blue-600';
            recommendation = `<strong>الإيجار قد يكون الأفضل حالياً</strong><br>
                ستوفر ${formatNumber(costDifference)} يمكن استثمارها.<br>
                لكن تذكر أنك لن تملك أصل عقاري.`;
        } else {
            emoji = '⚖️🤔';
            color = 'text-yellow-600';
            recommendation = `<strong>الفرق بسيط - اختر حسب ظروفك</strong><br>
                التملك: بناء أصل + استقرار<br>
                الإيجار: مرونة + استثمار الفائض`;
        }
    }
    
    recommendationDiv.innerHTML = `
        <div class="text-4xl mb-3">${emoji}</div>
        <div class="${color}">${recommendation}</div>
    `;
}

// Generate PDF report
function generatePDF() {
    // Check if calculations have been done
    const totalRentCost = document.getElementById('totalRentCost').textContent;
    const totalOwnershipCost = document.getElementById('totalOwnershipCost').textContent;
    
    if (totalRentCost === '0 ريال' || totalOwnershipCost === '0 ريال') {
        alert('يرجى إجراء الحسابات أولاً قبل تصدير التقرير');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>تقرير محاكاة الإيجار مقابل التملك</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    direction: rtl;
                    text-align: right;
                }
                .no-print { display: none; }
                h1, h2, h3 { color: #333; }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 20px 0;
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 8px; 
                    text-align: right;
                }
                th { 
                    background-color: #f2f2f2; 
                    font-weight: bold;
                }
                .summary-card {
                    display: inline-block;
                    margin: 10px;
                    padding: 20px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    text-align: center;
                    width: 200px;
                }
                .recommendation {
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            <h1>📊 تقرير محاكاة الإيجار مقابل التملك</h1>
            <p><strong>تاريخ التقرير:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
            
            <div class="summary-card">
                <h3>إجمالي تكلفة الإيجار</h3>
                <p>${document.getElementById('totalRentCost').textContent}</p>
            </div>
            
            <div class="summary-card">
                <h3>إجمالي تكلفة التملك</h3>
                <p>${document.getElementById('totalOwnershipCost').textContent}</p>
            </div>
            
            <div class="summary-card">
                <h3>الفرق</h3>
                <p>${document.getElementById('costDifference').textContent}</p>
            </div>
            
            <div class="recommendation">
                <h3>التوصية الذكية</h3>
                ${document.getElementById('smartRecommendation').innerHTML}
            </div>
            
            <h3>تفاصيل المقارنة السنوية</h3>
            ${document.getElementById('detailsTable').outerHTML}
            
            <div style="margin-top: 40px; font-size: 12px; color: #666;">
                <p>هذا التقرير تم إنشاؤه بواسطة محاكي الإيجار مقابل التملك</p>
                <p>لا يُعتبر هذا التقرير نصيحة مالية رسمية ويُنصح بالتشاور مع مستشار مالي مختص</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}


// Load default Saudi values
function loadSaudiDefaults() {
    document.getElementById('familySize').value = 4;
    document.getElementById('currentAge').value = 30;
    document.getElementById('simulationYears').value = 20;
    document.getElementById('currentRent').value = 2500;
    document.getElementById('rentIncrease').value = 5;
    document.getElementById('housePrice').value = 800000;
    document.getElementById('downPayment').value = 15;
    document.getElementById('loanTerm').value = 20;
    document.getElementById('interestRate').value = 5;
    document.getElementById('maintenanceCost').value = 1;
    
    // Update slider displays
    updateSliderValue('simulationYears', 'simulationYearsValue');
    updateSliderValue('rentIncrease', 'rentIncreaseValue');
    updateSliderValue('downPayment', 'downPaymentValue');
    updateSliderValue('interestRate', 'interestRateValue');
    updateSliderValue('maintenanceCost', 'maintenanceCostValue');
    
    // Recalculate
    calculateAndDisplay();
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        calculateAndDisplay();
    }
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        generatePDF();
    }
});

// Auto-save functionality
function saveToLocalStorage() {
    const data = {
        familySize: document.getElementById('familySize').value,
        currentAge: document.getElementById('currentAge').value,
        simulationYears: document.getElementById('simulationYears').value,
        currentRent: document.getElementById('currentRent').value,
        rentIncrease: document.getElementById('rentIncrease').value,
        housePrice: document.getElementById('housePrice').value,
        downPayment: document.getElementById('downPayment').value,
        loanTerm: document.getElementById('loanTerm').value,
        interestRate: document.getElementById('interestRate').value,
        maintenanceCost: document.getElementById('maintenanceCost').value
    };
    
    localStorage.setItem('rentalVsOwnershipData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('rentalVsOwnershipData');
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.keys(data).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = data[key];
                if (element.type === 'range') {
                    updateSliderValue(key, key + 'Value');
                }
            }
        });
    }
}

// Add auto-save functionality to inputs
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('change', saveToLocalStorage);
    });
});

// Utility function to validate inputs
function validateInputs() {
    const familySize = parseInt(document.getElementById('familySize').value);
    const currentAge = parseInt(document.getElementById('currentAge').value);
    const currentRent = parseFloat(document.getElementById('currentRent').value);
    const housePrice = parseFloat(document.getElementById('housePrice').value);
    
    if (familySize < 1 || familySize > 20) {
        alert('عدد أفراد الأسرة يجب أن يكون بين 1 و 20');
        return false;
    }
    
    if (currentAge < 18 || currentAge > 80) {
        alert('العمر يجب أن يكون بين 18 و 80 سنة');
        return false;
    }
    
    if (currentRent < 500) {
        alert('الإيجار الشهري يجب أن يكون أكثر من 500 ريال');
        return false;
    }
    
    if (housePrice < 100000) {
        alert('سعر المنزل يجب أن يكون أكثر من 100,000 ريال');
        return false;
    }
    
    return true;
}

// Enhanced calculation function with validation
function calculateAndDisplay() {
    if (!validateInputs()) {
        return;
    }
    
    try {
        // Get input values
        const familySize = parseInt(document.getElementById('familySize').value);
        const currentAge = parseInt(document.getElementById('currentAge').value);
        const years = parseInt(document.getElementById('simulationYears').value);
        const currentRent = parseFloat(document.getElementById('currentRent').value);
        const rentIncrease = parseFloat(document.getElementById('rentIncrease').value);
        const housePrice = parseFloat(document.getElementById('housePrice').value);
        const downPaymentPercent = parseFloat(document.getElementById('downPayment').value);
        const loanTerm = parseInt(document.getElementById('loanTerm').value);
        const interestRate = parseFloat(document.getElementById('interestRate').value);
        const maintenancePercent = parseFloat(document.getElementById('maintenanceCost').value);
        
        // Calculate costs
        const rentCosts = calculateRentCosts(currentRent, rentIncrease, years);
        const ownershipData = calculateOwnershipCosts(housePrice, downPaymentPercent, loanTerm, interestRate, maintenancePercent, years);
        
        // Display summary
        const totalRentCost = rentCosts[rentCosts.length - 1].totalRent;
        const totalOwnershipCost = ownershipData.costs[ownershipData.costs.length - 1].totalOwnership;
        const costDifference = totalOwnershipCost - totalRentCost;
        
        document.getElementById('totalRentCost').textContent = formatNumber(totalRentCost);
        document.getElementById('totalOwnershipCost').textContent = formatNumber(totalOwnershipCost);
        document.getElementById('costDifference').textContent = formatNumber(Math.abs(costDifference));
        
        // Update charts
        updateComparisonChart(rentCosts, ownershipData.costs);
        updateOwnershipPieChart(ownershipData);
        updateDetailsTable(rentCosts, ownershipData.costs);
        updateSmartRecommendation(costDifference, totalRentCost, totalOwnershipCost, housePrice, years);
        
        // Save to localStorage
        saveToLocalStorage();
        
    } catch (error) {
        console.error('خطأ في الحسابات:', error);
        alert('حدث خطأ في الحسابات. يرجى التحقق من البيانات المدخلة.');
    }
}

// Add touch support for mobile devices
function addTouchSupport() {
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        slider.addEventListener('touchstart', function() {
            this.classList.add('touching');
        });
        
        slider.addEventListener('touchend', function() {
            this.classList.remove('touching');
            calculateAndDisplay();
        });
    });
}

// Initialize touch support
document.addEventListener('DOMContentLoaded', addTouchSupport);

// Add loading animation
function showLoading() {
    const button = document.querySelector('button[onclick="calculateAndDisplay()"]');
    const originalText = button.textContent;
    button.textContent = '⏳ جاري الحساب...';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 1000);
}

// Override calculateAndDisplay to include loading
const originalCalculateAndDisplay = calculateAndDisplay;
calculateAndDisplay = function() {
    showLoading();
    setTimeout(originalCalculateAndDisplay, 100);
};

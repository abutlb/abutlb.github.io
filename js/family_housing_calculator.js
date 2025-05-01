document.addEventListener('DOMContentLoaded', function() {
  // Set current year in footer
  document.getElementById('currentYear').textContent = new Date().getFullYear();
  
  // Theme switching
  initThemeSwitching();
  
  // Tab switching
  initTabSwitching();
  
  // Field interactions
  initFieldInteractions();
  
  // Button event listeners
  document.getElementById('calculateBtn').addEventListener('click', calculateResults);
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  document.getElementById('addFinalTimelineEntry').addEventListener('click', addFinalTimelineEntry);
  
  // Load saved settings
  loadSettings();
});

// Theme switching functionality
function initThemeSwitching() {
  const themeToggle = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;
  const themeSwitchField = document.getElementById('themeSwitch_field');
  
  // Check for saved theme preference or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      htmlElement.classList.add('dark');
      themeSwitchField.checked = true;
  }
  
  // Theme toggle click handler
  themeToggle.addEventListener('click', () => {
      const isDark = htmlElement.classList.toggle('dark');
      themeSwitchField.checked = isDark;
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

// Tab switching functionality
function initTabSwitching() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
      button.addEventListener('click', () => {
          const targetTab = button.getAttribute('data-tab');
          
          // Update active tab button
          tabButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          
          // Show the selected tab content
          tabContents.forEach(content => {
              content.classList.add('hidden');
              if (content.id === `${targetTab}-tab`) {
                  content.classList.remove('hidden');
              }
          });
      });
  });
}

// Field interactions
function initFieldInteractions() {
  // Purchase price and down payment interaction
  const purchasePriceField = document.getElementById('purchasePrice_field');
  const downPaymentField = document.getElementById('downPayment_field');
  const downPaymentPercentField = document.getElementById('downPaymentPercent_field');
  
  purchasePriceField.addEventListener('input', () => {
      if (purchasePriceField.value && downPaymentPercentField.value) {
          const purchasePrice = parseFloat(purchasePriceField.value);
          const downPaymentPercent = parseFloat(downPaymentPercentField.value);
          downPaymentField.value = Math.round(purchasePrice * (downPaymentPercent / 100));
      }
  });
  
  downPaymentField.addEventListener('input', () => {
      if (purchasePriceField.value && downPaymentField.value) {
          const purchasePrice = parseFloat(purchasePriceField.value);
          const downPayment = parseFloat(downPaymentField.value);
          const percent = (downPayment / purchasePrice) * 100;
          downPaymentPercentField.value = percent.toFixed(1);
      }
  });
  
  downPaymentPercentField.addEventListener('input', () => {
      if (purchasePriceField.value && downPaymentPercentField.value) {
          const purchasePrice = parseFloat(purchasePriceField.value);
          const downPaymentPercent = parseFloat(downPaymentPercentField.value);
          downPaymentField.value = Math.round(purchasePrice * (downPaymentPercent / 100));
      }
  });
  
  // Future housing needs calculation
  const currentFamilySizeField = document.getElementById('currentFamilySize_field');
  const plannedChildrenField = document.getElementById('plannedChildren_field');
  const yearsUntilChildrenGrowUpField = document.getElementById('yearsUntilChildrenGrowUp_field');
  const currentAreaField = document.getElementById('currentArea_field');
  const futureSizeNeededField = document.getElementById('futureSizeNeeded_field');
  const futureUpgradeYearField = document.getElementById('futureUpgradeYear_field');
  
  // Update future size needed when family inputs change
  [currentFamilySizeField, plannedChildrenField, yearsUntilChildrenGrowUpField, currentAreaField].forEach(field => {
      field.addEventListener('input', updateFutureHousingNeeds);
  });
  
  // Current and previous rent relation
  const currentRentField = document.getElementById('currentRent_field');
  const previousRentField = document.getElementById('previousRent_field');
  
  currentRentField.addEventListener('input', () => {
      if (currentRentField.value && !previousRentField.value) {
          // If previous rent is empty, suggest a value 10% less than current
          const currentRent = parseFloat(currentRentField.value);
          previousRentField.value = Math.round(currentRent * 0.9);
      }
  });
}

// Calculate future housing needs based on family growth
function updateFutureHousingNeeds() {
  const currentFamilySize = parseFloat(document.getElementById('currentFamilySize_field').value) || 0;
  const plannedChildren = parseFloat(document.getElementById('plannedChildren_field').value) || 0;
  const yearsUntilGrowUp = parseFloat(document.getElementById('yearsUntilChildrenGrowUp_field').value) || 0;
  const currentArea = parseFloat(document.getElementById('currentArea_field').value) || 0;
  
  // Get area calculation parameters from settings
  const baseSqmForTwo = parseFloat(document.getElementById('baseSqmForTwo').value) || 100;
  const additionalSqmPerSmallChild = parseFloat(document.getElementById('additionalSqmPerSmallChild').value) || 15;
  const additionalSqmPerBigChild = parseFloat(document.getElementById('additionalSqmPerBigChild').value) || 25;
  
  if (currentFamilySize && plannedChildren && yearsUntilGrowUp) {
      const totalFutureSize = currentFamilySize + plannedChildren;
      const adultCount = Math.min(2, currentFamilySize);
      const currentChildrenCount = Math.max(0, currentFamilySize - 2);
      
      // Calculate future size needed
      let futureSizeNeeded = baseSqmForTwo; // Base size for two adults
      
      // Add space for current children (who will be grown up in the future)
      futureSizeNeeded += currentChildrenCount * additionalSqmPerBigChild;
      
      // Add space for planned children (who will also be grown up)
      futureSizeNeeded += plannedChildren * additionalSqmPerBigChild;
      
      document.getElementById('futureSizeNeeded_field').value = Math.round(futureSizeNeeded);
      
      // Calculate future upgrade year
      if (currentArea < futureSizeNeeded) {
          document.getElementById('futureUpgradeYear_field').value = yearsUntilGrowUp;
      } else {
          document.getElementById('futureUpgradeYear_field').value = 0; // No need to upgrade
      }
      
      // Calculate future home cost
      const averageSqmPrice = parseFloat(document.getElementById('averageSqmPrice').value) || 5000;
      const futureHomeCost = futureSizeNeeded * averageSqmPrice;
      document.getElementById('futureHomeCost_field').value = Math.round(futureHomeCost);
      
      // Calculate future rent cost (typically 4-6% of property value annually)
      const futureRentCost = Math.round(futureHomeCost * 0.05); // Using 5% as a typical rental yield
      document.getElementById('futureRentCost_field').value = futureRentCost;
  }
}

// Save settings to localStorage
function saveSettings() {
  const settings = {
      inflationRate: document.getElementById('inflationRate').value,
      rentIncreaseRate: document.getElementById('rentIncreaseRate').value,
      propertyAppreciationRate: document.getElementById('propertyAppreciationRate').value,
      baseSqmForTwo: document.getElementById('baseSqmForTwo').value,
      additionalSqmPerSmallChild: document.getElementById('additionalSqmPerSmallChild').value,
      additionalSqmPerBigChild: document.getElementById('additionalSqmPerBigChild').value,
      sellingCostsRate: document.getElementById('sellingCostsRate').value,
      purchaseCostsRate: document.getElementById('purchaseCostsRate').value,
      averageSqmPrice: document.getElementById('averageSqmPrice').value,
      recommendedDtiRatio: document.getElementById('recommendedDtiRatio').value,
      recommendedHousingRatio: document.getElementById('recommendedHousingRatio').value
  };
  
  localStorage.setItem('familyHousingCalculatorSettings', JSON.stringify(settings));
  
  // Show confirmation message
  alert('تم حفظ الإعدادات بنجاح');
}

// Load settings from localStorage
function loadSettings() {
  const savedSettings = localStorage.getItem('familyHousingCalculatorSettings');
  
  if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      
      // Apply saved settings to form fields
      for (const [key, value] of Object.entries(settings)) {
          const element = document.getElementById(key);
          if (element) {
              element.value = value;
          }
      }
  }
}

// Main calculation function
function calculateResults() {
  // Check required fields
  const requiredFields = [
      'currentRent_field',
      'currentFamilySize_field',
      'monthlyIncome_field',
      'purchasePrice_field',
      'expectedStayYears_buy_field',
      'expectedStayYears_rent_field'
  ];
  
  let isFormValid = true;
  
  requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field.value) {
          field.classList.add('border-red-500');
          isFormValid = false;
      } else {
          field.classList.remove('border-red-500');
      }
  });
  
  if (!isFormValid) {
      alert('يرجى تعبئة جميع الحقول المطلوبة');
      return;
  }
  
  // Get all necessary values from form
  const inputData = {
      // Current situation
      currentRent: parseFloat(document.getElementById('currentRent_field').value),
      previousRent: parseFloat(document.getElementById('previousRent_field').value) || 0,
      currentHomeType: document.getElementById('currentHome_field').value,
      currentArea: parseFloat(document.getElementById('currentArea_field').value) || 0,
      
      // Family situation
      currentFamilySize: parseFloat(document.getElementById('currentFamilySize_field').value),
      plannedChildren: parseFloat(document.getElementById('plannedChildren_field').value) || 0,
      yearsUntilChildrenGrowUp: parseFloat(document.getElementById('yearsUntilChildrenGrowUp_field').value) || 0,
      expectedStayYearsBuy: parseFloat(document.getElementById('expectedStayYears_buy_field').value),
      expectedStayYearsRent: parseFloat(document.getElementById('expectedStayYears_rent_field').value),
      
      // Income and expenses
      monthlyIncome: parseFloat(document.getElementById('monthlyIncome_field').value),
      additionalIncome: parseFloat(document.getElementById('additionalIncome_field').value) || 0,
      monthlyDebt: parseFloat(document.getElementById('monthlyDebt_field').value) || 0,
      monthlyExpenses: parseFloat(document.getElementById('monthlyExpenses_field').value) || 0,
      
      // Purchase options
      purchaseType: document.getElementById('purchaseType_field').value,
      purchasePrice: parseFloat(document.getElementById('purchasePrice_field').value),
      purchaseArea: parseFloat(document.getElementById('purchaseArea_field').value) || 0,
      propertyLocation: document.getElementById('propertyLocation_field').value,
      
      // Financing options
      downPayment: parseFloat(document.getElementById('downPayment_field').value) || 0,
      downPaymentPercent: parseFloat(document.getElementById('downPaymentPercent_field').value) || 20,
      mortgageInterest: parseFloat(document.getElementById('mortgageInterest_field').value) || 3.5,
      mortgageTerm: parseFloat(document.getElementById('mortgageTerm_field').value) || 25,
      
      // Future housing needs
      futureSizeNeeded: parseFloat(document.getElementById('futureSizeNeeded_field').value) || 0,
      futureUpgradeYear: parseFloat(document.getElementById('futureUpgradeYear_field').value) || 0,
      futureHomeCost: parseFloat(document.getElementById('futureHomeCost_field').value) || 0,
      futureRentCost: parseFloat(document.getElementById('futureRentCost_field').value) || 0,
      
      // Additional costs
      maintenanceCost: parseFloat(document.getElementById('maintenanceCost_field').value) || 1,
      propertyTax: parseFloat(document.getElementById('propertyTax_field').value) || 0,
      utilityDifference: parseFloat(document.getElementById('utilityDifference_field').value) || 0,
      movingCost: parseFloat(document.getElementById('movingCost_field').value) || 5000,
      
      // Settings
      inflationRate: parseFloat(document.getElementById('inflationRate').value) || 2.5,
      rentIncreaseRate: parseFloat(document.getElementById('rentIncreaseRate').value) || 3,
      propertyAppreciationRate: parseFloat(document.getElementById('propertyAppreciationRate').value) || 3.5,
      sellingCostsRate: parseFloat(document.getElementById('sellingCostsRate').value) || 2.5,
      purchaseCostsRate: parseFloat(document.getElementById('purchaseCostsRate').value) || 2,
        // Settings (continued)
        recommendedDtiRatio: parseFloat(document.getElementById('recommendedDtiRatio').value) || 36,
        recommendedHousingRatio: parseFloat(document.getElementById('recommendedHousingRatio').value) || 28
    };
    
    // Calculate results
    const results = performCalculations(inputData);
    
    // Display results
    displayResults(results, inputData);
    
    // Show results section
    document.getElementById('results').classList.remove('hidden');
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// Perform all necessary calculations
function performCalculations(data) {
    const results = {};
    
    // Calculate affordability metrics
    results.affordability = calculateAffordability(data);
    
    // Calculate mortgage details
    results.mortgage = calculateMortgage(data);
    
    // Calculate ownership costs over time
    results.ownershipCosts = calculateOwnershipCosts(data);
    
    // Calculate rental costs over time
    results.rentalCosts = calculateRentalCosts(data);
    
    // Calculate upgrade costs for both scenarios
    results.upgradeCosts = calculateUpgradeCosts(data);
    
    // Calculate total costs and determine better option
    results.totalOwnershipCost = calculateTotalCost(results.ownershipCosts, results.upgradeCosts.ownership);
    results.totalRentalCost = calculateTotalCost(results.rentalCosts, results.upgradeCosts.rental);
    
    // Calculate property value appreciation and equity
    results.propertyValue = calculatePropertyValue(data);
    
    // Calculate net costs (total costs minus equity)
    results.netOwnershipCost = results.totalOwnershipCost - results.propertyValue.finalEquity;
    results.netRentalCost = results.totalRentalCost;
    
    // Determine better option
    results.betterOption = results.netOwnershipCost < results.netRentalCost ? 'ownership' : 'rental';
    
    // Calculate family growth metrics
    results.familyGrowth = calculateFamilyGrowth(data);
    
    // Generate timeline
    results.timeline = generateTimeline(data, results);
    
    return results;
}

// Calculate affordability
function calculateAffordability(data) {
    const totalMonthlyIncome = data.monthlyIncome + data.additionalIncome;
    const currentMonthlyDebt = data.monthlyDebt;
    
    // Maximum recommended housing cost based on income
    const maxHousingCost = totalMonthlyIncome * (data.recommendedHousingRatio / 100);
    
    // Maximum total debt including housing
    const maxMonthlyDebt = totalMonthlyIncome * (data.recommendedDtiRatio / 100);
    
    // Remaining debt capacity for mortgage/rent
    const remainingDebtCapacity = maxMonthlyDebt - currentMonthlyDebt;
    
    // Calculate maximum affordable mortgage payment
    const maxMortgagePayment = Math.min(maxHousingCost, remainingDebtCapacity);
    
    // Calculate maximum affordable home price
    const interestRate = data.mortgageInterest / 100 / 12; // Monthly interest rate
    const mortgageTermMonths = data.mortgageTerm * 12;
    
    // Formula: P = PMT * ((1 - (1 + r)^(-n)) / r)
    // where P = loan amount, PMT = monthly payment, r = interest rate, n = term in months
    let maxLoanAmount = 0;
    if (interestRate > 0) {
        maxLoanAmount = maxMortgagePayment * ((1 - Math.pow(1 + interestRate, -mortgageTermMonths)) / interestRate);
    } else {
        maxLoanAmount = maxMortgagePayment * mortgageTermMonths;
    }
    
    // Apply down payment percentage to get total affordable price
    const maxHomePrice = maxLoanAmount / (1 - (data.downPaymentPercent / 100));
    
    // Calculate current DTI (Debt to Income) ratio
    const currentMonthlyHousing = data.currentRent / 12;
    const currentDTI = ((currentMonthlyHousing + currentMonthlyDebt) / totalMonthlyIncome) * 100;
    
    // Calculate mortgage affordability ratio
    const mortgagePayment = calculateMonthlyMortgagePayment(data);
    const mortgageDTI = ((mortgagePayment + currentMonthlyDebt) / totalMonthlyIncome) * 100;
    
    // Calculate rent affordability ratio
    const rentDTI = ((data.currentRent / 12 + currentMonthlyDebt) / totalMonthlyIncome) * 100;
    
    return {
        totalMonthlyIncome,
        maxHousingCost,
        maxMonthlyDebt,
        remainingDebtCapacity,
        maxMortgagePayment,
        maxHomePrice,
        currentDTI,
        mortgageDTI,
        rentDTI,
        affordableMortgage: mortgageDTI <= data.recommendedDtiRatio,
        affordableRent: rentDTI <= data.recommendedDtiRatio
    };
}

// Calculate mortgage details
function calculateMortgage(data) {
    const loanAmount = data.purchasePrice * (1 - (data.downPaymentPercent / 100));
    const monthlyPayment = calculateMonthlyMortgagePayment(data);
    const totalPayments = monthlyPayment * data.mortgageTerm * 12;
    const totalInterest = totalPayments - loanAmount;
    
    // Calculate remaining mortgage balance at the end of stay period
    const remainingBalance = calculateRemainingMortgageBalance(
        loanAmount,
        data.mortgageInterest / 100,
        data.mortgageTerm,
        Math.min(data.expectedStayYearsBuy, data.mortgageTerm)
    );
    
    return {
        loanAmount,
        monthlyPayment,
        totalPayments,
        totalInterest,
        remainingBalance
    };
}

// Calculate monthly mortgage payment
function calculateMonthlyMortgagePayment(data) {
    const loanAmount = data.purchasePrice * (1 - (data.downPaymentPercent / 100));
    const monthlyRate = (data.mortgageInterest / 100) / 12;
    const totalPayments = data.mortgageTerm * 12;
    
    if (monthlyRate === 0) {
        return loanAmount / totalPayments;
    }
    
    return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
}

// Calculate remaining mortgage balance
function calculateRemainingMortgageBalance(principal, annualRate, termYears, currentYear) {
    const monthlyRate = annualRate / 12;
    const totalMonths = termYears * 12;
    const currentMonth = currentYear * 12;
    
    if (monthlyRate === 0) {
        return principal * (1 - currentMonth / totalMonths);
    }
    
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    let balance = principal;
    for (let i = 0; i < currentMonth; i++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = payment - interestPayment;
        balance -= principalPayment;
    }
    
    return Math.max(0, balance);
}

// Calculate ownership costs over time
function calculateOwnershipCosts(data) {
    const yearlyCosts = [];
    const cumulativeCosts = [];
    
    // Initial costs (down payment + purchase costs)
    const initialCosts = data.downPayment + (data.purchasePrice * data.purchaseCostsRate / 100);
    let cumulativeCost = initialCosts;
    
    const monthlyMortgagePayment = calculateMonthlyMortgagePayment(data);
    const yearlyMortgage = monthlyMortgagePayment * 12;
    
    // Annual costs for each year of expected stay
    for (let year = 1; year <= data.expectedStayYearsBuy; year++) {
        // Annual costs components
        const yearlyMaintenance = (data.purchasePrice * (data.maintenanceCost / 100)) * Math.pow(1 + data.inflationRate / 100, year - 1);
        const yearlyPropertyTax = data.propertyTax * Math.pow(1 + data.inflationRate / 100, year - 1);
        const yearlyUtilities = data.utilityDifference * 12 * Math.pow(1 + data.inflationRate / 100, year - 1);
        
        const totalYearlyCost = yearlyMortgage + yearlyMaintenance + yearlyPropertyTax + yearlyUtilities;
        yearlyCosts.push(totalYearlyCost);
        
        cumulativeCost += totalYearlyCost;
        cumulativeCosts.push(cumulativeCost);
    }
    
    // Calculate maintenance and financing costs separately
    const totalMaintenance = yearlyCosts.reduce((sum, _, i) => {
        return sum + (data.purchasePrice * (data.maintenanceCost / 100)) * Math.pow(1 + data.inflationRate / 100, i);
    }, 0);
    
    const totalFinancing = yearlyMortgage * data.expectedStayYearsBuy;
    
    return {
        initialCosts,
        yearlyCosts,
        cumulativeCosts,
        totalYearlyCosts: yearlyCosts.reduce((a, b) => a + b, 0),
        totalCosts: cumulativeCost,
        totalMaintenance,
        totalFinancing,
        monthlyPayment: monthlyMortgagePayment
    };
}

// Calculate rental costs over time
function calculateRentalCosts(data) {
    const yearlyCosts = [];
    const cumulativeCosts = [];
    
    // Initial costs (first month's rent + deposit + moving costs)
    const initialCosts = (data.currentRent / 12) + (data.currentRent / 12) + data.movingCost;
    let cumulativeCost = initialCosts;
    
    // Calculate historical rent increase rate if previous rent is provided
    let rentIncreaseRate = data.rentIncreaseRate;
    if (data.previousRent && data.previousRent > 0) {
        const historicalRate = ((data.currentRent / data.previousRent) - 1) * 100 / 2; // Divide by 2 years
        if (historicalRate > 0) {
            rentIncreaseRate = historicalRate;
        }
    }
    
    // First year rent is current rent
    let yearlyRent = data.currentRent;
    
    // Annual costs for each year of expected stay
    for (let year = 1; year <= data.expectedStayYearsRent; year++) {
        // Apply rent increase after first year
        if (year > 1) {
            yearlyRent *= (1 + rentIncreaseRate / 100);
        }
        
        yearlyCosts.push(yearlyRent);
        
        cumulativeCost += yearlyRent;
        cumulativeCosts.push(cumulativeCost);
    }
    
    return {
        initialCosts,
        yearlyCosts,
        cumulativeCosts,
        totalYearlyCosts: yearlyCosts.reduce((a, b) => a + b, 0),
        totalCosts: cumulativeCost,
        monthlyPayment: data.currentRent / 12,
        rentIncreaseRate
    };
}

// Calculate upgrade costs for both ownership and rental
function calculateUpgradeCosts(data) {
    const upgradeResults = {
        ownership: {
            isUpgradeNeeded: false,
            upgradeCosts: 0,
            yearlyPostUpgradeCosts: [],
            cumulativePostUpgradeCosts: [],
            totalPostUpgradeCosts: 0
        },
        rental: {
            isUpgradeNeeded: false,
            upgradeCosts: 0,
            yearlyPostUpgradeCosts: [],
            cumulativePostUpgradeCosts: [],
            totalPostUpgradeCosts: 0
        }
    };
    
    // Check if upgrade is needed
    if (data.futureUpgradeYear > 0 && data.futureUpgradeYear < data.expectedStayYearsBuy) {
        upgradeResults.ownership.isUpgradeNeeded = true;
        upgradeResults.rental.isUpgradeNeeded = true;
        
        // Calculate property value at upgrade time
        const propertyValueAtUpgrade = data.purchasePrice * Math.pow(1 + data.propertyAppreciationRate / 100, data.futureUpgradeYear);
        
        // Calculate remaining mortgage at upgrade time
        const remainingMortgage = calculateRemainingMortgageBalance(
            data.purchasePrice * (1 - (data.downPaymentPercent / 100)),
            data.mortgageInterest / 100,
            data.mortgageTerm,
            data.futureUpgradeYear
        );
        
        // Calculate equity at upgrade time
        const equityAtUpgrade = propertyValueAtUpgrade - remainingMortgage;
        
        // Calculate selling costs
        const sellingCosts = propertyValueAtUpgrade * (data.sellingCostsRate / 100);
        
        // Calculate net proceeds from sale
        const netProceeds = equityAtUpgrade - sellingCosts;
        
        // Calculate new purchase costs
        const newPurchaseCosts = data.futureHomeCost * (data.purchaseCostsRate / 100);
        
        // Calculate new down payment (using equity from previous home)
        const newDownPayment = Math.min(data.futureHomeCost * (data.downPaymentPercent / 100), netProceeds);
        
        // Calculate new loan amount
        const newLoanAmount = data.futureHomeCost - newDownPayment;
        
        // Calculate new mortgage payment
        const newMonthlyPayment = calculateMonthlyPaymentForLoan(
            newLoanAmount,
            data.mortgageInterest / 100,
            data.mortgageTerm
        );
        
        // Calculate total upgrade costs for ownership
        const ownershipUpgradeCosts = newPurchaseCosts + data.movingCost + Math.max(0, (data.futureHomeCost * (data.downPaymentPercent / 100)) - netProceeds);
        upgradeResults.ownership.upgradeCosts = ownershipUpgradeCosts;
        
        // Calculate yearly costs after upgrade for ownership
        let cumulativeOwnershipCost = ownershipUpgradeCosts;
        const yearlyOwnership = [];
        const cumulativeOwnership = [];
        
        for (let year = data.futureUpgradeYear + 1; year <= data.expectedStayYearsBuy; year++) {
          // Annual costs components after upgrade
          const yearsSinceUpgrade = year - data.futureUpgradeYear;
          const yearlyMaintenance = (data.futureHomeCost * (data.maintenanceCost / 100)) * Math.pow(1 + data.inflationRate / 100, yearsSinceUpgrade - 1);
          const yearlyPropertyTax = data.propertyTax * Math.pow(1 + data.inflationRate / 100, yearsSinceUpgrade - 1);
          const yearlyUtilities = data.utilityDifference * 12 * Math.pow(1 + data.inflationRate / 100, yearsSinceUpgrade - 1);
          
          const totalYearlyCost = newMonthlyPayment * 12 + yearlyMaintenance + yearlyPropertyTax + yearlyUtilities;
          yearlyOwnership.push(totalYearlyCost);
          
          cumulativeOwnershipCost += totalYearlyCost;
          cumulativeOwnership.push(cumulativeOwnershipCost);
      }
      
      upgradeResults.ownership.yearlyPostUpgradeCosts = yearlyOwnership;
      upgradeResults.ownership.cumulativePostUpgradeCosts = cumulativeOwnership;
      upgradeResults.ownership.totalPostUpgradeCosts = yearlyOwnership.reduce((a, b) => a + b, 0);
      upgradeResults.ownership.monthlyPaymentPostUpgrade = newMonthlyPayment;
      
      // Calculate upgrade costs for rental
      const rentalUpgradeCosts = data.movingCost;
      upgradeResults.rental.upgradeCosts = rentalUpgradeCosts;
      
      // Calculate yearly costs after upgrade for rental
      let cumulativeRentalCost = rentalUpgradeCosts;
      const yearlyRental = [];
      const cumulativeRental = [];
      
      // Start with the future rent cost
      let yearlyRent = data.futureRentCost;
      
      for (let year = data.futureUpgradeYear + 1; year <= data.expectedStayYearsRent; year++) {
          // Apply rent increase for each year after upgrade
          if (year > data.futureUpgradeYear + 1) {
              yearlyRent *= (1 + data.rentIncreaseRate / 100);
          }
          
          yearlyRental.push(yearlyRent);
          
          cumulativeRentalCost += yearlyRent;
          cumulativeRental.push(cumulativeRentalCost);
      }
      
      upgradeResults.rental.yearlyPostUpgradeCosts = yearlyRental;
      upgradeResults.rental.cumulativePostUpgradeCosts = cumulativeRental;
      upgradeResults.rental.totalPostUpgradeCosts = yearlyRental.reduce((a, b) => a + b, 0);
      upgradeResults.rental.monthlyPaymentPostUpgrade = data.futureRentCost / 12;
  }
  
  return upgradeResults;
}

// Calculate monthly mortgage payment for a specific loan amount
function calculateMonthlyPaymentForLoan(loanAmount, annualRate, termYears) {
  const monthlyRate = annualRate / 12;
  const totalPayments = termYears * 12;
  
  if (monthlyRate === 0) {
      return loanAmount / totalPayments;
  }
  
  return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
}

// Calculate total cost including initial, ongoing, and upgrade costs
function calculateTotalCost(regularCosts, upgradeCosts) {
  return regularCosts.totalCosts + (upgradeCosts.isUpgradeNeeded ? upgradeCosts.totalPostUpgradeCosts + upgradeCosts.upgradeCosts : 0);
}

// Calculate property value appreciation and equity
function calculatePropertyValue(data) {
  let initialPropertyValue = data.purchasePrice;
  let finalPropertyValue = 0;
  let finalMortgageBalance = 0;
  
  // If upgrade is needed, calculate final property value of the upgraded home
  if (data.futureUpgradeYear > 0 && data.futureUpgradeYear < data.expectedStayYearsBuy) {
      // Years with the future home
      const yearsWithFutureHome = data.expectedStayYearsBuy - data.futureUpgradeYear;
      
      // Final value of future home
      finalPropertyValue = data.futureHomeCost * Math.pow(1 + data.propertyAppreciationRate / 100, yearsWithFutureHome);
      
      // Calculate remaining mortgage balance for the future home
      const futureHomeLoanAmount = data.futureHomeCost - (data.futureHomeCost * (data.downPaymentPercent / 100));
      finalMortgageBalance = calculateRemainingMortgageBalance(
          futureHomeLoanAmount,
          data.mortgageInterest / 100,
          data.mortgageTerm,
          yearsWithFutureHome
      );
  } else {
      // Final value of initial home
      finalPropertyValue = data.purchasePrice * Math.pow(1 + data.propertyAppreciationRate / 100, data.expectedStayYearsBuy);
      
      // Calculate remaining mortgage balance
      finalMortgageBalance = calculateRemainingMortgageBalance(
          data.purchasePrice * (1 - (data.downPaymentPercent / 100)),
          data.mortgageInterest / 100,
          data.mortgageTerm,
          data.expectedStayYearsBuy
      );
  }
  
  // Calculate final equity
  const finalEquity = finalPropertyValue - finalMortgageBalance;
  
  return {
      initialPropertyValue,
      finalPropertyValue,
      finalMortgageBalance,
      finalEquity
  };
}

// Calculate family growth metrics
function calculateFamilyGrowth(data) {
  const familySizeByYear = [];
  const spaceNeededByYear = [];
  
  // Current family size
  let currentSize = data.currentFamilySize;
  
  // Base space required per person
  const baseSqmForTwo = parseFloat(document.getElementById('baseSqmForTwo').value) || 100;
  const additionalSqmPerSmallChild = parseFloat(document.getElementById('additionalSqmPerSmallChild').value) || 15;
  const additionalSqmPerBigChild = parseFloat(document.getElementById('additionalSqmPerBigChild').value) || 25;
  
  // Calculate family size and space needed for each year
  for (let year = 0; year <= Math.max(data.expectedStayYearsBuy, data.expectedStayYearsRent); year++) {
      // Add planned children according to growth year
      if (year === data.yearsUntilChildrenGrowUp) {
          currentSize += data.plannedChildren;
      }
      
      familySizeByYear.push({ year, size: currentSize });
      
      // Calculate space needed
      const adultCount = Math.min(2, currentSize);
      const childrenCount = Math.max(0, currentSize - 2);
      
      // Before children grow up, use small child space requirement
      const spaceNeeded = year < data.yearsUntilChildrenGrowUp
          ? baseSqmForTwo + (childrenCount * additionalSqmPerSmallChild)
          : baseSqmForTwo + (childrenCount * additionalSqmPerBigChild);
      
      spaceNeededByYear.push({ year, space: spaceNeeded });
  }
  
  return {
      familySizeByYear,
      spaceNeededByYear,
      initialFamilySize: data.currentFamilySize,
      finalFamilySize: data.currentFamilySize + data.plannedChildren
  };
}

// Generate timeline of events
function generateTimeline(data, results) {
  const timeline = [];
  
  // Initial purchase or rent
  timeline.push({
      year: 0,
      title: data.purchaseType === 'land_and_build' ? 'شراء الأرض والبناء' : 'شراء العقار الأول',
      description: `تكلفة الشراء: ${formatCurrency(data.purchasePrice)}`,
      icon: 'home',
      category: 'ownership'
  });
  
  timeline.push({
      year: 0,
      title: 'بداية الإيجار',
      description: `الإيجار السنوي: ${formatCurrency(data.currentRent)}`,
      icon: 'file-invoice-dollar',
      category: 'rental'
  });
  
  // Family growth event
  if (data.plannedChildren > 0) {
      timeline.push({
          year: data.yearsUntilChildrenGrowUp,
          title: 'نمو العائلة',
          description: `إضافة ${data.plannedChildren} ${data.plannedChildren === 1 ? 'طفل' : 'أطفال'} للعائلة، حجم العائلة الآن: ${data.currentFamilySize + data.plannedChildren}`,
          icon: 'baby',
          category: 'family'
      });
  }
  
  // Upgrade housing event
  if (data.futureUpgradeYear > 0) {
      timeline.push({
          year: data.futureUpgradeYear,
          title: 'الانتقال إلى مسكن أكبر (تملك)',
          description: `تكلفة المسكن الجديد: ${formatCurrency(data.futureHomeCost)}، المساحة: ${data.futureSizeNeeded} متر مربع`,
          icon: 'home',
          category: 'ownership'
      });
      
      timeline.push({
          year: data.futureUpgradeYear,
          title: 'الانتقال إلى مسكن أكبر (إيجار)',
          description: `الإيجار السنوي الجديد: ${formatCurrency(data.futureRentCost)}، المساحة: ${data.futureSizeNeeded} متر مربع`,
          icon: 'file-invoice-dollar',
          category: 'rental'
      });
  }
  
  // End of ownership period
  timeline.push({
      year: data.expectedStayYearsBuy,
      title: 'نهاية فترة التملك',
      description: `القيمة النهائية للعقار: ${formatCurrency(results.propertyValue.finalPropertyValue)}، المتبقي من القرض: ${formatCurrency(results.propertyValue.finalMortgageBalance)}`,
      icon: 'chart-line',
      category: 'ownership'
  });
  
  // End of rental period
  timeline.push({
      year: data.expectedStayYearsRent,
      title: 'نهاية فترة الإيجار',
      description: `إجمالي المدفوع للإيجار: ${formatCurrency(results.totalRentalCost)}`,
      icon: 'calendar-check',
      category: 'rental'
  });
  
  return timeline;
}

// Display the calculated results
function displayResults(results, inputData) {
  // Display affordability results
  displayAffordabilityResults(results.affordability, inputData);
  
  // Display summary results
  document.getElementById('totalOwnership_result').textContent = formatCurrency(results.totalOwnershipCost);
  document.getElementById('totalRent_result').textContent = formatCurrency(results.totalRentalCost);
  
  const betterOptionText = results.betterOption === 'ownership' 
      ? `التملك (أوفر بـ ${formatCurrency(results.netRentalCost - results.netOwnershipCost)})`
      : `الإيجار (أوفر بـ ${formatCurrency(results.netOwnershipCost - results.netRentalCost)})`;
  document.getElementById('betterOption_result').textContent = betterOptionText;
  
  // Display family growth insight
  displayFamilyInsight(results.familyGrowth, inputData);
  
  // Display recommendation
  displayRecommendation(results, inputData);
  
  // Display timeline
  displayTimeline(results.timeline);
  
  // Display comparison table
  displayComparisonTable(results, inputData);
  
  // Display charts
  createCostsChart(results, inputData);
  createCumulativeChart(results, inputData);
  createFamilySizeChart(results.familyGrowth, inputData);
  
  // Display final insight
  displayFinalInsight(results, inputData);
}

// Display affordability results
function displayAffordabilityResults(affordability, inputData) {
  // Mortgage affordability display
  const mortgageAffordabilityElement = document.getElementById('mortgageAffordability');
  const affordableHomePriceElement = document.getElementById('affordableHomePrice');
  
  if (affordability.affordableMortgage) {
      mortgageAffordabilityElement.innerHTML = `<span class="text-secondary-600 dark:text-secondary-400"><i class="fas fa-check-circle"></i> يمكنك تحمل تكاليف القرض</span>`;
      affordableHomePriceElement.textContent = `يمكنك تحمل شراء عقار بقيمة تصل إلى ${formatCurrency(affordability.maxHomePrice)}`;
  } else {
      mortgageAffordabilityElement.innerHTML = `<span class="text-red-600 dark:text-red-400"><i class="fas fa-exclamation-circle"></i> القرض يتجاوز النسبة المستحسنة من دخلك</span>`;
      affordableHomePriceElement.textContent = `سعر العقار المناسب لدخلك هو ${formatCurrency(affordability.maxHomePrice)}`;
  }
  
  // Rent affordability display
  const rentAffordabilityElement = document.getElementById('rentAffordability');
  const recommendedRentElement = document.getElementById('recommendedRent');
  
  if (affordability.affordableRent) {
      rentAffordabilityElement.innerHTML = `<span class="text-secondary-600 dark:text-secondary-400"><i class="fas fa-check-circle"></i> يمكنك تحمل تكاليف الإيجار الحالي</span>`;
      recommendedRentElement.textContent = `الإيجار السنوي المناسب لدخلك: ${formatCurrency(affordability.maxHousingCost * 12)}`;
  } else {
    rentAffordabilityElement.innerHTML = `<span class="text-red-600 dark:text-red-400"><i class="fas fa-exclamation-circle"></i> الإيجار يتجاوز النسبة المستحسنة من دخلك</span>`;
    recommendedRentElement.textContent = `الإيجار السنوي المناسب لدخلك: ${formatCurrency(affordability.maxHousingCost * 12)}`;
}

// Financial summary display
document.getElementById('totalIncomeDisplay').textContent = formatCurrency(affordability.totalMonthlyIncome) + ' شهرياً';
document.getElementById('dtiRatioDisplay').textContent = affordability.mortgageDTI.toFixed(1) + '%';
document.getElementById('maxHousingDisplay').textContent = formatCurrency(affordability.maxHousingCost) + ' شهرياً';
}

// Display family insight
function displayFamilyInsight(familyGrowth, inputData) {
const insightElement = document.getElementById('familyInsight_text');

let insightText = '';

// Check if family will grow
if (inputData.plannedChildren > 0) {
    insightText += `عائلتك ستنمو من ${inputData.currentFamilySize} إلى ${inputData.currentFamilySize + inputData.plannedChildren} خلال ${inputData.yearsUntilChildrenGrowUp} سنوات. `;
    
    // Compare current space with future needs
    const finalSpaceNeeded = familyGrowth.spaceNeededByYear[inputData.yearsUntilChildrenGrowUp].space;
    
    if (inputData.currentArea < finalSpaceNeeded) {
        insightText += `المساحة الحالية (${inputData.currentArea} متر مربع) ستكون غير كافية، حيث ستحتاج إلى ${Math.round(finalSpaceNeeded)} متر مربع على الأقل. `;
        
        if (inputData.purchaseArea >= finalSpaceNeeded) {
            insightText += `العقار الذي تفكر بشرائه (${inputData.purchaseArea} متر مربع) سيكون مناسباً لنمو عائلتك.`;
        } else {
            insightText += `العقار الذي تفكر بشرائه (${inputData.purchaseArea} متر مربع) قد يكون صغيراً أيضاً، وستحتاج للانتقال مرة أخرى في المستقبل.`;
        }
    } else {
        insightText += `المساحة الحالية (${inputData.currentArea} متر مربع) تبدو كافية لنمو عائلتك المستقبلي.`;
    }
} else {
    insightText = `لم تحدد خطط لزيادة حجم العائلة. المساحة الحالية (${inputData.currentArea} متر مربع) قد تكون كافية للمستقبل المنظور.`;
}

insightElement.textContent = insightText;
}

// Display recommendation
function displayRecommendation(results, inputData) {
const recommendationElement = document.getElementById('recommendation_text');

let recommendationText = '';

if (results.betterOption === 'ownership') {
    recommendationText = `بناءً على معطياتك، التملك يبدو الخيار الأوفر مالياً على المدى الطويل بفارق ${formatCurrency(results.netRentalCost - results.netOwnershipCost)}. `;
    
    // Add affordability check
    if (!results.affordability.affordableMortgage) {
        recommendationText += `لكن قسط التمويل الشهري (${formatCurrency(results.mortgage.monthlyPayment)}) يتجاوز النسبة المستحسنة من دخلك. قد تحتاج لزيادة الدفعة المقدمة أو البحث عن عقار أقل تكلفة. `;
    }
    
    // Add family growth consideration
    if (inputData.plannedChildren > 0 && inputData.purchaseArea < results.familyGrowth.spaceNeededByYear[inputData.yearsUntilChildrenGrowUp].space) {
        recommendationText += `ضع في اعتبارك أن العقار الذي تفكر بشرائه قد يكون صغيراً لعائلتك بعد ${inputData.yearsUntilChildrenGrowUp} سنوات، مما قد يتطلب انتقالاً إضافياً.`;
    }
} else {
    recommendationText = `بناءً على معطياتك، الاستمرار بالإيجار يبدو الخيار الأوفر مالياً بفارق ${formatCurrency(results.netOwnershipCost - results.netRentalCost)}. `;
    
    // Add rent increase consideration
    recommendationText += `لكن ضع في اعتبارك أن الإيجارات تميل للزيادة بمعدل ${inputData.rentIncreaseRate}% سنوياً، وقد تحتاج للانتقال مع نمو العائلة. `;
    
    // Add property appreciation consideration
    recommendationText += `كما أن سوق العقار يشهد زيادة بمعدل ${inputData.propertyAppreciationRate}% سنوياً، مما يعني أن تأخير الشراء قد يزيد من التكلفة المستقبلية.`;
}

recommendationElement.textContent = recommendationText;
}

// Display timeline
function displayTimeline(timeline) {
const timelineContainer = document.getElementById('timelineEvents');
timelineContainer.innerHTML = ''; // Clear existing timeline

// Sort timeline by year
timeline.sort((a, b) => a.year - b.year);

// Create timeline entries
timeline.forEach(event => {
    // Skip duplicate years for same category
    const existingEvents = timelineContainer.querySelectorAll(`[data-year="${event.year}"][data-category="${event.category}"]`);
    if (existingEvents.length > 0) return;
    
    const timelineItem = document.createElement('div');
    timelineItem.className = 'flex items-start relative';
    timelineItem.setAttribute('data-year', event.year);
    timelineItem.setAttribute('data-category', event.category);
    
    // Set timeline item color based on category
    let categoryColorClass = '';
    if (event.category === 'ownership') {
        categoryColorClass = 'bg-primary-500 dark:bg-primary-700';
    } else if (event.category === 'rental') {
        categoryColorClass = 'bg-accent-500 dark:bg-accent-700';
    } else if (event.category === 'family') {
        categoryColorClass = 'bg-secondary-500 dark:bg-secondary-700';
    }
    
    timelineItem.innerHTML = `
        <div class="absolute flex items-center justify-center w-4 h-4 ${categoryColorClass} rounded-full left-5 transform -translate-x-1/2 mt-1.5"></div>
        <div class="flex items-center justify-center w-8 h-8 ${categoryColorClass} bg-opacity-20 rounded-full mr-3">
            <i class="fas fa-${event.icon} text-${event.category === 'ownership' ? 'primary' : event.category === 'rental' ? 'accent' : 'secondary'}-600 dark:text-${event.category === 'ownership' ? 'primary' : event.category === 'rental' ? 'accent' : 'secondary'}-400"></i>
        </div>
        <div class="flex-1">
            <div class="flex justify-between items-start">
                <h3 class="font-bold text-neutral-800 dark:text-neutral-200">${event.title}</h3>
                <span class="text-sm bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md text-neutral-600 dark:text-neutral-300">
                    السنة ${event.year}
                </span>
            </div>
            <p class="text-neutral-600 dark:text-neutral-400">${event.description}</p>
        </div>
    `;
    
    timelineContainer.appendChild(timelineItem);
});
}

// Add final timeline entry
function addFinalTimelineEntry() {
const timelineContainer = document.getElementById('timelineEvents');
const betterOption = document.getElementById('betterOption_result').textContent;
const totalOwnership = document.getElementById('totalOwnership_result').textContent;
const totalRent = document.getElementById('totalRent_result').textContent;

const timelineItem = document.createElement('div');
timelineItem.className = 'flex items-start relative';

timelineItem.innerHTML = `
    <div class="absolute flex items-center justify-center w-4 h-4 bg-secondary-500 dark:bg-secondary-700 rounded-full left-5 transform -translate-x-1/2 mt-1.5"></div>
    <div class="flex items-center justify-center w-8 h-8 bg-secondary-500 bg-opacity-20 rounded-full mr-3">
        <i class="fas fa-trophy text-secondary-600 dark:text-secondary-400"></i>
    </div>
    <div class="flex-1">
        <div class="flex justify-between items-start">
            <h3 class="font-bold text-neutral-800 dark:text-neutral-200">النتيجة النهائية</h3>
            <span class="text-sm bg-secondary-100 dark:bg-secondary-700 px-2 py-1 rounded-md text-secondary-600 dark:text-secondary-300">
                المقارنة النهائية
            </span>
        </div>
        <p class="text-neutral-600 dark:text-neutral-400">الخيار الأوفر مالياً: ${betterOption}</p>
        <p class="text-neutral-600 dark:text-neutral-400">إجمالي تكلفة التملك: ${totalOwnership}</p>
        <p class="text-neutral-600 dark:text-neutral-400">إجمالي تكلفة الإيجار: ${totalRent}</p>
    </div>
`;

timelineContainer.appendChild(timelineItem);
}

// Display comparison table
function displayComparisonTable(results, inputData) {
// Initial monthly costs
document.getElementById('initialMonthlyOwnership_result').textContent = formatCurrency(results.ownershipCosts.monthlyPayment + (inputData.utilityDifference || 0));
document.getElementById('initialMonthlyRent_result').textContent = formatCurrency(inputData.currentRent / 12);

// Initial phase costs
const initialPhaseOwnershipCost = inputData.futureUpgradeYear > 0
    ? results.ownershipCosts.cumulativeCosts[inputData.futureUpgradeYear - 1]
    : results.ownershipCosts.totalCosts;
document.getElementById('initialPhaseOwnership_result').textContent = formatCurrency(initialPhaseOwnershipCost);

const initialPhaseRentCost = inputData.futureUpgradeYear > 0
    ? results.rentalCosts.cumulativeCosts[inputData.futureUpgradeYear - 1]
    : results.rentalCosts.totalCosts;
document.getElementById('initialPhaseRent_result').textContent = formatCurrency(initialPhaseRentCost);

// Upgrade costs
document.getElementById('upgradeCostOwnership_result').textContent = results.upgradeCosts.ownership.isUpgradeNeeded
    ? formatCurrency(results.upgradeCosts.ownership.upgradeCosts)
    : 'لا ينطبق';
document.getElementById('upgradeCostRent_result').textContent = results.upgradeCosts.rental.isUpgradeNeeded
    ? formatCurrency(results.upgradeCosts.rental.upgradeCosts)
    : 'لا ينطبق';

// Later monthly costs
document.getElementById('laterMonthlyOwnership_result').textContent = results.upgradeCosts.ownership.isUpgradeNeeded
    ? formatCurrency(results.upgradeCosts.ownership.monthlyPaymentPostUpgrade + (inputData.utilityDifference || 0))
    : 'لا ينطبق';
document.getElementById('laterMonthlyRent_result').textContent = results.upgradeCosts.rental.isUpgradeNeeded
    ? formatCurrency(results.upgradeCosts.rental.monthlyPaymentPostUpgrade)
    : 'لا ينطبق';

// Later phase costs
document.getElementById('laterPhaseOwnership_result').textContent = results.upgradeCosts.ownership.isUpgradeNeeded
    ? formatCurrency(results.upgradeCosts.ownership.totalPostUpgradeCosts)
    : 'لا ينطبق';
document.getElementById('laterPhaseRent_result').textContent = results.upgradeCosts.rental.isUpgradeNeeded
    ? formatCurrency(results.upgradeCosts.rental.totalPostUpgradeCosts)
    : 'لا ينطبق';

// Maintenance and financing costs
document.getElementById('maintenanceCosts_result').textContent = formatCurrency(results.ownershipCosts.totalMaintenance);
document.getElementById('financingCosts_result').textContent = formatCurrency(results.ownershipCosts.totalFinancing);

// Property value, mortgage, and net costs
document.getElementById('finalPropertyValue_result').textContent = formatCurrency(results.propertyValue.finalPropertyValue);
document.getElementById('remainingMortgage_result').textContent = formatCurrency(results.propertyValue.finalMortgageBalance);
document.getElementById('netOwnership_result').textContent = formatCurrency(results.netOwnershipCost);
document.getElementById('netRent_result').textContent = formatCurrency(results.netRentalCost);
}

// Display final insight
function displayFinalInsight(results, inputData) {
const insightElement = document.getElementById('finalInsight_text');

let insightText = '';

    // Calculate ROI for ownership
    const totalInvestment = results.ownershipCosts.initialCosts + results.ownershipCosts.totalYearlyCosts;
    const finalReturn = results.propertyValue.finalEquity;
    const roi = ((finalReturn / totalInvestment) - 1) * 100;
    
    // Add insight based on comparison results
    if (results.betterOption === 'ownership') {
        insightText += `التملك أوفر من الإيجار بمبلغ ${formatCurrency(results.netRentalCost - results.netOwnershipCost)} على مدار ${inputData.expectedStayYearsBuy} سنة. `;
        
        // Add ROI insight
        if (roi > 0) {
            insightText += `عائد الاستثمار في العقار: ${roi.toFixed(1)}% (من المبلغ المستثمر). `;
        } else {
            insightText += `لم يحقق الاستثمار في العقار عائداً إيجابياً خلال هذه الفترة. `;
        }
        
        // Add affordability insight
        if (!results.affordability.affordableMortgage) {
            insightText += `لكن انتبه: قسط التمويل يشكل ${results.affordability.mortgageDTI.toFixed(1)}% من دخلك، وهو أعلى من النسبة المستحسنة (${inputData.recommendedDtiRatio}%). `;
        }
    } else {
        insightText += `الإيجار أوفر من التملك بمبلغ ${formatCurrency(results.netOwnershipCost - results.netRentalCost)} على مدار ${inputData.expectedStayYearsRent} سنة. `;
        
        // Add long-term consideration
        if (inputData.expectedStayYearsRent < 10) {
            insightText += `لكن ضع في اعتبارك أن التملك قد يكون أوفر على المدى الطويل (أكثر من 10 سنوات). `;
        }
        
        // Add rent increase insight
        const finalRentYear = Math.min(inputData.expectedStayYearsRent, results.rentalCosts.yearlyCosts.length);
        const finalYearRent = results.rentalCosts.yearlyCosts[finalRentYear - 1];
        const initialYearRent = inputData.currentRent;
        const rentIncrease = ((finalYearRent / initialYearRent) - 1) * 100;
        
        insightText += `الإيجار سيزيد بنسبة ${rentIncrease.toFixed(1)}% خلال هذه الفترة، من ${formatCurrency(initialYearRent)} إلى ${formatCurrency(finalYearRent)} سنوياً. `;
    }
    
    // Add family needs insight
    if (inputData.plannedChildren > 0) {
        insightText += `مع نمو العائلة، ستحتاج إلى مساحة إضافية في المستقبل (${Math.round(results.familyGrowth.spaceNeededByYear[results.familyGrowth.spaceNeededByYear.length - 1].space)} متر مربع). `;
        
        // Comment on chosen property size
        if (inputData.purchaseArea < results.familyGrowth.spaceNeededByYear[results.familyGrowth.spaceNeededByYear.length - 1].space) {
            insightText += `العقار الذي تفكر بشرائه (${inputData.purchaseArea} متر مربع) قد لا يكون كافياً على المدى الطويل.`;
        } else {
            insightText += `العقار الذي تفكر بشرائه (${inputData.purchaseArea} متر مربع) سيكون كافياً لاحتياجات عائلتك المستقبلية.`;
        }
    }
    
    insightElement.textContent = insightText;
}

// Create costs chart
function createCostsChart(results, inputData) {
    const ctx = document.getElementById('costsChart').getContext('2d');
    
    // Prepare data
    const labels = Array.from({ length: Math.max(inputData.expectedStayYearsBuy, inputData.expectedStayYearsRent) }, (_, i) => `السنة ${i + 1}`);
    
    // Ownership yearly costs
    const ownershipData = [];
    for (let i = 0; i < labels.length; i++) {
        if (i < inputData.expectedStayYearsBuy) {
            if (i < inputData.futureUpgradeYear || inputData.futureUpgradeYear === 0) {
                // Initial home costs
                ownershipData.push(i < results.ownershipCosts.yearlyCosts.length ? results.ownershipCosts.yearlyCosts[i] : 0);
            } else {
                // Upgraded home costs
                const postUpgradeIndex = i - inputData.futureUpgradeYear;
                ownershipData.push(postUpgradeIndex < results.upgradeCosts.ownership.yearlyPostUpgradeCosts.length ? 
                    results.upgradeCosts.ownership.yearlyPostUpgradeCosts[postUpgradeIndex] : 0);
            }
        } else {
            ownershipData.push(0);
        }
    }
    
    // Rental yearly costs
    const rentalData = [];
    for (let i = 0; i < labels.length; i++) {
        if (i < inputData.expectedStayYearsRent) {
            if (i < inputData.futureUpgradeYear || inputData.futureUpgradeYear === 0) {
                // Initial rent costs
                rentalData.push(i < results.rentalCosts.yearlyCosts.length ? results.rentalCosts.yearlyCosts[i] : 0);
            } else {
                // Upgraded rent costs
                const postUpgradeIndex = i - inputData.futureUpgradeYear;
                rentalData.push(postUpgradeIndex < results.upgradeCosts.rental.yearlyPostUpgradeCosts.length ? 
                    results.upgradeCosts.rental.yearlyPostUpgradeCosts[postUpgradeIndex] : 0);
            }
        } else {
            rentalData.push(0);
        }
    }
    
    // Create chart
    if (window.costsChart instanceof Chart) {
      window.costsChart.destroy();
  }
  
    
    window.costsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'تكاليف التملك السنوية',
                    data: ownershipData,
                    borderColor: '#0ea5e9',
                    backgroundColor: 'rgba(14, 165, 233, 0.2)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                },
                {
                    label: 'تكاليف الإيجار السنوية',
                    data: rentalData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                        boxWidth: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + ' م';
                            } else if (value >= 1000) {
                                return (value / 1000).toFixed(0) + ' ألف';
                            }
                            return value;
                        }
                    }
                }
            }
        }
    });
}

// Create cumulative chart
function createCumulativeChart(results, inputData) {
    const ctx = document.getElementById('cumulativeChart').getContext('2d');
    
    // Prepare data
    const labels = Array.from({ length: Math.max(inputData.expectedStayYearsBuy, inputData.expectedStayYearsRent) }, (_, i) => `السنة ${i + 1}`);
    
    // Ownership cumulative costs
    const ownershipData = [results.ownershipCosts.initialCosts];
    for (let i = 0; i < labels.length; i++) {
        if (i < inputData.expectedStayYearsBuy) {
            let yearCost = 0;
            if (i < inputData.futureUpgradeYear || inputData.futureUpgradeYear === 0) {
                // Initial home costs
                yearCost = i < results.ownershipCosts.yearlyCosts.length ? results.ownershipCosts.yearlyCosts[i] : 0;
            } else {
                // Add upgrade costs in the upgrade year
                if (i === inputData.futureUpgradeYear) {
                    yearCost += results.upgradeCosts.ownership.upgradeCosts;
                }
                
                // Upgraded home costs
                const postUpgradeIndex = i - inputData.futureUpgradeYear;
                yearCost += postUpgradeIndex < results.upgradeCosts.ownership.yearlyPostUpgradeCosts.length ? 
                    results.upgradeCosts.ownership.yearlyPostUpgradeCosts[postUpgradeIndex] : 0;
            }
            
            ownershipData.push(ownershipData[ownershipData.length - 1] + yearCost);
        }
    }
    
    // Rental cumulative costs
    const rentalData = [results.rentalCosts.initialCosts];
    for (let i = 0; i < labels.length; i++) {
        if (i < inputData.expectedStayYearsRent) {
            let yearCost = 0;
            if (i < inputData.futureUpgradeYear || inputData.futureUpgradeYear === 0) {
                // Initial rent costs
                yearCost = i < results.rentalCosts.yearlyCosts.length ? results.rentalCosts.yearlyCosts[i] : 0;
            } else {
                // Add upgrade costs in the upgrade year
                if (i === inputData.futureUpgradeYear) {
                    yearCost += results.upgradeCosts.rental.upgradeCosts;
                }
                
                // Upgraded rent costs
                const postUpgradeIndex = i - inputData.futureUpgradeYear;
                yearCost += postUpgradeIndex < results.upgradeCosts.rental.yearlyPostUpgradeCosts.length ? 
                    results.upgradeCosts.rental.yearlyPostUpgradeCosts[postUpgradeIndex] : 0;
            }
            
            rentalData.push(rentalData[rentalData.length - 1] + yearCost);
        }
    }
    
    // Adjust arrays to have same length
    const maxLength = Math.max(ownershipData.length, rentalData.length);
    while (ownershipData.length < maxLength) ownershipData.push(ownershipData[ownershipData.length - 1]);
    while (rentalData.length < maxLength) rentalData.push(rentalData[rentalData.length - 1]);
    
    // Create chart
    if (window.cumulativeChart instanceof Chart) {
        window.cumulativeChart.destroy();
    }
    
    window.cumulativeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['البداية', ...labels],
            datasets: [
                {
                    label: 'التكلفة التراكمية للتملك',
                    data: ownershipData,
                    borderColor: '#0ea5e9',
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                },
                {
                    label: 'التكلفة التراكمية للإيجار',
                    data: rentalData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                        boxWidth: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + ' م';
                            } else if (value >= 1000) {
                                return (value / 1000).toFixed(0) + ' ألف';
                            }
                            return value;
                        }
                    }
                }
            }
        }
    });
}

// Create family size chart
function createFamilySizeChart(familyGrowth, inputData) {
    const ctx = document.getElementById('familySizeChart').getContext('2d');
    
    // Prepare data
    const years = familyGrowth.familySizeByYear.map(item => item.year);
    const familySizes = familyGrowth.familySizeByYear.map(item => item.size);
    const spaceNeeded = familyGrowth.spaceNeededByYear.map(item => item.space);
    
    // Create chart
    if (window.familySizeChart instanceof Chart) {
      window.familySizeChart.destroy();
  }
  
  window.familySizeChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: years.map(year => `السنة ${year}`),
          datasets: [
              {
                  label: 'عدد أفراد العائلة',
                  data: familySizes,
                  borderColor: '#22c55e',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  borderWidth: 2,
                  tension: 0.4,
                  yAxisID: 'y',
                  fill: false
              },
              {
                  label: 'المساحة المطلوبة (متر مربع)',
                  data: spaceNeeded,
                  borderColor: '#0ea5e9',
                  backgroundColor: 'rgba(14, 165, 233, 0.1)',
                  borderWidth: 2,
                  tension: 0.4,
                  yAxisID: 'y1',
                  fill: false
              }
          ]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              legend: {
                  position: 'top',
                  labels: {
                      boxWidth: 15,
                      usePointStyle: true,
                      pointStyle: 'circle'
                  }
              },
              tooltip: {
                  mode: 'index',
                  intersect: false
              }
          },
          scales: {
              y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  title: {
                      display: true,
                      text: 'عدد أفراد العائلة'
                  },
                  min: 0,
                  suggestedMax: Math.max(...familySizes) + 1
              },
              y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  title: {
                      display: true,
                      text: 'المساحة (متر مربع)'
                  },
                  min: 0,
                  grid: {
                      drawOnChartArea: false
                  }
              }
          }
      }
  });
  
  // Add reference lines for current and future housing
  if (inputData.currentArea) {
      addReferenceLineToChart(
          window.familySizeChart, 
          inputData.currentArea, 
          'المساحة الحالية', 
          'rgba(245, 158, 11, 0.5)', 
          'y1'
      );
  }
  
  if (inputData.purchaseArea) {
      addReferenceLineToChart(
          window.familySizeChart, 
          inputData.purchaseArea, 
          'مساحة العقار المراد شراؤه', 
          'rgba(14, 165, 233, 0.5)', 
          'y1'
      );
  }
}

// Add reference line to chart
function addReferenceLineToChart(chart, value, label, color, scaleID) {
  if (!chart) return;
  
  chart.options.plugins.annotation = {
      annotations: {
          [label]: {
              type: 'line',
              yMin: value,
              yMax: value,
              borderColor: color,
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                  display: true,
                  content: `${label}: ${value}`,
                  position: 'end',
                  backgroundColor: color
              },
              scaleID: scaleID
          }
      }
  };
  
  chart.update();
}

// Format currency function
function formatCurrency(value) {
  return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0
  }).format(value);
}

// Sync down payment amount and percentage
function syncDownPayment(data) {
  // If amount changed, update percentage
  if (data.source === 'amount') {
      const percentage = (data.downPayment / data.purchasePrice) * 100;
      document.getElementById('downPaymentPercent_field').value = percentage.toFixed(1);
  }
  // If percentage changed, update amount
  else if (data.source === 'percentage') {
      const amount = data.purchasePrice * (data.downPaymentPercent / 100);
      document.getElementById('downPayment_field').value = amount.toFixed(0);
  }
}

// Calculate future housing needs based on family growth
function calculateFutureHousingNeeds() {
  const currentFamilySize = parseInt(document.getElementById('currentFamilySize_field').value) || 0;
  const plannedChildren = parseInt(document.getElementById('plannedChildren_field').value) || 0;
  const yearsUntilChildrenGrowUp = parseInt(document.getElementById('yearsUntilChildrenGrowUp_field').value) || 0;
  
  // Get space parameters from settings
  const baseSqmForTwo = parseFloat(document.getElementById('baseSqmForTwo').value) || 100;
  const additionalSqmPerSmallChild = parseFloat(document.getElementById('additionalSqmPerSmallChild').value) || 15;
  const additionalSqmPerBigChild = parseFloat(document.getElementById('additionalSqmPerBigChild').value) || 25;
  
  // Calculate total family size
  const totalFamilySize = currentFamilySize + plannedChildren;
  
  // Calculate space needed
  const adultCount = Math.min(2, totalFamilySize);
  const childrenCount = Math.max(0, totalFamilySize - 2);
  
  const spaceNeeded = baseSqmForTwo + (childrenCount * additionalSqmPerBigChild);
  
  // Update the future size needed field
  document.getElementById('futureSizeNeeded_field').value = Math.round(spaceNeeded);
  
  // Calculate future upgrade year if not set
  if (!document.getElementById('futureUpgradeYear_field').value && yearsUntilChildrenGrowUp > 0) {
      document.getElementById('futureUpgradeYear_field').value = yearsUntilChildrenGrowUp;
  }
  
  // Calculate future home cost if not set
  if (!document.getElementById('futureHomeCost_field').value && spaceNeeded > 0) {
      const averageSqmPrice = parseFloat(document.getElementById('averageSqmPrice').value) || 5000;
      const futureCost = spaceNeeded * averageSqmPrice;
      document.getElementById('futureHomeCost_field').value = Math.round(futureCost);
  }
  
  // Calculate future rent cost if not set
  if (!document.getElementById('futureRentCost_field').value && document.getElementById('futureHomeCost_field').value) {
      const futureHomeCost = parseFloat(document.getElementById('futureHomeCost_field').value) || 0;
      // Typical annual rent is about 5% of property value
      const futureRentCost = futureHomeCost * 0.05;
      document.getElementById('futureRentCost_field').value = Math.round(futureRentCost);
  }
}

// Initialize the calculator
function initializeCalculator() {
  // Set current year in footer
  document.getElementById('currentYear').textContent = new Date().getFullYear();
  
  // Initialize theme from localStorage
  const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
  if (darkModeEnabled) {
      document.documentElement.classList.add('dark');
      document.getElementById('themeSwitch_field').checked = true;
      document.querySelector('.toggle-dot').classList.add('translate-x-6');
  }
  
  // Theme toggle functionality
  document.getElementById('themeToggle').addEventListener('click', function() {
      const checkbox = document.getElementById('themeSwitch_field');
      checkbox.checked = !checkbox.checked;
      document.documentElement.classList.toggle('dark');
      document.querySelector('.toggle-dot').classList.toggle('translate-x-6');
      localStorage.setItem('darkMode', checkbox.checked);
  });
  
  // Tab switching functionality
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
      button.addEventListener('click', () => {
          const tabName = button.getAttribute('data-tab');
          
          // Update active tab button
          tabButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          
          // Show selected tab content
          tabContents.forEach(content => content.classList.add('hidden'));
          document.getElementById(`${tabName}-tab`).classList.remove('hidden');
      });
  });
  
  // Setup event listeners for inputs that need synchronization
  document.getElementById('downPayment_field').addEventListener('input', function() {
      const purchasePrice = parseFloat(document.getElementById('purchasePrice_field').value) || 0;
      const downPayment = parseFloat(this.value) || 0;
      
      if (purchasePrice > 0) {
          syncDownPayment({
              purchasePrice: purchasePrice,
              downPayment: downPayment,
              source: 'amount'
          });
      }
  });
  
  document.getElementById('downPaymentPercent_field').addEventListener('input', function() {
      const purchasePrice = parseFloat(document.getElementById('purchasePrice_field').value) || 0;
      const downPaymentPercent = parseFloat(this.value) || 0;
      
      if (purchasePrice > 0) {
          syncDownPayment({
              purchasePrice: purchasePrice,
              downPaymentPercent: downPaymentPercent,
              source: 'percentage'
          });
      }
  });
  
  document.getElementById('purchasePrice_field').addEventListener('input', function() {
      const purchasePrice = parseFloat(this.value) || 0;
      const downPaymentPercent = parseFloat(document.getElementById('downPaymentPercent_field').value) || 0;
      
      if (purchasePrice > 0) {
          syncDownPayment({
              purchasePrice: purchasePrice,
              downPaymentPercent: downPaymentPercent,
              source: 'percentage'
          });
      }
  });
  
  // Auto-calculate future housing needs when family size changes
  document.getElementById('currentFamilySize_field').addEventListener('input', calculateFutureHousingNeeds);
  document.getElementById('plannedChildren_field').addEventListener('input', calculateFutureHousingNeeds);
  document.getElementById('yearsUntilChildrenGrowUp_field').addEventListener('input', calculateFutureHousingNeeds);
  
  // Calculate button click handler
  document.getElementById('calculateBtn').addEventListener('click', calculateResults);
  
  // Save settings button click handler
  document.getElementById('saveSettings').addEventListener('click', function() {
      alert('تم حفظ الإعدادات بنجاح');
  });
  
  // Add event listener for the final timeline entry button
  document.getElementById('addFinalTimelineEntry').addEventListener('click', addFinalTimelineEntry);
  
  // Initialize tooltip functionality
  initializeTooltips();
}

// Initialize tooltips
function initializeTooltips() {
  // No additional functionality needed for tooltips as they're handled with CSS
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeCalculator);



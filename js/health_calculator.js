/**
 * Health Calculator - Comprehensive health assessment and recommendation tool
 * Author: Abdullah Altwijri
 * Version: 1.0.0
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme toggle
    initThemeToggle();
    
    // Initialize tab navigation
    initTabNavigation();
    
    // Initialize tooltips
    initTooltips();
    
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Initialize form handlers
    initFormHandlers();
    
    // Initialize print functionality
    initPrintFunctionality();
    
    // Initialize settings handlers
    initSettingsHandlers();
    
    // Check for saved form data
    loadSavedFormData();
  });
  
  /**
   * Initialize theme toggle functionality
   */
  function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeSwitchField = document.getElementById('themeSwitch_field');
    const body = document.body;
    
    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      body.classList.add('dark');
      if (themeSwitchField) themeSwitchField.checked = true;
    } else {
      body.classList.remove('dark');
      if (themeSwitchField) themeSwitchField.checked = false;
    }
    
    // Theme toggle click handler
    if (themeToggle) {
      themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark');
        if (themeSwitchField) themeSwitchField.checked = !themeSwitchField.checked;
        
        if (body.classList.contains('dark')) {
          localStorage.setItem('theme', 'dark');
        } else {
          localStorage.setItem('theme', 'light');
        }
      });
    }
  }
  
  /**
   * Initialize tab navigation
   */
  function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons and hide all contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.add('hidden'));
        
        // Add active class to clicked button and show corresponding content
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        const tabContent = document.getElementById(`${tabId}-tab`);
        if (tabContent) {
          tabContent.classList.remove('hidden');
        }
      });
    });
  }
  
  /**
   * Initialize tooltips
   */
  function initTooltips() {
    // Add hover functionality for tooltips if needed
    // Modern browsers handle this with CSS
  }
  
  /**
   * Initialize form handlers
   */
  function initFormHandlers() {
    const calculateBtn = document.getElementById('calculateBtn');
    const healthForm = document.getElementById('healthForm');
    
    if (calculateBtn && healthForm) {
      calculateBtn.addEventListener('click', function() {
        // Check if required fields are filled
        const requiredFields = healthForm.querySelectorAll('[required]');
        let allFieldsValid = true;
        
        requiredFields.forEach(field => {
          if (!field.value) {
            field.classList.add('border-red-500');
            allFieldsValid = false;
          } else {
            field.classList.remove('border-red-500');
          }
        });
        
        if (allFieldsValid) {
          calculateHealthMetrics();
        } else {
          // Show error message
          alert('يرجى ملء جميع الحقول المطلوبة');
        }
      });
      
      // Add input event listeners to remove error styling when user types
      const formInputs = healthForm.querySelectorAll('input, select');
      formInputs.forEach(input => {
        input.addEventListener('input', function() {
          this.classList.remove('border-red-500');
        });
      });
    }
  }
  
  /**
   * Initialize print functionality
   */
  function initPrintFunctionality() {
    const printResultsBtn = document.getElementById('printResults');
    if (printResultsBtn) {
      printResultsBtn.addEventListener('click', function() {
        window.print();
      });
    }
  }
  
  /**
   * Initialize settings handlers
   */
  function initSettingsHandlers() {
    const saveSettingsBtn = document.getElementById('saveSettings');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', function() {
        saveSettings();
      });
    }
    
    // Initialize measurement unit change handlers
    const measurementUnitsSelect = document.getElementById('measurement_units');
    if (measurementUnitsSelect) {
      measurementUnitsSelect.addEventListener('change', function() {
        convertMeasurementUnits();
      });
    }
  }
  
  /**
   * Save settings to localStorage
   */
  function saveSettings() {
    const settings = {
      bmrFormula: document.getElementById('bmr_formula')?.value || 'mifflin',
      safeWeightLossRate: document.getElementById('safe_weight_loss_rate')?.value || 0.5,
      safeWeightGainRate: document.getElementById('safe_weight_gain_rate')?.value || 0.25,
      macroDistribution: document.getElementById('macro_distribution')?.value || 'balanced',
      recommendationDetail: document.getElementById('recommendation_detail')?.value || 'detailed',
      measurementUnits: document.getElementById('measurement_units')?.value || 'metric',
      saveDataLocally: document.getElementById('save_data_locally')?.checked || false
    };
    
    localStorage.setItem('healthCalculatorSettings', JSON.stringify(settings));
    
    // Show success message
    alert('تم حفظ الإعدادات بنجاح!');
  }
  
  /**
   * Load settings from localStorage
   */
  function loadSettings() {
    const savedSettings = localStorage.getItem('healthCalculatorSettings');
    if (!savedSettings) return null;
    
    try {
      const settings = JSON.parse(savedSettings);
      
      // Apply settings to form elements
      if (document.getElementById('bmr_formula')) 
        document.getElementById('bmr_formula').value = settings.bmrFormula || 'mifflin';
      
      if (document.getElementById('safe_weight_loss_rate')) 
        document.getElementById('safe_weight_loss_rate').value = settings.safeWeightLossRate || 0.5;
      
      if (document.getElementById('safe_weight_gain_rate')) 
        document.getElementById('safe_weight_gain_rate').value = settings.safeWeightGainRate || 0.25;
      
      if (document.getElementById('macro_distribution')) 
        document.getElementById('macro_distribution').value = settings.macroDistribution || 'balanced';
      
      if (document.getElementById('recommendation_detail')) 
        document.getElementById('recommendation_detail').value = settings.recommendationDetail || 'detailed';
      
      if (document.getElementById('measurement_units')) 
        document.getElementById('measurement_units').value = settings.measurementUnits || 'metric';
      
      if (document.getElementById('save_data_locally')) 
        document.getElementById('save_data_locally').checked = settings.saveDataLocally || false;
      
      return settings;
    } catch (e) {
      console.error('Error loading settings:', e);
      return null;
    }
  }
  
  /**
   * Save form data to localStorage
   */
  function saveFormData() {
    const saveDataLocally = document.getElementById('save_data_locally')?.checked || false;
    if (!saveDataLocally) return;
    
    const formData = {
      // Personal information
      age: document.getElementById('age_field')?.value || '',
      gender: document.getElementById('gender_field')?.value || '',
      height: document.getElementById('height_field')?.value || '',
      weight: document.getElementById('weight_field')?.value || '',
      activityLevel: document.getElementById('activity_level_field')?.value || '',
      
      // Health metrics
      bloodPressure: document.getElementById('blood_pressure_field')?.value || '',
      restingHeartRate: document.getElementById('resting_heart_rate_field')?.value || '',
      bloodSugar: document.getElementById('blood_sugar_field')?.value || '',
      cholesterol: document.getElementById('cholesterol_field')?.value || '',
      
      // Lifestyle
      sleepHours: document.getElementById('sleep_hours_field')?.value || '',
      waterIntake: document.getElementById('water_intake_field')?.value || '',
      stressLevel: document.getElementById('stress_level_field')?.value || '',
      smoking: document.getElementById('smoking_field')?.checked || false,
      alcohol: document.getElementById('alcohol_field')?.checked || false,
      meditation: document.getElementById('meditation_field')?.checked || false,
      balancedDiet: document.getElementById('balanced_diet_field')?.checked || false,
      
      // Diet
      dietType: document.getElementById('diet_type_field')?.value || '',
      mealsPerDay: document.getElementById('meals_per_day_field')?.value || '',
      fruits: document.getElementById('fruits_field')?.checked || false,
      vegetables: document.getElementById('vegetables_field')?.checked || false,
      grains: document.getElementById('grains_field')?.checked || false,
      protein: document.getElementById('protein_field')?.checked || false,
      dairy: document.getElementById('dairy_field')?.checked || false,
      processedFood: document.getElementById('processed_food_field')?.checked || false,
      dailyCalories: document.getElementById('daily_calories_field')?.value || '',
      
      // Health goals
      primaryGoal: document.getElementById('primary_goal_field')?.value || '',
      targetWeight: document.getElementById('target_weight_field')?.value || '',
      targetTimeframe: document.getElementById('target_timeframe_field')?.value || '',
      improveDiet: document.getElementById('improve_diet_field')?.checked || false,
      increaseActivity: document.getElementById('increase_activity_field')?.checked || false,
      quitSmoking: document.getElementById('quit_smoking_field')?.checked || false,
      reduceAlcohol: document.getElementById('reduce_alcohol_field')?.checked || false,
      improveMentalHealth: document.getElementById('improve_mental_health_field')?.checked || false,
      
      // Exercise
      exerciseFrequency: document.getElementById('exercise_frequency_field')?.value || '',
      exerciseDuration: document.getElementById('exercise_duration_field')?.value || '',
      cardio: document.getElementById('cardio_field')?.checked || false,
      strength: document.getElementById('strength_field')?.checked || false,
      flexibility: document.getElementById('flexibility_field')?.checked || false,
      hiit: document.getElementById('hiit_field')?.checked || false,
      sports: document.getElementById('sports_field')?.checked || false,
      exerciseIntensity: document.getElementById('exercise_intensity_field')?.value || '',
      
      // Medical history
      diabetes: document.getElementById('diabetes_field')?.checked || false,
      hypertension: document.getElementById('hypertension_field')?.checked || false,
      heartDisease: document.getElementById('heart_disease_field')?.checked || false,
      asthma: document.getElementById('asthma_field')?.checked || false,
      thyroid: document.getElementById('thyroid_field')?.checked || false,
      mentalHealth: document.getElementById('mental_health_field')?.checked || false,
      medications: document.getElementById('medications_field')?.value || '',
      allergies: document.getElementById('allergies_field')?.value || '',
      familyHistory: document.getElementById('family_history_field')?.value || ''
    };
    
    localStorage.setItem('healthCalculatorFormData', JSON.stringify(formData));
  }
  
  /**
   * Load saved form data from localStorage
   */
  function loadSavedFormData() {
    const savedFormData = localStorage.getItem('healthCalculatorFormData');
    if (!savedFormData) return;
    
    try {
      const formData = JSON.parse(savedFormData);
      
      // Apply form data to elements
      for (const [key, value] of Object.entries(formData)) {
        const element = document.getElementById(`${key}_field`);
        if (!element) continue;
        
        if (element.type === 'checkbox') {
          element.checked = value;
        } else {
          element.value = value;
        }
      }
    } catch (e) {
      console.error('Error loading form data:', e);
    }
  }
  
  /**
   * Convert measurements between metric and imperial units
   */
  function convertMeasurementUnits() {
    const measurementUnits = document.getElementById('measurement_units')?.value;
    const heightField = document.getElementById('height_field');
    const weightField = document.getElementById('weight_field');
    const targetWeightField = document.getElementById('target_weight_field');
    
    if (!measurementUnits || !heightField || !weightField) return;
    
    const previousUnits = localStorage.getItem('previousMeasurementUnits');
    localStorage.setItem('previousMeasurementUnits', measurementUnits);
    
    if (previousUnits === measurementUnits) return;
    
    // Convert height
    if (heightField.value) {
      const height = parseFloat(heightField.value);
      if (!isNaN(height)) {
        if (measurementUnits === 'imperial' && previousUnits === 'metric') {
          // Convert cm to feet/inches
          const inches = height / 2.54;
          const feet = Math.floor(inches / 12);
          const remainingInches = Math.round(inches % 12);
          heightField.value = feet + '.' + (remainingInches < 10 ? '0' + remainingInches : remainingInches);
        } else if (measurementUnits === 'metric' && previousUnits === 'imperial') {
          // Convert feet.inches to cm
          const feet = Math.floor(height);
          const inches = Math.round((height - feet) * 100);
          heightField.value = Math.round((feet * 30.48) + (inches * 2.54));
        }
      }
    }
    
    // Convert weight
    if (weightField.value) {
      const weight = parseFloat(weightField.value);
      if (!isNaN(weight)) {
        if (measurementUnits === 'imperial' && previousUnits === 'metric') {
          // Convert kg to lbs
          weightField.value = Math.round(weight * 2.20462);
        } else if (measurementUnits === 'metric' && previousUnits === 'imperial') {
          // Convert lbs to kg
          weightField.value = Math.round(weight / 2.20462);
        }
      }
    }
    
    // Convert target weight
    if (targetWeightField && targetWeightField.value) {
      const targetWeight = parseFloat(targetWeightField.value);
      if (!isNaN(targetWeight)) {
        if (measurementUnits === 'imperial' && previousUnits === 'metric') {
        // Convert kg to lbs
        targetWeightField.value = Math.round(targetWeight * 2.20462);
      } else if (measurementUnits === 'metric' && previousUnits === 'imperial') {
        // Convert lbs to kg
        targetWeightField.value = Math.round(targetWeight / 2.20462);
      }
    }
  }
  
  // Update placeholders
  updateMeasurementPlaceholders();
}

/**
 * Update placeholders based on measurement units
 */
function updateMeasurementPlaceholders() {
  const measurementUnits = document.getElementById('measurement_units')?.value;
  const heightField = document.getElementById('height_field');
  const weightField = document.getElementById('weight_field');
  const targetWeightField = document.getElementById('target_weight_field');
  
  if (!measurementUnits) return;
  
  if (heightField) {
    heightField.placeholder = measurementUnits === 'metric' ? 'سم' : 'قدم.بوصة (مثال: 5.10)';
  }
  
  if (weightField) {
    weightField.placeholder = measurementUnits === 'metric' ? 'كجم' : 'رطل';
  }
  
  if (targetWeightField) {
    targetWeightField.placeholder = measurementUnits === 'metric' ? 'كجم' : 'رطل';
  }
  
  // Update labels
  const heightLabel = document.querySelector('label[for="height_field"]');
  const weightLabel = document.querySelector('label[for="weight_field"]');
  const targetWeightLabel = document.querySelector('label[for="target_weight_field"]');
  
  if (heightLabel) {
    heightLabel.innerHTML = measurementUnits === 'metric' ? 
      'الطول (سم)' : 
      'الطول (قدم.بوصة)';
  }
  
  if (weightLabel) {
    weightLabel.innerHTML = measurementUnits === 'metric' ? 
      'الوزن (كجم)' : 
      'الوزن (رطل)';
  }
  
  if (targetWeightLabel) {
    targetWeightLabel.innerHTML = measurementUnits === 'metric' ? 
      'الوزن المستهدف (كجم)' : 
      'الوزن المستهدف (رطل)';
  }
}

/**
 * Calculate all health metrics based on form data
 */
function calculateHealthMetrics() {
  // Get settings
  const settings = loadSettings() || {
    bmrFormula: 'mifflin',
    safeWeightLossRate: 0.5,
    safeWeightGainRate: 0.25,
    macroDistribution: 'balanced',
    recommendationDetail: 'detailed',
    measurementUnits: 'metric'
  };
  
  // Get form values
  const formData = getFormData();
  
  // Save form data if enabled
  saveFormData();
  
  // Calculate basic metrics
  const metrics = calculateBasicMetrics(formData, settings);
  
  // Calculate health assessment
  const healthAssessment = assessHealth(formData, metrics);
  
  // Generate recommendations
  const recommendations = generateRecommendations(formData, metrics, healthAssessment, settings);
  
  // Calculate weight plan if target weight is set
  const weightPlan = calculateWeightPlan(formData, metrics, settings);
  
  // Update UI with results
  updateResultsUI(formData, metrics, healthAssessment, recommendations, weightPlan, settings);
  
  // Show results section
  document.getElementById('results').classList.remove('hidden');
  
  // Scroll to results
  document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Get all form data
 * @returns {Object} Form data
 */
function getFormData() {
  const unitSystem = document.getElementById('measurement_units')?.value || 'metric';
  
  // Get basic form values
  const formData = {
    // Personal information
    age: parseInt(document.getElementById('age_field')?.value) || 0,
    gender: document.getElementById('gender_field')?.value || 'male',
    height: parseFloat(document.getElementById('height_field')?.value) || 0,
    weight: parseFloat(document.getElementById('weight_field')?.value) || 0,
    activityLevel: document.getElementById('activity_level_field')?.value || 'sedentary',
    
    // Health metrics (if available)
    bloodPressure: document.getElementById('blood_pressure_field')?.value || '',
    restingHeartRate: parseInt(document.getElementById('resting_heart_rate_field')?.value) || 0,
    bloodSugar: parseFloat(document.getElementById('blood_sugar_field')?.value) || 0,
    cholesterol: parseFloat(document.getElementById('cholesterol_field')?.value) || 0,
    
    // Lifestyle (if available)
    sleepHours: parseFloat(document.getElementById('sleep_hours_field')?.value) || 0,
    waterIntake: parseFloat(document.getElementById('water_intake_field')?.value) || 0,
    stressLevel: document.getElementById('stress_level_field')?.value || 'low',
    smoking: document.getElementById('smoking_field')?.checked || false,
    alcohol: document.getElementById('alcohol_field')?.checked || false,
    meditation: document.getElementById('meditation_field')?.checked || false,
    balancedDiet: document.getElementById('balanced_diet_field')?.checked || false,
    
    // Diet (if available)
    dietType: document.getElementById('diet_type_field')?.value || 'balanced',
    mealsPerDay: parseInt(document.getElementById('meals_per_day_field')?.value) || 3,
    fruits: document.getElementById('fruits_field')?.checked || false,
    vegetables: document.getElementById('vegetables_field')?.checked || false,
    grains: document.getElementById('grains_field')?.checked || false,
    protein: document.getElementById('protein_field')?.checked || false,
    dairy: document.getElementById('dairy_field')?.checked || false,
    processedFood: document.getElementById('processed_food_field')?.checked || false,
    dailyCalories: parseInt(document.getElementById('daily_calories_field')?.value) || 0,
    
    // Health goals
    primaryGoal: document.getElementById('primary_goal_field')?.value || 'maintain',
    targetWeight: parseFloat(document.getElementById('target_weight_field')?.value) || 0,
    targetTimeframe: parseInt(document.getElementById('target_timeframe_field')?.value) || 0,
    improveDiet: document.getElementById('improve_diet_field')?.checked || false,
    increaseActivity: document.getElementById('increase_activity_field')?.checked || false,
    quitSmoking: document.getElementById('quit_smoking_field')?.checked || false,
    reduceAlcohol: document.getElementById('reduce_alcohol_field')?.checked || false,
    improveMentalHealth: document.getElementById('improve_mental_health_field')?.checked || false,
    
    // Exercise (if available)
    exerciseFrequency: document.getElementById('exercise_frequency_field')?.value || 'never',
    exerciseDuration: parseInt(document.getElementById('exercise_duration_field')?.value) || 0,
    cardio: document.getElementById('cardio_field')?.checked || false,
    strength: document.getElementById('strength_field')?.checked || false,
    flexibility: document.getElementById('flexibility_field')?.checked || false,
    hiit: document.getElementById('hiit_field')?.checked || false,
    sports: document.getElementById('sports_field')?.checked || false,
    exerciseIntensity: document.getElementById('exercise_intensity_field')?.value || 'low',
    
    // Medical history (if available)
    diabetes: document.getElementById('diabetes_field')?.checked || false,
    hypertension: document.getElementById('hypertension_field')?.checked || false,
    heartDisease: document.getElementById('heart_disease_field')?.checked || false,
    asthma: document.getElementById('asthma_field')?.checked || false,
    thyroid: document.getElementById('thyroid_field')?.checked || false,
    mentalHealth: document.getElementById('mental_health_field')?.checked || false,
    medications: document.getElementById('medications_field')?.value || '',
    allergies: document.getElementById('allergies_field')?.value || '',
    familyHistory: document.getElementById('family_history_field')?.value || '',
    
    // Unit system
    unitSystem: unitSystem
  };
  
  // Convert measurements if needed
  if (unitSystem === 'imperial') {
    // Convert height from feet.inches to cm
    if (formData.height) {
      const feet = Math.floor(formData.height);
      const inches = Math.round((formData.height - feet) * 100);
      formData.heightInCm = Math.round((feet * 30.48) + (inches * 2.54));
    }
    
    // Convert weight from lbs to kg
    if (formData.weight) {
      formData.weightInKg = formData.weight / 2.20462;
    }
    
    // Convert target weight from lbs to kg
    if (formData.targetWeight) {
      formData.targetWeightInKg = formData.targetWeight / 2.20462;
    }
  } else {
    formData.heightInCm = formData.height;
    formData.weightInKg = formData.weight;
    formData.targetWeightInKg = formData.targetWeight;
  }
  
  return formData;
}

/**
 * Calculate basic health metrics
 * @param {Object} formData Form data
 * @param {Object} settings Calculator settings
 * @returns {Object} Calculated metrics
 */
function calculateBasicMetrics(formData, settings) {
  const metrics = {};
  
  // Calculate BMI
  metrics.heightInMeters = formData.heightInCm / 100;
  metrics.bmi = formData.weightInKg / (metrics.heightInMeters * metrics.heightInMeters);
  
  // Determine BMI category
  if (metrics.bmi < 18.5) {
    metrics.bmiCategory = 'underweight';
    metrics.bmiCategoryText = 'نقص وزن';
    metrics.bmiCategoryClass = 'text-blue-500';
  } else if (metrics.bmi < 25) {
    metrics.bmiCategory = 'normal';
    metrics.bmiCategoryText = 'وزن طبيعي';
    metrics.bmiCategoryClass = 'text-green-500';
  } else if (metrics.bmi < 30) {
    metrics.bmiCategory = 'overweight';
    metrics.bmiCategoryText = 'زيادة وزن';
    metrics.bmiCategoryClass = 'text-yellow-500';
  } else if (metrics.bmi < 35) {
    metrics.bmiCategory = 'obese1';
    metrics.bmiCategoryText = 'سمنة درجة أولى';
    metrics.bmiCategoryClass = 'text-orange-500';
  } else if (metrics.bmi < 40) {
    metrics.bmiCategory = 'obese2';
    metrics.bmiCategoryText = 'سمنة درجة ثانية';
    metrics.bmiCategoryClass = 'text-red-500';
  } else {
    metrics.bmiCategory = 'obese3';
    metrics.bmiCategoryText = 'سمنة درجة ثالثة';
    metrics.bmiCategoryClass = 'text-red-700';
  }
  
  // Calculate BMR based on selected formula
  if (settings.bmrFormula === 'mifflin') {
    // Mifflin-St Jeor Formula
    if (formData.gender === 'male') {
      metrics.bmr = (10 * formData.weightInKg) + (6.25 * formData.heightInCm) - (5 * formData.age) + 5;
    } else {
      metrics.bmr = (10 * formData.weightInKg) + (6.25 * formData.heightInCm) - (5 * formData.age) - 161;
    }
  } else if (settings.bmrFormula === 'harris') {
    // Harris-Benedict Formula
    if (formData.gender === 'male') {
      metrics.bmr = 88.362 + (13.397 * formData.weightInKg) + (4.799 * formData.heightInCm) - (5.677 * formData.age);
    } else {
      metrics.bmr = 447.593 + (9.247 * formData.weightInKg) + (3.098 * formData.heightInCm) - (4.330 * formData.age);
    }
  } else if (settings.bmrFormula === 'katch') {
    // Katch-McArdle Formula (requires body fat percentage, using estimate)
    // Estimate body fat percentage based on BMI
    let bodyFatPercentage;
    if (formData.gender === 'male') {
      bodyFatPercentage = (1.20 * metrics.bmi) + (0.23 * formData.age) - 16.2;
    } else {
      bodyFatPercentage = (1.20 * metrics.bmi) + (0.23 * formData.age) - 5.4;
    }
    
    // Ensure body fat percentage is within reasonable limits
    bodyFatPercentage = Math.max(5, Math.min(bodyFatPercentage, 50));
    
    // Calculate lean body mass
    const leanBodyMass = formData.weightInKg * (1 - (bodyFatPercentage / 100));
    
    // Katch-McArdle Formula
    metrics.bmr = 370 + (21.6 * leanBodyMass);
  }
  
  // Calculate TDEE based on activity level
  const activityMultipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very_active': 1.9
  };
  
  metrics.tdee = metrics.bmr * activityMultipliers[formData.activityLevel];
  
  // Calculate target calories based on goal
  switch (formData.primaryGoal) {
    case 'weight_loss':
      metrics.targetCalories = metrics.tdee - 500;
      break;
    case 'weight_gain':
    case 'muscle_gain':
      metrics.targetCalories = metrics.tdee + 500;
      break;
    default:
      metrics.targetCalories = metrics.tdee;
  }
  
  // Calculate macronutrient distribution based on settings
  switch (settings.macroDistribution) {
    case 'balanced':
      metrics.macros = {
        protein: { percent: 30, grams: Math.round((metrics.targetCalories * 0.3) / 4) },
        carbs: { percent: 40, grams: Math.round((metrics.targetCalories * 0.4) / 4) },
        fat: { percent: 30, grams: Math.round((metrics.targetCalories * 0.3) / 9) }
      };
      break;
      case 'low_carb':
        metrics.macros = {
          protein: { percent: 35, grams: Math.round((metrics.targetCalories * 0.35) / 4) },
          carbs: { percent: 25, grams: Math.round((metrics.targetCalories * 0.25) / 4) },
          fat: { percent: 40, grams: Math.round((metrics.targetCalories * 0.4) / 9) }
        };
        break;
      case 'high_protein':
        metrics.macros = {
          protein: { percent: 40, grams: Math.round((metrics.targetCalories * 0.4) / 4) },
          carbs: { percent: 30, grams: Math.round((metrics.targetCalories * 0.3) / 4) },
          fat: { percent: 30, grams: Math.round((metrics.targetCalories * 0.3) / 9) }
        };
        break;
      case 'keto':
        metrics.macros = {
          protein: { percent: 25, grams: Math.round((metrics.targetCalories * 0.25) / 4) },
          carbs: { percent: 5, grams: Math.round((metrics.targetCalories * 0.05) / 4) },
          fat: { percent: 70, grams: Math.round((metrics.targetCalories * 0.7) / 9) }
        };
        break;
      case 'mediterranean':
        metrics.macros = {
          protein: { percent: 25, grams: Math.round((metrics.targetCalories * 0.25) / 4) },
          carbs: { percent: 45, grams: Math.round((metrics.targetCalories * 0.45) / 4) },
          fat: { percent: 30, grams: Math.round((metrics.targetCalories * 0.3) / 9) }
        };
        break;
      default:
        metrics.macros = {
          protein: { percent: 30, grams: Math.round((metrics.targetCalories * 0.3) / 4) },
          carbs: { percent: 40, grams: Math.round((metrics.targetCalories * 0.4) / 4) },
          fat: { percent: 30, grams: Math.round((metrics.targetCalories * 0.3) / 9) }
        };
    }
    
    // Calculate ideal weight range based on BMI 18.5-24.9
    metrics.minHealthyWeight = Math.round(18.5 * (metrics.heightInMeters * metrics.heightInMeters));
    metrics.maxHealthyWeight = Math.round(24.9 * (metrics.heightInMeters * metrics.heightInMeters));
    
    // Calculate ideal weight using different formulas and take average
    // Hamwi Formula
    let hamwiIdealWeight;
    if (formData.gender === 'male') {
      hamwiIdealWeight = 48 + (2.7 * ((formData.heightInCm / 2.54) - 60));
    } else {
      hamwiIdealWeight = 45.5 + (2.2 * ((formData.heightInCm / 2.54) - 60));
    }
    
    // Devine Formula
    let devineIdealWeight;
    if (formData.gender === 'male') {
      devineIdealWeight = 50 + (2.3 * ((formData.heightInCm / 2.54) - 60));
    } else {
      devineIdealWeight = 45.5 + (2.3 * ((formData.heightInCm / 2.54) - 60));
    }
    
    // Robinson Formula
    let robinsonIdealWeight;
    if (formData.gender === 'male') {
      robinsonIdealWeight = 52 + (1.9 * ((formData.heightInCm / 2.54) - 60));
    } else {
      robinsonIdealWeight = 49 + (1.7 * ((formData.heightInCm / 2.54) - 60));
    }
    
    // Miller Formula
    let millerIdealWeight;
    if (formData.gender === 'male') {
      millerIdealWeight = 56.2 + (1.41 * ((formData.heightInCm / 2.54) - 60));
    } else {
      millerIdealWeight = 53.1 + (1.36 * ((formData.heightInCm / 2.54) - 60));
    }
    
    // Average of all formulas
    metrics.idealWeight = Math.round((hamwiIdealWeight + devineIdealWeight + robinsonIdealWeight + millerIdealWeight) / 4);
    
    // Convert to kg if using metric
    if (formData.unitSystem === 'metric') {
      metrics.idealWeight = Math.round(metrics.idealWeight * 0.453592);
    }
    
    // Calculate weight difference from ideal
    metrics.weightDifference = formData.unitSystem === 'metric' ? 
      formData.weight - metrics.idealWeight : 
      formData.weight - metrics.idealWeight;
    
    // Generate weight difference text
    if (Math.abs(metrics.weightDifference) < 1) {
      metrics.weightDifferenceText = "وزنك مثالي";
    } else if (metrics.weightDifference > 0) {
      metrics.weightDifferenceText = `${Math.abs(Math.round(metrics.weightDifference))} ${formData.unitSystem === 'metric' ? 'كجم' : 'رطل'} فوق الوزن المثالي`;
    } else {
      metrics.weightDifferenceText = `${Math.abs(Math.round(metrics.weightDifference))} ${formData.unitSystem === 'metric' ? 'كجم' : 'رطل'} تحت الوزن المثالي`;
    }
    
    // Calculate weight goal text
    if (metrics.bmi < 18.5) {
      metrics.weightGoalText = "زيادة الوزن للوصول للنطاق الصحي";
    } else if (metrics.bmi < 25) {
      metrics.weightGoalText = "الحفاظ على الوزن الحالي";
    } else {
      metrics.weightGoalText = "إنقاص الوزن للوصول للنطاق الصحي";
    }
    
    return metrics;
  }
  
  /**
   * Assess overall health based on form data and metrics
   * @param {Object} formData Form data
   * @param {Object} metrics Calculated metrics
   * @returns {Object} Health assessment
   */
  function assessHealth(formData, metrics) {
    const assessment = {
      scores: {},
      texts: {}
    };
    
    // Cardiovascular health score (0-100)
    let cardiovascularScore = 70; // Base score
    
    // Adjust based on BMI
    if (metrics.bmi < 18.5) cardiovascularScore -= 10;
    else if (metrics.bmi >= 25 && metrics.bmi < 30) cardiovascularScore -= 10;
    else if (metrics.bmi >= 30 && metrics.bmi < 35) cardiovascularScore -= 20;
    else if (metrics.bmi >= 35) cardiovascularScore -= 30;
    
    // Adjust based on activity level
    if (formData.activityLevel === 'sedentary') cardiovascularScore -= 15;
    else if (formData.activityLevel === 'light') cardiovascularScore -= 5;
    else if (formData.activityLevel === 'moderate') cardiovascularScore += 5;
    else if (formData.activityLevel === 'active') cardiovascularScore += 10;
    else if (formData.activityLevel === 'very_active') cardiovascularScore += 15;
    
    // Adjust based on smoking
    if (formData.smoking) cardiovascularScore -= 20;
    
    // Adjust based on resting heart rate if available
    if (formData.restingHeartRate) {
      if (formData.restingHeartRate < 60) cardiovascularScore += 10;
      else if (formData.restingHeartRate >= 60 && formData.restingHeartRate < 70) cardiovascularScore += 5;
      else if (formData.restingHeartRate >= 70 && formData.restingHeartRate < 80) cardiovascularScore += 0;
      else if (formData.restingHeartRate >= 80 && formData.restingHeartRate < 90) cardiovascularScore -= 5;
      else if (formData.restingHeartRate >= 90) cardiovascularScore -= 10;
    }
    
    // Ensure score is between 0-100
    assessment.scores.cardiovascular = Math.max(0, Math.min(100, cardiovascularScore));
    
    // Fitness score (0-100)
    let fitnessScore = 60; // Base score
    
    // Adjust based on activity level
    if (formData.activityLevel === 'sedentary') fitnessScore -= 20;
    else if (formData.activityLevel === 'light') fitnessScore -= 10;
    else if (formData.activityLevel === 'moderate') fitnessScore += 10;
    else if (formData.activityLevel === 'active') fitnessScore += 20;
    else if (formData.activityLevel === 'very_active') fitnessScore += 30;
    
    // Adjust based on exercise frequency if available
    if (formData.exerciseFrequency) {
      if (formData.exerciseFrequency === 'never') fitnessScore -= 20;
      else if (formData.exerciseFrequency === 'rarely') fitnessScore -= 10;
      else if (formData.exerciseFrequency === 'sometimes') fitnessScore += 0;
      else if (formData.exerciseFrequency === 'often') fitnessScore += 10;
      else if (formData.exerciseFrequency === 'daily') fitnessScore += 20;
    }
    
    // Adjust based on exercise types
    if (formData.cardio) fitnessScore += 5;
    if (formData.strength) fitnessScore += 5;
    if (formData.flexibility) fitnessScore += 5;
    if (formData.hiit) fitnessScore += 5;
    if (formData.sports) fitnessScore += 5;
    
    // Ensure score is between 0-100
    assessment.scores.fitness = Math.max(0, Math.min(100, fitnessScore));
    
    // Nutrition score (0-100)
    let nutritionScore = 60; // Base score
    
    // Adjust based on diet type
    if (formData.dietType === 'balanced') nutritionScore += 10;
    else if (formData.dietType === 'mediterranean') nutritionScore += 15;
    else if (formData.dietType === 'vegetarian') nutritionScore += 5;
    else if (formData.dietType === 'vegan') nutritionScore += 5;
    else if (formData.dietType === 'keto') nutritionScore += 0;
    else if (formData.dietType === 'paleo') nutritionScore += 0;
    
    // Adjust based on food groups
    if (formData.fruits) nutritionScore += 10;
    if (formData.vegetables) nutritionScore += 10;
    if (formData.grains) nutritionScore += 5;
    if (formData.protein) nutritionScore += 5;
    if (formData.dairy) nutritionScore += 5;
    if (formData.processedFood) nutritionScore -= 15;
    
    // Adjust based on balanced diet
    if (formData.balancedDiet) nutritionScore += 10;
    
    // Ensure score is between 0-100
    assessment.scores.nutrition = Math.max(0, Math.min(100, nutritionScore));
    
    // Mental health score (0-100)
    let mentalScore = 70; // Base score
    
    // Adjust based on stress level
    if (formData.stressLevel === 'high') mentalScore -= 20;
    else if (formData.stressLevel === 'moderate') mentalScore -= 10;
    else if (formData.stressLevel === 'low') mentalScore += 10;
    
    // Adjust based on sleep
    if (formData.sleepHours < 6) mentalScore -= 15;
    else if (formData.sleepHours >= 6 && formData.sleepHours < 7) mentalScore -= 5;
    else if (formData.sleepHours >= 7 && formData.sleepHours <= 9) mentalScore += 10;
    else if (formData.sleepHours > 9) mentalScore += 0;
    
    // Adjust based on meditation
    if (formData.meditation) mentalScore += 10;
    
    // Ensure score is between 0-100
    assessment.scores.mental = Math.max(0, Math.min(100, mentalScore));
    
    // Sleep score (0-100)
    let sleepScore = 70; // Base score
    
    // Adjust based on sleep hours
    if (formData.sleepHours < 5) sleepScore -= 30;
    else if (formData.sleepHours >= 5 && formData.sleepHours < 6) sleepScore -= 20;
    else if (formData.sleepHours >= 6 && formData.sleepHours < 7) sleepScore -= 10;
    else if (formData.sleepHours >= 7 && formData.sleepHours <= 8) sleepScore += 15;
    else if (formData.sleepHours > 8 && formData.sleepHours <= 9) sleepScore += 10;
    else if (formData.sleepHours > 9) sleepScore += 0;
    
    // Adjust based on stress level
    if (formData.stressLevel === 'high') sleepScore -= 15;
    else if (formData.stressLevel === 'moderate') sleepScore -= 5;
    else if (formData.stressLevel === 'low') sleepScore += 5;
    
    // Ensure score is between 0-100
    assessment.scores.sleep = Math.max(0, Math.min(100, sleepScore));
    
    // Hydration score (0-100)
    let hydrationScore = 60; // Base score
    
    // Adjust based on water intake
    if (formData.waterIntake < 1) hydrationScore -= 30;
    else if (formData.waterIntake >= 1 && formData.waterIntake < 2) hydrationScore -= 15;
    else if (formData.waterIntake >= 2 && formData.waterIntake < 3) hydrationScore += 0;
    else if (formData.waterIntake >= 3 && formData.waterIntake < 4) hydrationScore += 15;
    else if (formData.waterIntake >= 4) hydrationScore += 30;
    
    // Ensure score is between 0-100
    assessment.scores.hydration = Math.max(0, Math.min(100, hydrationScore));
    
  // Calculate overall score (average of all scores)
  const scores = Object.values(assessment.scores);
  assessment.scores.overall = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  
  // Generate assessment texts
  assessment.texts.cardiovascular = getCardiovascularAssessmentText(assessment.scores.cardiovascular);
  assessment.texts.fitness = getFitnessAssessmentText(assessment.scores.fitness);
  assessment.texts.nutrition = getNutritionAssessmentText(assessment.scores.nutrition);
  assessment.texts.mental = getMentalAssessmentText(assessment.scores.mental);
  assessment.texts.sleep = getSleepAssessmentText(assessment.scores.sleep);
  assessment.texts.hydration = getHydrationAssessmentText(assessment.scores.hydration);
  assessment.texts.overall = getOverallAssessmentText(assessment.scores.overall);
  
  return assessment;
}

/**
 * Generate cardiovascular health assessment text
 * @param {number} score Cardiovascular health score
 * @returns {string} Assessment text
 */
function getCardiovascularAssessmentText(score) {
  if (score >= 90) {
    return "ممتاز! صحتك القلبية الوعائية في حالة ممتازة. استمر في نمط حياتك الصحي.";
  } else if (score >= 75) {
    return "جيد جداً. صحتك القلبية الوعائية في حالة جيدة. حافظ على نشاطك البدني المنتظم.";
  } else if (score >= 60) {
    return "جيد. صحتك القلبية الوعائية مقبولة، لكن هناك مجال للتحسين من خلال زيادة النشاط البدني.";
  } else if (score >= 40) {
    return "متوسط. يُنصح بزيادة النشاط البدني وتحسين نمط الحياة لتعزيز صحة القلب والأوعية الدموية.";
  } else {
    return "منخفض. يُنصح بمراجعة الطبيب وإجراء تغييرات جذرية في نمط الحياة لتحسين صحة القلب والأوعية الدموية.";
  }
}

/**
 * Generate fitness assessment text
 * @param {number} score Fitness score
 * @returns {string} Assessment text
 */
function getFitnessAssessmentText(score) {
  if (score >= 90) {
    return "ممتاز! مستوى لياقتك البدنية مرتفع جداً. استمر في روتين التمارين المتنوعة.";
  } else if (score >= 75) {
    return "جيد جداً. مستوى لياقتك البدنية جيد. يمكنك زيادة التنوع في تمارينك لتحسين النتائج.";
  } else if (score >= 60) {
    return "جيد. مستوى لياقتك البدنية مقبول. حاول زيادة وتيرة التمارين وتنويعها.";
  } else if (score >= 40) {
    return "متوسط. هناك حاجة لتحسين مستوى لياقتك البدنية. ابدأ بتمارين خفيفة وزد تدريجياً.";
  } else {
    return "منخفض. يُنصح بالبدء ببرنامج تمارين تحت إشراف مدرب مؤهل لتحسين لياقتك البدنية.";
  }
}

/**
 * Generate nutrition assessment text
 * @param {number} score Nutrition score
 * @returns {string} Assessment text
 */
function getNutritionAssessmentText(score) {
  if (score >= 90) {
    return "ممتاز! نظامك الغذائي متوازن ومتنوع. استمر في تناول الأطعمة المغذية.";
  } else if (score >= 75) {
    return "جيد جداً. نظامك الغذائي جيد. يمكنك تحسينه بزيادة تنوع الأطعمة الصحية.";
  } else if (score >= 60) {
    return "جيد. نظامك الغذائي مقبول. حاول زيادة تناول الخضروات والفواكه وتقليل الأطعمة المصنعة.";
  } else if (score >= 40) {
    return "متوسط. هناك حاجة لتحسين نظامك الغذائي. ركز على الأطعمة الكاملة وقلل من السكريات والدهون المشبعة.";
  } else {
    return "منخفض. يُنصح بإجراء تغييرات جذرية في نظامك الغذائي. استشر أخصائي تغذية للحصول على خطة غذائية مناسبة.";
  }
}

/**
 * Generate mental health assessment text
 * @param {number} score Mental health score
 * @returns {string} Assessment text
 */
function getMentalAssessmentText(score) {
  if (score >= 90) {
    return "ممتاز! صحتك النفسية في حالة جيدة جداً. استمر في ممارسات الاسترخاء والتأمل.";
  } else if (score >= 75) {
    return "جيد جداً. صحتك النفسية جيدة. حافظ على التوازن بين العمل والراحة.";
  } else if (score >= 60) {
    return "جيد. صحتك النفسية مقبولة. يمكنك تحسينها بممارسة تقنيات إدارة التوتر.";
  } else if (score >= 40) {
    return "متوسط. قد تكون تحت ضغط نفسي. خصص وقتاً للاسترخاء وممارسة الهوايات.";
  } else {
    return "منخفض. يُنصح بطلب المساعدة المهنية لتحسين صحتك النفسية والتعامل مع التوتر.";
  }
}

/**
 * Generate sleep assessment text
 * @param {number} score Sleep score
 * @returns {string} Assessment text
 */
function getSleepAssessmentText(score) {
  if (score >= 90) {
    return "ممتاز! أنماط نومك صحية جداً. استمر في روتين النوم المنتظم.";
  } else if (score >= 75) {
    return "جيد جداً. نومك جيد. حافظ على مواعيد نوم ثابتة لتحسين جودة النوم.";
  } else if (score >= 60) {
    return "جيد. نومك مقبول. حاول تحسين بيئة النوم وتجنب الشاشات قبل النوم.";
  } else if (score >= 40) {
    return "متوسط. قد تعاني من مشاكل في النوم. حاول تطبيق عادات نوم صحية وروتين مسائي منتظم.";
  } else {
    return "منخفض. يُنصح بمراجعة الطبيب إذا كنت تعاني من مشاكل مزمنة في النوم.";
  }
}

/**
 * Generate hydration assessment text
 * @param {number} score Hydration score
 * @returns {string} Assessment text
 */
function getHydrationAssessmentText(score) {
  if (score >= 90) {
    return "ممتاز! مستوى ترطيبك مثالي. استمر في شرب كميات كافية من الماء.";
  } else if (score >= 75) {
    return "جيد جداً. مستوى ترطيبك جيد. حافظ على شرب الماء بانتظام.";
  } else if (score >= 60) {
    return "جيد. مستوى ترطيبك مقبول. حاول زيادة كمية الماء التي تشربها يومياً.";
  } else if (score >= 40) {
    return "متوسط. قد تكون تعاني من نقص في الترطيب. زد كمية الماء واحمل زجاجة ماء معك.";
  } else {
    return "منخفض. أنت بحاجة لزيادة كبيرة في كمية الماء التي تشربها يومياً لتجنب الجفاف.";
  }
}

/**
 * Generate overall health assessment text
 * @param {number} score Overall health score
 * @returns {string} Assessment text
 */
function getOverallAssessmentText(score) {
  if (score >= 90) {
    return "ممتاز! صحتك العامة في حالة ممتازة. استمر في نمط حياتك الصحي والمتوازن.";
  } else if (score >= 75) {
    return "جيد جداً. صحتك العامة جيدة. استمر في العادات الصحية وحاول تحسين المجالات الأقل تقييماً.";
  } else if (score >= 60) {
    return "جيد. صحتك العامة مقبولة. هناك مجال للتحسين في بعض جوانب نمط حياتك.";
  } else if (score >= 40) {
    return "متوسط. صحتك العامة بحاجة للتحسين. ركز على تغيير العادات غير الصحية تدريجياً.";
  } else {
    return "منخفض. صحتك العامة تحتاج لاهتمام جدي. يُنصح بمراجعة الطبيب ووضع خطة شاملة لتحسين صحتك.";
  }
}

/**
 * Generate recommendations based on assessment
 * @param {Object} formData Form data
 * @param {Object} metrics Calculated metrics
 * @param {Object} assessment Health assessment
 * @param {Object} settings Calculator settings
 * @returns {Object} Recommendations
 */
function generateRecommendations(formData, metrics, assessment, settings) {
  const recommendations = {
    main: '',
    nutrition: [],
    exercise: [],
    lifestyle: [],
    weight: []
  };
  
  // Generate main recommendation based on primary goal
  switch (formData.primaryGoal) {
    case 'weight_loss':
      recommendations.main = "لفقدان الوزن بشكل صحي، يُنصح بخفض السعرات الحرارية بمقدار 500 سعرة يومياً مع زيادة النشاط البدني. التركيز على الأطعمة الغنية بالألياف والبروتين سيساعد في الشعور بالشبع لفترات أطول.";
      break;
    case 'weight_gain':
      recommendations.main = "لزيادة الوزن بشكل صحي، يُنصح بزيادة السعرات الحرارية بمقدار 500 سعرة يومياً مع التركيز على الأطعمة المغذية والبروتينات عالية الجودة. تدريبات القوة ستساعد في بناء العضلات.";
      break;
    case 'muscle_gain':
      recommendations.main = "لبناء العضلات، يُنصح بزيادة تناول البروتين (1.6-2.2 جرام لكل كجم من وزن الجسم) مع تدريبات قوة منتظمة. تأكد من الحصول على سعرات حرارية كافية لدعم نمو العضلات.";
      break;
    case 'improve_fitness':
      recommendations.main = "لتحسين اللياقة البدنية، يُنصح بمزيج من التمارين الهوائية وتمارين القوة والمرونة. البدء بـ 150 دقيقة أسبوعياً من النشاط المعتدل وزيادته تدريجياً.";
      break;
    case 'maintain':
    default:
      recommendations.main = "للحفاظ على الوزن الحالي، يُنصح بموازنة السعرات الحرارية المستهلكة مع المحروقة. الاستمرار في النشاط البدني المنتظم والتغذية المتوازنة.";
  }
  
  // Generate nutrition recommendations
  if (assessment.scores.nutrition < 60) {
    recommendations.nutrition.push("زيادة تناول الخضروات والفواكه الطازجة (5 حصص يومياً على الأقل).");
    recommendations.nutrition.push("تقليل الأطعمة المصنعة والوجبات السريعة.");
    recommendations.nutrition.push("الحد من السكريات المضافة والمشروبات السكرية.");
  }
  
  if (!formData.fruits || !formData.vegetables) {
    recommendations.nutrition.push("إضافة المزيد من الفواكه والخضروات إلى نظامك الغذائي اليومي.");
  }
  
  if (formData.processedFood) {
    recommendations.nutrition.push("تقليل استهلاك الأطعمة المصنعة واستبدالها بأطعمة كاملة طبيعية.");
  }
  
  // Add protein recommendation based on goal
  if (formData.primaryGoal === 'muscle_gain' || formData.primaryGoal === 'weight_gain') {
    recommendations.nutrition.push(`زيادة تناول البروتين إلى ${metrics.macros.protein.grams} جرام يومياً من مصادر عالية الجودة.`);
  }
  // Add hydration recommendation
  if (formData.waterIntake < 3) {
    recommendations.nutrition.push(`زيادة شرب الماء إلى 8-10 أكواب يومياً (2-3 لتر).`);
  }
  
  // Generate exercise recommendations
  if (assessment.scores.fitness < 60) {
    recommendations.exercise.push("البدء بممارسة النشاط البدني لمدة 150 دقيقة أسبوعياً من التمارين متوسطة الشدة.");
    recommendations.exercise.push("دمج تمارين القوة مرتين أسبوعياً على الأقل لتعزيز كتلة العضلات والعظام.");
  }
  
  if (formData.exerciseFrequency === 'never' || formData.exerciseFrequency === 'rarely') {
    recommendations.exercise.push("البدء بتمارين خفيفة مثل المشي لمدة 20-30 دقيقة يومياً وزيادتها تدريجياً.");
  }
  
  if (!formData.strength && (formData.primaryGoal === 'muscle_gain' || formData.age > 40)) {
    recommendations.exercise.push("إضافة تمارين القوة إلى روتينك الرياضي لبناء العضلات وتقوية العظام.");
  }
  
  if (!formData.cardio) {
    recommendations.exercise.push("إضافة تمارين القلب (الهوائية) مثل المشي السريع، الجري، السباحة أو ركوب الدراجة.");
  }
  
  if (!formData.flexibility) {
    recommendations.exercise.push("إضافة تمارين المرونة واليوجا لتحسين المرونة وتقليل خطر الإصابات.");
  }
  
  // Generate lifestyle recommendations
  if (assessment.scores.sleep < 60 || formData.sleepHours < 7) {
    recommendations.lifestyle.push("تحسين جودة النوم بالالتزام بمواعيد نوم منتظمة والحصول على 7-9 ساعات من النوم يومياً.");
  }
  
  if (assessment.scores.mental < 60 || formData.stressLevel === 'high') {
    recommendations.lifestyle.push("ممارسة تقنيات إدارة التوتر مثل التأمل، التنفس العميق، أو اليوجا.");
  }
  
  if (formData.smoking) {
    recommendations.lifestyle.push("الإقلاع عن التدخين سيحسن صحتك بشكل كبير. استشر الطبيب للحصول على دعم.");
  }
  
  if (formData.alcohol) {
    recommendations.lifestyle.push("تقليل استهلاك الكحول إلى الحد الأدنى أو تجنبه تماماً.");
  }
  
  // Generate weight recommendations
  if (metrics.bmi < 18.5) {
    recommendations.weight.push(`زيادة الوزن تدريجياً للوصول إلى النطاق الصحي (${metrics.minHealthyWeight}-${metrics.maxHealthyWeight} ${formData.unitSystem === 'metric' ? 'كجم' : 'رطل'}).`);
    recommendations.weight.push("زيادة السعرات الحرارية بمقدار 300-500 سعرة يومياً من مصادر صحية.");
  } else if (metrics.bmi >= 25) {
    recommendations.weight.push(`خفض الوزن تدريجياً للوصول إلى النطاق الصحي (${metrics.minHealthyWeight}-${metrics.maxHealthyWeight} ${formData.unitSystem === 'metric' ? 'كجم' : 'رطل'}).`);
    recommendations.weight.push(`خفض السعرات الحرارية بمقدار 500 سعرة يومياً للوصول إلى فقدان 0.5-1 ${formData.unitSystem === 'metric' ? 'كجم' : 'رطل'} أسبوعياً.`);
  }
  
  if (formData.targetWeight && Math.abs(formData.weight - formData.targetWeight) > 10) {
    recommendations.weight.push("ضع أهدافاً مرحلية صغيرة للوصول إلى وزنك المستهدف بدلاً من التركيز على الهدف النهائي فقط.");
  }
  
  return recommendations;
}

/**
 * Calculate weight plan based on goals
 * @param {Object} formData Form data
 * @param {Object} metrics Calculated metrics
 * @param {Object} settings Calculator settings
 * @returns {Object} Weight plan
 */
function calculateWeightPlan(formData, metrics, settings) {
  // If no target weight is set, return null
  if (!formData.targetWeight) return null;
  
  const plan = {};
  
  // Calculate weight difference
  plan.currentWeight = formData.unitSystem === 'metric' ? formData.weight : formData.weightInKg;
  plan.targetWeight = formData.unitSystem === 'metric' ? formData.targetWeight : formData.targetWeightInKg;
  plan.weightDifference = plan.targetWeight - plan.currentWeight;
  
  // Determine if weight loss or gain
  plan.isWeightLoss = plan.weightDifference < 0;
  plan.isWeightGain = plan.weightDifference > 0;
  plan.isWeightMaintenance = Math.abs(plan.weightDifference) < 1;
  
  // If maintenance, no need for further calculations
  if (plan.isWeightMaintenance) {
    plan.message = "وزنك الحالي قريب جداً من وزنك المستهدف. ركز على الحفاظ على وزنك الحالي.";
    return plan;
  }
  
  // Calculate weekly rate based on settings
  if (plan.isWeightLoss) {
    plan.weeklyRate = settings.safeWeightLossRate; // kg per week
  } else {
    plan.weeklyRate = settings.safeWeightGainRate; // kg per week
  }
  
  // Calculate time needed
  plan.weeksNeeded = Math.abs(Math.round(plan.weightDifference / plan.weeklyRate));
  plan.monthsNeeded = Math.round(plan.weeksNeeded / 4.33);
  
  // Calculate daily calorie adjustment
  // 1 kg of fat = 7700 calories
  const caloriesPerKg = 7700;
  plan.dailyCalorieAdjustment = Math.round((plan.weeklyRate * caloriesPerKg) / 7);
  
  if (plan.isWeightLoss) {
    plan.dailyCalories = Math.max(1200, Math.round(metrics.tdee - plan.dailyCalorieAdjustment));
  } else {
    plan.dailyCalories = Math.round(metrics.tdee + plan.dailyCalorieAdjustment);
  }
  
  // Calculate macros for the plan
  plan.macros = {
    protein: { percent: metrics.macros.protein.percent, grams: Math.round((plan.dailyCalories * (metrics.macros.protein.percent / 100)) / 4) },
    carbs: { percent: metrics.macros.carbs.percent, grams: Math.round((plan.dailyCalories * (metrics.macros.carbs.percent / 100)) / 4) },
    fat: { percent: metrics.macros.fat.percent, grams: Math.round((plan.dailyCalories * (metrics.macros.fat.percent / 100)) / 9) }
  };
  
  // Generate message
  if (plan.isWeightLoss) {
    plan.message = `لفقدان ${Math.abs(Math.round(plan.weightDifference))} ${formData.unitSystem === 'metric' ? 'كجم' : 'رطل'} بمعدل آمن، ستحتاج إلى حوالي ${plan.weeksNeeded} أسبوع (${plan.monthsNeeded} شهر). استهلك ${plan.dailyCalories} سعرة حرارية يومياً.`;
  } else {
    plan.message = `لزيادة ${Math.round(plan.weightDifference)} ${formData.unitSystem === 'metric' ? 'كجم' : 'رطل'} بمعدل صحي، ستحتاج إلى حوالي ${plan.weeksNeeded} أسبوع (${plan.monthsNeeded} شهر). استهلك ${plan.dailyCalories} سعرة حرارية يومياً.`;
  }
  
  return plan;
}

/**
 * Update the UI with calculated results
 * @param {Object} formData Form data
 * @param {Object} metrics Calculated metrics
 * @param {Object} assessment Health assessment
 * @param {Object} recommendations Health recommendations
 * @param {Object} weightPlan Weight plan
 * @param {Object} settings Calculator settings
 */
function updateResultsUI(formData, metrics, assessment, recommendations, weightPlan, settings) {
    // Safely update basic metrics
    safelyUpdateElement('bmi_result', metrics.bmi.toFixed(1));
    safelyUpdateElement('bmi_category', metrics.bmiCategoryText);
    
    if (document.getElementById('bmi_category')) {
      document.getElementById('bmi_category').className = metrics.bmiCategoryClass || '';
    }
    
    safelyUpdateElement('bmr_result', Math.round(metrics.bmr) + ' سعرة حرارية');
    safelyUpdateElement('tdee_result', Math.round(metrics.tdee) + ' سعرة حرارية');
    
    const idealWeightText = formData.unitSystem === 'metric' ? 
      `${metrics.idealWeight} كجم` : 
      `${metrics.idealWeight} رطل`;
    safelyUpdateElement('ideal_weight_result', idealWeightText);
    
    safelyUpdateElement('weight_difference_result', metrics.weightDifferenceText);
    
    // Update health assessment scores
    safelyUpdateScoreUI('cardiovascular_score', assessment.scores.cardiovascular);
    safelyUpdateScoreUI('fitness_score', assessment.scores.fitness);
    safelyUpdateScoreUI('nutrition_score', assessment.scores.nutrition);
    safelyUpdateScoreUI('mental_score', assessment.scores.mental);
    safelyUpdateScoreUI('sleep_score', assessment.scores.sleep);
    safelyUpdateScoreUI('hydration_score', assessment.scores.hydration);
    safelyUpdateScoreUI('overall_score', assessment.scores.overall);
    
    // Update health assessment texts
    safelyUpdateElement('cardiovascular_assessment', assessment.texts.cardiovascular);
    safelyUpdateElement('fitness_assessment', assessment.texts.fitness);
    safelyUpdateElement('nutrition_assessment', assessment.texts.nutrition);
    safelyUpdateElement('mental_assessment', assessment.texts.mental);
    safelyUpdateElement('sleep_assessment', assessment.texts.sleep);
    safelyUpdateElement('hydration_assessment', assessment.texts.hydration);
    safelyUpdateElement('overall_assessment', assessment.texts.overall);
    
    // Update recommendations
    safelyUpdateElement('main_recommendation', recommendations.main);
    
    safelyUpdateRecommendationList('nutrition_recommendations', recommendations.nutrition);
    safelyUpdateRecommendationList('exercise_recommendations', recommendations.exercise);
    safelyUpdateRecommendationList('lifestyle_recommendations', recommendations.lifestyle);
    safelyUpdateRecommendationList('weight_recommendations', recommendations.weight);
    
    // Update macronutrient distribution
    safelyUpdateElement('protein_result', `${metrics.macros.protein.grams} جرام (${metrics.macros.protein.percent}%)`);
    safelyUpdateElement('carbs_result', `${metrics.macros.carbs.grams} جرام (${metrics.macros.carbs.percent}%)`);
    safelyUpdateElement('fat_result', `${metrics.macros.fat.grams} جرام (${metrics.macros.fat.percent}%)`);
    
    // Update weight plan if available
    const weightPlanSection = document.getElementById('weight_plan_section');
    if (weightPlanSection) {
      if (weightPlan) {
        weightPlanSection.classList.remove('hidden');
        safelyUpdateElement('weight_plan_message', weightPlan.message);
        
        if (weightPlan.isWeightLoss || weightPlan.isWeightGain) {
          const weightPlanDetails = document.getElementById('weight_plan_details');
          if (weightPlanDetails) {
            weightPlanDetails.classList.remove('hidden');
          }
          safelyUpdateElement('weight_plan_calories', `${weightPlan.dailyCalories} سعرة حرارية`);
          safelyUpdateElement('weight_plan_protein', `${weightPlan.macros.protein.grams} جرام (${weightPlan.macros.protein.percent}%)`);
          safelyUpdateElement('weight_plan_carbs', `${weightPlan.macros.carbs.grams} جرام (${weightPlan.macros.carbs.percent}%)`);
          safelyUpdateElement('weight_plan_fat', `${weightPlan.macros.fat.grams} جرام (${weightPlan.macros.fat.percent}%)`);
        } else {
          const weightPlanDetails = document.getElementById('weight_plan_details');
          if (weightPlanDetails) {
            weightPlanDetails.classList.add('hidden');
          }
        }
      } else {
        weightPlanSection.classList.add('hidden');
      }
    }
    
    // Update charts if the elements exist
    try {
      if (document.getElementById('healthScoreChart')) {
        updateHealthScoreChart(assessment.scores);
      }
      
      if (document.getElementById('macronutrientChart')) {
        updateMacronutrientChart(metrics.macros);
      }
      
      if (weightPlan && !weightPlan.isWeightMaintenance && document.getElementById('weightProgressionChart')) {
        const weightProgressionSection = document.getElementById('weight_progression_section');
        if (weightProgressionSection) {
          weightProgressionSection.classList.remove('hidden');
        }
        updateWeightProgressionChart(formData, weightPlan);
      } else {
        const weightProgressionSection = document.getElementById('weight_progression_section');
        if (weightProgressionSection) {
          weightProgressionSection.classList.add('hidden');
        }
      }
    } catch (error) {
      console.warn('Error updating charts:', error);
    }
    
    // Show results section
    const resultsSection = document.getElementById('results');
    if (resultsSection) {
      resultsSection.classList.remove('hidden');
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  /**
   * Safely update an element's text content
   * @param {string} elementId Element ID
   * @param {string} text Text content
   */
  function safelyUpdateElement(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text;
    } else {
      console.warn(`Element with ID '${elementId}' not found`);
    }
  }
  
  /**
   * Safely update score UI with value and color
   * @param {string} elementId Element ID
   * @param {number} score Score value
   */
  function safelyUpdateScoreUI(elementId, score) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Score element with ID '${elementId}' not found`);
      return;
    }
    
    element.textContent = score;
    
    // Set color based on score
    if (score >= 80) {
      element.className = 'text-green-500 font-bold text-xl';
    } else if (score >= 60) {
      element.className = 'text-blue-500 font-bold text-xl';
    } else if (score >= 40) {
      element.className = 'text-yellow-500 font-bold text-xl';
    } else {
      element.className = 'text-red-500 font-bold text-xl';
    }
  }
  
  /**
   * Safely update recommendation list
   * @param {string} elementId Element ID
   * @param {Array} recommendations List of recommendations
   */
  function safelyUpdateRecommendationList(elementId, recommendations) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Recommendation list element with ID '${elementId}' not found`);
      return;
    }
    
    element.innerHTML = '';
  
    if (!recommendations || recommendations.length === 0) {
      element.innerHTML = '<li class="text-gray-500">لا توجد توصيات محددة في هذه الفئة.</li>';
      return;
    }
    
    recommendations.forEach(recommendation => {
      const li = document.createElement('li');
      li.className = 'mb-2';
      li.textContent = recommendation;
      element.appendChild(li);
    });
  }
  
  /**
   * Update health score chart
   * @param {Object} scores Health assessment scores
   */
  function updateHealthScoreChart(scores) {
    const ctx = document.getElementById('healthScoreChart');
    if (!ctx) {
      console.warn('Health score chart canvas not found');
      return;
    }
    
    // Destroy existing chart if it exists
    if (window.healthScoreChart) {
      window.healthScoreChart.destroy();
    }
    
    try {
      window.healthScoreChart = new Chart(ctx.getContext('2d'), {
        type: 'radar',
        data: {
          labels: [
            'صحة القلب والأوعية',
            'اللياقة البدنية',
            'التغذية',
            'الصحة النفسية',
            'النوم',
            'الترطيب'
          ],
          datasets: [{
            label: 'مؤشرات الصحة',
            data: [
              scores.cardiovascular,
              scores.fitness,
              scores.nutrition,
              scores.mental,
              scores.sleep,
              scores.hydration
            ],
            backgroundColor: 'rgba(66, 153, 225, 0.2)',
            borderColor: 'rgba(66, 153, 225, 0.8)',
            pointBackgroundColor: 'rgba(66, 153, 225, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(66, 153, 225, 1)'
          }]
        },
        options: {
          scales: {
            r: {
              angleLines: {
                display: true
              },
              suggestedMin: 0,
              suggestedMax: 100,
              ticks: {
                stepSize: 20
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating health score chart:', error);
    }
  }
  
  /**
   * Update macronutrient chart
   * @param {Object} macros Macronutrient distribution
   */
  function updateMacronutrientChart(macros) {
    const ctx = document.getElementById('macronutrientChart');
    if (!ctx) {
      console.warn('Macronutrient chart canvas not found');
      return;
    }
    
    // Destroy existing chart if it exists
    if (window.macronutrientChart) {
      window.macronutrientChart.destroy();
    }
    
    try {
      window.macronutrientChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['البروتين', 'الكربوهيدرات', 'الدهون'],
          datasets: [{
            data: [macros.protein.percent, macros.carbs.percent, macros.fat.percent],
            backgroundColor: [
              'rgba(66, 153, 225, 0.8)',
              'rgba(72, 187, 120, 0.8)',
              'rgba(237, 137, 54, 0.8)'
            ],
            borderColor: [
              'rgba(66, 153, 225, 1)',
              'rgba(72, 187, 120, 1)',
              'rgba(237, 137, 54, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  return `${label}: ${value}%`;
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating macronutrient chart:', error);
    }
  }
  
  /**
   * Update weight progression chart
   * @param {Object} formData Form data
   * @param {Object} weightPlan Weight plan
   */
  function updateWeightProgressionChart(formData, weightPlan) {
    const ctx = document.getElementById('weightProgressionChart');
    if (!ctx) {
      console.warn('Weight progression chart canvas not found');
      return;
    }
    
    // Destroy existing chart if it exists
    if (window.weightProgressionChart) {
      window.weightProgressionChart.destroy();
    }
    
    try {
      // Generate data points for weight progression
      const labels = [];
      const data = [];
      
      const currentWeight = formData.unitSystem === 'metric' ? formData.weight : formData.weightInKg;
      const targetWeight = formData.unitSystem === 'metric' ? formData.targetWeight : formData.targetWeightInKg;
      const weeklyRate = weightPlan.isWeightLoss ? -weightPlan.weeklyRate : weightPlan.weeklyRate;
      
      // Add data points for every 2 weeks
      for (let week = 0; week <= weightPlan.weeksNeeded; week += 2) {
        labels.push(`أسبوع ${week}`);
        const projectedWeight = currentWeight + (weeklyRate * week);
        
        // Ensure we don't go beyond target weight
        if (weightPlan.isWeightLoss && projectedWeight < targetWeight) {
          data.push(targetWeight);
        } else if (!weightPlan.isWeightLoss && projectedWeight > targetWeight) {
          data.push(targetWeight);
        } else {
          data.push(projectedWeight);
        }
      }
      
      // Ensure the last point is exactly the target weight
      if (labels[labels.length - 1] !== `أسبوع ${weightPlan.weeksNeeded}`) {
        labels.push(`أسبوع ${weightPlan.weeksNeeded}`);
        data.push(targetWeight);
      }
      
      // Convert back to display units if needed
      const displayData = formData.unitSystem === 'metric' ? 
        data : 
        data.map(weight => weight * 2.20462);
      
      window.weightProgressionChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: `الوزن (${formData.unitSystem === 'metric' ? 'كجم' : 'رطل'})`,
          data: displayData,
          fill: false,
          borderColor: weightPlan.isWeightLoss ? 'rgba(72, 187, 120, 1)' : 'rgba(66, 153, 225, 1)',
          backgroundColor: weightPlan.isWeightLoss ? 'rgba(72, 187, 120, 0.2)' : 'rgba(66, 153, 225, 0.2)',
          tension: 0.1,
          pointRadius: 4,
          pointBackgroundColor: weightPlan.isWeightLoss ? 'rgba(72, 187, 120, 1)' : 'rgba(66, 153, 225, 1)'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: formData.unitSystem === 'metric' ? 'الوزن (كجم)' : 'الوزن (رطل)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'الفترة الزمنية'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw || 0;
                return `${value.toFixed(1)} ${formData.unitSystem === 'metric' ? 'كجم' : 'رطل'}`;
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error creating weight progression chart:', error);
  }
}

/**
 * Initialize the calculator
 */
function initCalculator() {
  // Set up event listeners
  const calculateBtn = document.getElementById('calculateBtn');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', calculateHealthMetrics);
  }
  
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetForm);
  }
  
  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', printResults);
  }
  
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', saveSettings);
  }
  
  // Set up tab navigation
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
  
  // Set up theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    
    // Set initial theme
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
      document.getElementById('themeSwitch_field').checked = true;
    }
  }
  
  // Set up unit system toggle
  const unitSystemField = document.getElementById('unit_system_field');
  if (unitSystemField) {
    unitSystemField.addEventListener('change', updateUnitLabels);
    
    // Set initial unit labels
    updateUnitLabels();
  }
  
  // Set up blood sugar type toggle
  const bloodSugarTypeField = document.getElementById('blood_sugar_type_field');
  if (bloodSugarTypeField) {
    bloodSugarTypeField.addEventListener('change', updateBloodSugarUnit);
    
    // Set initial blood sugar unit
    updateBloodSugarUnit();
  }
  
  // Load saved form data if available
  loadFormData();
  
  // Set current year in footer
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
}

/**
 * Switch between tabs
 * @param {string} tabId Tab ID to switch to
 */
function switchTab(tabId) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => {
    content.classList.add('hidden');
  });
  
  // Show selected tab content
  const selectedTab = document.getElementById(`${tabId}-tab`);
  if (selectedTab) {
    selectedTab.classList.remove('hidden');
  }
  
  // Update active tab button
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    }
  });
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  if (isDarkMode) {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  }
  
  // Update checkbox state
  const themeSwitchField = document.getElementById('themeSwitch_field');
  if (themeSwitchField) {
    themeSwitchField.checked = !isDarkMode;
  }
}

/**
 * Update unit labels based on selected unit system
 */
function updateUnitLabels() {
  const unitSystem = document.getElementById('unit_system_field')?.value || 'metric';
  
  // Update height label and placeholder
  const heightLabel = document.querySelector('label[for="height_field"]');
  const heightField = document.getElementById('height_field');
  
  if (heightLabel && heightField) {
    if (unitSystem === 'metric') {
      heightLabel.innerHTML = 'الطول (سم)';
      heightField.placeholder = 'أدخل الطول بالسنتيمتر';
    } else {
      heightLabel.innerHTML = 'الطول (بوصة)';
      heightField.placeholder = 'أدخل الطول بالبوصة';
    }
  }
  
  // Update weight labels and placeholders
  const weightLabel = document.querySelector('label[for="weight_field"]');
  const weightField = document.getElementById('weight_field');
  
  if (weightLabel && weightField) {
    if (unitSystem === 'metric') {
      weightLabel.innerHTML = 'الوزن (كجم)';
      weightField.placeholder = 'أدخل الوزن بالكيلوجرام';
    } else {
      weightLabel.innerHTML = 'الوزن (رطل)';
      weightField.placeholder = 'أدخل الوزن بالرطل';
    }
  }
  
  // Update target weight label and placeholder
  const targetWeightLabel = document.querySelector('label[for="target_weight_field"]');
  const targetWeightField = document.getElementById('target_weight_field');
  
  if (targetWeightLabel && targetWeightField) {
    if (unitSystem === 'metric') {
      targetWeightLabel.innerHTML = 'الوزن المستهدف (كجم)';
      targetWeightField.placeholder = 'أدخل الوزن المستهدف بالكيلوجرام';
    } else {
      targetWeightLabel.innerHTML = 'الوزن المستهدف (رطل)';
      targetWeightField.placeholder = 'أدخل الوزن المستهدف بالرطل';
    }
  }
  
  // Update waist circumference label and placeholder
  const waistLabel = document.querySelector('label[for="waist_circumference_field"]');
  const waistField = document.getElementById('waist_circumference_field');
  
  if (waistLabel && waistField) {
    if (unitSystem === 'metric') {
      waistLabel.innerHTML = 'محيط الخصر (سم)';
      waistField.placeholder = 'أدخل محيط الخصر بالسنتيمتر';
    } else {
      waistLabel.innerHTML = 'محيط الخصر (بوصة)';
      waistField.placeholder = 'أدخل محيط الخصر بالبوصة';
    }
  }
}

/**
 * Update blood sugar unit based on selected blood sugar type
 */
function updateBloodSugarUnit() {
  const bloodSugarType = document.getElementById('blood_sugar_type_field')?.value || 'fasting';
  const bloodSugarUnitElement = document.getElementById('blood_sugar_unit');
  
  if (bloodSugarUnitElement) {
    if (bloodSugarType === 'hba1c') {
      bloodSugarUnitElement.textContent = '%';
    } else {
      bloodSugarUnitElement.textContent = 'ملغم/ديسيلتر';
    }
  }
}

/**
 * Reset the form to default values
 */
function resetForm() {
  const form = document.getElementById('healthForm');
  if (form) {
    form.reset();
    
    // Update unit labels
    updateUnitLabels();
    
    // Update blood sugar unit
    updateBloodSugarUnit();
    
    // Hide results section
    const resultsSection = document.getElementById('results');
    if (resultsSection) {
      resultsSection.classList.add('hidden');
    }
  }
}

/**
 * Print the results
 */
function printResults() {
  window.print();
}

/**
 * Save form data to localStorage
 */
function saveFormData() {
  const formData = getFormData();
  localStorage.setItem('healthCalculatorData', JSON.stringify(formData));
}

/**
 * Load form data from localStorage
 */
function loadFormData() {
  const savedData = localStorage.getItem('healthCalculatorData');
  if (!savedData) return;
  
  try {
    const formData = JSON.parse(savedData);
    
    // Set form values
    for (const key in formData) {
      const element = document.getElementById(`${key}_field`);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = formData[key];
        } else {
          element.value = formData[key];
        }
      }
    }
    
    // Update unit labels
    updateUnitLabels();
    
    // Update blood sugar unit
    updateBloodSugarUnit();
  } catch (error) {
    console.error('Error loading saved form data:', error);
  }
}

/**
 * Save calculator settings
 */
function saveSettings() {
  const settings = {
    bmrFormula: document.getElementById('bmr_formula_field')?.value || 'mifflin',
    safeWeightLossRate: parseFloat(document.getElementById('safe_weight_loss_rate_field')?.value) || 0.5,
    safeWeightGainRate: parseFloat(document.getElementById('safe_weight_gain_rate_field')?.value) || 0.25
  };
  
  localStorage.setItem('healthCalculatorSettings', JSON.stringify(settings));
  
  // Show success message
  const settingsMessage = document.getElementById('settings_message');
  if (settingsMessage) {
    settingsMessage.textContent = 'تم حفظ الإعدادات بنجاح';
    settingsMessage.classList.remove('hidden');
    
    // Hide message after 3 seconds
    setTimeout(() => {
      settingsMessage.classList.add('hidden');
    }, 3000);
  }
}

/**
 * Load calculator settings
 * @returns {Object} Settings object
 */
function loadSettings() {
  const savedSettings = localStorage.getItem('healthCalculatorSettings');
  if (!savedSettings) return null;
  
  try {
    return JSON.parse(savedSettings);
  } catch (error) {
    console.error('Error loading saved settings:', error);
    return null;
  }
}



/**
 * Update score UI with value and color
 * @param {string} elementId Element ID
 * @param {number} score Score value
 */
function updateScoreUI(elementId, score) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  element.textContent = score;
  
  // Set color based on score
  if (score >= 80) {
    element.className = 'text-green-500 font-bold text-xl';
  } else if (score >= 60) {
    element.className = 'text-blue-500 font-bold text-xl';
  } else if (score >= 40) {
    element.className = 'text-yellow-500 font-bold text-xl';
  } else {
    element.className = 'text-red-500 font-bold text-xl';
  }
}

/**
 * Update recommendation list
 * @param {string} elementId Element ID
 * @param {Array} recommendations List of recommendations
 */
function updateRecommendationList(elementId, recommendations) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  element.innerHTML = '';

  if (recommendations.length === 0) {
    element.innerHTML = '<li class="text-gray-500">لا توجد توصيات محددة في هذه الفئة.</li>';
    return;
  }
  
  recommendations.forEach(recommendation => {
    const li = document.createElement('li');
    li.className = 'mb-2';
    li.textContent = recommendation;
    element.appendChild(li);
  });
}

/**
 * Update health score chart
 * @param {Object} scores Health assessment scores
 */
function updateHealthScoreChart(scores) {
  const ctx = document.getElementById('healthScoreChart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (window.healthScoreChart) {
    window.healthScoreChart.destroy();
  }
  
  window.healthScoreChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: [
        'صحة القلب والأوعية',
        'اللياقة البدنية',
        'التغذية',
        'الصحة النفسية',
        'النوم',
        'الترطيب'
      ],
      datasets: [{
        label: 'مؤشرات الصحة',
        data: [
          scores.cardiovascular,
          scores.fitness,
          scores.nutrition,
          scores.mental,
          scores.sleep,
          scores.hydration
        ],
        backgroundColor: 'rgba(66, 153, 225, 0.2)',
        borderColor: 'rgba(66, 153, 225, 0.8)',
        pointBackgroundColor: 'rgba(66, 153, 225, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(66, 153, 225, 1)'
      }]
    },
    options: {
      scales: {
        r: {
          angleLines: {
            display: true
          },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: {
            stepSize: 20
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

/**
 * Update macronutrient chart
 * @param {Object} macros Macronutrient distribution
 */
function updateMacronutrientChart(macros) {
  const ctx = document.getElementById('macronutrientChart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (window.macronutrientChart) {
    window.macronutrientChart.destroy();
  }
  
  window.macronutrientChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['البروتين', 'الكربوهيدرات', 'الدهون'],
      datasets: [{
        data: [macros.protein.percent, macros.carbs.percent, macros.fat.percent],
        backgroundColor: [
          'rgba(66, 153, 225, 0.8)',
          'rgba(72, 187, 120, 0.8)',
          'rgba(237, 137, 54, 0.8)'
        ],
        borderColor: [
          'rgba(66, 153, 225, 1)',
          'rgba(72, 187, 120, 1)',
          'rgba(237, 137, 54, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${value}%`;
            }
          }
        }
      }
    }
  });
}

/**
 * Update weight progression chart
 * @param {Object} formData Form data
 * @param {Object} weightPlan Weight plan
 */
function updateWeightProgressionChart(formData, weightPlan) {
  const ctx = document.getElementById('weightProgressionChart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (window.weightProgressionChart) {
    window.weightProgressionChart.destroy();
  }
  
  // Show the chart container
  document.getElementById('weight_progression_section').classList.remove('hidden');
  
  // Generate data points for weight progression
  const labels = [];
  const data = [];
  
  const currentWeight = formData.unitSystem === 'metric' ? formData.weight : formData.weightInKg;
  const targetWeight = formData.unitSystem === 'metric' ? formData.targetWeight : formData.targetWeightInKg;
  const weeklyRate = weightPlan.isWeightLoss ? -weightPlan.weeklyRate : weightPlan.weeklyRate;
  
  // Add data points for every 2 weeks
  for (let week = 0; week <= weightPlan.weeksNeeded; week += 2) {
    labels.push(`أسبوع ${week}`);
    const projectedWeight = currentWeight + (weeklyRate * week);
    
    // Ensure we don't go beyond target weight
    if (weightPlan.isWeightLoss && projectedWeight < targetWeight) {
      data.push(targetWeight);
    } else if (!weightPlan.isWeightLoss && projectedWeight > targetWeight) {
      data.push(targetWeight);
    } else {
      data.push(projectedWeight);
    }
  }
  
  // Ensure the last point is exactly the target weight
  if (labels[labels.length - 1] !== `أسبوع ${weightPlan.weeksNeeded}`) {
    labels.push(`أسبوع ${weightPlan.weeksNeeded}`);
    data.push(targetWeight);
  }
  
  // Convert back to display units if needed
  const displayData = formData.unitSystem === 'metric' ? 
    data : 
    data.map(weight => weight * 2.20462);
  
  window.weightProgressionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `الوزن (${formData.unitSystem === 'metric' ? 'كجم' : 'رطل'})`,
        data: displayData,
        backgroundColor: 'rgba(66, 153, 225, 0.2)',
        borderColor: 'rgba(66, 153, 225, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(66, 153, 225, 1)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false
        }
      },
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

/**
 * Save form data to localStorage
 */
function saveFormData() {
  if (!document.getElementById('save_data_field')?.checked) return;
  
  const formData = getFormData();
  localStorage.setItem('healthCalculatorData', JSON.stringify(formData));
}

/**
 * Load form data from localStorage
 */
function loadFormData() {
  const savedData = localStorage.getItem('healthCalculatorData');
  if (!savedData) return;
  
  try {
    const formData = JSON.parse(savedData);
    
    // Populate form fields with saved data
    for (const [key, value] of Object.entries(formData)) {
      const field = document.getElementById(`${key}_field`);
      if (!field) continue;
      
      if (field.type === 'checkbox') {
        field.checked = value;
      } else {
        field.value = value;
      }
    }
    
    // Update measurement units
    if (formData.unitSystem) {
      updateMeasurementUnits(formData.unitSystem);
    }
  } catch (error) {
    console.error('Error loading saved data:', error);
  }
}

/**
 * Save settings to localStorage
 */
function saveSettings() {
  const settings = {
    bmrFormula: document.getElementById('bmr_formula')?.value || 'mifflin',
    safeWeightLossRate: parseFloat(document.getElementById('safe_weight_loss_rate')?.value) || 0.5,
    safeWeightGainRate: parseFloat(document.getElementById('safe_weight_gain_rate')?.value) || 0.25,
    macroDistribution: document.getElementById('macro_distribution')?.value || 'balanced',
    recommendationDetail: document.getElementById('recommendation_detail')?.value || 'detailed',
    measurementUnits: document.getElementById('measurement_units')?.value || 'metric'
  };
  
  localStorage.setItem('healthCalculatorSettings', JSON.stringify(settings));
  
  // Show success message
  const messageElement = document.getElementById('settings_message');
  if (messageElement) {
    messageElement.textContent = 'تم حفظ الإعدادات بنجاح!';
    messageElement.classList.remove('hidden');
    
    // Hide message after 3 seconds
    setTimeout(() => {
      messageElement.classList.add('hidden');
    }, 3000);
  }
}

/**
 * Load settings from localStorage
 * @returns {Object} Settings object
 */
function loadSettings() {
  const savedSettings = localStorage.getItem('healthCalculatorSettings');
  if (!savedSettings) return null;
  
  try {
    const settings = JSON.parse(savedSettings);
    
    // Populate settings form fields
    if (document.getElementById('bmr_formula')) {
      document.getElementById('bmr_formula').value = settings.bmrFormula;
    }
    
    if (document.getElementById('safe_weight_loss_rate')) {
      document.getElementById('safe_weight_loss_rate').value = settings.safeWeightLossRate;
    }
    
    if (document.getElementById('safe_weight_gain_rate')) {
      document.getElementById('safe_weight_gain_rate').value = settings.safeWeightGainRate;
    }
    
    if (document.getElementById('macro_distribution')) {
      document.getElementById('macro_distribution').value = settings.macroDistribution;
    }
    
    if (document.getElementById('recommendation_detail')) {
      document.getElementById('recommendation_detail').value = settings.recommendationDetail;
    }
    
    if (document.getElementById('measurement_units')) {
      document.getElementById('measurement_units').value = settings.measurementUnits;
    }
    
    return settings;
  } catch (error) {
    console.error('Error loading saved settings:', error);
    return null;
  }
}

/**
 * Reset all settings to defaults
 */
function resetSettings() {
  // Set default values
  if (document.getElementById('bmr_formula')) {
    document.getElementById('bmr_formula').value = 'mifflin';
  }
  
  if (document.getElementById('safe_weight_loss_rate')) {
    document.getElementById('safe_weight_loss_rate').value = '0.5';
  }
  
  if (document.getElementById('safe_weight_gain_rate')) {
    document.getElementById('safe_weight_gain_rate').value = '0.25';
  }
  
  if (document.getElementById('macro_distribution')) {
    document.getElementById('macro_distribution').value = 'balanced';
  }
  
  if (document.getElementById('recommendation_detail')) {
    document.getElementById('recommendation_detail').value = 'detailed';
  }
  
  if (document.getElementById('measurement_units')) {
    document.getElementById('measurement_units').value = 'metric';
  }
  
  // Save the default settings
  saveSettings();
  
  // Update measurement units
  updateMeasurementUnits('metric');
  
  // Show success message
  const messageElement = document.getElementById('settings_message');
  if (messageElement) {
    messageElement.textContent = 'تم إعادة ضبط الإعدادات إلى القيم الافتراضية!';
    messageElement.classList.remove('hidden');
    
    // Hide message after 3 seconds
    setTimeout(() => {
      messageElement.classList.add('hidden');
    }, 3000);
  }
}

/**
 * Initialize the calculator
 */
function initCalculator() {
  // Set current year in footer
  document.getElementById('currentYear').textContent = new Date().getFullYear();
  
  // Load settings
  loadSettings();
  
  // Load saved form data if available
  loadFormData();
  
  // Update measurement placeholders
  updateMeasurementPlaceholders();
  
  // Add event listeners
  document.getElementById('calculateBtn')?.addEventListener('click', calculateHealthMetrics);
  document.getElementById('saveSettings')?.addEventListener('click', saveSettings);
  document.getElementById('resetSettings')?.addEventListener('click', resetSettings);
  document.getElementById('measurement_units')?.addEventListener('change', function() {
    updateMeasurementUnits(this.value);
  });
  
  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Hide all tab content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
      });
      
      // Show selected tab content
      const tabId = this.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.remove('hidden');
    });
  });
  
  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.documentElement.classList.toggle('dark');
      document.body.classList.toggle('dark-mode');
      
      // Update checkbox state
      const checkbox = document.getElementById('themeSwitch_field');
      if (checkbox) {
        checkbox.checked = document.documentElement.classList.contains('dark');
      }
      
      // Save preference
      localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });
    
    // Set initial state based on saved preference or system preference
    const isDarkMode = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
      
      const checkbox = document.getElementById('themeSwitch_field');
      if (checkbox) {
        checkbox.checked = true;
      }
    }
  }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', initCalculator);
 
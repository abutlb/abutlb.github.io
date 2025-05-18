/**
 * Regex Designer - JavaScript
 * A modular JavaScript file for the Regex Designer tool
 */

// Global flags to prevent multiple initializations
let themeInitialized = false;
let tabSystemInitialized = false;
let regexTesterInitialized = false;
let patternBuilderInitialized = false;
let libraryInitialized = false;
let modalsInitialized = false;

/************************
 * THEME SYSTEM
 ************************/
function initTheme() {
    // Prevent multiple initialization
    if (themeInitialized) return;
    themeInitialized = true;
    
    // Check for saved theme preference or system preference
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        const toggleDot = document.querySelector('.toggle-dot');
        if (toggleDot) {
            toggleDot.classList.add('translate-x-6');
        }
    }

    // Add event listener to theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        // Remove any existing click handlers
        const newToggle = themeToggle.cloneNode(true);
        themeToggle.parentNode.replaceChild(newToggle, themeToggle);
        
        // Add fresh click handler
        newToggle.onclick = toggleDarkMode;
    }
}

function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    const toggleDot = document.querySelector('.toggle-dot');
    
    if (toggleDot) {
        if (isDark) {
            toggleDot.classList.add('translate-x-6');
        } else {
            toggleDot.classList.remove('translate-x-6');
        }
    }
    
    // Save preference to localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

/************************
 * TAB SYSTEM
 ************************/
function initTabSystem() {
    // Prevent multiple initialization
    if (tabSystemInitialized) return;
    tabSystemInitialized = true;
    
    // Initialize with the first tab active
    let activeTab = 'test';
    
    // Show the active tab content
    const tabContent = document.getElementById(`${activeTab}-tab`);
    if (tabContent) {
        tabContent.classList.remove('hidden');
    }
    
    // Add event listeners to all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        // Clone to remove any existing handlers
        const newBtn = btn.cloneNode(true);
        if (btn.parentNode) {
            btn.parentNode.replaceChild(newBtn, btn);
        }
        
        if (newBtn.dataset.tab === activeTab) {
            newBtn.classList.add('active', 'opacity-100');
        }
        
        // Add fresh click handler
        newBtn.onclick = function(e) {
            e.preventDefault();
            switchTab(this.dataset.tab);
        };
    });
}

function switchTab(tabId) {
    // Avoid unnecessary work
    if (!tabId) return;
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'opacity-100');
        btn.classList.add('opacity-80');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabId}-tab`);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
    
    // Activate selected tab button
    const selectedBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active', 'opacity-100');
        selectedBtn.classList.remove('opacity-80');
    }
    
    // Update UI based on tab
    if (tabId === 'builder' && typeof updateLivePreview === 'function') {
        setTimeout(updateLivePreview, 50);
    }
}

/************************
 * REGEX TESTER
 ************************/
function initRegexTester() {
    // Prevent multiple initialization
    if (regexTesterInitialized) return;
    regexTesterInitialized = true;
    
    // Initialize elements
    const regexPattern = document.getElementById('regexPattern');
    const regexFlags = document.getElementById('regexFlags');
    const testInput = document.getElementById('testInput');
    const testRegexBtn = document.getElementById('testRegexBtn');
    const liveTestingToggle = document.getElementById('liveTestingToggle');
    const copyRegexBtn = document.getElementById('copyRegexBtn');
    const clearRegexBtn = document.getElementById('clearRegexBtn');
    const saveRegexBtn = document.getElementById('saveRegexBtn');
    const exportResultsBtn = document.getElementById('exportResultsBtn');
    
    // Helper to safely add event handler
    function safeAddHandler(element, event, handler) {
        if (!element) return;
        const newElement = element.cloneNode(true);
        if (element.parentNode) {
            element.parentNode.replaceChild(newElement, element);
        }
        newElement[`on${event}`] = handler;
        return newElement;
    }
    
    // Add event listeners
    if (regexPattern && testInput) {
        // Input event for live testing
        const handleInput = () => {
            if (liveTestingToggle && liveTestingToggle.checked) {
                testRegexPattern();
            }
        };
        
        safeAddHandler(regexPattern, 'input', handleInput);
        safeAddHandler(testInput, 'input', handleInput);
        
        // Add paste event handler to automatically test after paste
        safeAddHandler(regexPattern, 'paste', function() {
            // Wait a moment for the paste to complete
            setTimeout(testRegexPattern, 100);
        });
        
        if (regexFlags) {
            safeAddHandler(regexFlags, 'change', handleInput);
        }
    }
    
    // Test button
    safeAddHandler(testRegexBtn, 'click', function(e) {
        e.preventDefault();
        testRegexPattern();
    });
    
    // Load regex history
    loadRegexHistory();
}

function testRegexPattern() {
    const regexPattern = document.getElementById('regexPattern');
    const regexFlags = document.getElementById('regexFlags');
    const testInput = document.getElementById('testInput');
    const testResults = document.getElementById('testResults');
    const matchCount = document.getElementById('matchCount');
    const groupResults = document.getElementById('groupResults');
    const regexExplanation = document.getElementById('regexExplanation');
    
    if (!regexPattern || !testInput || !testResults || !matchCount || !groupResults) {
        console.error('Required DOM elements not found');
        return;
    }
    
    const pattern = regexPattern.value.trim();
    const flags = regexFlags ? regexFlags.value : 'g';
    const text = testInput.value;
    
    if (!pattern) {
        testResults.innerHTML = `
            <div class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div class="text-center">
                    <i class="fas fa-search text-2xl mb-2"></i>
                    <p>أدخل تعبيراً نمطياً لرؤية النتائج...</p>
                </div>
            </div>
        `;
        matchCount.textContent = '0 نتائج';
        groupResults.innerHTML = '<p class="text-gray-500 dark:text-gray-400 italic">ستظهر هنا نتائج المجموعات إن وجدت...</p>';
        return;
    }
    
    try {
        // Create regex object
        const regex = new RegExp(pattern, flags);
        
        // Add to history
        addToRegexHistory(pattern, flags);
        
        // Find matches
        const matches = [];
        let match;
        
        if (flags.includes('g')) {
            // Find all matches
            let tmpText = text;
            while ((match = regex.exec(tmpText)) !== null) {
                matches.push({
                    match: match[0],
                    groups: match.slice(1),
                    index: match.index
                });
                
                // Break if no global flag to avoid infinite loop
                if (!flags.includes('g')) break;
                
                // If exec doesn't move forward (empty match)
                if (match.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
            }
        } else {
            // Without global flag, find only first match
            match = regex.exec(text);
            if (match) {
                matches.push({
                    match: match[0],
                    groups: match.slice(1),
                    index: match.index
                });
            }
        }
        
        // Show number of matches
        matchCount.textContent = `${matches.length} نتائج`;
        
        // Display results
        if (matches.length === 0) {
            testResults.innerHTML = `
                <div class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div class="text-center">
                        <i class="fas fa-search-minus text-2xl mb-2"></i>
                        <p>لم يتم العثور على أي تطابقات</p>
                    </div>
                </div>
            `;
            groupResults.innerHTML = '<p class="text-gray-500 dark:text-gray-400 italic">لا توجد مجموعات</p>';
        } else {
            // Highlight matches in the text
            let highlightedText = text;
            let offset = 0;
            
            // Sort matches by index to handle them in order
            matches.sort((a, b) => a.index - b.index);
            
            matches.forEach((m, index) => {
                const before = highlightedText.substring(0, m.index + offset);
                const matchText = highlightedText.substring(m.index + offset, m.index + offset + m.match.length);
                const after = highlightedText.substring(m.index + offset + m.match.length);
                
                const highlightedMatch = `<span class="match-highlight">${matchText}</span>`;
                highlightedText = before + highlightedMatch + after;
                
                // Update offset for next replacements
                offset += highlightedMatch.length - matchText.length;
            });
            
            // Display highlighted text
            testResults.innerHTML = `<div class="whitespace-pre-wrap">${highlightedText}</div>`;
            
            // Display group results
            if (matches.some(m => m.groups && m.groups.length > 0)) {
                let groupsHTML = '<div class="space-y-2">';
                
                matches.forEach((m, matchIndex) => {
                    if (m.groups && m.groups.length > 0) {
                        groupsHTML += `<div class="font-medium">نتيجة #${matchIndex + 1}:</div>`;
                        groupsHTML += '<div class="grid grid-cols-2 gap-2 mb-2">';
                        
                        m.groups.forEach((group, groupIndex) => {
                            if (group !== undefined) {
                                groupsHTML += `
                                    <div class="p-2 bg-gray-100 dark:bg-gray-700/50 rounded text-sm">
                                        <span class="text-xs text-gray-500 dark:text-gray-400">المجموعة ${groupIndex + 1}:</span>
                                        <div class="font-mono">${escapeHTML(group)}</div>
                                    </div>
                                `;
                            }
                        });
                        
                        groupsHTML += '</div>';
                    }
                });
                
                groupsHTML += '</div>';
                groupResults.innerHTML = groupsHTML;
            } else {
                groupResults.innerHTML = '<p class="text-gray-500 dark:text-gray-400 italic">لا توجد مجموعات في هذا التعبير النمطي</p>';
            }
        }
        
        // Generate explanation
        if (regexExplanation) {
            regexExplanation.innerHTML = generateRegexExplanation(pattern, flags);
        }
        
    } catch (error) {
        // Show error message
        testResults.innerHTML = `
            <div class="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                <i class="fas fa-exclamation-triangle ml-2"></i>
                خطأ في التعبير النمطي: ${error.message}
            </div>
        `;
        matchCount.textContent = '0 نتائج';
        groupResults.innerHTML = '<p class="text-gray-500 dark:text-gray-400 italic">لا توجد نتائج بسبب خطأ في التعبير النمطي</p>';
    }
}

function clearResults() {
    const testResults = document.getElementById('testResults');
    const matchCount = document.getElementById('matchCount');
    const groupResults = document.getElementById('groupResults');
    const regexExplanation = document.getElementById('regexExplanation');
    
    if (testResults) {
        testResults.innerHTML = `
            <div class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div class="text-center">
                    <i class="fas fa-search text-2xl mb-2"></i>
                    <p>أدخل تعبيراً نمطياً لرؤية النتائج...</p>
                </div>
            </div>
        `;
    }
    
    if (matchCount) {
        matchCount.textContent = '0 نتائج';
    }
    
    if (groupResults) {
        groupResults.innerHTML = '<p class="text-gray-500 dark:text-gray-400 italic">ستظهر هنا نتائج المجموعات إن وجدت...</p>';
    }
    
    if (regexExplanation) {
        regexExplanation.innerHTML = '<p class="text-gray-500 dark:text-gray-400 italic">أدخل تعبيراً نمطياً لرؤية التفسير...</p>';
    }
}

/************************
 * REGEX HISTORY
 ************************/
function addToRegexHistory(pattern, flags) {
    if (!pattern) return;
    
    try {
        // Get existing history
        let history = JSON.parse(localStorage.getItem('regexHistory') || '[]');
        
        // Add new entry
        const entry = {
            pattern,
            flags: flags || 'g',
            timestamp: Date.now()
        };
        
        // Check if already exists
        const index = history.findIndex(item => item.pattern === pattern && item.flags === flags);
        if (index !== -1) {
            // Remove existing and add to top
            history.splice(index, 1);
        }
        
        // Add to top of history
        history.unshift(entry);
        
        // Limit to 20 entries
        if (history.length > 20) {
            history = history.slice(0, 20);
        }
        
        // Save back to storage
        localStorage.setItem('regexHistory', JSON.stringify(history));
        
    } catch (error) {
        console.error('Error saving to regex history:', error);
    }
}

function loadRegexHistory() {
    const historyContainer = document.getElementById('regexHistory');
    if (!historyContainer) return;
    
    try {
        // Get history from storage
        const history = JSON.parse(localStorage.getItem('regexHistory') || '[]');
        
        // Clear container
        historyContainer.innerHTML = '';
        
        if (history.length === 0) {
            historyContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center p-4">لا يوجد سجل سابق</p>';
            return;
        }
        
        // Add each history item
        history.forEach(item => {
            const entryEl = document.createElement('div');
            entryEl.className = 'history-item p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer';
            
            const date = new Date(item.timestamp);
            const dateStr = date.toLocaleDateString('ar-SA');
            
            entryEl.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="font-mono text-indigo-600 dark:text-indigo-400 text-sm overflow-hidden text-ellipsis">/${escapeHTML(item.pattern)}/${item.flags}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">${dateStr}</div>
                </div>
            `;
            
            entryEl.onclick = function() {
                const regexPattern = document.getElementById('regexPattern');
                const regexFlags = document.getElementById('regexFlags');
                
                if (regexPattern) {
                    regexPattern.value = item.pattern;
                }
                
                if (regexFlags) {
                    regexFlags.value = item.flags;
                }
                
                switchTab('test');
                
                if (typeof testRegexPattern === 'function') {
                    setTimeout(testRegexPattern, 50);
                }
            };
            
            historyContainer.appendChild(entryEl);
        });
        
    } catch (error) {
        console.error('Error loading regex history:', error);
        historyContainer.innerHTML = '<p class="text-red-500 dark:text-red-400 text-center p-4">حدث خطأ أثناء تحميل السجل</p>';
    }
}

function saveCurrentPattern() {
    const regexPattern = document.getElementById('regexPattern');
    const regexFlags = document.getElementById('regexFlags');
    
    if (!regexPattern) return;
    
    const pattern = regexPattern.value.trim();
    const flags = regexFlags ? regexFlags.value : 'g';
    
    if (!pattern) {
        showToast('لا يوجد تعبير نمطي للحفظ', 'warning');
        return;
    }
    
    // Add to history
    addToRegexHistory(pattern, flags);
    
    // Reload history
    loadRegexHistory();
    
    // Show confirmation
    showToast('تم حفظ التعبير النمطي');
}

/************************
 * PATTERN BUILDER
 ************************/
function initPatternBuilder() {
    // Prevent multiple initialization
    if (patternBuilderInitialized) return;
    patternBuilderInitialized = true;
    
    // Initialize builder components
    initComponentButtons();
    initBuilderControls();
    initCommonPatterns();
    
    // Initialize builder display
    const patternBuilder = document.getElementById('patternBuilder');
    if (patternBuilder) {
        // Clear and initialize the pattern builder
        patternBuilder.innerHTML = `
            <div class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <p>اضغط على المكونات أعلاه لبناء تعبيرك النمطي هنا...</p>
            </div>
        `;
        patternBuilder.dataset.pattern = '';
    }
    
    // Initialize the regex display
    updateRegexDisplay();
}

function initComponentButtons() {
    // Add click handlers to component buttons using event delegation
    document.addEventListener('click', function(e) {
        // Find the component button (or its ancestor)
        const button = e.target.closest('.component-button');
        if (!button || !button.dataset.component) return;
        
        // Add the component to the builder
        addComponentToBuilder(button.dataset.component);
    });
}

function initBuilderControls() {
    // Helper to safely add event handler
    function addSafeHandler(selector, handler) {
        const element = document.querySelector(selector);
        if (!element) return;
        
        // Clone to remove existing handlers
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        
        // Add new handler
        newElement.onclick = handler;
    }
    
    // Add clean handlers to builder control buttons
    addSafeHandler('#addGroupBtn', function(e) {
        e.preventDefault();
        addComponentToBuilder('(...)');
    });
    
    addSafeHandler('#addCharClassBtn', function(e) {
        e.preventDefault();
        addComponentToBuilder('[...]');
    });
    
    addSafeHandler('#addAlternationBtn', function(e) {
        e.preventDefault();
        addComponentToBuilder('|');
    });
    
    addSafeHandler('#addQuantifierBtn', function(e) {
        e.preventDefault();
        showQuantifierDialog();
    });
    
    addSafeHandler('#clearBuilderBtn', function(e) {
        e.preventDefault();
        clearBuilder();
    });
    
    addSafeHandler('#applyRegexBtn', function(e) {
        e.preventDefault();
        applyBuiltRegex();
    });
}

function initCommonPatterns() {
    // Clear any existing event handlers
    document.querySelectorAll('[data-pattern]').forEach(button => {
        // Create a new button to remove existing event handlers
        const newButton = button.cloneNode(true);
        if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
        }
        
        // Add fresh click handler
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const patternType = this.getAttribute('data-pattern');
            console.log("Pattern button clicked:", patternType); // Debug
            
            if (patternType) {
                // If the pattern looks like a regex pattern (contains special characters)
                if (patternType.includes('(') || patternType.includes('[') || patternType.includes('\\')) {
                    // It's a full regex pattern, apply directly
                    const patternBuilder = document.getElementById('patternBuilder');
                    if (patternBuilder) {
                        patternBuilder.dataset.pattern = patternType;
                        updatePatternDisplay();
                        updateRegexDisplay();
                        updateLivePreview();
                        showToast('تم نسخ النمط المخصص', 'success');
                    }
                } else {
                    // It's a pattern type (email, phone, etc.)
                    applyCommonPattern(patternType);
                }
            }
        });
    });
}

function addComponentToBuilder(component) {
    const patternBuilder = document.getElementById('patternBuilder');
    if (!patternBuilder) return;
    
    // Get current pattern
    let currentPattern = patternBuilder.dataset.pattern || '';
    
    // Handle special placeholders
    if (component === '[...]') {
        component = '[]';
    } else if (component === '(...)') {
        component = '()';
    }
    
    // Add to current pattern
    currentPattern += component;
    
    // Update builder
    patternBuilder.dataset.pattern = currentPattern;
    
    // Update displays
    updatePatternDisplay();
    updateRegexDisplay();
    updateLivePreview();
    
    // No need to show toast for every component
}

function showQuantifierDialog() {
    // Simple prompt for now, could be replaced with a custom dialog
    const quantifier = prompt('أدخل المكرر (مثال: *, +, ?, {2}, {1,3}):', '{1,}');
    if (quantifier !== null) {
        addComponentToBuilder(quantifier);
    }
}

function updatePatternDisplay() {
    const patternBuilder = document.getElementById('patternBuilder');
    if (!patternBuilder) return;
    
    const pattern = patternBuilder.dataset.pattern || '';
    
    if (!pattern) {
        patternBuilder.innerHTML = `
            <div class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <p>اضغط على المكونات أعلاه لبناء تعبيرك النمطي هنا...</p>
            </div>
        `;
        return;
    }
    
    // Format the pattern with syntax highlighting
    let formattedPattern = '';
    for (let i = 0; i < pattern.length; i++) {
        const char = pattern[i];
        let className = '';
        
        if ('\\[](){}|+*?^$'.includes(char)) {
            className = 'text-indigo-600 dark:text-indigo-400 font-bold';
        } else {
            className = 'text-gray-700 dark:text-gray-300';
        }
        
        formattedPattern += `<span class="${className}">${escapeHTML(char)}</span>`;
    }
    
    patternBuilder.innerHTML = `<div class="font-mono">${formattedPattern}</div>`;
}

function updateRegexDisplay() {
    const currentRegexDisplay = document.getElementById('currentRegexDisplay');
    const patternBuilder = document.getElementById('patternBuilder');
    
    if (!currentRegexDisplay || !patternBuilder) return;
    
    const pattern = patternBuilder.dataset.pattern || '';
    
    if (pattern) {
        currentRegexDisplay.innerHTML = `<code class="font-mono text-indigo-600 dark:text-indigo-400">${escapeHTML(pattern)}</code>`;
    } else {
        currentRegexDisplay.innerHTML = `<span class="text-gray-400">// سيظهر هنا التعبير أثناء بنائه</span>`;
    }
}

function updateLivePreview() {
    const livePreview = document.getElementById('livePreview');
    const previewMatchCount = document.getElementById('previewMatchCount');
    const patternBuilder = document.getElementById('patternBuilder');
    const testInput = document.getElementById('testInput');
    
    if (!livePreview || !previewMatchCount || !patternBuilder || !testInput) return;
    
    const pattern = patternBuilder.dataset.pattern || '';
    const input = testInput.value || '';
    
    if (!pattern || !input) {
        livePreview.innerHTML = '<p>أدخل نصًا للاختبار في تبويب "منطقة الاختبار" لرؤية النتائج هنا...</p>';
        previewMatchCount.textContent = '0 نتائج';
        return;
    }
    
    try {
        // Create regex and find matches
        const regex = new RegExp(pattern, 'g');
        const matches = input.match(regex) || [];
        
        // Update match count
        previewMatchCount.textContent = `${matches.length} نتائج`;
        
        // Create highlighted preview
        if (matches.length > 0) {
            let highlightedText = input;
            let offset = 0;
            
            // Find all matches with indices
            const matchesWithIndices = [];
            let match;
            
            // Reset regex lastIndex
            regex.lastIndex = 0;
            
            while ((match = regex.exec(input)) !== null) {
                matchesWithIndices.push({
                    text: match[0],
                    index: match.index
                });
                
                // Avoid infinite loop with empty matches
                if (match.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
            }
            
            // Sort by index (in reverse to handle offsets correctly)
            matchesWithIndices.sort((a, b) => b.index - a.index);
            
            // Replace matches with highlighted version
            matchesWithIndices.forEach(match => {
                const before = highlightedText.substring(0, match.index);
                const matched = highlightedText.substring(match.index, match.index + match.text.length);
                const after = highlightedText.substring(match.index + match.text.length);
                
                highlightedText = before + 
                    `<span class="bg-indigo-200 dark:bg-indigo-900/50 rounded px-1">${matched}</span>` + 
                    after;
            });
            
            livePreview.innerHTML = highlightedText;
        } else {
            livePreview.innerHTML = '<p>لم يتم العثور على تطابقات في النص المدخل.</p>';
        }
        
    } catch (error) {
        livePreview.innerHTML = `<p class="text-red-600 dark:text-red-400">خطأ في التعبير النمطي: ${error.message}</p>`;
        previewMatchCount.textContent = '0 نتائج';
    }
}

function clearBuilder() {
    const patternBuilder = document.getElementById('patternBuilder');
    if (!patternBuilder) return;
    
    // Clear pattern
    patternBuilder.dataset.pattern = '';
    
    // Update displays
    updatePatternDisplay();
    updateRegexDisplay();
    updateLivePreview();
    
    // Show confirmation
    showToast('تم مسح المحرر', 'info');
}

function applyBuiltRegex() {
    const patternBuilder = document.getElementById('patternBuilder');
    const regexPattern = document.getElementById('regexPattern');
    
    if (!patternBuilder || !regexPattern) return;
    
    const pattern = patternBuilder.dataset.pattern || '';
    
    if (!pattern) {
        showToast('لا يوجد تعبير نمطي للتطبيق', 'warning');
        return;
    }
    
    // Apply to main regex input
    regexPattern.value = pattern;
    
    // Switch to test tab
    switchTab('test');
    
    // Run test
    setTimeout(() => {
        if (typeof testRegexPattern === 'function') {
            testRegexPattern();
        }
    }, 100);
    
    // Show confirmation
    showToast('تم تطبيق التعبير النمطي', 'success');
}

function applyCommonPattern(patternType) {
    const patternBuilder = document.getElementById('patternBuilder');
    if (!patternBuilder) return;
    
    console.log("Applying pattern type:", patternType); // Debug
    
    let pattern = '';
    
    // Set pattern based on type
    switch (patternType) {
        case 'email':
            pattern = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}';
            break;
        case 'phone':
            pattern = '(\\+9665|05)[0-9]{8}';
            break;
        case 'url':
            pattern = 'https?://[\\w-]+(\\.[\\w-]+)+([\\w.,@?^=%&:/~+#-]*[\\w@?^=%&/~+#-])?';
            break;
        case 'date':
            pattern = '\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])';
            break;
        case 'username':
            pattern = '[a-zA-Z][a-zA-Z0-9_]{3,15}';
            break;
        case 'password':
            pattern = '(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[^\\w\\s]).{8,}';
            break;
        default:
            console.error("Unknown pattern type:", patternType);
            showToast('نمط غير معروف: ' + patternType, 'error');
            return;
    }
    
    // Set pattern in builder
    patternBuilder.dataset.pattern = pattern;
    
    // Update displays
    updatePatternDisplay();
    updateRegexDisplay();
    updateLivePreview();
    
    // Show confirmation
    showToast(`تم تطبيق نمط ${getPatternName(patternType)}`, 'success');
}

function getPatternName(patternType) {
    switch (patternType) {
        case 'email': return 'البريد الإلكتروني';
        case 'phone': return 'رقم الهاتف';
        case 'url': return 'الرابط';
        case 'date': return 'التاريخ';
        case 'username': return 'اسم المستخدم';
        case 'password': return 'كلمة المرور';
        default: return patternType;
    }
}

/************************
 * LIBRARY FUNCTIONALITY
 ************************/
function initLibrary() {
    // Prevent multiple initialization
    if (libraryInitialized) return;
    libraryInitialized = true;
    
    // Load regex patterns from library
    loadLibraryPatterns();
    
    // Add event handlers
    const saveToLibraryBtn = document.getElementById('saveToLibraryBtn');
    if (saveToLibraryBtn) {
        const newBtn = saveToLibraryBtn.cloneNode(true);
        if (saveToLibraryBtn.parentNode) {
            saveToLibraryBtn.parentNode.replaceChild(newBtn, saveToLibraryBtn);
        }
        
        newBtn.onclick = function(e) {
            e.preventDefault();
            saveToLibrary();
        };
    }
}

function loadLibraryPatterns() {
    const libraryContainer = document.getElementById('regexLibrary');
    if (!libraryContainer) return;
    
    try {
        // Get library from storage
        const library = JSON.parse(localStorage.getItem('regexLibrary') || '[]');
        
        // Clear container
        libraryContainer.innerHTML = '';
        
        if (library.length === 0) {
            libraryContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center p-4">لا توجد تعبيرات محفوظة في المكتبة</p>';
            return;
        }
        
        // Add each library item
        library.forEach((item, index) => {
            const entryEl = document.createElement('div');
            entryEl.className = 'library-item p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30';
            
            entryEl.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="flex-1">
                        <div class="font-medium text-gray-700 dark:text-gray-300">${escapeHTML(item.name || 'بدون اسم')}</div>
                        <div class="text-sm text-indigo-600 dark:text-indigo-400 font-mono overflow-hidden text-ellipsis">${escapeHTML(item.pattern)}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${escapeHTML(item.description || '')}</div>
                    </div>
                    <div class="flex space-x-2 space-x-reverse">
                        <button class="use-pattern-btn p-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300" data-index="${index}">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="delete-pattern-btn p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300" data-index="${index}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
            
            libraryContainer.appendChild(entryEl);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.use-pattern-btn').forEach(btn => {
            btn.onclick = function() {
                const index = parseInt(this.dataset.index, 10);
                useLibraryPattern(index);
            };
        });
        
        document.querySelectorAll('.delete-pattern-btn').forEach(btn => {
            btn.onclick = function() {
                const index = parseInt(this.dataset.index, 10);
                deleteLibraryPattern(index);
            };
        });
        
    } catch (error) {
        console.error('Error loading regex library:', error);
        libraryContainer.innerHTML = '<p class="text-red-500 dark:text-red-400 text-center p-4">حدث خطأ أثناء تحميل المكتبة</p>';
    }
}

function saveToLibrary() {
    const regexPattern = document.getElementById('regexPattern');
    const regexFlags = document.getElementById('regexFlags');
    
    if (!regexPattern) return;
    
    const pattern = regexPattern.value.trim();
    const flags = regexFlags ? regexFlags.value : 'g';
    
    if (!pattern) {
        showToast('لا يوجد تعبير نمطي للحفظ', 'warning');
        return;
    }
    
    // Prompt for name and description
    const name = prompt('أدخل اسماً للتعبير النمطي:', '');
    if (name === null) return; // User cancelled
    
    const description = prompt('أدخل وصفاً للتعبير النمطي (اختياري):', '');
    
    try {
        // Get existing library
        let library = JSON.parse(localStorage.getItem('regexLibrary') || '[]');
        
        // Add new entry
        library.push({
            name: name || 'بدون اسم',
            pattern,
            flags,
            description: description || '',
            timestamp: Date.now()
        });
        
        // Save back to storage
        localStorage.setItem('regexLibrary', JSON.stringify(library));
        
        // Reload library
        loadLibraryPatterns();
        
        // Show confirmation
        showToast('تم حفظ التعبير النمطي في المكتبة', 'success');
        
    } catch (error) {
        console.error('Error saving to library:', error);
        showToast('حدث خطأ أثناء الحفظ في المكتبة', 'error');
    }
}

function useLibraryPattern(index) {
    try {
        // Get library
        const library = JSON.parse(localStorage.getItem('regexLibrary') || '[]');
        if (index < 0 || index >= library.length) {
            showToast('تعبير غير موجود', 'error');
            return;
        }
        
        const item = library[index];
        
        // Apply to regex input
        const regexPattern = document.getElementById('regexPattern');
        const regexFlags = document.getElementById('regexFlags');
        
        if (regexPattern) {
            regexPattern.value = item.pattern;
        }
        
        if (regexFlags) {
            regexFlags.value = item.flags;
        }
        
        // Switch to test tab and run test
        switchTab('test');
        setTimeout(() => {
            if (typeof testRegexPattern === 'function') {
                testRegexPattern();
            }
        }, 100);
        
        // Show confirmation
        showToast(`تم تطبيق التعبير "${item.name}"`, 'success');
        
    } catch (error) {
        console.error('Error using library pattern:', error);
        showToast('حدث خطأ أثناء استخدام التعبير', 'error');
    }
}

function deleteLibraryPattern(index) {
    try {
        // Get library
        let library = JSON.parse(localStorage.getItem('regexLibrary') || '[]');
        if (index < 0 || index >= library.length) {
            showToast('تعبير غير موجود', 'error');
            return;
        }
        
        // Confirm deletion
        if (!confirm('هل أنت متأكد من رغبتك في حذف هذا التعبير من المكتبة؟')) {
            return;
        }
        
        // Remove the item
        library.splice(index, 1);
        
        // Save back to storage
        localStorage.setItem('regexLibrary', JSON.stringify(library));
        
        // Reload library
        loadLibraryPatterns();
        
        // Show confirmation
        showToast('تم حذف التعبير من المكتبة', 'success');
        
    } catch (error) {
        console.error('Error deleting library pattern:', error);
        showToast('حدث خطأ أثناء حذف التعبير', 'error');
    }
}

/************************
 * UTILITIES
 ************************/
function escapeHTML(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function copyToClipboard(text) {
    // Create temp element
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    
    // Select and copy
    el.select();
    document.execCommand('copy');
    
    // Clean up
    document.body.removeChild(el);
    
    console.log("Copied to clipboard:", text);
}

// Add this new function
function applyPatternAndTest(pattern) {
    const regexPattern = document.getElementById('regexPattern');
    if (regexPattern) {
        regexPattern.value = pattern;
        
        // Switch to test tab
        switchTab('test');
        
        // Run the test after a short delay
        setTimeout(testRegexPattern, 100);
    }
}


function exportTestResults() {
    const regexPattern = document.getElementById('regexPattern');
    const regexFlags = document.getElementById('regexFlags');
    const testInput = document.getElementById('testInput');
    const testResults = document.getElementById('testResults');
    const matchCount = document.getElementById('matchCount');
    
    if (!regexPattern || !testInput || !testResults || !matchCount) {
        showToast('عناصر النتائج غير موجودة', 'error');
        return;
    }
    
    const pattern = regexPattern.value.trim();
    const flags = regexFlags ? regexFlags.value : 'g';
    const input = testInput.value;
    
    if (!pattern || !input) {
        showToast('لا توجد نتائج للتصدير', 'warning');
        return;
    }
    
    try {
        // Create regex object
        const regex = new RegExp(pattern, flags);
        
        // Find matches
        const matches = [];
        let match;
        
        if (flags.includes('g')) {
            while ((match = regex.exec(input)) !== null) {
                matches.push({
                    match: match[0],
                    groups: match.slice(1),
                    index: match.index
                });
                
                if (match.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
            }
        } else {
            match = regex.exec(input);
            if (match) {
                matches.push({
                    match: match[0],
                    groups: match.slice(1),
                    index: match.index
                });
            }
        }
        
        // Create export text
        let exportText = `# نتائج التعبير النمطي\n\n`;
        exportText += `- التعبير: /${pattern}/${flags}\n`;
        exportText += `- عدد النتائج: ${matches.length}\n\n`;
        
        if (matches.length > 0) {
            exportText += `## النتائج\n\n`;
            
            matches.forEach((m, index) => {
                exportText += `### نتيجة ${index + 1}\n`;
                exportText += `- النص: ${m.match}\n`;
                exportText += `- الموقع: ${m.index}\n`;
                
                if (m.groups && m.groups.length > 0) {
                    exportText += `- المجموعات:\n`;
                    m.groups.forEach((group, groupIndex) => {
                        if (group !== undefined) {
                            exportText += `  - مجموعة ${groupIndex + 1}: ${group}\n`;
                        }
                    });
                }
                
                exportText += `\n`;
            });
        }
        
        // Copy to clipboard or download
        if (confirm('هل ترغب في نسخ النتائج إلى الحافظة؟')) {
            copyToClipboard(exportText);
            showToast('تم نسخ النتائج إلى الحافظة', 'success');
        } else {
            // Download as file
            const blob = new Blob([exportText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'regex_results.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast('تم تنزيل النتائج كملف نصي', 'success');
        }
        
    } catch (error) {
        console.error('Error exporting results:', error);
        showToast('حدث خطأ أثناء تصدير النتائج', 'error');
    }
}

function generateRegexExplanation(pattern, flags) {
    if (!pattern) return '';
    
    try {
        let explanation = '<div class="text-sm">';
        explanation += '<p class="font-medium mb-2">تفسير التعبير النمطي:</p>';
        explanation += '<ul class="list-disc list-inside space-y-1">';
        
        // Basic explanation
        if (pattern.includes('^')) {
            explanation += '<li>يبدأ النص من بداية السطر/النص</li>';
        }
        
        if (pattern.includes('$')) {
            explanation += '<li>ينتهي النص في نهاية السطر/النص</li>';
        }
        
        if (pattern.includes('\\d')) {
            explanation += '<li>يطابق أي رقم</li>';
        }
        
        if (pattern.includes('\\w')) {
            explanation += '<li>يطابق أي حرف أو رقم أو شرطة سفلية</li>';
        }
        
        if (pattern.includes('\\s')) {
            explanation += '<li>يطابق أي مسافة</li>';
        }
        
        if (pattern.includes('.')) {
            explanation += '<li>يطابق أي حرف (ما عدا سطر جديد)</li>';
        }
        
        if (/\[\^?[^\]]+\]/.test(pattern)) {
            explanation += '<li>يستخدم فئة من الأحرف للمطابقة</li>';
        }
        
        if (/\([^?][^)]*\)/.test(pattern)) {
            explanation += '<li>يحتوي على مجموعات التقاط</li>';
        }
        
        if (/\(\?:/.test(pattern)) {
            explanation += '<li>يحتوي على مجموعات بدون التقاط</li>';
        }
        
        if (/\(\?=/.test(pattern)) {
            explanation += '<li>يستخدم تطلع للأمام للمطابقة</li>';
        }
        
        if (/\(\?!/.test(pattern)) {
            explanation += '<li>يستخدم نفي التطلع للأمام</li>';
        }
        
        if (pattern.includes('|')) {
            explanation += '<li>يستخدم البديل (هذا أو ذاك)</li>';
        }
        
        if (/\*|\+|\?|\{\d+,?\d*\}/.test(pattern)) {
            explanation += '<li>يستخدم مكررات لتحديد عدد المطابقات</li>';
        }
        
        // Flags explanation
        if (flags) {
            explanation += '<li>الأعلام المستخدمة:';
            explanation += '<ul class="list-circle list-inside mr-4 mt-1">';
            
            if (flags.includes('g')) {
                explanation += '<li>g: البحث عن جميع التطابقات (وليس فقط الأولى)</li>';
            }
            
            if (flags.includes('i')) {
                explanation += '<li>i: تجاهل حالة الأحرف (كبيرة/صغيرة)</li>';
            }
            
            if (flags.includes('m')) {
                explanation += '<li>m: وضع متعدد الأسطر (^ و $ تطابق بداية ونهاية كل سطر)</li>';
            }
            
            if (flags.includes('s')) {
                explanation += '<li>s: النقطة تطابق أي حرف بما في ذلك سطر جديد</li>';
            }
            
            if (flags.includes('u')) {
                explanation += '<li>u: دعم يونيكود</li>';
            }
            
            if (flags.includes('y')) {
                explanation += '<li>y: وضع البحث الالتصاقي</li>';
            }
            
            explanation += '</ul></li>';
        }
        
        explanation += '</ul></div>';
        return explanation;
        
    } catch (error) {
        console.error('Error generating explanation:', error);
        return '<p class="text-red-500">حدث خطأ أثناء إنشاء التفسير</p>';
    }
}

function showToast(message, type = 'info') {
    // Remove any existing toasts
    const existingToasts = document.querySelectorAll('.toast-message');
    existingToasts.forEach(toast => {
        toast.remove();
    });
    
    // Create toast container if needed
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'fixed bottom-4 left-4 z-50 flex flex-col-reverse gap-2';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = 'toast-message px-4 py-3 rounded-lg shadow-lg text-white flex items-center transition transform duration-300 translate-y-full opacity-0';
    
    // Set background color based on type
    switch (type) {
        case 'success':
            toast.classList.add('bg-green-600');
            break;
        case 'error':
            toast.classList.add('bg-red-600');
            break;
        case 'warning':
            toast.classList.add('bg-yellow-600');
            break;
        default:
            toast.classList.add('bg-indigo-600');
    }
    
    // Add icon based on type
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle ml-2"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle ml-2"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle ml-2"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle ml-2"></i>';
    }
    
    toast.innerHTML = `${icon}${message}`;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-full', 'opacity-0');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

/************************
 * MODALS
 ************************/
function initModals() {
    // Prevent multiple initialization
    if (modalsInitialized) return;
    modalsInitialized = true;
    
    // Close modal buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.onclick = function() {
            closeModal(this.closest('.modal'));
        };
    });
    
    // Close on clicking outside modal content
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                if (!modal.classList.contains('hidden')) {
                    closeModal(modal);
                }
            });
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    
    // Animate in
    setTimeout(() => {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('translate-y-10', 'opacity-0');
        }
    }, 10);
}

function closeModal(modal) {
    if (!modal) return;
    
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.classList.add('translate-y-10', 'opacity-0');
    }
    
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }, 300);
}

/************************
 * INITIALIZATION
 ************************/
// Single entry point for initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components in sequence
    initTheme();
    initTabSystem();
    initRegexTester();
    initPatternBuilder();
    initLibrary();
    initModals();
    
    // Initial run of test pattern (if pattern exists)
    const regexPattern = document.getElementById('regexPattern');
    if (regexPattern && regexPattern.value.trim()) {
        setTimeout(testRegexPattern, 100);
    }
    
    // Set current year in footer
    const currentYearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    currentYearElements.forEach(el => {
        el.textContent = currentYear;
    });
    
    // Show welcome toast after a short delay
    setTimeout(() => {
        showToast('مرحباً بك في مصمم التعبيرات النمطية!');
    }, 1000);
});

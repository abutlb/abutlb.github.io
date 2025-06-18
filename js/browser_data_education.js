// Global variables
let userLocationData = {};
let privacyScore = 0;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadUserData();
    setupEventListeners();
});

// Initialize page elements
function initializePage() {
    // Set current year
    const currentYear = new Date().getFullYear();
    document.getElementById('currentYear').textContent = currentYear;
    document.getElementById('copyrightYear').textContent = currentYear;
    
    // Setup tab functionality
    setupTabs();
    
    // Check if popup should be shown
    if (!localStorage.getItem('privacyEducationVisited')) {
        showCookiePopup();
    }
    
    // Load device info immediately
    loadDeviceInfo();
    
    // Calculate initial privacy score
    updatePrivacyScore();
}

// Cookie popup functions
function showCookiePopup() {
    document.getElementById('cookiePopup').classList.remove('hidden');
}

function acceptAndStart() {
    localStorage.setItem('privacyEducationVisited', 'true');
    localStorage.setItem('visitTime', new Date().toISOString());
    closePopup();
}

function closePopup() {
    document.getElementById('cookiePopup').classList.add('hidden');
}

// Tab functionality
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and hide all contents
            tabButtons.forEach(btn => btn.classList.remove('active', 'opacity-100'));
            tabContents.forEach(content => content.classList.add('hidden'));
            
            // Add active class to clicked button and show corresponding content
            button.classList.add('active', 'opacity-100');
            document.getElementById(`${button.dataset.tab}-tab`).classList.remove('hidden');
        });
    });
}

// Load user data
async function loadUserData() {
    try {
        // Load IP and location info
        await loadLocationData();
        
        // Load other browser info
        loadBrowserInfo();
        
        // Load network info
        loadNetworkInfo();
        
    } catch (error) {
        console.log('Some data could not be loaded:', error);
        showFallbackData();
    }
}

// Load location data from IP
async function loadLocationData() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        userLocationData = data;
        
        document.getElementById('userIP').textContent = data.ip || 'غير متاح';
        document.getElementById('userCountry').textContent = data.country_name || 'غير متاح';
        document.getElementById('userRegion').textContent = data.region || 'غير متاح';
        document.getElementById('userCity').textContent = data.city || 'غير متاح';
        document.getElementById('userISP').textContent = data.org || 'غير متاح';
        
    } catch (error) {
        // Fallback data
        document.getElementById('userIP').textContent = 'مخفي للخصوصية';
        document.getElementById('userCountry').textContent = 'غير متاح';
        document.getElementById('userRegion').textContent = 'غير متاح';
        document.getElementById('userCity').textContent = 'غير متاح';
        document.getElementById('userISP').textContent = 'غير متاح';
    }
}

// Load device and browser info
function loadDeviceInfo() {
    const ua = navigator.userAgent;
    
    // Operating System
    let os = 'غير معروف';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';
    
    // Browser
    let browser = 'غير معروف';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Opera')) browser = 'Opera';
    
    // Device Type
    let deviceType = 'سطح المكتب';
    if (/Mobi|Android/i.test(ua)) deviceType = 'هاتف محمول';
    else if (/Tablet|iPad/i.test(ua)) deviceType = 'تابلت';
    
    // Update DOM
    document.getElementById('userOS').textContent = os;
    document.getElementById('userBrowser').textContent = browser;
    document.getElementById('deviceType').textContent = deviceType;
    document.getElementById('screenResolution').textContent = `${screen.width}x${screen.height}`;
    document.getElementById('userLanguage').textContent = navigator.language || 'غير متاح';
    
    // Timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.getElementById('userTimezone').textContent = timezone || 'غير متاح';
    
    // Visit time
    const visitTime = localStorage.getItem('visitTime') || new Date().toISOString();
    document.getElementById('visitTime').textContent = new Date(visitTime).toLocaleString('ar-SA');
}

// Load browser info
function loadBrowserInfo() {
    // Cookie support
    const cookieEnabled = navigator.cookieEnabled;
    const cookieSupport = document.getElementById('cookieSupport');
    if (cookieEnabled) {
        cookieSupport.innerHTML = '<span class="text-green-600"><i class="fas fa-check-circle"></i> مدعوم</span>';
    } else {
        cookieSupport.innerHTML = '<span class="text-red-600"><i class="fas fa-times-circle"></i> محظور</span>';
    }
    
    // Local storage support
    const localStorageSupport = document.getElementById('localStorageSupport');
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        localStorageSupport.innerHTML = '<span class="text-green-600"><i class="fas fa-check-circle"></i> مدعوم</span>';
    } catch (e) {
        localStorageSupport.innerHTML = '<span class="text-red-600"><i class="fas fa-times-circle"></i> محظور</span>';
    }
}

// Load network info
function loadNetworkInfo() {
    // Connection type
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const connectionType = document.getElementById('connectionType');
    const connectionSpeed = document.getElementById('connectionSpeed');
    
    if (connection) {
        const type = connection.effectiveType || connection.type || 'غير معروف';
        const speed = connection.downlink ? `${connection.downlink} Mbps` : 'غير معروف';
        
        connectionType.textContent = type;
        connectionSpeed.textContent = speed;
    } else {
        connectionType.textContent = 'غير متاح';
        connectionSpeed.textContent = 'غير متاح';
    }
    
    // Referrer
    const referrer = document.referrer || 'مباشر';
    document.getElementById('referrerPage').textContent = referrer === '' ? 'مباشر' : referrer;
}

// Cookie demo functions
function setCookie() {
    const demoDiv = document.getElementById('cookieDemo');
    const cookieName = 'privacy_demo_' + Date.now();
    const cookieValue = 'معلومات_تجريبية_' + Math.random().toString(36).substr(2, 9);
    
    document.cookie = `${cookieName}=${cookieValue}; path=/; max-age=3600`;
    
    demoDiv.innerHTML = `
        <div class="bg-green-100 border border-green-400 p-3 rounded">
            <h4 class="font-bold text-green-800 mb-2">✅ تم إنشاء كوكي جديد!</h4>
            <p class="text-sm text-green-700 mb-2"><strong>الاسم:</strong> ${cookieName}</p>
            <p class="text-sm text-green-700"><strong>القيمة:</strong> ${cookieValue}</p>
            <p class="text-xs text-green-600 mt-2">سينتهي هذا الكوكي خلال ساعة واحدة</p>
        </div>
    `;
}

function getCookie() {
    const demoDiv = document.getElementById('cookieDemo');
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    
    if (cookies.length === 1 && cookies[0] === '') {
        demoDiv.innerHTML = `
            <div class="bg-yellow-100 border border-yellow-400 p-3 rounded">
                <h4 class="font-bold text-yellow-800 mb-2">⚠️ لا توجد كوكيز</h4>
                <p class="text-sm text-yellow-700">لا توجد كوكيز محفوظة في هذا الموقع حالياً</p>
            </div>
        `;
        return;
    }
    
    let cookiesList = '<div class="bg-blue-100 border border-blue-400 p-3 rounded">';
    cookiesList += '<h4 class="font-bold text-blue-800 mb-2">🍪 الكوكيز المحفوظة:</h4>';
    cookiesList += '<div class="space-y-2">';
    
    cookies.forEach(cookie => {
        const [name, value] = cookie.split('=');
        if (name && value) {
            cookiesList += `
                <div class="bg-white p-2 rounded border text-xs">
                    <strong class="text-blue-700">${name}:</strong> 
                    <span class="text-gray-600">${value.length > 50 ? value.substring(0, 50) + '...' : value}</span>
                </div>
            `;
        }
    });
    
    cookiesList += '</div></div>';
    demoDiv.innerHTML = cookiesList;
}

function deleteCookie() {
    const demoDiv = document.getElementById('cookieDemo');
    const cookies = document.cookie.split(';');
    let deletedCount = 0;
    
    cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.startsWith('privacy_demo_')) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            deletedCount++;
        }
    });
    
    if (deletedCount > 0) {
        demoDiv.innerHTML = `
            <div class="bg-red-100 border border-red-400 p-3 rounded">
                <h4 class="font-bold text-red-800 mb-2">🗑️ تم حذف الكوكيز!</h4>
                <p class="text-sm text-red-700">تم حذف ${deletedCount} كوكي تجريبي</p>
                <p class="text-xs text-red-600 mt-2">ملاحظة: يمكن للمواقع إعادة إنشاء الكوكيز عند الزيارة التالية</p>
            </div>
        `;
    } else {
        demoDiv.innerHTML = `
            <div class="bg-gray-100 border border-gray-400 p-3 rounded">
                <h4 class="font-bold text-gray-800 mb-2">ℹ️ لا توجد كوكيز للحذف</h4>
                <p class="text-sm text-gray-700">لم يتم العثور على كوكيز تجريبية لحذفها</p>
            </div>
        `;
    }
}

// Tracking demo functions
function generateFingerprint() {
    const resultsDiv = document.getElementById('trackingResults');
    resultsDiv.classList.remove('hidden');
    
    const fingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack || 'غير محدد'
    };
    
    let fingerprintHash = 0;
    const fingerprintString = JSON.stringify(fingerprint);
    for (let i = 0; i < fingerprintString.length; i++) {
        const char = fingerprintString.charCodeAt(i);
        fingerprintHash = ((fingerprintHash << 5) - fingerprintHash) + char;
        fingerprintHash = fingerprintHash & fingerprintHash;
    }
    
    resultsDiv.innerHTML = `
        <h4 class="font-medium text-gray-800 mb-2">🔍 بصمتك الرقمية:</h4>
        <div class="bg-orange-50 border border-orange-200 p-3 rounded mb-3">
            <p class="text-sm font-bold text-orange-800">هاش البصمة: ${Math.abs(fingerprintHash)}</p>
            <p class="text-xs text-orange-600 mt-1">هذا الرقم فريد لمتصفحك وإعداداتك</p>
        </div>
        <div class="text-xs text-gray-600 space-y-1">
            <p><strong>المتصفح:</strong> ${fingerprint.userAgent.substring(0, 100)}...</p>
            <p><strong>اللغة:</strong> ${fingerprint.language}</p>
            <p><strong>النظام:</strong> ${fingerprint.platform}</p>
            <p><strong>الشاشة:</strong> ${fingerprint.screenResolution}</p>
            <p><strong>عمق الألوان:</strong> ${fingerprint.colorDepth} بت</p>
        </div>
        <div class="mt-3 p-2 bg-red-50 border border-red-200 rounded">
            <p class="text-xs text-red-700">⚠️ يمكن استخدام هذه المعلومات لتتبعك عبر مواقع مختلفة!</p>
        </div>
    `;
}

function showLocalStorage() {
    const resultsDiv = document.getElementById('trackingResults');
    resultsDiv.classList.remove('hidden');
    
    let storageInfo = '<h4 class="font-medium text-gray-800 mb-2">💾 التخزين المحلي:</h4>';
    storageInfo += '<div class="space-y-2">';
    
    // Check localStorage
    const localStorageSize = JSON.stringify(localStorage).length;
    storageInfo += `
        <div class="bg-blue-50 border border-blue-200 p-3 rounded">
            <p class="text-sm font-bold text-blue-800">Local Storage</p>
            <p class="text-xs text-blue-600">الحجم: ${localStorageSize} حرف</p>
            <p class="text-xs text-blue-600">العناصر: ${localStorage.length}</p>
        </div>
    `;
    
    // Check sessionStorage
    const sessionStorageSize = JSON.stringify(sessionStorage).length;
    storageInfo += `
        <div class="bg-green-50 border border-green-200 p-3 rounded">
            <p class="text-sm font-bold text-green-800">Session Storage</p>
            <p class="text-xs text-green-600">الحجم: ${sessionStorageSize} حرف</p>
            <p class="text-xs text-green-600">العناصر: ${sessionStorage.length}</p>
        </div>
    `;
    
    // Demo: Add some data
    const demoKey = 'privacy_demo_storage';
    const demoValue = JSON.stringify({
        timestamp: Date.now(),
        userAgent: navigator.userAgent.substring(0, 50),
        visits: (JSON.parse(localStorage.getItem(demoKey) || '{}').visits || 0) + 1
    });
    localStorage.setItem(demoKey, demoValue);
    
    storageInfo += `
        <div class="bg-yellow-50 border border-yellow-200 p-3 rounded">
            <p class="text-sm font-bold text-yellow-800">بيانات تجريبية</p>
            <p class="text-xs text-yellow-600">تم حفظ بيانات تجريبية في التخزين المحلي</p>
            <button onclick="clearDemoStorage()" class="mt-2 text-xs bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-2 py-1 rounded">
                مسح البيانات التجريبية
            </button>
        </div>
    `;
    
    storageInfo += '</div>';
    resultsDiv.innerHTML = storageInfo;
}

function clearDemoStorage() {
    localStorage.removeItem('privacy_demo_storage');
    showLocalStorage(); // Refresh the display
}

// Privacy settings functions
function showCookieSettings() {
    const modal = document.getElementById('privacyModal');
    const content = document.getElementById('privacyModalContent');
    
    content.innerHTML = `
        <div class="space-y-4">
            <h4 class="font-bold text-lg">إعدادات الكوكيز في المتصفحات الشائعة</h4>
            
            <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h5 class="font-bold text-blue-800 mb-2">Chrome</h5>
                <ol class="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>اذهب إلى الإعدادات (Settings)</li>
                    <li>اختر "الخصوصية والأمان" (Privacy and Security)</li>
                    <li>انقر على "ملفات تعريف الارتباط وبيانات المواقع الأخرى"</li>
                    <li>اختر "حظر ملفات تعريف الارتباط التابعة لجهات خارجية"</li>
                </ol>
            </div>
            
            <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h5 class="font-bold text-green-800 mb-2">Firefox</h5>
                <ol class="text-sm text-green-700 space-y-1 list-decimal list-inside">
                    <li>اذهب إلى الإعدادات (Settings)</li>
                    <li>اختر "الخصوصية والأمان" (Privacy & Security)</li>
                    <li>في قسم "الحماية المحسنة للتتبع" اختر "صارم"</li>
                    <li>أو خصص الإعدادات حسب احتياجك</li>
                </ol>
            </div>
            
            <div class="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                <h5 class="font-bold text-purple-800 mb-2">Safari</h5>
                <ol class="text-sm text-purple-700 space-y-1 list-decimal list-inside">
                    <li>اذهب إلى التفضيلات (Preferences)</li>
                    <li>اختر تبويب "الخصوصية" (Privacy)</li>
                    <li>حدد "منع التتبع عبر المواقع"</li>
                    <li>اختر "حظر جميع ملفات تعريف الارتباط" للحماية القصوى</li>
                </ol>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closePrivacyModal() {
    document.getElementById('privacyModal').classList.add('hidden');
}

// Privacy score calculation
function updatePrivacyScore() {
    const checkboxes = document.querySelectorAll('.privacy-check');
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    const totalCount = checkboxes.length;
    
    privacyScore = Math.round((checkedCount / totalCount) * 100);
    document.getElementById('privacyScore').textContent = `${privacyScore}%`;
    
    // Update color based on score
    const scoreElement = document.getElementById('privacyScore');
    if (privacyScore < 30) {
        scoreElement.className = 'text-3xl font-bold mb-2 text-red-400';
    } else if (privacyScore < 70) {
        scoreElement.className = 'text-3xl font-bold mb-2 text-yellow-400';
    } else {
        scoreElement.className = 'text-3xl font-bold mb-2 text-green-400';
    }
}

// Event listeners setup
function setupEventListeners() {
    // Privacy checkboxes
    const privacyChecks = document.querySelectorAll('.privacy-check');
    privacyChecks.forEach(checkbox => {
        checkbox.addEventListener('change', updatePrivacyScore);
    });
    
    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('privacyModal');
        if (e.target === modal) {
            closePrivacyModal();
        }
    });
    
    // Live data update every 30 seconds
    setInterval(updateLiveData, 30000);
}

// Update live data periodically
function updateLiveData() {
    // Update visit time
    const visitTime = localStorage.getItem('visitTime') || new Date().toISOString();
    document.getElementById('visitTime').textContent = new Date(visitTime).toLocaleString('ar-SA');
    
    // Check for network changes
    loadNetworkInfo();
}

// Fallback data for when APIs fail
function showFallbackData() {
    document.getElementById('userIP').textContent = 'محجوب للخصوصية';
    document.getElementById('userCountry').textContent = 'غير متاح';
    document.getElementById('userRegion').textContent = 'غير متاح';
    document.getElementById('userCity').textContent = 'غير متاح';
    document.getElementById('userISP').textContent = 'غير متاح';
}

// Utility functions
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Privacy tips based on user data
function getPersonalizedTips() {
    const tips = [];
    
    // Check browser
    const browser = document.getElementById('userBrowser').textContent;
    if (browser.includes('Chrome')) {
        tips.push('يُنصح بتفعيل "الحماية المحسنة" في إعدادات Chrome');
    }
    
    // Check cookies
    if (navigator.cookieEnabled) {
        tips.push('الكوكيز مفعلة - فكر في حذفها دورياً');
    }
    
    // Check local storage
    if (localStorage.length > 0) {
        tips.push('يوجد بيانات محفوظة محلياً - راجعها بانتظام');
    }
    
    return tips;
}

// Show personalized privacy tips
function showPersonalizedTips() {
    const tips = getPersonalizedTips();
    const modal = document.getElementById('privacyModal');
    const content = document.getElementById('privacyModalContent');
    
    let tipsHTML = '<div class="space-y-4">';
    tipsHTML += '<h4 class="font-bold text-lg">نصائح مخصصة لك</h4>';
    
    if (tips.length > 0) {
        tips.forEach(tip => {
            tipsHTML += `
                <div class="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p class="text-sm text-blue-700"><i class="fas fa-lightbulb text-blue-500 ml-2"></i>${tip}</p>
                </div>
            `;
        });
    } else {
        tipsHTML += `
            <div class="bg-green-50 border border-green-200 p-3 rounded-lg">
                <p class="text-sm text-green-700"><i class="fas fa-check-circle text-green-500 ml-2"></i>إعداداتك تبدو جيدة للخصوصية!</p>
            </div>
        `;
    }
    
    tipsHTML += '</div>';
    content.innerHTML = tipsHTML;
    modal.classList.remove('hidden');
}

// Export user data for transparency
function exportUserData() {
    const userData = {
        deviceInfo: {
            os: document.getElementById('userOS').textContent,
            browser: document.getElementById('userBrowser').textContent,
            deviceType: document.getElementById('deviceType').textContent,
            screenResolution: document.getElementById('screenResolution').textContent,
            language: document.getElementById('userLanguage').textContent,
            timezone: document.getElementById('userTimezone').textContent
        },
        locationInfo: {
            ip: document.getElementById('userIP').textContent,
            country: document.getElementById('userCountry').textContent,
            region: document.getElementById('userRegion').textContent,
            city: document.getElementById('userCity').textContent,
            isp: document.getElementById('userISP').textContent
        },
        browserCapabilities: {
            cookieSupport: document.getElementById('cookieSupport').textContent,
            localStorageSupport: document.getElementById('localStorageSupport').textContent,
            connectionType: document.getElementById('connectionType').textContent,
            connectionSpeed: document.getElementById('connectionSpeed').textContent
        },
        privacyScore: privacyScore,
        visitTime: document.getElementById('visitTime').textContent,
        referrer: document.getElementById('referrerPage').textContent
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my_privacy_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Simulate tracking protection
function simulateTrackingProtection() {
    const resultsDiv = document.getElementById('trackingResults');
    resultsDiv.classList.remove('hidden');
    
    const trackingMethods = [
        { name: 'Google Analytics', blocked: Math.random() > 0.3, type: 'تحليلات' },
        { name: 'Facebook Pixel', blocked: Math.random() > 0.4, type: 'إعلانات' },
        { name: 'Third-party Cookies', blocked: Math.random() > 0.6, type: 'كوكيز' },
        { name: 'Fingerprinting Scripts', blocked: Math.random() > 0.5, type: 'بصمة' },
        { name: 'Cross-site Trackers', blocked: Math.random() > 0.7, type: 'تتبع' }
    ];
    
    let protectionHTML = '<h4 class="font-medium text-gray-800 mb-2">🛡️ محاكاة الحماية من التتبع:</h4>';
    protectionHTML += '<div class="space-y-2">';
    
    trackingMethods.forEach(method => {
        const statusClass = method.blocked ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700';
        const statusIcon = method.blocked ? 'fa-shield-alt text-green-500' : 'fa-exclamation-triangle text-red-500';
        const statusText = method.blocked ? 'محجوب' : 'مسموح';
        
        protectionHTML += `
            <div class="${statusClass} border p-3 rounded">
                <div class="flex justify-between items-center">
                    <span class="text-sm font-medium">${method.name}</span>
                    <div class="flex items-center">
                        <span class="text-xs px-2 py-1 rounded bg-white mr-2">${method.type}</span>
                        <i class="fas ${statusIcon} ml-1"></i>
                        <span class="text-xs font-bold">${statusText}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    const blockedCount = trackingMethods.filter(m => m.blocked).length;
    const totalCount = trackingMethods.length;
    
    protectionHTML += `
        <div class="bg-blue-50 border border-blue-200 p-3 rounded mt-3">
            <p class="text-sm text-blue-700 text-center font-bold">
                تم حجب ${blockedCount} من ${totalCount} محاولات تتبع (${Math.round(blockedCount/totalCount*100)}%)
            </p>
        </div>
    `;
    
    protectionHTML += '</div>';
    resultsDiv.innerHTML = protectionHTML;
}

// Dark mode toggle (if needed)
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
}

// Check for dark mode preference
function checkDarkMode() {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark');
    }
}

// Privacy education quiz
function startPrivacyQuiz() {
    const modal = document.getElementById('privacyModal');
    const content = document.getElementById('privacyModalContent');
    
    const questions = [
        {
            question: "ما هي الطريقة الأفضل لحماية خصوصيتك أثناء التصفح؟",
            options: [
                "استخدام متصفح عادي",
                "استخدام التصفح الخاص و VPN",
                "عدم استخدام الإنترنت",
                "الاعتماد على إعدادات المصنع"
            ],
            correct: 1
        },
        {
            question: "ما هي الكوكيز؟",
            options: [
                "ملفات صغيرة تحفظ معلومات عن زيارتك",
                "برامج ضارة",
                "كلمات مرور",
                "صور"
            ],
            correct: 0
        },
        {
            question: "متى يجب أن تقلق بشأن خصوصيتك الرقمية؟",
            options: [
                "فقط عند استخدام مواقع غير موثوقة",
                "أبداً",
                "دائماً",
                "فقط عند التسوق الإلكتروني"
            ],
            correct: 2
        }
    ];
    
    let currentQuestion = 0;
    let score = 0;
    
    function showQuestion() {
        const q = questions[currentQuestion];
        content.innerHTML = `
            <div class="space-y-4">
                <div class="text-center">
                    <h4 class="font-bold text-lg mb-2">اختبار الخصوصية الرقمية</h4>
                    <p class="text-sm text-gray-600">السؤال ${currentQuestion + 1} من ${questions.length}</p>
                </div>
                
                <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p class="font-medium text-blue-800 mb-4">${q.question}</p>
                    <div class="space-y-2">
                        ${q.options.map((option, index) => `
                            <label class="flex items-center cursor-pointer p-2 bg-white rounded border hover:bg-blue-50">
                                <input type="radio" name="quiz_answer" value="${index}" class="ml-2">
                                <span class="text-sm">${option}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="text-center">
                    <button onclick="submitAnswer()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                        ${currentQuestion === questions.length - 1 ? 'إنهاء الاختبار' : 'السؤال التالي'}
                    </button>
                </div>
            </div>
        `;
    }
    
    window.submitAnswer = function() {
        const selected = document.querySelector('input[name="quiz_answer"]:checked');
        if (!selected) {
            alert('يرجى اختيار إجابة');
            return;
        }
        
        if (parseInt(selected.value) === questions[currentQuestion].correct) {
            score++;
        }
        
        currentQuestion++;
        
        if (currentQuestion < questions.length) {
            showQuestion();
        } else {
            showQuizResults();
        }
    };
    
    function showQuizResults() {
        const percentage = Math.round((score / questions.length) * 100);
        let message = '';
        let messageClass = '';
        
        if (percentage >= 80) {
            message = 'ممتاز! لديك معرفة جيدة بالخصوصية الرقمية';
            messageClass = 'text-green-700 bg-green-50 border-green-200';
        } else if (percentage >= 60) {
            message = 'جيد! لكن يمكنك تحسين معرفتك أكثر';
            messageClass = 'text-yellow-700 bg-yellow-50 border-yellow-200';
        } else {
            message = 'يُنصح بقراءة المزيد عن الخصوصية الرقمية';
            messageClass = 'text-red-700 bg-red-50 border-red-200';
        }
        
        content.innerHTML = `
            <div class="space-y-4">
                <div class="text-center">
                    <h4 class="font-bold text-lg mb-4">نتائج الاختبار</h4>
                    <div class="text-6xl mb-4">${percentage >= 80 ? '🏆' : percentage >= 60 ? '👍' : '📚'}</div>
                    <p class="text-2xl font-bold text-blue-600 mb-2">${score}/${questions.length}</p>
                    <p class="text-lg text-gray-600">${percentage}%</p>
                </div>
                
                <div class="${messageClass} border p-4 rounded-lg">
                    <p class="font-medium text-center">${message}</p>
                </div>
                
                <div class="text-center">
                    <button onclick="closePrivacyModal()" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg ml-2">
                        إغلاق
                    </button>
                    <button onclick="startPrivacyQuiz()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                        إعادة الاختبار
                    </button>
                </div>
            </div>
        `;
    }
    
    modal.classList.remove('hidden');
    showQuestion();
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 Privacy Education Page Loaded');
    console.log('📊 This page demonstrates data collection for educational purposes only');
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape to close modal
    if (e.key === 'Escape') {
        closePrivacyModal();
    }
    
    // Ctrl+Shift+P for personalized tips
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        showPersonalizedTips();
    }
});

// Console warnings for developers
console.warn('🚨 Privacy Notice: This educational page demonstrates various data collection methods.');
console.warn('📋 In a real website, this data could be sent to servers and used for tracking.');
console.warn('🔒 Always review privacy policies and use privacy protection tools.');

// Analytics simulation (for educational purposes)
function simulateAnalytics() {
    console.log('📈 Analytics Event Simulated:', {
        page: 'privacy-education',
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        screen_resolution: `${screen.width}x${screen.height}`,
        language: navigator.language
    });
}

// Call analytics simulation
simulateAnalytics();


// Add these functions to the existing JavaScript file

// Refresh all user data
function refreshData() {
    // Show loading indicators
    const loadingElements = [
        'userIP', 'userCountry', 'userRegion', 'userCity', 'userISP',
        'userOS', 'userBrowser', 'deviceType', 'screenResolution', 
        'userLanguage', 'userTimezone', 'visitTime', 'cookieSupport',
        'localStorageSupport', 'connectionType', 'connectionSpeed', 'referrerPage'
    ];
    
    loadingElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحديث...';
        }
    });
    
    // Reload all data after a short delay to show loading effect
    setTimeout(() => {
        loadUserData();
        loadDeviceInfo();
        loadBrowserInfo();
        loadNetworkInfo();
        
        // Update visit time
        document.getElementById('visitTime').textContent = new Date().toLocaleString('ar-SA');
        
        // Show success message
        showNotification('تم تحديث البيانات بنجاح!', 'success');
    }, 1000);
}

// Show privacy tips modal
function showPrivacyTips() {
    const modal = document.getElementById('privacyModal');
    const content = document.getElementById('privacyModalContent');
    
    content.innerHTML = `
        <div class="space-y-6">
            <div class="text-center">
                <div class="text-4xl mb-3">🛡️</div>
                <h4 class="font-bold text-xl text-gray-800">نصائح سريعة لحماية الخصوصية</h4>
            </div>
            
            <!-- Quick Tips Grid -->
            <div class="grid md:grid-cols-2 gap-4">
                <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h5 class="font-bold text-blue-800 mb-2 flex items-center">
                        <i class="fas fa-browser ml-2"></i>المتصفح
                    </h5>
                    <ul class="text-sm text-blue-700 space-y-1">
                        <li>• استخدم التصفح الخاص دائماً</li>
                        <li>• احذف الكوكيز بانتظام</li>
                        <li>• فعّل حظر التتبع</li>
                        <li>• استخدم إضافات مانع الإعلانات</li>
                    </ul>
                </div>
                
                <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h5 class="font-bold text-green-800 mb-2 flex items-center">
                        <i class="fas fa-shield-alt ml-2"></i>الحماية العامة
                    </h5>
                    <ul class="text-sm text-green-700 space-y-1">
                        <li>• استخدم VPN موثوق</li>
                        <li>• فعّل المصادقة الثنائية</li>
                        <li>• استخدم كلمات مرور قوية</li>
                        <li>• راجع إعدادات الخصوصية</li>
                    </ul>
                </div>
                
                <div class="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <h5 class="font-bold text-purple-800 mb-2 flex items-center">
                        <i class="fas fa-search ml-2"></i>البحث الآمن
                    </h5>
                    <ul class="text-sm text-purple-700 space-y-1">
                        <li>• استخدم DuckDuckGo</li>
                        <li>• تجنب Google للبحثات الحساسة</li>
                        <li>• امسح تاريخ البحث</li>
                        <li>• استخدم محركات بحث مشفرة</li>
                    </ul>
                </div>
                
                <div class="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <h5 class="font-bold text-orange-800 mb-2 flex items-center">
                        <i class="fas fa-mobile-alt ml-2"></i>الهاتف المحمول
                    </h5>
                    <ul class="text-sm text-orange-700 space-y-1">
                        <li>• راجع أذونات التطبيقات</li>
                        <li>• أوقف تتبع الموقع</li>
                        <li>• استخدم شبكات VPN</li>
                        <li>• احذف التطبيقات غير المستخدمة</li>
                    </ul>
                </div>
            </div>
            
            <!-- Advanced Tips -->
            <div class="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 p-4 rounded-lg">
                <h5 class="font-bold text-red-800 mb-3 flex items-center">
                    <i class="fas fa-exclamation-triangle ml-2"></i>نصائح متقدمة
                </h5>
                <div class="grid md:grid-cols-2 gap-3">
                    <div class="bg-white p-3 rounded border">
                        <p class="text-sm text-red-700"><strong>DNS آمن:</strong> استخدم 1.1.1.1 أو 8.8.8.8</p>
                    </div>
                    <div class="bg-white p-3 rounded border">
                        <p class="text-sm text-red-700"><strong>HTTPS دائماً:</strong> تأكد من وجود القفل الأخضر</p>
                    </div>
                    <div class="bg-white p-3 rounded border">
                        <p class="text-sm text-red-700"><strong>Wi-Fi العام:</strong> تجنبه أو استخدم VPN</p>
                    </div>
                    <div class="bg-white p-3 rounded border">
                        <p class="text-sm text-red-700"><strong>التحديثات:</strong> حدّث المتصفح والنظام دورياً</p>
                    </div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-3 justify-center">
                <button onclick="startPrivacyQuiz()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                    <i class="fas fa-question-circle ml-2"></i>اختبار المعرفة
                </button>
                <button onclick="showCookieSettings()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
                    <i class="fas fa-cog ml-2"></i>إعدادات المتصفح
                </button>
                <button onclick="exportUserData()" class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm">
                    <i class="fas fa-download ml-2"></i>تصدير البيانات
                </button>
            </div>
            
            <!-- Close Button -->
            <div class="text-center pt-4 border-t">
                <button onclick="closePrivacyModal()" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg">
                    <i class="fas fa-times ml-2"></i>إغلاق
                </button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Show notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    // Set colors based on type
    const colors = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        warning: 'bg-yellow-600 text-white',
        info: 'bg-blue-600 text-white'
    };
    
    notification.className += ` ${colors[type] || colors.info}`;
    
    // Set icon based on type
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${icons[type] || icons.info} ml-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add hover effects for buttons
document.addEventListener('DOMContentLoaded', function() {
    // Add click effects to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
});


// GPS Location functions
function requestLocation() {
    if (!navigator.geolocation) {
        showNotification('المتصفح لا يدعم تحديد الموقع', 'error');
        return;
    }
    
    showNotification('جاري طلب الموقع...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const coords = position.coords;
            
            document.getElementById('gpsLongitude').textContent = coords.longitude.toFixed(6);
            document.getElementById('gpsLatitude').textContent = coords.latitude.toFixed(6);
            document.getElementById('gpsAccuracy').textContent = `${Math.round(coords.accuracy)} متر`;
            document.getElementById('gpsAltitude').textContent = coords.altitude ? 
                `${Math.round(coords.altitude)} متر` : 'غير متاح';
            
            showNotification('تم الحصول على الموقع بنجاح!', 'success');
            
            // Show warning about precision
            setTimeout(() => {
                showNotification('⚠️ هذا موقعك الدقيق! احذر من مشاركته مع مواقع غير موثوقة', 'warning');
            }, 2000);
        },
        function(error) {
            let message = 'فشل في الحصول على الموقع: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message += 'تم رفض الإذن';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message += 'الموقع غير متاح';
                    break;
                case error.TIMEOUT:
                    message += 'انتهت مهلة الطلب';
                    break;
            }
            showNotification(message, 'error');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Camera access
async function requestCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: false 
        });
        
        document.getElementById('cameraStatus').innerHTML = 
            '<span class="text-green-600"><i class="fas fa-check-circle"></i> مُفعلة</span>';
        
        // Count video devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        document.getElementById('cameraCount').textContent = `${videoDevices.length} كاميرا`;
        
        showNotification('تم الوصول للكاميرا! تذكر إيقافها عند الانتهاء', 'success');
        
        // Stop the stream after 3 seconds for demo
        setTimeout(() => {
            stream.getTracks().forEach(track => track.stop());
            document.getElementById('cameraStatus').innerHTML = 
                '<span class="text-orange-600"><i class="fas fa-pause-circle"></i> تم إيقافها</span>';
        }, 3000);
        
    } catch (error) {
        document.getElementById('cameraStatus').innerHTML = 
            '<span class="text-red-600"><i class="fas fa-times-circle"></i> مرفوضة</span>';
        showNotification('تم رفض الوصول للكاميرا', 'error');
    }
}

// Microphone access
async function requestMicrophone() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: false, 
            audio: true 
        });
        
        document.getElementById('microphoneStatus').innerHTML = 
            '<span class="text-green-600"><i class="fas fa-check-circle"></i> مُفعل</span>';
        
        showNotification('تم الوصول للمايكروفون!', 'success');
        
        // Stop the stream after 3 seconds
        setTimeout(() => {
            stream.getTracks().forEach(track => track.stop());
            document.getElementById('microphoneStatus').innerHTML = 
                '<span class="text-orange-600"><i class="fas fa-pause-circle"></i> تم إيقافه</span>';
        }, 3000);
        
    } catch (error) {
        document.getElementById('microphoneStatus').innerHTML = 
            '<span class="text-red-600"><i class="fas fa-times-circle"></i> مرفوض</span>';
        showNotification('تم رفض الوصول للمايكروفون', 'error');
    }
}

// Notifications permission
async function requestNotifications() {
    if (!('Notification' in window)) {
        showNotification('المتصفح لا يدعم الإشعارات', 'error');
        return;
    }
    
    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            document.getElementById('notificationStatus').innerHTML = 
                '<span class="text-green-600"><i class="fas fa-check-circle"></i> مُفعلة</span>';
            
            // Send a test notification
            new Notification('تجربة إشعار', {
                body: 'هذا مثال على إشعار من الموقع',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>'
            });
            
            showNotification('تم تفعيل الإشعارات بنجاح!', 'success');
        } else {
            document.getElementById('notificationStatus').innerHTML = 
                '<span class="text-red-600"><i class="fas fa-times-circle"></i> مرفوضة</span>';
            showNotification('تم رفض إذن الإشعارات', 'error');
        }
    } catch (error) {
        showNotification('حدث خطأ في طلب الإشعارات', 'error');
    }
}

// Clipboard access
async function requestClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('clipboardStatus').innerHTML = 
            '<span class="text-green-600"><i class="fas fa-check-circle"></i> تم القراءة</span>';
        
        showNotification(`محتوى الحافظة: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`, 'info');
        
        // Show warning
        setTimeout(() => {
            showNotification('⚠️ المواقع يمكنها قراءة ما نسخته! كن حذراً', 'warning');
        }, 2000);
        
    } catch (error) {
        // Try to write to clipboard as fallback
        try {
            await navigator.clipboard.writeText('تجربة كتابة في الحافظة من الموقع');
            document.getElementById('clipboardStatus').innerHTML = 
                '<span class="text-yellow-600"><i class="fas fa-edit"></i> كتابة فقط</span>';
            showNotification('تم الكتابة في الحافظة (تحقق بالضغط على Ctrl+V)', 'info');
        } catch (writeError) {
            document.getElementById('clipboardStatus').innerHTML = 
                '<span class="text-red-600"><i class="fas fa-times-circle"></i> مرفوضة</span>';
            showNotification('تم رفض الوصول للحافظة', 'error');
        }
    }
}

// Motion and orientation sensors
function requestMotion() {
    // Check if DeviceMotionEvent exists
    if (!window.DeviceMotionEvent) {
        showNotification('الجهاز لا يدعم استشعار الحركة', 'error');
        return;
    }
    
    // For iOS 13+ devices, we need to request permission
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    startMotionTracking();
                } else {
                    showNotification('تم رفض إذن استشعار الحركة', 'error');
                }
            })
            .catch(error => {
                showNotification('خطأ في طلب إذن الحركة', 'error');
            });
    } else {
        // For other devices, start directly
        startMotionTracking();
    }
}

function startMotionTracking() {
    let motionCount = 0;
    const maxUpdates = 50; // Limit updates to avoid spam
    
    const handleMotion = (event) => {
        if (motionCount >= maxUpdates) {
            window.removeEventListener('devicemotion', handleMotion);
            showNotification('تم إيقاف تتبع الحركة (وصل للحد الأقصى)', 'info');
            return;
        }
        
        const acceleration = event.accelerationIncludingGravity;
        if (acceleration) {
            document.getElementById('accelerationX').textContent = 
                (acceleration.x || 0).toFixed(2) + ' m/s²';
            document.getElementById('accelerationY').textContent = 
                (acceleration.y || 0).toFixed(2) + ' m/s²';
        }
        
        motionCount++;
    };
    
    const handleOrientation = (event) => {
        const orientation = Math.round(event.alpha || 0);
        document.getElementById('orientation').textContent = orientation + '°';
    };
    
    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);
    
    showNotification('بدأ تتبع الحركة - حرك جهازك!', 'success');
    
    // Auto-stop after 10 seconds
    setTimeout(() => {
        window.removeEventListener('devicemotion', handleMotion);
        window.removeEventListener('deviceorientation', handleOrientation);
        showNotification('تم إيقاف تتبع الحركة تلقائياً', 'info');
    }, 10000);
}

// Battery API (if available)
async function requestBatteryInfo() {
    try {
        if ('getBattery' in navigator) {
            const battery = await navigator.getBattery();
            
            const batteryInfo = {
                level: Math.round(battery.level * 100) + '%',
                charging: battery.charging ? 'يشحن' : 'لا يشحن',
                chargingTime: battery.chargingTime === Infinity ? 'غير محدود' : 
                    Math.round(battery.chargingTime / 60) + ' دقيقة',
                dischargingTime: battery.dischargingTime === Infinity ? 'غير محدود' : 
                    Math.round(battery.dischargingTime / 60) + ' دقيقة'
            };
            
            showNotification(`البطارية: ${batteryInfo.level} - ${batteryInfo.charging}`, 'info');
            
            return batteryInfo;
        } else {
            showNotification('معلومات البطارية غير متاحة', 'warning');
            return null;
        }
    } catch (error) {
        showNotification('فشل في الحصول على معلومات البطارية', 'error');
        return null;
    }
}

// Network Information API
function getNetworkInfo() {
    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            return {
                effectiveType: connection.effectiveType || 'غير معروف',
                downlink: connection.downlink ? connection.downlink + ' Mbps' : 'غير معروف',
                rtt: connection.rtt ? connection.rtt + ' ms' : 'غير معروف',
                saveData: connection.saveData ? 'مُفعل' : 'غير مُفعل'
            };
        }
    }
    return null;
}

// Wake Lock API (keep screen awake)
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            const wakeLock = await navigator.wakeLock.request('screen');
            showNotification('تم منع إطفاء الشاشة', 'success');
            
            // Release after 10 seconds for demo
            setTimeout(() => {
                wakeLock.release();
                showNotification('تم إلغاء منع إطفاء الشاشة', 'info');
            }, 10000);
        } else {
            showNotification('Wake Lock غير مدعوم', 'warning');
        }
    } catch (error) {
        showNotification('فشل في طلب Wake Lock', 'error');
    }
}

// Update the showPrivacyTips function to include permission tips
function showPermissionPrivacyTips() {
    const modal = document.getElementById('privacyModal');
    const content = document.getElementById('privacyModalContent');
    
    content.innerHTML = `
        <div class="space-y-6">
            <div class="text-center">
                <div class="text-4xl mb-3">🔒</div>
                <h4 class="font-bold text-xl text-gray-800">نصائح حماية الأذونات</h4>
                <p class="text-gray-600 text-sm">كيف تتعامل مع طلبات الأذونات بحكمة</p>
            </div>
            
            <div class="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
                <h5 class="font-bold text-red-800 mb-3 flex items-center">
                    <i class="fas fa-exclamation-triangle ml-2"></i>
                    قاعدة ذهبية
                </h5>
                <p class="text-red-700 font-medium text-center">
                    لا توافق على أي إذن إلا إذا كنت تحتاجه فعلاً لاستخدام الموقع!
                </p>
            </div>
            
            <div class="grid md:grid-cols-2 gap-4">
                <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h5 class="font-bold text-green-800 mb-2">✅ آمن للموافقة</h5>
                    <ul class="text-sm text-green-700 space-y-1">
                        <li>• موقع خرائط يطلب الموقع</li>
                        <li>• موقع مؤتمر يطلب الكاميرا</li>
                        <li>• تطبيق تسجيل يطلب المايك</li>
                        <li>• موقع بنك يطلب الإشعارات</li>
                    </ul>
                </div>
                
                <div class="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h5 class="font-bold text-red-800 mb-2">❌ مشبوه - ارفض</h5>
                    <ul class="text-sm text-red-700 space-y-1">
                        <li>• موقع أخبار يطلب الكاميرا</li>
                        <li>• لعبة تطلب الموقع</li>
                        <li>• موقع مجهول يطلب المايك</li>
                        <li>• إعلان يطلب الإشعارات</li>
                    </ul>
                </div>
            </div>
            
            <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h5 class="font-bold text-blue-800 mb-3">💡 نصائح ذكية</h5>
                <ul class="text-sm text-blue-700 space-y-2">
                    <li class="flex items-start">
                        <i class="fas fa-lightbulb text-blue-500 ml-2 mt-0.5"></i>
                        راجع الأذونات الممنوحة في إعدادات المتصفح دورياً
                    </li>
                    <li class="flex items-start">
                        <i class="fas fa-lightbulb text-blue-500 ml-2 mt-0.5"></i>
                        يمكنك إلغاء الأذونات في أي وقت
                    </li>
                    <li class="flex items-start">
                        <i class="fas fa-lightbulb text-blue-500 ml-2 mt-0.5"></i>
                        استخدم التصفح الخاص للمواقع المشبوهة
                    </li>
                    <li class="flex items-start">
                        <i class="fas fa-lightbulb text-blue-500 ml-2 mt-0.5"></i>
                        أغلق الكاميرا والمايك عند عدم الحاجة
                    </li>
                </ul>
            </div>
            
            <div class="text-center">
                <button onclick="closePrivacyModal()" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg">
                    <i class="fas fa-times ml-2"></i>إغلاق
                </button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Add this to the existing refreshData function
function refreshPermissionData() {
    // Reset all permission statuses
    document.getElementById('gpsLongitude').textContent = 'غير مُطلب';
    document.getElementById('gpsLatitude').textContent = 'غير مُطلب';
    document.getElementById('gpsAccuracy').textContent = 'غير متاح';
    document.getElementById('gpsAltitude').textContent = 'غير متاح';
    document.getElementById('cameraStatus').textContent = 'غير مُطلبة';
    document.getElementById('microphoneStatus').textContent = 'غير مُطلب';
    document.getElementById('cameraCount').textContent = 'غير معروف';
    document.getElementById('notificationStatus').textContent = 'غير مُطلبة';
    document.getElementById('clipboardStatus').textContent = 'غير مُطلبة';
    document.getElementById('accelerationX').textContent = 'غير متاح';
    document.getElementById('accelerationY').textContent = 'غير متاح';
    document.getElementById('orientation').textContent = 'غير متاح';
    
    // Check current notification permission
    if ('Notification' in window) {
        const permission = Notification.permission;
        if (permission === 'granted') {
            document.getElementById('notificationStatus').innerHTML = 
                '<span class="text-green-600"><i class="fas fa-check-circle"></i> مُفعلة</span>';
        } else if (permission === 'denied') {
            document.getElementById('notificationStatus').innerHTML = 
                '<span class="text-red-600"><i class="fas fa-times-circle"></i> مرفوضة</span>';
        }
    }
    
    // Update network info if available
    const networkInfo = getNetworkInfo();
    if (networkInfo) {
        document.getElementById('connectionType').textContent = networkInfo.effectiveType;
        document.getElementById('connectionSpeed').textContent = networkInfo.downlink;
    }
    
    // Update battery info if available
    requestBatteryInfo();
}

// Add permission check button
function checkAllPermissions() {
    const permissions = [
        'geolocation',
        'notifications',
        'camera',
        'microphone',
        'accelerometer',
        'gyroscope'
    ];
    
    let resultsHTML = '<div class="space-y-4"><h4 class="font-bold text-lg">حالة الأذونات الحالية</h4>';
    
    // Check geolocation
    if ('geolocation' in navigator) {
        resultsHTML += `
            <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span>الموقع الجغرافي:</span>
                <span class="text-blue-600">متاح للطلب</span>
            </div>
        `;
    } else {
        resultsHTML += `
            <div class="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span>الموقع الجغرافي:</span>
                <span class="text-red-600">غير مدعوم</span>
            </div>
        `;
    }
    
    // Check notifications
    if ('Notification' in window) {
        const permission = Notification.permission;
        const statusColor = permission === 'granted' ? 'green' : 
                           permission === 'denied' ? 'red' : 'yellow';
        const statusText = permission === 'granted' ? 'مُفعلة' :
                          permission === 'denied' ? 'مرفوضة' : 'لم يُطلب';
        
        resultsHTML += `
            <div class="flex justify-between items-center p-3 bg-${statusColor}-50 rounded-lg">
                <span>الإشعارات:</span>
                <span class="text-${statusColor}-600">${statusText}</span>
            </div>
        `;
    }
    
    // Check media devices
    if ('mediaDevices' in navigator) {
        resultsHTML += `
            <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span>الكاميرا والمايك:</span>
                <span class="text-blue-600">متاحة للطلب</span>
            </div>
        `;
    } else {
        resultsHTML += `
            <div class="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span>الكاميرا والمايك:</span>
                <span class="text-red-600">غير مدعومة</span>
            </div>
        `;
    }
    
    // Check motion sensors
    if ('DeviceMotionEvent' in window) {
        resultsHTML += `
            <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span>استشعار الحركة:</span>
                <span class="text-blue-600">متاح للطلب</span>
            </div>
        `;
    } else {
        resultsHTML += `
            <div class="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span>استشعار الحركة:</span>
                <span class="text-red-600">غير مدعوم</span>
            </div>
        `;
    }
    
    resultsHTML += '</div>';
    
    // Show in modal
    const modal = document.getElementById('privacyModal');
    const content = document.getElementById('privacyModalContent');
    content.innerHTML = resultsHTML + `
        <div class="text-center mt-6">
            <button onclick="closePrivacyModal()" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg">
                إغلاق
            </button>
        </div>
    `;
    modal.classList.remove('hidden');
}

// Enhanced privacy score calculation including permissions
function calculatePrivacyScore() {
    let score = 0;
    let maxScore = 0;
    
    // Check basic privacy settings
    const basicChecks = document.querySelectorAll('.privacy-check');
    basicChecks.forEach(check => {
        maxScore += 10;
        if (check.checked) score += 10;
    });
    
    // Check permissions (bonus points for NOT granting unnecessary permissions)
    maxScore += 40; // 4 permission types × 10 points each
    
    // Notifications permission
    if ('Notification' in window) {
        if (Notification.permission === 'default') score += 10; // Good - not asked
        if (Notification.permission === 'denied') score += 10;  // Good - denied
        // granted = 0 points (depends on context)
    }
    
    // Check if user is using privacy-focused settings
    if (navigator.doNotTrack === '1') {
        score += 15;
        maxScore += 15;
    }
    
    // Check language settings (privacy-focused users often use English)
    if (navigator.language.includes('en')) {
        score += 5;
        maxScore += 5;
    }
    
    // Check for private browsing indicators
    if (window.localStorage.length === 0 && window.sessionStorage.length === 0) {
        score += 10; // Might be private browsing
        maxScore += 10;
    }
    
    const percentage = Math.round((score / maxScore) * 100);
    return Math.min(percentage, 100); // Cap at 100%
}

// Add demo warning for all permission functions
function showPermissionWarning(permissionType) {
    const warnings = {
        location: 'الموقع الجغرافي يكشف مكانك بدقة عالية - يمكن استخدامه لتتبعك',
        camera: 'الكاميرا تكشف وجهك ومحيطك - قد تُستخدم للتعرف عليك',
        microphone: 'المايكروفون يسمع محادثاتك - قد يُستخدم للتنصت',
        notifications: 'الإشعارات قد تُستخدم لإزعاجك بالإعلانات',
        motion: 'استشعار الحركة يكشف أنشطتك وحركاتك اليومية'
    };
    
    const warningText = warnings[permissionType] || 'هذا الإذن قد يؤثر على خصوصيتك';
    
    showNotification(`⚠️ ${warningText}`, 'warning');
}

// Enhanced refresh function
function refreshData() {
    // Show loading indicators for basic data
    const loadingElements = [
        'userIP', 'userCountry', 'userRegion', 'userCity', 'userISP',
        'userOS', 'userBrowser', 'deviceType', 'screenResolution', 
        'userLanguage', 'userTimezone', 'visitTime', 'cookieSupport',
        'localStorageSupport', 'connectionType', 'connectionSpeed', 'referrerPage'
    ];
    
    loadingElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحديث...';
        }
    });
    
    // Reload all data after a short delay
    setTimeout(() => {
        loadUserData();
        loadDeviceInfo();
        loadBrowserInfo();
        loadNetworkInfo();
        refreshPermissionData();
        
        // Update visit time
        document.getElementById('visitTime').textContent = new Date().toLocaleString('ar-SA');
        
        // Update privacy score
        const newScore = calculatePrivacyScore();
        document.getElementById('privacyScore').textContent = newScore + '%';
        
        showNotification('تم تحديث جميع البيانات بنجاح!', 'success');
    }, 1500);
}

// Initialize permission data when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set initial permission statuses
    refreshPermissionData();
    
    // Add event listener for privacy checkboxes
    const privacyChecks = document.querySelectorAll('.privacy-check');
    privacyChecks.forEach(check => {
        check.addEventListener('change', function() {
            const newScore = calculatePrivacyScore();
            document.getElementById('privacyScore').textContent = newScore + '%';
            
            // Show tips based on score
            if (newScore >= 80) {
                document.getElementById('privacyScore').className = 'text-3xl font-bold mb-2 text-green-600';
            } else if (newScore >= 60) {
                document.getElementById('privacyScore').className = 'text-3xl font-bold mb-2 text-yellow-600';
            } else {
                document.getElementById('privacyScore').className = 'text-3xl font-bold mb-2 text-red-600';
            }
        });
    });
    
    console.log('🔒 Permission system initialized');
});

// Add keyboard shortcuts for quick permission requests
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey) {
        switch(e.key) {
            case 'L': // Location
                e.preventDefault();
                requestLocation();
                break;
            case 'C': // Camera
                e.preventDefault();
                requestCamera();
                break;
            case 'M': // Microphone
                e.preventDefault();
                requestMicrophone();
                break;
            case 'N': // Notifications
                e.preventDefault();
                requestNotifications();
                break;
        }
    }
});

// Add educational console messages about permissions
console.group('🔐 Educational Privacy Warnings');
console.warn('📍 Location: Can track your exact position');
console.warn('📹 Camera: Can see your face and surroundings'); 
console.warn('🎤 Microphone: Can hear your conversations');
console.warn('🔔 Notifications: Can spam you with ads');
console.warn('📱 Motion: Can track your daily activities');
console.groupEnd();

console.info('💡 Tip: Only grant permissions when absolutely necessary!');

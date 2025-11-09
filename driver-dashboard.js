// Driver Dashboard JavaScript
// Supabase Configuration - Replace with your actual Supabase credentials
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Driver Dashboard System
let currentDriver = null;
let currentOrder = null;
let orders = [];
let currentTab = 'active';
let map = null;
let driverMarker = null;
let orderMarkers = [];
let locationWatchId = null;
let realtimeSubscription = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkDriverSession();
    initializePhoneFormatting();
});

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Status toggle
    document.getElementById('statusToggle').addEventListener('click', toggleDriverStatus);
    
    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Modal controls
    document.getElementById('closeOrderModal').addEventListener('click', closeOrderModal);
    
    // Close modal on backdrop click
    document.getElementById('orderModal').addEventListener('click', function(e) {
        if (e.target === this) closeOrderModal();
    });
}

// Initialize phone number formatting
function initializePhoneFormatting() {
    const phoneInput = document.getElementById('driverPhone');
    phoneInput.addEventListener('input', function(e) {
        const input = e.target.value.replace(/\D/g, '');
        const formatted = formatPhoneNumber(input);
        e.target.value = formatted;
    });
}

// Format phone number for display
function formatPhoneNumber(value) {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
}

// Check if driver is already logged in
function checkDriverSession() {
    const savedDriver = localStorage.getItem('foodExpress_currentDriver');
    if (savedDriver) {
        try {
            currentDriver = JSON.parse(savedDriver);
            showDashboard();
        } catch (e) {
            console.error('Error parsing saved driver data:', e);
            localStorage.removeItem('foodExpress_currentDriver');
        }
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const phoneInput = document.getElementById('driverPhone');
    const phone = phoneInput.value.replace(/\D/g, ''); // Remove formatting for DB search
    
    if (phone.length < 10) {
        showLoginError('Please enter a valid phone number');
        return;
    }
    
    try {
        // Query driver from Supabase
        const { data, error } = await supabase
            .from('drivers')
            .select('*')
            .eq('phone', phone)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                showLoginError('Driver not found. Please register first.');
                return;
            }
            throw error;
        }
        
        if (data) {
            currentDriver = data;
            localStorage.setItem('foodExpress_currentDriver', JSON.stringify(currentDriver));
            showDashboard();
        } else {
            showLoginError('Driver not found. Please register first.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('Login failed. Please try again.');
    }
}

// Show login error
function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    
    // Animate error
    anime({
        targets: errorDiv,
        scale: [0.8, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
    
    // Shake phone input
    anime({
        targets: '#driverPhone',
        translateX: [-10, 10, -10, 10, 0],
        duration: 400,
        easing: 'easeInOutQuart'
    });
}

// Show dashboard
function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    // Update driver info
    updateDriverInfo();
    
    // Initialize real-time updates
    initializeRealtimeUpdates();
    
    // Load initial data
    loadTabContent();
    
    // Animate dashboard
    anime({
        targets: '#dashboard',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: 'easeOutQuart'
    });
}

// Update driver information
function updateDriverInfo() {
    if (!currentDriver) return;
    
    document.getElementById('driverName').textContent = currentDriver.name || 'Driver';
    document.getElementById('driverStatus').textContent = currentDriver.status || 'Offline';
    document.getElementById('driverRating').textContent = (currentDriver.rating || 5.0).toFixed(1);
    document.getElementById('totalDeliveries').textContent = currentDriver.total_deliveries || 0;
    
    // Update status toggle
    updateStatusToggle();
}

// Update status toggle
function updateStatusToggle() {
    const toggleBtn = document.getElementById('statusToggle');
    const indicator = document.getElementById('statusIndicator');
    
    if (!toggleBtn || !indicator) return;
    
    if (currentDriver.status === 'online') {
        toggleBtn.textContent = 'Online';
        toggleBtn.classList.remove('bg-gray-300', 'text-gray-700');
        toggleBtn.classList.add('bg-green-500', 'text-white');
        indicator.classList.remove('bg-gray-500');
        indicator.classList.add('bg-green-500', 'pulse-dot');
        
        // Start location tracking when online
        startLocationTracking();
    } else {
        toggleBtn.textContent = 'Offline';
        toggleBtn.classList.remove('bg-green-500', 'text-white');
        toggleBtn.classList.add('bg-gray-300', 'text-gray-700');
        indicator.classList.remove('bg-green-500', 'pulse-dot');
        indicator.classList.add('bg-gray-500');
        
        // Stop location tracking when offline
        stopLocationTracking();
    }
}

// Toggle driver status
async function toggleDriverStatus() {
    if (!currentDriver) return;
    
    try {
        const newStatus = currentDriver.status === 'online' ? 'offline' : 'online';
        
        // Update in Supabase
        const { data, error } = await supabase
            .from('drivers')
            .update({ 
                status: newStatus,
                last_online: new Date().toISOString()
            })
            .eq('id', currentDriver.id)
            .select()
            .single();
        
        if (error) throw error;
        
        // Update local state
        currentDriver = data;
        localStorage.setItem('foodExpress_currentDriver', JSON.stringify(currentDriver));
        
        // Update UI
        updateDriverInfo();
        
        // Show notification
        showNotification(`You are now ${newStatus}`, 'success');
        
    } catch (error) {
        console.error('Error updating driver status:', error);
        showNotification('Error updating status', 'error');
    }
}

// Start location tracking
function startLocationTracking() {
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by this browser', 'error');
        return;
    }
    
    // Request permission first
    navigator.geolocation.getCurrentPosition(
        (position) => {
            // Permission granted, start watching
            locationWatchId = navigator.geolocation.watchPosition(
                updateDriverLocation,
                handleLocationError,
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
            updateDriverLocation(position); // Initial update
        },
        handleLocationError,
        { timeout: 10000 }
    );
}

// Stop location tracking
function stopLocationTracking() {
    if (locationWatchId) {
        navigator.geolocation.clearWatch(locationWatchId);
        locationWatchId = null;
    }
}

// Update driver location in database
async function updateDriverLocation(position) {
    if (!currentDriver) return;
    
    const { latitude, longitude } = position.coords;
    
    try {
        const { error } = await supabase
            .from('drivers')
            .update({
                latitude: latitude,
                longitude: longitude,
                last_location_update: new Date().toISOString()
            })
            .eq('id', currentDriver.id);
        
        if (error) throw error;
        
        // Update map if available
        updateDriverOnMap(latitude, longitude);
        
    } catch (error) {
        console.error('Error updating driver location:', error);
    }
}

// Handle location error
function handleLocationError(error) {
    console.error('Location error:', error);
    let message = 'Unknown error occurred';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'Location access denied. Please enable location services.';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable.';
            break;
        case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
    }
    
    showNotification(message, 'error');
}

// Initialize real-time updates
function initializeRealtimeUpdates() {
    if (realtimeSubscription) {
        supabase.removeChannel(realtimeSubscription);
    }
    
    // Subscribe to orders changes
    realtimeSubscription = supabase
        .channel('orders-channel')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'orders'
            },
            (payload) => {
                console.log('Order update received:', payload);
                handleOrderUpdate(payload);
            }
        )
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('Real-time updates enabled');
            } else if (status === 'CHANNEL_ERROR') {
                console.error('Real-time subscription error');
            }
        });
}

// Handle order updates
function handleOrderUpdate(payload) {
    // Refresh orders based on current tab
    loadTabContent();
    
    // Show notification for new orders
    if (payload.eventType === 'INSERT' && payload.new.status === 'pending') {
        if (currentDriver && currentDriver.status === 'online') {
            showNewOrderNotification(payload.new);
        }
    }
}

// Show new order notification
function showNewOrderNotification(order) {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Delivery Order!', {
            body: `Order from ${order.restaurant_name} - $${order.total}`,
            icon: '/favicon.ico',
            tag: 'new-order'
        });
    }
    
    // In-app notification
    showNotification(`New order available from ${order.restaurant_name}`, 'info', 5000);
}

// Switch tab
function switchTab(tab) {
    currentTab = tab;
    
    // Update active tab button
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Load tab content
    loadTabContent();
}

// Load tab content
async function loadTabContent() {
    const container = document.getElementById('tabContent');
    if (!container) return;
    
    let content = '';
    
    try {
        switch (currentTab) {
            case 'active':
                content = await generateActiveOrdersContent();
                break;
            case 'available':
                content = await generateAvailableOrdersContent();
                break;
            case 'earnings':
                content = await generateEarningsContent();
                break;
            case 'history':
                content = await generateHistoryContent();
                break;
            default:
                content = await generateActiveOrdersContent();
        }
    } catch (error) {
        console.error('Error loading tab content:', error);
        content = '<div class="text-center py-8 text-red-500">Error loading content</div>';
    }
    
    container.innerHTML = content;
    
    // Animate content
    anime({
        targets: '#tabContent',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 400,
        easing: 'easeOutQuart'
    });
}

// Generate active orders content
async function generateActiveOrdersContent() {
    if (!currentDriver) return '<div class="text-center py-8">Please log in</div>';
    
    try {
        // Get orders assigned to current driver
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('driver_id', currentDriver.id)
            .in('status', ['assigned', 'picked_up', 'on_the_way'])
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const activeOrders = data || [];
        
        let html = `
            <div class="driver-card rounded-2xl p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4" style="font-family: 'Playfair Display', serif;">
                    Active Deliveries (${activeOrders.length})
                </h3>
        `;
        
        if (activeOrders.length === 0) {
            html += `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">📦</div>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No Active Orders</h3>
                    <p class="text-gray-500">You don't have any active deliveries right now</p>
                </div>
            `;
        } else {
            html += `<div class="space-y-4">`;
            
            activeOrders.forEach(order => {
                const statusClass = getStatusClass(order.status);
                const orderTime = new Date(order.created_at).toLocaleTimeString();
                
                html += `
                    <div class="order-card rounded-2xl p-6 cursor-pointer" onclick="openOrderModal('${order.id}')">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h4 class="font-bold text-gray-800 text-lg">${order.restaurant_name}</h4>
                                <p class="text-sm text-gray-600">Order #${order.id.slice(-6)}</p>
                            </div>
                            <div class="text-right">
                                <div class="status-badge ${statusClass} mb-1">${formatStatus(order.status)}</div>
                                <p class="text-xs text-gray-500">${orderTime}</p>
                            </div>
                        </div>
                        
                        <div class="space-y-2 text-sm mb-4">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Customer:</span>
                                <span class="font-semibold">${order.customer_name || 'Guest'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Total:</span>
                                <span class="font-semibold text-green-600">$${order.total}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Delivery Fee:</span>
                                <span class="font-semibold">$${order.delivery_fee || '4.99'}</span>
                            </div>
                        </div>
                        
                        <div class="flex gap-2">
                            <button onclick="event.stopPropagation(); updateOrderStatus('${order.id}', 'picked_up')" 
                                    class="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all ${order.status !== 'assigned' ? 'hidden' : ''}">
                                Mark as Picked Up
                            </button>
                            <button onclick="event.stopPropagation(); updateOrderStatus('${order.id}', 'on_the_way')" 
                                    class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all ${order.status !== 'picked_up' ? 'hidden' : ''}">
                                Start Delivery
                            </button>
                            <button onclick="event.stopPropagation(); updateOrderStatus('${order.id}', 'delivered')" 
                                    class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all ${order.status !== 'on_the_way' ? 'hidden' : ''}">
                                Mark Delivered
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        html += `</div>`;
        return html;
        
    } catch (error) {
        console.error('Error loading active orders:', error);
        return '<div class="text-center py-8 text-red-500">Error loading active orders</div>';
    }
}

// Generate available orders content
async function generateAvailableOrdersContent() {
    if (!currentDriver) return '<div class="text-center py-8">Please log in</div>';
    
    try {
        // Get pending orders (not assigned to any driver)
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .is('driver_id', null)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const availableOrders = data || [];
        
        let html = `
            <div class="driver-card rounded-2xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800" style="font-family: 'Playfair Display', serif;">
                        Available Orders (${availableOrders.length})
                    </h3>
                    <div class="relative">
                        <span class="text-2xl">🔔</span>
                        ${availableOrders.length > 0 ? `<div class="notification-badge">${availableOrders.length}</div>` : ''}
                    </div>
                </div>
        `;
        
        if (availableOrders.length === 0) {
            html += `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">📦</div>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No Available Orders</h3>
                    <p class="text-gray-500">New orders will appear here when customers place them</p>
                </div>
            `;
        } else {
            html += `<div class="space-y-4">`;
            
            availableOrders.forEach(order => {
                const orderTime = new Date(order.created_at).toLocaleTimeString();
                const distance = calculateDistance(
                    currentDriver.latitude, 
                    currentDriver.longitude,
                    order.restaurant_lat,
                    order.restaurant_lng
                );
                
                html += `
                    <div class="order-card rounded-2xl p-6">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h4 class="font-bold text-gray-800 text-lg">${order.restaurant_name}</h4>
                                <p class="text-sm text-gray-600">Order #${order.id.slice(-6)}</p>
                            </div>
                            <div class="text-right">
                                <div class="status-badge status-pending mb-1">Available</div>
                                <p class="text-xs text-gray-500">${orderTime}</p>
                            </div>
                        </div>
                        
                        <div class="space-y-2 text-sm mb-4">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Distance:</span>
                                <span class="font-semibold">${distance ? distance.toFixed(1) + ' km' : 'Unknown'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Total:</span>
                                <span class="font-semibold text-green-600">$${order.total}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Delivery Fee:</span>
                                <span class="font-semibold">$${order.delivery_fee || '4.99'}</span>
                            </div>
                        </div>
                        
                        <div class="flex gap-2">
                            <button onclick="viewOrderDetails('${order.id}')" 
                                    class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                                View Details
                            </button>
                            <button onclick="acceptOrder('${order.id}')" 
                                    class="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-teal-600 hover:to-teal-700 transition-all">
                                Accept Order
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        html += `</div>`;
        return html;
        
    } catch (error) {
        console.error('Error loading available orders:', error);
        return '<div class="text-center py-8 text-red-500">Error loading available orders</div>';
    }
}

// Generate earnings content
async function generateEarningsContent() {
    if (!currentDriver) return '<div class="text-center py-8">Please log in</div>';
    
    try {
        // Get today's date range
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        
        // Get today's completed orders
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('driver_id', currentDriver.id)
            .eq('status', 'delivered')
            .gte('updated_at', startOfToday.toISOString())
            .lt('updated_at', endOfToday.toISOString())
            .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        const todayOrders = data || [];
        const todayEarnings = todayOrders.reduce((sum, order) => sum + (parseFloat(order.delivery_fee) || 4.99), 0);
        
        // Update today's stats in the UI
        const todayDeliveriesEl = document.getElementById('todayDeliveries');
        const todayEarningsEl = document.getElementById('todayEarnings');
        if (todayDeliveriesEl) todayDeliveriesEl.textContent = todayOrders.length;
        if (todayEarningsEl) todayEarningsEl.textContent = `$${todayEarnings.toFixed(2)}`;
        
        let html = `
            <div class="driver-card rounded-2xl p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-6" style="font-family: 'Playfair Display', serif;">
                    Earnings Summary
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div class="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-2xl p-6">
                        <h4 class="text-lg font-semibold mb-2">Today's Earnings</h4>
                        <p class="text-3xl font-bold">$${todayEarnings.toFixed(2)}</p>
                        <p class="text-teal-100 text-sm">${todayOrders.length} deliveries</p>
                    </div>
                    
                    <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6">
                        <h4 class="text-lg font-semibold mb-2">Total Earnings</h4>
                        <p class="text-3xl font-bold">$${(currentDriver.total_earnings || 0).toFixed(2)}</p>
                        <p class="text-blue-100 text-sm">${currentDriver.total_deliveries || 0} total deliveries</p>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h4 class="font-semibold text-gray-800 mb-4">Today's Deliveries</h4>
        `;
        
        if (todayOrders.length === 0) {
            html += `
                <div class="text-center py-8">
                    <div class="text-4xl mb-2">💰</div>
                    <p class="text-gray-500">No deliveries today yet</p>
                </div>
            `;
        } else {
            html += `<div class="space-y-3">`;
            
            todayOrders.forEach(order => {
                const deliveryTime = new Date(order.updated_at).toLocaleTimeString();
                const earnings = parseFloat(order.delivery_fee) || 4.99;
                
                html += `
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p class="font-medium text-gray-800">${order.restaurant_name}</p>
                            <p class="text-sm text-gray-600">${deliveryTime}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold text-green-600">+$${earnings.toFixed(2)}</p>
                            <p class="text-xs text-gray-500">Order #${order.id.slice(-6)}</p>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        html += `
                </div>
                
                <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                    <h4 class="font-semibold text-yellow-800 mb-2">Payment Information</h4>
                    <p class="text-sm text-yellow-700">
                        Earnings are automatically transferred to your registered payment method every Friday.
                        Contact support for any payment-related questions.
                    </p>
                </div>
            </div>
        `;
        
        return html;
        
    } catch (error) {
        console.error('Error loading earnings:', error);
        return '<div class="text-center py-8 text-red-500">Error loading earnings</div>';
    }
}

// Generate history content
async function generateHistoryContent() {
    if (!currentDriver) return '<div class="text-center py-8">Please log in</div>';
    
    try {
        // Get completed orders (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('driver_id', currentDriver.id)
            .eq('status', 'delivered')
            .gte('updated_at', thirtyDaysAgo.toISOString())
            .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        const historyOrders = data || [];
        
        let html = `
            <div class="driver-card rounded-2xl p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-6" style="font-family: 'Playfair Display', serif;">
                    Delivery History (Last 30 Days)
                </h3>
        `;
        
        if (historyOrders.length === 0) {
            html += `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">📋</div>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No Delivery History</h3>
                    <p class="text-gray-500">Your completed deliveries will appear here</p>
                </div>
            `;
        } else {
            html += `<div class="space-y-4">`;
            
            historyOrders.forEach(order => {
                const deliveryDate = new Date(order.updated_at).toLocaleDateString();
                const deliveryTime = new Date(order.updated_at).toLocaleTimeString();
                const earnings = parseFloat(order.delivery_fee) || 4.99;
                
                html += `
                    <div class="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h4 class="font-bold text-gray-800">${order.restaurant_name}</h4>
                                <p class="text-sm text-gray-600">Order #${order.id.slice(-6)}</p>
                            </div>
                            <div class="text-right">
                                <p class="font-semibold text-green-600">$${earnings.toFixed(2)}</p>
                                <p class="text-xs text-gray-500">${deliveryDate}</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p class="text-gray-600">Customer:</p>
                                <p class="font-medium">${order.customer_name || 'Guest'}</p>
                            </div>
                            <div>
                                <p class="text-gray-600">Delivery Time:</p>
                                <p class="font-medium">${deliveryTime}</p>
                            </div>
                        </div>
                        
                        ${order.customer_rating ? `
                        <div class="mt-3 flex items-center">
                            <span class="text-yellow-500 mr-1">⭐</span>
                            <span class="text-sm text-gray-700">Customer rating: ${order.customer_rating}/5</span>
                        </div>
                        ` : ''}
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        html += `</div>`;
        return html;
        
    } catch (error) {
        console.error('Error loading history:', error);
        return '<div class="text-center py-8 text-red-500">Error loading history</div>';
    }
}

// Open order modal
async function openOrderModal(orderId) {
    try {
        // Get order details
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
        
        if (error) throw error;
        
        currentOrder = data;
        
        const modalTitle = document.getElementById('modalOrderTitle');
        if (modalTitle) {
            modalTitle.textContent = `Order #${orderId.slice(-6)}`;
        }
        
        const content = document.getElementById('orderDetailsContent');
        if (!content) return;
        
        const orderTime = new Date(currentOrder.created_at).toLocaleString();
        
        // Parse items safely
        let items = [];
        let itemCount = 0;
        try {
            if (currentOrder.items) {
                items = typeof currentOrder.items === 'string' ? 
                    JSON.parse(currentOrder.items) : currentOrder.items;
                itemCount = items.length;
            }
        } catch (e) {
            console.error('Error parsing order items:', e);
        }
        
        let itemsHtml = '';
        if (items.length > 0) {
            itemsHtml = items.map(item => `
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                        <span class="font-medium">${item.name || 'Unknown Item'}</span>
                        <span class="text-sm text-gray-600 ml-2">×${item.quantity || 1}</span>
                    </div>
                    <span class="font-semibold">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                </div>
            `).join('');
        } else {
            itemsHtml = '<p class="text-gray-500">No items information available</p>';
        }
        
        content.innerHTML = `
            <div class="mb-6">
                <h4 class="font-bold text-lg text-gray-800 mb-2">${currentOrder.restaurant_name || 'Unknown Restaurant'}</h4>
                <p class="text-sm text-gray-600">${orderTime}</p>
                <div class="mt-2">
                    <span class="status-badge ${getStatusClass(currentOrder.status)}">${formatStatus(currentOrder.status)}</span>
                </div>
            </div>
            
            <div class="mb-6">
                <h5 class="font-semibold text-gray-800 mb-3">Order Items (${itemCount})</h5>
                <div class="space-y-2">
                    ${itemsHtml}
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <h5 class="font-semibold text-gray-800 mb-2">Pickup Location</h5>
                    <p class="text-sm text-gray-600">${currentOrder.restaurant_address || 'Not specified'}</p>
                </div>
                <div>
                    <h5 class="font-semibold text-gray-800 mb-2">Delivery Location</h5>
                    <p class="text-sm text-gray-600">${currentOrder.delivery_address || 'Not specified'}</p>
                </div>
            </div>
            
            ${currentOrder.special_instructions ? `
            <div class="mb-6">
                <h5 class="font-semibold text-gray-800 mb-2">Special Instructions</h5>
                <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">${currentOrder.special_instructions}</p>
            </div>
            ` : ''}
            
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>$${currentOrder.subtotal || '0.00'}</span>
                </div>
                <div class="flex justify-between mb-2">
                    <span>Delivery Fee:</span>
                    <span>$${currentOrder.delivery_fee || '4.99'}</span>
                </div>
                <div class="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span class="text-green-600">$${currentOrder.total || '0.00'}</span>
                </div>
            </div>
        `;
        
        // Set up action buttons based on order status
        const actions = document.getElementById('orderActions');
        if (actions) {
            actions.innerHTML = '';
            
            if (currentOrder.status === 'assigned') {
                actions.innerHTML = `
                    <button onclick="updateOrderStatus('${currentOrder.id}', 'picked_up')" 
                            class="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all">
                        Mark as Picked Up
                    </button>
                `;
            } else if (currentOrder.status === 'picked_up') {
                actions.innerHTML = `
                    <button onclick="updateOrderStatus('${currentOrder.id}', 'on_the_way')" 
                            class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all">
                        Start Delivery
                    </button>
                `;
            } else if (currentOrder.status === 'on_the_way') {
                actions.innerHTML = `
                    <button onclick="updateOrderStatus('${currentOrder.id}', 'delivered')" 
                            class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all">
                        Mark Delivered
                    </button>
                `;
            }
        }
        
        const modal = document.getElementById('orderModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        
        // Animate modal
        anime({
            targets: '#orderModal .bg-white',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });
        
    } catch (error) {
        console.error('Error opening order modal:', error);
        showNotification('Error loading order details', 'error');
    }
}

// Close order modal
function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (!modal) return;
    
    anime({
        targets: '#orderModal .bg-white',
        scale: [1, 0.8],
        opacity: [1, 0],
        duration: 200,
        easing: 'easeInQuart',
        complete: () => {
            modal.classList.add('hidden');
            currentOrder = null;
        }
    });
}

// View order details
function viewOrderDetails(orderId) {
    openOrderModal(orderId);
}

// Accept order
async function acceptOrder(orderId) {
    if (!currentDriver) {
        showNotification('Please log in first', 'error');
        return;
    }
    
    try {
        // Update order with driver assignment
        const { data, error } = await supabase
            .from('orders')
            .update({
                driver_id: currentDriver.id,
                driver_name: currentDriver.name,
                status: 'assigned',
                assigned_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .select()
            .single();
        
        if (error) throw error;
        
        showNotification('Order accepted successfully!', 'success');
        
        // Switch to active orders tab
        switchTab('active');
        
    } catch (error) {
        console.error('Error accepting order:', error);
        showNotification('Error accepting order', 'error');
    }
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
    try {
        const updateData = {
            status: newStatus,
            updated_at: new Date().toISOString()
        };
        
        // Add specific timestamps based on status
        if (newStatus === 'picked_up') {
            updateData.picked_up_at = new Date().toISOString();
        } else if (newStatus === 'on_the_way') {
            updateData.delivery_started_at = new Date().toISOString();
        } else if (newStatus === 'delivered') {
            updateData.delivered_at = new Date().toISOString();
            
            // Update driver stats
            await updateDriverStats();
        }
        
        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)
            .select()
            .single();
        
        if (error) throw error;
        
        showNotification(`Order status updated to ${formatStatus(newStatus)}`, 'success');
        
        // Close modal and refresh content
        closeOrderModal();
        loadTabContent();
        
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Error updating order status', 'error');
    }
}

// Update driver stats
async function updateDriverStats() {
    if (!currentDriver) return;
    
    try {
        // Get driver's completed orders count
        const { count, error } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('driver_id', currentDriver.id)
            .eq('status', 'delivered');
        
        if (error) throw error;
        
        // Calculate total earnings
        const { data: earningsData, error: earningsError } = await supabase
            .from('orders')
            .select('delivery_fee')
            .eq('driver_id', currentDriver.id)
            .eq('status', 'delivered');
        
        if (earningsError) throw earningsError;
        
        const totalEarnings = earningsData.reduce((sum, order) => 
            sum + (parseFloat(order.delivery_fee) || 4.99), 0
        );
        
        // Update driver record
        const { error: updateError } = await supabase
            .from('drivers')
            .update({
                total_deliveries: count,
                total_earnings: totalEarnings
            })
            .eq('id', currentDriver.id);
        
        if (updateError) throw updateError;
        
        // Update local driver data
        currentDriver.total_deliveries = count;
        currentDriver.total_earnings = totalEarnings;
        localStorage.setItem('foodExpress_currentDriver', JSON.stringify(currentDriver));
        
        // Update UI
        updateDriverInfo();
        
    } catch (error) {
        console.error('Error updating driver stats:', error);
    }
}

// Update driver on map
function updateDriverOnMap(lat, lng) {
    if (driverMarker) {
        driverMarker.setLatLng([lat, lng]);
    } else if (map) {
        driverMarker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup('Your Location')
            .openPopup();
    }
}

// Calculate distance between two coordinates (in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Get status class for styling
function getStatusClass(status) {
    if (!status) return 'status-pending';
    
    switch(status) {
        case 'pending': return 'status-pending';
        case 'assigned': return 'status-assigned';
        case 'picked_up': return 'status-picked';
        case 'on_the_way': return 'status-delivering';
        case 'delivered': return 'status-delivered';
        default: return 'status-pending';
    }
}

// Format status for display
function formatStatus(status) {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type] || 'bg-blue-500'} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    anime({
        targets: notification,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
    
    setTimeout(() => {
        anime({
            targets: notification,
            translateX: [0, 300],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInQuart',
            complete: () => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }
        });
    }, duration);
}

// Handle logout
function handleLogout() {
    // Stop real-time updates
    if (realtimeSubscription) {
        supabase.removeChannel(realtimeSubscription);
        realtimeSubscription = null;
    }
    
    // Stop location tracking
    stopLocationTracking();
    
    // Clear session
    localStorage.removeItem('foodExpress_currentDriver');
    
    // Show login screen
    const dashboard = document.getElementById('dashboard');
    const loginScreen = document.getElementById('loginScreen');
    if (dashboard) dashboard.classList.add('hidden');
    if (loginScreen) loginScreen.classList.remove('hidden');
    
    const phoneInput = document.getElementById('driverPhone');
    const errorDiv = document.getElementById('loginError');
    if (phoneInput) phoneInput.value = '';
    if (errorDiv) errorDiv.classList.add('hidden');
    
    // Reset state
    currentDriver = null;
    currentOrder = null;
    orders = [];
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
    });
}

// Export functions for global access
window.openOrderModal = openOrderModal;
window.viewOrderDetails = viewOrderDetails;
window.acceptOrder = acceptOrder;
window.updateOrderStatus = updateOrderStatus;

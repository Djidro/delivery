// FoodExpress App - Main JavaScript File

// Global App State
let appState = {
    restaurants: [],
    customers: [],
    drivers: [],
    orders: [],
    currentOrder: {},
    cart: []
};

// Sample Restaurant Data
const sampleRestaurants = [
    {
        id: 'rest_001',
        name: "Mario's Italian Kitchen",
        cuisine: 'italian',
        rating: 4.8,
        deliveryTime: '25-35 min',
        phone: '(555) 123-4567',
        address: '123 Main St, Downtown',
        image: 'https://kimi-web-img.moonshot.cn/img/media.istockphoto.com/7eefccec47a86a7830f668ff4eeb1d7c9c13edf7.jpg',
        featured: true,
        coordinates: {lat: 40.7128, lng: -74.0060},
        menu: [
            {id: 'item_001', name: 'Margherita Pizza', price: 18.99, description: 'Fresh mozzarella, basil, tomato sauce'},
            {id: 'item_002', name: 'Spaghetti Carbonara', price: 16.99, description: 'Creamy sauce with pancetta and parmesan'},
            {id: 'item_003', name: 'Caesar Salad', price: 12.99, description: 'Crisp romaine, parmesan, croutons'},
            {id: 'item_004', name: 'Tiramisu', price: 8.99, description: 'Classic Italian dessert'}
        ]
    },
    {
        id: 'rest_002',
        name: 'Dragon Palace',
        cuisine: 'asian',
        rating: 4.6,
        deliveryTime: '20-30 min',
        phone: '(555) 234-5678',
        address: '456 Oak Ave, Chinatown',
        image: 'https://kimi-web-img.moonshot.cn/img/asian-recipe.com/71fadd7e553333a55260b356e5aeaa53b26b4474.jpg',
        featured: true,
        coordinates: {lat: 40.7158, lng: -74.0020},
        menu: [
            {id: 'item_005', name: 'Kung Pao Chicken', price: 15.99, description: 'Spicy stir-fry with peanuts and vegetables'},
            {id: 'item_006', name: 'Pad Thai', price: 14.99, description: 'Traditional Thai noodles with shrimp'},
            {id: 'item_007', name: 'Spring Rolls', price: 7.99, description: 'Crispy vegetable rolls with sweet chili sauce'},
            {id: 'item_008', name: 'Hot & Sour Soup', price: 6.99, description: 'Traditional Chinese soup'}
        ]
    },
    {
        id: 'rest_003',
        name: 'El Mariachi',
        cuisine: 'mexican',
        rating: 4.7,
        deliveryTime: '30-40 min',
        phone: '(555) 345-6789',
        address: '789 Pine St, Midtown',
        image: 'https://kimi-web-img.moonshot.cn/img/expertphotography.b-cdn.net/fd42ec64be8fe9878115fdd2261fff8459fbad03.jpg',
        featured: false,
        coordinates: {lat: 40.7188, lng: -74.0100},
        menu: [
            {id: 'item_009', name: 'Chicken Enchiladas', price: 13.99, description: 'Rolled tortillas with spicy chicken'},
            {id: 'item_010', name: 'Beef Tacos', price: 11.99, description: 'Three soft tacos with seasoned beef'},
            {id: 'item_011', name: 'Guacamole & Chips', price: 9.99, description: 'Fresh avocado dip with tortilla chips'},
            {id: 'item_012', name: 'Churros', price: 7.99, description: 'Fried dough with cinnamon sugar'}
        ]
    },
    {
        id: 'rest_004',
        name: 'Burger Junction',
        cuisine: 'american',
        rating: 4.5,
        deliveryTime: '15-25 min',
        phone: '(555) 456-7890',
        address: '321 Elm St, Uptown',
        image: 'https://kimi-web-img.moonshot.cn/img/img.freepik.com/d76c489b71f2f2f89b6c9f49dc28b36477b071c0.jpg',
        featured: true,
        coordinates: {lat: 40.7208, lng: -74.0140},
        menu: [
            {id: 'item_013', name: 'Classic Cheeseburger', price: 12.99, description: 'Beef patty with cheese, lettuce, tomato'},
            {id: 'item_014', name: 'BBQ Bacon Burger', price: 14.99, description: 'Bacon, BBQ sauce, onion rings'},
            {id: 'item_015', name: 'Sweet Potato Fries', price: 6.99, description: 'Crispy sweet potato fries'},
            {id: 'item_016', name: 'Milkshake', price: 5.99, description: 'Vanilla, chocolate, or strawberry'}
        ]
    },
    {
        id: 'rest_005',
        name: 'Sakura Sushi',
        cuisine: 'asian',
        rating: 4.9,
        deliveryTime: '35-45 min',
        phone: '(555) 567-8901',
        address: '654 Maple Blvd, Little Tokyo',
        image: 'https://kimi-web-img.moonshot.cn/img/www.2008php.com/3ed92ccc2cd73c79a0053eed31aa2173bc008cba.jpg',
        featured: false,
        coordinates: {lat: 40.7168, lng: -74.0080},
        menu: [
            {id: 'item_017', name: 'California Roll', price: 10.99, description: 'Crab, avocado, cucumber'},
            {id: 'item_018', name: 'Salmon Sashimi', price: 16.99, description: 'Fresh salmon slices'},
            {id: 'item_019', name: 'Tempura Roll', price: 12.99, description: 'Shrimp tempura with avocado'},
            {id: 'item_020', name: 'Miso Soup', price: 4.99, description: 'Traditional Japanese soup'}
        ]
    },
    {
        id: 'rest_006',
        name: 'Pizza Palace',
        cuisine: 'italian',
        rating: 4.4,
        deliveryTime: '20-30 min',
        phone: '(555) 678-9012',
        address: '987 Cedar Ln, Westside',
        image: 'https://kimi-web-img.moonshot.cn/img/st.hzcdn.com/efb48b640922f1f55f574f585cdfacc62786acad.jpg',
        featured: false,
        coordinates: {lat: 40.7148, lng: -74.0120},
        menu: [
            {id: 'item_021', name: 'Pepperoni Pizza', price: 19.99, description: 'Classic pepperoni with mozzarella'},
            {id: 'item_022', name: 'Veggie Supreme', price: 17.99, description: 'Mushrooms, peppers, onions, olives'},
            {id: 'item_023', name: 'Garlic Knots', price: 6.99, description: 'Fresh baked with garlic butter'},
            {id: 'item_024', name: 'Italian Soda', price: 3.99, description: 'Flavored sparkling water'}
        ]
    }
];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadRestaurants();
    initializeCarousel();
    animateElements();
});

// Initialize App Data
function initializeApp() {
    // Load data from localStorage or initialize with sample data
    if (!localStorage.getItem('foodExpress_restaurants')) {
        localStorage.setItem('foodExpress_restaurants', JSON.stringify(sampleRestaurants));
    }
    
    if (!localStorage.getItem('foodExpress_customers')) {
        localStorage.setItem('foodExpress_customers', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('foodExpress_drivers')) {
        localStorage.setItem('foodExpress_drivers', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('foodExpress_orders')) {
        localStorage.setItem('foodExpress_orders', JSON.stringify([]));
    }
    
    // Load data into app state
    appState.restaurants = JSON.parse(localStorage.getItem('foodExpress_restaurants'));
    appState.customers = JSON.parse(localStorage.getItem('foodExpress_customers'));
    appState.drivers = JSON.parse(localStorage.getItem('foodExpress_drivers'));
    appState.orders = JSON.parse(localStorage.getItem('foodExpress_orders'));
}

// Setup Event Listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearch);
    
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => handleFilter(btn.dataset.filter));
    });
    
    // Modal controls
    document.getElementById('closeModal').addEventListener('click', closeOrderModal);
    document.getElementById('closeSuccessModal').addEventListener('click', closeSuccessModal);
    document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);
    
    // Close modal on backdrop click
    document.getElementById('orderModal').addEventListener('click', function(e) {
        if (e.target === this) closeOrderModal();
    });
    
    document.getElementById('successModal').addEventListener('click', function(e) {
        if (e.target === this) closeSuccessModal();
    });
}

// Load and Display Restaurants
function loadRestaurants() {
    const grid = document.getElementById('restaurantsGrid');
    grid.innerHTML = '';
    
    appState.restaurants.forEach(restaurant => {
        const card = createRestaurantCard(restaurant);
        grid.appendChild(card);
    });
    
    // Animate cards
    anime({
        targets: '.restaurant-card',
        translateY: [50, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 600,
        easing: 'easeOutQuart'
    });
}

// Create Restaurant Card
function createRestaurantCard(restaurant) {
    const card = document.createElement('div');
    card.className = 'restaurant-card card-hover rounded-2xl overflow-hidden shadow-lg cursor-pointer';
    card.onclick = () => openOrderModal(restaurant);
    
    const stars = '★'.repeat(Math.floor(restaurant.rating)) + '☆'.repeat(5 - Math.floor(restaurant.rating));
    
    card.innerHTML = `
        <div class="relative">
            <img src="${restaurant.image}" alt="${restaurant.name}" 
                 class="w-full h-48 object-cover" onerror="this.src='resources/hero-app.png'">
            <div class="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-semibold text-gray-800">
                ${restaurant.rating} ${stars}
            </div>
            ${restaurant.featured ? '<div class="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Featured</div>' : ''}
        </div>
        <div class="p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-2" style="font-family: 'Playfair Display', serif;">
                ${restaurant.name}
            </h3>
            <p class="text-gray-600 text-sm mb-2 capitalize">${restaurant.cuisine} Cuisine</p>
            <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>⏱️ ${restaurant.deliveryTime}</span>
                <span>📞 ${restaurant.phone}</span>
            </div>
            <p class="text-gray-600 text-sm mb-4">📍 ${restaurant.address}</p>
            <div class="flex gap-2">
                <button onclick="event.stopPropagation(); openMaps('${restaurant.address}')" 
                        class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    View Map
                </button>
                <button class="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all">
                    Order Now
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Initialize Featured Carousel
function initializeCarousel() {
    const featuredRestaurants = appState.restaurants.filter(r => r.featured);
    const featuredList = document.getElementById('featuredList');
    
    featuredRestaurants.forEach(restaurant => {
        const slide = document.createElement('li');
        slide.className = 'splide__slide';
        slide.innerHTML = `
            <div class="restaurant-card rounded-2xl overflow-hidden shadow-lg mx-2 cursor-pointer" onclick="openOrderModal(${JSON.stringify(restaurant).replace(/"/g, '&quot;')})">
                <img src="${restaurant.image}" alt="${restaurant.name}" 
                     class="w-full h-32 object-cover" onerror="this.src='resources/hero-app.png'">
                <div class="p-4">
                    <h3 class="font-bold text-white text-lg mb-1" style="font-family: 'Playfair Display', serif;">
                        ${restaurant.name}
                    </h3>
                    <p class="text-white/80 text-sm">${restaurant.cuisine} • ${restaurant.rating}★</p>
                </div>
            </div>
        `;
        featuredList.appendChild(slide);
    });
    
    // Initialize Splide carousel
    new Splide('#featured-carousel', {
        type: 'loop',
        perPage: 2.5,
        perMove: 1,
        gap: '1rem',
        pagination: false,
        arrows: false,
        autoplay: true,
        interval: 4000,
        breakpoints: {
            768: {
                perPage: 1.5,
            },
            480: {
                perPage: 1.2,
            }
        }
    }).mount();
}

// Handle Search
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.restaurant-card');
    
    cards.forEach(card => {
        const restaurantName = card.querySelector('h3').textContent.toLowerCase();
        const cuisine = card.querySelector('.capitalize').textContent.toLowerCase();
        
        if (restaurantName.includes(query) || cuisine.includes(query)) {
            card.style.display = 'block';
            anime({
                targets: card,
                opacity: [0, 1],
                scale: [0.9, 1],
                duration: 300,
                easing: 'easeOutQuart'
            });
        } else {
            anime({
                targets: card,
                opacity: [1, 0],
                scale: [1, 0.9],
                duration: 200,
                easing: 'easeInQuart',
                complete: () => {
                    card.style.display = 'none';
                }
            });
        }
    });
}

// Handle Filter
function handleFilter(filter) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-red-500', 'text-white');
        btn.classList.add('bg-white', 'text-gray-700', 'border');
    });
    
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    activeBtn.classList.add('active', 'bg-red-500', 'text-white');
    activeBtn.classList.remove('bg-white', 'text-gray-700', 'border');
    
    // Filter restaurants
    const cards = document.querySelectorAll('.restaurant-card');
    
    cards.forEach(card => {
        const cuisine = card.querySelector('.capitalize').textContent.toLowerCase();
        
        if (filter === 'all' || cuisine.includes(filter)) {
            card.style.display = 'block';
            anime({
                targets: card,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 400,
                easing: 'easeOutQuart'
            });
        } else {
            anime({
                targets: card,
                opacity: [1, 0],
                translateY: [0, -20],
                duration: 300,
                easing: 'easeInQuart',
                complete: () => {
                    card.style.display = 'none';
                }
            });
        }
    });
}

// Open Order Modal
function openOrderModal(restaurant) {
    appState.currentOrder.restaurant = restaurant;
    appState.cart = [];
    
    document.getElementById('modalRestaurantName').textContent = restaurant.name;
    
    const menuItems = document.getElementById('menuItems');
    menuItems.innerHTML = '';
    
    restaurant.menu.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'flex items-center justify-between p-4 bg-white rounded-lg border';
        menuItem.innerHTML = `
            <div class="flex-1">
                <h4 class="font-semibold text-gray-800">${item.name}</h4>
                <p class="text-sm text-gray-600">${item.description}</p>
                <p class="font-bold text-red-600">$${item.price.toFixed(2)}</p>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="updateQuantity('${item.id}', -1)" 
                        class="quantity-btn w-8 h-8 rounded-full text-white font-bold text-lg">-</button>
                <span id="qty_${item.id}" class="w-8 text-center font-semibold">0</span>
                <button onclick="updateQuantity('${item.id}', 1)" 
                        class="quantity-btn w-8 h-8 rounded-full text-white font-bold text-lg">+</button>
            </div>
        `;
        menuItems.appendChild(menuItem);
    });
    
    updateOrderSummary();
    document.getElementById('orderModal').classList.remove('hidden');
    
    // Animate modal
    anime({
        targets: '.modal-content',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
}

// Close Order Modal
function closeOrderModal() {
    anime({
        targets: '.modal-content',
        scale: [1, 0.8],
        opacity: [1, 0],
        duration: 200,
        easing: 'easeInQuart',
        complete: () => {
            document.getElementById('orderModal').classList.add('hidden');
        }
    });
}

// Update Item Quantity
function updateQuantity(itemId, change) {
    const restaurant = appState.currentOrder.restaurant;
    const item = restaurant.menu.find(i => i.id === itemId);
    const currentQty = parseInt(document.getElementById(`qty_${itemId}`).textContent);
    const newQty = Math.max(0, currentQty + change);
    
    document.getElementById(`qty_${itemId}`).textContent = newQty;
    
    // Update cart
    const cartItem = appState.cart.find(i => i.id === itemId);
    if (cartItem) {
        if (newQty === 0) {
            appState.cart = appState.cart.filter(i => i.id !== itemId);
        } else {
            cartItem.quantity = newQty;
        }
    } else if (newQty > 0) {
        appState.cart.push({
            id: itemId,
            name: item.name,
            price: item.price,
            quantity: newQty
        });
    }
    
    updateOrderSummary();
    
    // Animate quantity change
    anime({
        targets: `#qty_${itemId}`,
        scale: [1.2, 1],
        duration: 200,
        easing: 'easeOutQuart'
    });
}

// Update Order Summary
function updateOrderSummary() {
    const itemCount = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 4.99;
    const total = subtotal + deliveryFee;
    
    document.getElementById('itemCount').textContent = itemCount;
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    
    // Enable/disable place order button
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    placeOrderBtn.disabled = itemCount === 0;
}

// Place Order
function placeOrder() {
    if (appState.cart.length === 0) return;
    
    const order = {
        id: 'ord_' + Date.now(),
        restaurantId: appState.currentOrder.restaurant.id,
        restaurantName: appState.currentOrder.restaurant.name,
        items: [...appState.cart],
        subtotal: appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        deliveryFee: 4.99,
        total: appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 4.99,
        status: 'pending',
        timestamp: new Date().toISOString(),
        notes: document.getElementById('specialInstructions').value,
        customerId: null,
        driverId: null
    };
    
    // Add to orders
    appState.orders.push(order);
    localStorage.setItem('foodExpress_orders', JSON.stringify(appState.orders));
    
    // Notify drivers
    notifyDrivers(order);
    
    // Close order modal and show success
    closeOrderModal();
    document.getElementById('successModal').classList.remove('hidden');
    
    // Animate success modal
    anime({
        targets: '#successModal .modal-content',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutQuart'
    });
    
    // Reset cart
    appState.cart = [];
}

// Close Success Modal
function closeSuccessModal() {
    anime({
        targets: '#successModal .modal-content',
        scale: [1, 0.8],
        opacity: [1, 0],
        duration: 200,
        easing: 'easeInQuart',
        complete: () => {
            document.getElementById('successModal').classList.add('hidden');
        }
    });
}

// Notify Drivers
function notifyDrivers(order) {
    const drivers = JSON.parse(localStorage.getItem('foodExpress_drivers') || '[]');
    
    if (drivers.length > 0) {
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Order Available!', {
                body: `Order from ${order.restaurantName} - $${order.total.toFixed(2)}`,
                icon: 'resources/driver-avatar.png'
            });
        }
        
        // Show alert for demo purposes
        setTimeout(() => {
            alert(`📱 Driver Notification:\nNew order from ${order.restaurantName}\nTotal: $${order.total.toFixed(2)}\n\nAll registered drivers have been notified!`);
        }, 1000);
    }
}

// Open Maps
function openMaps(address) {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
}

// Animate Elements
function animateElements() {
    // Animate floating icons
    anime({
        targets: '.floating-animation',
        translateY: [-10, 10],
        duration: 3000,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine',
        delay: anime.stagger(500)
    });
    
    // Animate search bar on focus
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('focus', () => {
        anime({
            targets: searchInput,
            scale: [1, 1.02],
            duration: 200,
            easing: 'easeOutQuart'
        });
    });
    
    searchInput.addEventListener('blur', () => {
        anime({
            targets: searchInput,
            scale: [1.02, 1],
            duration: 200,
            easing: 'easeOutQuart'
        });
    });
}

// Request Notification Permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Export functions for global access
window.openOrderModal = openOrderModal;
window.updateQuantity = updateQuantity;
window.openMaps = openMaps;

// Cart functionality
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cartItems')) || [];
        this.updateCartCount();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                e.preventDefault();
                const name = e.target.getAttribute('data-name');
                const price = e.target.getAttribute('data-price');
                this.addItem(name, price);
            }
        });

        // Cart page functionality
        if (window.location.pathname.includes('cart.html')) {
            this.displayCartItems();
            this.setupCartPageListeners();
        }
    }

    addItem(name, price) {
        // Clean price - remove currency symbol and convert to number
        const cleanPrice = parseFloat(price.replace(/[₹,]/g, ''));

        // Check if item already exists
        const existingItem = this.items.find(item => item.name === name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: Date.now(),
                name: name,
                price: cleanPrice,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showAddToCartFeedback();
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== parseInt(id));
        this.saveCart();
        this.updateCartCount();
        this.displayCartItems();
    }

    updateQuantity(id, quantity) {
        const item = this.items.find(item => item.id === parseInt(id));
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeItem(id);
                return;
            }
            this.saveCart();
            this.updateCartCount();
            this.displayCartItems();
        }
    }

    saveCart() {
        localStorage.setItem('cartItems', JSON.stringify(this.items));
    }

    updateCartCount() {
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('#cart-count');
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
        });
    }

    showAddToCartFeedback() {
        // Create and show a temporary notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = '✅ Added to cart!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #7fb069;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    displayCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const emptyCartDiv = document.getElementById('empty-cart');

        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.style.display = 'none';
            emptyCartDiv.style.display = 'block';
            this.updateCartSummary();
            return;
        }

        cartItemsContainer.style.display = 'block';
        emptyCartDiv.style.display = 'none';

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">₹${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                    <button class="remove-item" data-id="${item.id}">🗑️</button>
                </div>
                <div class="cart-item-total">
                    ₹${(item.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `).join('');

        this.updateCartSummary();
    }

    setupCartPageListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const id = e.target.getAttribute('data-id');
                this.removeItem(id);
            }

            if (e.target.classList.contains('quantity-btn')) {
                const id = e.target.getAttribute('data-id');
                const item = this.items.find(item => item.id === parseInt(id));
                if (item) {
                    if (e.target.classList.contains('plus')) {
                        this.updateQuantity(id, item.quantity + 1);
                    } else if (e.target.classList.contains('minus')) {
                        this.updateQuantity(id, Math.max(1, item.quantity - 1));
                    }
                }
            }

            // Checkout button click
            if (e.target.id === 'checkout-btn') {
                e.preventDefault();
                this.initiateCheckout();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const id = e.target.getAttribute('data-id');
                const quantity = parseInt(e.target.value);
                this.updateQuantity(id, quantity);
            }
        });
    }

    initiateCheckout() {
        if (this.items.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }

        // Show customer details form first
        this.showCustomerDetailsModal();
    }

    showCustomerDetailsModal() {
        const modal = document.createElement('div');
        modal.className = 'payment-modal-overlay';
        modal.innerHTML = `
            <div class="payment-modal">
                <div class="modal-header">
                    <h2>🌿 Customer Details</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-content">
                    <form id="customer-form">
                        <div class="form-group">
                            <label for="customer-name">Full Name *</label>
                            <input type="text" id="customer-name" required placeholder="Enter your full name">
                        </div>
                        <div class="form-group">
                            <label for="customer-phone">Phone Number *</label>
                            <input type="tel" id="customer-phone" required placeholder="Enter your phone number">
                        </div>
                        <div class="form-group">
                            <label for="customer-email">Email Address *</label>
                            <input type="email" id="customer-email" required placeholder="Enter your email">
                        </div>
                        <div class="form-group">
                            <label for="customer-address">Delivery Address *</label>
                            <textarea id="customer-address" required placeholder="Enter your complete delivery address" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="customer-pincode">Pincode *</label>
                            <input type="text" id="customer-pincode" required placeholder="Enter pincode">
                        </div>
                        <button type="submit" class="proceed-payment-btn">Proceed to Payment</button>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupCustomerFormListeners(modal);
    }

    setupCustomerFormListeners(modal) {
        const closeBtn = modal.querySelector('.close-modal');
        const form = modal.querySelector('#customer-form');

        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const customerData = {
                name: document.getElementById('customer-name').value,
                phone: document.getElementById('customer-phone').value,
                email: document.getElementById('customer-email').value,
                address: document.getElementById('customer-address').value,
                pincode: document.getElementById('customer-pincode').value
            };

            // Store customer data
            localStorage.setItem('customerData', JSON.stringify(customerData));

            // Close customer modal and show payment modal
            document.body.removeChild(modal);
            this.showPaymentModal();
        });
    }

    updateCartSummary() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
        const total = subtotal + shipping;

        const subtotalElement = document.getElementById('subtotal');
        const shippingElement = document.getElementById('shipping');
        const totalElement = document.getElementById('total-price');

        if (subtotalElement) subtotalElement.textContent = subtotal.toFixed(2);
        if (shippingElement) shippingElement.textContent = shipping.toFixed(2);
        if (totalElement) totalElement.textContent = total.toFixed(2);
    }

    showPaymentModal() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 500 ? 0 : 50;
        const total = subtotal + shipping;

        const modal = document.createElement('div');
        modal.className = 'payment-modal-overlay';
        modal.innerHTML = `
            <div class="payment-modal">
                <div class="modal-header">
                    <h2>💳 Choose Payment Method</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-content">
                    <div class="order-summary-modal">
                        <h3>Order Summary</h3>
                        <div class="summary-items">
                            ${this.items.map(item => `
                                <div class="summary-item">
                                    <span>${item.name} x${item.quantity}</span>
                                    <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="summary-total">
                            <div class="summary-line">
                                <span>Subtotal:</span>
                                <span>₹${subtotal.toFixed(2)}</span>
                            </div>
                            <div class="summary-line">
                                <span>Shipping:</span>
                                <span>₹${shipping.toFixed(2)}</span>
                            </div>
                            <div class="summary-line total">
                                <span>Total:</span>
                                <span>₹${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="payment-methods">
                        <h3>Select Payment Method</h3>

                        <div class="payment-option upi-option active" data-method="upi">
                            <div class="payment-header">
                                <span class="payment-icon">📱</span>
                                <span class="payment-title">UPI Payment</span>
                                <span class="recommended">Recommended</span>
                            </div>
                            <div class="upi-apps">
                                <button class="upi-app" data-app="gpay">
                                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzRBOTBFMiIvPgo8cGF0aCBkPSJNMTIgMTJIMjhWMjhIMTJWMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K" alt="Google Pay">
                                    <span>Google Pay</span>
                                </button>
                                <button class="upi-app" data-app="phonepe">
                                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzVGMjU5RiIvPgo8cGF0aCBkPSJNMTIgMTJIMjhWMjhIMTJWMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K" alt="PhonePe">
                                    <span>PhonePe</span>
                                </button>
                                <button class="upi-app" data-app="paytm">
                                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwQkFGMiIvPgo8cGF0aCBkPSJNMTIgMTJIMjhWMjhIMTJWMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K" alt="Paytm">
                                    <span>Paytm</span>
                                </button>
                                <button class="upi-app" data-app="other">
                                    <span class="other-upi-icon">💳</span>
                                    <span>Other UPI</span>
                                </button>
                            </div>
                        </div>

                        <div class="payment-option" data-method="cod">
                            <div class="payment-header">
                                <span class="payment-icon">💵</span>
                                <span class="payment-title">Cash on Delivery</span>
                                <span class="cod-fee">+₹25 fee</span>
                            </div>
                        </div>
                    </div>

                    <div class="upi-id-section" style="display: none;">
                        <label for="upi-id">Enter UPI ID:</label>
                        <input type="text" id="upi-id" placeholder="yourname@upi" />
                        <button class="verify-upi-btn">Verify & Pay</button>
                    </div>

                    <button class="pay-now-btn" disabled>
                        Pay ₹${total.toFixed(2)}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupPaymentListeners(modal, total);
    }

    setupPaymentListeners(modal, total) {
        const closeBtn = modal.querySelector('.close-modal');
        const paymentOptions = modal.querySelectorAll('.payment-option');
        const upiApps = modal.querySelectorAll('.upi-app');
        const payNowBtn = modal.querySelector('.pay-now-btn');
        const upiIdSection = modal.querySelector('.upi-id-section');
        const verifyUpiBtn = modal.querySelector('.verify-upi-btn');

        let selectedMethod = 'upi';
        let selectedApp = null;

        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        // Payment method selection
        paymentOptions.forEach(option => {
            option.addEventListener('click', () => {
                paymentOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                selectedMethod = option.dataset.method;

                if (selectedMethod === 'cod') {
                    const newTotal = total + 25; // COD fee
                    payNowBtn.textContent = `Place Order ₹${newTotal.toFixed(2)}`;
                    payNowBtn.disabled = false;
                    upiIdSection.style.display = 'none';
                } else {
                    payNowBtn.textContent = `Pay ₹${total.toFixed(2)}`;
                    payNowBtn.disabled = true;
                }
            });
        });

        // UPI app selection
        upiApps.forEach(app => {
            app.addEventListener('click', () => {
                upiApps.forEach(a => a.classList.remove('selected'));
                app.classList.add('selected');
                selectedApp = app.dataset.app;

                if (selectedApp === 'other') {
                    upiIdSection.style.display = 'block';
                    payNowBtn.disabled = true;
                } else {
                    upiIdSection.style.display = 'none';
                    payNowBtn.disabled = false;
                }
            });
        });

        // UPI ID verification
        verifyUpiBtn.addEventListener('click', () => {
            const upiId = document.getElementById('upi-id').value;
            if (this.validateUpiId(upiId)) {
                payNowBtn.disabled = false;
                this.showNotification('UPI ID verified!', 'success');
            } else {
                this.showNotification('Invalid UPI ID format', 'error');
            }
        });

        // Pay now button
        payNowBtn.addEventListener('click', () => {
            this.processPayment(selectedMethod, selectedApp, total, modal);
        });
    }

    validateUpiId(upiId) {
        // Basic UPI ID validation
        const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        return upiRegex.test(upiId);
    }

    processPayment(method, app, total, modal) {
        const customerData = JSON.parse(localStorage.getItem('customerData'));

        if (method === 'cod') {
            this.processCODOrder(total + 25, modal);
        } else if (method === 'upi') {
            this.processUPIPayment(app, total, modal);
        }
    }

    processUPIPayment(app, total, modal) {
        // Show payment processing
        this.showPaymentProcessing(modal);

        // Generate UPI payment URL
        const upiUrl = this.generateUPIUrl(app, total);

        // For demo purposes, we'll simulate payment processing
        setTimeout(() => {
            // In a real application, you would integrate with actual UPI payment gateway
            this.simulateUPIPayment(upiUrl, total, modal);
        }, 2000);
    }

    generateUPIUrl(app, amount) {
        const merchantUPI = 'ecodott@paytm'; // Your business UPI ID
        const merchantName = 'EcoDott Plants';
        const transactionId = 'ECO' + Date.now();

        // UPI URL format
        const upiUrl = `upi://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&tr=${transactionId}&am=${amount}&cu=INR&tn=${encodeURIComponent('EcoDott Plant Purchase')}`;

        return upiUrl;
    }

    simulateUPIPayment(upiUrl, amount, modal) {
        // Create payment confirmation modal
        const confirmModal = document.createElement('div');
        confirmModal.className = 'payment-modal-overlay';
        confirmModal.innerHTML = `
            <div class="payment-modal payment-confirm">
                <div class="modal-header">
                    <h2>🔄 Complete Payment</h2>
                </div>
                <div class="modal-content">
                    <div class="payment-qr-section">
                        <div class="qr-placeholder">
                            <div class="qr-code">
                                <div class="qr-pattern"></div>
                            </div>
                            <p>Scan QR code with your UPI app</p>
                        </div>
                        <div class="payment-details">
                            <p><strong>Amount:</strong> ₹${amount.toFixed(2)}</p>
                            <p><strong>Merchant:</strong> EcoDott Plants</p>
                            <p><strong>UPI ID:</strong> ecodott@paytm</p>
                        </div>
                    </div>

                    <div class="payment-actions">
                        <button class="open-upi-btn" onclick="window.open('${upiUrl}', '_blank')">
                            📱 Open UPI App
                        </button>
                        <button class="payment-done-btn">I have completed the payment</button>
                        <button class="cancel-payment-btn">Cancel Payment</button>
                    </div>

                    <div class="payment-timer">
                        <p>⏰ Complete payment within <span id="timer">10:00</span> minutes</p>
                    </div>
                </div>
            </div>
        `;

        // Replace current modal
        document.body.removeChild(modal);
        document.body.appendChild(confirmModal);

        this.setupPaymentConfirmListeners(confirmModal, amount);
        this.startPaymentTimer(confirmModal);
    }

    setupPaymentConfirmListeners(modal, amount) {
        const paymentDoneBtn = modal.querySelector('.payment-done-btn');
        const cancelBtn = modal.querySelector('.cancel-payment-btn');

        paymentDoneBtn.addEventListener('click', () => {
            this.verifyPayment(modal, amount);
        });

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            this.showNotification('Payment cancelled', 'error');
        });
    }

    startPaymentTimer(modal) {
        let timeLeft = 600; // 10 minutes in seconds
        const timerElement = modal.querySelector('#timer');

        const timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            timeLeft--;

            if (timeLeft < 0) {
                clearInterval(timer);
                document.body.removeChild(modal);
                this.showNotification('Payment timeout. Please try again.', 'error');
            }
        }, 1000);
    }

    verifyPayment(modal, amount) {
        // Show verification process
        const content = modal.querySelector('.modal-content');
        content.innerHTML = `
            <div class="payment-verification">
                <div class="verification-spinner"></div>
                <h3>Verifying Payment...</h3>
                <p>Please wait while we confirm your payment</p>
            </div>
        `;

        // Simulate payment verification
        setTimeout(() => {
            // In real implementation, verify with payment gateway
            const isPaymentSuccessful = Math.random() > 0.1; // 90% success rate for demo

            if (isPaymentSuccessful) {
                this.handleSuccessfulPayment(modal, amount, 'UPI');
            } else {
                this.handleFailedPayment(modal);
            }
        }, 3000);
    }

    processCODOrder(total, modal) {
        this.showPaymentProcessing(modal);

        setTimeout(() => {
            this.handleSuccessfulPayment(modal, total, 'COD');
        }, 2000);
    }

    showPaymentProcessing(modal) {
        const content = modal.querySelector('.modal-content');
        content.innerHTML = `
            <div class="payment-processing">
                <div class="processing-spinner"></div>
                <h3>Processing...</h3>
                <p>Please wait while we process your order</p>
            </div>
        `;
    }

    handleSuccessfulPayment(modal, amount, method) {
        const orderId = 'ECO' + Date.now();
        const customerData = JSON.parse(localStorage.getItem('customerData'));

        // Store order details
        const orderData = {
            orderId: orderId,
            items: this.items,
            customer: customerData,
            amount: amount,
            paymentMethod: method,
            status: 'confirmed',
            date: new Date().toISOString()
        };

        // Save order to localStorage (in real app, send to server)
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Clear cart
        this.items = [];
        this.saveCart();
        this.updateCartCount();

        // Show success modal
        const content = modal.querySelector('.modal-content');
        content.innerHTML = `
            <div class="payment-success">
                <div class="success-icon">✅</div>
                <h3>Order Confirmed!</h3>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Amount:</strong> ₹${amount.toFixed(2)}</p>
                <p><strong>Payment Method:</strong> ${method}</p>
                <div class="order-details">
                    <h4>Delivery Details:</h4>
                    <p>${customerData.name}</p>
                    <p>${customerData.phone}</p>
                    <p>${customerData.address}</p>
                    <p>Pincode: ${customerData.pincode}</p>
                </div>
                <p class="delivery-info">🚚 Your plants will be delivered within 3-5 business days</p>
                <div class="success-actions">
                    <button class="continue-shopping-btn">Continue Shopping</button>
                    <button class="track-order-btn">Track Order</button>
                </div>
            </div>
        `;

        // Setup success modal listeners
        const continueBtn = modal.querySelector('.continue-shopping-btn');
        const trackBtn = modal.querySelector('.track-order-btn');

        continueBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            window.location.href = 'plants.html';
        });

        trackBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            this.showNotification('Order tracking feature coming soon!', 'info');
        });

        // Send confirmation email (simulate)
        this.sendOrderConfirmation(orderData);
    }

    handleFailedPayment(modal) {
        const content = modal.querySelector('.modal-content');
        content.innerHTML = `
            <div class="payment-failed">
                <div class="error-icon">❌</div>
                <h3>Payment Failed</h3>
                <p>We couldn't process your payment. Please try again.</p>
                <div class="failed-actions">
                    <button class="retry-payment-btn">Retry Payment</button>
                    <button class="cancel-order-btn">Cancel Order</button>
                </div>
            </div>
        `;

        const retryBtn = modal.querySelector('.retry-payment-btn');
        const cancelBtn = modal.querySelector('.cancel-order-btn');

        retryBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            this.showPaymentModal();
        });

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            this.showNotification('Order cancelled', 'error');
        });
    }

    sendOrderConfirmation(orderData) {
        // Simulate sending confirmation email
        console.log('Order confirmation sent:', orderData);
        this.showNotification('Order confirmation sent to your email!', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
        notification.innerHTML = `${icon} ${message}`;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#7fb069' : type === 'error' ? '#ff6b6b' : '#4A90E2'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Smart search and filter functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize shopping cart
    const cart = new ShoppingCart();

    // Search and filter functionality (only on plants page)
    const searchInput = document.getElementById('plant-search');
    const priceFilter = document.getElementById('price-filter');
    const categoryFilter = document.getElementById('category-filter');
    const plantCards = document.querySelectorAll('.plant-card');

    if (searchInput && priceFilter && categoryFilter) {
        function filterPlants() {
            const searchTerm = searchInput.value.toLowerCase();
            const priceRange = priceFilter.value;
            const category = categoryFilter.value;

            plantCards.forEach(card => {
                const plantName = card.querySelector('h3').textContent.toLowerCase();
                const plantPrice = parseInt(card.dataset.price);
                const plantCategory = card.dataset.category;

                let showCard = true;

                // Search filter
                if (searchTerm && !plantName.includes(searchTerm)) {
                    showCard = false;
                }

                // Price filter
                if (priceRange) {
                    if (priceRange === 'low' && plantPrice >= 300) showCard = false;
                    if (priceRange === 'medium' && (plantPrice < 300 || plantPrice > 500)) showCard = false;
                    if (priceRange === 'high' && plantPrice <= 500) showCard = false;
                }

                // Category filter
                if (category && plantCategory !== category) {
                    showCard = false;
                }

                card.style.display = showCard ? 'block' : 'none';
            });
        }

        // Event listeners
        searchInput.addEventListener('input', filterPlants);
        priceFilter.addEventListener('change', filterPlants);
        categoryFilter.addEventListener('change', filterPlants);
    }
});
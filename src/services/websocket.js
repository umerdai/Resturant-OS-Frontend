import { io } from 'socket.io-client';
import { ref } from 'vue';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.isConnected = ref(false);
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.callbacks = new Map();
    }

    connect(url = 'ws://localhost:3001', options = {}) {
        try {
            this.socket = io(url, {
                autoConnect: true,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: this.maxReconnectAttempts,
                ...options
            });

            this.setupEventListeners();
            return this.socket;
        } catch (error) {
            console.error('WebSocket connection error:', error);
            return null;
        }
    }

    setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('WebSocket connected');
            this.isConnected.value = true;
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
            this.isConnected.value = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
                this.socket.disconnect();
            }
        });

        // Order events
        this.socket.on('order:created', (data) => {
            this.emit('orderCreated', data);
        });

        this.socket.on('order:updated', (data) => {
            this.emit('orderUpdated', data);
        });

        this.socket.on('order:status_changed', (data) => {
            this.emit('orderStatusChanged', data);
        });

        // Table events
        this.socket.on('table:status_changed', (data) => {
            this.emit('tableStatusChanged', data);
        });

        this.socket.on('table:assigned', (data) => {
            this.emit('tableAssigned', data);
        });

        // Kitchen events
        this.socket.on('kitchen:new_order', (data) => {
            this.emit('kitchenNewOrder', data);
            // Play sound notification
            this.playNotificationSound();
        });

        this.socket.on('kitchen:order_ready', (data) => {
            this.emit('kitchenOrderReady', data);
            this.playNotificationSound();
        });

        // Inventory events
        this.socket.on('inventory:low_stock', (data) => {
            this.emit('inventoryLowStock', data);
        });

        this.socket.on('inventory:out_of_stock', (data) => {
            this.emit('inventoryOutOfStock', data);
        });

        // Staff events
        this.socket.on('staff:shift_change', (data) => {
            this.emit('staffShiftChange', data);
        });

        // System events
        this.socket.on('system:notification', (data) => {
            this.emit('systemNotification', data);
        });
    }

    // Event subscription methods
    on(event, callback) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }
        this.callbacks.get(event).push(callback);
    }

    off(event, callback) {
        if (this.callbacks.has(event)) {
            const callbacks = this.callbacks.get(event);
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.callbacks.has(event)) {
            this.callbacks.get(event).forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} callback:`, error);
                }
            });
        }
    }

    // Send events to server
    sendOrderUpdate(orderData) {
        if (this.socket && this.isConnected.value) {
            this.socket.emit('order:update', orderData);
        }
    }

    sendTableUpdate(tableData) {
        if (this.socket && this.isConnected.value) {
            this.socket.emit('table:update', tableData);
        }
    }

    sendKitchenUpdate(kitchenData) {
        if (this.socket && this.isConnected.value) {
            this.socket.emit('kitchen:update', kitchenData);
        }
    }

    sendInventoryUpdate(inventoryData) {
        if (this.socket && this.isConnected.value) {
            this.socket.emit('inventory:update', inventoryData);
        }
    }

    joinRoom(roomName) {
        if (this.socket && this.isConnected.value) {
            this.socket.emit('join:room', roomName);
        }
    }

    leaveRoom(roomName) {
        if (this.socket && this.isConnected.value) {
            this.socket.emit('leave:room', roomName);
        }
    }

    // Notification sound
    playNotificationSound() {
        try {
            // Create audio context for notification sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected.value = false;
        }
        this.callbacks.clear();
    }

    // Utility methods for different user roles
    subscribeAsWaiter(waiterId) {
        this.joinRoom(`waiter:${waiterId}`);
        this.on('orderCreated', (data) => {
            if (data.waiterId === waiterId) {
                console.log('New order assigned to waiter');
            }
        });
    }

    subscribeAsKitchenStaff() {
        this.joinRoom('kitchen');
        this.on('kitchenNewOrder', (data) => {
            console.log('New order for kitchen:', data);
        });
    }

    subscribeAsManager() {
        this.joinRoom('management');
        this.on('systemNotification', (data) => {
            console.log('System notification:', data);
        });
    }

    subscribeAsCashier() {
        this.joinRoom('cashier');
        this.on('orderStatusChanged', (data) => {
            if (data.status === 'ready') {
                console.log('Order ready for payment:', data);
            }
        });
    }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;

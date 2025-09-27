import { defineStore } from 'pinia';

export const useKitchenStore = defineStore('kitchen', {
    state: () => ({
        orders: [],
        stations: {
            hot_appetizers: {
                name: 'Hot Appetizers',
                orders: [],
                staff: [],
                avgPrepTime: 8,
                color: '#ef4444'
            },
            cold_appetizers: {
                name: 'Cold Appetizers',
                orders: [],
                staff: [],
                avgPrepTime: 5,
                color: '#3b82f6'
            },
            salads: {
                name: 'Salads',
                orders: [],
                staff: [],
                avgPrepTime: 7,
                color: '#22c55e'
            },
            grill: {
                name: 'Grill Station',
                orders: [],
                staff: [],
                avgPrepTime: 15,
                color: '#f59e0b'
            },
            saute: {
                name: 'Sauté Station',
                orders: [],
                staff: [],
                avgPrepTime: 12,
                color: '#8b5cf6'
            },
            fryer: {
                name: 'Fryer Station',
                orders: [],
                staff: [],
                avgPrepTime: 8,
                color: '#f97316'
            },
            pizza_oven: {
                name: 'Pizza Oven',
                orders: [],
                staff: [],
                avgPrepTime: 10,
                color: '#dc2626'
            },
            desserts: {
                name: 'Dessert Station',
                orders: [],
                staff: [],
                avgPrepTime: 6,
                color: '#ec4899'
            },
            beverages: {
                name: 'Beverage Station',
                orders: [],
                staff: [],
                avgPrepTime: 3,
                color: '#06b6d4'
            },
            expo: {
                name: 'Expediting',
                orders: [],
                staff: [],
                avgPrepTime: 2,
                color: '#64748b'
            }
        },
        kitchenDisplay: {
            layout: 'grid', // grid, timeline, kanban
            sortBy: 'orderTime', // orderTime, priority, tableNumber
            showCompleted: false,
            autoRefresh: true,
            refreshInterval: 30000,
            soundAlerts: true
        },
        staff: [],
        performance: {
            currentShift: {
                startTime: null,
                ordersCompleted: 0,
                avgPrepTime: 0,
                onTimePercentage: 0
            },
            daily: {
                totalOrders: 0,
                completedOrders: 0,
                avgPrepTime: 0,
                onTimeDelivery: 0
            }
        },
        alerts: [],
        timers: {},
        settings: {
            preparationTimeWarnings: true,
            warningThresholds: {
                yellow: 0.8, // 80% of estimated time
                red: 1.2 // 120% of estimated time
            },
            automaticStatusUpdates: true,
            integratePOS: true,
            notificationSound: true
        }
    }),

    getters: {
        // Get all pending orders
        pendingOrders: (state) => {
            return state.orders.filter((order) => !['completed', 'cancelled', 'served'].includes(order.status)).sort((a, b) => new Date(a.orderTime) - new Date(b.orderTime));
        },

        // Get orders by priority
        ordersByPriority: (state) => {
            return state.orders.sort((a, b) => {
                const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
        },

        // Get orders by station
        ordersByStation: (state) => (station) => {
            return state.orders.filter((order) => order.items.some((item) => item.station === station) && !['completed', 'cancelled'].includes(order.status));
        },

        // Get overdue orders
        overdueOrders: (state) => {
            const now = new Date();
            return state.orders.filter((order) => {
                const orderTime = new Date(order.orderTime);
                const estimatedCompletion = new Date(orderTime.getTime() + order.estimatedPrepTime * 60000);
                return now > estimatedCompletion && !['completed', 'served'].includes(order.status);
            });
        },

        // Kitchen performance stats
        kitchenStats: (state) => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayOrders = state.orders.filter((order) => new Date(order.orderTime) >= today);

            return {
                totalOrdersToday: todayOrders.length,
                completedToday: todayOrders.filter((o) => o.status === 'completed').length,
                pendingOrders: state.orders.filter((o) => !['completed', 'cancelled', 'served'].includes(o.status)).length,
                avgPrepTime: state.performance.daily.avgPrepTime,
                onTimePercentage: state.performance.daily.onTimeDelivery
            };
        },

        // Station workload
        stationWorkload: (state) => {
            const workload = {};
            Object.keys(state.stations).forEach((stationKey) => {
                const station = state.stations[stationKey];
                workload[stationKey] = {
                    ...station,
                    currentOrders: state.orders.filter((order) => order.items.some((item) => item.station === stationKey) && ['preparing', 'cooking'].includes(order.status)).length,
                    queuedItems: state.orders.reduce((total, order) => {
                        return total + order.items.filter((item) => item.station === stationKey && !['completed', 'served'].includes(item.status)).length;
                    }, 0)
                };
            });
            return workload;
        },

        // Active timers
        activeTimers: (state) => {
            return Object.entries(state.timers).filter(([_, timer]) => timer.active && !timer.completed);
        }
    },

    actions: {
        // Initialize kitchen display
        async initializeKitchen() {
            try {
                await this.fetchKitchenOrders();
                await this.fetchKitchenStaff();
                this.startAutoRefresh();
                return { success: true };
            } catch (error) {
                console.error('Failed to initialize kitchen:', error);
                return { success: false, message: error.message };
            }
        },

        // Fetch kitchen orders
        async fetchKitchenOrders() {
            try {
                // Simulate API call - replace with actual endpoint
                const mockOrders = [
                    {
                        id: 'KO001',
                        orderNumber: 'ORD-001',
                        tableNumber: 'T5',
                        orderTime: new Date(Date.now() - 10 * 60000), // 10 min ago
                        status: 'preparing',
                        priority: 'normal',
                        estimatedPrepTime: 15,
                        actualStartTime: new Date(Date.now() - 5 * 60000),
                        customerName: 'John Doe',
                        specialInstructions: 'No onions, extra cheese',
                        items: [
                            {
                                id: 'item1',
                                name: 'Margherita Pizza',
                                quantity: 1,
                                station: 'pizza_oven',
                                prepTime: 10,
                                status: 'preparing',
                                modifiers: ['Extra Cheese', 'Thin Crust'],
                                allergens: ['Gluten', 'Dairy']
                            },
                            {
                                id: 'item2',
                                name: 'Caesar Salad',
                                quantity: 1,
                                station: 'salads',
                                prepTime: 5,
                                status: 'ready',
                                modifiers: ['No Croutons'],
                                allergens: ['Dairy']
                            }
                        ]
                    },
                    {
                        id: 'KO002',
                        orderNumber: 'ORD-002',
                        tableNumber: 'T3',
                        orderTime: new Date(Date.now() - 15 * 60000),
                        status: 'cooking',
                        priority: 'high',
                        estimatedPrepTime: 20,
                        actualStartTime: new Date(Date.now() - 10 * 60000),
                        customerName: 'Jane Smith',
                        specialInstructions: 'Well done steak',
                        items: [
                            {
                                id: 'item3',
                                name: 'Ribeye Steak',
                                quantity: 1,
                                station: 'grill',
                                prepTime: 15,
                                status: 'cooking',
                                modifiers: ['Well Done', 'Extra Sauce'],
                                allergens: []
                            },
                            {
                                id: 'item4',
                                name: 'Garlic Bread',
                                quantity: 2,
                                station: 'hot_appetizers',
                                prepTime: 5,
                                status: 'completed',
                                modifiers: [],
                                allergens: ['Gluten']
                            }
                        ]
                    }
                ];

                this.orders = mockOrders;
                this.distributeOrdersToStations();
                return { success: true };
            } catch (error) {
                console.error('Error fetching kitchen orders:', error);
                throw error;
            }
        },

        // Add new order to kitchen
        addKitchenOrder(order) {
            const kitchenOrder = {
                ...order,
                id: `KO${String(this.orders.length + 1).padStart(3, '0')}`,
                status: 'received',
                receivedAt: new Date(),
                estimatedPrepTime: this.calculateEstimatedPrepTime(order.items),
                priority: this.calculateOrderPriority(order)
            };

            this.orders.unshift(kitchenOrder);
            this.distributeOrdersToStations();
            this.startOrderTimer(kitchenOrder.id);

            if (this.settings.notificationSound) {
                this.playNotificationSound();
            }

            this.addAlert({
                type: 'new_order',
                message: `New order received: ${kitchenOrder.orderNumber}`,
                timestamp: new Date()
            });
        },

        // Update order status
        async updateOrderStatus(orderId, status, itemId = null) {
            try {
                const order = this.orders.find((o) => o.id === orderId);
                if (!order) throw new Error('Order not found');

                if (itemId) {
                    // Update specific item status
                    const item = order.items.find((i) => i.id === itemId);
                    if (item) {
                        item.status = status;
                        item.completedAt = status === 'completed' ? new Date() : null;
                    }

                    // Check if all items are completed
                    const allItemsCompleted = order.items.every((item) => ['completed', 'served'].includes(item.status));
                    if (allItemsCompleted) {
                        order.status = 'completed';
                        order.completedAt = new Date();
                        this.completeOrderTimer(orderId);
                    }
                } else {
                    // Update entire order status
                    order.status = status;
                    if (status === 'preparing') {
                        order.actualStartTime = new Date();
                    } else if (status === 'completed') {
                        order.completedAt = new Date();
                        this.completeOrderTimer(orderId);
                    }
                }

                this.distributeOrdersToStations();
                this.updatePerformanceMetrics();

                return { success: true };
            } catch (error) {
                console.error('Error updating order status:', error);
                return { success: false, message: error.message };
            }
        },

        // Calculate estimated preparation time
        calculateEstimatedPrepTime(items) {
            let maxStationTime = 0;
            const stationTimes = {};

            items.forEach((item) => {
                const station = item.station || 'general';
                if (!stationTimes[station]) {
                    stationTimes[station] = 0;
                }
                stationTimes[station] += item.prepTime || this.stations[station]?.avgPrepTime || 10;
            });

            return Math.max(...Object.values(stationTimes), 5); // Minimum 5 minutes
        },

        // Calculate order priority
        calculateOrderPriority(order) {
            // VIP customers, large parties, or special occasions get high priority
            if (order.customerInfo?.isVip || order.items.length > 5) {
                return 'high';
            }

            // Regular orders
            return 'normal';
        },

        // Distribute orders to stations
        distributeOrdersToStations() {
            // Reset station orders
            Object.keys(this.stations).forEach((stationKey) => {
                this.stations[stationKey].orders = [];
            });

            // Distribute current orders
            this.orders.forEach((order) => {
                if (!['completed', 'cancelled', 'served'].includes(order.status)) {
                    order.items.forEach((item) => {
                        const station = item.station;
                        if (station && this.stations[station]) {
                            this.stations[station].orders.push({
                                ...order,
                                currentItem: item
                            });
                        }
                    });
                }
            });
        },

        // Start order timer
        startOrderTimer(orderId) {
            const order = this.orders.find((o) => o.id === orderId);
            if (!order) return;

            this.timers[orderId] = {
                orderId,
                startTime: new Date(),
                estimatedDuration: order.estimatedPrepTime * 60000,
                active: true,
                completed: false
            };
        },

        // Complete order timer
        completeOrderTimer(orderId) {
            if (this.timers[orderId]) {
                this.timers[orderId].active = false;
                this.timers[orderId].completed = true;
                this.timers[orderId].completedTime = new Date();
            }
        },

        // Fetch kitchen staff
        async fetchKitchenStaff() {
            try {
                // Simulate API call
                const mockStaff = [
                    {
                        id: 'KS001',
                        name: 'Chef Mario',
                        role: 'head_chef',
                        station: 'expo',
                        shiftStart: new Date(Date.now() - 4 * 60 * 60000),
                        isActive: true,
                        performance: {
                            ordersToday: 45,
                            avgPrepTime: 12.5,
                            accuracy: 98.5
                        }
                    },
                    {
                        id: 'KS002',
                        name: 'Sarah Johnson',
                        role: 'line_cook',
                        station: 'grill',
                        shiftStart: new Date(Date.now() - 3 * 60 * 60000),
                        isActive: true,
                        performance: {
                            ordersToday: 32,
                            avgPrepTime: 14.2,
                            accuracy: 96.8
                        }
                    },
                    {
                        id: 'KS003',
                        name: 'Mike Chen',
                        role: 'prep_cook',
                        station: 'salads',
                        shiftStart: new Date(Date.now() - 2 * 60 * 60000),
                        isActive: true,
                        performance: {
                            ordersToday: 28,
                            avgPrepTime: 6.8,
                            accuracy: 99.1
                        }
                    }
                ];

                this.staff = mockStaff;

                // Assign staff to stations
                this.staff.forEach((member) => {
                    if (member.station && this.stations[member.station]) {
                        this.stations[member.station].staff.push(member);
                    }
                });

                return { success: true };
            } catch (error) {
                console.error('Error fetching kitchen staff:', error);
                throw error;
            }
        },

        // Update kitchen display settings
        updateDisplaySettings(settings) {
            this.kitchenDisplay = { ...this.kitchenDisplay, ...settings };
        },

        // Add alert
        addAlert(alert) {
            this.alerts.unshift({
                id: `AL${Date.now()}`,
                ...alert,
                read: false
            });

            // Keep only last 50 alerts
            if (this.alerts.length > 50) {
                this.alerts = this.alerts.slice(0, 50);
            }
        },

        // Mark alert as read
        markAlertRead(alertId) {
            const alert = this.alerts.find((a) => a.id === alertId);
            if (alert) {
                alert.read = true;
            }
        },

        // Clear alerts
        clearAlerts() {
            this.alerts = [];
        },

        // Update performance metrics
        updatePerformanceMetrics() {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayOrders = this.orders.filter((order) => new Date(order.orderTime) >= today);
            const completedToday = todayOrders.filter((order) => order.status === 'completed');

            // Calculate average prep time
            if (completedToday.length > 0) {
                const totalPrepTime = completedToday.reduce((total, order) => {
                    if (order.actualStartTime && order.completedAt) {
                        return total + (new Date(order.completedAt) - new Date(order.actualStartTime));
                    }
                    return total;
                }, 0);

                this.performance.daily.avgPrepTime = Math.round(totalPrepTime / completedToday.length / 60000); // minutes
            }

            // Calculate on-time delivery
            const onTimeOrders = completedToday.filter((order) => {
                if (!order.actualStartTime || !order.completedAt) return false;
                const actualPrepTime = (new Date(order.completedAt) - new Date(order.actualStartTime)) / 60000;
                return actualPrepTime <= order.estimatedPrepTime * 1.1; // 10% tolerance
            });

            this.performance.daily.onTimeDelivery = completedToday.length > 0 ? Math.round((onTimeOrders.length / completedToday.length) * 100) : 0;

            this.performance.daily.totalOrders = todayOrders.length;
            this.performance.daily.completedOrders = completedToday.length;
        },

        // Start auto refresh
        startAutoRefresh() {
            if (this.kitchenDisplay.autoRefresh) {
                setInterval(() => {
                    this.fetchKitchenOrders();
                }, this.kitchenDisplay.refreshInterval);
            }
        },

        // Play notification sound
        playNotificationSound() {
            if (typeof window !== 'undefined' && this.settings.notificationSound) {
                // Create audio notification
                const audio = new Audio('/sounds/kitchen-notification.mp3');
                audio.volume = 0.5;
                audio.play().catch(console.error);
            }
        },

        // Emergency mode - prioritize orders
        activateEmergencyMode() {
            this.orders.forEach((order) => {
                if (!['completed', 'served'].includes(order.status)) {
                    order.priority = 'urgent';
                }
            });

            this.addAlert({
                type: 'emergency',
                message: 'Emergency mode activated - All orders prioritized',
                timestamp: new Date()
            });
        },

        // Kitchen rush mode
        activateRushMode() {
            // Reduce estimated prep times by 20%
            this.orders.forEach((order) => {
                if (!order.completedAt) {
                    order.estimatedPrepTime = Math.max(order.estimatedPrepTime * 0.8, 3);
                }
            });

            this.addAlert({
                type: 'rush',
                message: 'Rush mode activated - Prep times reduced',
                timestamp: new Date()
            });
        }
    }
});

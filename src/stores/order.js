import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useOrderStore = defineStore('order', () => {
    // State
    const orders = ref([]);
    const currentOrder = ref(null);
    const isLoading = ref(false);

    // Order status constants
    const ORDER_STATUS = {
        PENDING: 'pending',
        PREPARING: 'preparing',
        READY: 'ready',
        SERVED: 'served',
        CANCELLED: 'cancelled',
        PAID: 'paid'
    };

    // Payment method constants
    const PAYMENT_METHODS = {
        CASH: 'cash',
        CARD: 'card',
        MOBILE: 'mobile',
        SPLIT: 'split'
    };

    // Getters
    const activeOrders = computed(() => {
        return orders.value.filter((order) => [ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING, ORDER_STATUS.READY].includes(order.status));
    });

    const kitchenOrders = computed(() => {
        return orders.value.filter((order) => [ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING].includes(order.status));
    });

    const readyOrders = computed(() => {
        return orders.value.filter((order) => order.status === ORDER_STATUS.READY);
    });

    const getOrderById = computed(() => {
        return (id) => orders.value.find((order) => order.id === id);
    });

    const getOrdersByTable = computed(() => {
        return (tableId) => orders.value.filter((order) => order.tableId === tableId);
    });

    const getOrdersByWaiter = computed(() => {
        return (waiterId) => orders.value.filter((order) => order.waiterId === waiterId);
    });

    const orderStatistics = computed(() => {
        const today = new Date().toDateString();
        const todayOrders = orders.value.filter((order) => new Date(order.createdAt).toDateString() === today);

        return {
            total: orders.value.length,
            today: todayOrders.length,
            pending: orders.value.filter((o) => o.status === ORDER_STATUS.PENDING).length,
            preparing: orders.value.filter((o) => o.status === ORDER_STATUS.PREPARING).length,
            ready: orders.value.filter((o) => o.status === ORDER_STATUS.READY).length,
            served: orders.value.filter((o) => o.status === ORDER_STATUS.SERVED).length,
            revenue: todayOrders.reduce((sum, order) => sum + (order.total || 0), 0)
        };
    });

    // Actions
    const fetchOrders = async () => {
        isLoading.value = true;
        try {
            const response = await simulateFetchOrders();
            orders.value = response;
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const createOrder = async (orderData) => {
        isLoading.value = true;
        try {
            const response = await simulateCreateOrder(orderData);
            orders.value.push(response);
            currentOrder.value = response;
            return { success: true, order: response };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        const order = orders.value.find((o) => o.id === orderId);
        if (order) {
            order.status = status;
            order.updatedAt = new Date().toISOString();

            // Update timeline
            order.timeline.push({
                status,
                timestamp: new Date().toISOString(),
                notes: `Order marked as ${status}`
            });

            // In real app, sync with backend
            await simulateUpdateOrderStatus(orderId, status);
            return { success: true };
        }
        return { success: false, message: 'Order not found' };
    };

    const addItemToOrder = async (orderId, item) => {
        const order = orders.value.find((o) => o.id === orderId);
        if (order) {
            order.items.push({
                ...item,
                id: Date.now(),
                quantity: item.quantity || 1,
                notes: item.notes || '',
                modifiers: item.modifiers || []
            });

            // Recalculate totals
            calculateOrderTotal(order);

            // In real app, sync with backend
            await simulateUpdateOrder(orderId, order);
            return { success: true };
        }
        return { success: false, message: 'Order not found' };
    };

    const removeItemFromOrder = async (orderId, itemId) => {
        const order = orders.value.find((o) => o.id === orderId);
        if (order) {
            order.items = order.items.filter((item) => item.id !== itemId);
            calculateOrderTotal(order);

            // In real app, sync with backend
            await simulateUpdateOrder(orderId, order);
            return { success: true };
        }
        return { success: false, message: 'Order not found' };
    };

    const updateItemQuantity = async (orderId, itemId, quantity) => {
        const order = orders.value.find((o) => o.id === orderId);
        if (order) {
            const item = order.items.find((i) => i.id === itemId);
            if (item) {
                item.quantity = quantity;
                calculateOrderTotal(order);

                // In real app, sync with backend
                await simulateUpdateOrder(orderId, order);
                return { success: true };
            }
        }
        return { success: false, message: 'Order or item not found' };
    };

    const splitOrder = async (orderId, splitData) => {
        const originalOrder = orders.value.find((o) => o.id === orderId);
        if (originalOrder) {
            // Create new order with split items
            const newOrder = {
                ...originalOrder,
                id: Date.now(),
                orderNumber: `ORD-${Date.now()}`,
                items: splitData.items,
                createdAt: new Date().toISOString()
            };

            // Remove split items from original order
            originalOrder.items = originalOrder.items.filter((item) => !splitData.items.some((splitItem) => splitItem.id === item.id));

            // Recalculate totals for both orders
            calculateOrderTotal(originalOrder);
            calculateOrderTotal(newOrder);

            orders.value.push(newOrder);

            // In real app, sync with backend
            await simulateSplitOrder(orderId, newOrder);
            return { success: true, newOrder };
        }
        return { success: false, message: 'Order not found' };
    };

    const mergeOrders = async (primaryOrderId, secondaryOrderId) => {
        const primaryOrder = orders.value.find((o) => o.id === primaryOrderId);
        const secondaryOrder = orders.value.find((o) => o.id === secondaryOrderId);

        if (primaryOrder && secondaryOrder) {
            // Merge items
            primaryOrder.items.push(...secondaryOrder.items);

            // Recalculate total
            calculateOrderTotal(primaryOrder);

            // Remove secondary order
            orders.value = orders.value.filter((o) => o.id !== secondaryOrderId);

            // In real app, sync with backend
            await simulateMergeOrders(primaryOrderId, secondaryOrderId);
            return { success: true };
        }
        return { success: false, message: 'One or both orders not found' };
    };

    const transferOrder = async (orderId, newTableId, newWaiterId) => {
        const order = orders.value.find((o) => o.id === orderId);
        if (order) {
            order.tableId = newTableId;
            order.waiterId = newWaiterId;
            order.updatedAt = new Date().toISOString();

            // In real app, sync with backend
            await simulateTransferOrder(orderId, newTableId, newWaiterId);
            return { success: true };
        }
        return { success: false, message: 'Order not found' };
    };

    const processPayment = async (orderId, paymentData) => {
        const order = orders.value.find((o) => o.id === orderId);
        if (order) {
            order.payment = paymentData;
            order.status = ORDER_STATUS.PAID;
            order.paidAt = new Date().toISOString();

            // In real app, sync with backend
            await simulateProcessPayment(orderId, paymentData);
            return { success: true };
        }
        return { success: false, message: 'Order not found' };
    };

    const setCurrentOrder = (order) => {
        currentOrder.value = order;
    };

    const clearCurrentOrder = () => {
        currentOrder.value = null;
    };

    // Helper function to calculate order total
    const calculateOrderTotal = (order) => {
        const subtotal = order.items.reduce((sum, item) => {
            const itemTotal = item.price * item.quantity;
            const modifiersTotal = (item.modifiers || []).reduce((modSum, mod) => modSum + mod.price * item.quantity, 0);
            return sum + itemTotal + modifiersTotal;
        }, 0);

        const tax = subtotal * (order.taxRate || 0.08);
        const serviceCharge = subtotal * (order.serviceChargeRate || 0.1);
        const discount = order.discount || 0;

        order.subtotal = subtotal;
        order.tax = tax;
        order.serviceCharge = serviceCharge;
        order.discount = discount;
        order.total = subtotal + tax + serviceCharge - discount;
    };

    // Mock API functions (replace with actual API calls)
    const simulateFetchOrders = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockOrders = [
                    {
                        id: 1,
                        orderNumber: 'ORD-001',
                        tableId: 1,
                        waiterId: 3,
                        customerId: null,
                        status: ORDER_STATUS.PREPARING,
                        items: [
                            {
                                id: 1,
                                menuItemId: 1,
                                name: 'Caesar Salad',
                                price: 12.99,
                                quantity: 2,
                                notes: 'Extra croutons',
                                modifiers: [{ id: 1, name: 'Extra Croutons', price: 2.0 }]
                            }
                        ],
                        subtotal: 25.98,
                        tax: 2.08,
                        serviceCharge: 2.6,
                        discount: 0,
                        total: 30.66,
                        taxRate: 0.08,
                        serviceChargeRate: 0.1,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        timeline: [
                            {
                                status: ORDER_STATUS.PENDING,
                                timestamp: new Date(Date.now() - 600000).toISOString(),
                                notes: 'Order created'
                            },
                            {
                                status: ORDER_STATUS.PREPARING,
                                timestamp: new Date(Date.now() - 300000).toISOString(),
                                notes: 'Kitchen started preparation'
                            }
                        ]
                    }
                ];
                resolve(mockOrders);
            }, 500);
        });
    };

    const simulateCreateOrder = async (orderData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newOrder = {
                    id: Date.now(),
                    orderNumber: `ORD-${Date.now()}`,
                    ...orderData,
                    status: ORDER_STATUS.PENDING,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    timeline: [
                        {
                            status: ORDER_STATUS.PENDING,
                            timestamp: new Date().toISOString(),
                            notes: 'Order created'
                        }
                    ]
                };
                resolve(newOrder);
            }, 300);
        });
    };

    const simulateUpdateOrderStatus = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 200);
        });
    };

    const simulateUpdateOrder = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 200);
        });
    };

    const simulateSplitOrder = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 300);
        });
    };

    const simulateMergeOrders = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 300);
        });
    };

    const simulateTransferOrder = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 200);
        });
    };

    const simulateProcessPayment = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 500);
        });
    };

    return {
        // State
        orders,
        currentOrder,
        isLoading,
        ORDER_STATUS,
        PAYMENT_METHODS,

        // Getters
        activeOrders,
        kitchenOrders,
        readyOrders,
        getOrderById,
        getOrdersByTable,
        getOrdersByWaiter,
        orderStatistics,

        // Actions
        fetchOrders,
        createOrder,
        updateOrderStatus,
        addItemToOrder,
        removeItemFromOrder,
        updateItemQuantity,
        splitOrder,
        mergeOrders,
        transferOrder,
        processPayment,
        setCurrentOrder,
        clearCurrentOrder,
        calculateOrderTotal
    };
});

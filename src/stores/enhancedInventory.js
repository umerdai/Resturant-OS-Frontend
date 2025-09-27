import { defineStore } from 'pinia';

export const useEnhancedInventoryStore = defineStore('enhancedInventory', {
    state: () => ({
        // Inventory items with enhanced tracking
        inventoryItems: [
            {
                id: 'INV001',
                name: 'Chicken Breast',
                category: 'Proteins',
                currentStock: 15.5, // in kg
                unitType: 'kg',
                minStockLevel: 5,
                maxStockLevel: 50,
                reorderPoint: 8,
                reorderQuantity: 20,
                unitCost: 8.5,
                supplier: 'Fresh Foods Co.',
                supplierId: 'SUP001',
                lastRestocked: '2024-01-15T10:30:00Z',
                expiryDate: '2024-01-25T00:00:00Z',
                storageLocation: 'Freezer A1',
                barcode: '123456789012',
                autoReorder: true,
                trackExpiry: true,
                allergens: ['None'],
                nutritionalInfo: {
                    calories: 165,
                    protein: 31,
                    carbs: 0,
                    fat: 3.6
                }
            },
            {
                id: 'INV002',
                name: 'Tomatoes',
                category: 'Vegetables',
                currentStock: 25,
                unitType: 'kg',
                minStockLevel: 10,
                maxStockLevel: 100,
                reorderPoint: 15,
                reorderQuantity: 50,
                unitCost: 3.2,
                supplier: 'Garden Fresh Produce',
                supplierId: 'SUP002',
                lastRestocked: '2024-01-16T08:00:00Z',
                expiryDate: '2024-01-22T00:00:00Z',
                storageLocation: 'Cold Storage B2',
                barcode: '123456789013',
                autoReorder: true,
                trackExpiry: true,
                allergens: ['None'],
                nutritionalInfo: {
                    calories: 18,
                    protein: 0.9,
                    carbs: 3.9,
                    fat: 0.2
                }
            },
            {
                id: 'INV003',
                name: 'Cheese (Mozzarella)',
                category: 'Dairy',
                currentStock: 8.2,
                unitType: 'kg',
                minStockLevel: 3,
                maxStockLevel: 25,
                reorderPoint: 5,
                reorderQuantity: 15,
                unitCost: 12.75,
                supplier: 'Dairy Best Ltd.',
                supplierId: 'SUP003',
                lastRestocked: '2024-01-14T14:20:00Z',
                expiryDate: '2024-01-28T00:00:00Z',
                storageLocation: 'Refrigerator C1',
                barcode: '123456789014',
                autoReorder: true,
                trackExpiry: true,
                allergens: ['Dairy'],
                nutritionalInfo: {
                    calories: 300,
                    protein: 22,
                    carbs: 4,
                    fat: 22
                }
            }
        ],

        // Recipe ingredients mapping
        recipeIngredients: {
            MENU001: [
                // Grilled Chicken Salad
                { inventoryId: 'INV001', quantity: 0.2, unit: 'kg' }, // 200g chicken
                { inventoryId: 'INV002', quantity: 0.1, unit: 'kg' }, // 100g tomatoes
                { inventoryId: 'INV003', quantity: 0.05, unit: 'kg' } // 50g cheese
            ],
            MENU002: [
                // Margherita Pizza
                { inventoryId: 'INV002', quantity: 0.15, unit: 'kg' }, // 150g tomatoes
                { inventoryId: 'INV003', quantity: 0.25, unit: 'kg' } // 250g cheese
            ]
        },

        // Suppliers
        suppliers: [
            {
                id: 'SUP001',
                name: 'Fresh Foods Co.',
                contactPerson: 'John Smith',
                email: 'orders@freshfoods.com',
                phone: '+1-555-0101',
                address: '123 Supply Street, Food City, FC 12345',
                paymentTerms: 'Net 30',
                deliveryDays: ['Monday', 'Wednesday', 'Friday'],
                minimumOrder: 500,
                rating: 4.8,
                isActive: true
            },
            {
                id: 'SUP002',
                name: 'Garden Fresh Produce',
                contactPerson: 'Sarah Johnson',
                email: 'sales@gardenfresh.com',
                phone: '+1-555-0102',
                address: '456 Farm Road, Green Valley, GV 67890',
                paymentTerms: 'Net 15',
                deliveryDays: ['Tuesday', 'Thursday', 'Saturday'],
                minimumOrder: 200,
                rating: 4.6,
                isActive: true
            },
            {
                id: 'SUP003',
                name: 'Dairy Best Ltd.',
                contactPerson: 'Mike Wilson',
                email: 'orders@dairybest.com',
                phone: '+1-555-0103',
                address: '789 Dairy Lane, Milk Town, MT 54321',
                paymentTerms: 'Net 21',
                deliveryDays: ['Monday', 'Thursday'],
                minimumOrder: 300,
                rating: 4.9,
                isActive: true
            }
        ],

        // Purchase orders
        purchaseOrders: [],

        // Stock movements/transactions
        stockMovements: [],

        // Waste tracking
        wasteEntries: [],

        // Alerts and notifications
        alerts: [],

        // Settings
        settings: {
            autoReorderEnabled: true,
            lowStockNotifications: true,
            expiryNotifications: true,
            wasteTrackingEnabled: true,
            stockDeductionOnOrder: true,
            requireApprovalForPurchaseOrders: true,
            purchaseOrderApprovalLimit: 1000
        },

        // Current statistics
        statistics: {
            totalItems: 0,
            lowStockItems: 0,
            expiringSoonItems: 0,
            outOfStockItems: 0,
            totalValue: 0,
            monthlyWasteValue: 0,
            averageInventoryTurnover: 0,
            lastUpdated: new Date().toISOString()
        }
    }),

    getters: {
        // Get items that are low on stock
        getLowStockItems: (state) => {
            return state.inventoryItems.filter((item) => item.currentStock <= item.minStockLevel);
        },

        // Get items that are out of stock
        getOutOfStockItems: (state) => {
            return state.inventoryItems.filter((item) => item.currentStock <= 0);
        },

        // Get items expiring soon (within 3 days)
        getExpiringSoonItems: (state) => {
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

            return state.inventoryItems.filter((item) => {
                if (!item.trackExpiry || !item.expiryDate) return false;
                return new Date(item.expiryDate) <= threeDaysFromNow;
            });
        },

        // Get items that need reordering
        getItemsNeedingReorder: (state) => {
            return state.inventoryItems.filter((item) => item.autoReorder && item.currentStock <= item.reorderPoint);
        },

        // Get total inventory value
        getTotalInventoryValue: (state) => {
            return state.inventoryItems.reduce((total, item) => total + item.currentStock * item.unitCost, 0);
        },

        // Get pending purchase orders
        getPendingPurchaseOrders: (state) => {
            return state.purchaseOrders.filter((po) => po.status === 'pending' || po.status === 'sent');
        },

        // Get active alerts
        getActiveAlerts: (state) => {
            return state.alerts.filter((alert) => alert.isActive);
        },

        // Get recent stock movements
        getRecentStockMovements: (state) => {
            return state.stockMovements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);
        },

        // Get waste summary for current month
        getCurrentMonthWaste: (state) => {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            return state.wasteEntries.filter((waste) => {
                const wasteDate = new Date(waste.date);
                return wasteDate.getMonth() === currentMonth && wasteDate.getFullYear() === currentYear;
            });
        }
    },

    actions: {
        // Initialize enhanced inventory system
        async initializeInventorySystem() {
            try {
                await this.calculateStatistics();
                await this.checkStockLevels();
                await this.checkExpiryDates();
                this.generateAutoReorderSuggestions();
                return { success: true };
            } catch (error) {
                console.error('Failed to initialize inventory system:', error);
                return { success: false, message: error.message };
            }
        },

        // Process order and deduct inventory
        async processOrderInventoryDeduction(orderId, orderItems) {
            if (!this.settings.stockDeductionOnOrder) return { success: true };

            try {
                const deductions = [];
                const insufficientStock = [];

                // Check each menu item and calculate required ingredients
                for (const orderItem of orderItems) {
                    const requiredIngredients = this.recipeIngredients[orderItem.menuItemId];

                    if (requiredIngredients) {
                        for (const ingredient of requiredIngredients) {
                            const totalRequired = ingredient.quantity * orderItem.quantity;
                            const inventoryItem = this.inventoryItems.find((item) => item.id === ingredient.inventoryId);

                            if (inventoryItem) {
                                if (inventoryItem.currentStock < totalRequired) {
                                    insufficientStock.push({
                                        itemName: inventoryItem.name,
                                        required: totalRequired,
                                        available: inventoryItem.currentStock,
                                        shortage: totalRequired - inventoryItem.currentStock
                                    });
                                } else {
                                    deductions.push({
                                        inventoryId: ingredient.inventoryId,
                                        quantity: totalRequired,
                                        reason: `Order #${orderId} - ${orderItem.name}`
                                    });
                                }
                            }
                        }
                    }
                }

                // If insufficient stock, return error
                if (insufficientStock.length > 0) {
                    return {
                        success: false,
                        message: 'Insufficient stock for some ingredients',
                        details: insufficientStock
                    };
                }

                // Process deductions
                for (const deduction of deductions) {
                    await this.deductStock(deduction.inventoryId, deduction.quantity, 'order_sale', deduction.reason);
                }

                return { success: true, deductions };
            } catch (error) {
                console.error('Error processing inventory deduction:', error);
                return { success: false, message: error.message };
            }
        },

        // Deduct stock for an item
        async deductStock(inventoryId, quantity, type = 'manual', reason = '') {
            try {
                const item = this.inventoryItems.find((inv) => inv.id === inventoryId);
                if (!item) throw new Error('Inventory item not found');

                if (item.currentStock < quantity) {
                    throw new Error('Insufficient stock available');
                }

                // Update stock
                item.currentStock -= quantity;

                // Record movement
                const movement = {
                    id: `MOV${Date.now()}`,
                    inventoryId,
                    itemName: item.name,
                    type: 'deduction',
                    reason: type,
                    quantity: -quantity,
                    previousStock: item.currentStock + quantity,
                    newStock: item.currentStock,
                    cost: quantity * item.unitCost,
                    timestamp: new Date().toISOString(),
                    notes: reason
                };

                this.stockMovements.push(movement);

                // Check if item needs reordering
                if (item.autoReorder && item.currentStock <= item.reorderPoint) {
                    this.createAutoReorderAlert(item);
                }

                // Update statistics
                await this.calculateStatistics();

                return { success: true, movement };
            } catch (error) {
                console.error('Error deducting stock:', error);
                return { success: false, message: error.message };
            }
        },

        // Add stock for an item
        async addStock(inventoryId, quantity, type = 'manual', reason = '', cost = null) {
            try {
                const item = this.inventoryItems.find((inv) => inv.id === inventoryId);
                if (!item) throw new Error('Inventory item not found');

                const previousStock = item.currentStock;
                item.currentStock += quantity;

                // Update last restocked date
                item.lastRestocked = new Date().toISOString();

                // Record movement
                const movement = {
                    id: `MOV${Date.now()}`,
                    inventoryId,
                    itemName: item.name,
                    type: 'addition',
                    reason: type,
                    quantity: quantity,
                    previousStock,
                    newStock: item.currentStock,
                    cost: cost || quantity * item.unitCost,
                    timestamp: new Date().toISOString(),
                    notes: reason
                };

                this.stockMovements.push(movement);

                // Update statistics
                await this.calculateStatistics();

                return { success: true, movement };
            } catch (error) {
                console.error('Error adding stock:', error);
                return { success: false, message: error.message };
            }
        },

        // Create purchase order
        async createPurchaseOrder(supplierId, items, notes = '') {
            try {
                const supplier = this.suppliers.find((s) => s.id === supplierId);
                if (!supplier) throw new Error('Supplier not found');

                let totalAmount = 0;
                const orderItems = [];

                for (const item of items) {
                    const inventoryItem = this.inventoryItems.find((inv) => inv.id === item.inventoryId);
                    if (inventoryItem) {
                        const itemTotal = item.quantity * inventoryItem.unitCost;
                        totalAmount += itemTotal;

                        orderItems.push({
                            inventoryId: item.inventoryId,
                            itemName: inventoryItem.name,
                            quantity: item.quantity,
                            unitCost: inventoryItem.unitCost,
                            total: itemTotal
                        });
                    }
                }

                const purchaseOrder = {
                    id: `PO${Date.now()}`,
                    supplierId,
                    supplierName: supplier.name,
                    orderDate: new Date().toISOString(),
                    expectedDeliveryDate: this.calculateExpectedDelivery(supplier),
                    items: orderItems,
                    totalAmount,
                    status: this.settings.requireApprovalForPurchaseOrders && totalAmount > this.settings.purchaseOrderApprovalLimit ? 'pending_approval' : 'pending',
                    notes,
                    createdBy: 'current_user', // Replace with actual user
                    approvedBy: null,
                    approvedDate: null
                };

                this.purchaseOrders.push(purchaseOrder);

                // Create alert for approval if needed
                if (purchaseOrder.status === 'pending_approval') {
                    this.createAlert('purchase_order_approval', `Purchase Order ${purchaseOrder.id} requires approval`, 'warning', { purchaseOrderId: purchaseOrder.id });
                }

                return { success: true, purchaseOrder };
            } catch (error) {
                console.error('Error creating purchase order:', error);
                return { success: false, message: error.message };
            }
        },

        // Auto-generate purchase orders for low stock items
        async generateAutoReorderSuggestions() {
            const itemsNeedingReorder = this.getItemsNeedingReorder;
            const suggestions = [];

            // Group items by supplier
            const supplierGroups = {};

            itemsNeedingReorder.forEach((item) => {
                if (!supplierGroups[item.supplierId]) {
                    supplierGroups[item.supplierId] = [];
                }
                supplierGroups[item.supplierId].push({
                    inventoryId: item.id,
                    quantity: item.reorderQuantity
                });
            });

            // Create suggestions for each supplier
            Object.entries(supplierGroups).forEach(([supplierId, items]) => {
                suggestions.push({
                    supplierId,
                    items,
                    generated: new Date().toISOString()
                });
            });

            if (suggestions.length > 0) {
                this.createAlert('auto_reorder_suggestions', `${suggestions.length} auto-reorder suggestions available`, 'info', { suggestions });
            }

            return suggestions;
        },

        // Record waste
        async recordWaste(inventoryId, quantity, reason, notes = '') {
            try {
                const item = this.inventoryItems.find((inv) => inv.id === inventoryId);
                if (!item) throw new Error('Inventory item not found');

                if (item.currentStock < quantity) {
                    throw new Error('Cannot record more waste than available stock');
                }

                // Deduct from stock
                await this.deductStock(inventoryId, quantity, 'waste', `Waste: ${reason}`);

                // Record waste entry
                const wasteEntry = {
                    id: `WST${Date.now()}`,
                    inventoryId,
                    itemName: item.name,
                    quantity,
                    reason,
                    cost: quantity * item.unitCost,
                    date: new Date().toISOString(),
                    recordedBy: 'current_user', // Replace with actual user
                    notes
                };

                this.wasteEntries.push(wasteEntry);

                // Update statistics
                await this.calculateStatistics();

                return { success: true, wasteEntry };
            } catch (error) {
                console.error('Error recording waste:', error);
                return { success: false, message: error.message };
            }
        },

        // Calculate inventory statistics
        async calculateStatistics() {
            const stats = {
                totalItems: this.inventoryItems.length,
                lowStockItems: this.getLowStockItems.length,
                expiringSoonItems: this.getExpiringSoonItems.length,
                outOfStockItems: this.getOutOfStockItems.length,
                totalValue: this.getTotalInventoryValue,
                monthlyWasteValue: this.getCurrentMonthWaste.reduce((total, waste) => total + waste.cost, 0),
                averageInventoryTurnover: this.calculateInventoryTurnover(),
                lastUpdated: new Date().toISOString()
            };

            this.statistics = stats;
            return stats;
        },

        // Calculate inventory turnover rate
        calculateInventoryTurnover() {
            // Simplified calculation - in real implementation, this would use historical data
            const totalMovements = this.stockMovements.filter((m) => m.reason === 'order_sale' && new Date(m.timestamp) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

            const totalSoldValue = totalMovements.reduce((total, movement) => total + Math.abs(movement.cost), 0);

            return this.statistics.totalValue > 0 ? (totalSoldValue / this.statistics.totalValue) * 12 : 0; // Annualized
        },

        // Check stock levels and create alerts
        async checkStockLevels() {
            const lowStockItems = this.getLowStockItems;
            const outOfStockItems = this.getOutOfStockItems;

            // Clear existing stock alerts
            this.alerts = this.alerts.filter((alert) => !['low_stock', 'out_of_stock'].includes(alert.type));

            // Create low stock alerts
            lowStockItems.forEach((item) => {
                this.createAlert('low_stock', `Low stock: ${item.name} (${item.currentStock} ${item.unitType} remaining)`, 'warning', { inventoryId: item.id, currentStock: item.currentStock, minLevel: item.minStockLevel });
            });

            // Create out of stock alerts
            outOfStockItems.forEach((item) => {
                this.createAlert('out_of_stock', `Out of stock: ${item.name}`, 'danger', { inventoryId: item.id });
            });
        },

        // Check expiry dates and create alerts
        async checkExpiryDates() {
            if (!this.settings.expiryNotifications) return;

            const expiringSoonItems = this.getExpiringSoonItems;

            // Clear existing expiry alerts
            this.alerts = this.alerts.filter((alert) => alert.type !== 'expiry_warning');

            // Create expiry alerts
            expiringSoonItems.forEach((item) => {
                const daysUntilExpiry = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

                this.createAlert('expiry_warning', `${item.name} expires in ${daysUntilExpiry} day(s)`, daysUntilExpiry <= 1 ? 'danger' : 'warning', { inventoryId: item.id, expiryDate: item.expiryDate, daysUntilExpiry });
            });
        },

        // Create alert
        createAlert(type, message, severity, data = {}) {
            const alert = {
                id: `ALT${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
                type,
                message,
                severity, // 'info', 'warning', 'danger', 'success'
                data,
                createdAt: new Date().toISOString(),
                isActive: true,
                acknowledgedBy: null,
                acknowledgedAt: null
            };

            this.alerts.push(alert);
            return alert;
        },

        // Create auto-reorder alert
        createAutoReorderAlert(item) {
            this.createAlert('auto_reorder', `${item.name} has reached reorder point (${item.currentStock} ${item.unitType} remaining)`, 'info', {
                inventoryId: item.id,
                supplierId: item.supplierId,
                reorderQuantity: item.reorderQuantity
            });
        },

        // Calculate expected delivery date
        calculateExpectedDelivery(supplier) {
            const today = new Date();
            const deliveryDays = supplier.deliveryDays;

            // Find next available delivery day
            for (let i = 1; i <= 7; i++) {
                const checkDate = new Date(today);
                checkDate.setDate(today.getDate() + i);
                const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' });

                if (deliveryDays.includes(dayName)) {
                    return checkDate.toISOString();
                }
            }

            // Fallback to 7 days from now
            const fallbackDate = new Date(today);
            fallbackDate.setDate(today.getDate() + 7);
            return fallbackDate.toISOString();
        },

        // Acknowledge alert
        acknowledgeAlert(alertId) {
            const alert = this.alerts.find((a) => a.id === alertId);
            if (alert) {
                alert.isActive = false;
                alert.acknowledgedBy = 'current_user'; // Replace with actual user
                alert.acknowledgedAt = new Date().toISOString();
            }
        },

        // Update inventory item
        async updateInventoryItem(itemId, updates) {
            try {
                const item = this.inventoryItems.find((inv) => inv.id === itemId);
                if (!item) throw new Error('Inventory item not found');

                Object.assign(item, updates);

                // Update statistics
                await this.calculateStatistics();

                return { success: true };
            } catch (error) {
                console.error('Error updating inventory item:', error);
                return { success: false, message: error.message };
            }
        },

        // Get inventory report data
        getInventoryReport(startDate, endDate) {
            const movements = this.stockMovements.filter((movement) => {
                const movementDate = new Date(movement.timestamp);
                return movementDate >= new Date(startDate) && movementDate <= new Date(endDate);
            });

            const waste = this.wasteEntries.filter((wasteEntry) => {
                const wasteDate = new Date(wasteEntry.date);
                return wasteDate >= new Date(startDate) && wasteDate <= new Date(endDate);
            });

            return {
                period: { startDate, endDate },
                movements,
                waste,
                summary: {
                    totalMovements: movements.length,
                    totalWaste: waste.length,
                    wasteValue: waste.reduce((total, w) => total + w.cost, 0),
                    stockValue: this.getTotalInventoryValue,
                    lowStockItems: this.getLowStockItems.length,
                    expiringSoonItems: this.getExpiringSoonItems.length
                }
            };
        },

        // Export inventory data
        exportInventoryData(format = 'csv') {
            let exportData;

            switch (format) {
                case 'csv':
                    exportData = this.convertToCSV(this.inventoryItems);
                    break;
                case 'json':
                    exportData = JSON.stringify(
                        {
                            items: this.inventoryItems,
                            statistics: this.statistics,
                            alerts: this.getActiveAlerts
                        },
                        null,
                        2
                    );
                    break;
                default:
                    throw new Error('Unsupported export format');
            }

            // Simulate file download
            if (typeof window !== 'undefined') {
                const blob = new Blob([exportData], {
                    type: format === 'csv' ? 'text/csv' : 'application/json'
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.${format}`;
                link.click();
                URL.revokeObjectURL(url);
            }

            return { success: true, message: `Inventory data exported as ${format.toUpperCase()}` };
        },

        // Convert data to CSV format
        convertToCSV(data) {
            if (!data || data.length === 0) return '';

            const headers = Object.keys(data[0])
                .filter((key) => typeof data[0][key] !== 'object')
                .join(',');

            const rows = data.map((row) =>
                Object.entries(row)
                    .filter(([, value]) => typeof value !== 'object')
                    .map(([, value]) => (typeof value === 'string' ? `"${value}"` : value))
                    .join(',')
            );

            return [headers, ...rows].join('\n');
        }
    }
});

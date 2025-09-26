import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';

export const useInventoryStore = defineStore('inventory', () => {
    const toast = useToast();

    // State
    const ingredients = ref([
        {
            id: 1,
            name: 'Tomatoes',
            category: 'vegetables',
            currentStock: 50,
            unit: 'lbs',
            minStock: 20,
            maxStock: 100,
            costPerUnit: 2.5,
            supplierId: 1,
            lastRestocked: '2024-01-15T10:00:00Z',
            expiryDate: '2024-01-25T00:00:00Z',
            location: 'Cold Storage A',
            barcode: '123456789001',
            status: 'in-stock'
        },
        {
            id: 2,
            name: 'Ground Beef',
            category: 'meat',
            currentStock: 15,
            unit: 'lbs',
            minStock: 25,
            maxStock: 80,
            costPerUnit: 8.99,
            supplierId: 2,
            lastRestocked: '2024-01-14T08:00:00Z',
            expiryDate: '2024-01-20T00:00:00Z',
            location: 'Freezer B',
            barcode: '123456789002',
            status: 'low-stock'
        },
        {
            id: 3,
            name: 'Mozzarella Cheese',
            category: 'dairy',
            currentStock: 8,
            unit: 'lbs',
            minStock: 10,
            maxStock: 40,
            costPerUnit: 6.75,
            supplierId: 3,
            lastRestocked: '2024-01-13T14:00:00Z',
            expiryDate: '2024-01-28T00:00:00Z',
            location: 'Refrigerator C',
            barcode: '123456789003',
            status: 'low-stock'
        },
        {
            id: 4,
            name: 'Flour',
            category: 'dry-goods',
            currentStock: 0,
            unit: 'lbs',
            minStock: 15,
            maxStock: 60,
            costPerUnit: 1.25,
            supplierId: 4,
            lastRestocked: '2024-01-10T09:00:00Z',
            expiryDate: '2024-06-15T00:00:00Z',
            location: 'Dry Storage',
            barcode: '123456789004',
            status: 'out-of-stock'
        },
        {
            id: 5,
            name: 'Olive Oil',
            category: 'oils',
            currentStock: 35,
            unit: 'liters',
            minStock: 10,
            maxStock: 50,
            costPerUnit: 12.99,
            supplierId: 1,
            lastRestocked: '2024-01-16T11:00:00Z',
            expiryDate: '2024-12-31T00:00:00Z',
            location: 'Pantry A',
            barcode: '123456789005',
            status: 'in-stock'
        }
    ]);

    const suppliers = ref([
        {
            id: 1,
            name: 'Fresh Produce Co.',
            contactPerson: 'John Smith',
            phone: '+1-555-0101',
            email: 'orders@freshproduce.com',
            address: '123 Market Street, City, State 12345',
            categories: ['vegetables', 'fruits', 'oils'],
            rating: 4.5,
            paymentTerms: 'Net 30',
            deliveryDays: ['Monday', 'Wednesday', 'Friday'],
            minimumOrder: 100
        },
        {
            id: 2,
            name: 'Quality Meats Ltd.',
            contactPerson: 'Sarah Johnson',
            phone: '+1-555-0102',
            email: 'sarah@qualitymeats.com',
            address: '456 Industrial Ave, City, State 12345',
            categories: ['meat', 'poultry', 'seafood'],
            rating: 4.8,
            paymentTerms: 'Net 15',
            deliveryDays: ['Tuesday', 'Thursday'],
            minimumOrder: 200
        },
        {
            id: 3,
            name: 'Dairy Fresh',
            contactPerson: 'Mike Wilson',
            phone: '+1-555-0103',
            email: 'orders@dairyfresh.com',
            address: '789 Farm Road, City, State 12345',
            categories: ['dairy', 'eggs'],
            rating: 4.2,
            paymentTerms: 'Net 20',
            deliveryDays: ['Monday', 'Wednesday', 'Friday'],
            minimumOrder: 75
        },
        {
            id: 4,
            name: 'Bulk Goods Supply',
            contactPerson: 'Lisa Brown',
            phone: '+1-555-0104',
            email: 'lisa@bulkgoods.com',
            address: '321 Warehouse Blvd, City, State 12345',
            categories: ['dry-goods', 'spices', 'condiments'],
            rating: 4.0,
            paymentTerms: 'Net 45',
            deliveryDays: ['Thursday'],
            minimumOrder: 150
        }
    ]);

    const stockMovements = ref([
        {
            id: 1,
            ingredientId: 1,
            type: 'restock',
            quantity: 50,
            date: '2024-01-15T10:00:00Z',
            notes: 'Weekly delivery from Fresh Produce Co.',
            costPerUnit: 2.5,
            totalCost: 125.0,
            userId: 1,
            orderId: 'PO-001'
        },
        {
            id: 2,
            ingredientId: 2,
            type: 'usage',
            quantity: -10,
            date: '2024-01-15T18:30:00Z',
            notes: 'Used for burger preparation',
            menuItemId: 5,
            userId: 2
        },
        {
            id: 3,
            ingredientId: 3,
            type: 'adjustment',
            quantity: -2,
            date: '2024-01-14T20:00:00Z',
            notes: 'Spoilage - expired cheese discarded',
            userId: 1,
            reason: 'spoilage'
        }
    ]);

    const purchaseOrders = ref([
        {
            id: 'PO-001',
            supplierId: 1,
            status: 'delivered',
            orderDate: '2024-01-14T09:00:00Z',
            expectedDelivery: '2024-01-15T10:00:00Z',
            actualDelivery: '2024-01-15T10:15:00Z',
            items: [
                {
                    ingredientId: 1,
                    quantity: 50,
                    costPerUnit: 2.5,
                    totalCost: 125.0
                }
            ],
            totalAmount: 125.0,
            notes: 'Regular weekly order',
            createdBy: 1
        },
        {
            id: 'PO-002',
            supplierId: 2,
            status: 'pending',
            orderDate: '2024-01-16T14:00:00Z',
            expectedDelivery: '2024-01-18T08:00:00Z',
            items: [
                {
                    ingredientId: 2,
                    quantity: 30,
                    costPerUnit: 8.99,
                    totalCost: 269.7
                }
            ],
            totalAmount: 269.7,
            notes: 'Emergency restock - low inventory',
            createdBy: 1
        }
    ]);

    const categories = ref([
        { id: 'vegetables', name: 'Vegetables', color: '#4CAF50', icon: 'pi-leaf' },
        { id: 'meat', name: 'Meat & Poultry', color: '#F44336', icon: 'pi-heart' },
        { id: 'seafood', name: 'Seafood', color: '#2196F3', icon: 'pi-send' },
        { id: 'dairy', name: 'Dairy Products', color: '#FF9800', icon: 'pi-circle' },
        { id: 'dry-goods', name: 'Dry Goods', color: '#795548', icon: 'pi-box' },
        { id: 'spices', name: 'Spices & Seasonings', color: '#9C27B0', icon: 'pi-star' },
        { id: 'oils', name: 'Oils & Condiments', color: '#FFEB3B', icon: 'pi-eye-slash' },
        { id: 'beverages', name: 'Beverages', color: '#00BCD4', icon: 'pi-bookmark' },
        { id: 'frozen', name: 'Frozen Items', color: '#607D8B', icon: 'pi-stop-circle' }
    ]);

    // Computed properties
    const lowStockItems = computed(() => {
        return ingredients.value.filter((item) => item.currentStock <= item.minStock && item.status !== 'out-of-stock');
    });

    const outOfStockItems = computed(() => {
        return ingredients.value.filter((item) => item.currentStock === 0);
    });

    const expiringItems = computed(() => {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        return ingredients.value.filter((item) => {
            const expiryDate = new Date(item.expiryDate);
            return expiryDate <= threeDaysFromNow && item.currentStock > 0;
        });
    });

    const totalInventoryValue = computed(() => {
        return ingredients.value.reduce((total, item) => {
            return total + item.currentStock * item.costPerUnit;
        }, 0);
    });

    const inventoryByCategory = computed(() => {
        const categoryData = {};
        categories.value.forEach((cat) => {
            categoryData[cat.id] = {
                ...cat,
                items: ingredients.value.filter((item) => item.category === cat.id),
                totalValue: 0,
                totalItems: 0
            };
        });

        ingredients.value.forEach((item) => {
            if (categoryData[item.category]) {
                categoryData[item.category].totalValue += item.currentStock * item.costPerUnit;
                categoryData[item.category].totalItems += 1;
            }
        });

        return Object.values(categoryData);
    });

    const criticalAlerts = computed(() => {
        const alerts = [];

        // Out of stock alerts
        outOfStockItems.value.forEach((item) => {
            alerts.push({
                id: `out-${item.id}`,
                type: 'critical',
                title: 'Out of Stock',
                message: `${item.name} is completely out of stock`,
                ingredient: item,
                action: 'reorder',
                priority: 3
            });
        });

        // Low stock alerts
        lowStockItems.value.forEach((item) => {
            alerts.push({
                id: `low-${item.id}`,
                type: 'warning',
                title: 'Low Stock',
                message: `${item.name} is running low (${item.currentStock} ${item.unit} remaining)`,
                ingredient: item,
                action: 'reorder',
                priority: 2
            });
        });

        // Expiring items alerts
        expiringItems.value.forEach((item) => {
            const daysUntilExpiry = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            alerts.push({
                id: `exp-${item.id}`,
                type: 'info',
                title: 'Expiring Soon',
                message: `${item.name} expires in ${daysUntilExpiry} day(s)`,
                ingredient: item,
                action: 'use-first',
                priority: 1
            });
        });

        return alerts.sort((a, b) => b.priority - a.priority);
    });

    // Actions
    const addIngredient = async (ingredientData) => {
        try {
            const newId = Math.max(...ingredients.value.map((i) => i.id), 0) + 1;
            const newIngredient = {
                id: newId,
                ...ingredientData,
                status: getStockStatus(ingredientData.currentStock, ingredientData.minStock),
                lastRestocked: new Date().toISOString(),
                barcode: generateBarcode()
            };

            ingredients.value.push(newIngredient);

            // Add stock movement record
            addStockMovement({
                ingredientId: newId,
                type: 'initial',
                quantity: ingredientData.currentStock,
                notes: 'Initial stock entry',
                costPerUnit: ingredientData.costPerUnit,
                totalCost: ingredientData.currentStock * ingredientData.costPerUnit
            });

            toast.add({
                severity: 'success',
                summary: 'Ingredient Added',
                detail: `${ingredientData.name} has been added to inventory`,
                life: 3000
            });

            return newIngredient;
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to add ingredient',
                life: 5000
            });
            throw error;
        }
    };

    const updateIngredient = async (id, updates) => {
        try {
            const index = ingredients.value.findIndex((i) => i.id === id);
            if (index === -1) {
                throw new Error('Ingredient not found');
            }

            const oldIngredient = { ...ingredients.value[index] };
            ingredients.value[index] = {
                ...ingredients.value[index],
                ...updates,
                status: getStockStatus(updates.currentStock ?? ingredients.value[index].currentStock, updates.minStock ?? ingredients.value[index].minStock)
            };

            // Track stock changes
            if (updates.currentStock !== undefined && updates.currentStock !== oldIngredient.currentStock) {
                const difference = updates.currentStock - oldIngredient.currentStock;
                const movementType = difference > 0 ? 'adjustment' : 'adjustment';

                addStockMovement({
                    ingredientId: id,
                    type: movementType,
                    quantity: difference,
                    notes: `Stock adjustment: ${oldIngredient.currentStock} → ${updates.currentStock}`,
                    costPerUnit: ingredients.value[index].costPerUnit,
                    totalCost: Math.abs(difference) * ingredients.value[index].costPerUnit
                });
            }

            toast.add({
                severity: 'success',
                summary: 'Ingredient Updated',
                detail: `${ingredients.value[index].name} has been updated`,
                life: 3000
            });
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update ingredient',
                life: 5000
            });
            throw error;
        }
    };

    const deleteIngredient = async (id) => {
        try {
            const index = ingredients.value.findIndex((i) => i.id === id);
            if (index === -1) {
                throw new Error('Ingredient not found');
            }

            const ingredientName = ingredients.value[index].name;
            ingredients.value.splice(index, 1);

            // Remove associated stock movements
            stockMovements.value = stockMovements.value.filter((m) => m.ingredientId !== id);

            toast.add({
                severity: 'success',
                summary: 'Ingredient Deleted',
                detail: `${ingredientName} has been removed from inventory`,
                life: 3000
            });
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete ingredient',
                life: 5000
            });
            throw error;
        }
    };

    const adjustStock = async (ingredientId, adjustment, reason = '') => {
        try {
            const ingredient = ingredients.value.find((i) => i.id === ingredientId);
            if (!ingredient) {
                throw new Error('Ingredient not found');
            }

            const newStock = Math.max(0, ingredient.currentStock + adjustment);
            ingredient.currentStock = newStock;
            ingredient.status = getStockStatus(newStock, ingredient.minStock);
            ingredient.lastRestocked = adjustment > 0 ? new Date().toISOString() : ingredient.lastRestocked;

            // Add stock movement record
            addStockMovement({
                ingredientId,
                type: adjustment > 0 ? 'restock' : 'usage',
                quantity: adjustment,
                notes: reason || `Stock ${adjustment > 0 ? 'increase' : 'decrease'}`,
                costPerUnit: ingredient.costPerUnit,
                totalCost: Math.abs(adjustment) * ingredient.costPerUnit
            });

            toast.add({
                severity: 'success',
                summary: 'Stock Updated',
                detail: `${ingredient.name} stock adjusted by ${adjustment} ${ingredient.unit}`,
                life: 3000
            });
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to adjust stock',
                life: 5000
            });
            throw error;
        }
    };

    const addStockMovement = (movementData) => {
        const newId = Math.max(...stockMovements.value.map((m) => m.id), 0) + 1;
        const movement = {
            id: newId,
            date: new Date().toISOString(),
            userId: 1, // Would come from auth store
            ...movementData
        };

        stockMovements.value.unshift(movement);
    };

    const createPurchaseOrder = async (orderData) => {
        try {
            const newId = `PO-${String(purchaseOrders.value.length + 1).padStart(3, '0')}`;
            const order = {
                id: newId,
                status: 'pending',
                orderDate: new Date().toISOString(),
                createdBy: 1, // Would come from auth store
                ...orderData,
                totalAmount: orderData.items.reduce((sum, item) => sum + item.totalCost, 0)
            };

            purchaseOrders.value.unshift(order);

            toast.add({
                severity: 'success',
                summary: 'Purchase Order Created',
                detail: `Order ${newId} has been created`,
                life: 3000
            });

            return order;
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to create purchase order',
                life: 5000
            });
            throw error;
        }
    };

    const updatePurchaseOrder = async (orderId, updates) => {
        try {
            const index = purchaseOrders.value.findIndex((o) => o.id === orderId);
            if (index === -1) {
                throw new Error('Purchase order not found');
            }

            purchaseOrders.value[index] = {
                ...purchaseOrders.value[index],
                ...updates
            };

            // If order is being marked as delivered, update ingredient stocks
            if (updates.status === 'delivered' && purchaseOrders.value[index].status !== 'delivered') {
                purchaseOrders.value[index].actualDelivery = new Date().toISOString();

                // Update ingredient stocks
                purchaseOrders.value[index].items.forEach((item) => {
                    adjustStock(item.ingredientId, item.quantity, `Delivery from PO ${orderId}`);
                });
            }

            toast.add({
                severity: 'success',
                summary: 'Order Updated',
                detail: `Purchase order ${orderId} has been updated`,
                life: 3000
            });
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update purchase order',
                life: 5000
            });
            throw error;
        }
    };

    const generateReorderSuggestions = () => {
        const suggestions = [];

        lowStockItems.value.concat(outOfStockItems.value).forEach((item) => {
            const supplier = suppliers.value.find((s) => s.id === item.supplierId);
            const suggestedQuantity = item.maxStock - item.currentStock;

            suggestions.push({
                ingredient: item,
                supplier,
                suggestedQuantity,
                estimatedCost: suggestedQuantity * item.costPerUnit,
                urgency: item.currentStock === 0 ? 'critical' : 'high'
            });
        });

        return suggestions.sort((a, b) => {
            if (a.urgency === 'critical' && b.urgency !== 'critical') return -1;
            if (b.urgency === 'critical' && a.urgency !== 'critical') return 1;
            return 0;
        });
    };

    // Helper functions
    const getStockStatus = (currentStock, minStock) => {
        if (currentStock === 0) return 'out-of-stock';
        if (currentStock <= minStock) return 'low-stock';
        return 'in-stock';
    };

    const generateBarcode = () => {
        return '123456' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    };

    const getCategoryById = (categoryId) => {
        return categories.value.find((cat) => cat.id === categoryId);
    };

    const getSupplierById = (supplierId) => {
        return suppliers.value.find((sup) => sup.id === supplierId);
    };

    const getIngredientById = (ingredientId) => {
        return ingredients.value.find((ing) => ing.id === ingredientId);
    };

    return {
        // State
        ingredients,
        suppliers,
        stockMovements,
        purchaseOrders,
        categories,

        // Computed
        lowStockItems,
        outOfStockItems,
        expiringItems,
        totalInventoryValue,
        inventoryByCategory,
        criticalAlerts,

        // Actions
        addIngredient,
        updateIngredient,
        deleteIngredient,
        adjustStock,
        addStockMovement,
        createPurchaseOrder,
        updatePurchaseOrder,
        generateReorderSuggestions,

        // Helpers
        getCategoryById,
        getSupplierById,
        getIngredientById
    };
});

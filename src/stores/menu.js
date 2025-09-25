import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMenuStore = defineStore('menu', () => {
    // State
    const categories = ref([]);
    const items = ref([]);
    const modifiers = ref([]);
    const isLoading = ref(false);
    const searchQuery = ref('');
    const selectedCategory = ref(null);

    // Getters
    const filteredItems = computed(() => {
        let filtered = items.value;

        // Filter by category
        if (selectedCategory.value) {
            filtered = filtered.filter((item) => item.categoryId === selectedCategory.value.id);
        }

        // Filter by search query
        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase();
            filtered = filtered.filter((item) => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query));
        }

        // Only show available items
        filtered = filtered.filter((item) => item.isAvailable);

        return filtered;
    });

    const availableCategories = computed(() => {
        return categories.value.filter((cat) => cat.isActive);
    });

    const getItemById = computed(() => {
        return (id) => items.value.find((item) => item.id === id);
    });

    const getCategoryById = computed(() => {
        return (id) => categories.value.find((cat) => cat.id === id);
    });

    const getModifiersByItemId = computed(() => {
        return (itemId) => modifiers.value.filter((mod) => mod.itemId === itemId);
    });

    // Actions
    const fetchCategories = async () => {
        isLoading.value = true;
        try {
            const response = await simulateFetchCategories();
            categories.value = response;
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const fetchItems = async () => {
        isLoading.value = true;
        try {
            const response = await simulateFetchItems();
            items.value = response;
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const fetchModifiers = async () => {
        isLoading.value = true;
        try {
            const response = await simulateFetchModifiers();
            modifiers.value = response;
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const addCategory = async (categoryData) => {
        isLoading.value = true;
        try {
            const response = await simulateAddCategory(categoryData);
            categories.value.push(response);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const updateCategory = async (id, categoryData) => {
        isLoading.value = true;
        try {
            const response = await simulateUpdateCategory(id, categoryData);
            const index = categories.value.findIndex((cat) => cat.id === id);
            if (index !== -1) {
                categories.value[index] = response;
            }
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const deleteCategory = async (id) => {
        isLoading.value = true;
        try {
            await simulateDeleteCategory(id);
            categories.value = categories.value.filter((cat) => cat.id !== id);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const addItem = async (itemData) => {
        isLoading.value = true;
        try {
            const response = await simulateAddItem(itemData);
            items.value.push(response);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const updateItem = async (id, itemData) => {
        isLoading.value = true;
        try {
            const response = await simulateUpdateItem(id, itemData);
            const index = items.value.findIndex((item) => item.id === id);
            if (index !== -1) {
                items.value[index] = response;
            }
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const deleteItem = async (id) => {
        isLoading.value = true;
        try {
            await simulateDeleteItem(id);
            items.value = items.value.filter((item) => item.id !== id);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const toggleItemAvailability = async (id) => {
        const item = items.value.find((item) => item.id === id);
        if (item) {
            item.isAvailable = !item.isAvailable;
            // In real app, sync with backend
            await simulateToggleAvailability(id, item.isAvailable);
        }
    };

    const setSearchQuery = (query) => {
        searchQuery.value = query;
    };

    const setSelectedCategory = (category) => {
        selectedCategory.value = category;
    };

    const clearFilters = () => {
        searchQuery.value = '';
        selectedCategory.value = null;
    };

    // Mock API functions (replace with actual API calls)
    const simulateFetchCategories = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: 1, name: 'Appetizers', description: 'Start your meal right', isActive: true, sortOrder: 1 },
                    { id: 2, name: 'Main Course', description: 'Hearty main dishes', isActive: true, sortOrder: 2 },
                    { id: 3, name: 'Desserts', description: 'Sweet endings', isActive: true, sortOrder: 3 },
                    { id: 4, name: 'Beverages', description: 'Refreshing drinks', isActive: true, sortOrder: 4 },
                    { id: 5, name: 'Salads', description: 'Fresh and healthy', isActive: true, sortOrder: 5 }
                ]);
            }, 500);
        });
    };

    const simulateFetchItems = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        categoryId: 1,
                        name: 'Caesar Salad',
                        description: 'Crisp romaine lettuce with caesar dressing',
                        price: 12.99,
                        image: '/api/placeholder/300/200',
                        isAvailable: true,
                        prepTime: 10,
                        calories: 350,
                        allergens: ['gluten', 'dairy'],
                        isVegetarian: true,
                        isVegan: false,
                        spiceLevel: 0
                    },
                    {
                        id: 2,
                        categoryId: 2,
                        name: 'Grilled Chicken',
                        description: 'Juicy grilled chicken breast with herbs',
                        price: 18.99,
                        image: '/api/placeholder/300/200',
                        isAvailable: true,
                        prepTime: 25,
                        calories: 450,
                        allergens: [],
                        isVegetarian: false,
                        isVegan: false,
                        spiceLevel: 1
                    },
                    {
                        id: 3,
                        categoryId: 3,
                        name: 'Chocolate Cake',
                        description: 'Rich chocolate cake with ganache',
                        price: 8.99,
                        image: '/api/placeholder/300/200',
                        isAvailable: true,
                        prepTime: 5,
                        calories: 520,
                        allergens: ['gluten', 'dairy', 'eggs'],
                        isVegetarian: true,
                        isVegan: false,
                        spiceLevel: 0
                    },
                    {
                        id: 4,
                        categoryId: 4,
                        name: 'Fresh Orange Juice',
                        description: 'Freshly squeezed orange juice',
                        price: 4.99,
                        image: '/api/placeholder/300/200',
                        isAvailable: true,
                        prepTime: 2,
                        calories: 110,
                        allergens: [],
                        isVegetarian: true,
                        isVegan: true,
                        spiceLevel: 0
                    }
                ]);
            }, 500);
        });
    };

    const simulateFetchModifiers = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        itemId: 1,
                        name: 'Extra Croutons',
                        price: 2.0,
                        type: 'addon'
                    },
                    {
                        id: 2,
                        itemId: 1,
                        name: 'No Anchovies',
                        price: 0,
                        type: 'option'
                    },
                    {
                        id: 3,
                        itemId: 2,
                        name: 'Extra Spicy',
                        price: 0,
                        type: 'option'
                    },
                    {
                        id: 4,
                        itemId: 2,
                        name: 'Side of Rice',
                        price: 3.0,
                        type: 'addon'
                    }
                ]);
            }, 300);
        });
    };

    const simulateAddCategory = async (categoryData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: Date.now(),
                    ...categoryData,
                    isActive: true
                });
            }, 500);
        });
    };

    const simulateUpdateCategory = async (id, categoryData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id,
                    ...categoryData
                });
            }, 500);
        });
    };

    // eslint-disable-next-line no-unused-vars
    const simulateDeleteCategory = async (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 300);
        });
    };

    const simulateAddItem = async (itemData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: Date.now(),
                    ...itemData,
                    isAvailable: true
                });
            }, 500);
        });
    };

    const simulateUpdateItem = async (id, itemData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id,
                    ...itemData
                });
            }, 500);
        });
    };

    // eslint-disable-next-line no-unused-vars
    const simulateDeleteItem = async (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 300);
        });
    };

    const simulateToggleAvailability = async (id, isAvailable) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, isAvailable });
            }, 200);
        });
    };

    return {
        // State
        categories,
        items,
        modifiers,
        isLoading,
        searchQuery,
        selectedCategory,

        // Getters
        filteredItems,
        availableCategories,
        getItemById,
        getCategoryById,
        getModifiersByItemId,

        // Actions
        fetchCategories,
        fetchItems,
        fetchModifiers,
        addCategory,
        updateCategory,
        deleteCategory,
        addItem,
        updateItem,
        deleteItem,
        toggleItemAvailability,
        setSearchQuery,
        setSelectedCategory,
        clearFilters
    };
});

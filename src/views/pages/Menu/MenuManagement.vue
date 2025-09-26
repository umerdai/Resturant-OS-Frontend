<script setup>
import { ref, computed, onMounted } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { useMenuStore } from '@/stores/menu';

const confirm = useConfirm();
const toast = useToast();
const menuStore = useMenuStore();

// Component state
const categoryFilter = ref('');
const itemFilter = ref('');
const selectedCategoryFilter = ref(null);

// Dialog states
const showAddCategoryDialog = ref(false);
const showEditCategoryDialog = ref(false);
const showAddItemDialog = ref(false);
const showEditItemDialog = ref(false);
const showAddModifierDialog = ref(false);
const showEditModifierDialog = ref(false);
const showItemDetailsDialog = ref(false);

// Form data
const categoryForm = ref({
    name: '',
    description: '',
    icon: 'pi pi-utensils',
    displayOrder: 0
});

const itemForm = ref({
    name: '',
    description: '',
    price: 0,
    categoryId: null,
    imageUrl: '',
    modifierIds: [],
    available: true,
    featured: false,
    popular: false
});

const modifierForm = ref({
    name: '',
    type: 'single',
    required: false,
    options: []
});

// Editing states
const editingCategory = ref(null);
const editingItem = ref(null);
const editingModifier = ref(null);
const selectedItem = ref(null);

// Static data
const modifierTypes = [
    { label: 'Single Choice', value: 'single' },
    { label: 'Multiple Choice', value: 'multiple' }
];

// Computed properties
const availableItemsCount = computed(() => {
    return menuStore.items.filter((item) => item.available).length;
});

const categoryFilterOptions = computed(() => {
    return [{ id: null, name: 'All Categories' }, ...menuStore.categories];
});

const filteredItems = computed(() => {
    let items = menuStore.items;

    // Filter by category
    if (selectedCategoryFilter.value && selectedCategoryFilter.value.id) {
        items = items.filter((item) => item.categoryId === selectedCategoryFilter.value.id);
    }

    // Filter by search term
    if (itemFilter.value) {
        const search = itemFilter.value.toLowerCase();
        items = items.filter((item) => item.name.toLowerCase().includes(search) || item.description.toLowerCase().includes(search));
    }

    return items;
});

// Methods
const getItemCountForCategory = (categoryId) => {
    return menuStore.items.filter((item) => item.categoryId === categoryId).length;
};

const getCategoryName = (categoryId) => {
    const category = menuStore.categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown';
};

const getModifierName = (modifierId) => {
    const modifier = menuStore.modifiers.find((m) => m.id === modifierId);
    return modifier ? modifier.name : 'Unknown';
};

// Category methods
const editCategory = (category) => {
    editingCategory.value = category;
    categoryForm.value = { ...category };
    showEditCategoryDialog.value = true;
};

const closeCategoryDialog = () => {
    showAddCategoryDialog.value = false;
    showEditCategoryDialog.value = false;
    editingCategory.value = null;
    categoryForm.value = {
        name: '',
        description: '',
        icon: 'pi pi-utensils',
        displayOrder: 0
    };
};

const saveCategory = async () => {
    try {
        if (editingCategory.value) {
            await menuStore.updateCategory(editingCategory.value.id, categoryForm.value);
            toast.add({
                severity: 'success',
                summary: 'Category Updated',
                detail: 'Category has been updated successfully',
                life: 3000
            });
        } else {
            await menuStore.createCategory(categoryForm.value);
            toast.add({
                severity: 'success',
                summary: 'Category Created',
                detail: 'New category has been created successfully',
                life: 3000
            });
        }
        closeCategoryDialog();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to save category',
            life: 5000
        });
    }
};

const confirmDeleteCategory = (category) => {
    confirm.require({
        message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
        header: 'Delete Category',
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        acceptClass: 'p-button-danger',
        accept: () => deleteCategory(category.id)
    });
};

const deleteCategory = async (categoryId) => {
    try {
        await menuStore.deleteCategory(categoryId);
        toast.add({
            severity: 'success',
            summary: 'Category Deleted',
            detail: 'Category has been deleted successfully',
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete category',
            life: 5000
        });
    }
};

const moveCategoryUp = () => {
    // TODO: Implement category reordering
    toast.add({
        severity: 'info',
        summary: 'Feature Coming Soon',
        detail: 'Category reordering will be implemented soon',
        life: 3000
    });
};

const moveCategoryDown = () => {
    // TODO: Implement category reordering
    toast.add({
        severity: 'info',
        summary: 'Feature Coming Soon',
        detail: 'Category reordering will be implemented soon',
        life: 3000
    });
};

// Item methods
const viewItem = (item) => {
    selectedItem.value = item;
    showItemDetailsDialog.value = true;
};

const editItem = (item) => {
    editingItem.value = item;
    itemForm.value = {
        ...item,
        modifierIds: item.modifierIds || []
    };
    showEditItemDialog.value = true;
};

const closeItemDialog = () => {
    showAddItemDialog.value = false;
    showEditItemDialog.value = false;
    editingItem.value = null;
    itemForm.value = {
        name: '',
        description: '',
        price: 0,
        categoryId: null,
        imageUrl: '',
        modifierIds: [],
        available: true,
        featured: false,
        popular: false
    };
};

const saveItem = async () => {
    try {
        if (editingItem.value) {
            await menuStore.updateItem(editingItem.value.id, itemForm.value);
            toast.add({
                severity: 'success',
                summary: 'Item Updated',
                detail: 'Menu item has been updated successfully',
                life: 3000
            });
        } else {
            await menuStore.createItem(itemForm.value);
            toast.add({
                severity: 'success',
                summary: 'Item Created',
                detail: 'New menu item has been created successfully',
                life: 3000
            });
        }
        closeItemDialog();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to save item',
            life: 5000
        });
    }
};

const toggleItemAvailability = async (item) => {
    try {
        await menuStore.updateItem(item.id, { available: !item.available });
        toast.add({
            severity: 'success',
            summary: 'Item Updated',
            detail: `Item ${item.available ? 'disabled' : 'enabled'} successfully`,
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to update item',
            life: 5000
        });
    }
};

const confirmDeleteItem = (item) => {
    confirm.require({
        message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
        header: 'Delete Menu Item',
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        acceptClass: 'p-button-danger',
        accept: () => deleteItem(item.id)
    });
};

const deleteItem = async (itemId) => {
    try {
        await menuStore.deleteItem(itemId);
        toast.add({
            severity: 'success',
            summary: 'Item Deleted',
            detail: 'Menu item has been deleted successfully',
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete item',
            life: 5000
        });
    }
};

// Modifier methods
const editModifier = (modifier) => {
    editingModifier.value = modifier;
    modifierForm.value = {
        ...modifier,
        options: [...(modifier.options || [])]
    };
    showEditModifierDialog.value = true;
};

const closeModifierDialog = () => {
    showAddModifierDialog.value = false;
    showEditModifierDialog.value = false;
    editingModifier.value = null;
    modifierForm.value = {
        name: '',
        type: 'single',
        required: false,
        options: []
    };
};

const saveModifier = async () => {
    try {
        if (editingModifier.value) {
            await menuStore.updateModifier(editingModifier.value.id, modifierForm.value);
            toast.add({
                severity: 'success',
                summary: 'Modifier Updated',
                detail: 'Modifier has been updated successfully',
                life: 3000
            });
        } else {
            await menuStore.createModifier(modifierForm.value);
            toast.add({
                severity: 'success',
                summary: 'Modifier Created',
                detail: 'New modifier has been created successfully',
                life: 3000
            });
        }
        closeModifierDialog();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to save modifier',
            life: 5000
        });
    }
};

const confirmDeleteModifier = (modifier) => {
    confirm.require({
        message: `Are you sure you want to delete "${modifier.name}"? This action cannot be undone.`,
        header: 'Delete Modifier',
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        acceptClass: 'p-button-danger',
        accept: () => deleteModifier(modifier.id)
    });
};

const deleteModifier = async (modifierId) => {
    try {
        await menuStore.deleteModifier(modifierId);
        toast.add({
            severity: 'success',
            summary: 'Modifier Deleted',
            detail: 'Modifier has been deleted successfully',
            life: 3000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to delete modifier',
            life: 5000
        });
    }
};

const addModifierOption = () => {
    modifierForm.value.options.push({
        name: '',
        price: 0
    });
};

const removeModifierOption = (index) => {
    modifierForm.value.options.splice(index, 1);
};

// Lifecycle
onMounted(async () => {
    await menuStore.fetchCategories();
    await menuStore.fetchItems();
    await menuStore.fetchModifiers();
});
</script>

<template>
    <div class="menu-management">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Menu Management</h1>
                <p class="text-surface-600 dark:text-surface-400">Manage menu categories, items, and modifiers</p>
            </div>
            <div class="flex gap-2">
                <Button label="New Category" icon="pi pi-plus" @click="showAddCategoryDialog = true" />
                <Button label="New Item" icon="pi pi-plus" @click="showAddItemDialog = true" />
            </div>
        </div>

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-blue-600 mb-1">
                            {{ menuStore.categories.length }}
                        </div>
                        <div class="text-sm text-muted-color">Categories</div>
                    </div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-green-600 mb-1">
                            {{ menuStore.items.length }}
                        </div>
                        <div class="text-sm text-muted-color">Menu Items</div>
                    </div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-purple-600 mb-1">
                            {{ availableItemsCount }}
                        </div>
                        <div class="text-sm text-muted-color">Available</div>
                    </div>
                </template>
            </Card>

            <Card class="text-center">
                <template #content>
                    <div class="p-4">
                        <div class="text-2xl font-bold text-orange-600 mb-1">
                            {{ menuStore.modifiers.length }}
                        </div>
                        <div class="text-sm text-muted-color">Modifiers</div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Menu Management Tabs -->
        <TabView>
            <!-- Categories Tab -->
            <TabPanel header="Categories">
                <DataTable :value="menuStore.categories" :loading="menuStore.isLoading" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20]" sortField="name" :sortOrder="1" filterDisplay="menu" :globalFilterFields="['name', 'description']">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-semibold">Categories</h3>
                            <span class="p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="categoryFilter" placeholder="Search categories..." />
                            </span>
                        </div>
                    </template>

                    <Column field="name" header="Name" sortable>
                        <template #body="slotProps">
                            <div class="flex items-center gap-2">
                                <i :class="slotProps.data.icon" class="text-lg"></i>
                                <span class="font-medium">{{ slotProps.data.name }}</span>
                            </div>
                        </template>
                    </Column>

                    <Column field="description" header="Description" sortable></Column>

                    <Column field="itemCount" header="Items" sortable>
                        <template #body="slotProps">
                            <Tag :value="getItemCountForCategory(slotProps.data.id)" severity="info" />
                        </template>
                    </Column>

                    <Column field="displayOrder" header="Order" sortable>
                        <template #body="slotProps">
                            <div class="flex gap-1">
                                <Button icon="pi pi-angle-up" size="small" text @click="moveCategoryUp(slotProps.data.id)" :disabled="slotProps.index === 0" />
                                <Button icon="pi pi-angle-down" size="small" text @click="moveCategoryDown(slotProps.data.id)" :disabled="slotProps.index === menuStore.categories.length - 1" />
                            </div>
                        </template>
                    </Column>

                    <Column header="Actions" :exportable="false">
                        <template #body="slotProps">
                            <div class="flex gap-2">
                                <Button icon="pi pi-pencil" size="small" outlined @click="editCategory(slotProps.data)" />
                                <Button icon="pi pi-trash" size="small" outlined severity="danger" @click="confirmDeleteCategory(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>

            <!-- Menu Items Tab -->
            <TabPanel header="Menu Items">
                <DataTable
                    :value="filteredItems"
                    :loading="menuStore.isLoading"
                    paginator
                    :rows="10"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    sortField="name"
                    :sortOrder="1"
                    filterDisplay="menu"
                    :globalFilterFields="['name', 'description', 'category']"
                >
                    <template #header>
                        <div class="flex justify-between items-center flex-wrap gap-4">
                            <h3 class="text-lg font-semibold">Menu Items</h3>
                            <div class="flex gap-2 items-center">
                                <Dropdown v-model="selectedCategoryFilter" :options="categoryFilterOptions" optionLabel="name" placeholder="Filter by category" class="w-48" showClear />
                                <span class="p-input-icon-left">
                                    <i class="pi pi-search" />
                                    <InputText v-model="itemFilter" placeholder="Search items..." />
                                </span>
                            </div>
                        </div>
                    </template>

                    <Column field="image" header="Image">
                        <template #body="slotProps">
                            <img :src="slotProps.data.imageUrl || '/api/placeholder/60/60'" :alt="slotProps.data.name" class="w-12 h-12 object-cover rounded-lg" />
                        </template>
                    </Column>

                    <Column field="name" header="Name" sortable>
                        <template #body="slotProps">
                            <div>
                                <div class="font-medium">{{ slotProps.data.name }}</div>
                                <div class="text-sm text-surface-600 dark:text-surface-400">
                                    {{ slotProps.data.description }}
                                </div>
                            </div>
                        </template>
                    </Column>

                    <Column field="category" header="Category" sortable>
                        <template #body="slotProps">
                            <Tag :value="getCategoryName(slotProps.data.categoryId)" severity="info" />
                        </template>
                    </Column>

                    <Column field="price" header="Price" sortable>
                        <template #body="slotProps">
                            <div class="font-medium">${{ slotProps.data.price.toFixed(2) }}</div>
                        </template>
                    </Column>

                    <Column field="available" header="Status" sortable>
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.available ? 'Available' : 'Unavailable'" :severity="slotProps.data.available ? 'success' : 'danger'" />
                        </template>
                    </Column>

                    <Column field="modifiers" header="Modifiers">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.modifierIds?.length || 0" severity="secondary" />
                        </template>
                    </Column>

                    <Column header="Actions" :exportable="false">
                        <template #body="slotProps">
                            <div class="flex gap-2">
                                <Button icon="pi pi-eye" size="small" text @click="viewItem(slotProps.data)" />
                                <Button icon="pi pi-pencil" size="small" outlined @click="editItem(slotProps.data)" />
                                <Button
                                    :icon="slotProps.data.available ? 'pi pi-eye-slash' : 'pi pi-eye'"
                                    size="small"
                                    :outlined="slotProps.data.available"
                                    :severity="slotProps.data.available ? 'warning' : 'success'"
                                    @click="toggleItemAvailability(slotProps.data)"
                                />
                                <Button icon="pi pi-trash" size="small" outlined severity="danger" @click="confirmDeleteItem(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>

            <!-- Modifiers Tab -->
            <TabPanel header="Modifiers">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Modifiers</h3>
                    <Button label="New Modifier" icon="pi pi-plus" @click="showAddModifierDialog = true" />
                </div>

                <DataTable :value="menuStore.modifiers" :loading="menuStore.isLoading" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20]" sortField="name" :sortOrder="1">
                    <Column field="name" header="Name" sortable></Column>
                    <Column field="type" header="Type" sortable>
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.type" :severity="slotProps.data.type === 'single' ? 'info' : 'success'" />
                        </template>
                    </Column>
                    <Column field="options" header="Options">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.options?.length || 0" severity="secondary" />
                        </template>
                    </Column>
                    <Column field="required" header="Required">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.required ? 'Yes' : 'No'" :severity="slotProps.data.required ? 'warning' : 'secondary'" />
                        </template>
                    </Column>
                    <Column header="Actions" :exportable="false">
                        <template #body="slotProps">
                            <div class="flex gap-2">
                                <Button icon="pi pi-pencil" size="small" outlined @click="editModifier(slotProps.data)" />
                                <Button icon="pi pi-trash" size="small" outlined severity="danger" @click="confirmDeleteModifier(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>
        </TabView>

        <!-- Add/Edit Category Dialog -->
        <Dialog :visible="showAddCategoryDialog || showEditCategoryDialog" @update:visible="closeCategoryDialog" modal :header="editingCategory ? 'Edit Category' : 'Add New Category'" :style="{ width: '500px' }">
            <form @submit.prevent="saveCategory" class="space-y-4">
                <div class="field">
                    <label class="block text-sm font-medium mb-2">Category Name *</label>
                    <InputText v-model="categoryForm.name" placeholder="Enter category name" class="w-full" required />
                </div>

                <div class="field">
                    <label class="block text-sm font-medium mb-2">Description</label>
                    <Textarea v-model="categoryForm.description" placeholder="Enter category description" rows="3" class="w-full" />
                </div>

                <div class="field">
                    <label class="block text-sm font-medium mb-2">Icon</label>
                    <InputText v-model="categoryForm.icon" placeholder="pi pi-utensils" class="w-full" />
                    <small class="text-surface-600 dark:text-surface-400"> Use PrimeIcons classes (e.g., pi pi-utensils) </small>
                </div>

                <div class="field">
                    <label class="block text-sm font-medium mb-2">Display Order</label>
                    <InputNumber v-model="categoryForm.displayOrder" :min="0" class="w-full" />
                </div>

                <div class="flex justify-end gap-2 pt-4">
                    <Button label="Cancel" outlined @click="closeCategoryDialog" />
                    <Button type="submit" :label="editingCategory ? 'Update' : 'Create'" :loading="menuStore.isLoading" />
                </div>
            </form>
        </Dialog>

        <!-- Add/Edit Item Dialog -->
        <Dialog :visible="showAddItemDialog || showEditItemDialog" @update:visible="closeItemDialog" modal :header="editingItem ? 'Edit Menu Item' : 'Add New Menu Item'" :style="{ width: '700px' }">
            <form @submit.prevent="saveItem" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="field">
                        <label class="block text-sm font-medium mb-2">Item Name *</label>
                        <InputText v-model="itemForm.name" placeholder="Enter item name" class="w-full" required />
                    </div>

                    <div class="field">
                        <label class="block text-sm font-medium mb-2">Price *</label>
                        <InputNumber v-model="itemForm.price" mode="currency" currency="USD" :min="0" :step="0.01" class="w-full" required />
                    </div>
                </div>

                <div class="field">
                    <label class="block text-sm font-medium mb-2">Description</label>
                    <Textarea v-model="itemForm.description" placeholder="Enter item description" rows="3" class="w-full" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="field">
                        <label class="block text-sm font-medium mb-2">Category *</label>
                        <Dropdown v-model="itemForm.categoryId" :options="menuStore.categories" optionLabel="name" optionValue="id" placeholder="Select category" class="w-full" required />
                    </div>

                    <div class="field">
                        <label class="block text-sm font-medium mb-2">Image URL</label>
                        <InputText v-model="itemForm.imageUrl" placeholder="Enter image URL" class="w-full" />
                    </div>
                </div>

                <div class="field">
                    <label class="block text-sm font-medium mb-2">Modifiers</label>
                    <MultiSelect v-model="itemForm.modifierIds" :options="menuStore.modifiers" optionLabel="name" optionValue="id" placeholder="Select modifiers" class="w-full" display="chip" />
                </div>

                <div class="grid grid-cols-3 gap-4">
                    <div class="field">
                        <div class="flex items-center">
                            <Checkbox id="available" v-model="itemForm.available" binary />
                            <label for="available" class="ml-2">Available</label>
                        </div>
                    </div>

                    <div class="field">
                        <div class="flex items-center">
                            <Checkbox id="featured" v-model="itemForm.featured" binary />
                            <label for="featured" class="ml-2">Featured</label>
                        </div>
                    </div>

                    <div class="field">
                        <div class="flex items-center">
                            <Checkbox id="popular" v-model="itemForm.popular" binary />
                            <label for="popular" class="ml-2">Popular</label>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-4">
                    <Button label="Cancel" outlined @click="closeItemDialog" />
                    <Button type="submit" :label="editingItem ? 'Update' : 'Create'" :loading="menuStore.isLoading" />
                </div>
            </form>
        </Dialog>

        <!-- Add/Edit Modifier Dialog -->
        <Dialog :visible="showAddModifierDialog || showEditModifierDialog" @update:visible="closeModifierDialog" modal :header="editingModifier ? 'Edit Modifier' : 'Add New Modifier'" :style="{ width: '600px' }">
            <form @submit.prevent="saveModifier" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="field">
                        <label class="block text-sm font-medium mb-2">Modifier Name *</label>
                        <InputText v-model="modifierForm.name" placeholder="Enter modifier name" class="w-full" required />
                    </div>

                    <div class="field">
                        <label class="block text-sm font-medium mb-2">Type *</label>
                        <Dropdown v-model="modifierForm.type" :options="modifierTypes" optionLabel="label" optionValue="value" placeholder="Select type" class="w-full" required />
                    </div>
                </div>

                <div class="field">
                    <div class="flex items-center">
                        <Checkbox id="required" v-model="modifierForm.required" binary />
                        <label for="required" class="ml-2">Required</label>
                    </div>
                </div>

                <div class="field">
                    <label class="block text-sm font-medium mb-2">Options</label>
                    <div class="space-y-2">
                        <div v-for="(option, index) in modifierForm.options" :key="index" class="flex gap-2 items-center">
                            <InputText v-model="option.name" placeholder="Option name" class="flex-1" />
                            <InputNumber v-model="option.price" mode="currency" currency="USD" :min="0" :step="0.01" placeholder="Price" class="w-32" />
                            <Button icon="pi pi-trash" size="small" outlined severity="danger" @click="removeModifierOption(index)" />
                        </div>
                        <Button label="Add Option" icon="pi pi-plus" size="small" outlined @click="addModifierOption" />
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-4">
                    <Button label="Cancel" outlined @click="closeModifierDialog" />
                    <Button type="submit" :label="editingModifier ? 'Update' : 'Create'" :loading="menuStore.isLoading" />
                </div>
            </form>
        </Dialog>

        <!-- Item Details Dialog -->
        <Dialog :visible="showItemDetailsDialog" @update:visible="showItemDetailsDialog = $event" modal header="Item Details" :style="{ width: '500px' }">
            <div v-if="selectedItem" class="space-y-4">
                <div class="text-center">
                    <img :src="selectedItem.imageUrl || '/api/placeholder/200/150'" :alt="selectedItem.name" class="w-48 h-32 object-cover rounded-lg mx-auto mb-4" />
                    <h3 class="text-xl font-bold">{{ selectedItem.name }}</h3>
                    <p class="text-surface-600 dark:text-surface-400">{{ selectedItem.description }}</p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-surface-600 dark:text-surface-400">Price</label>
                        <div class="text-lg font-semibold">${{ selectedItem.price?.toFixed(2) }}</div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-surface-600 dark:text-surface-400">Category</label>
                        <div>{{ getCategoryName(selectedItem.categoryId) }}</div>
                    </div>
                </div>

                <div v-if="selectedItem.modifierIds?.length">
                    <label class="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-2">Modifiers</label>
                    <div class="flex flex-wrap gap-2">
                        <Tag v-for="modifierId in selectedItem.modifierIds" :key="modifierId" :value="getModifierName(modifierId)" severity="info" />
                    </div>
                </div>

                <div class="flex justify-end">
                    <Button label="Close" @click="showItemDetailsDialog = false" />
                </div>
            </div>
        </Dialog>

        <!-- Delete Confirmation Dialog -->
        <ConfirmDialog />
    </div>
</template>

<style scoped>
.menu-management {
    padding: 1rem;
}
</style>

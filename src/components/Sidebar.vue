<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useOrderStore } from '@/stores/order';
import { useTableStore } from '@/stores/table';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const orderStore = useOrderStore();
const tableStore = useTableStore();

// Component state
const isCollapsed = ref(false);
const isDarkMode = ref(false);
const showQuickStats = ref(true);
const expandedSections = ref({
    orders: false
});

// Quick stats computed
const quickStats = computed(() => ({
    activeOrders: orderStore.orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)).length,
    occupiedTables: tableStore.tables.filter((t) => t.status === 'occupied').length,
    pendingNotifications: 0, // TODO: Implement notifications system
    tablesNeedAttention: tableStore.tables.filter((t) => t.status === 'cleaning').length,
    pendingKitchenOrders: orderStore.orders.filter((o) => o.status === 'pending').length,
    lowStockItems: 5 // TODO: Connect to inventory system
}));

// Methods
const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value;
    // Save preference to localStorage
    localStorage.setItem('sidebar-collapsed', isCollapsed.value);
};

const toggleSection = (section) => {
    if (isCollapsed.value) {
        return;
    }
    expandedSections.value[section] = !expandedSections.value[section];
};

const isRouteActive = (path) => {
    return route.path.startsWith(path);
};

const toggleTheme = () => {
    const theme = isDarkMode.value ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
};

const goToProfile = () => {
    router.push('/profile');
};

const logout = () => {
    authStore.logout();
    router.push('/auth/login');
};

// Watch for route changes to auto-expand sections
watch(
    () => route.path,
    (newPath) => {
        if (newPath.startsWith('/orders')) {
            expandedSections.value.orders = true;
        }
    }
);

// Lifecycle
onMounted(() => {
    // Restore sidebar state
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed !== null) {
        isCollapsed.value = savedCollapsed === 'true';
    }

    // Restore theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        isDarkMode.value = savedTheme === 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Auto-expand current section
    if (route.path.startsWith('/orders')) {
        expandedSections.value.orders = true;
    }
});
</script>

<template>
    <div class="pos-sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
        <!-- Logo and Brand -->
        <div class="sidebar-header">
            <div class="logo-container">
                <img src="/logo.svg" alt="Restaurant POS" class="logo" v-if="!isCollapsed" />
                <i class="pi pi-utensils text-2xl text-primary" v-else></i>
                <h2 v-if="!isCollapsed" class="brand-text">RestaurantOS</h2>
            </div>
            <Button :icon="isCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'" class="toggle-btn" text @click="toggleSidebar" />
        </div>

        <!-- User Info -->
        <div class="user-info" v-if="!isCollapsed">
            <Avatar :label="authStore.user?.name?.charAt(0) || 'U'" class="user-avatar" size="large" style="background-color: var(--primary-color)" />
            <div class="user-details">
                <div class="user-name">{{ authStore.user?.name || 'User' }}</div>
                <div class="user-role">{{ authStore.user?.role || 'Staff' }}</div>
                <div class="user-shift" v-if="authStore.user?.shiftStatus === 'active'">
                    <Tag value="On Duty" severity="success" size="small" />
                </div>
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="quick-stats" v-if="!isCollapsed && showQuickStats">
            <Card class="stats-card">
                <template #content>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <i class="pi pi-shopping-cart text-blue-500"></i>
                            <div class="stat-value">{{ quickStats.activeOrders }}</div>
                            <div class="stat-label">Active Orders</div>
                        </div>
                        <div class="stat-item">
                            <i class="pi pi-users text-green-500"></i>
                            <div class="stat-value">{{ quickStats.occupiedTables }}</div>
                            <div class="stat-label">Occupied Tables</div>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Navigation Menu -->
        <div class="navigation-menu">
            <div class="menu-section">
                <div class="section-title" v-if="!isCollapsed">Operations</div>

                <!-- Dashboard -->
                <router-link to="/dashboard" class="nav-item" :class="{ active: isRouteActive('/dashboard') }" v-tooltip.right="isCollapsed ? 'Dashboard' : ''">
                    <i class="pi pi-chart-line nav-icon"></i>
                    <span class="nav-label" v-if="!isCollapsed">Dashboard</span>
                    <Badge v-if="!isCollapsed && quickStats.pendingNotifications > 0" :value="quickStats.pendingNotifications" severity="danger" class="nav-badge" />
                </router-link>

                <!-- Tables -->
                <router-link to="/tables" class="nav-item" :class="{ active: isRouteActive('/tables') }" v-tooltip.right="isCollapsed ? 'Tables' : ''">
                    <i class="pi pi-th-large nav-icon"></i>
                    <span class="nav-label" v-if="!isCollapsed">Tables</span>
                    <Badge v-if="!isCollapsed && quickStats.tablesNeedAttention > 0" :value="quickStats.tablesNeedAttention" severity="warning" class="nav-badge" />
                </router-link>

                <!-- Orders -->
                <div class="nav-group" v-if="authStore.hasPermission('view_orders')">
                    <div class="nav-item nav-parent" :class="{ active: isRouteActive('/orders'), expanded: expandedSections.orders }" @click="toggleSection('orders')" v-tooltip.right="isCollapsed ? 'Orders' : ''">
                        <i class="pi pi-shopping-cart nav-icon"></i>
                        <span class="nav-label" v-if="!isCollapsed">Orders</span>
                        <i v-if="!isCollapsed" :class="expandedSections.orders ? 'pi pi-angle-down' : 'pi pi-angle-right'" class="expand-icon"></i>
                    </div>
                    <div class="nav-submenu" v-if="!isCollapsed && expandedSections.orders">
                        <router-link to="/orders/new" class="nav-subitem">
                            <i class="pi pi-plus nav-subicon"></i>
                            New Order
                        </router-link>
                        <router-link to="/orders/management" class="nav-subitem">
                            <i class="pi pi-list nav-subicon"></i>
                            Manage Orders
                        </router-link>
                    </div>
                </div>

                <!-- Kitchen Display -->
                <router-link to="/kitchen" class="nav-item" :class="{ active: isRouteActive('/kitchen') }" v-tooltip.right="isCollapsed ? 'Kitchen' : ''" v-if="authStore.hasPermission('view_kitchen')">
                    <i class="pi pi-home nav-icon"></i>
                    <span class="nav-label" v-if="!isCollapsed">Kitchen Display</span>
                    <Badge v-if="!isCollapsed && quickStats.pendingKitchenOrders > 0" :value="quickStats.pendingKitchenOrders" severity="danger" class="nav-badge" />
                </router-link>

                <!-- Billing -->
                <router-link to="/billing" class="nav-item" :class="{ active: isRouteActive('/billing') }" v-tooltip.right="isCollapsed ? 'Billing' : ''" v-if="authStore.hasPermission('process_payments')">
                    <i class="pi pi-credit-card nav-icon"></i>
                    <span class="nav-label" v-if="!isCollapsed">Billing & Payment</span>
                </router-link>
            </div>

            <!-- Management Section -->
            <div class="menu-section" v-if="authStore.hasPermission('manage_restaurant')">
                <div class="section-title" v-if="!isCollapsed">Management</div>

                <!-- Menu Management -->
                <router-link to="/menu" class="nav-item" :class="{ active: isRouteActive('/menu') }" v-tooltip.right="isCollapsed ? 'Menu Management' : ''">
                    <i class="pi pi-book nav-icon"></i>
                    <span class="nav-label" v-if="!isCollapsed">Menu Management</span>
                </router-link>

                <!-- Inventory -->
                <router-link to="/inventory-management" class="nav-item" :class="{ active: isRouteActive('/inventory-management') }" v-tooltip.right="isCollapsed ? 'Inventory Management' : ''">
                    <i class="pi pi-box nav-icon"></i>
                    <span class="nav-label" v-if="!isCollapsed">Inventory Management</span>
                    <Badge v-if="!isCollapsed && quickStats.lowStockItems > 0" :value="quickStats.lowStockItems" severity="danger" class="nav-badge" />
                </router-link>

                <!-- Reports -->
                <router-link to="/reports-analytics" class="nav-item" :class="{ active: isRouteActive('/reports-analytics') }" v-tooltip.right="isCollapsed ? 'Reports & Analytics' : ''">
                    <i class="pi pi-chart-bar nav-icon"></i>
                    <span class="nav-label" v-if="!isCollapsed">Reports & Analytics</span>
                </router-link>

                <!-- Admin Settings -->
                <router-link to="/admin-settings" class="nav-item" :class="{ active: isRouteActive('/admin-settings') }" v-tooltip.right="isCollapsed ? 'Admin Settings' : ''" v-if="authStore.hasPermission('admin_access')">
                    <i class="pi pi-cog nav-icon"></i>
                    <span class="nav-label" v-if="!isCollapsed">Admin Settings</span>
                </router-link>
            </div>
        </div>

        <!-- Theme Toggle -->
        <div class="sidebar-footer">
            <div class="theme-toggle" v-if="!isCollapsed">
                <div class="toggle-label">Dark Mode</div>
                <ToggleButton v-model="isDarkMode" onIcon="pi pi-moon" offIcon="pi pi-sun" @change="toggleTheme" />
            </div>

            <!-- User Actions -->
            <div class="user-actions">
                <Button icon="pi pi-user" text @click="goToProfile" v-tooltip.right="isCollapsed ? 'Profile' : 'My Profile'" />
                <Button icon="pi pi-sign-out" text severity="danger" @click="logout" v-tooltip.right="isCollapsed ? 'Logout' : 'Sign Out'" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.pos-sidebar {
    width: 280px;
    height: 100vh;
    background: linear-gradient(145deg, #ffffff, #f8f9fa);
    border-right: 1px solid #e9ecef;
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-collapsed {
    width: 80px;
}

[data-theme='dark'] .pos-sidebar {
    background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
    border-right-color: #404040;
}

/* Header */
.sidebar-header {
    padding: 1.5rem 1rem;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 80px;
}

[data-theme='dark'] .sidebar-header {
    border-bottom-color: #404040;
}

.logo-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.logo {
    width: 32px;
    height: 32px;
}

.brand-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary-color);
    margin: 0;
}

.toggle-btn {
    min-width: 2rem;
    height: 2rem;
}

/* User Info */
.user-info {
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

[data-theme='dark'] .user-info {
    border-bottom-color: #404040;
}

.user-details {
    flex: 1;
    min-width: 0;
}

.user-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-role {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.user-shift {
    margin-top: 0.25rem;
}

/* Quick Stats */
.quick-stats {
    padding: 1rem;
}

.stats-card {
    margin: 0;
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
}

.stat-item {
    text-align: center;
    padding: 0.5rem;
}

.stat-item i {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
}

.stat-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-color);
}

.stat-label {
    font-size: 0.7rem;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Navigation */
.navigation-menu {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 0;
}

.menu-section {
    margin-bottom: 1.5rem;
}

.section-title {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
}

.nav-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    margin: 0.125rem 0.5rem;
    border-radius: 0.5rem;
    text-decoration: none;
    color: var(--text-color);
    transition: all 0.2s ease;
    position: relative;
    cursor: pointer;
}

.nav-item:hover {
    background-color: rgba(var(--primary-color-rgb), 0.1);
    color: var(--primary-color);
}

.nav-item.active {
    background-color: var(--primary-color);
    color: white;
    font-weight: 600;
}

.nav-item.nav-parent {
    cursor: pointer;
}

.nav-icon {
    font-size: 1.1rem;
    margin-right: 0.75rem;
    width: 1.25rem;
    text-align: center;
}

.nav-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.nav-badge {
    margin-left: 0.5rem;
}

.expand-icon {
    font-size: 0.75rem;
    transition: transform 0.2s ease;
}

.nav-parent.expanded .expand-icon {
    transform: rotate(90deg);
}

/* Submenu */
.nav-submenu {
    margin: 0.25rem 0;
    padding-left: 2rem;
}

.nav-subitem {
    display: flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    margin: 0.125rem 0;
    border-radius: 0.375rem;
    text-decoration: none;
    color: var(--text-color-secondary);
    font-size: 0.875rem;
    transition: all 0.2s ease;
}

.nav-subitem:hover {
    background-color: rgba(var(--primary-color-rgb), 0.05);
    color: var(--primary-color);
}

.nav-subitem.router-link-active {
    background-color: rgba(var(--primary-color-rgb), 0.1);
    color: var(--primary-color);
    font-weight: 500;
}

.nav-subicon {
    font-size: 0.875rem;
    margin-right: 0.5rem;
    width: 1rem;
    text-align: center;
}

/* Footer */
.sidebar-footer {
    border-top: 1px solid #e9ecef;
    padding: 1rem;
}

[data-theme='dark'] .sidebar-footer {
    border-top-color: #404040;
}

.theme-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background-color: rgba(var(--surface-ground-rgb), 0.5);
    border-radius: 0.5rem;
}

.toggle-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color);
}

.user-actions {
    display: flex;
    gap: 0.25rem;
    justify-content: center;
}

.sidebar-collapsed .user-actions {
    flex-direction: column;
}

/* Responsive */
@media (max-width: 768px) {
    .pos-sidebar {
        transform: translateX(-100%);
    }

    .pos-sidebar.mobile-open {
        transform: translateX(0);
    }
}

/* Scrollbar */
.navigation-menu::-webkit-scrollbar {
    width: 4px;
}

.navigation-menu::-webkit-scrollbar-track {
    background: transparent;
}

.navigation-menu::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
}

.navigation-menu::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}
</style>

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';

export const useAdminStore = defineStore('admin', () => {
    const toast = useToast();

    // System Users Management
    const users = ref([
        {
            id: 1,
            username: 'admin',
            email: 'admin@restaurant.com',
            name: 'System Administrator',
            role: 'admin',
            status: 'active',
            lastLogin: '2024-01-15T10:30:00Z',
            createdAt: '2024-01-01T00:00:00Z',
            permissions: ['*'],
            avatar: null
        },
        {
            id: 2,
            username: 'manager01',
            email: 'manager@restaurant.com',
            name: 'John Manager',
            role: 'manager',
            status: 'active',
            lastLogin: '2024-01-15T09:15:00Z',
            createdAt: '2024-01-02T00:00:00Z',
            permissions: ['manage_orders', 'manage_tables', 'view_reports', 'manage_inventory']
        },
        {
            id: 3,
            username: 'waiter01',
            email: 'alice.waiter@restaurant.com',
            name: 'Alice Johnson',
            role: 'waiter',
            status: 'active',
            lastLogin: '2024-01-15T08:00:00Z',
            createdAt: '2024-01-03T00:00:00Z',
            permissions: ['create_orders', 'manage_tables', 'view_menu']
        },
        {
            id: 4,
            username: 'cashier01',
            email: 'bob.cashier@restaurant.com',
            name: 'Bob Smith',
            role: 'cashier',
            status: 'active',
            lastLogin: '2024-01-14T16:45:00Z',
            createdAt: '2024-01-03T00:00:00Z',
            permissions: ['process_payments', 'view_orders', 'generate_receipts']
        },
        {
            id: 5,
            username: 'kitchen01',
            email: 'chef@restaurant.com',
            name: 'Chef Williams',
            role: 'kitchen',
            status: 'active',
            lastLogin: '2024-01-15T07:30:00Z',
            createdAt: '2024-01-04T00:00:00Z',
            permissions: ['view_kitchen', 'update_orders', 'manage_recipes']
        }
    ]);

    // Restaurant Settings
    const restaurantSettings = ref({
        general: {
            name: 'Bella Vista Restaurant',
            description: 'Fine dining experience with authentic cuisine',
            address: '123 Main Street, Downtown, City 12345',
            phone: '+1 (555) 123-4567',
            email: 'info@bellavista.com',
            website: 'www.bellavista.com',
            timezone: 'America/New_York',
            currency: 'USD',
            language: 'en'
        },
        operations: {
            openingTime: '08:00',
            closingTime: '23:00',
            daysOpen: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            maxTableReservationTime: 120, // minutes
            advanceReservationDays: 30,
            autoAcceptOrders: true,
            orderTimeout: 30, // minutes
            kitchenPrintEnabled: true,
            receiptPrintEnabled: true
        },
        payment: {
            taxRate: 8.25, // percentage
            serviceChargeEnabled: false,
            serviceChargeRate: 10,
            tipSuggestions: [15, 18, 20, 25],
            acceptedPayments: ['cash', 'card', 'digital'],
            minimumOrderAmount: 10.0,
            deliveryFee: 3.99,
            enableSplitBills: true
        },
        notifications: {
            emailEnabled: true,
            smsEnabled: false,
            pushEnabled: true,
            lowStockAlerts: true,
            orderAlerts: true,
            paymentAlerts: true,
            systemAlerts: true
        },
        security: {
            sessionTimeout: 30, // minutes
            maxLoginAttempts: 5,
            passwordMinLength: 8,
            requireTwoFactor: false,
            allowMultipleSessions: false,
            auditLogEnabled: true,
            backupEnabled: true,
            backupFrequency: 'daily'
        }
    });

    // System Integrations
    const integrations = ref({
        pos: {
            enabled: true,
            provider: 'Internal POS',
            config: {}
        },
        payment: {
            enabled: true,
            provider: 'Stripe',
            config: {
                publishableKey: 'pk_test_...',
                webhookEndpoint: '/api/webhooks/stripe'
            }
        },
        inventory: {
            enabled: true,
            provider: 'Internal Inventory',
            autoReorder: true,
            supplierIntegration: false
        },
        analytics: {
            enabled: true,
            provider: 'Internal Analytics',
            googleAnalytics: false,
            customDashboard: true
        },
        delivery: {
            enabled: false,
            providers: []
        },
        loyalty: {
            enabled: false,
            provider: null,
            pointsPerDollar: 1,
            redemptionRate: 100
        }
    });

    // Audit Logs
    const auditLogs = ref([
        {
            id: 1,
            userId: 1,
            action: 'user_login',
            description: 'Administrator logged in',
            ipAddress: '192.168.1.100',
            timestamp: '2024-01-15T10:30:00Z',
            metadata: { userAgent: 'Mozilla/5.0...' }
        },
        {
            id: 2,
            userId: 2,
            action: 'settings_update',
            description: 'Updated restaurant operating hours',
            ipAddress: '192.168.1.101',
            timestamp: '2024-01-15T09:45:00Z',
            metadata: { section: 'operations', field: 'closingTime' }
        },
        {
            id: 3,
            userId: 1,
            action: 'user_created',
            description: 'Created new waiter account',
            ipAddress: '192.168.1.100',
            timestamp: '2024-01-14T16:20:00Z',
            metadata: { targetUserId: 3, role: 'waiter' }
        }
    ]);

    // System Status
    const systemStatus = ref({
        uptime: '99.95%',
        lastBackup: '2024-01-15T02:00:00Z',
        databaseSize: '2.3 GB',
        activeUsers: 12,
        systemLoad: 'Normal',
        memoryUsage: 65.2,
        diskSpace: 78.5,
        services: {
            database: 'healthy',
            cache: 'healthy',
            storage: 'healthy',
            notifications: 'healthy',
            integrations: 'warning'
        }
    });

    // Permissions & Roles
    const roles = ref([
        {
            id: 'admin',
            name: 'Administrator',
            description: 'Full system access and control',
            permissions: ['*'],
            color: '#EF4444',
            userCount: 1
        },
        {
            id: 'manager',
            name: 'Manager',
            description: 'Restaurant management and oversight',
            permissions: ['manage_orders', 'manage_tables', 'view_reports', 'manage_inventory', 'manage_menu', 'view_analytics', 'manage_staff', 'manage_settings'],
            color: '#F59E0B',
            userCount: 1
        },
        {
            id: 'waiter',
            name: 'Waiter',
            description: 'Take orders and manage tables',
            permissions: ['create_orders', 'manage_tables', 'view_menu', 'process_payments'],
            color: '#10B981',
            userCount: 3
        },
        {
            id: 'cashier',
            name: 'Cashier',
            description: 'Handle payments and receipts',
            permissions: ['process_payments', 'view_orders', 'generate_receipts', 'manage_discounts'],
            color: '#3B82F6',
            userCount: 2
        },
        {
            id: 'kitchen',
            name: 'Kitchen Staff',
            description: 'Kitchen operations and order preparation',
            permissions: ['view_kitchen', 'update_orders', 'manage_recipes', 'view_inventory'],
            color: '#8B5CF6',
            userCount: 4
        }
    ]);

    const availablePermissions = ref([
        { id: 'manage_orders', name: 'Manage Orders', category: 'Orders' },
        { id: 'create_orders', name: 'Create Orders', category: 'Orders' },
        { id: 'view_orders', name: 'View Orders', category: 'Orders' },
        { id: 'update_orders', name: 'Update Orders', category: 'Orders' },
        { id: 'manage_tables', name: 'Manage Tables', category: 'Tables' },
        { id: 'view_tables', name: 'View Tables', category: 'Tables' },
        { id: 'manage_menu', name: 'Manage Menu', category: 'Menu' },
        { id: 'view_menu', name: 'View Menu', category: 'Menu' },
        { id: 'manage_inventory', name: 'Manage Inventory', category: 'Inventory' },
        { id: 'view_inventory', name: 'View Inventory', category: 'Inventory' },
        { id: 'process_payments', name: 'Process Payments', category: 'Payments' },
        { id: 'manage_discounts', name: 'Manage Discounts', category: 'Payments' },
        { id: 'generate_receipts', name: 'Generate Receipts', category: 'Receipts' },
        { id: 'view_kitchen', name: 'Kitchen Display', category: 'Kitchen' },
        { id: 'manage_recipes', name: 'Manage Recipes', category: 'Kitchen' },
        { id: 'view_reports', name: 'View Reports', category: 'Analytics' },
        { id: 'view_analytics', name: 'View Analytics', category: 'Analytics' },
        { id: 'manage_staff', name: 'Manage Staff', category: 'Administration' },
        { id: 'manage_settings', name: 'Manage Settings', category: 'Administration' }
    ]);

    // Actions
    const createUser = async (userData) => {
        try {
            const newUser = {
                id: Math.max(...users.value.map((u) => u.id)) + 1,
                ...userData,
                status: 'active',
                createdAt: new Date().toISOString(),
                lastLogin: null
            };

            users.value.push(newUser);

            // Log the action
            logAction('user_created', `Created user: ${newUser.name}`, { targetUserId: newUser.id });

            toast.add({
                severity: 'success',
                summary: 'User Created',
                detail: `${newUser.name} has been added to the system`,
                life: 3000
            });

            return newUser;
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to create user',
                life: 5000
            });
            throw error;
        }
    };

    const updateUser = async (userId, updates) => {
        try {
            const userIndex = users.value.findIndex((u) => u.id === userId);
            if (userIndex === -1) throw new Error('User not found');

            users.value[userIndex] = { ...users.value[userIndex], ...updates };

            logAction('user_updated', `Updated user: ${users.value[userIndex].name}`, { targetUserId: userId });

            toast.add({
                severity: 'success',
                summary: 'User Updated',
                detail: 'User information has been updated',
                life: 3000
            });
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update user',
                life: 5000
            });
            throw error;
        }
    };

    const deleteUser = async (userId) => {
        try {
            const userIndex = users.value.findIndex((u) => u.id === userId);
            if (userIndex === -1) throw new Error('User not found');

            const userName = users.value[userIndex].name;
            users.value.splice(userIndex, 1);

            logAction('user_deleted', `Deleted user: ${userName}`, { targetUserId: userId });

            toast.add({
                severity: 'success',
                summary: 'User Deleted',
                detail: `${userName} has been removed from the system`,
                life: 3000
            });
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete user',
                life: 5000
            });
            throw error;
        }
    };

    const updateSettings = async (section, settings) => {
        try {
            restaurantSettings.value[section] = { ...restaurantSettings.value[section], ...settings };

            logAction('settings_updated', `Updated ${section} settings`, { section });

            toast.add({
                severity: 'success',
                summary: 'Settings Updated',
                detail: 'Restaurant settings have been saved',
                life: 3000
            });
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update settings',
                life: 5000
            });
            throw error;
        }
    };

    const updateIntegration = async (service, config) => {
        try {
            integrations.value[service] = { ...integrations.value[service], ...config };

            logAction('integration_updated', `Updated ${service} integration`, { service });

            toast.add({
                severity: 'success',
                summary: 'Integration Updated',
                detail: `${service} integration has been configured`,
                life: 3000
            });
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update integration',
                life: 5000
            });
            throw error;
        }
    };

    const createRole = async (roleData) => {
        try {
            const newRole = {
                ...roleData,
                userCount: 0
            };

            roles.value.push(newRole);

            logAction('role_created', `Created role: ${newRole.name}`, { roleId: newRole.id });

            toast.add({
                severity: 'success',
                summary: 'Role Created',
                detail: `${newRole.name} role has been created`,
                life: 3000
            });

            return newRole;
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to create role',
                life: 5000
            });
            throw error;
        }
    };

    const performBackup = async () => {
        try {
            // Simulate backup process
            await new Promise((resolve) => setTimeout(resolve, 2000));

            systemStatus.value.lastBackup = new Date().toISOString();

            logAction('system_backup', 'Manual system backup initiated');

            toast.add({
                severity: 'success',
                summary: 'Backup Complete',
                detail: 'System backup has been created successfully',
                life: 3000
            });
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Backup Failed',
                detail: 'Failed to create system backup',
                life: 5000
            });
            throw error;
        }
    };

    const logAction = (action, description, metadata = {}) => {
        const log = {
            id: auditLogs.value.length + 1,
            userId: 1, // Current user - would come from auth store
            action,
            description,
            ipAddress: '192.168.1.100', // Would be detected
            timestamp: new Date().toISOString(),
            metadata
        };

        auditLogs.value.unshift(log);
    };

    const exportAuditLogs = (format = 'csv') => {
        try {
            if (format === 'csv') {
                const csvData = [['Timestamp', 'User', 'Action', 'Description', 'IP Address'], ...auditLogs.value.map((log) => [log.timestamp, getUserById(log.userId)?.name || 'System', log.action, log.description, log.ipAddress])];

                const csv = csvData.map((row) => row.map((field) => `"${field}"`).join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
                link.click();

                toast.add({
                    severity: 'success',
                    summary: 'Export Complete',
                    detail: 'Audit logs have been downloaded',
                    life: 3000
                });
            }
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Export Failed',
                detail: 'Failed to export audit logs',
                life: 5000
            });
        }
    };

    // Helper functions
    const getUserById = (userId) => {
        return users.value.find((u) => u.id === userId);
    };

    const getRoleById = (roleId) => {
        return roles.value.find((r) => r.id === roleId);
    };

    return {
        // State
        users,
        restaurantSettings,
        integrations,
        auditLogs,
        systemStatus,
        roles,
        availablePermissions,

        // Actions
        createUser,
        updateUser,
        deleteUser,
        updateSettings,
        updateIntegration,
        createRole,
        performBackup,
        logAction,
        exportAuditLogs,

        // Helpers
        getUserById,
        getRoleById
    };
});

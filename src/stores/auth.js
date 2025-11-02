import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref(null);
    const token = ref(localStorage.getItem('pos_token'));
    const isLoading = ref(false);
    const shiftStatus = ref('off-duty'); // 'on-duty', 'off-duty', 'break'

    // User roles enum
    const USER_ROLES = {
        ADMIN: 'admin',
        MANAGER: 'manager',
        WAITER: 'waiter',
        CASHIER: 'cashier',
        KITCHEN_STAFF: 'kitchen_staff'
    };

    // Getters
    const isAuthenticated = computed(() => !!token.value && !!user.value);
    const userRole = computed(() => user.value?.role || null);
    const userName = computed(() => user.value?.name || '');
    const userEmail = computed(() => user.value?.email || '');
    const canManageUsers = computed(() => ['admin', 'manager'].includes(userRole.value));
    const canManageInventory = computed(() => ['admin', 'manager'].includes(userRole.value));
    const canManageMenu = computed(() => ['admin', 'manager'].includes(userRole.value));
    const canViewReports = computed(() => ['admin', 'manager'].includes(userRole.value));
    const canProcessPayments = computed(() => ['admin', 'manager', 'cashier'].includes(userRole.value));
    const canTakeOrders = computed(() => ['admin', 'manager', 'waiter'].includes(userRole.value));
    const canAccessKitchen = computed(() => ['admin', 'manager', 'kitchen_staff'].includes(userRole.value));

    // Actions
    const login = async (credentials) => {
        isLoading.value = true;
        try {
            console.log('Attempting login with credentials:', credentials);
            // Make actual API call to login endpoint
            const response = await fetch('http://localhost:8000/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok && data.token) {
                user.value = data.user;
                token.value = data.token;
                localStorage.setItem('pos_token', data.token);
                localStorage.setItem('pos_user', JSON.stringify(data.user));
                localStorage.setItem('pos_user_role', data.user.role);
                localStorage.setItem('restaurant_id', data.user.restaurant_id);
                return { success: true };
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            return { success: false, message: error.message || 'Network error occurred' };
        } finally {
            isLoading.value = false;
        }
    };
    const Signup = async (userData) => {
        isLoading.value = true;
        try {
            // Make actual API call to signup endpoint
            const response = await fetch('http://localhost:8000/auth/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok && data.token) {
                user.value = data.user;
                token.value = data.token;
                localStorage.setItem('pos_token', data.token);
                localStorage.setItem('pos_user', JSON.stringify(data.user));
                return { success: true };
            } else {
                throw new Error(data.message || 'Signup failed');
            }
        } catch (error) {
            return { success: false, message: error.message || 'Network error occurred' };
        } finally {
            isLoading.value = false;
        }
    };
    const hasPermission = (permission) => {
        switch (permission) {
            case 'manageUsers':
                return ['admin', 'manager'].includes(userRole.value);
            case 'manageInventory':
                return ['admin', 'manager'].includes(userRole.value);
            case 'manageMenu':
                return ['admin', 'manager'].includes(userRole.value);
            case 'viewReports':
                return ['admin', 'manager'].includes(userRole.value);
            case 'processPayments':
                return ['admin', 'manager', 'cashier'].includes(userRole.value);
            case 'takeOrders':
                return ['admin', 'manager', 'waiter'].includes(userRole.value);
            case 'view_kitchen':
                return ['admin', 'manager', 'kitchen_staff'].includes(userRole.value);
            default:
                return false;
        }
    };
    const register = async (userData) => {
        isLoading.value = true;
        try {
            // Simulate API call - replace with actual API
            const response = await simulateRegister(userData);

            if (response.success) {
                return { success: true, message: 'User registered successfully' };
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const logout = () => {
        user.value = null;
        token.value = null;
        shiftStatus.value = 'off-duty';
        localStorage.removeItem('pos_token');
        localStorage.removeItem('pos_user');
    };

    const updateProfile = async (profileData) => {
        isLoading.value = true;
        try {
            // Simulate API call - replace with actual API
            const response = await simulateUpdateProfile(profileData);

            if (response.success) {
                user.value = { ...user.value, ...response.user };
                localStorage.setItem('pos_user', JSON.stringify(user.value));
                return { success: true };
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const changePassword = async (passwordData) => {
        isLoading.value = true;
        try {
            // Simulate API call - replace with actual API
            const response = await simulateChangePassword(passwordData);
            return response;
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            isLoading.value = false;
        }
    };

    const toggleShiftStatus = (status) => {
        shiftStatus.value = status;
        // In real app, sync with backend
    };

    const initializeAuth = () => {
        const savedUser = localStorage.getItem('pos_user');
        if (savedUser && token.value) {
            try {
                user.value = JSON.parse(savedUser);
            } catch (error) {
                console.error('Error parsing saved user:', error);
                logout();
            }
        }
    };

    // Mock API functions (replace with actual API calls)

    // eslint-disable-next-line no-unused-vars
    const simulateRegister = async (userData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'User registered successfully'
                });
            }, 1000);
        });
    };

    const simulateUpdateProfile = async (profileData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    user: profileData
                });
            }, 500);
        });
    };

    // eslint-disable-next-line no-unused-vars
    const simulateChangePassword = async (passwordData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Password changed successfully'
                });
            }, 500);
        });
    };

    return {
        // State
        user,
        token,
        isLoading,
        shiftStatus,
        USER_ROLES,

        // Getters
        isAuthenticated,
        userRole,
        userName,
        userEmail,
        canManageUsers,
        canManageInventory,
        canManageMenu,
        canViewReports,
        canProcessPayments,
        canTakeOrders,
        canAccessKitchen,

        // Actions
        login,
        register,
        Signup,
        logout,
        updateProfile,
        changePassword,
        toggleShiftStatus,
        initializeAuth,
        hasPermission
    };
});

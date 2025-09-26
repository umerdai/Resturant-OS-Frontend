import { useAuthStore } from '@/stores/auth';

export function createAuthGuard() {
    return (to, from, next) => {
        const authStore = useAuthStore();

        // Initialize auth if not done already
        if (!authStore.isAuthenticated) {
            authStore.initializeAuth();
        }

        // Routes that don't require authentication
        const publicRoutes = ['/auth/login', '/auth/register', '/landing'];

        if (publicRoutes.includes(to.path)) {
            // If user is already authenticated and trying to access auth pages, redirect to dashboard
            if (authStore.isAuthenticated) {
                next('/');
            } else {
                next();
            }
            return;
        }

        // Check if user is authenticated
        if (!authStore.isAuthenticated) {
            next('/auth/login');
            return;
        }

        // Role-based access control
        const userRole = authStore.userRole;
        const requiredRoles = to.meta?.roles;

        if (requiredRoles && !requiredRoles.includes(userRole)) {
            // User doesn't have required role, redirect to access denied
            next('/auth/access');
            return;
        }

        next();
    };
}

export function createRoleGuard(allowedRoles) {
    return (to, from, next) => {
        const authStore = useAuthStore();

        if (!authStore.isAuthenticated) {
            next('/auth/login');
            return;
        }

        const userRole = authStore.userRole;

        if (!allowedRoles.includes(userRole)) {
            next('/auth/access');
            return;
        }

        next();
    };
}

// Helper function to check permissions for specific features
export function canAccess(feature) {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
        return false;
    }

    switch (feature) {
        case 'user_management':
            return authStore.canManageUsers;
        case 'inventory_management':
            return authStore.canManageInventory;
        case 'menu_management':
            return authStore.canManageMenu;
        case 'reports':
            return authStore.canViewReports;
        case 'payments':
            return authStore.canProcessPayments;
        case 'orders':
            return authStore.canTakeOrders;
        case 'kitchen':
            return authStore.canAccessKitchen;
        default:
            return false;
    }
}

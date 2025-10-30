import { useAuthStore } from '@/stores/auth';

export function createAuthGuard() {
    return async (to, from, next) => {
        const authStore = useAuthStore();

        // Ensure auth state is initialized (await if async)
        if (!authStore.initialized) {
            await authStore.initializeAuth();
        }

        // Public routes (match by both name and path)
        const publicRoutes = ['/auth/login', '/auth/signup', '/landing'];
        const publicNames = ['login', 'signup', 'landing'];

        if (publicRoutes.includes(to.path) || publicNames.includes(to.name)) {
            if (authStore.isAuthenticated) {
                return next('/'); // already logged in
            }
            return next(); // allow login/register/landing
        }

        // Private routes
        if (!authStore.isAuthenticated) {
            return next('/auth/login');
        }

        // Role-based access
        const userRole = authStore.userRole;
        const requiredRoles = to.meta?.roles;

        if (requiredRoles && !requiredRoles.includes(userRole)) {
            return next('/auth/access');
        }

        return next();
    };
}

import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createAuthGuard } from './guards';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },

                {
                    path: '/analytics',
                    name: 'Analytics',
                    component: () => import('@/views/pages/Analytics/AnalyticsLayout.vue'),
                    meta: { roles: ['admin', 'manager'] }
                },

                {
                    path: '/statistics',
                    name: 'Statistics',
                    component: () => import('@/views/pages/Statistics/StatisticsLayout.vue'),
                    meta: { roles: ['admin', 'manager'] }
                },
                {
                    path: '/inventory',
                    name: 'Inventory',
                    component: () => import('@/views/pages/Inventory/InventoryLayout.vue'),
                    children: [
                        {
                            path: 'add',
                            name: 'AddInventoryItem',
                            component: () => import('@/views/pages/Inventory/AddInventory.vue')
                        },
                        {
                            path: 'list',
                            name: 'InventoryList',
                            component: () => import('@/views/pages/Inventory/ViewInventory.vue')
                        },
                        {
                            path: 'Newitem',
                            name: 'NewItemInInventory',
                            component: () => import('@/views/pages/Inventory/AddNewItemInInventory.vue')
                        },
                        {
                            path: 'UpdateItem',
                            name: 'UpdateItemInInventory',
                            component: () => import('@/views/pages/Inventory/UpdateInventory.vue')
                        }
                    ]
                },

                {
                    path: '/menu',
                    name: 'Menu',
                    component: () => import('@/views/pages/Menu/MenuLayout.vue'),
                    children: [
                        {
                            path: 'List',
                            name: 'viewMenuItem',
                            component: () => import('@/views/pages/Menu/MenuList.vue')
                        },
                        {
                            path: 'add',
                            name: 'addMenuItem',
                            component: () => import('@/views/pages/Menu/AddMenuItem.vue')
                        },
                        {
                            path: 'Newitem',
                            name: 'NewItemInInventory',
                            component: () => import('@/views/pages/Inventory/AddNewItemInInventory.vue')
                        },
                        {
                            path: 'UpdateItem',
                            name: 'UpdateItemInInventory',
                            component: () => import('@/views/pages/Inventory/UpdateInventory.vue')
                        }
                    ]
                },
                {
                    path: '/sales',
                    name: 'Sales',
                    component: () => import('@/views/pages/Sales/SalesLayout.vue')
                },
                {
                    path: '/pos',
                    name: 'Pos',
                    component: () => import('@/views/pages/POS/PosLayout.vue')
                },
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/views/uikit/InputDoc.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/ButtonDoc.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/TableDoc.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/ListDoc.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/TreeDoc.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/PanelsDoc.vue')
                },

                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/OverlayDoc.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/MediaDoc.vue')
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/MessagesDoc.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/FileDoc.vue')
                },
                {
                    path: '/uikit/menu',
                    name: 'menu',
                    component: () => import('@/views/uikit/MenuDoc.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/ChartDoc.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/MiscDoc.vue')
                },
                {
                    path: '/uikit/timeline',
                    name: 'timeline',
                    component: () => import('@/views/uikit/TimelineDoc.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue')
                },
                {
                    path: '/documentation',
                    name: 'documentation',
                    component: () => import('@/views/pages/Documentation.vue')
                },
                {
                    path: '/profile',
                    name: 'profile',
                    component: () => import('@/views/pages/profile/UserProfile.vue')
                },
                {
                    path: '/tables',
                    name: 'tables',
                    component: () => import('@/views/pages/tables/TableManagement.vue'),
                    meta: { roles: ['admin', 'manager', 'waiter'] }
                },
                {
                    path: '/orders/management',
                    name: 'order-management',
                    component: () => import('@/views/pages/orders/OrderManagement.vue'),
                    meta: { requiresAuth: true, roles: ['admin', 'manager', 'waiter', 'cashier'] }
                },
                {
                    path: '/menu',
                    name: 'menu-management',
                    component: () => import('@/views/pages/Menu/MenuManagement.vue'),
                    meta: { requiresAuth: true, roles: ['admin', 'manager'] }
                },
                {
                    path: '/kitchen',
                    name: 'kitchen-display',
                    component: () => import('@/views/KitchenManagement.vue'),
                    meta: { requiresAuth: true, roles: ['admin', 'manager', 'kitchen'] }
                },
                {
                    path: '/staff',
                    name: 'staff-management',
                    component: () => import('@/views/StaffManagement.vue'),
                    meta: { requiresAuth: true, roles: ['admin', 'manager'] }
                },
                {
                    path: '/payments',
                    name: 'payment-management',
                    component: () => import('@/views/PaymentManagement.vue'),
                    meta: { requiresAuth: true, roles: ['admin', 'manager', 'cashier'] }
                },
                {
                    path: '/billing',
                    name: 'billing-payment',
                    component: () => import('@/views/pages/billing/BillingPayment.vue'),
                    meta: { requiresAuth: true, roles: ['admin', 'manager', 'cashier'] }
                },
                {
                    path: '/inventory-management',
                    name: 'inventory-management',
                    component: () => import('@/views/InventoryManagement.vue'),
                    meta: { requiresAuth: true, roles: ['admin', 'manager'] }
                },
                {
                    path: '/enhanced-inventory',
                    name: 'enhanced-inventory',
                    component: () => import('@/views/EnhancedInventoryPage.vue'),
                    meta: { requiresAuth: true, roles: ['admin', 'manager'] }
                },
                {
                    path: '/ai-usecases',
                    name: 'ai-usecases',
                    component: () => import('@/views/AIUseCases.vue'),
                    meta: { requiresAuth: false, roles: ['admin', 'manager'] }
                },
                {
                    path: '/reports-analytics',
                    name: 'reports-analytics',
                    component: () => import('@/views/ReportsAnalytics.vue'),
                    meta: { requiresAuth: true, roles: ['admin', 'manager'] }
                },
                {
                    path: '/admin-settings',
                    name: 'admin-settings',
                    component: () => import('@/views/AdminSettings.vue'),
                    meta: { requiresAuth: true, roles: ['admin'] }
                },
                {
                    path: '/orders/new/:tableId?',
                    name: 'newOrder',
                    component: () => import('@/views/pages/orders/NewOrder.vue'),
                    meta: { roles: ['admin', 'manager', 'waiter'] }
                }
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

// Add global authentication guard
router.beforeEach(createAuthGuard());

export default router;

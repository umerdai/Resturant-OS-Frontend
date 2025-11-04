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
                    path: '/restaurant',
                    name: 'Restaurant',
                    component: () => import('@/views/pages/Restaurants/RestaurantLayout.vue')
                },
                {
                    path: '/category',
                    name: 'Category',
                    component: () => import('@/views/pages/Categories/CategoryLayout.vue')
                },
                {
                    path: '/branches',
                    name: 'Branches',
                    component: () => import('@/views/pages/Branches/BranchesLayout.vue')
                },
                {
                    path: '/branches/create',
                    name: 'CreateBranch',
                    component: () => import('@/views/pages/Branches/CreateBranch.vue'),
                    meta: { requiresAuth: true, roles: ['owner', 'admin', 'manager'] }
                },
                {
                    path: '/branches/:id/details',
                    name: 'BranchDetails',
                    component: () => import('@/views/pages/Branches/BranchDetails.vue'),
                    meta: { requiresAuth: true, roles: ['owner', 'admin', 'manager'] }
                },
                {
                    path: '/categories/create',
                    name: 'CreateCategory',
                    component: () => import('@/views/pages/Categories/CreateCategory.vue'),
                    meta: { requiresAuth: true, roles: ['owner', 'admin', 'manager'] }
                },
                {
                    path: '/restaurant/create',
                    name: 'CreateRestaurant',
                    component: () => import('@/views/pages/Restaurants/CreateRestaurant.vue'),
                    meta: { requiresAuth: true, roles: ['admin', 'manager', 'owner'] }
                },
                {
                    path: '/analytics',
                    name: 'Analytics',
                    component: () => import('@/views/pages/Analytics/AnalyticsLayout.vue')
                },

                {
                    path: '/analytics/sales-prediction-daily',
                    name: 'sales-prediction-daily',
                    component: () => import('@/views/pages/Analytics/Sales-Analytics-Daily.vue')
                },
                {
                    path: '/analytics/sales-prediction-weekly',
                    name: 'sales-prediction-weekly',
                    component: () => import('@/views/pages/Analytics/Sales-Analytics-Weekly.vue')
                },
                {
                    path: '/analytics/smart-order-assistant',
                    name: 'smart-order-assistan',
                    component: () => import('@/views/pages/Analytics/Smart-Order-Assistant.vue')
                },
                {
                    path: '/analytics/waste-reduction',
                    name: 'waste-reduction',
                    component: () => import('@/views/pages/Analytics/Waste-Reduction.vue')
                },
                {
                    path: '/analytics/menu-insights',
                    name: 'menu-insights',
                    component: () => import('@/views/pages/Analytics/Menu-Insights.vue')
                },
                {
                    path: '/analytics/inventory-prediction',
                    name: 'inventory-prediction',
                    component: () => import('@/views/pages/Analytics/Inventory-Prediction.vue')
                },
                {
                    path: '/analytics/targeted-promotions',
                    name: 'targeted-promotions',
                    component: () => import('@/views/pages/Analytics/Targeted-Promotions.vue')
                },
                {
                    path: '/analytics/sales-reports-daily',
                    name: 'sales-reports-daily',
                    component: () => import('@/views/pages/Analytics/Sales-Reports-Daily.vue')
                },
                {
                    path: '/analytics/sales-reports-weekly',
                    name: 'sales-reports-weekly',
                    component: () => import('@/views/pages/Analytics/Sales-Reports-Weekly.vue')
                },
                {
                    path: '/analytics/waste-reports-daily',
                    name: 'waste-reports-daily',
                    component: () => import('@/views/pages/Analytics/Waste-Reports-Daily.vue')
                },
                {
                    path: '/analytics/waste-reports-weekly',
                    name: 'waste-reports-weekly',
                    component: () => import('@/views/pages/Analytics/Waste-Reports-Weekly.vue')
                },
                {
                    path: '/statistics',
                    name: 'Statistics',
                    component: () => import('@/views/pages/Statistics/StatisticsLayout.vue'),
                    meta: { roles: ['owner', 'admin', 'manager'] }
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
                            path: 'new',
                            name: 'long',
                            component: () => import('@/views/pages/Inventory/AddNewItemInInventory.vue')
                        },
                        {
                            path: 'newitem',
                            name: 'NewItemInInventory',
                            component: () => import('@/views/pages/Inventory/ViewInventory.vue')
                        },
                        {
                            path: 'update',
                            name: 'Update',
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
                    path: '/menu/items',
                    name: 'MenuItems',
                    component: () => import('@/views/pages/Menu/MenuItemsLayout.vue'),
                    meta: { requiresAuth: true, roles: ['owner', 'admin', 'manager'] }
                },
                {
                    path: '/menu/items/create',
                    name: 'CreateMenuItem',
                    component: () => import('@/views/pages/Menu/CreateMenuItem.vue'),
                    meta: { requiresAuth: true, roles: ['owner', 'admin', 'manager'] }
                },
                {
                    path: '/menu/items/:id/details',
                    name: 'MenuItemDetails',
                    component: () => import('@/views/pages/Menu/MenuItemDetails.vue'),
                    meta: { requiresAuth: true, roles: ['owner', 'admin', 'manager'] }
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
                    meta: { roles: ['owner', 'admin', 'manager', 'waiter'] }
                },
                {
                    path: '/orders/management',
                    name: 'order-management',
                    component: () => import('@/views/pages/orders/OrderManagement.vue'),
                    meta: { requiresAuth: true, roles: ['owner', 'admin', 'manager', 'waiter', 'cashier'] }
                },

                {
                    path: '/kitchen',
                    name: 'kitchen-display',
                    component: () => import('@/views/KitchenManagement.vue'),
                    meta: { requiresAuth: true, roles: ['owner', 'admin', 'manager', 'kitchen'] }
                },
                {
                    path: '/staff',
                    name: 'staff-management',
                    component: () => import('@/views/StaffManagement.vue'),
                    meta: { requiresAuth: true, roles: ['owner', 'admin', 'manager'] }
                },
                {
                    path: '/payments',
                    name: 'payment-management',
                    component: () => import('@/views/PaymentManagement.vue'),
                    meta: { requiresAuth: true, roles: ['owner', 'admin', 'manager', 'cashier'] }
                },
                {
                    path: '/billing',
                    name: 'billing-payment',
                    component: () => import('@/views/pages/billing/BillingPayment.vue'),
                    meta: { requiresAuth: true, roles: ['owner', 'admin', 'manager', 'cashier'] }
                },
                {
                    path: '/inventory-management',
                    name: 'inventory-management',
                    component: () => import('@/views/InventoryManagement.vue'),
                    meta: { requiresAuth: true, roles: ['owner', 'admin', 'manager'] }
                },
                {
                    path: '/enhanced-inventory',
                    name: 'enhanced-inventory',
                    component: () => import('@/views/EnhancedInventoryPage.vue'),
                    meta: { requiresAuth: true, roles: ['owner', 'admin', 'manager'] }
                },
                {
                    path: '/ai-usecases',
                    name: 'ai-usecases',
                    component: () => import('@/views/AIUseCases.vue'),
                    meta: { requiresAuth: false, roles: ['owner', 'admin', 'manager'] }
                },
                {
                    path: '/reports-analytics',
                    name: 'reports-analytics',
                    component: () => import('@/views/ReportsAnalytics.vue'),
                    meta: { requiresAuth: true, roles: ['owner', 'admin', 'manager'] }
                },
                {
                    path: '/admin-settings',
                    name: 'admin-settings',
                    component: () => import('@/views/AdminSettings.vue'),
                    meta: { requiresAuth: true, roles: ['owner', 'admin'] }
                },
                {
                    path: '/orders/new/:tableId?',
                    name: 'newOrder',
                    component: () => import('@/views/pages/orders/NewOrder.vue'),
                    meta: { roles: ['owner', 'admin', 'manager', 'waiter'] }
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
            path: '/auth/signup',
            name: 'signup',
            component: () => import('@/views/pages/auth/Signup.vue')
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

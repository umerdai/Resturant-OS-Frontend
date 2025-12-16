<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
            { label: 'Analytics', icon: 'pi pi-fw pi-chart-bar', to: '/analytics' },
            { label: 'Restaurant', icon: 'pi pi-fw pi-chart-bar', to: '/restaurant' },
            { label: 'Branches', icon: 'pi pi-fw pi-cog', to: '/branches' },
            { label: 'Statistics', icon: 'pi pi-fw pi-chart-line', to: '/statistics' },
            { label: 'Inventory', icon: 'pi pi-fw pi-cart-minus', to: '/inventory' },
            { label: 'Menu', icon: 'pi pi-fw pi-bars', to: '/menu/items' },
            { label: 'Sales', icon: 'pi pi-fw pi-credit-card', to: '/sales' },
            { label: 'POS', icon: 'pi pi-fw pi-desktop', to: '/pos' },
            { label: 'Kitchen', icon: 'pi pi-fw pi-cog', to: '/kitchen' },
            { label: 'Category', icon: 'pi pi-fw pi-cog', to: '/category' },
            { label: 'Staff', icon: 'pi pi-fw pi-users', to: '/staff' },
            { label: 'Payments', icon: 'pi pi-fw pi-credit-card', to: '/payments' },
            { label: 'Reports & Analytics', icon: 'pi pi-fw pi-chart-pie', to: '/reports-analytics' },
            { label: 'Enhanced Inventory', icon: 'pi pi-fw pi-warehouse', to: '/enhanced-inventory' }
        ]
    },
    {
        label: 'AI',
        items: [{ label: 'AI Use Cases', icon: 'pi pi-fw pi-robot', to: '/ai-usecases' }]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model">
            <app-menu-item v-if="!item.separator" :key="i" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" :key="`sep-${i}`" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>

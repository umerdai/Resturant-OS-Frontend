import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useOrderStore } from './order';
import { useInventoryStore } from './inventory';
import { useTableStore } from './table';

export const useAnalyticsStore = defineStore('analytics', () => {
    const orderStore = useOrderStore();
    const inventoryStore = useInventoryStore();
    const tableStore = useTableStore();

    // State
    const selectedDateRange = ref('today');
    const customDateRange = ref({
        start: new Date(),
        end: new Date()
    });

    const selectedMetrics = ref(['revenue', 'orders', 'customers', 'avgOrderValue']);

    // Sample historical data for comprehensive analytics
    const historicalData = ref({
        daily: generateDailyData(),
        weekly: generateWeeklyData(),
        monthly: generateMonthlyData(),
        yearly: generateYearlyData()
    });

    const performanceMetrics = ref({
        kitchenPerformance: {
            avgPrepTime: 18.5, // minutes
            onTimeOrders: 87.3, // percentage
            delayedOrders: 12.7, // percentage
            peakHours: ['12:00-13:00', '19:00-21:00'],
            avgOrdersPerHour: 25
        },
        serviceMetrics: {
            tablesTurnover: 3.2, // times per day
            avgServiceTime: 45, // minutes
            customerSatisfaction: 4.3, // out of 5
            waitTime: 8.5, // minutes
            orderAccuracy: 96.8 // percentage
        },
        staffProductivity: {
            ordersPerWaiter: 32,
            avgResponseTime: 3.2, // minutes
            upsellRate: 18.5, // percentage
            customerFeedback: 4.1 // out of 5
        }
    });

    const topSellingItems = ref([
        {
            id: 1,
            name: 'Margherita Pizza',
            category: 'Pizza',
            quantitySold: 156,
            revenue: 2340.0,
            profit: 1404.0,
            trend: 'up',
            trendPercent: 12.5
        },
        {
            id: 2,
            name: 'Caesar Salad',
            category: 'Salads',
            quantitySold: 89,
            revenue: 1068.0,
            profit: 640.8,
            trend: 'up',
            trendPercent: 8.3
        },
        {
            id: 3,
            name: 'Grilled Salmon',
            category: 'Main Course',
            quantitySold: 67,
            revenue: 1541.0,
            profit: 924.6,
            trend: 'down',
            trendPercent: -4.2
        },
        {
            id: 4,
            name: 'Chocolate Cake',
            category: 'Desserts',
            quantitySold: 78,
            revenue: 858.0,
            profit: 600.6,
            trend: 'up',
            trendPercent: 15.7
        },
        {
            id: 5,
            name: 'House Wine',
            category: 'Beverages',
            quantitySold: 112,
            revenue: 1344.0,
            profit: 940.8,
            trend: 'stable',
            trendPercent: 1.2
        }
    ]);

    const customerAnalytics = ref({
        demographics: {
            ageGroups: [
                { range: '18-25', percentage: 22.5, count: 145 },
                { range: '26-35', percentage: 34.2, count: 220 },
                { range: '36-45', percentage: 28.1, count: 181 },
                { range: '46-55', percentage: 12.8, count: 82 },
                { range: '56+', percentage: 2.4, count: 15 }
            ],
            visitFrequency: [
                { type: 'First-time', percentage: 35.7, count: 230 },
                { type: 'Occasional', percentage: 28.4, count: 183 },
                { type: 'Regular', percentage: 25.9, count: 167 },
                { type: 'VIP', percentage: 10.0, count: 64 }
            ],
            preferredTimes: [
                { time: 'Breakfast (8-11)', percentage: 15.2 },
                { time: 'Lunch (11-15)', percentage: 42.8 },
                { time: 'Dinner (17-22)', percentage: 38.6 },
                { time: 'Late Night (22+)', percentage: 3.4 }
            ]
        },
        loyalty: {
            totalCustomers: 644,
            newCustomers: 78,
            returningCustomers: 566,
            churnRate: 8.2,
            avgLifetimeValue: 285.5,
            loyaltyPointsRedeemed: 12450
        }
    });

    const financialMetrics = ref({
        revenue: {
            today: 2847.5,
            yesterday: 2634.25,
            thisWeek: 18925.75,
            lastWeek: 17340.5,
            thisMonth: 78540.25,
            lastMonth: 72380.75,
            thisYear: 892540.0,
            lastYear: 834250.5
        },
        costs: {
            foodCost: 24680.5, // 28.5% of revenue
            laborCost: 32150.75, // 37.2% of revenue
            overhead: 15420.25, // 17.8% of revenue
            total: 72251.5
        },
        profitMargins: {
            gross: 62.3,
            operating: 31.8,
            net: 24.5
        },
        taxInfo: {
            salesTax: 6284.25,
            payrollTax: 4823.15,
            otherTaxes: 1456.5
        }
    });

    // Computed properties
    const dateRangeData = computed(() => {
        const now = new Date();
        let startDate, endDate;

        switch (selectedDateRange.value) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                break;
            case 'yesterday':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'thisWeek': {
                const dayOfWeek = now.getDay();
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - dayOfWeek));
                break;
            }
            case 'thisMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                break;
            case 'custom':
                startDate = customDateRange.value.start;
                endDate = customDateRange.value.end;
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        }

        return { startDate, endDate };
    });

    const filteredOrders = computed(() => {
        const { startDate, endDate } = dateRangeData.value;
        return orderStore.orders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && orderDate < endDate;
        });
    });

    const revenueAnalytics = computed(() => {
        const orders = filteredOrders.value.filter((order) => order.status === 'completed');
        const totalRevenue = orders.reduce((sum, order) => {
            return (
                sum +
                order.items.reduce((itemSum, item) => {
                    let itemTotal = item.price * item.quantity;
                    if (item.modifiers) {
                        itemTotal += item.modifiers.reduce((modSum, mod) => modSum + (mod.price || 0), 0) * item.quantity;
                    }
                    return itemSum + itemTotal;
                }, 0)
            );
        }, 0);

        const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

        // Compare with previous period
        const previousPeriodRevenue = getPreviousPeriodRevenue();
        const revenueChange = previousPeriodRevenue > 0 ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 : 0;

        return {
            total: totalRevenue,
            avgOrderValue,
            orderCount: orders.length,
            revenueChange,
            previousPeriod: previousPeriodRevenue
        };
    });

    const categoryAnalytics = computed(() => {
        const categoryData = {};

        filteredOrders.value.forEach((order) => {
            order.items.forEach((item) => {
                const category = item.category || 'Uncategorized';
                if (!categoryData[category]) {
                    categoryData[category] = {
                        name: category,
                        quantity: 0,
                        revenue: 0,
                        orders: new Set()
                    };
                }

                categoryData[category].quantity += item.quantity;
                categoryData[category].revenue += item.price * item.quantity;
                categoryData[category].orders.add(order.id);
            });
        });

        return Object.values(categoryData)
            .map((cat) => ({
                ...cat,
                orderCount: cat.orders.size,
                avgOrderValue: cat.orderCount > 0 ? cat.revenue / cat.orderCount : 0
            }))
            .sort((a, b) => b.revenue - a.revenue);
    });

    const hourlyAnalytics = computed(() => {
        const hourlyData = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            orders: 0,
            revenue: 0,
            customers: 0
        }));

        filteredOrders.value.forEach((order) => {
            const hour = new Date(order.createdAt).getHours();
            const orderRevenue = order.items.reduce((sum, item) => {
                return sum + item.price * item.quantity;
            }, 0);

            hourlyData[hour].orders += 1;
            hourlyData[hour].revenue += orderRevenue;
            hourlyData[hour].customers += order.customerCount || 1;
        });

        return hourlyData;
    });

    const tablePerformance = computed(() => {
        const tableData = {};

        tableStore.tables.forEach((table) => {
            tableData[table.id] = {
                id: table.id,
                number: table.number,
                capacity: table.capacity,
                orders: 0,
                revenue: 0,
                avgOccupancyTime: 0,
                turnovers: 0
            };
        });

        filteredOrders.value.forEach((order) => {
            if (order.tableId && tableData[order.tableId]) {
                const orderRevenue = order.items.reduce((sum, item) => {
                    return sum + item.price * item.quantity;
                }, 0);

                tableData[order.tableId].orders += 1;
                tableData[order.tableId].revenue += orderRevenue;
            }
        });

        return Object.values(tableData).sort((a, b) => b.revenue - a.revenue);
    });

    const waiterPerformance = computed(() => {
        const waiterData = {};

        filteredOrders.value.forEach((order) => {
            const waiterId = order.waiterId || 'unassigned';
            if (!waiterData[waiterId]) {
                waiterData[waiterId] = {
                    id: waiterId,
                    name: getWaiterName(waiterId),
                    orders: 0,
                    revenue: 0,
                    tips: 0,
                    avgOrderValue: 0
                };
            }

            const orderRevenue = order.items.reduce((sum, item) => {
                return sum + item.price * item.quantity;
            }, 0);

            waiterData[waiterId].orders += 1;
            waiterData[waiterId].revenue += orderRevenue;
            waiterData[waiterId].tips += order.tips || 0;
        });

        Object.values(waiterData).forEach((waiter) => {
            waiter.avgOrderValue = waiter.orders > 0 ? waiter.revenue / waiter.orders : 0;
        });

        return Object.values(waiterData).sort((a, b) => b.revenue - a.revenue);
    });

    // Methods
    function generateDailyData() {
        const data = [];
        const now = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            data.push({
                date: date.toISOString().split('T')[0],
                revenue: Math.floor(Math.random() * 2000) + 1500,
                orders: Math.floor(Math.random() * 50) + 30,
                customers: Math.floor(Math.random() * 80) + 50,
                avgOrderValue: Math.floor(Math.random() * 30) + 40
            });
        }

        return data;
    }

    function generateWeeklyData() {
        const data = [];
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() + 7 * i));

            data.push({
                week: `Week ${52 - i}`,
                startDate: startOfWeek.toISOString().split('T')[0],
                revenue: Math.floor(Math.random() * 8000) + 12000,
                orders: Math.floor(Math.random() * 200) + 250,
                customers: Math.floor(Math.random() * 300) + 400,
                avgOrderValue: Math.floor(Math.random() * 20) + 45
            });
        }

        return data;
    }

    function generateMonthlyData() {
        const data = [];
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            data.push({
                month: monthName,
                revenue: Math.floor(Math.random() * 20000) + 50000,
                orders: Math.floor(Math.random() * 500) + 1000,
                customers: Math.floor(Math.random() * 800) + 1200,
                avgOrderValue: Math.floor(Math.random() * 15) + 50
            });
        }

        return data;
    }

    function generateYearlyData() {
        const data = [];
        const currentYear = new Date().getFullYear();

        for (let i = 4; i >= 0; i--) {
            const year = currentYear - i;

            data.push({
                year: year.toString(),
                revenue: Math.floor(Math.random() * 100000) + 600000,
                orders: Math.floor(Math.random() * 5000) + 12000,
                customers: Math.floor(Math.random() * 8000) + 15000,
                avgOrderValue: Math.floor(Math.random() * 10) + 50
            });
        }

        return data;
    }

    function getPreviousPeriodRevenue() {
        // Mock calculation - in real app would fetch from backend
        const currentRevenue = revenueAnalytics.value?.total || 0;
        return currentRevenue * (0.85 + Math.random() * 0.3); // ±15% variance
    }

    function getWaiterName(waiterId) {
        const waiterNames = {
            1: 'Alice Johnson',
            2: 'Bob Smith',
            3: 'Carol Williams',
            4: 'David Brown',
            unassigned: 'Unassigned'
        };
        return waiterNames[waiterId] || `Waiter ${waiterId}`;
    }

    const exportReport = (reportType, format = 'csv') => {
        const data = getReportData(reportType);

        if (format === 'csv') {
            return exportToCSV(data, reportType);
        } else if (format === 'pdf') {
            return exportToPDF(data, reportType);
        }
    };

    const getReportData = (reportType) => {
        switch (reportType) {
            case 'sales':
                return {
                    summary: revenueAnalytics.value,
                    details: filteredOrders.value,
                    categories: categoryAnalytics.value
                };
            case 'inventory':
                return {
                    items: inventoryStore.ingredients,
                    lowStock: inventoryStore.lowStockItems,
                    movements: inventoryStore.stockMovements
                };
            case 'performance':
                return {
                    tables: tablePerformance.value,
                    waiters: waiterPerformance.value,
                    hourly: hourlyAnalytics.value
                };
            default:
                return {};
        }
    };

    const exportToCSV = (data, reportType) => {
        // CSV export implementation
        let csvContent = '';

        if (reportType === 'sales') {
            csvContent = 'Date,Revenue,Orders,Avg Order Value\n';
            historicalData.value.daily.forEach((day) => {
                csvContent += `${day.date},${day.revenue},${day.orders},${day.avgOrderValue}\n`;
            });
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        return true;
    };

    // eslint-disable-next-line no-unused-vars
    const exportToPDF = (data, reportType) => {
        // PDF export would be implemented with a library like jsPDF
        console.log('PDF export not implemented yet');
        return false;
    };

    return {
        // State
        selectedDateRange,
        customDateRange,
        selectedMetrics,
        historicalData,
        performanceMetrics,
        topSellingItems,
        customerAnalytics,
        financialMetrics,

        // Computed
        dateRangeData,
        filteredOrders,
        revenueAnalytics,
        categoryAnalytics,
        hourlyAnalytics,
        tablePerformance,
        waiterPerformance,

        // Methods
        exportReport,
        getReportData,
        exportToCSV,
        exportToPDF
    };
});

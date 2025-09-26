import { defineStore } from 'pinia';

export const useReportsStore = defineStore('reports', {
    state: () => ({
        salesData: [],
        revenueData: [],
        performanceMetrics: {},
        customReports: [],
        dashboardWidgets: [
            {
                id: 'revenue-today',
                title: "Today's Revenue",
                type: 'metric',
                value: 0,
                change: 0,
                icon: 'pi pi-dollar',
                color: '#22c55e'
            },
            {
                id: 'orders-today',
                title: 'Orders Today',
                type: 'metric',
                value: 0,
                change: 0,
                icon: 'pi pi-shopping-cart',
                color: '#3b82f6'
            },
            {
                id: 'avg-order-value',
                title: 'Average Order Value',
                type: 'metric',
                value: 0,
                change: 0,
                icon: 'pi pi-chart-line',
                color: '#8b5cf6'
            },
            {
                id: 'customer-satisfaction',
                title: 'Customer Satisfaction',
                type: 'metric',
                value: 0,
                change: 0,
                icon: 'pi pi-star',
                color: '#f59e0b'
            }
        ],
        reportFilters: {
            dateRange: {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                end: new Date()
            },
            period: 'daily', // daily, weekly, monthly, yearly
            location: 'all',
            staff: 'all',
            category: 'all'
        },
        chartData: {
            revenue: {
                labels: [],
                datasets: []
            },
            orders: {
                labels: [],
                datasets: []
            },
            products: {
                labels: [],
                datasets: []
            },
            categories: {
                labels: [],
                datasets: []
            }
        },
        kpis: {
            financial: {
                totalRevenue: 0,
                totalCost: 0,
                grossProfit: 0,
                netProfit: 0,
                profitMargin: 0,
                avgOrderValue: 0,
                revenueGrowth: 0
            },
            operational: {
                totalOrders: 0,
                completedOrders: 0,
                cancelledOrders: 0,
                avgPrepTime: 0,
                tablesTurned: 0,
                staffUtilization: 0,
                customerSatisfaction: 0
            },
            inventory: {
                totalItems: 0,
                lowStockItems: 0,
                outOfStockItems: 0,
                wasteAmount: 0,
                inventoryTurnover: 0
            }
        },
        trends: {
            hourly: [],
            daily: [],
            weekly: [],
            monthly: []
        },
        topPerformers: {
            products: [],
            categories: [],
            staff: [],
            tables: []
        }
    }),

    getters: {
        // Get revenue for specific period
        getRevenueByPeriod: (state) => (period) => {
            const now = new Date();
            let startDate;

            switch (period) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    startDate = state.reportFilters.dateRange.start;
            }

            return state.salesData.filter((sale) => new Date(sale.date) >= startDate).reduce((total, sale) => total + sale.amount, 0);
        },

        // Get orders count by period
        getOrdersByPeriod: (state) => (period) => {
            const now = new Date();
            let startDate;

            switch (period) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    startDate = state.reportFilters.dateRange.start;
            }

            return state.salesData.filter((sale) => new Date(sale.date) >= startDate).length;
        },

        // Get growth percentage
        getGrowthRate: (state) => (metric, period) => {
            const currentValue = state.kpis.financial[metric] || 0;
            const previousValue = state.performanceMetrics[`previous_${period}`]?.[metric] || 0;

            if (previousValue === 0) return 0;
            return ((currentValue - previousValue) / previousValue) * 100;
        },

        // Get top performing items
        getTopPerformers:
            (state) =>
            (type, limit = 10) => {
                return state.topPerformers[type]?.slice(0, limit) || [];
            },

        // Get filtered sales data
        getFilteredSalesData: (state) => {
            const { dateRange, location, staff, category } = state.reportFilters;

            return state.salesData.filter((sale) => {
                const saleDate = new Date(sale.date);
                const inDateRange = saleDate >= dateRange.start && saleDate <= dateRange.end;
                const matchesLocation = location === 'all' || sale.location === location;
                const matchesStaff = staff === 'all' || sale.staffId === staff;
                const matchesCategory = category === 'all' || sale.category === category;

                return inDateRange && matchesLocation && matchesStaff && matchesCategory;
            });
        }
    },

    actions: {
        // Initialize reports system
        async initializeReports() {
            try {
                await Promise.all([this.loadSalesData(), this.loadPerformanceMetrics(), this.calculateKPIs(), this.generateTrends(), this.updateDashboardWidgets()]);
                return { success: true };
            } catch (error) {
                console.error('Failed to initialize reports:', error);
                return { success: false, message: error.message };
            }
        },

        // Load sales data
        async loadSalesData() {
            try {
                // Simulate API call - replace with actual endpoint
                const mockSalesData = this.generateMockSalesData();
                this.salesData = mockSalesData;

                // Update chart data
                this.updateChartData();

                return { success: true };
            } catch (error) {
                console.error('Error loading sales data:', error);
                throw error;
            }
        },

        // Generate mock sales data
        generateMockSalesData() {
            const salesData = [];
            const now = new Date();

            // Generate 90 days of mock data
            for (let i = 90; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dayOfWeek = date.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                // Generate multiple transactions per day
                const transactionsPerDay = isWeekend ? Math.floor(Math.random() * 50) + 30 : Math.floor(Math.random() * 80) + 40;

                for (let j = 0; j < transactionsPerDay; j++) {
                    const hour = Math.floor(Math.random() * 14) + 10; // 10 AM to 11 PM
                    const transactionDate = new Date(date);
                    transactionDate.setHours(hour, Math.floor(Math.random() * 60));

                    salesData.push({
                        id: `SALE${Date.now()}${i}${j}`,
                        date: transactionDate.toISOString(),
                        orderId: `ORD${String(i).padStart(3, '0')}${String(j).padStart(2, '0')}`,
                        amount: parseFloat((Math.random() * 80 + 15).toFixed(2)), // $15-95
                        cost: parseFloat((Math.random() * 40 + 8).toFixed(2)), // $8-48
                        items: Math.floor(Math.random() * 5) + 1,
                        customerId: `CUST${Math.floor(Math.random() * 1000)}`,
                        staffId: `STF00${Math.floor(Math.random() * 5) + 1}`,
                        tableId: `T${Math.floor(Math.random() * 20) + 1}`,
                        category: ['appetizers', 'mains', 'desserts', 'beverages'][Math.floor(Math.random() * 4)],
                        paymentMethod: ['cash', 'card', 'digital_wallet'][Math.floor(Math.random() * 3)],
                        location: 'main', // Single location for now
                        tip: parseFloat((Math.random() * 15).toFixed(2)),
                        tax: parseFloat((Math.random() * 8).toFixed(2))
                    });
                }
            }

            return salesData.sort((a, b) => new Date(b.date) - new Date(a.date));
        },

        // Load performance metrics
        async loadPerformanceMetrics() {
            try {
                // Calculate metrics from sales data
                this.performanceMetrics = {
                    current_month: this.calculatePeriodMetrics('month'),
                    previous_month: this.calculatePreviousPeriodMetrics('month'),
                    current_week: this.calculatePeriodMetrics('week'),
                    previous_week: this.calculatePreviousPeriodMetrics('week'),
                    current_day: this.calculatePeriodMetrics('today'),
                    previous_day: this.calculatePreviousPeriodMetrics('today')
                };

                return { success: true };
            } catch (error) {
                console.error('Error loading performance metrics:', error);
                throw error;
            }
        },

        // Calculate KPIs
        async calculateKPIs() {
            try {
                const filteredData = this.getFilteredSalesData;

                // Financial KPIs
                const totalRevenue = filteredData.reduce((sum, sale) => sum + sale.amount, 0);
                const totalCost = filteredData.reduce((sum, sale) => sum + sale.cost, 0);
                const grossProfit = totalRevenue - totalCost;
                const totalOrders = filteredData.length;

                this.kpis.financial = {
                    totalRevenue,
                    totalCost,
                    grossProfit,
                    netProfit: grossProfit * 0.85, // Assuming 15% operational costs
                    profitMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
                    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
                    revenueGrowth: this.calculateGrowthRate('totalRevenue', 'month')
                };

                // Operational KPIs
                this.kpis.operational = {
                    totalOrders,
                    completedOrders: Math.floor(totalOrders * 0.95), // 95% completion rate
                    cancelledOrders: Math.floor(totalOrders * 0.05), // 5% cancellation rate
                    avgPrepTime: 12.5, // minutes
                    tablesTurned: Math.floor(totalOrders / 20), // Assuming 20 tables
                    staffUtilization: 87.5, // percentage
                    customerSatisfaction: 4.3 // out of 5
                };

                return { success: true };
            } catch (error) {
                console.error('Error calculating KPIs:', error);
                throw error;
            }
        },

        // Calculate metrics for a specific period
        calculatePeriodMetrics(period) {
            const revenue = this.getRevenueByPeriod(period);
            const orders = this.getOrdersByPeriod(period);

            return {
                revenue,
                orders,
                avgOrderValue: orders > 0 ? revenue / orders : 0
            };
        },

        // Calculate previous period metrics for comparison
        calculatePreviousPeriodMetrics(period) {
            // This would typically query historical data
            // For demo purposes, simulate with slight variations
            const current = this.calculatePeriodMetrics(period);

            return {
                revenue: current.revenue * (0.85 + Math.random() * 0.3), // ±15% variation
                orders: Math.floor(current.orders * (0.9 + Math.random() * 0.2)), // ±10% variation
                avgOrderValue: current.avgOrderValue * (0.9 + Math.random() * 0.2)
            };
        },

        // Generate trend data
        async generateTrends() {
            try {
                // Hourly trends for today
                this.trends.hourly = this.calculateHourlyTrends();

                // Daily trends for last 30 days
                this.trends.daily = this.calculateDailyTrends();

                // Weekly trends for last 12 weeks
                this.trends.weekly = this.calculateWeeklyTrends();

                // Monthly trends for last 12 months
                this.trends.monthly = this.calculateMonthlyTrends();

                return { success: true };
            } catch (error) {
                console.error('Error generating trends:', error);
                throw error;
            }
        },

        // Calculate hourly trends
        calculateHourlyTrends() {
            const trends = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let hour = 0; hour < 24; hour++) {
                const hourStart = new Date(today);
                hourStart.setHours(hour);
                const hourEnd = new Date(today);
                hourEnd.setHours(hour + 1);

                const hourSales = this.salesData.filter((sale) => {
                    const saleDate = new Date(sale.date);
                    return saleDate >= hourStart && saleDate < hourEnd;
                });

                trends.push({
                    period: `${hour}:00`,
                    revenue: hourSales.reduce((sum, sale) => sum + sale.amount, 0),
                    orders: hourSales.length,
                    avgOrderValue: hourSales.length > 0 ? hourSales.reduce((sum, sale) => sum + sale.amount, 0) / hourSales.length : 0
                });
            }

            return trends;
        },

        // Calculate daily trends
        calculateDailyTrends() {
            const trends = [];
            const now = new Date();

            for (let i = 29; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dayStart = new Date(date);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(date);
                dayEnd.setHours(23, 59, 59, 999);

                const daySales = this.salesData.filter((sale) => {
                    const saleDate = new Date(sale.date);
                    return saleDate >= dayStart && saleDate <= dayEnd;
                });

                trends.push({
                    period: date.toISOString().split('T')[0],
                    revenue: daySales.reduce((sum, sale) => sum + sale.amount, 0),
                    orders: daySales.length,
                    avgOrderValue: daySales.length > 0 ? daySales.reduce((sum, sale) => sum + sale.amount, 0) / daySales.length : 0
                });
            }

            return trends;
        },

        // Calculate weekly trends
        calculateWeeklyTrends() {
            const trends = [];
            const now = new Date();

            for (let i = 11; i >= 0; i--) {
                const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
                const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

                const weekSales = this.salesData.filter((sale) => {
                    const saleDate = new Date(sale.date);
                    return saleDate >= weekStart && saleDate < weekEnd;
                });

                trends.push({
                    period: `Week ${12 - i}`,
                    revenue: weekSales.reduce((sum, sale) => sum + sale.amount, 0),
                    orders: weekSales.length,
                    avgOrderValue: weekSales.length > 0 ? weekSales.reduce((sum, sale) => sum + sale.amount, 0) / weekSales.length : 0
                });
            }

            return trends;
        },

        // Calculate monthly trends
        calculateMonthlyTrends() {
            const trends = [];
            const now = new Date();

            for (let i = 11; i >= 0; i--) {
                const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
                const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

                const monthSales = this.salesData.filter((sale) => {
                    const saleDate = new Date(sale.date);
                    return saleDate >= monthStart && saleDate <= monthEnd;
                });

                trends.push({
                    period: monthDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
                    revenue: monthSales.reduce((sum, sale) => sum + sale.amount, 0),
                    orders: monthSales.length,
                    avgOrderValue: monthSales.length > 0 ? monthSales.reduce((sum, sale) => sum + sale.amount, 0) / monthSales.length : 0
                });
            }

            return trends;
        },

        // Update chart data
        updateChartData() {
            // Revenue chart data
            this.chartData.revenue = {
                labels: this.trends.daily.map((trend) => new Date(trend.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [
                    {
                        label: 'Revenue',
                        data: this.trends.daily.map((trend) => trend.revenue),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }
                ]
            };

            // Orders chart data
            this.chartData.orders = {
                labels: this.trends.daily.map((trend) => new Date(trend.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [
                    {
                        label: 'Orders',
                        data: this.trends.daily.map((trend) => trend.orders),
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4
                    }
                ]
            };

            // Category performance
            const categoryData = this.calculateCategoryPerformance();
            this.chartData.categories = {
                labels: Object.keys(categoryData),
                datasets: [
                    {
                        data: Object.values(categoryData),
                        backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6']
                    }
                ]
            };
        },

        // Calculate category performance
        calculateCategoryPerformance() {
            const categoryRevenue = {};

            this.getFilteredSalesData.forEach((sale) => {
                if (!categoryRevenue[sale.category]) {
                    categoryRevenue[sale.category] = 0;
                }
                categoryRevenue[sale.category] += sale.amount;
            });

            return categoryRevenue;
        },

        // Update dashboard widgets
        updateDashboardWidgets() {
            const todayRevenue = this.getRevenueByPeriod('today');
            const yesterdayRevenue = this.getRevenueByPeriod('yesterday');
            const todayOrders = this.getOrdersByPeriod('today');
            const yesterdayOrders = this.getOrdersByPeriod('yesterday');

            this.dashboardWidgets[0].value = todayRevenue;
            this.dashboardWidgets[0].change = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

            this.dashboardWidgets[1].value = todayOrders;
            this.dashboardWidgets[1].change = yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 : 0;

            this.dashboardWidgets[2].value = this.kpis.financial.avgOrderValue;
            this.dashboardWidgets[2].change = Math.random() * 10 - 5; // Mock change

            this.dashboardWidgets[3].value = this.kpis.operational.customerSatisfaction;
            this.dashboardWidgets[3].change = Math.random() * 2 - 1; // Mock change
        },

        // Generate custom report
        async generateCustomReport(reportConfig) {
            try {
                const {
                    title,
                    type, // sales, inventory, staff, financial
                    dateRange,
                    filters,
                    metrics,
                    chartType
                } = reportConfig;

                // Filter data based on config
                let reportData = this.salesData;

                if (dateRange) {
                    reportData = reportData.filter((item) => {
                        const itemDate = new Date(item.date);
                        return itemDate >= dateRange.start && itemDate <= dateRange.end;
                    });
                }

                // Apply additional filters
                if (filters) {
                    Object.entries(filters).forEach(([key, value]) => {
                        if (value !== 'all') {
                            reportData = reportData.filter((item) => item[key] === value);
                        }
                    });
                }

                // Calculate requested metrics
                const reportMetrics = {};
                if (metrics.includes('revenue')) {
                    reportMetrics.revenue = reportData.reduce((sum, item) => sum + item.amount, 0);
                }
                if (metrics.includes('orders')) {
                    reportMetrics.orders = reportData.length;
                }
                if (metrics.includes('avgOrderValue')) {
                    reportMetrics.avgOrderValue = reportData.length > 0 ? reportMetrics.revenue / reportData.length : 0;
                }

                const report = {
                    id: `RPT${Date.now()}`,
                    title,
                    type,
                    dateRange,
                    filters,
                    metrics: reportMetrics,
                    data: reportData,
                    chartType,
                    generatedAt: new Date().toISOString(),
                    generatedBy: 'current_user' // Replace with actual user
                };

                this.customReports.unshift(report);

                return { success: true, report };
            } catch (error) {
                console.error('Error generating custom report:', error);
                return { success: false, message: error.message };
            }
        },

        // Export report data
        async exportReport(reportId, format = 'csv') {
            try {
                const report = this.customReports.find((r) => r.id === reportId);
                if (!report) throw new Error('Report not found');

                let exportData;
                switch (format) {
                    case 'csv':
                        exportData = this.convertToCSV(report.data);
                        break;
                    case 'json':
                        exportData = JSON.stringify(report, null, 2);
                        break;
                    case 'pdf':
                        exportData = this.generatePDFReport(report);
                        break;
                    default:
                        throw new Error('Unsupported export format');
                }

                // Simulate file download
                const blob = new Blob([exportData], {
                    type: format === 'csv' ? 'text/csv' : format === 'json' ? 'application/json' : 'application/pdf'
                });

                if (typeof window !== 'undefined') {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${report.title.replace(/\s+/g, '_')}.${format}`;
                    link.click();
                    URL.revokeObjectURL(url);
                }

                return { success: true, message: `Report exported as ${format.toUpperCase()}` };
            } catch (error) {
                console.error('Export error:', error);
                return { success: false, message: error.message };
            }
        },

        // Convert data to CSV format
        convertToCSV(data) {
            if (!data || data.length === 0) return '';

            const headers = Object.keys(data[0]).join(',');
            const rows = data.map((row) =>
                Object.values(row)
                    .map((value) => (typeof value === 'string' ? `"${value}"` : value))
                    .join(',')
            );

            return [headers, ...rows].join('\n');
        },

        // Generate PDF report (simplified)
        generatePDFReport(report) {
            return `PDF Report: ${report.title}\nGenerated: ${report.generatedAt}\n\nMetrics:\n${JSON.stringify(report.metrics, null, 2)}`;
        },

        // Update report filters
        updateReportFilters(filters) {
            this.reportFilters = { ...this.reportFilters, ...filters };
            this.calculateKPIs();
            this.updateChartData();
            this.updateDashboardWidgets();
        },

        // Get profit analysis
        getProfitAnalysis() {
            const filteredData = this.getFilteredSalesData;
            const totalRevenue = filteredData.reduce((sum, sale) => sum + sale.amount, 0);
            const totalCost = filteredData.reduce((sum, sale) => sum + sale.cost, 0);

            return {
                revenue: totalRevenue,
                cost: totalCost,
                grossProfit: totalRevenue - totalCost,
                margin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
                breakdown: {
                    food_cost: totalCost * 0.7,
                    labor_cost: totalCost * 0.2,
                    overhead: totalCost * 0.1
                }
            };
        }
    }
});

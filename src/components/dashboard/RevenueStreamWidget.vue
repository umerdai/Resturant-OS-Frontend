<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const chartData = ref(null);
const chartOptions = ref(null);

// Filters
const selectedRange = ref('1 Day');
const selectedBranch = ref('Lahore Branch');

// Food items
const items = ['Burgers', 'Biryani', 'Pizza', 'Pasta'];

// Placeholder datasets by branch & time range
const datasetsByBranch = {
    'Lahore Branch': {
        '1 Day': [50, 80, 30, 40],
        '1 Week': [350, 500, 280, 320],
        '1 Month': [1200, 1800, 900, 1100]
    },
    'Islamabad Branch': {
        '1 Day': [60, 70, 45, 55],
        '1 Week': [400, 420, 310, 390],
        '1 Month': [1400, 1600, 1000, 1300]
    },
    'Karachi Branch': {
        '1 Day': [70, 60, 50, 65],
        '1 Week': [420, 380, 330, 410],
        '1 Month': [1500, 1400, 1100, 1250]
    }
};

function setChartData(branch = 'Lahore Branch', range = '1 Day') {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: items,
        datasets: [
            {
                type: 'bar',
                label: 'Orders',
                backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                data: datasetsByBranch[branch][range],
                barThickness: 40,
                borderRadius: 6
            }
        ]
    };
}

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const borderColor = documentStyle.getPropertyValue('--surface-border');
    const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        scales: {
            x: {
                ticks: {
                    color: textMutedColor
                },
                grid: {
                    color: 'transparent',
                    borderColor: 'transparent'
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: textMutedColor
                },
                grid: {
                    color: borderColor,
                    borderColor: 'transparent',
                    drawTicks: false
                }
            }
        }
    };
}

// Watch for theme or filter changes
watch([getPrimary, getSurface, isDarkTheme, selectedRange, selectedBranch], () => {
    chartData.value = setChartData(selectedBranch.value, selectedRange.value);
    chartOptions.value = setChartOptions();
});

onMounted(() => {
    chartData.value = setChartData(selectedBranch.value, selectedRange.value);
    chartOptions.value = setChartOptions();
});
</script>

<template>
    <div class="card">
        <div class="flex justify-between items-center mb-4">
            <div class="font-semibold text-xl">Food Sales</div>

            <div class="flex gap-3">
                <!-- Range Selector -->
                <Dropdown
                    v-model="selectedRange"
                    :options="['1 Day', '1 Week', '1 Month']"
                    class="w-40"
                />

                <!-- Branch Selector -->
                <Dropdown
                    v-model="selectedBranch"
                    :options="['Lahore Branch', 'Islamabad Branch', 'Karachi Branch']"
                    class="w-48"
                />
            </div>
        </div>

        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-80" />
    </div>
</template>

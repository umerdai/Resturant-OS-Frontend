<script setup>
import { computed } from 'vue';
import Chart from 'primevue/chart';

const props = defineProps({
    data: {
        type: Array,
        required: true
    },
    type: {
        type: String,
        default: 'line'
    },
    title: {
        type: String,
        required: true
    },
    height: {
        type: String,
        default: '300px'
    }
});

const chartData = computed(() => {
    if (props.type === 'line') {
        return {
            labels: props.data.map((d) => d.label),
            datasets: [
                {
                    label: props.title,
                    data: props.data.map((d) => d.value),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };
    } else if (props.type === 'doughnut') {
        return {
            labels: props.data.map((d) => d.label),
            datasets: [
                {
                    data: props.data.map((d) => d.value),
                    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
                }
            ]
        };
    }
    return {};
});

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: props.type === 'doughnut' ? 'bottom' : 'top'
        }
    }
}));
</script>

<template>
    <Card>
        <template #title>{{ title }}</template>
        <template #content>
            <Chart :type="type" :data="chartData" :options="chartOptions" :style="{ height }" />
        </template>
    </Card>
</template>

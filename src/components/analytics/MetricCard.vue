<script setup>
defineProps({
    title: String,
    value: [String, Number],
    icon: String,
    color: { type: String, default: 'blue' },
    trend: Number,
    subtitle: String
});

const formatValue = (val) => {
    if (typeof val === 'number' && val > 1000) {
        return (val / 1000).toFixed(1) + 'K';
    }
    return val;
};

const trendClass = (trend) => {
    if (trend > 0) return 'text-green-500';
    if (trend < 0) return 'text-red-500';
    return 'text-gray-500';
};
</script>

<template>
    <Card class="metric-card">
        <template #content>
            <div class="metric-content">
                <div :class="`metric-icon bg-${color}-100 dark:bg-${color}-900/30`">
                    <i :class="`pi ${icon} text-2xl text-${color}-600`"></i>
                </div>
                <div class="metric-details">
                    <div :class="`metric-value text-${color}-600`">
                        {{ formatValue(value) }}
                    </div>
                    <div class="metric-label">{{ title }}</div>
                    <div v-if="trend !== undefined" class="metric-change">
                        <i :class="`pi ${trend >= 0 ? 'pi-arrow-up' : 'pi-arrow-down'} ${trendClass(trend)}`"></i>
                        <span :class="trendClass(trend)">{{ Math.abs(trend) }}%</span>
                    </div>
                    <div v-else-if="subtitle" class="metric-subtitle">{{ subtitle }}</div>
                </div>
            </div>
        </template>
    </Card>
</template>

<style scoped>
.metric-card {
    transition: transform 0.2s ease;
}

.metric-card:hover {
    transform: translateY(-2px);
}

.metric-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.metric-icon {
    padding: 1rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.metric-value {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
}

.metric-label {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    margin-top: 0.25rem;
}

.metric-change,
.metric-subtitle {
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-top: 0.25rem;
}
</style>

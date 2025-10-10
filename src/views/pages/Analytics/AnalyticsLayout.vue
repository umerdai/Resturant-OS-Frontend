<script setup>
import Button from 'primevue/button';
</script>

<template>
    <div class="p-4">
        <h2 class="mb-4">Analytics Management</h2>
        <div class="flex flex-wrap justify-start gap-6 mb-6">
<Button
  class="AI-buttons"
  @click="$router.push('/analytics/sales-prediction-daily')"
>
  <i class="pi pi-chart-line text-3xl" style="font-size: 1.5rem;"></i>
  <div class="text-center">
    <div class="text-lg font-semibold">Sales Prediction</div>
    <div class="text-sm opacity-80">(Next Day)</div>
  </div>
</Button>
<Button
  class="AI-buttons"
  @click="$router.push('/analytics/sales-prediction')"
>
  <i class="pi pi-chart-line text-3xl" style="font-size: 1.5rem;"></i>
  <div class="text-center">
    <div class="text-lg font-semibold">Sales Prediction</div>
    <div class="text-sm opacity-80">(Next Week)</div>
  </div>
</Button>
<Button
  class="AI-buttons"
  @click="$router.push('/analytics/sales-prediction')"
>
  <i class="pi pi-android text-3xl" style="font-size: 1.5rem;"></i>
  <div class="text-center">
    <div class="text-lg font-semibold">Smart Order Assistant</div>
    <div class="text-sm opacity-80">(For combo meals)</div>
  </div>
</Button>
<Button
  class="AI-buttons"
  @click="$router.push('/analytics/sales-prediction')"
>
  <i class="pi pi-chart-line text-3xl" style="font-size: 1.5rem;"></i>
  <div class="text-center">
    <div class="text-lg font-semibold">Waste Reduction</div>
    <div class="text-sm opacity-80">(For food waste)</div>
  </div>
</Button>
<Button
  class="AI-buttons"
  @click="$router.push('/analytics/sales-prediction')"
>
  <i class="pi pi-chart-line text-3xl" style="font-size: 1.5rem;"></i>
  <div class="text-center">
    <div class="text-lg font-semibold">Menu Insights</div>
    <div class="text-sm opacity-80">(For menu optimization)</div>
  </div>
</Button>
<Button
  class="AI-buttons"
  @click="$router.push('/analytics/sales-prediction')"
>
  <i class="pi pi-chart-line text-3xl" style="font-size: 1.5rem;"></i>
  <div class="text-center">
    <div class="text-lg font-semibold">Inventory Prediction</div>
    <div class="text-sm opacity-80">(For stock management)</div>
  </div>
</Button>
<Button
  class="AI-buttons"
  @click="$router.push('/analytics/sales-prediction')"
>
  <i class="pi pi-chart-line text-3xl" style="font-size: 1.5rem;"></i>
  <div class="text-center">
    <div class="text-lg font-semibold">Targeted Promotions</div>
    <div class="text-sm opacity-80">(For specific customer segments)</div>
  </div>
</Button>
<Button
  class="AI-buttons"
  @click="$router.push('/analytics/sales-prediction')"
>
  <i class="pi pi-chart-line text-3xl" style="font-size: 1.5rem;"></i>
  <div class="text-center">
    <div class="text-lg font-semibold">Daily Sales Reports</div>
    <div class="text-sm opacity-80">(For daily sales performance)</div>
  </div>
</Button>
<Button
  class="AI-buttons"
  @click="$router.push('/analytics/sales-prediction')"
>
  <i class="pi pi-chart-line text-3xl" style="font-size: 1.5rem;"></i>
  <div class="text-center">
    <div class="text-lg font-semibold">Weekly Sales Reports</div>
    <div class="text-sm opacity-80">(For weekly sales performance)</div>
  </div>
</Button>
<Button
  class="AI-buttons"
  @click="$router.push('/analytics/sales-prediction')"
>
  <i class="pi pi-chart-line text-3xl" style="font-size: 1.5rem;"></i>
  <div class="text-center">
    <div class="text-lg font-semibold">Daily Waste Reports</div>
    <div class="text-sm opacity-80">(For daily waste performance)</div>
  </div>
</Button>
<Button
  class="AI-buttons"
  @click="$router.push('/analytics/sales-prediction')"
>
  <i class="pi pi-chart-line text-3xl" style="font-size: 1.5rem;"></i>
  <div class="text-center">
    <div class="text-lg font-semibold">Weekly Waste Reports</div>
    <div class="text-sm opacity-80">(For weekly waste performance)</div>
  </div>
</Button>
        </div>
        <router-view />
    </div>
</template>
<style scoped>

.AI-buttons{
     display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem; /* gap-2 */
  width: 10rem; /* w-40 */
  height: 10rem; /* h-32 */
  padding: 1rem; /* p-4 */
  background-color: var(--p-button-primary-background); /* bg-blue-500 */
  color: white;
  border: none;
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* shadow-md */
  cursor: pointer;
  transition: all 0.2s ease-in-out; 
}

.AI-buttons:hover {
  background-color: #14a18a; /* hover:bg-blue-600 */
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}


.text {
  text-align: center;
}
</style>

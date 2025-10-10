<template>
  <div class="card p-4">
    <h2 class="text-xl font-semibold mb-4">📊 Daily Sales Prediction</h2>

    <!-- Controls -->
    <div class="flex flex-wrap align-items-center gap-3 mb-4">
      <div class="flex align-items-center gap-2">
        <label for="itemSelect" class="font-medium">Select Item:</label>
        <Dropdown
          id="itemSelect"
          v-model="selectedItem"
          :options="itemOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select Item"
          class="w-14rem"
        />
      </div>

      <Button
        label="Get Prediction"
        icon="pi pi-search"
        class="p-button-primary"
        @click="fetchPrediction"
        :loading="loading"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-content-center mt-4">
      <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="4" />
    </div>

    <!-- Result -->
    <div v-if="prediction && !loading" class="p-4 border-round surface-card shadow-2">
      <div class="flex align-items-center justify-content-between mb-3">
        <div>
          <h3 class="text-lg font-semibold mb-1">Prediction Result</h3>
          <span class="text-600">Generated: {{ prediction.generated_at }}</span>
        </div>
    </div>
<div class="flex justify-content-end mb-3">
  <Tag severity="info" :value="prediction.item" />
</div>


      <div class="grid">
        <div class="col-12 md:col-4">
          <div class="text-600 mb-1">Predicted Sales</div>
          <div class="text-2xl font-bold">{{ prediction.predicted_sales }}</div>
        </div>
        <div class="col-12 md:col-4">
          <div class="text-600 mb-1">Confidence</div>
          <div class="text-2xl font-bold text-blue-500">
            {{ prediction.confidence }}%
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="text-600 mb-1">Period</div>
          <div class="text-2xl font-bold text-green-600">Next Day</div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <Message v-if="error" severity="error" class="mt-3">{{ error }}</Message>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const itemOptions = [
  { label: 'All Items', value: 'all' },
  { label: 'Burger', value: 'burger' },
  { label: 'Pizza', value: 'pizza' },
  { label: 'Fries', value: 'fries' },
  { label: 'Cold Drink', value: 'cold_drink' },
]

const selectedItem = ref(null)
const loading = ref(false)
const prediction = ref(null)
const error = ref(null)

const fetchPrediction = async () => {
  if (!selectedItem.value) {
    error.value = 'Please select an item.'
    return
  }

  error.value = null
  loading.value = true
  prediction.value = null

  try {
    // Dummy API simulation (replace with your real endpoint)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // fake delay

    prediction.value = {
      item: selectedItem.value === 'all' ? 'All Items' : selectedItem.value,
      predicted_sales: Math.floor(Math.random() * 400) + 100,
      confidence: (Math.random() * 20 + 80).toFixed(2),
      generated_at: new Date().toLocaleString(),
    }
  } catch (err) {
    error.value = 'Failed to fetch prediction.'
  } finally {
    loading.value = false
  }
}
</script>

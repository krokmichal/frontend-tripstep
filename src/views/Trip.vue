<template>
  <div class="main-content">
    <TripForm />
    <TripMap />
    <TripItinerary />
    <BudgetManager />
  </div>
</template>

<script setup>
import TripForm from '../components/Trip/TripForm.vue';
import TripMap from '../components/Trip/TripMap.vue';
import BudgetManager from '../components/Trip/TripBudget.vue';
import TripItinerary from '../components/Trip/TripItinerary.vue';
</script>

<style scoped>
.main-content {
  margin-top: 150px;
}
</style>











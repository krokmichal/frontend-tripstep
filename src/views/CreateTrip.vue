<template>
  <div class="create-trip">
    <h1 class="form-title">Create New Trip</h1>
    <form @submit.prevent="submitTrip">
      <label for="name" class="form-label">Trip Name:</label>
      <input v-model="trip.name" type="text" id="name" required class="form-input" />

      <label for="departureDate" class="form-label">Departure Date (optional):</label>
      <input v-model="trip.departureDate" type="date" id="departureDate" class="form-input" />

      <label for="returnDate" class="form-label">Return Date (optional):</label>
      <input v-model="trip.returnDate" type="date" id="returnDate" class="form-input" />

      <button type="submit" class="form-button">Save Trip</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useTripStore } from "@/stores/TripStore";
import { useRouter } from "vue-router";

const tripStore = useTripStore();
const router = useRouter();

// Dane nowego tripa
const trip = ref({
  name: "",
  departureDate: null,
  returnDate: null,
});

// Obsługa zapisu tripa
const submitTrip = async () => {
  try {
    await tripStore.addTrip(trip.value); // Wywołanie metody addTrip
    router.push("/"); // Przekierowanie do Home.vue
  } catch (error) {
    console.error("Error creating trip:", error);
  }
};
</script>

<style scoped>
.create-trip {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top:150px;
}

.form-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #555;
}

.form-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.form-button {
  width: 100%;
  padding: 12px;
  background-color: #3b82f6;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.form-button:hover {
  background-color: #2563eb;
}

.form-button:active {
  background-color: #1d4ed8;
}
</style>

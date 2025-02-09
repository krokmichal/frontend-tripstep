<template>
  <!-- Sprawdzenie, czy użytkownik jest zalogowany -->
  <div v-if="!authStore.user">
    <section class="hero-section">
      <div class="container">
        <div class="row">
          <!-- Logo aplikacji -->
          <div class="col-md-5 hero-info text-center">
            <div class="row">
              <div class="col-12 text-logo">
                <span>tripstep</span>
              </div>
            </div>
          </div>
          <!-- Obrazek główny -->
          <div class="col-md-7">
            <img id="hero-img" :src="heroImage" alt="Hero Image" class="img-fluid" />
          </div>
        </div>
        <!-- Przycisk rejestracji dla niezalogowanych użytkowników -->
        <div class="row mt-4">
          <div class="col-8 offset-2">
            <button class="btn-primary btn-lg" type="submit">
              <router-link to="/register" class="text-white">Start now</router-link>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
  <!-- Widok dla zalogowanych użytkowników -->
  <div v-else>
    <section class="hero-section">
      <div class="container">
        <div class="row">
          <div class="col-12 hero-info text-center">
            <div class="row">
              <div class="col-12 text-logo">
                <span>Let's go somewhere!</span>
              </div>
            </div>
            <p class="hero-text">Pick a trip to start planning.</p>
            <!-- Przycisk do tworzenia nowej podróży -->
            <div class="row mt-4">
            <div class="col-8 offset-2">
              <button class="btn btn-primary btn-lg" @click="goToCreateTrip">Create new trip</button>
            </div>
          </div>
          </div>
        </div>
        <!-- Jeśli użytkownik nie ma żadnych podróży -->
        <div class="row" v-if="trips.length === 0">
          <div class="col-8 offset-2">
            <button class="btn btn-primary btn-lg" @click="goToCreateTrip">Create trip</button>
          </div>
        </div>
        <!-- Lista podróży użytkownika -->
        <div v-else class="trip-container">
          <div class="row">
            <div
              class="col-md-4 single-trip"
              v-for="(trip, index) in trips"
              :key="index"
              @click="editTrip(index)"
            >
              <div class="trip-card p-3 border rounded shadow-sm">
                <!-- Menu rozwijane dla każdej podróży -->
                <div class="dropdown single-trip-menu">
                  <button
                    class="btn btn-sm btn-outline-orange dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    @click.stop
                  >
                    <img src="/src/assets/img/3dots.png" alt="" class="dropdown-img" />
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <button
                        @click.stop
                        class="dropdown-item btn btn-outline-orange w-100"
                        @click="confirmDeleteTrip(trip.id)"
                      >
                        <i class="fas fa-trash-alt"></i> Delete
                      </button>
                    </li>
                    <li>
                      <button class="dropdown-item btn btn-outline-orange w-100" @click.stop @click="shareTrip(trip.id)">
                        <i class="fas fa-share"></i> Share
                      </button>
                    </li>
                  </ul>
                </div>
                <!-- Informacje o podróży -->
                <h3 class="text-center">
                  <strong>{{ trip.name }}</strong>
                </h3>
                <p class="text-muted text-center">Trip ID: <strong>{{ trip.id }}</strong></p>
                <p><strong>Departure Date:</strong> {{ trip.departureDate }}</p>
                <p><strong>Return Date:</strong> {{ trip.returnDate }}</p>
                <p><strong>Departure City:</strong> {{ trip.departureCity }}</p>
                <p><strong>Arrival City:</strong> {{ trip.arrivalCity }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Importowanie wymaganych modułów i komponentów
import heroImage from "@/assets/hero-img.jpg";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useTripStore } from "../stores/TripStore";

// Pobranie instancji store'ów i routera
const tripStore = useTripStore();
const authStore = useAuthStore();
const router = useRouter();

// Obliczona właściwość dla listy podróży
const trips = computed(() => tripStore.trips);

// Nawigacja do strony tworzenia nowej podróży
const goToCreateTrip = () => {
  router.push("/create-trip");
};

// Funkcja do udostępniania podróży (jeszcze niezaimplementowana)
const shareTrip = () => {
  alert("This feature will be available soon");
};

// Edycja podróży - przekierowanie na stronę edycji
const editTrip = (index) => {
  // Pobranie id wycieczki
  const tripId = trips.value[index].id;
  tripStore.setCurrentTrip(tripId); // Ustawienie aktualnego tripId w store
  // Zapis w local storage
  localStorage.setItem("tripToEdit", JSON.stringify(trips.value[index]));
  router.push({ path: "/trip", query: { edit: true } });
};

// Potwierdzenie usunięcia podróży
const confirmDeleteTrip = (tripId) => {
  if (confirm("Are you sure you want to delete this trip?")) {
    deleteTrip(tripId);
  }
};

// Usuwanie podróży z listy na podstawie jej id
const deleteTrip = async (tripId) => {
  try {
    // Wywołanie funkcji z TripStore.js
    await tripStore.deleteTrip(tripId);
  } catch (error) {
    console.error("Failed to delete trip:", error);
  }
};

// Pobieranie danych użytkownika i jego podróży przy zamontowaniu komponentu
onMounted(async () => {
  await authStore.getUser(); // Pobranie danych użytkownika
  await tripStore.fetchTrips(); // Pobranie listy podróży
});
</script>


<style scoped>
.hero-section {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: white;
}

.hero-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.hero-text {
  font-weight: 700;
  font-size: 2rem;
  color: #7f8c8d;
  margin-top: 20px;
}

.text-logo span {
  color: var(--orange);
  font-size: 4rem;
  font-weight: 900;
}

#hero-img {
  width: 400px; /* Zmniejszono rozmiar */
  height: auto;
  border-radius: 66% 34% 74% 26% / 30% 55% 45% 70%; /* Unikalny kształt obramowania */
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
  border: 4px solid black; /* Obramowanie */
}


button {
  background-color: var(--orange);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background-color: #e67e22;
}

.trip-container {
  margin-top: 30px;
}

.single-trip {
  cursor: pointer;
  margin: 15px 0;
}

.single-trip-menu {
  display: flex;
  justify-content: flex-end;
}

.trip-card {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.trip-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.trip-card h3 {
  font-size: 1.5rem;
  color: #2c3e50;
}

.trip-card p {
  font-size: 1rem;
  color: #7f8c8d;
}

.dropdown-menu {
  min-width: 150px;
}

.dropdown-item {
  font-size: 0.9rem;
}

.dropdown-item i {
  margin-right: 8px;
}

/* Nowa klasa dla przycisku z "..." */
.btn-outline-orange {
  border-color: var(--orange);
  color: var(--orange);
  background-color: transparent;
  transition: all 0.3s ease;
  padding: 5px 12px;
  font-size: 1rem;
}

.btn-outline-orange:hover {
  background-color: var(--orange);
  color: white;
}

.dropdown-img {
  width: 12px;
  height: 12px;
  margin-right: 5px;
}

.btn-outline-orange.w-100 {
  width: 100%;
}

/* Przycisk delete i share po najechaniu */
.dropdown-item.btn:hover {
  background-color: var(--orange);
  color: white;
}
</style>
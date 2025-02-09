<template>
  <div>
    <div class="container main-container">
      <div class="row">
        <div class="col-12">
          <!-- Alert wyświetlany po zapisie -->
          <!-- Pokazuje komunikat o pomyślnym zapisaniu wycieczki -->
          <div
            v-if="showAlert"
            class="alert alert-success d-flex align-items-center position-fixed top-50 start-50 translate-middle"
            role="alert"
          >
            <svg
              class="bi flex-shrink-0 me-2"
              width="24"
              height="24"
              role="img"
              aria-label="Success:"
            >
              <use xlink:href="#check-circle-fill" />
            </svg>
            <div>Trip saved successfully!</div>
          </div>

          <!-- Formularz do tworzenia lub edytowania wycieczki -->
          <form v-if="trip" @submit.prevent="saveTrip" class="trip-form">
            <div class="top-trip-menu">
              <!-- Przycisk powrotu do strony głównej -->
              <button class="button btn-primary back-icon" @click="backToHome">
                <img src="/src/assets/img/back.png" alt="Back" />
              </button>
            
              <!-- Przycisk do zapisania wycieczki -->
              <button type="submit" class="btn btn-primary">
                {{ isEdit ? "Save changes" : "Save trip" }}
              </button>
            </div>

            <!-- Kompaktowy układ pól formularza -->
            <!-- Form Fields: Name, Number of People, Departure and Return Dates, Cities -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="tripName" class="form-label">Trip Name</label>
                <input
                  type="text"
                  class="form-control editable-input"
                  id="tripName"
                  v-model="trip.name"
                  required
                />
              </div>
              <div class="col-md-6">
                <label for="numberOfPeople" class="form-label"
                  >Number of People</label
                >
                <input
                  type="number"
                  class="form-control editable-input"
                  id="numberOfPeople"
                  v-model="trip.numberOfPeople"
                  required
                />
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <label for="departureDate" class="form-label"
                  >Departure Date</label
                >
                <input
                  type="date"
                  class="form-control editable-input"
                  id="departureDate"
                  v-model="trip.departureDate"
                  required
                />
              </div>
              <div class="col-md-6" v-if="roundTrip">
                <label for="returnDate" class="form-label">Return Date</label>
                <input
                  type="date"
                  class="form-control editable-input"
                  id="returnDate"
                  v-model="trip.returnDate"
                  required
                />
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <label for="departureCity" class="form-label"
                  >Departure City</label
                >
                <input
                  type="text"
                  class="form-control editable-input"
                  id="departureCity"
                  v-model="trip.departureCity"
                  required
                />
              </div>
              <div class="col-md-6">
                <label for="arrivalCity" class="form-label">Arrival City</label>
                <input
                  type="text"
                  class="form-control editable-input"
                  id="arrivalCity"
                  v-model="trip.arrivalCity"
                  required
                />
              </div>
            </div>

            <!-- Pole do notatek dla użytkownika -->
            <div class="mb-3">
              <label for="notes" class="form-label">Notes</label>
              <textarea
                class="form-control editable-input"
                id="notes"
                v-model="trip.notes"
                rows="2"
              ></textarea>
            </div>
          </form>

          <!-- Jeśli dane wycieczki są ładowane, wyświetlany jest komunikat -->
          <div v-else>
            <h1>Loading trip data...</h1>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Przycisk do wyszukiwania lotów -->
  <button type="button" class="btn btn-secondary" @click="searchFlights">
    Search Flights
  </button>
  <!-- Przycisk do wyszukiwania hoteli -->
  <button type="button" class="btn btn-primary" @click="searchHotels">
    Search Hotels
  </button>

<!-- Sekcja hoteli: wyświetla listę hoteli, jeśli dostępne -->
  <section v-if="tripStore.hotels.length > 0" class="hotels-section">
    <h3>Hotels</h3>
    <div class="row g-3">
      <div
        class="col-md-6 col-lg-4"
        v-for="hotel in tripStore.hotels"
        :key="hotel.id"
      >
        <div class="card h-100">
          <img
            :src="hotel.image_url || 'https://via.placeholder.com/300x200'"
            class="card-img-top"
            alt="Hotel image"
          />
          <div class="card-body">
            <h5 class="card-title">{{ hotel.title }}</h5>
            <p class="card-text">
              <strong>Address:</strong> {{ hotel.address || "N/A" }}
            </p>
            <p class="card-text">
              <strong>Rating:</strong> {{ hotel.rating || "N/A" }}⭐️
              ({{ hotel.review_count || 0 }} reviews)
            </p>
            <p class="card-text">
              <strong>Price:</strong> {{ hotel.price || "N/A" }}
            </p>
            <a
              v-if="hotel.book_url"
              :href="hotel.book_url"
              class="btn btn-primary btn-sm me-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Link
            </a>
            <!-- Przycisk usuwania hotelu -->
            <button
              @click="deleteHotel(hotel.id)"
              class="btn btn-danger btn-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

<!-- Sekcja lotów: wyświetla listę lotów, jeśli dostępne -->
  <section v-if="tripStore.flights.length > 0" class="flights-section">
    <h3>Flights</h3>
    <div class="row g-3">
      <div
        class="col-md-6 col-lg-4"
        v-for="flight in tripStore.flights"
        :key="flight.id"
      >
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ flight.title }}</h5>
            
            <!-- Sekcja lotu w jedną stronę -->
            <h6 class="card-subtitle mb-2 text-muted">First-way</h6>
            <p class="card-text">
              <strong>From:</strong> {{ flight.departure_airport_first || "N/A" }} → 
              {{ flight.arrival_airport_first || "N/A" }}
            </p>
            <p class="card-text">
              <strong>Departure:</strong> {{ flight.departure_date_first || "N/A" }} |
              <strong>Arrival:</strong> {{ flight.arrival_date_first || "N/A" }}
            </p>

            <!-- Sekcja powrotu (pokazywana tylko, jeśli wszystkie dane są dostępne) -->
            <div v-if="flight.departure_airport_second && flight.arrival_airport_second && flight.departure_date_second && flight.arrival_date_second">
              <h6 class="card-subtitle mb-2 text-muted">Return</h6>
              <p class="card-text">
                <strong>From:</strong> {{ flight.departure_airport_second || "N/A" }} → 
                {{ flight.arrival_airport_second || "N/A" }}
              </p>
              <p class="card-text">
                <strong>Departure:</strong> {{ flight.departure_date_second || "N/A" }} |
                <strong>Arrival:</strong> {{ flight.arrival_date_second || "N/A" }}
              </p>
            </div>

            <p class="card-text">
              <strong>Price:</strong> ${{ flight.price }}
            </p>

            <!-- Przyciski: Link i Usuwanie -->
            <a
              v-if="flight.sky_scanner_url"
              :href="flight.sky_scanner_url"
              class="btn btn-primary btn-sm me-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Link
            </a>
            <!-- Przycisk usuwania lotu -->
            <button @click="deleteFlight(flight.id)" class="btn btn-danger btn-sm">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>


<script setup>
import { ref, computed, onMounted, watch } from "vue";  // Importowanie funkcji z Vue
import { useRouter, useRoute } from "vue-router"; // Importowanie funkcji do obsługi nawigacji
import { useTripStore } from "../../stores/TripStore"; // Importowanie store'u dla tripów

// Zmienna przechowująca listę lotów
const flights = ref([]);
// Flaga, czy podróż jest w obie strony
const roundTrip = ref(true);
// Store przechowujący dane o podróży
const tripStore = useTripStore();
// Router do zarządzania nawigacją
const router = useRouter();
// Dostęp do parametrów trasy
const route = useRoute();

// Określenie, czy formularz jest do edycji (na podstawie query parametru 'edit')
const isEdit = ref(route.query.edit === "true");

// Obiekt przechowujący dane podróży
const trip = ref({
  name: "",
  departureDate: "",
  returnDate: "",
  departureCity: "",
  arrivalCity: "",
  numberOfPeople: 1,
  notes: "",
  budget: null,
  expenses: [],
});

// Funkcja nawigująca do strony głównej
const backToHome = () => {
  router.push("/"); // Przekierowanie do strony głównej
};

// Funkcja do nawigacji do strony z hotelami
const searchHotels = () => {
  router.push("/trip-hotels"); // Przekierowanie do strony hoteli
};

// Funkcja do nawigacji do strony z lotami
const searchFlights = () => {
  router.push("/flights"); // Przekierowanie do strony lotów
};

// Funkcja do usunięcia hotelu
const deleteHotel = async (hotelId) => {
  if (confirm("Are you sure you want to delete this hotel?")) { // Potwierdzenie usunięcia
    try {
      await tripStore.deleteHotel(hotelId); // Usunięcie hotelu z tripStore
      await tripStore.fetchHotels(tripStore.currentTripId); // Odświeżenie listy hoteli
    } catch (error) {
      console.error("Failed to delete hotel:", error); // Obsługa błędu
      alert("Error deleting the hotel. Please try again.");
    }
  }
};

// Funkcja do usunięcia lotu
const deleteFlight = async (flightId) => {
  if (confirm("Are you sure you want to delete this flight?")) { // Potwierdzenie usunięcia
    try {
      await tripStore.deleteFlight(flightId); // Usunięcie lotu z tripStore
      console.log(`Flight ${flightId} deleted.`);
    } catch (error) {
      console.error("Failed to delete flight:", error); // Obsługa błędu
      alert("Error deleting the flight. Please try again.");
    }
  }
};

// Funkcja wykonywana po załadowaniu komponentu
onMounted(async () => {
  let tripId = tripStore.currentTripId;

  if (tripId) {
    // Sprawdzenie, czy trip istnieje lokalnie
    trip.value = tripStore.trips.find((t) => t.id === tripId);
    if (!trip.value) {
      console.log("Trip not found locally, fetching from API...");
      trip.value = await tripStore.fetchSingleTrip(tripId); // Pobranie tripa z API
    }
  } else {
    console.error("currentTripId is not set!");
    router.push("/"); // Przekierowanie do strony głównej, jeśli nie ma tripa
  }

  // Pobranie miejsc do odwiedzenia, hoteli i lotów dla aktualnej podróży
  tripStore.fetchPlacesToVisit(tripId);
  tripStore.fetchHotels(tripStore.currentTripId);
  tripStore.fetchFlights(tripStore.currentTripId);
});

// Obserwowanie zmiany currentTripId w store
watch(
  () => tripStore.currentTripId,
  (newTripId) => {
    if (newTripId) {
      console.log("Zaktualizowano currentTripId:", newTripId);
      tripStore.fetchPlacesToVisit(newTripId); // Odświeżenie miejsc do odwiedzenia
    }

    // Obsługa edytowania tripa z localStorage
    if (isEdit.value) {
      const savedTrip = JSON.parse(localStorage.getItem("tripToEdit"));
      if (savedTrip) {
        trip.value = savedTrip;
        if (!trip.value.expenses) {
          trip.value.expenses = []; // Inicjalizacja listy wydatków, jeśli nie istnieje
        }
      }
    }
  }
);

// Zmienna do kontrolowania wyświetlania alertu o sukcesie zapisu
const showAlert = ref(false);

// Funkcja zapisująca dane podróży
const saveTrip = async () => {
  try {
    console.log("Saving trip:", trip.value);

    // Jeżeli edytujemy trip, wykonujemy aktualizację, w przeciwnym razie dodajemy nowy trip
    if (isEdit.value) {
      await tripStore.updateTrip(trip.value);
    } else {
      await tripStore.addTrip(trip.value);
    }

    // Wyświetlenie alertu o sukcesie
    showAlert.value = true;

    // Ukrycie alertu po 2 sekundach
    setTimeout(() => {
      showAlert.value = false;
    }, 2000);

    console.log("Trip saved successfully!");
  } catch (error) {
    console.error("Error saving trip:", error); // Obsługa błędu
  }
};
</script>


<style scoped>
#app {
  padding-top: 20px;
}

.hero-section {
  height: 97vh;
}

.hero-section .row {
  margin: 10vh 0 10vh;
}

.main-container {
  margin-top: 2em;
}

input[type="radio"] {
  width: 15px;
  height: 15px;
  margin-right: 5px;
}

.radio-label {
  margin-right: 5px;
}

.expense-category {
  margin: 5px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
}

.expense-category.selected {
  background-color: #007bff;
  color: white;
}

.progress-bar {
  transition: width 0.3s ease-in-out;
}

.bg-danger {
  background-color: #dc3545 !important;
}

.list-group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.api-second-row {
  margin-top: 10px;
}

.top-trip-menu {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

/* .back-icon {
  transform: scale(0.5);
} */

.hotels-section {
  margin-top: 20px;
}

.hotels-list {
  list-style: none;
  padding: 0;
}

.hotel-item {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

/* Formularz */
.trip-form {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

/* Pojedyncze pola */
.form-label {
  font-weight: bold;
  margin-bottom: 5px;
}

.editable-input {
  background-color: #f0f0f0; /* Nieedytowalne pole */
  border: 1px solid #ccc;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.editable-input:focus {
  background-color: white; /* Pole staje się edytowalne */
  border-color: #007bff; /* Akcent na niebiesko */
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* Subtelny cień */
}

/* Układ w jednej linii */
.row {
  margin-bottom: 10px; /* Mniejszy odstęp między wierszami */
}

.col-md-6 {
  display: flex;
  flex-direction: column;
}

/* Górny pasek */
.top-trip-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.top-trip-menu h2 {
  margin: 0;
}

/* Przycisk wstecz */
.back-icon img {
  width: 20px;
  height: 20px;
  margin-right: 5px;
}

.flights-section {
  margin-top: 20px;
}

.card {
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: scale(1.02);
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
}

.card-subtitle {
  font-size: 0.95rem;
  color: #6c757d;
}

.card-text {
  font-size: 0.9rem;
}

.btn {
  margin-top: 10px;
}


.flights-section,
.hotels-section {
  margin-top: 20px;
}

.card {
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: scale(1.02);
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
}

.card-text {
  font-size: 0.9rem;
}

.card-img-top {
  height: 200px;
  object-fit: cover;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.btn {
  margin-top: 10px;
}

</style>

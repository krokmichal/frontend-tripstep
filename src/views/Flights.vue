<template>
  <div>
    <div class="container main-container">
      <form @submit.prevent="handleSearch" ref="flightForm">
        <div class="row">
          <div class="col-12">
            <h2>Search Flights</h2>

            <!-- Departure City -->
            <div class="mb-3">
              <label for="departureCity" class="form-label">Departure City</label>
              <input
                type="text"
                class="form-control"
                id="departureCity"
                v-model="trip.departureCity"
                required
              />
            </div>

            <!-- Lista propozycji dla Departure City -->
<div v-if="airportSuggestionsDeparture.length" class="mt-3">
  <h4>Did you mean (Departure)?</h4>
  <ul>
    <li
      v-for="(suggestion, index) in airportSuggestionsDeparture"
      :key="index"
      class="suggestion-item"
      @click="selectDepartureAirport(suggestion.skyId)"
    >
      {{ suggestion.title }}
    </li>
  </ul>
</div>



            <!-- Arrival City -->
            <div class="mb-3">
              <label for="arrivalCity" class="form-label">Arrival City</label>
              <input
                type="text"
                class="form-control"
                id="arrivalCity"
                v-model="trip.arrivalCity"
                required
              />
            </div>

            <!-- Lista propozycji dla Arrival City -->
<div v-if="airportSuggestionsArrival.length" class="mt-3">
  <h4>Did you mean (Arrival)?</h4>
  <ul>
    <li
      v-for="(suggestion, index) in airportSuggestionsArrival"
      :key="index"
      class="suggestion-item"
      @click="selectArrivalAirport(suggestion.skyId)"
    >
      {{ suggestion.title }}
    </li>
  </ul>
</div>

            <!-- Departure Date -->
            <div class="mb-3">
              <label for="departureDate" class="form-label">Departure Date</label>
              <input
                type="date"
                class="form-control"
                id="departureDate"
                v-model="trip.departureDate"
                required
              />
            </div>

            <!-- Return Date -->
            <div class="mb-3" v-if="roundTrip">
              <label for="returnDate" class="form-label">Return Date</label>
              <input
                type="date"
                class="form-control"
                id="returnDate"
                v-model="trip.returnDate"
                :required="roundTrip"
              />
            </div>

            <!-- Round Trip Checkbox -->
            <div class="form-check mb-3">
              <input
                class="form-check-input"
                type="checkbox"
                id="roundTripCheck"
                v-model="roundTrip"
              />
              <label class="form-check-label" for="roundTripCheck">Round trip</label>
            </div>

            <!-- Number of People -->
            <div class="mb-3">
              <label for="numberOfPeople" class="form-label">Number of People</label>
              <input
                type="number"
                class="form-control"
                id="numberOfPeople"
                v-model="trip.numberOfPeople"
                min="1"
                required
              />
            </div>

          <!-- Przyciski "Search Airports" i "Search Flights" -->
<div class="buttons-container">
  <p class="description">Please search for airports first, because we using IATA codes for searching flights</p>
  <button @click="handleAirportSearch" class="btn btn-primary">
    Search Airports
  </button>

  <button @click="handleFlightSearch" 
          class="btn btn-secondary" 
          :disabled="isSearchLoading || isLoadingFlights">
    <span v-if="isSearchLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Search Flights
  </button>
</div>
          </div>
        </div>
      </form>

<!-- Loading flights -->
<div v-if="isLoadingFlights" class="loading-container">
  <p class="loading-text">
    Loading your flights<span class="dot-loader"></span>
  </p>
</div>


      <!-- Flight Results -->
      <div v-if="flights.length" class="row mt-4">
        <div class="col-12">
          <h3>Flight Results</h3>
          <div
            class="card mb-3"
            v-for="(flight, index) in flights"
            :key="index"
          >
            <div v-if="roundTrip" class="card-body">
              <h5>First-way</h5>
              <p>From: {{ flight.departureAirportFirst }}</p>
              <p>Departure: {{ flight.departureDateFirst }}</p>
              <p>To: {{ flight.arrivalAirportFirst }}</p>
              <p>Arrival: {{ flight.arrivalDateFirst }}</p>
              <p>Duration: {{ flight.flightDurationFirst }} min</p>
              <h5>Round-trip</h5>
              <p>From: {{ flight.departureAirportSecond }}</p>
              <p>Departure: {{ flight.departureDateSecond }}</p>
              <p>To: {{ flight.arrivalAirportSecond }}</p>
              <p>Arrival: {{ flight.arrivalDateSecond }}</p>
              
              <p>Duration: {{ flight.flightDurationSecond }} min</p>
              <p>Price: ${{ flight.price }}</p>
              <button class="btn btn-primary" @click="bookFlight(flight)">
                Book now
              </button>
              <button
                v-if="!assignedFlights[flight.id]"
                @click="assignFlightToTrip(flight)"
                class="btn btn-primary"
              >
                Assign to my trip
              </button>
              <div v-else class="assigned-message">
                Assigned to your trip <i class="fas fa-check-circle text-success"></i>
              </div>
            </div>

            <div v-if="!roundTrip" class="card-body">
              <p>From: {{ flight.departureAirportFirst }}, {{ flight.departureCountry }}</p>
              <p>Departure: {{ flight.departureDateFirst }}</p>
              <p>To: {{ flight.arrivalAirportFirst }}, {{ flight.arrivalCountry }}</p>
              <p>Arrival: {{ flight.arrivalDateFirst }}</p>
              <p>Price: {{ flight.price }}</p>
              <p>Duration: {{ flight.flightDurationFirst }} min</p>
              <button class="btn btn-primary" @click="bookFlight(flight)">
                Book now
              </button>
              <button
                v-if="!assignedFlights[flight.id]"
                @click="assignFlightToTrip(flight)"
                class="btn btn-primary"
              >
                Assign to my trip
              </button>
              <div v-else class="assigned-message">
                Assigned to your trip <i class="fas fa-check-circle text-success"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
  import { ref, reactive } from "vue";
  import axios from "axios";
  import { useTripStore } from "../stores/TripStore";

  const tripStore = useTripStore();
  const roundTrip = ref(false);
  const flightForm = ref(null);
  
  const flights = ref([]);
  const trip = ref({
    departureCity: "",
    arrivalCity: "",
    departureDate: "",
    returnDate: "",
    numberOfPeople: 1,
  });

  const isSearchLoading = ref(false); // Loader dla "Search Flights"
const isLoadingFlights = ref(false); // Sekcja "Loading your flights"

// Obsługa "Search Airports"
const handleAirportSearch = async () => {
  isSearchLoading.value = true;
  try {
    // Oczekiwanie na wykonanie funkcji pobierających odpowiedzi z API dotyczące lotnisk
    await handleAutoCompleteDeparture();
    await handleAutoCompleteArrival();
  } catch (error) {
    console.error("Error searching airports:", error);
  } finally {
    isSearchLoading.value = false;
  }
};

// Obsługa "Search Flights"
const handleFlightSearch = async () => {
  isLoadingFlights.value = true;
  try {
    await searchFlights();
  } catch (error) {
    console.error("Error searching flights:", error);
  } finally {
    isLoadingFlights.value = false;
  }
};

const myApiKey = import.meta.env.VITE_MY_API_KEY;
const airportSuggestionsDeparture = ref([]); // Lista propozycji dla Departure City
const airportSuggestionsArrival = ref([]); // Lista propozycji dla Arrival City

// Funkcja obsługująca autouzupełnianie dla miasta wylotu
const handleAutoCompleteDeparture = async () => {
  // Sprawdzenie, czy użytkownik podał nazwę miasta
  if (!trip.value.departureCity) {
    alert("Please enter a departure city."); // Komunikat dla użytkownika
    return;
  }
  // Konfiguracja zapytania do API Sky Scanner
  const options = {
    method: "GET",
    url: "https://sky-scanner3.p.rapidapi.com/flights/auto-complete",
    params: {
      query: trip.value.departureCity, // Miasto wprowadzone przez użytkownika
      placeTypes: "AIRPORT", // Wyszukiwanie tylko lotnisk
    },
    headers: {
      "x-rapidapi-key": myApiKey,
      "x-rapidapi-host": "sky-scanner3.p.rapidapi.com",
    },
  };
  try {
    // Wysłanie żądania do API
    const response = await axios.request(options);
    // Przekształcenie odpowiedzi API na listę propozycji lotnisk
    airportSuggestionsDeparture.value = response.data.data.map((item) => ({
      title: item.presentation?.suggestionTitle || "Unknown Airport", // Nazwa lotniska
      skyId: item.presentation?.skyId || "", // Kod IATA lotniska
    }));
  } catch (error) {
    // Obsługa błędów podczas komunikacji z API
    console.error("Error fetching departure airport suggestions:", error);
  }
};


const handleAutoCompleteArrival = async () => {
  if (!trip.value.arrivalCity) {
    alert("Please enter an arrival city.");
    return;
  }

  const options = {
    method: "GET",
    url: "https://sky-scanner3.p.rapidapi.com/flights/auto-complete",
    params: {
      query: trip.value.arrivalCity,
      placeTypes: "AIRPORT",
    },
    headers: {
      "x-rapidapi-key": myApiKey,
      "x-rapidapi-host": "sky-scanner3.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    airportSuggestionsArrival.value = response.data.data.map((item) => ({
      title: item.presentation?.suggestionTitle || "Unknown Airport",
      skyId: item.presentation?.skyId || "",
    }));
  } catch (error) {
    console.error("Error fetching arrival airport suggestions:", error);
  }
};

// Po kliknięciu wybranej pozycji z listy, przypisanie jej do formularza w postaci kodu IATA
const selectDepartureAirport = (skyId) => {
  trip.value.departureCity = skyId;
  airportSuggestionsDeparture.value = []; // Ukryj listę propozycji
};

const selectArrivalAirport = (skyId) => {
  trip.value.arrivalCity = skyId;
  airportSuggestionsArrival.value = []; // Ukryj listę propozycji
};



  
  const searchFlights = async () => {
    // Opcje dla wyszukiwania lotu w jedną stronę
  const optionsOneWay = {
    method: "GET",
    url: "https://sky-scanner3.p.rapidapi.com/flights/search-one-way",
    params: {
      fromEntityId: trip.value.departureCity,
      toEntityId: trip.value.arrivalCity,
      departDate: trip.value.departureDate,
      adults: trip.value.numberOfPeople,
    },
    headers: {
      "x-rapidapi-key": myApiKey,
      "x-rapidapi-host": "sky-scanner3.p.rapidapi.com",
    },
  };
  // Opcje dla wyszukiwania lotów w dwie strony
  const optionsRoundTrip = {
    method: "GET",
    url: "https://sky-scanner3.p.rapidapi.com/flights/search-roundtrip",
    params: {
      fromEntityId: trip.value.departureCity,
      toEntityId: trip.value.arrivalCity,
      departDate: trip.value.departureDate,
      returnDate: trip.value.returnDate,
      adults: trip.value.numberOfPeople,
    },
    headers: {
      "x-rapidapi-key": myApiKey,
      "x-rapidapi-host": "sky-scanner3.p.rapidapi.com",
    },
  };

  // //SPRAWDZENIE CZY JEST TO LOT W JEDNĄ STRONĘ CZY W OBIE STRONY
  // //JEŚLI LOT W JEDNĄ STRONĘ:
  if (!roundTrip.value) {
    try {
      const response = await axios.request(optionsOneWay);
      console.log("Full API response:", response.data); // Logowanie całej odpowiedzi

          // JEŚLI UŻYTKOWNIK WYPEŁNIŁ TYLKO SKĄD LECI
      if (response.data.data.everywhereDestination?.results) {
        console.log("Using everywhereDestination results");
        flights.value = response.data.data.everywhereDestination.results.map(
          (result) => ({
            title: result.content.location?.name || "Unknown Destination",
            price: result.content.flightQuotes?.direct?.price || "No Price",
            departureDate: trip.value.departureDate,
            arrivalDate: trip.value.returnDate,
            departureCity: trip.value.departureCity,
            arrivalCity: trip.value.arrivalCity || "N/A",
            numberOfPeople: trip.value.numberOfPeople,
            imageUrl: result.content.image?.url || "",
          })
        );
   //JESLI UŻYTKOWNIK WYPEŁNIŁ SKĄD I DOKĄD LECI
      } else if (response.data.data.itineraries) {
        console.log("Using itineraries results");
        flights.value = response.data.data.itineraries.map((itinerary, index) => {
          const firstFlightId = itinerary.id;
          return {
            id: `flight-${Date.now()}-${index}`,
            title1: `${trip.value.departureCity} - ${trip.value.arrivalCity}`,
            title2: `${trip.value.arrivalCity} - ${trip.value.departureCity}`,
            price: parseFloat(itinerary.price.formatted.replace(/[^0-9.]/g, "")) || 0,
            arrivalDateFirst: itinerary.legs?.[0].arrival.replace("T", " ") || "Unknown",
            departureDateFirst:
            itinerary.legs?.[0].departure.replace("T", " ") ||
            "Unknown Departure",
            departureAirportFirst: itinerary.legs?.[0].origin.name || "Unknown",
            departureCountry: itinerary.legs?.[0].origin.country || "Unknown",
            arrivalAirportFirst: itinerary.legs?.[0].destination.name || "Unknown",
            arrivalCountry: itinerary.legs?.[0].destination.country || "Unknown",
            flightDurationFirst: itinerary.legs?.[0].durationInMinutes,
            numberOfPeople: trip.value.numberOfPeople || "Unknown",
            imageUrl: response.data.destinationImageUrl || "",
            skyScannerUrl: `https://www.skyscanner.pl/transport/loty/${trip.value.departureCity.toLowerCase()}/${trip.value.arrivalCity.toLowerCase()}/${trip.value.departureDate.replace(/-/g, '')}/config/${firstFlightId}`
          };
        });
      } else {
        console.warn("No matching results in response");
        flights.value = []; // Brak wyników
      }
    } catch (error) {
      console.error("Error during API request:", error.message);
      console.error("Error details:", error.response?.data || error);
      flights.value = []; // W przypadku błędu czyścimy dane
    }
  }

  // JEŚLI LOT JEST W DWIE STRONY
  // JEŚLI UŻYTKOWNIK WYPEŁNIŁ TYLKO SKĄD LECI
  if(roundTrip.value) {
  try {
    const response = await axios.request(optionsRoundTrip);
    console.log("Full API response:", response.data); // Logowanie całej odpowiedzi

    if (response.data.data.everywhereDestination?.results) {
      console.log("Using everywhereDestination results");
      flights.value = response.data.data.everywhereDestination.results.map(
        (result, index) => ({
          id: `flight-${Date.now()}-${index}`,
          title: result.content.location?.name || "Unknown Destination",
          price: result.content.flightQuotes?.direct?.rawPrice || "No Price",
          departureDate: trip.value.departureDate,
          arrivalDate: trip.value.returnDate,
          departureCity: trip.value.departureCity,
          arrivalCity: trip.value.arrivalCity || "N/A",
          numberOfPeople: trip.value.numberOfPeople,
          imageUrl: result.content.image?.url || "",
        })
      );
      // JESLI UŻYTKOWNIK WYPEŁNIŁ SKĄD I DOKĄD LECI
    } else if (response.data.data.itineraries) {
      console.log("Using itineraries results");
      flights.value = response.data.data.itineraries.map((itinerary, index) => {
        const [firstFlightId, secondFlightId] = itinerary.id.split('|');
        return {
          id: `flight-${Date.now()}-${index}`,
          title1: `${trip.value.departureCity} - ${trip.value.arrivalCity}`,
          title2: `${trip.value.arrivalCity} - ${trip.value.departureCity}`,
          price: parseFloat(itinerary.price.formatted.replace(/[^0-9.]/g, "")) || 0,
          departureDateFirst:
            itinerary.legs?.[0].departure.replace("T", " ") ||
            "Unknown Departure",
          arrivalDateFirst:
            itinerary.legs?.[0].arrival.replace("T", " ") || "Unknown Arrival",
          departureDateSecond:
            itinerary.legs?.[1].departure.replace("T", " ") ||
            "Unknown Departure",
          arrivalDateSecond:
            itinerary.legs?.[1].arrival.replace("T", " ") || "Unknown Arrival",
          // Lot w pierwszą stronę (first) - dane:
          departureIdFirst: itinerary.legs?.[0].origin.id,
          departureAirportFirst: itinerary.legs?.[0].origin.name,
          arrivalIdFirst: itinerary.legs?.[0].destination.id,
          arrivalAirportFirst: itinerary.legs?.[0].destination.name,
          flightDurationFirst: itinerary.legs?.[0].durationInMinutes,
          // Lot w drugą stronę (second) - dane:
          departureIdSecond: itinerary.legs?.[1].origin.id,
          departureAirportSecond: itinerary.legs?.[1].origin.name,
          arrivalIdSecond: itinerary.legs?.[1].destination.id,
          arrivalAirportSecond: itinerary.legs?.[1].destination.name,
          flightDurationSecond: itinerary.legs?.[1].durationInMinutes,
          flightsId: itinerary.id,
          numberOfPeople: trip.value.numberOfPeople,
          imageUrl: response.data.destinationImageUrl || "",
          skyScannerUrl: `https://www.skyscanner.pl/transport/loty/${trip.value.departureCity.toLowerCase()}/${trip.value.arrivalCity.toLowerCase()}/${trip.value.departureDate.replace(/-/g, '')}/${trip.value.returnDate.replace(/-/g, '')}/config/${firstFlightId}%7C${secondFlightId}`
        };
      });
    } else {
      console.warn("No matching results in response");
      flights.value = []; // Brak wyników
    }
  } catch (error) {
    console.error("Error during API request:", error.message);
    console.error("Error details:", error.response?.data || error);
    flights.value = []; // W przypadku błędu czyścimy dane
  }
}
};

const bookFlight = (flight) => {
  if (flight.skyScannerUrl) {
      window.open(flight.skyScannerUrl, "_blank");
    } else {
      console.warn("No booking URL available for this flight");
    }
};

const assignedFlights = reactive({}); // Przypisane loty do wycieczki

// Funkcja przypisująca lot do bieżącej wycieczki użytkownika
const assignFlightToTrip = async (flight) => {
  try {
    // Logowanie informacji o przypisywanym locie
    console.log("Assigning flight:", flight);
    // Walidacja — sprawdzenie, czy lot posiada ID
    if (!flight.id) {
      console.error("Flight ID is undefined!"); // Komunikat błędu w przypadku braku ID
      return;
    }
    // Dodanie lotu do globalnego stanu wycieczki za pomocą `tripStore`
    await tripStore.addFlightToTrip(flight);
    // Oznaczenie lotu jako przypisanego
    assignedFlights[flight.id] = true;
    console.log(`Flight ${flight.id} assigned to the trip`);
  } catch (error) {
    // Obsługa błędów podczas przypisywania lotu
    console.error("Failed to assign flight:", error);
    alert("Failed to assign flight to trip. Please try again."); // Informacja dla użytkownika
  }
};




  </script>
  

  <style scoped>
.loading-container {
  margin-top: 20px;
  text-align: center;
  font-size: 1.2rem;
  color: #6c757d;
}

.loading-text {
  display: inline-flex;
  align-items: center;
}

.dot-loader {
  display: inline-block;
  margin-left: 8px;
  width: 6px;
  height: 6px;
  background-color: #6c757d;
  border-radius: 50%;
  animation: dot-bounce 1.2s infinite ease-in-out;
}

@keyframes dot-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.suggestion-item {
  cursor: pointer;
  padding: 5px;
  background-color: #f8f9fa;
  margin: 5px 0;
  border: 1px solid #ddd;
}
.suggestion-item:hover {
  background-color: #e2e6ea;
}

.description {
  color:#6c757d;
}

.main-container {
  margin-top: 100px;
}
</style>
<template>
    <div class="trip-hotels">
      <h1>Find Hotels</h1>
      <form @submit.prevent="handleSearch">
        <div class="form-group">
          <label for="destination">Where are you going to? <span class="required">*</span></label>
          <input
            type="text"
            id="destination"
            v-model="destination"
            required
            placeholder="Enter your destination"
          />
        </div>
        
        <!-- Lista "Did you mean" -->
        <div
  class="location-options"
  :class="{ show: locationOptions.length > 0 }"
>
  <ul>
    <li
      v-for="(location, index) in locationOptions"
      :key="index"
      @click="selectLocation(location.geoId)"
      class="location-option"
    >
      {{ location.title }} ({{ location.secondaryText }})
    </li>
  </ul>
</div>


        <div class="form-group">
          <label for="checkInDate">Check-in Date <span class="required">*</span></label>
          <input
            type="date"
            id="checkInDate"
            v-model="checkInDate"
            required
          />
        </div>
        <div class="form-group">
          <label for="checkOutDate">Check-out Date <span class="required">*</span></label>
          <input
            type="date"
            id="checkOutDate"
            v-model="checkOutDate"
            required
          />
        </div>
        <div class="form-group">
          <label for="adults">Number of Adults</label>
          <input
            type="number"
            id="adults"
            v-model="adults"
            min="1"
            placeholder="Enter number of adults"
          />
        </div>
        <div class="form-group">
          <label for="children">Number of Children</label>
          <input
            type="number"
            id="children"
            v-model="children"
            min="0"
            placeholder="Enter number of children"
          />
        </div>
        <div class="form-group">
          <label for="rooms">Number of Rooms</label>
          <input
            type="number"
            id="rooms"
            v-model="rooms"
            min="1"
            placeholder="Enter number of rooms"
          />
        </div>
        <button type="submit" class="button">Search</button>
      </form>
  
      
  
      <!-- Wyniki hoteli -->
      <div v-if="hotels.length" class="hotels-results">
        <h2>Hotels</h2>
        <ul>
          <li v-for="(hotel, index) in hotels" :key="index" class="hotel-item">
            <img
              :src="hotel.image"
              alt="Hotel image"
              class="hotel-image"
            />
            <div class="hotel-info">
              <h3>{{ hotel.title }}</h3>
              <p>{{ hotel.secondaryInfo }}</p>
              <p>Rating: {{ hotel.rating }} ⭐️ ({{ hotel.count }} reviews)</p>
              <p>Price: {{ hotel.price }}</p>
              <button
                v-if="hotel.bookUrl"
                @click="goToBooking(hotel.bookUrl)"
                class="button"
              >
                Book now
              </button>
              <button
  v-if="!assignedHotels[hotel.id]"
  @click="assignHotelToTrip(hotel)"
  class="btn btn-primary"
>
  Assign to my trip
</button>
<div v-else class="assigned-message">
  Assigned to your trip <i class="fas fa-check-circle text-success"></i>
</div>

            </div>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
  import axios from 'axios';
  import { useTripStore } from '../stores/TripStore';

  // Obiekt przechowujący przypisane hotele, aby oznaczyć, które hotele są już dodane do tripa
   const assignedHotels = reactive({});
  
  // Pobranie store'a podróży
  const tripStore = useTripStore();

  const myApiKey = ref(null);

onMounted(async () => {
  const keys = await tripStore.fetchApiKeys();
            if (keys) {
                myApiKey.value = keys.api_key;
                
}});  

  

  
  // Reaktywne zmienne przechowujące dane wejściowe użytkownika dotyczące wyszukiwania hoteli
  const destination = ref('');
  const checkInDate = ref('');
  const checkOutDate = ref('');
  const adults = ref(1);
  const children = ref(0);
  const rooms = ref(1);
  
  // Lista miejsc zwracanych przez "Search Location"
  const locationOptions = ref([]); 
  
  // Lista hoteli zwracanych przez "Search Hotels"
  const hotels = ref([]);
  
  // Funkcja wyszukująca lokalizacje na podstawie wpisanego miejsca docelowego
  const handleSearch = async () => {
    try {
      locationOptions.value = []; // Czyszczenie poprzednich wyników
      hotels.value = []; // Czyszczenie wyników hoteli przed nowym wyszukiwaniem
      // Konfiguracja zapytania do zewnętrznego API (TripAdvisor) w celu wyszukania miejsc
      const options = {
        method: 'GET',
        url: 'https://tripadvisor16.p.rapidapi.com/api/v1/hotels/searchLocation',
        params: { query: destination.value }, // Parametr wyszukiwania to nazwa lokalizacji
        headers: {
          'x-rapidapi-key': myApiKey.value, // Klucz API do autoryzacji
          'x-rapidapi-host': 'tripadvisor16.p.rapidapi.com',
        },
      };
      const response = await axios.request(options);
      // Jeśli API zwróciło dane, zapisujemy je w locationOptions
      if (response.data?.data?.length) {
        locationOptions.value = response.data.data;
      } else {
        alert('No locations found. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching location options:', error);
      alert('Failed to search for locations. Please try again.');
    }
  };
  
  
  const selectLocation = async (geoId) => {
    locationOptions.value = []; // Ukryj listę lokalizacji po wyborze
    try {
      // Konfiguracja zapytania do API w celu pobrania listy hoteli
      const options = {
        method: 'GET',
        url: 'https://tripadvisor16.p.rapidapi.com/api/v1/hotels/searchHotels',
        params: {
          geoId: geoId, // ID wybranego miejsca
          checkIn: checkInDate.value, // Data zameldowania
          checkOut: checkOutDate.value, // Data wymeldowania
          adults: adults.value, // Liczba dorosłych
          children: children.value, // Liczba dzieci
          rooms: rooms.value, // Liczba pokoi
        },
        headers: {
          'x-rapidapi-key': myApiKey.value,
          'x-rapidapi-host': 'tripadvisor16.p.rapidapi.com',
        },
      };
      const response = await axios.request(options);
      console.log('Hotel search results:', response.data);
      // Pobranie właściwej listy hoteli z danych zwróconych przez API
      const hotelsData = response.data.data?.data;
      if (Array.isArray(hotelsData)) {
        // Modyfikacja struktury zwróconych hoteli, aby łatwiej je obsługiwać w aplikacji
        hotels.value = hotelsData.map((hotel) => ({
          id: hotel.id, // Unikalne ID hotelu
          title: hotel.title, // Nazwa hotelu
          secondaryInfo: hotel.secondaryInfo || 'No additional info', // Dodatkowe informacje
          rating: hotel.bubbleRating.rating || 'No rating', // Ocena hotelu
          count: parseInt(hotel.bubbleRating.count) || '0', // Liczba recenzji (z konwersją na liczbę)
          price: hotel.priceForDisplay || 'Price not available', // Cena za noc
          // Pobranie obrazu hotelu - zastąpienie {width} i {height} wartościami 300x200
          image: hotel.cardPhotos?.[0]?.sizes?.urlTemplate?.replace('{width}', '300').replace('{height}', '200') || '',
          bookUrl: hotel.commerceInfo?.externalUrl || null, // Link do rezerwacji hotelu
        }));
      } else {
        alert('No valid hotel data found. Please try again.');
        hotels.value = [];
      }
    } catch (error) {
      console.error('Error fetching hotel data:', error);
      alert('Failed to search for hotels. Please try again.');
    }
  };
  
  // Funkcja umożliwiająca przejście do strony rezerwacji wybranego hotelu
  const goToBooking = (url) => {
    window.open(url, '_blank'); // Otwiera link do rezerwacji w nowej karcie
  };
  
  // Funkcja przypisania wybranego hotelu do podróży w TripStore
  const assignHotelToTrip = async (hotel) => {
    try {
      console.log("Assigning hotel:", hotel); // Debugowanie przekazywanych danych hotelu
  
      if (!hotel.id) {
        console.error("Hotel ID is undefined!"); // Obsługa błędu braku ID hotelu
        return;
      }
  
      await tripStore.addHotelToTrip(hotel); // Wywołanie funkcji w store, która zapisuje hotel w podróży
      assignedHotels[hotel.id] = true; // Oznaczenie hotelu jako przypisanego
      console.log(`Hotel ${hotel.id} assigned to the trip`);
    } catch (error) {
      console.error("Failed to assign hotel:", error);
      alert("Failed to assign hotel to trip. Please try again.");
    }
  };
  
  console.log("tripStore contents:", tripStore); // Debugowanie zawartości store'a podróży
  
  </script>
  
  
  <style scoped>
  .trip-hotels {
    max-width: 800px;
    margin: 0 auto;
    margin-top: 100px;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .hotel-item {
    display: flex;
    margin-bottom: 1rem;
  }
  
  .hotel-image {
    max-width: 150px;
    max-height: 100px;
    margin-right: 1rem;
  }
  
  .hotel-info h3 {
    margin: 0;
  }

  label {
    font-weight: bold;
    display: block;
    margin-bottom: 0.5rem;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .button:hover {
    background-color: #0056b3;
  }
  
  .location-options {
    margin-top: 2rem;
  }
  
  .location-option {
    cursor: pointer;
    color: #007bff;
    text-decoration: underline;
  }
  
  .location-option:hover {
    color: #0056b3;
  }
  
  .hotels-results {
    margin-top: 2rem;
  }

  .assigned-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: green;
  font-weight: bold;
}

.location-options {
  max-height: 0; /* Ukrycie listy */
  overflow: hidden; /* Ukrycie zawartości wykraczającej poza obszar */
  transition: max-height 0.3s ease-in-out; /* Animacja zmiany wysokości */
}

.location-options.show {
  max-height: 300px; /* Wysokość dla pełnej listy (możesz dostosować) */
}


  </style>
  
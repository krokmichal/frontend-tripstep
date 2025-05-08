<template>
  <div>
    <div class="m-auto">
      <h4>Your Position</h4>
      <p>Latitude: {{ currPos.lat.toFixed(2) }}, Longitude: {{ currPos.lng.toFixed(2) }}</p>
    </div>

    <div ref="mapDiv" style="width:100%; height: 60vh"></div>

    <div class="container mt-5">
      <div class="d-flex justify-content-between align-items-center">
        <h2>Places to Visit</h2>
        <button v-if="!editMode" @click="toggleEditMode" class="btn btn-warning btn-sm">Edit</button>
        <button v-else @click="saveChanges" class="btn btn-success btn-sm">Save</button>
      </div>

      <div class="card mt-3">
        <ul class="list-group list-group-flush">
          <li v-for="(place, index) in placesToVisit" :key="place.id" class="list-group-item d-flex justify-content-between align-items-center">
            <span>{{ place.name }}</span>
            <div v-if="editMode" class="d-flex">
              <button @click="toggleStar(place)" class="btn btn-light btn-sm">
                {{ place.isFavorite ? '★' : '☆' }}
              </button>
              <button @click="moveUp(index)" :disabled="index === 0" class="btn btn-secondary btn-sm ms-2">↑</button>
              <button @click="moveDown(index)" :disabled="index === placesToVisit.length - 1" class="btn btn-secondary btn-sm ms-2">↓</button>
              <button @click="deletePlace(place.id)" class="btn btn-danger btn-sm ms-2">🗑</button>
            </div>
            <span v-else-if="place.isFavorite" class="text-warning">★</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from "vue";
  import { useTripStore } from "../../stores/TripStore";
  import { Loader } from '@googlemaps/js-api-loader';
  import { useGeolocation } from "@/useGeolocation";

  const tripStore = useTripStore();
  const mapDiv = ref(null);
  const placeDetails = ref(null);
  let map = null;

  const myGoogleApiKey = ref(null);



  // Pobieranie aktualnej lokalizacji użytkownika
  const { coords } = useGeolocation();
  const currPos = computed(() => ({
    lat: coords.value.latitude,
    lng: coords.value.longitude
  }));

  let infoWindow = null;

  // Inicjalizacja mapy po zamontowaniu komponentu
  onMounted(async () => {
    const keys = await tripStore.fetchApiKeys();
            if (keys) {
                myGoogleApiKey.value = keys.google_api_key;
              }

    // Tworzenie instancji Google Maps API Loader z kluczem API i biblioteką 'places'
    const loader = new Loader({
      apiKey: myGoogleApiKey.value,
      libraries: ['places']
    });

     // Oczekiwanie na załadowanie Google Maps API
    const google = await loader.load();

    // Tworzenie nowej mapy i przypisanie jej do elementu HTML (mapDiv)
    map = new google.maps.Map(mapDiv.value, {
      center: currPos.value, // Ustawienie początkowego centrum mapy na aktualnej pozycji użytkownika
      zoom: 14  // Ustawienie domyślnego poziomu powiększenia mapy
    });

    // Tworzenie instancji PlacesService do pobierania szczegółowych informacji o miejscach
    const service = new google.maps.places.PlacesService(map);

    // Obsługa kliknięcia na mapie, pobieranie szczegółów miejsca
    map.addListener('click', (event) => {
      const placeId = event.placeId; // Pobranie ID miejsca (jeśli jest dostępne)
      if (placeId) {
        event.stop(); // Zatrzymanie domyślnego zachowania wydarzenia
        getPlaceDetails(placeId, service, event.latLng);
      }
    });
  });

  // Funkcja pobierająca szczegóły miejsca na podstawie placeId
  const getPlaceDetails = (placeId, service, position) => {
    const request = {
      placeId: placeId,
      fields: ['name', 'formatted_address', 'rating', 'international_phone_number', 'website', 'reviews']
    };
    // Wysyłanie zapytania do Google Places API w celu pobrania szczegółowych informacji o miejscu
    service.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        placeDetails.value = place; // Zapisanie szczegółów miejsca w zmiennej reaktywnej
        showInfoWindow(place, position); // Wyświetlenie okna informacyjnego z danymi o miejscu
      } else {
        console.warn('Failed to fetch details:', status);
      }
    });
  };

  // Wyświetla okno informacyjne w mapie z danymi o miejscu
  const showInfoWindow = (place, position) => {
    if (!infoWindow) {
      infoWindow = new google.maps.InfoWindow();
    }
    const content = document.createElement('div');
    content.innerHTML = `
      <h2>${place.name}</h2>
      <p>${place.formatted_address}</p>
      <p>${place.rating ? `${place.rating} ⭐️` : 'No rating'}</p>
      ${place.international_phone_number ? `<p>${place.international_phone_number}</p>` : ''}
      ${place.website ? `<p><a href="${place.website}" target="_blank">${place.website}</a></p>` : ''}
      <button class="btn btn-primary btn-sm">Add to trip</button>
    `;
    const button = content.querySelector('button');
    button.addEventListener('click', () => addPlaceToVisit(place));
    infoWindow.setContent(content);
    infoWindow.setPosition(position);
    infoWindow.open(map);
  };

  // Pobranie listy miejsc do odwiedzenia, jeśli miejsca ulegną zmianie w TripStore.js
  const placesToVisit = computed(() => tripStore.placesToVisit);

  // Dodaje miejsce do listy miejsc do odwiedzenia
  const addPlaceToVisit = (place) => {
    const tripId = tripStore.currentTripId;
    tripStore.addPlaceToVisit(place, tripId);
  };

  const editMode = ref(false);

  // Przełącza tryb edycji listy miejsc
  const toggleEditMode = () => {
    editMode.value = !editMode.value;
  };

  const toggleStar = (place) => {
    place.isFavorite = !place.isFavorite;
  };

  // Zmienia kolejność miejsc na liście
  const moveUp = (index) => {
    const temp = placesToVisit.value[index];
    placesToVisit.value.splice(index, 1);
    placesToVisit.value.splice(index - 1, 0, temp);
  };

  // Zmienia kolejność miejsc na liście
  const moveDown = (index) => {
    const temp = placesToVisit.value[index];
    placesToVisit.value.splice(index, 1);
    placesToVisit.value.splice(index + 1, 0, temp);
  };

// Usuwa miejsce z listy
  const deletePlace = async (placeId) => {
    if (confirm("Are you sure you want to delete this place?")) {
      await tripStore.deletePlace(placeId);
      tripStore.placesToVisit = tripStore.placesToVisit.filter((place) => place.id !== placeId);
    }
  };


  // Zapisuje zmiany w ulubionych i kolejności miejsc na liście
  const saveChanges = async () => {
    try {
      for (let i = 0; i < placesToVisit.value.length; i++) {
        const place = placesToVisit.value[i];
        const originalPlace = tripStore.originalPlacesToVisit.find((p) => p.id === place.id);

        const currentIsFavorite = Boolean(place.isFavorite);
        const originalIsFavorite = Boolean(originalPlace.isFavorite);

        const hasFavoriteChanged = currentIsFavorite !== originalIsFavorite;
        const hasOrderChanged = i !== originalPlace.order;

        if (hasFavoriteChanged || hasOrderChanged) {
          const updatedData = {
            is_favorite: currentIsFavorite,
            order: i
          };
          await tripStore.updatePlace(place.id, updatedData);
        }
      }

      tripStore.originalPlacesToVisit = JSON.parse(JSON.stringify(placesToVisit.value));
      editMode.value = false;
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes. Please try again.");
    }
  };
</script>

<style scoped>
 #app {
  padding-top: 20px;
  font-family: 'Roboto', sans-serif;
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

/* Dla kart w sekcji Places to Visit */
.card {
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transform: translateY(-5px);
}

.list-group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: none;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 10px 15px;
  transition: background-color 0.2s ease;
}

.list-group-item:hover {
  background-color: #e9ecef;
}

.list-group-item .btn {
  border-radius: 4px;  /* Zmniejszymy zaokrąglenie przycisków */
  padding: 0.3rem 0.6rem; /* Zwiększenie paddingu, aby przyciski były wygodniejsze do kliknięcia */
  transition: transform 0.2s ease, background-color 0.2s ease;
  font-size: 14px;
}

.list-group-item .btn:hover {
  transform: scale(1.1);
  background-color: #007bff;
  color: white;
}

/* Przycisk edycji i zapisu */
.btn-warning, .btn-success {
  padding: 5px 15px;
  font-size: 14px;
  border-radius: 20px;
  transition: background-color 0.3s ease;
}

.btn-warning:hover, .btn-success:hover {
  background-color: #e0a800;
}

.btn-warning:focus, .btn-success:focus {
  box-shadow: none;
}

/* Przycisk dodawania do podróży w info oknie */
button.btn-primary {
  background-color: #28a745;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 25px;
  transition: background-color 0.3s ease;
}

button.btn-primary:hover {
  background-color: #218838;
}

/* Tło dla sekcji z listą */
.container {
  margin-top: 3em;
  background-color: #f1f1f1;
  border-radius: 10px;
  padding: 2em;
}

/* Responsywność */
@media (max-width: 768px) {
  .container {
    padding: 1.5em;
  }

  .list-group-item {
    font-size: 14px;
  }

  .btn-warning, .btn-success {
    font-size: 12px;
  }
}

@media (max-width: 576px) {
  .card {
    margin-bottom: 1em;
  }

  .hero-section {
    height: 80vh;
  }

  .list-group-item {
    font-size: 12px;
  }

  .btn {
    padding: 0.2rem;
    font-size: 12px;
  }
}

.m-auto {
  margin-left: auto;
  margin-right: auto;
}

/* Przycisk z gwiazdką */
.btn-light {
  background-color: transparent;
  color: #ffc107;
  font-size: 16px;
  transition: color 0.3s ease;
}

.btn-light:hover {
  color: #ff9800;
}

/* Animacja przycisków (do przycisków edytuj, usuń) */
.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  transition: background-color 0.3s ease;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

.list-group-item .btn-danger {
  border-radius: 4px;  /* Zmniejszymy zaokrąglenie */
  background-color: #dc3545;
  border: none;
  transition: background-color 0.3s ease;
  font-size: 14px;
}

.list-group-item .btn-danger:hover {
  background-color: #c82333;
}

/* Styl dla nagłówków */
h2 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 15px;
}

h4 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 5px;
}

p {
  font-size: 1rem;
  color: #555;
}

</style>

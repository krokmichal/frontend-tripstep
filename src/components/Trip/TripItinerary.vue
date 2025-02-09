<template>
  <div class="trip-itinerary">
    <h1>Trip Itinerary</h1>
    <!-- Przycisk "Add/Change dates" -->
    <button @click="toggleDates" class="btn btn-primary mb-3">
      {{ itinerary.length > 0 ? "Change dates" : "Add dates" }}
    </button>

    <!-- Kalendarze -->
    <div v-if="showCalendars" class="calendar-container">
      <input type="date" v-model="startDate" class="form-control" />
      <input type="date" v-model="endDate" class="form-control" />
      <button @click="saveDates" class="btn btn-primary mb-3">
        {{ itinerary.length ? "Save new dates" : "Save dates" }}
      </button>
    </div>

    <!-- Lista dni -->
    <ul v-if="itinerary.length" class="itinerary-list">
      <li v-for="(dayData, dayIndex) in itinerary" :key="dayData.date" class="day-item">
        <div class="day-header">
          <h3>{{ dayData.date }} - {{ getDayOfWeek(dayData.date) }}</h3>
        </div>
        
        <ul v-if="dayData.items.length" class="items-list">
          <li 
            v-for="(item, itemIndex) in dayData.items" 
            :key="item.id" 
            class="item d-flex justify-content-between align-items-center"
            @dragover.prevent
            @drop="dropItem($event, dayIndex, itemIndex)"
          >
            <div class="flex-grow-1">
              <textarea
                v-if="item.type === 'note'"
                v-model="item.content"
                @input="updateNote(dayData.id, item)"
                class="form-control me-2 note-item"
                placeholder="Enter your note"
              ></textarea>

              <div v-else-if="item.type === 'checklist'" class="d-flex align-items-center w-100 checklist-item">
                <input 
                  type="checkbox" 
                  v-model="item.completed" 
                  @change="updateChecklist(dayData.id, item)" 
                  class="form-check-input me-2" 
                />
                <input 
                  type="text" 
                  v-model="item.content" 
                  @input="updateChecklist(dayData.id, item)"
                  class="form-control me-2" 
                  placeholder="Checklist item" 
                />
              </div>

              <div v-else-if="item.type === 'place'" class="place-item">
                <h5>{{ item.name }}</h5>
                <p>{{ item.address }}</p>
                <p v-if="item.rating">Rating: {{ item.rating }} ⭐</p>
                <p v-if="item.phone_number">Phone: {{ item.phone_number }}</p>
                <a v-if="item.website" :href="item.website" target="_blank">Visit Website</a>
              </div>
            </div>

            <!-- Przycisk Drag do przeciągania -->
            <button 
              class="btn btn-light drag-btn"
              @dragstart="dragStart($event, dayIndex, itemIndex)"
              draggable="true"
            >
              <i class="fas fa-arrows-alt"></i> Drag
            </button>
          </li>
        </ul>

        <!-- Dodaj przyciski dla nowych elementów -->
        <button @click="addNote(dayIndex)" class="btn btn-link">Add a note</button>
        <button @click="addChecklistItem(dayIndex)" class="btn btn-link">Add checklist</button>
        <button @click="loadPlaces(dayIndex)" class="btn btn-link">Add place</button>

        <div>
          
<ul v-if="visibleDayIndex === dayIndex && availablePlaces.length > 0">
  <li 
    v-for="place in availablePlaces" 
    :key="place.id"
    @click="addPlaceToItinerary(dayIndex, place)"
    class="clickable"
  >
    {{ place.name }}
  </li>
</ul>
<p v-if="visibleDayIndex === dayIndex && availablePlaces.length === 0">No places available.</p>

  </div>








      </li>
    </ul>
  </div>
</template>


<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useTripStore } from '../../stores/TripStore';
import _ from 'lodash';
import { debounce } from 'lodash';


const tripStore = useTripStore();
const itinerary = reactive([]);
const startDate = ref("");
const endDate = ref("");
const showCalendars = ref(false);




// Pobranie harmonogramu po załadowaniu komponentu
onMounted(async () => {
  await tripStore.fetchItinerary(tripStore.currentTripId);

  // Resetuj dane, jeśli nie znaleziono harmonogramu
  if (!tripStore.currentItinerary) {
    startDate.value = "";
    endDate.value = "";
    itinerary.length = 0;
    showCalendars.value = true; // Pokazujemy kalendarz dla nowego tripa
  } else {
    startDate.value = tripStore.currentItinerary.start_date;
    endDate.value = tripStore.currentItinerary.end_date;
    itinerary.length = 0;

    tripStore.itineraryDays.forEach((day) => {
      itinerary.push({
        id: day.id,
        date: day.date,
        items: [
          ...day.notes.map((note) => ({
            id: note.id,
            type: "note",
            content: note.content,
          })),
          ...day.checklists.map((checklist) => ({
            id: checklist.id,
            type: "checklist",
            content: checklist.content,
            completed: checklist.completed,
          })),
          ...day.places.map((place) => ({
        id: place.id,
        type: "place",
        name: place.name, // Zakładam, że tabela miejsc ma pole `name`
        rating: place.rating,
        phone_number: place.phone_number,
        website: place.website,
      })),
        ],
      });
    });
  }
});


// Funkcja do przełączania widoczności kalendarzy
const toggleDates = () => {
  showCalendars.value = !showCalendars.value;
};

// Funkcja do zapisywania nowych dat
const saveDates = async () => {
  try {
    console.log("Saving dates:", startDate.value, endDate.value);
    if (!startDate.value || !endDate.value) {
      alert("Please select both start and end dates.");
      return;
    }
    // Jeśli istnieje harmonogram, aktualizujemy go
    if (tripStore.currentItinerary) {
      await tripStore.updateItineraryDates(
        tripStore.currentItinerary.id,
        startDate.value,
        endDate.value
      );
    } else {
      // Jeśli harmonogram nie istnieje, tworzymy nowy
      await tripStore.addItinerary(startDate.value, endDate.value);
    }
    // Pobranie zaktualizowanego harmonogramu z bazy i aktualizacja lokalnego stanu
    await tripStore.fetchItinerary(tripStore.currentTripId);
    // Zaktualizowanie lokalnych danych w komponencie na podstawie świeżo pobranego harmonogramu
    updateLocalItinerary();
    showCalendars.value = false;
  } catch (error) {
    console.error("Error saving dates:", error);
    alert("Failed to save dates. Please try again.");
  }
};



// Generowanie dni harmonogramu
const generateDays = () => {
  itinerary.length = 0;
  let current = new Date(startDate.value);
  const end = new Date(endDate.value);

  while (current <= end) {
    itinerary.push({
      date: current.toISOString().split("T")[0],
      items: [],
    });
    current.setDate(current.getDate() + 1);
  }
  showCalendars.value = false;
};

// Funkcje dodawania notatek i checklist
const addNote = async (dayIndex) => {
  const dayId = itinerary[dayIndex].id;
  if (!dayId) {
    alert("Please save the itinerary first.");
    return;
  }

  const newNote = await tripStore.addItineraryNote({
    itinerary_day_id: dayId,
    content: "New note",  // Domyślna treść dla nowej notatki,
    order: itinerary[dayIndex].items.length + 1,
  });

  itinerary[dayIndex].items.push({
    id: newNote.id,
    type: "note",
    content: newNote.content,
  });
};

const addChecklistItem = async (dayIndex) => {
  const dayId = itinerary[dayIndex].id;
  if (!dayId) {
    alert("Please save the itinerary first.");
    return;
  }

  const newChecklist = await tripStore.addItineraryChecklist({
    itinerary_day_id: dayId,
    content: "New checklist item",  // Domyślna treść dla nowego checklistu
    completed: false,
    order: itinerary[dayIndex].items.length + 1,
  });

  itinerary[dayIndex].items.push({
    id: newChecklist.id,
    type: "checklist",
    content: newChecklist.content,
    completed: false,
  });
};

const getDayOfWeek = (dateString) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dateObj = new Date(dateString);
  return days[dateObj.getDay()];
};




const updateLocalItinerary = () => {
  itinerary.length = 0;  // Czyszczenie starej zawartości harmonogramu

  tripStore.itineraryDays.forEach((day) => {
    itinerary.push({
      id: day.id,
      date: day.date,
      dayOfWeek: getDayOfWeek(new Date(day.date)), 
      items: [...(day.notes || []).map(note => ({
        id: note.id,
        type: "note",
        content: note.content
      })), 
      ...(day.checklists || []).map(checklist => ({
        id: checklist.id,
        type: "checklist",
        content: checklist.content,
        completed: checklist.completed
      }))]
    });
  });

  console.log("Updated local itinerary:", itinerary);
};


// Funkcja debounce do optymalizacji zapisu
const debounceUpdateNote = _.debounce(async (note) => {
  await tripStore.updateItineraryNote(note.id, note.content);
}, 1000);

const debounceUpdateChecklist = _.debounce(async (checklist) => {
  await tripStore.updateItineraryChecklist(checklist.id, checklist.content, checklist.completed);
}, 1000);

// Funkcja do obsługi aktualizacji notatki
const updateNote = debounce(async (dayId, note) => {
  try {
    await tripStore.updateItineraryNote(note.id, note.content);
    console.log(`Note ${note.id} updated successfully`);
  } catch (error) {
    console.error(`Failed to update note ${note.id}:`, error);
  }
}, 600); // Debounce 600ms

const updateChecklist = debounce(async (dayId, checklist) => {
  try {
    await tripStore.updateItineraryChecklist(checklist.id, checklist.content, checklist.completed);
    console.log(`Checklist ${checklist.id} updated successfully`);
  } catch (error) {
    console.error(`Failed to update checklist ${checklist.id}:`, error);
  }
}, 600);


let draggedItem = null;
let draggedDayIndex = null;
let draggedItemIndex = null;

// Funkcja uruchamiana w momencie rozpoczęcia przeciągania elementu
const dragStart = (event, dayIndex, itemIndex) => {
   // Ustawienie efektu przeciągania
  event.dataTransfer.effectAllowed = "move";
  // Przypisanie informacji o przeciąganym elemencie do zmiennych globalnych
  draggedItem = itinerary[dayIndex].items[itemIndex];
  draggedDayIndex = dayIndex;
  draggedItemIndex = itemIndex;
};

// Funkcja obsługująca upuszczenie przeciąganego elementu
const dropItem = async (event, dayIndex, itemIndex) => {
  if (draggedItem && draggedDayIndex !== null && draggedItemIndex !== null) {
    const items = itinerary[dayIndex].items;
    // Usunięcie elementu z poprzedniego miejsca i przeniesienie go na nowe
    const [movedItem] = items.splice(draggedItemIndex, 1);
    items.splice(itemIndex, 0, movedItem);
    // Aktualizacja kolejności (order)
    items.forEach((item, index) => {
      item.order = index + 1;
    });
    try {
      // Aktualizacja kolejności elementów w backendzie
      await tripStore.updateItemOrder(items.map((item) => ({
        id: item.id,
        order: item.order,
        type: item.type, // Typ potrzebny dla backendu
      })));
      console.log("Updated order successfully:", items);
    } catch (error) {
      console.error("Failed to update item order:", error);
    }
    // Reset danych przeciągania
    draggedItem = null;
    draggedDayIndex = null;
    draggedItemIndex = null;
  }
};




const showPlaces = ref([]);

// Ustaw domyślne wartości showPlaces przy załadowaniu danych
const initializeShowPlaces = () => {
  showPlaces.value = itinerary.map(() => false);
};

// Aktualizacja stanu po zmianie harmonogramu
watch(() => itinerary.length, (newLength) => {
  if (newLength > 0) {
    initializeShowPlaces();
  }
}, { immediate: true });







const availablePlaces = ref([]);
const placesVisible = ref([]);

// Inicjalizacja stanu dla każdego dnia
const initializePlacesVisibility = () => {
  placesVisible.value = itinerary.map(() => false);
};








// Ustawienie stanu po załadowaniu komponentu
onMounted(() => {
  initializePlacesVisibility();
});

watch(availablePlaces, (newVal, oldVal) => {
  console.log("availablePlaces changed:");
  console.log("Old Value:", oldVal);
  console.log("New Value:", newVal);
});






// Funkcja ładująca miejsca do odwiedzenia
const loadPlaces = async (dayIndex) => {
  visibleDayIndex.value = visibleDayIndex.value === dayIndex ? null : dayIndex;
  
  if (visibleDayIndex.value !== null) {
    await tripStore.fetchPlacesToVisit(tripStore.currentTripId);
    availablePlaces.value = tripStore.placesToVisit || [];
  }
};







const togglePlacesVisibility = (dayIndex) => {
  visibleDayIndex.value = visibleDayIndex.value === dayIndex ? null : dayIndex;
};

const visibleDayIndex = ref(null);

const togglePlaces = async (dayIndex) => {
  if (visibleDayIndex.value === dayIndex) {
    visibleDayIndex.value = null;  // Zamknij listę, jeśli już jest otwarta
  } else {
    visibleDayIndex.value = dayIndex;  // Pokaż listę dla aktualnego dnia
    await loadPlaces();  // Pobranie miejsc dla nowego dnia
  }
};

// Funkcja dodająca wybrane miejsce do odwiedzenia do harmonogramu dnia
const addPlaceToItinerary = async (dayIndex, place) => {
  const dayId = itinerary[dayIndex].id;
  if (!dayId) {
    alert("Please save the itinerary first.");
    return;
  }

  const newPlace = {
    itinerary_day_id: dayId,
    trip_id: tripStore.currentTripId, // Musisz dodać trip_id tutaj
    place_id: place.id,
    name: place.name,
    address: place.address || null,
    rating: place.rating || null,
    phone_number: place.phone_number || null,
    website: place.website || null,
  };

  try {
    const addedPlace = await tripStore.addItineraryPlace(newPlace);
    itinerary[dayIndex].items.push({
      ...addedPlace,
      type: "place",
    });
    visibleDayIndex.value = null; // Zamknij listę miejsc
    console.log(`Place ${place.name} added successfully to itinerary.`);
  } catch (error) {
    console.error("Failed to add place to itinerary:", error);
    alert("Failed to add place. Please try again.");
  }
};








</script>



  
  <style scoped>
  .trip-itinerary {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .date-pickers {
    margin: 1rem 0;
  }
  
  .items-list {
    list-style-type: none;
    padding: 0;
  }
  
  .item {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  textarea {
    width: 100%;
    resize: none;
  }
  
  .add-buttons {
    display: flex;
    gap: 10px;
    margin-top: 1rem;
    justify-content: flex-start;
  }


  /*  */

  .trip-itinerary {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  font-family: Arial, sans-serif;
}

.itinerary-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.day-item {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.day-header {
  background-color: #007bff;
  color: white;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 1rem;
}

.items-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item {
  background-color: #ffffff;
  border: 1px solid #ced4da;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.note-item {
  width: 100%;
  border: 1px solid #ced4da;
  border-radius: 5px;
  padding: 0.5rem;
  resize: none;
}

.checklist-item {
  width: 100%;
}

.checklist-item input[type="text"] {
  width: calc(100% - 50px);
  border: 1px solid #ced4da;
  border-radius: 5px;
  padding: 0.5rem;
}

.checklist-item input[type="checkbox"] {
  margin-right: 0.75rem;
}

button {
  display: inline-block;
  margin-left: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 5px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.move-handle {
  cursor: grab;
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: #6c757d;
}

.move-handle:hover {
  color: #495057;
}

.calendar-container input {
  width: calc(50% - 0.5rem);
  margin: 0.5rem 0.25rem;
  border: 1px solid #ced4da;
  border-radius: 5px;
  padding: 0.5rem;
}






.items-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.item {
  background-color: #ffffff;
  border: 1px solid #ced4da;
  border-radius: 5px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.item .drag-handle {
  cursor: grab;
  margin-right: 10px;
}

.item.dragging {
  opacity: 0.5;
}

.item textarea {
  flex: 1;
}

.drag-handle i {
  font-size: 1.2rem;
  color: #6c757d;
}

.drag-handle:hover i {
  color: #495057;
}

.drag-btn {
  cursor: grab;
  font-size: 0.9rem;
  color: #007bff;
  border: 1px solid #007bff;
  background-color: white;
}

.drag-btn:active {
  cursor: grabbing;
}

.drag-btn:hover {
  background-color: #007bff;
  color: white;
}

  </style>
  
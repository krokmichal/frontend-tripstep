import { defineStore } from "pinia";
import axios from "axios";
import _ from 'lodash';

 
axios.defaults.withCredentials = true; // To zapewnia, że ciasteczka są przesyłane z frontu do backendu

export const useItineraryStore = defineStore("itinerary", {
    state: () => ({
      trips: [],
      currentTripId: localStorage.getItem("currentTripId") || null, // dodaj to
      currentItinerary: null,
      itineraryDays: [],
      itineraryPlaces: [],
    }),
    actions: {
      // Możesz też przenieść te funkcje do itineraryStore, aby zarządzać tripId lokalnie.
      setCurrentTrip(tripId) {
        console.log('Ustawiam currentTripId:', tripId);
        this.currentTripId = tripId;
        localStorage.setItem("currentTripId", tripId);
      },
      clearCurrentTrip() {
        this.currentTripId = null;
        localStorage.removeItem("currentTripId");
      },    
 
  async addItinerary(startDate, endDate) {
    try {
      // Zapewnienie, że CSRF token jest odświeżony
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");
  
      const requestData = {
        trip_id: this.currentTripId, // Trip ID przypisany do harmonogramu
        start_date: startDate, // Data początkowa
        end_date: endDate, // Data końcowa
      };
  
      console.log("Sending itinerary payload:", requestData);

      const csrfToken = decodeURIComponent(
        document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1]
      );
  
      const snakeCaseData = _.mapKeys(requestData, (value, key) => _.snakeCase(key));

      // Wysyłanie żądania POST do API
      const response = await axios.post(
        "http://localhost:8000/api/itineraries",
        snakeCaseData, // Nie trzeba konwertować kluczy, jeśli API oczekuje snake_case
        {
          headers: {
            'X-XSRF-TOKEN': csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true, // Wymagane, gdyż używane jest Laravel Sanctum
        }
      );
  
      console.log("Itinerary saved or updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error saving or updating itinerary:", error);
      throw error;
    }
  },

  async addItineraryNote(note) {
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");
  
      const snakeCaseData = _.mapKeys(note, (value, key) => _.snakeCase(key));
  
      const csrfToken = decodeURIComponent(
        document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN=")).split("=")[1]
      );
  
      const response = await axios.post("http://localhost:8000/api/itinerary-notes", snakeCaseData, {
        headers: {
          "X-XSRF-TOKEN": csrfToken,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
  
      console.log("Itinerary note added:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error adding itinerary note:", error);
      throw error;
    }
  },

  async addItineraryChecklist(checklist) {
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");
  
      const snakeCaseData = _.mapKeys(checklist, (value, key) => _.snakeCase(key));
  
      const csrfToken = decodeURIComponent(
        document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN=")).split("=")[1]
      );
  
      const response = await axios.post("http://localhost:8000/api/itinerary-checklists", snakeCaseData, {
        headers: {
          "X-XSRF-TOKEN": csrfToken,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
  
      console.log("Itinerary checklist added:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error adding itinerary checklist:", error);
      throw error;
    }
  },

  async fetchItinerary(tripId) {
    try {
        console.log("Fetching itinerary for tripId:", tripId);

        this.currentItinerary = null;
        this.itineraryDays = [];
  
        const response = await axios.get("http://localhost:8000/api/itineraries", {
            params: { trip_id: tripId },
        });

        console.log("Response from API:", response.data);
  
        if (response.data) {
            console.log("Fetched itinerary:", response.data);
  
            this.currentItinerary = response.data.itinerary;

            // Sprawdzamy dni
            console.log("Days:", response.data.days);

            this.itineraryDays = response.data.days.map(day => {
                console.log("Day data:", day);
                const notes = Array.isArray(day.notes) ? day.notes : [];
                const checklists = Array.isArray(day.checklists) ? day.checklists : [];
                const places = Array.isArray(day.places) ? day.places : [];

                console.log("Notes:", notes);
                console.log("Checklists:", checklists);
                console.log("Places:", places);

                return {
                    ...day,
                    items: [
                        ...notes,
                        ...checklists,
                        ...places,
                    ]
                    .sort((a, b) => a.order - b.order) // Sortowanie po polu 'order'
                    .map(item => {
                        console.log("Mapped item:", item);
                        return {
                            ...item,
                            type: item.type || 'unknown', // Jeśli brakuje typu, ustaw domyślny
                        };
                    }),
                };
            });
        } else {
            console.log("No itinerary found.");
            this.currentItinerary = null;
            this.itineraryDays = [];
        }
    } catch (error) {
        console.error("Error fetching itinerary:", error);
    }
},


  
  

  
  
  
  async updateItineraryDates(itineraryId, startDate, endDate) {
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");
  
      const requestData = {
        start_date: startDate,
        end_date: endDate,
      };
  
      const snakeCaseData = _.mapKeys(requestData, (value, key) => _.snakeCase(key));
  
      const csrfToken = decodeURIComponent(
        document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN=")).split("=")[1]
      );
  
      const response = await axios.patch(
        `http://localhost:8000/api/itineraries/${itineraryId}`,
        snakeCaseData,
        {
          headers: {
            "X-XSRF-TOKEN": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
  
      console.log("Itinerary dates updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating itinerary dates:", error);
      throw error;
    }
  },

  async updateItineraryNote(noteId, content) {
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");

      const requestData = { content };
      const snakeCaseData = _.mapKeys(requestData, (value, key) => _.snakeCase(key));

      const csrfToken = decodeURIComponent(
        document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1]
      );

      const response = await axios.patch(
        `http://localhost:8000/api/itinerary-notes/${noteId}`,
        snakeCaseData,
        {
          headers: {
            'X-XSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      console.log("Itinerary note updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating itinerary note:", error);
      throw error;
    }
  },

  
  async updateItineraryChecklist(checklistId, content, completed) {
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");

      const requestData = { content, completed };
      const snakeCaseData = _.mapKeys(requestData, (value, key) => _.snakeCase(key));

      const csrfToken = decodeURIComponent(
        document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1]
      );

      const response = await axios.patch(
        `http://localhost:8000/api/itinerary-checklists/${checklistId}`,
        snakeCaseData,
        {
          headers: {
            'X-XSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      console.log("Itinerary checklist updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating itinerary checklist:", error);
      throw error;
    }
  },
  
  async fetchItineraryPlaces(tripId) {
    try {
      const response = await axios.get(`http://localhost:8000/api/itinerary-places/${tripId}`);
      this.itineraryPlaces = response.data;
    } catch (error) {
      console.error("Error fetching itinerary places:", error);
    }
  },
  
  async addItineraryPlace(place) {
    try {
        await axios.get("http://localhost:8000/sanctum/csrf-cookie");

        const snakeCaseData = _.mapKeys(place, (value, key) => _.snakeCase(key));

        const csrfToken = decodeURIComponent(
            document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN=")).split("=")[1]
        );

        const response = await axios.post("http://localhost:8000/api/itinerary-places", snakeCaseData, {
            headers: {
                "X-XSRF-TOKEN": csrfToken,
                "Content-Type": "application/json",
            },
            withCredentials: true,
        });

        console.log("Itinerary place added:", response.data);
        return response.data.place;
    } catch (error) {
        console.error("Error adding itinerary place:", error);
        throw error;
    }
},

async deleteItineraryPlace(placeId) {
    try {
        await axios.delete(`http://localhost:8000/api/itinerary-places/${placeId}`, {
            withCredentials: true,
        });
        console.log("Itinerary place deleted successfully");
    } catch (error) {
        console.error("Error deleting itinerary place:", error);
        throw error;
    }
},

  



  async updateItemOrder(items) {
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");
  
      const reorderedItems = items.map((item) => ({
        id: item.id,
        order: item.order,
        type: item.type,  // Dodanie pola "type"
      }));
  
      const csrfToken = decodeURIComponent(
        document.cookie.split("; ").find(row => row.startsWith("XSRF-TOKEN=")).split("=")[1]
      );
  
      const response = await axios.post(
        "http://localhost:8000/api/itinerary-items/update-order",
        { items: reorderedItems },
        {
          headers: {
            "X-XSRF-TOKEN": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
  
      console.log("Order updated in database:", response.data);
    } catch (error) {
      console.error("Error updating item order:", error);
      throw error;
    }
  },

  async addItemToItinerary(item) {
    this.itineraryDays = this.itineraryDays.map(day => {
      if (day.id === item.itinerary_day_id) {
        if (item.type === 'note') {
          day.notes.push(item);
        } else if (item.type === 'checklist') {
          day.checklists.push(item);
        }
      }
      return day;
    });
  }
  
 



























  
  
  
  
  
  

  
  
  
  
  
  },
  
  
});

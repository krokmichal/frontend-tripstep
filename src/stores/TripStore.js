import { defineStore } from "pinia";
import axios from "axios";
import _ from 'lodash';

 
axios.defaults.withCredentials = true; // To zapewnia, że ciasteczka są przesyłane z frontu do backendu

export const useTripStore = defineStore("trip", {
  state: () => ({
    trips: [],
    currentTripId: localStorage.getItem("currentTripId") || null,
    placesToVisit: [],
    hotels: [],
    flights: [],
    currentItinerary: null, // Dane harmonogramu
    itineraryDays: [],
    itineraryPlaces: [],
  }),
  actions: {
    setCurrentTrip(tripId) {
      console.log('Ustawiam currentTripId:', tripId);
      this.currentTripId = tripId;
      localStorage.setItem("currentTripId", tripId); // Zapis do localStorage
    },
    clearCurrentTrip() {
      this.currentTripId = null;
      localStorage.removeItem("currentTripId"); // Usunięcie z localStorage
    },    
    async fetchTrips() {
      try {
        await axios.get("http://localhost:8000/sanctum/csrf-cookie");
        const response = await axios.get("http://localhost:8000/api/trips"); // Pobieranie tripów
        // Poniżej konwersja z snake_case do camelCase podczas pobierania tripów z bazy, ponieważ w moim froncie wszystkie zmienne używają camelCase natomiast w bazie używany jest snake_case
        this.trips = response.data.map(trip => 
          _.mapKeys(trip, (value, key) => _.camelCase(key))
        );
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    },
   
    async addTrip(tripData) {
      try {
        await axios.get("http://localhost:8000/sanctum/csrf-cookie");

        // Konwersja z camelCase używanego w Frontendzie na snake_case używanego w bazie danych
        const snakeCaseData = {};
        for (const key in tripData) {
          snakeCaseData[_.snakeCase(key)] = tripData[key]; // Użycie lodash
        }
        
        
        const csrfToken = decodeURIComponent(
          document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1]
        );
        const response = await axios.post(
          "http://localhost:8000/api/trips",
          snakeCaseData,  // Dane przesyłane w formacie JSON
          {
            headers: {
              'X-XSRF-TOKEN': csrfToken,
              'Content-Type': 'application/json' // Kluczowy nagłówek!
            },
            withCredentials: true
          }
        );
    
        this.trips.push(response.data);
      } catch (error) {
        console.error("Error adding trip:", error);
      }
    },

    async deleteTrip(tripId) {
      try {
        // Pobranie tokena CSRF wymagane przez Laravel do zabezpieczenia żądań
        await axios.get("http://localhost:8000/sanctum/csrf-cookie");  
        
         // Odczytanie wartości tokena CSRF z ciasteczek
        const csrfToken = decodeURIComponent(
          document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1]
        );
        // Wysłanie żądania DELETE w celu usunięcia wycieczki
        await axios.delete(`http://localhost:8000/api/trips/${tripId}`, {
          headers: {
            'X-XSRF-TOKEN': csrfToken // Przekazanie tokena CSRF w nagłówkach żądania
          },
          withCredentials: true // Umożliwia uwierzytelnianie za pomocą ciasteczek
        });
        // Usunięcie wycieczki z lokalnej listy trips po pomyślnym usunięciu z bazy danych
        this.trips = this.trips.filter(trip => trip.id !== tripId);
      } catch (error) {
        console.error("Error deleting trip:", error);
      }
    },

    async updateTrip(tripData) {
      try {
          await axios.get("http://localhost:8000/sanctum/csrf-cookie");
  
          // Konwersja z camelCase do snake_case dla danych
          const snakeCaseData = _.mapKeys(tripData, (value, key) => _.snakeCase(key));
  
          const csrfToken = decodeURIComponent(
              document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1]
          );
  
          const response = await axios.put(`http://localhost:8000/api/trips/${tripData.id}`, snakeCaseData, {
              headers: {
                  'X-XSRF-TOKEN': csrfToken,
                  'Content-Type': 'application/json'
              },
              withCredentials: true
          });
  
          // Znajdź indeks tripa w stanie lokalnym i zaktualizuj go
          const index = this.trips.findIndex(trip => trip.id === tripData.id);
          if (index !== -1) {
              this.trips[index] = _.mapKeys(response.data, (value, key) => _.camelCase(key));
          }
  
          console.log("Trip updated successfully:", response.data);
      } catch (error) {
          console.error("Error updating trip:", error);
      }
  },

  async addPlaceToVisit(place, tripId) {
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");
  
      const requestData = {
        trip_id: this.currentTripId,
        place_id: place.id || place.place_id || 'BRAK_PLACE_ID',
        name: place.name,
        address: place.formatted_address,
        rating: place.rating,
        phone_number: place.international_phone_number,
        website: place.website,
        is_favorite: false,
      };
  
      const snakeCaseData = _.mapKeys(requestData, (value, key) => _.snakeCase(key));
  
      const csrfToken = decodeURIComponent(
        document.cookie.split('; ').find((row) => row.startsWith('XSRF-TOKEN=')).split('=')[1]
      );
  
      const response = await axios.post('http://localhost:8000/api/places-to-visit', snakeCaseData, {
        headers: {
          'X-XSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
  
      if (!this.placesToVisit) {
        this.placesToVisit = [];
      }
  
      this.placesToVisit.push(response.data);
      this.originalPlacesToVisit.push(JSON.parse(JSON.stringify(response.data))); // Aktualizuj kopię
  
      console.log('Dodano miejsce do podróży:', response.data);
    } catch (error) {
      console.error('Błąd podczas dodawania miejsca do podróży:', error);
    }
  },
  

  async fetchPlacesToVisit(tripId) {
    try {
      const response = await axios.get("http://localhost:8000/api/places-to-visit", {
        params: { trip_id: tripId },
      });
  
      const places = response.data.map((place) => ({
        ..._.mapKeys(place, (value, key) => _.camelCase(key)),
        isFavorite: Boolean(place.is_favorite),
      }));
  
      this.placesToVisit = places; // Lista edytowalna
      this.originalPlacesToVisit = JSON.parse(JSON.stringify(places)); // Kopia oryginalna
  
      console.log("Fetched places to visit:", this.placesToVisit);
    } catch (error) {
      console.error("Error fetching places to visit:", error);
    }
  },
  

  async fetchSingleTrip(tripId) {
    try {
      const response = await axios.get(`http://localhost:8000/api/trips/${tripId}`);
      const trip = _.mapKeys(response.data, (value, key) => _.camelCase(key));
      this.trips.push(trip); // Dodajemy do stanu, jeśli trip nie istnieje
      return trip;
    } catch (error) {
      console.error("Error fetching single trip:", error);
      throw error;
    }
  },

  async deletePlace(placeId) {
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie"); // Pobierz CSRF cookie
        
        const csrfToken = decodeURIComponent(
          document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1]
        );


      await axios.delete(`http://localhost:8000/api/places-to-visit/${placeId}`,  {
        headers: {
          'X-XSRF-TOKEN': csrfToken
        },
        withCredentials: true
      });
      console.log(`Place ${placeId} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting place:", error);
    }
  },

  async updatePlace(placeId, updatedData) {
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");
  
          // Konwersja z camelCase do snake_case dla danych
          const snakeCaseData = _.mapKeys(updatedData, (value, key) => _.snakeCase(key));
  
          const csrfToken = decodeURIComponent(
              document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1]
          );



          console.log(`Preparing to update place ${placeId} with data:`, snakeCaseData);

      const response = await axios.patch(
        `http://localhost:8000/api/places-to-visit/${placeId}`, snakeCaseData, {
          headers: {
              'X-XSRF-TOKEN': csrfToken,
              'Content-Type': 'application/json'
          },
          withCredentials: true
      });
      
      console.log(`Place ${placeId} updated successfully.`);
      return response.data;
    } catch (error) {
      console.error("Error updating place:", error);
      throw error;
    }
  },

  async addHotelToTrip(hotel) {
    try {
      console.log("Assigning hotel:", hotel); // Log całego obiektu hotel
  
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");
  
      const requestData = {
        trip_id: this.currentTripId,
        title: hotel.title,
        address: hotel.secondaryInfo,
        rating: hotel.rating,
        review_count: hotel.count,
        price: hotel.price,
        image_url: hotel.image,
        book_url: hotel.bookUrl, // Pole do debugowania
      };
  
      console.log("Request data before snakeCase transformation:", requestData);
  
      const csrfToken = decodeURIComponent(
        document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1]
      );
  
      const snakeCaseData = _.mapKeys(requestData, (value, key) => _.snakeCase(key));
      console.log("Request data after snakeCase transformation:", snakeCaseData);
  
      const response = await axios.post('http://localhost:8000/api/hotels', snakeCaseData, {
        headers: {
          'X-XSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
  
      console.log('Hotel added to trip:', response.data); // Log odpowiedzi z backendu
    } catch (error) {
      console.error('Error adding hotel to trip:', error);
      alert('Failed to assign hotel to trip. Please try again.');
    }
  },
  

  async fetchHotels(tripId) {
    try {
      const response = await axios.get("http://localhost:8000/api/hotels", {
        params: { trip_id: tripId },
      });
      this.hotels = response.data;
      console.log("Fetched hotels for trip:", this.hotels);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  },
  
  async deleteHotel(hotelId) {
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie"); // Pobierz CSRF cookie
        
        const csrfToken = decodeURIComponent(
          document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1]
        );

      await axios.delete(`http://localhost:8000/api/hotels/${hotelId}`,   {
        headers: {
          'X-XSRF-TOKEN': csrfToken
        },
        withCredentials: true
      });
      this.hotels = this.hotels.filter((hotel) => hotel.id !== hotelId); // Usuń hotel lokalnie
      console.log(`Hotel ${hotelId} deleted successfully.`);
    } catch (error) {
      console.error(`Failed to delete hotel ${hotelId}:`, error);
      alert("Failed to delete hotel. Please try again.");
    }
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
          withCredentials: true, // Wymagane, jeśli używasz sesji Laravel Sanctum
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
        this.currentItinerary = null;
        this.itineraryDays = [];

        const response = await axios.get("http://localhost:8000/api/itineraries", {
            params: { trip_id: tripId },
        });

        if (response.data) {
            console.log("Fetched itinerary:", response.data);

            this.currentItinerary = response.data.itinerary;

            this.itineraryDays = response.data.days.map(day => {
                return {
                    ...day,
                    items: [
                        ...day.notes, 
                        ...day.checklists, 
                        ...(day.places || []) // Dodanie miejsc
                    ].sort((a, b) => a.order - b.order),
                };
            });
        } else {
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

  async fetchBudget(tripId) {
    try {
        const response = await axios.get(`http://localhost:8000/api/budgets/${tripId}`);
        const budget = response.data;

        this.currentBudgetId = budget.id;
        return {
            ...budget,
            limit: budget.limit ? parseFloat(budget.limit) : null, // Konwertuj limit na liczbę
        };
    } catch (error) {
        console.error("Error fetching budget:", error);
        return { limit: null, expenses: [] }; // Zwróć pusty budżet, jeśli wystąpił błąd
    }
},




async addExpense(amount, category) {
  try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");

      const requestData = {
          budget_id: this.currentBudgetId, // Upewnij się, że currentBudgetId jest ustawione
          amount: amount,
          category: category,
      };

      console.log("Sending expense payload:", requestData);

      const csrfToken = decodeURIComponent(
          document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1]
      );

      const snakeCaseData = _.mapKeys(requestData, (value, key) => _.snakeCase(key));

      const response = await axios.post(
          "http://localhost:8000/api/expenses",
          snakeCaseData,
          {
              headers: {
                  'X-XSRF-TOKEN': csrfToken,
                  "Content-Type": "application/json",
              },
              withCredentials: true,
          }
      );

      console.log("Expense added:", response.data);
      return response.data;
  } catch (error) {
      console.error("Error adding expense:", error);
      throw error;
  }
},

async createBudget(tripId, limit) {
  try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");

      const requestData = {
          trip_id: tripId,
          limit: limit,
      };

      const csrfToken = decodeURIComponent(
          document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1]
      );

      const snakeCaseData = _.mapKeys(requestData, (value, key) => _.snakeCase(key));

      const response = await axios.post(
          "http://localhost:8000/api/budgets",
          snakeCaseData,
          {
              headers: {
                  'X-XSRF-TOKEN': csrfToken,
                  "Content-Type": "application/json",
              },
              withCredentials: true,
          }
      );

      console.log("Budget created:", response.data);
      this.currentBudgetId = response.data.id; // Zapisz ID budżetu
      return response.data;
  } catch (error) {
      console.error("Error creating budget:", error);
      throw error;
  }
},

async updateBudget(tripId, newLimit) {
  try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");

      const csrfToken = decodeURIComponent(
          document.cookie.split('; ')
              .find(row => row.startsWith('XSRF-TOKEN='))
              .split('=')[1]
      );

      const response = await axios.put(
          `http://localhost:8000/api/budgets/${tripId}`, // Używamy tripId
          { limit: newLimit },
          {
              headers: {
                  'X-XSRF-TOKEN': csrfToken,
                  "Content-Type": "application/json",
              },
              withCredentials: true,
          }
      );

      return response.data;
  } catch (error) {
      console.error("Failed to update budget:", error);
      throw error;
  }
},

async updateExpense(expenseId, updatedData) {
  try {
    await axios.get("http://localhost:8000/sanctum/csrf-cookie");

    const csrfToken = decodeURIComponent(
      document.cookie.split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        .split('=')[1]
    );

    const response = await axios.put(
      `http://localhost:8000/api/expenses/${expenseId}`,
      updatedData,
      {
        headers: {
          'X-XSRF-TOKEN': csrfToken,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    // Aktualizacja wydatku w stanie aplikacji (bez odwoływania się do trip)
    const updatedExpense = response.data;
    this.trips = this.trips.map(trip => {
      if (trip.id === this.currentTripId) {
        trip.expenses = trip.expenses.map(expense =>
          expense.id === updatedExpense.id ? updatedExpense : expense
        );
      }
      return trip;
    });

    return updatedExpense;
  } catch (error) {
    console.error("Failed to update expense:", error);
    throw error;
  }
},

async deleteExpense(expenseId) {
  try {
    await axios.get("http://localhost:8000/sanctum/csrf-cookie");

    const csrfToken = decodeURIComponent(
      document.cookie.split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        .split('=')[1]
    );

    await axios.delete(`http://localhost:8000/api/expenses/${expenseId}`, {
      headers: {
        'X-XSRF-TOKEN': csrfToken,
      },
      withCredentials: true,
    });

    // Usuń wydatek z lokalnego stanu
    this.trips = this.trips.map(trip => {
      if (trip.id === this.currentTripId) {
        trip.expenses = trip.expenses.filter(expense => expense.id !== expenseId);
      }
      return trip;
    });

    console.log(`Expense ${expenseId} deleted successfully`);
  } catch (error) {
    console.error(`Failed to delete expense ${expenseId}:`, error);
    throw error;
  }
},


async addFlightToTrip(flight) {
  try {
    await axios.get("http://localhost:8000/sanctum/csrf-cookie");

    const requestData = {
      trip_id: this.currentTripId,
      title: `${flight.title1} / ${flight.title2}`, 
      departure_airport_first: flight.departureAirportFirst,
      arrival_airport_first: flight.arrivalAirportFirst,
      departure_date_first: flight.departureDateFirst,
      arrival_date_first: flight.arrivalDateFirst,
      departure_airport_second: flight.departureAirportSecond,
      arrival_airport_second: flight.arrivalAirportSecond,
      departure_date_second: flight.departureDateSecond,
      arrival_date_second: flight.arrivalDateSecond,
      price: parseFloat(flight.price) || 0, 
      flight_duration_first: flight.flightDurationFirst,
      flight_duration_second: flight.flightDurationSecond,
      sky_scanner_url: flight.skyScannerUrl, 
      
    };

    const csrfToken = decodeURIComponent(
      document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN=")).split("=")[1]
    );

    const snakeCaseData = _.mapKeys(requestData, (value, key) => _.snakeCase(key));

    const response = await axios.post("http://localhost:8000/api/flights", snakeCaseData, {
      headers: {
        "X-XSRF-TOKEN": csrfToken,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    console.log("Flight added to trip:", response.data);
  } catch (error) {
    console.error("Error adding flight to trip:", error);
    alert("Failed to assign flight to trip. Please try again.");
  }
},



async deleteFlight(flightId) {
  try {
    await axios.get("http://localhost:8000/sanctum/csrf-cookie"); // Pobierz CSRF cookie

    const csrfToken = decodeURIComponent(
      document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN=")).split("=")[1]
    );

    // Wysłanie żądania usunięcia lotu
    await axios.delete(`http://localhost:8000/api/flights/${flightId}`, {
      headers: {
        "X-XSRF-TOKEN": csrfToken,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    // Usuń lot z lokalnej listy flights
    this.flights = this.flights.filter((flight) => flight.id !== flightId);

    console.log(`Flight ${flightId} deleted successfully.`);
  } catch (error) {
    console.error(`Failed to delete flight ${flightId}:`, error);
    alert("Failed to delete flight. Please try again.");
  }
},


async fetchFlights(tripId) {
  try {
    const response = await axios.get("http://localhost:8000/api/flights", {
      params: { trip_id: tripId },
    });
    this.flights = response.data;
    console.log("Fetched flights for trip:", this.flights);
  } catch (error) {
    console.error("Error fetching flights:", error);
  }
},

async fetchApiKeys() {
  try {
    const response = await axios.get('http://localhost:8000/api/get-api-key');
    return response.data; // Zwraca oba klucze jako obiekt
  }
  catch {
    console.error("Błąd podczas pobierania kluczy API:", error);
    return null;
  }
}
  
  },
  
  
});

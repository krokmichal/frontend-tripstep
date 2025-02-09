<template>
        <div class="row mt-5">
      <div class="col-12">
        <h3>Budget</h3>
        <p>
  <strong>Total Spent:</strong> 
  {{ typeof totalSpent === 'number' ? totalSpent.toFixed(2) : '0.00' }}$
</p>

        <div class="progress mb-3">
          <div
            class="progress-bar bg-success"
            role="progressbar"
            :style="{ width: budgetPercentage + '%' }"
          >
            {{ budgetPercentage.toFixed(0) }}%
          </div>
        </div>
        <p v-if="trip.budget !== null && !isNaN(trip.budget)">
  <strong>Budget:</strong> {{ parseFloat(trip.budget).toFixed(2) }}$
</p>
<p v-else>
  <strong>Budget:</strong> Not set
</p>

        <button class="btn btn-success" @click="showAddExpense = true">
          + Add expense
        </button>
        <button class="btn btn-info" @click="showSetBudget = true">
        {{ trip.budget !== null ? 'Change budget' : 'Set budget' }}
      </button>

        <div
          v-if="showAddExpense || showEditExpense"
          class="modal"
          tabindex="-1"
          role="dialog"
          style="display: block"
        >
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  {{ showEditExpense ? "Edit Expense" : "Add Expense" }}
                </h5>
                <button type="button" class="close" @click="cancelExpense">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label for="expenseAmount">Amount ($)</label>
                  <input
                    type="number"
                    class="form-control"
                    id="expenseAmount"
                    v-model="newExpense.amount"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="expenseCategory">Category</label>
                  <div class="row">
                    <div
                      v-for="category in expenseCategories"
                      :key="category"
                      class="col-4 expense-category"
                      :class="{ selected: newExpense.category === category }"
                      @click="selectCategory(category)"
                    >
                      {{ category }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="cancelExpense"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="showEditExpense ? saveEditedExpense() : addExpense()"
                >
                  {{ showEditExpense ? "Save Changes" : "Done" }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="showSetBudget"
          class="modal"
          tabindex="-1"
          role="dialog"
          style="display: block"
        >
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Set Budget</h5>
                <button type="button" class="close" @click="cancelSetBudget">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label for="budgetAmount">Budget Amount ($)</label>
                  <input
                    type="number"
                    class="form-control"
                    id="budgetAmount"
                    v-model="newBudget"
                    required
                  />
                </div>
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="cancelSetBudget"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="saveBudget"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        <ul class="list-group mt-3">
  <li
    class="list-group-item d-flex justify-content-between align-items-center"
    v-for="(expense, index) in trip.expenses"
    :key="expense.id"
  >
    <div>
      {{ expense.category }}: 
      {{ parseFloat(expense.amount).toFixed(2) }}$
    </div>
    <div>
      <button class="btn btn-info btn-sm" @click="editExpense(index)">
        Edit
      </button>
      <button
        class="btn btn-danger btn-sm ml-2"
        @click="deleteExpense(index)"
      >
        Delete
      </button>
    </div>
  </li>
</ul>

      </div>
    </div>
  </template>
  
  <script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import { useRouter, useRoute } from "vue-router";
import { useTripStore } from "../../stores/TripStore";

const tripStore = useTripStore();
const router = useRouter();
const route = useRoute();

// Obiekt przechowujący informacje o podróży, w tym budżet i wydatki
const trip = ref({
  name: "",
  departureDate: "",
  returnDate: "",
  departureCity: "",
  arrivalCity: "",
  numberOfPeople: 1,
  notes: "",
  budget: null, // Całkowity budżet podróży
  expenses: [], // Lista wydatków
});

// Pobranie budżetu i wydatków po zamontowaniu komponentu
onMounted(async () => {
  try {
    // Ustawienie currentTripId, jeśli nie jest jeszcze ustawione
    if (!tripStore.currentTripId) {
      const tripId = route.params.tripId; // Pobranie tripId z parametrów trasy
      tripStore.setCurrentTrip(tripId); // Ustawienie aktualnej podróży w stanie
    }

    // Pobranie budżetu podróży, jeśli ID podróży jest dostępne
    if (tripStore.currentTripId) {
      const budget = await tripStore.fetchBudget(tripStore.currentTripId);
      if (budget) {
        trip.value.budget = budget.limit;
        trip.value.expenses = budget.expenses;
      }
    } else {
      console.error("currentTripId is not set. Cannot load budget.");
    }
  } catch (error) {
    console.error("Failed to load budget:", error);
  }
});

// Inicjalizacja zmiennych pomocniczych
const flights = ref([]); // Lista lotów (jeśli będą potrzebne)
const showAddExpense = ref(false); // Czy formularz dodawania wydatku jest widoczny?
const showSetBudget = ref(false); // Czy formularz ustawiania budżetu jest widoczny?
const showEditExpense = ref(false); // Czy formularz edycji wydatku jest widoczny?
const newExpense = ref({ amount: 0, category: "" }); // Dane nowego wydatku
const editExpenseIndex = ref(null); // Indeks edytowanego wydatku
const newBudget = ref(null); // Nowa wartość budżetu

// Kategorie wydatków dostępne do wyboru
const expenseCategories = [
  "Flights",
  "Lodging",
  "Car rental",
  "Transit",
  "Food",
  "Sightseeing",
  "Activities",
  "Shopping",
  "Gas",
  "Other",
];

// Oblicza całkowitą kwotę wydatków
const totalSpent = computed(() => {
  if (!trip.value.expenses || !Array.isArray(trip.value.expenses)) {
    return 0; // Jeśli brak danych, zwróć 0
  }

  return trip.value.expenses.reduce((total, expense) => {
    const amount = parseFloat(expense.amount) || 0; // Konwersja na liczbę
    return total + amount;
  }, 0);
});

// Oblicza procent wydanego budżetu
const budgetPercentage = computed(() => {
  if (trip.value.budget !== null && trip.value.budget > 0) {
    return (totalSpent.value / trip.value.budget) * 100;
  } else {
    return 0;
  }
});

// Ustawienie kategorii dla nowego wydatku
const selectCategory = (category) => {
  newExpense.value.category = category;
};

// Dodawanie nowego wydatku
const addExpense = async () => {
  try {
    if (newExpense.value.amount > 0 && newExpense.value.category) {
      const expense = await tripStore.addExpense(
        newExpense.value.amount,
        newExpense.value.category
      );
      trip.value.expenses.push(expense); // Aktualizacja listy wydatków
      newExpense.value.amount = 0;
      newExpense.value.category = "";
      showAddExpense.value = false; // Zamknięcie formularza
    } else {
      console.error("Invalid expense data");
    }
  } catch (error) {
    console.error("Failed to add expense:", error);
  }
};

// Rozpoczęcie edycji wydatku
const editExpense = (index) => {
  editExpenseIndex.value = index;
  newExpense.value = { ...trip.value.expenses[index] }; // Kopia edytowanego wydatku
  showEditExpense.value = true;
};

// Zapisanie edytowanego wydatku
const saveEditedExpense = async () => {
  try {
    if (newExpense.value.amount > 0 && newExpense.value.category) {
      const updatedExpense = {
        amount: parseFloat(newExpense.value.amount),
        category: newExpense.value.category,
      };
      // Wywołanie metody aktualizacji wydatku
      const updatedExpenseFromServer = await tripStore.updateExpense(
        trip.value.expenses[editExpenseIndex.value].id,
        updatedExpense
      );
      // Aktualizacja w lokalnym stanie
      trip.value.expenses[editExpenseIndex.value] = updatedExpenseFromServer;
      // Resetowanie formularza edycji
      newExpense.value.amount = 0;
      newExpense.value.category = "";
      showEditExpense.value = false;
      editExpenseIndex.value = null;
    } else {
      console.error("Invalid expense data");
    }
  } catch (error) {
    console.error("Failed to save edited expense:", error);
  }
};

// Usunięcie wydatku
const deleteExpense = async (index) => {
  try {
    const expenseId = trip.value.expenses[index].id;

    // Usunięcie wydatku z bazy danych
    await tripStore.deleteExpense(expenseId);

    // Usunięcie wydatku z listy w stanie lokalnym
    trip.value.expenses.splice(index, 1);

    console.log(`Expense ${expenseId} deleted successfully`);
  } catch (error) {
    console.error("Failed to delete expense:", error);
  }
};

// Zapisywanie nowego budżetu podróży
const saveBudget = async () => {
  try {
    if (newBudget.value !== null && tripStore.currentTripId) {
      console.log("currentTripId:", tripStore.currentTripId);

      if (trip.value.budget === null) {
        // Tworzenie nowego budżetu, jeśli wcześniej go nie było
        const budget = await tripStore.createBudget(
          tripStore.currentTripId,
          parseFloat(newBudget.value)
        );
        trip.value = {
          ...trip.value,
          budget: budget.limit,
        };
      } else {
        // Aktualizacja istniejącego budżetu
        const updatedBudget = await tripStore.updateBudget(
          tripStore.currentTripId, // ID podróży
          parseFloat(newBudget.value)
        );
        trip.value.budget = updatedBudget.limit;
      }

      console.log("Updated trip:", trip.value);
      showSetBudget.value = false; // Zamknięcie formularza ustawiania budżetu
      newBudget.value = null;
    } else {
      console.error("Budget amount or trip ID is invalid");
    }
  } catch (error) {
    console.error("Failed to save budget:", error);
  }
};

// Anulowanie ustawiania budżetu
const cancelSetBudget = () => {
  newBudget.value = null;
  showSetBudget.value = false;
};

// Anulowanie dodawania/edycji wydatku
const cancelExpense = () => {
  newExpense.value.amount = 0;
  newExpense.value.category = "";
  showAddExpense.value = false;
  showEditExpense.value = false;
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
  </style>
  
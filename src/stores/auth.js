import { defineStore } from "pinia";
import axios from "axios";

// Konfiguracja Axios dla obsługi sesji i ciasteczek
axios.defaults.withCredentials = true; // Włączenie obsługi ciasteczek sesji
// axios.defaults.baseURL = "http://localhost:8000"; // Jeśli odkomentowane, może powodować problemy z logowaniem


export const useAuthStore = defineStore("auth", {
  state: () => ({
    authUser: null, // Przechowuje dane zalogowanego użytkownika
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  getters: {
    user: (state) => state.authUser, // Getter do pobrania danych użytkownika
  },
  actions: {
   
    async getToken() {
  try {
    // Krok 1: Pobierz ciasteczko XSRF-TOKEN od backendu
    await axios.get(`${this.baseUrl}sanctum/csrf-cookie`, {
      withCredentials: true, // kluczowe!
    });

    // Krok 2: Ręcznie odczytaj XSRF-TOKEN z ciasteczka
    const csrfCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='));

    if (csrfCookie) {
      const csrfToken = decodeURIComponent(csrfCookie.split('=')[1]);

      // Krok 3: Ustaw domyślny nagłówek we wszystkich przyszłych żądaniach
      axios.defaults.headers.common['X-XSRF-TOKEN'] = csrfToken;
    } else {
      console.warn('Nie udało się znaleźć ciasteczka XSRF-TOKEN.');
    }
  } catch (error) {
    console.error('Błąd podczas pobierania tokena CSRF:', error);
  }
},


 // Pobranie tokena CSRF do zabezpieczenia żądań
    // async getToken() {
    //   await axios.get(`${this.baseUrl}sanctum/csrf-cookie`, {
    //     withCredentials: true
    //   });   
    // },


    // Pobranie danych zalogowanego użytkownika
    async getUser() {
      this.getToken(); // Upewnienie się, że mamy token CSRF
      const data = await axios.get(`${this.baseUrl}api/user`);
      this.authUser = data.data; // Przypisanie danych użytkownika do stanu Pinia
    },

    // Logowanie użytkownika
    async onLogin(data) {
      // Pobranie tokena CSRF do zabezpieczenia żądań
      await this.getToken(); 
      // Żądanie logowania z danymi z formularza
      await axios.post(`${this.baseUrl}login`, {     
        email: data.email,
        password: data.password,
      });
      this.router.push("/"); // Przekierowanie na stronę główną 
    },

    
    // async handleRegister(data) {
    //   // Pobranie tokena CSRF do zabezpieczenia żądań
    //   await this.getToken(); 
    //   // Żądanie rejestracji z danymi z formularza

    //   await axios.post(`${this.baseUrl}api/register`, { 
    //     name: data.name,
    //     email: data.email,
    //     password: data.password,
    //     password_confirmation: data.password_confirmation,
    //   },
    // {
    //   withCredentials: true,
    // });
    //   this.router.push("/"); // Przekierowanie na stronę główną
    // },

// Rejestracja nowego użytkownika
async handleRegister(data) {
  await this.getToken(); // CSRF token

  const csrfCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='));
  const csrfToken = csrfCookie ? decodeURIComponent(csrfCookie.split('=')[1]) : '';

  await axios.post(`${this.baseUrl}api/register`, {
    name: data.name,
    email: data.email,
    password: data.password,
    password_confirmation: data.password_confirmation,
  }, {
    headers: {
      'X-XSRF-TOKEN': csrfToken,
      'Content-Type': 'application/json'
    },
    withCredentials: true,
  });

  this.router.push("/"); // Przekierowanie
},


    // Wylogowanie użytkownika
    async logout() {
      await axios.post(`${this.baseUrl}api/logout`); // Wywołanie endpointu wylogowania
      this.authUser = null; // Wyczyszczenie danych użytkownika
      this.router.push("/"); 
    },

    // Zmiana hasła użytkownika
    async changePassword(passwordData) {
      await this.getToken(); 
      try {
        console.log('Wysyłanie żądania zmiany hasła:', passwordData);
        // Wysyłanie żądania POST do API z danymi hasła
        const response = await axios.post(`${this.baseUrl}api/api/change-password`, {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
          new_password_confirmation: passwordData.new_password_confirmation,
        });
        console.log('Odpowiedź serwera:', response.data); // Logowanie odpowiedzi serwera
        return { success: true };
      } catch (error) {
        console.error('Błąd podczas zmiany hasła:', error.response || error);
        return { success: false, errors: error.response?.data?.errors };
      }
    },

    // Usunięcie konta użytkownika
    async deleteAccount(password) {
      await this.getToken(); // Pobranie tokena CSRF
      try {
        // Pobranie tokena XSRF z ciasteczek
        const csrfToken = decodeURIComponent(
          document.cookie.split("; ").find(row => row.startsWith("XSRF-TOKEN=")).split("=")[1]
        );
        // Wysłanie żądania usunięcia konta
        await axios.delete(`${this.baseUrl}api/delete-account`, {
          data: { password }, // Przekazanie hasła w treści zapytania
          headers: {
            "X-XSRF-TOKEN": csrfToken, // Token CSRF wymagany do autoryzacji
            "Content-Type": "application/json",
          },
          withCredentials: true, // Upewnienie się, że ciasteczka sesji są uwzględnione
        });
        this.authUser = null; // Wylogowanie użytkownika po usunięciu konta
        this.router.push("/not-logged-in"); // Przekierowanie na stronę dla niezalogowanych użytkowników
        return { success: true };
      } catch (error) {
        console.error("Błąd podczas usuwania konta:", error);
        return { success: false, message: error.response?.data?.message || "Błąd" };
      }
    }
  },
});

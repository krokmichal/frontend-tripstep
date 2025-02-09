import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import About from "../views/About.vue";
import Contact from "../views/Contact.vue";
import Trip from "../views/Trip.vue";
import Account from "../views/Account.vue";
import CreateTrip from "../views/CreateTrip.vue";
import TripHotels from "../views/Hotels.vue";
import Flights from "../views/Flights.vue"
import NotLoggedIn from '@/views/NotLoggedIn.vue';
import { useAuthStore } from "../stores/auth";

const routes = [
  { path: "/", component: Home }, // Ten komponent posiada własne sprawdzenie czy użytkownik jest zalogowany
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/about", component: About },
  { path: "/contact", component: Contact },
  { path: "/trip", component: Trip, meta: { requiresAuth: true } }, // Oznaczenie komponentów, do których użytkownik musi być zalogowany by uzyskać dostęp
  { path: "/account", component: Account, meta: { requiresAuth: true } },  
  { path: "/create-trip", component: CreateTrip, meta: { requiresAuth: true }},
  { path: "/trip-hotels", component: TripHotels, meta: { requiresAuth: true }},
  { path: "/flights", component: Flights, meta: { requiresAuth: true }},
  { path: '/not-logged-in', component: NotLoggedIn },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.user && to.meta.requiresAuth) {
    next('/not-logged-in'); // Przekierowanie do NotLoggedIn.vue jeśli użytkownik nie jest zalogowany
  } else {
    next(); // Zezwól na przejście do żądanej trasy
  }
});

export default router;

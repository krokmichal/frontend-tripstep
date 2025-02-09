// import "./assets/main.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import "./axios"
import { createApp, markRaw } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
// import VueGoogleMaps from '@fawmi/vue-google-maps'

import router from "./router/index.js";

const app = createApp(App);
const pinia = createPinia();

pinia.use(({ store }) => {
  store.router = markRaw(router);
});

app.use(router);
app.use(pinia);

app.mount("#app");

// createApp(App).mount("#app");



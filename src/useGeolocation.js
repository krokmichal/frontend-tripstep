import { onUnmounted, onMounted, ref } from "vue"; 

// Funkcja kompozycyjna, która obsługuje geolokalizację użytkownika
export function useGeolocation() {
  // Tworzymy reaktywny obiekt przechowujący współrzędne użytkownika (domyślnie 0,0)
  const coords = ref({ latitude: 0, longitude: 0 });
  // Sprawdzamy, czy przeglądarka obsługuje geolokalizację
  const isSupported = "navigator" in window && "geolocation" in navigator;
  // Zmienna do przechowywania identyfikatora obserwatora pozycji
  let watcher = null;
  // Gdy komponent zostanie zamontowany (dodany do DOM), rozpoczynamy śledzenie lokalizacji
  onMounted(() => {
    if (isSupported) {
      // Uruchamiamy geolokalizację i aktualizujemy `coords` przy każdej zmianie pozycji
      watcher = navigator.geolocation.watchPosition(
        (position) => (coords.value = position.coords)
      );
    }
  });
  // Gdy komponent zostanie odmontowany (usunięty z DOM), zatrzymujemy śledzenie lokalizacji
  onUnmounted(() => {
    if (watcher) navigator.geolocation.clearWatch(watcher);
  });
  // Zwracamy aktualne współrzędne oraz informację o obsłudze geolokalizacji
  return { coords, isSupported };
}

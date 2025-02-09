<template>
  <div class="account">
    <h2 class="text-2xl font-bold mb-4">Account</h2>

    <div class="button-group">
      <button @click="toggleSection('logout')" :class="{ active: showLogout }" class="p-2 bg-gray-500 text-black rounded hover:bg-gray-600 ml-2">
        Log out
      </button>
      <button @click="toggleSection('changePassword')" :class="{ active: showChangePassword }" class="p-2 bg-blue-500 text-black rounded hover:bg-blue-600">
        Change password
      </button>
      <button @click="toggleSection('deleteAccount')" :class="{ active: showDeleteAccount }" class="p-2 bg-red-200 text-black rounded hover:bg-red-300 w-full">
      Delete your account
    </button>
    </div>
    

    <div v-if="showChangePassword" class="content-box">
      <h3 class="text-xl font-bold mt-4">Change password</h3>
      <form @submit.prevent="submitForm" class="grid gap-4">
        <input type="password" v-model="form.current_password" placeholder="Your password" required class="w-full p-2 border rounded" />
        <input type="password" v-model="form.new_password" placeholder="New password" required class="w-full p-2 border rounded" />
        <input type="password" v-model="form.new_password_confirmation" placeholder="Confirm new password" required class="w-full p-2 border rounded" />
        <button type="submit" class="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Change password</button>
      </form>
    </div>

    <div v-if="showDeleteAccount" class="content-box">
      <h3 class="text-xl font-bold mt-4">Delete your account</h3>
      <p class="text-red-600">This operation is permanent, do you really want to delete your account?</p>
      <input type="password" v-model="password" placeholder="Enter your password" required class="w-full p-2 border rounded mt-2" />
      <button @click="deleteAccount" class="p-2 bg-red-500 text-white rounded hover:bg-red-600 mt-2">Yes, delete</button>
    </div>

    <div v-if="showLogout" class="content-box">
      <h3 class="text-xl font-bold mt-4">Log out</h3>
      <p>Are you sure you want to log out now?</p>
      <button @click="authStore.logout" class="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 mt-2">Yes, log out</button>
    </div>

    <div v-if="message" class="mt-4">
      <div :class="messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="p-2 rounded">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const showChangePassword = ref(false);
const showDeleteAccount = ref(false);
const showLogout = ref(false);
const message = ref("");
const messageType = ref("");
const password = ref("");

const form = ref({
current_password: "",
new_password: "",
new_password_confirmation: "",
});

const toggleSection = (section) => {
showChangePassword.value = section === "changePassword" ? !showChangePassword.value : false;
showDeleteAccount.value = section === "deleteAccount" ? !showDeleteAccount.value : false;
showLogout.value = section === "logout" ? !showLogout.value : false;
};

const submitForm = async () => {
message.value = "";
// Wywołanie akcji zmiany hasła w store i przekazanie danych formularza
const response = await authStore.changePassword(form.value);
if (response.success) {
  message.value = "Hasło zostało zmienione pomyślnie.";
  messageType.value = "success";
  // Resetowanie pól formularza po udanej zmianie hasła
  form.value = { current_password: "", new_password: "", new_password_confirmation: "" };
} else {
  message.value = response.errors?.current_password || "Błąd zmiany hasła.";
  messageType.value = "error";
}
};

const deleteAccount = async () => {
message.value = "";
 // Wywołanie akcji usunięcia konta i przekazanie hasła do potwierdzenia
const response = await authStore.deleteAccount(password.value);
if (response.success) {
  message.value = "Konto zostało usunięte.";
  messageType.value = "success";
} else {
  message.value = response.message || "Błąd podczas usuwania konta.";
  messageType.value = "error";
}
};
</script>

<style scoped>
.account {
margin-top: 100px;
max-width: 500px;
margin-left: auto;
margin-right: auto;
}

.button-group {
display: flex;
flex-direction: column;
gap: 10px;
}

button {
color: black;
padding: 10px 15px;
border-radius: 5px;
}

button.active {
background-color: #d1d5db;
}

.content-box {
margin-top: 20px;
padding: 20px;
border: 1px solid #ccc;
border-radius: 10px;
background-color: #f9f9f9;
max-width: 100%;
}
</style>

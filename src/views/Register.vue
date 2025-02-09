<template>
    <div>
        <!-- Nagłówek formularza rejestracji -->
        Register HERE!
        <form action="" @submit.prevent="authStore.handleRegister(form)">
            
            <!-- Pole do wpisania nazwy użytkownika -->
            <div class="form-box">
                <input placeholder="name" type="text" v-model="form.name" />
            </div>

            <!-- Pole do wpisania adresu e-mail -->
            <div class="form-box">
                <input placeholder="email" type="email" v-model="form.email" />
            </div>

            <!-- Pole do wpisania hasła -->
            <div class="form-box">
                <input placeholder="password" type="password" v-model="form.password" />
            </div>

            <!-- Pole do potwierdzenia hasła -->
            <div class="form-box">
                <input placeholder="confirm password" type="password" v-model="form.password_confirmation" />
            </div>

            <!-- Przycisk do wysłania formularza rejestracji -->
            <button type="submit" class="button">REGISTER</button>
        </form>

        <!-- Sekcja dla użytkowników, którzy już mają konto -->
        <div class="user-already">
            <p>Already have an account?</p>
            <p>
                Log in
                <button>
                    <router-link to="/login">here</router-link>
                </button>
            </p>
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import { useAuthStore } from '../stores/auth';

    // Pobranie instancji authStore do obsługi rejestracji użytkownika
    const authStore = useAuthStore();

    // Obiekt formularza zawierający dane wpisane przez użytkownika
    const form = ref({
        name: '', // Imię użytkownika
        email: '', // Adres e-mail użytkownika
        password: '', // Hasło użytkownika
        password_confirmation: '', // Potwierdzenie hasła
    });
</script>


<style>
    .form-box input {
        margin-left: 20px;
    }
</style>

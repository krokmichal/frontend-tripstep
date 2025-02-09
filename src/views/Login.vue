<template>
    <div id="login-component">
        <main>
            <!-- Formularz logowania -->
            <form @submit.prevent="authStore.onLogin(form)">
                <div class="form-box">
                    <!-- Pole do wpisania emaila -->
                    <input placeholder="Email" v-model="form.email" type="email">
                </div>

                <div class="form-box">
                    <!-- Pole do wpisania hasła -->
                    <input placeholder="Password" v-model="form.password" type="password">
                </div>

                <div>
                    <!-- Przycisk wysyłający formularz logowania -->
                    <button type="submit" class="button submit">Login</button>
                </div>
            </form>

            <div class="user-already">
                <p>Forget password?</p>
                
                <!-- Przycisk przekierowujący do rejestracji -->
                <button>
                    <router-link to="/register">Not a member yet? Sign up.</router-link>
                </button>
            </div>
        </main>
    </div>
</template>

<script setup>
    import { ref } from "vue";
    import axios from "axios";
    import { useAuthStore } from "../stores/auth";
    import { useRouter } from 'vue-router'
    
    // Konfiguracja Axios do przesyłania ciasteczek z poświadczeniami
    axios.defaults.withCredentials = true;

    // Pobranie instancji store do autoryzacji użytkownika
    const authStore = useAuthStore();
    
    // Pobranie instancji routera, aby umożliwić nawigację między stronami
    const router = useRouter();

    // Obiekt przechowujący dane formularza logowania
    const form = ref({
        email: null,
        password: null
    })

    // Zmienna przechowująca dane użytkownika
    const user = ref();
</script>


<style>
    .form-box input {
        width: 40%;
        margin-top: 5px;
    }

    main {
        margin-top: 100px;
    }

    .submit {
        margin: 20px 0 20px 0;
        width: 20%;
    }

    #login-component {
        margin-top: 50px;
    }
</style>



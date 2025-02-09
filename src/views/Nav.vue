<template>
    <div>
        <nav class="navbar navbar-expand-lg fixed-top">
            <div id="navigation" class="container navbar">
                <a class="navbar-brand" href="#"><router-link to="/">tripstep</router-link>
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                    aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link active" aria-current="page" href="#"><router-link
                                    to="/">Home</router-link></a>
                        </li>
                       

                        <li class="nav-item">
                            <a class="nav-link active" href="#"><router-link to="/about">About</router-link></a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link active" href="#"><router-link to="/contact">Contact</router-link></a>
                        </li>
                    </ul>

                </div>
                <div v-if="!authStore.user" class="collapse navbar-collapse" id="navbarSupportedContent">
                    <form class="d-flex" role="search">
                        <ul class="navbar-nav">
                            <li id="sign-in" class="nav-item">
                                <router-link to="/login">Sign In</router-link>
                            </li>
                        </ul>
                        <button class="button" type="submit"><router-link to="/register"
                                class="white-a">Register</router-link></button>
                    </form>
                </div>
                <div v-else class="collapse navbar-collapse" id="navbarSupportedContent">
                    <form class="d-flex" role="search">
                        <ul class="navbar-nav">
                        </ul>
                        <img src="/src/assets/img/avatar-default.png" alt="">
                        <span class="current-user"><router-link to="/account"
                                class="black-a">{{authStore.user.email}}</router-link></span>
                                
                    </form>
                </div>
            </div>
        </nav>

    </div>
</template>

<script>
import { useAuthStore } from "../stores/auth";
import { onMounted } from "vue";

export default {
    setup() {
        const authStore = useAuthStore();

        // Pobierz dane użytkownika przy montowaniu komponentu
        onMounted(() => {
            authStore.getUser();
        });

        return {
            authStore,
        };
    },
};
</script>

<style>
    a:hover {
        color: var(--orange);
        transition: 0.3s;
    }

    .navbar-collapse {
        flex-grow: 0;
    }

    #navigation {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    nav {
        font-weight: 500;
        font-size: 1.1rem;
    }

    .navbar {
        background-color: white;
    }

    .white-a {
        color: white;
    }

    .white-a:hover {
        color: black;
    }

    .current-user {
        display: flex;
        align-items: center;
    }

    .button {
        background-color: var(--orange);
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
    }

    .button:hover {
        box-shadow: 0 0 20px 0 var(--orange);
        transition: 0.3s;
    }

    .d-flex .nav-item {
        margin-right: 1em;
    }

    #sign-in {
        display: flex;
        align-items: center;
    }
</style>
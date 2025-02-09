<template>
    <div class="not-logged-in">
      <section class="hero-section">
        <div class="container">
          <div class="row">
            <div class="col-md-5 hero-info text-center">
              <div class="row">
                <div class="col-12 text-logo">
                  <span>tripstep</span>
                </div>
              </div>
            </div>
            <div class="col-md-7">
              <img id="hero-img" :src="heroImage" alt="Hero Image" class="img-fluid" />
            </div>
          </div>
          <div class="row mt-4">
            <div class="col-8 offset-2">
              <button class="btn-primary btn-lg" type="submit">
                <router-link to="/register" class="text-white">Start now</router-link>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import heroImage from '@/assets/hero-img.jpg';
  import { useAuthStore } from "../stores/auth";
  </script>
  
  <style scoped>
  .hero-section {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: white;
  }
  
  .hero-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .hero-text {
    font-weight: 700;
    font-size: 2rem;
    color: var(--orange);
    margin-top: 20px;
  }
  
  .text-logo span {
    color: var(--orange);
    font-size: 4rem;
    font-weight: 900;
  }
  
  #hero-img {
    width: 400px; /* Zmniejszono rozmiar */
    height: auto;
    border-radius: 66% 34% 74% 26% / 30% 55% 45% 70%; /* Unikalny kształt obramowania */
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
    border: 4px solid black; /* Obramowanie */
  }
  
  
  button {
    background-color: var(--orange);
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  button:hover {
    background-color: #e67e22;
  }
  
  .trip-container {
    margin-top: 30px;
  }
  
  .single-trip {
    cursor: pointer;
    margin: 15px 0;
  }
  
  .single-trip-menu {
    display: flex;
    justify-content: flex-end;
  }
  
  .trip-card {
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  .trip-card:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  }
  
  .trip-card h3 {
    font-size: 1.5rem;
    color: #2c3e50;
  }
  
  .trip-card p {
    font-size: 1rem;
    color: #7f8c8d;
  }
  
  .dropdown-menu {
    min-width: 150px;
  }
  
  .dropdown-item {
    font-size: 0.9rem;
  }
  
  .dropdown-item i {
    margin-right: 8px;
  }
  
  /* Nowa klasa dla przycisku z "..." */
  .btn-outline-orange {
    border-color: var(--orange);
    color: var(--orange);
    background-color: transparent;
    transition: all 0.3s ease;
    padding: 5px 12px;
    font-size: 1rem;
  }
  
  .btn-outline-orange:hover {
    background-color: var(--orange);
    color: white;
  }
  
  .dropdown-img {
    width: 12px;
    height: 12px;
    margin-right: 5px;
  }
  
  .btn-outline-orange.w-100 {
    width: 100%;
  }
  
  /* Przycisk delete i share po najechaniu */
  .dropdown-item.btn:hover {
    background-color: var(--orange);
    color: white;
  }
  </style>
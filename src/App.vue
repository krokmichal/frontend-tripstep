<template>
  <div>
    <Nav />
    <router-view class="main-content" />
  </div>
</template>

<script setup>
  import Nav from './views/Nav.vue';
</script>



<style>




  :root {
    --orange: hsl(8, 96%, 56%);
    --description: hsl(245, 5%, 46%);
    --graybg: hsl(0, 0%, 91%);
    --banner: hsl(0, 0%, 18%);
    --reviewbg: hsl(0, 0%, 97%);
  }

  .description {
    color: var(--description);
  }

  .container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .row {
    width: 100%;
  }

  a {
    text-decoration: none;
    color: black;
  }

  #app {
    font-family: "Outfit", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }

  .container-fluid {
    background-color: black;
  }

  .row div {
    color: black
  }

  .main-content {
    margin-top: calc(80px + env(safe-area-inset-top)); /* 60px to wysokość Twojej nawigacji */
  }
</style>

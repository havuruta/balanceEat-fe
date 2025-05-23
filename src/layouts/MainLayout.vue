<template>
  <Navbar />
  <main>
    <router-view />
  </main>
  <Footer />
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
</script>

<style scoped>
main {
  min-height: 70vh;
}
</style>

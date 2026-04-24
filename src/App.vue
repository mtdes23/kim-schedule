<script setup>
import { onMounted } from 'vue'
import Navbar from './components/layout/Navbar.vue'
import MainScheduler from './components/scheduler/MainScheduler.vue'
import AppFooter from './components/layout/AppFooter.vue'

onMounted(() => {
  console.log("Kim's Personal Schedule initialized")
})
</script>

<template>
  <div class="app-container">
    <div class="main-content">
      <Navbar />
      
      <main class="animate-fade">
        <MainScheduler />
      </main>

      <AppFooter />
    </div>
  </div>
</template>

<style scoped>
main {
  margin-top: 1rem;
  min-height: calc(100vh - 200px);
}
</style>

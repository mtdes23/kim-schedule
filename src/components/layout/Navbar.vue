<script setup>
import { useScheduleStore } from '../../stores/schedule'
import { Sparkles, Sun, Moon } from 'lucide-vue-next'

const store = useScheduleStore()
</script>

<template>
  <header class="navbar">
    <div class="nav-content animate-fade">
      <div class="logo">
        <div class="logo-icon">K</div>
        <span class="font-heading">Kim's Planner</span>
      </div>

      <button 
        class="mode-toggle" 
        :class="{ 'vacation': !store.isSemesterMode }"
        @click="store.toggleSemesterMode()"
      >
        <div class="toggle-track">
          <div class="toggle-thumb">
            <Sparkles v-if="store.isSemesterMode" :size="12" />
            <Sun v-else :size="12" />
          </div>
        </div>
        <span class="mode-text">{{ store.isSemesterMode ? 'Trong học kỳ' : 'Kỳ nghỉ lễ' }}</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  width: 100%; max-width: 600px; margin: 0 auto;
  padding: 1rem 1.5rem; background: transparent; z-index: 10;
}

.nav-content { display: flex; justify-content: space-between; align-items: center; }

.logo { display: flex; align-items: center; gap: 10px; }
.logo-icon {
  width: 32px; height: 32px; background: var(--primary); color: white;
  border-radius: 10px; display: grid; place-items: center; font-weight: 900;
  font-family: 'Lexend'; box-shadow: 0 4px 12px var(--primary-glow);
}
.logo span { font-size: 1.1rem; color: white; }

.mode-toggle {
  display: flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.05);
  padding: 4px 12px 4px 4px; border-radius: 20px; border: 1px solid var(--border);
  cursor: pointer; transition: var(--transition);
}
.toggle-track {
  width: 24px; height: 24px; background: rgba(255, 255, 255, 0.1); border-radius: 50%;
  position: relative; display: grid; place-items: center;
}
.toggle-thumb { color: var(--primary); }
.mode-text { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }

.mode-toggle.vacation { background: rgba(245, 158, 11, 0.1); border-color: var(--accent); }
.mode-toggle.vacation .toggle-thumb { color: var(--accent); }
.mode-toggle.vacation .mode-text { color: var(--accent); }

@media (max-width: 600px) {
  .logo span { display: none; }
}
</style>

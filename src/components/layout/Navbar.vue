<script setup>
import { useScheduleStore } from '../../stores/schedule'
import { format, addWeeks, subWeeks, addDays } from 'date-fns'
import { vi } from 'date-fns/locale'
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Calendar, 
  Sparkles,
  Trash2,
  BookOpen,
  Sun
} from 'lucide-vue-next'
import html2canvas from 'html2canvas'
import confetti from 'canvas-confetti'

const store = useScheduleStore()

const nextWeek = () => {
  store.setWeek(addWeeks(store.currentWeekStart, 1))
}

const prevWeek = () => {
  store.setWeek(subWeeks(store.currentWeekStart, 1))
}

const handleAutoSchedule = () => {
  store.autoSchedule()
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
  })
}

const handleClear = () => {
  store.clearAll()
}

const exportAsImage = async () => {
  const element = document.getElementById('scheduler-grid')
  if (!element) return
  
  const canvas = await html2canvas(element, {
    backgroundColor: '#0a0b10',
    scale: 2,
    logging: false,
    useCORS: true
  })
  
  const link = document.createElement('a')
  link.download = `kim-schedule-${format(store.currentWeekStart, 'yyyy-MM-dd')}.png`
  link.href = canvas.toDataURL()
  link.click()
}
</script>

<template>
  <header class="glass-card navbar">
    <div class="brand">
      <div class="logo-icon">K</div>
      <div>
        <h1>Kim's Schedule</h1>
        <p class="subtitle">Taiwan Lifestyle</p>
      </div>
    </div>

    <div class="nav-center">
      <div class="week-controls">
        <button class="btn-icon" @click="prevWeek">
          <ChevronLeft :size="20" />
        </button>
        
        <div class="current-week">
          <span>
            {{ format(store.currentWeekStart, 'dd/MM', { locale: vi }) }} 
            - {{ format(addDays(store.currentWeekStart, 6), 'dd/MM', { locale: vi }) }}
          </span>
        </div>

        <button class="btn-icon" @click="nextWeek">
          <ChevronRight :size="20" />
        </button>
      </div>
    </div>

    <div class="actions">
      <button class="btn btn-ghost" @click="handleClear" title="Xóa lịch tuần này">
        <Trash2 :size="18" class="text-danger" />
      </button>
      <button class="btn btn-ghost" @click="handleAutoSchedule" title="Tự động lấp đầy">
        <Sparkles :size="18" class="text-magic" />
        <span class="hide-mobile">Auto Fill</span>
      </button>
      <button class="btn btn-primary" @click="exportAsImage">
        <Download :size="18" />
        <span class="hide-mobile">Xuất ảnh</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  margin-bottom: 1.5rem;
  gap: 1.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 200px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: var(--primary);
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 4px 15px hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.3);
  font-family: var(--font-heading);
}

h1 {
  font-size: 1.1rem;
  margin: 0;
}

.subtitle {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.week-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: hsla(0, 0%, 0%, 0.2);
  padding: 0.4rem 0.8rem;
  border-radius: 99px;
  border: 1px solid var(--border);
}

.current-week {
  font-weight: 600;
  font-size: 0.9rem;
  min-width: 110px;
  text-align: center;
}

.mode-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  background: hsla(0, 0%, 0%, 0.3);
  border: 1px solid var(--border);
  border-radius: 99px;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mode-toggle.semester {
  border-color: var(--primary);
  color: var(--primary);
  background: hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.1);
}

.mode-toggle:not(.semester) {
  border-color: #f59e0b;
  color: #f59e0b;
  background: hsla(38, 92%, 50%, 0.1);
}

.actions {
  display: flex;
  gap: 0.75rem;
  min-width: 200px;
  justify-content: flex-end;
}

.text-magic {
  color: #f59e0b;
}

.text-danger {
  color: var(--danger);
}

@media (max-width: 1024px) {
  .navbar {
    padding: 1rem;
  }
  .hide-mobile {
    display: none;
  }
  .brand, .actions {
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }
  .nav-center {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

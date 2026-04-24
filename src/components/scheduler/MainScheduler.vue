<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useScheduleStore } from '../../stores/schedule'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { 
  Plus, 
  Trash2, 
  Settings, 
  X, 
  Wallet, 
  Gift,
  BookOpen,
  Briefcase,
  PieChart,
  StickyNote,
  CreditCard,
  LayoutGrid,
  ChevronRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Monitor,
  Smartphone
} from 'lucide-vue-next'
import draggable from 'vuedraggable'
import confetti from 'canvas-confetti'

const store = useScheduleStore()
const activeTab = ref('schedule')
const activeDayIndex = ref(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)
const mounted = ref(false)

// Animated Salary Counter
const displayedSalary = ref(0)
const animateSalary = () => {
  const target = Math.round(store.estimatedSalary)
  const duration = 1000
  const startTime = performance.now()
  const startVal = displayedSalary.value

  const update = (now) => {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    displayedSalary.value = Math.floor(startVal + progress * (target - startVal))
    if (progress < 1) requestAnimationFrame(update)
  }
  requestAnimationFrame(update)
}

watch(() => store.estimatedSalary, () => {
  animateSalary()
})

onMounted(() => {
  mounted.value = true
  animateSalary()
})

const getActivityType = (id) => {
  return store.activityTypes.find(t => t.id === id)
}

const handleAdd = (day) => {
  store.addAssignment(day)
  confetti({
    particleCount: 40,
    spread: 70,
    origin: { y: 0.8 },
    colors: ['#3b82f6', '#f59e0b', '#10b981']
  })
}

const handleUpdate = (id, field, value) => {
  store.updateAssignment(id, { [field]: value })
}

const handleDelete = (id) => {
  store.removeAssignment(id)
}

const onAdd = (evt, newDate) => {
  const item = evt.item.__draggable_context.element
  store.moveAssignment(item.id, newDate)
}
</script>

<template>
  <div class="app-layout" :class="{ 'is-mounted': mounted }">
    
    <!-- SIDEBAR (PC ONLY) -->
    <aside class="sidebar-nav hide-mobile">
      <div class="sidebar-top">
        <div class="logo">
          <div class="logo-icon">K</div>
          <span class="font-heading">Kim's Planner</span>
        </div>
      </div>

      <nav class="sidebar-menu">
        <button class="side-item" :class="{ 'active': activeTab === 'schedule' }" @click="activeTab = 'schedule'">
          <Calendar :size="20" />
          <span>Lịch trình</span>
        </button>
        <button class="side-item" :class="{ 'active': activeTab === 'stats' }" @click="activeTab = 'stats'">
          <PieChart :size="20" />
          <span>Báo cáo</span>
        </button>
        <button class="side-item" :class="{ 'active': activeTab === 'settings' }" @click="activeTab = 'settings'">
          <Settings :size="20" />
          <span>Cài đặt</span>
        </button>
      </nav>

      <div class="sidebar-bottom">
        <div class="user-pill glass-card">
          <div class="avatar">K</div>
          <div class="info">
            <span class="name">Kim mtdes23</span>
            <span class="status">Taiwan Student</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- MAIN DASHBOARD -->
    <main class="main-viewport">
      
      <!-- Top Stats Bar (PC/Mobile) -->
      <header class="top-dashboard glass-card">
        <div class="dashboard-info">
          <h1 class="font-heading hide-mobile">Tông quan Tuần này</h1>
          <div class="mobile-logo show-mobile">
            <div class="logo-icon">K</div>
          </div>
          <div class="salary-display">
            <span class="label">Lương dự tính</span>
            <div class="val font-heading">
              <span class="currency">TWD</span>
              {{ displayedSalary.toLocaleString() }}
            </div>
          </div>
        </div>

        <div class="quick-breakdown hide-mobile">
          <div class="mini-stat">
            <BookOpen :size="16" class="text-primary" />
            <div class="det">
              <span class="label">Học tập</span>
              <span class="num">{{ store.calculateWeeklyStudyHours.toFixed(1) }}h</span>
            </div>
          </div>
          <div class="mini-stat" :class="{ 'danger': store.calculateWeeklyWorkHours > store.workLimit }">
            <Briefcase :size="16" class="text-accent" />
            <div class="det">
              <span class="label">Làm việc</span>
              <span class="num">{{ store.calculateWeeklyWorkHours.toFixed(1) }}/{{ store.workLimit }}h</span>
            </div>
          </div>
          <div class="mini-stat">
            <Wallet :size="16" class="text-secondary" />
            <div class="det">
              <span class="label">Lương dư</span>
              <span class="num">{{ Math.round(store.remainingSalary).toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- VIEW: SCHEDULE -->
      <section v-if="activeTab === 'schedule'" class="view-content animate-fade">
        <!-- Desktop Grid View (Visible on PC) -->
        <div class="desktop-grid-layout hide-mobile">
          <div v-for="(day, index) in store.weekDays" :key="day.toString()" class="grid-day-col">
            <div class="col-header" :class="{ 'is-today': activeDayIndex === index, 'is-holiday': store.isDayHoliday(day) }">
              <span class="day-name">{{ format(day, 'EEEE', { locale: vi }) }}</span>
              <span class="day-date">{{ format(day, 'dd/MM') }}</span>
              <button class="col-holiday-btn" @click="store.toggleHoliday(day)">
                <Gift :size="12" />
              </button>
            </div>

            <draggable 
              :list="store.getAssignmentsByDay(day)"
              group="activities"
              item-key="id"
              class="col-cards"
              @add="(evt) => onAdd(evt, day)"
              :animation="250"
              ghost-class="ghost-card"
            >
              <template #item="{ element: act }">
                <div class="mini-card" :style="{ '--accent': getActivityType(act.activityId)?.color }">
                  <div class="card-head">
                    <span class="icon">{{ getActivityType(act.activityId)?.icon }}</span>
                    <span class="time">{{ act.startTime }} - {{ act.endTime }}</span>
                    <button class="del" @click="handleDelete(act.id)"><X :size="12" /></button>
                  </div>
                  <div v-if="act.notes" class="card-note">{{ act.notes }}</div>
                </div>
              </template>
            </draggable>

            <button class="add-mini-btn" @click="handleAdd(day)">
              <Plus :size="14" /> Thêm
            </button>
          </div>
        </div>

        <!-- Mobile Day Scroller (Visible on Mobile) -->
        <div class="mobile-day-view show-mobile">
          <div class="day-tabs">
            <button 
              v-for="(day, index) in store.weekDays" 
              :key="index"
              class="day-tab"
              :class="{ 'active': activeDayIndex === index }"
              @click="activeDayIndex = index"
            >
              <span class="abbr">{{ format(day, 'EEE', { locale: vi }) }}</span>
              <span class="num">{{ format(day, 'dd') }}</span>
            </button>
          </div>

          <div class="active-pane glass-card">
            <div class="pane-header">
              <h2 class="font-heading">{{ format(store.weekDays[activeDayIndex], 'EEEE, dd/MM', { locale: vi }) }}</h2>
              <button 
                class="holiday-pill" 
                :class="{ 'active': store.isDayHoliday(store.weekDays[activeDayIndex]) }"
                @click="store.toggleHoliday(store.weekDays[activeDayIndex])"
              >
                <Gift :size="14" />
                <span>{{ store.isDayHoliday(store.weekDays[activeDayIndex]) ? 'Ngày Lễ (x2)' : 'Đánh dấu Lễ' }}</span>
              </button>
            </div>

            <draggable 
              :list="store.getAssignmentsByDay(store.weekDays[activeDayIndex])"
              group="activities"
              item-key="id"
              class="mobile-cards"
              @add="(evt) => onAdd(evt, store.weekDays[activeDayIndex])"
              :animation="300"
            >
              <template #item="{ element: act }">
                <div class="full-card glass-card" :style="{ '--accent': getActivityType(act.activityId)?.color }">
                  <div class="card-top">
                    <span class="type-icon">{{ getActivityType(act.activityId)?.icon }}</span>
                    <select :value="act.activityId" @change="handleUpdate(act.id, 'activityId', $event.target.value)">
                      <option v-for="type in store.activityTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
                    </select>
                    <button @click="handleDelete(act.id)"><Trash2 :size="16" /></button>
                  </div>
                  <div class="card-time">
                    <input type="time" :value="act.startTime" @change="handleUpdate(act.id, 'startTime', $event.target.value)">
                    <ArrowRight :size="14" />
                    <input type="time" :value="act.endTime" @change="handleUpdate(act.id, 'endTime', $event.target.value)">
                  </div>
                  <div class="card-note">
                    <StickyNote :size="12" />
                    <input type="text" :value="act.notes" @input="handleUpdate(act.id, 'notes', $event.target.value)" placeholder="Ghi chú...">
                  </div>
                </div>
              </template>
            </draggable>
            
            <button class="fab-mobile" @click="handleAdd(store.weekDays[activeDayIndex])">
              <Plus :size="28" />
            </button>
          </div>
        </div>
      </section>

      <!-- VIEW: STATS -->
      <section v-if="activeTab === 'stats'" class="view-content animate-fade">
        <div class="desktop-stats-layout">
          <div class="stats-sidebar hide-mobile">
            <div class="hero-card glass-card blue">
              <span class="label">Tổng thu nhập Tuần</span>
              <h2 class="font-heading">{{ Math.round(store.estimatedSalary).toLocaleString() }} TWD</h2>
              <p>Bạn đã kiếm được {{ store.foodComparison.tea }} ly trà sữa!</p>
            </div>
            <div class="hero-card glass-card green">
              <span class="label">Lương thực nhận</span>
              <h2 class="font-heading">{{ Math.round(store.remainingSalary).toLocaleString() }} TWD</h2>
              <p>Sau khi trừ chi phí cố định</p>
            </div>
          </div>

          <div class="stats-main">
            <div class="chart-section glass-card">
              <h3 class="font-heading">Phân bổ thời gian</h3>
              <div class="breakdown-grid">
                <div v-for="type in store.activityBreakdown" :key="type.id" class="breakdown-box">
                  <div class="box-head">
                    <span class="icon">{{ type.icon }}</span>
                    <span class="name">{{ type.name }}</span>
                    <span class="val">{{ type.hours.toFixed(1) }}h</span>
                  </div>
                  <div class="progress-bg"><div class="progress-bar" :style="{ width: (type.hours / 40 * 100) + '%', background: type.color }"></div></div>
                </div>
              </div>
            </div>

            <div class="milestones-section glass-card">
              <h3 class="font-heading">Quy đổi Ẩm thực</h3>
              <div class="food-grid">
                <div class="food-item">
                  <div class="food-icon">🧋</div>
                  <div class="food-info">
                    <span class="name">Trà sữa</span>
                    <span class="count font-heading">{{ store.foodComparison.tea }}</span>
                  </div>
                </div>
                <div class="food-item">
                  <div class="food-icon">🍱</div>
                  <div class="food-info">
                    <span class="name">Bento</span>
                    <span class="count font-heading">{{ store.foodComparison.bento }}</span>
                  </div>
                </div>
                <div class="food-item">
                  <div class="food-icon">🍜</div>
                  <div class="food-info">
                    <span class="name">Mì bò</span>
                    <span class="count font-heading">{{ store.foodComparison.noodle }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- VIEW: SETTINGS -->
      <section v-if="activeTab === 'settings'" class="view-content animate-fade">
        <div class="settings-dashboard">
          <div class="settings-card glass-card">
            <h3 class="font-heading">Thiết lập Chung</h3>
            <div class="setting-row">
              <div class="label">
                <span class="title">Chi phí cố định</span>
                <span class="desc">Tiền nhà, điện nước, bảo hiểm (Tháng)</span>
              </div>
              <div class="input-group">
                <input type="number" :value="store.monthlyExpenses" @input="store.updateMonthlyExpenses(Number($event.target.value))">
                <span class="unit">TWD</span>
              </div>
            </div>
          </div>

          <div class="settings-card glass-card">
            <h3 class="font-heading">Hoạt động & Mức lương</h3>
            <div class="activity-grid">
              <div v-for="type in store.activityTypes" :key="type.id" class="activity-config-box">
                <div class="box-top">
                  <span class="icon">{{ type.icon }}</span>
                  <input type="text" :value="type.name" @input="store.updateActivityType(type.id, { name: $event.target.value })">
                  <input type="color" :value="type.color" @input="store.updateActivityType(type.id, { color: $event.target.value })">
                </div>
                <div v-if="type.isWork" class="box-rate">
                  <Wallet :size="14" />
                  <input type="number" :value="type.rate" @input="store.updateActivityType(type.id, { rate: Number($event.target.value) })">
                  <span class="unit">TWD/h</span>
                </div>
              </div>
            </div>
          </div>

          <div class="danger-zone glass-card">
            <h3 class="font-heading">Vùng nguy hiểm</h3>
            <p>Dữ liệu đã xóa sẽ không thể khôi phục.</p>
            <button class="btn-danger" @click="store.clearAll()">Xóa sạch dữ liệu tuần</button>
          </div>
        </div>
      </section>

    </main>

    <!-- MOBILE NAV (SHOW ON MOBILE) -->
    <nav class="mobile-nav show-mobile">
      <button :class="{ 'active': activeTab === 'schedule' }" @click="activeTab = 'schedule'"><Calendar :size="20" /><span>Lịch</span></button>
      <button :class="{ 'active': activeTab === 'stats' }" @click="activeTab = 'stats'"><PieChart :size="20" /><span>Báo cáo</span></button>
      <button :class="{ 'active': activeTab === 'settings' }" @click="activeTab = 'settings'"><Settings :size="20" /><span>Cài đặt</span></button>
    </nav>

  </div>
</template>

<style scoped>
.app-layout {
  display: flex; height: 100vh; background: var(--bg); color: var(--text);
  max-width: 1600px; margin: 0 auto; overflow: hidden;
}

.main-viewport { flex: 1; display: flex; flex-direction: column; overflow-y: auto; padding: 1.5rem; gap: 1.5rem; }

/* Sidebar (PC Only) */
.sidebar-nav {
  width: 280px; background: rgba(10, 10, 15, 0.5); border-right: 1px solid var(--border);
  display: flex; flex-direction: column; padding: 2rem 1.5rem;
}
.sidebar-top .logo { display: flex; align-items: center; gap: 12px; margin-bottom: 3rem; }
.logo-icon {
  width: 36px; height: 36px; background: var(--primary); color: white; border-radius: 10px;
  display: grid; place-items: center; font-weight: 900; font-family: 'Lexend'; box-shadow: 0 4px 12px var(--primary-glow);
}
.logo span { font-size: 1.25rem; }

.sidebar-menu { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
.side-item {
  display: flex; align-items: center; gap: 12px; padding: 0.85rem 1.25rem; border-radius: 14px;
  background: transparent; border: none; color: var(--text-muted); cursor: pointer; transition: 0.2s;
  font-weight: 600; text-align: left;
}
.side-item:hover { background: rgba(255, 255, 255, 0.05); color: white; }
.side-item.active { background: var(--primary); color: white; box-shadow: 0 4px 15px var(--primary-glow); }

.sidebar-bottom .user-pill { padding: 1rem; border-radius: 20px; display: flex; align-items: center; gap: 12px; }
.avatar { width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; display: grid; place-items: center; font-weight: 800; }
.user-pill .name { display: block; font-weight: 700; font-size: 0.9rem; }
.user-pill .status { font-size: 0.7rem; color: var(--text-muted); }

/* Top Dashboard Bar */
.top-dashboard { padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; border-radius: 24px; }
.top-dashboard h1 { font-size: 1.5rem; }
.salary-display .label { font-size: 0.7rem; text-transform: uppercase; font-weight: 800; opacity: 0.6; }
.salary-display .val { font-size: 1.75rem; color: var(--secondary); display: flex; align-items: baseline; gap: 8px; }
.salary-display .currency { font-size: 0.85rem; opacity: 0.5; font-weight: 400; }

.quick-breakdown { display: flex; gap: 2rem; padding: 0 2rem; border-left: 1px solid var(--border); }
.mini-stat { display: flex; align-items: center; gap: 12px; }
.mini-stat .label { display: block; font-size: 0.65rem; font-weight: 700; color: var(--text-muted); }
.mini-stat .num { display: block; font-weight: 800; font-size: 1.1rem; }
.mini-stat.danger .num { color: var(--danger); }

/* Desktop Grid Schedule */
.desktop-grid-layout { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1rem; height: 100%; min-height: 600px; }
.grid-day-col { display: flex; flex-direction: column; gap: 1rem; background: rgba(0,0,0,0.1); border-radius: 20px; padding: 0.5rem; }
.col-header { 
  display: flex; flex-direction: column; align-items: center; padding: 1rem; border-radius: 16px; 
  background: var(--surface); position: relative; border: 1px solid var(--border);
}
.col-header.is-today { border-color: var(--primary); background: rgba(59, 130, 246, 0.1); }
.col-header.is-holiday { border-color: var(--accent); background: rgba(245, 158, 11, 0.05); }
.day-name { font-size: 0.85rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
.day-date { font-size: 1.25rem; font-weight: 900; font-family: 'Lexend'; }
.col-holiday-btn { position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: var(--text-muted); cursor: pointer; }
.is-holiday .col-holiday-btn { color: var(--accent); }

.col-cards { flex: 1; display: flex; flex-direction: column; gap: 0.75rem; overflow-y: auto; padding: 0.25rem; }
.mini-card { 
  background: rgba(30, 30, 35, 0.8); border-radius: 14px; border: 1px solid var(--border); padding: 0.75rem;
  border-left: 4px solid var(--accent); transition: 0.2s; cursor: grab;
}
.mini-card:hover { transform: scale(1.02); background: rgba(40, 40, 45, 0.9); }
.card-head { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; font-weight: 800; }
.card-head .time { flex: 1; opacity: 0.7; }
.card-head .del { background: transparent; border: none; color: var(--text-muted); opacity: 0.3; cursor: pointer; }
.card-head .del:hover { opacity: 1; color: var(--danger); }
.card-note { font-size: 0.65rem; color: var(--text-muted); margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.05); }

.add-mini-btn {
  width: 100%; padding: 0.5rem; border-radius: 12px; border: 1px dashed var(--border);
  background: transparent; color: var(--text-muted); font-size: 0.7rem; font-weight: 700; cursor: pointer;
}
.add-mini-btn:hover { border-color: var(--primary); color: var(--primary); background: rgba(59, 130, 246, 0.05); }

/* Mobile View Adjustments (Show on Mobile) */
.mobile-day-view { display: flex; flex-direction: column; gap: 1.5rem; }
.day-tabs { display: flex; gap: 0.5rem; overflow-x: auto; padding: 0.5rem 0; scrollbar-width: none; }
.day-tab { 
  flex: 0 0 55px; height: 70px; border-radius: 18px; border: 1px solid var(--border); background: var(--surface);
  display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;
}
.day-tab.active { background: var(--primary); border-color: var(--primary); color: white; }
.day-tab .abbr { font-size: 0.65rem; text-transform: uppercase; font-weight: 800; opacity: 0.6; }
.day-tab .num { font-size: 1.1rem; font-weight: 900; font-family: 'Lexend'; }

.active-pane { padding: 1.5rem; border-radius: 24px; min-height: 400px; position: relative; }
.pane-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.holiday-pill { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); font-size: 0.75rem; font-weight: 700; }
.holiday-pill.active { background: rgba(245, 158, 11, 0.1); border-color: var(--accent); color: var(--accent); }

.mobile-cards { display: flex; flex-direction: column; gap: 1rem; }
.full-card { padding: 1.25rem; border-radius: 20px; border-left: 5px solid var(--accent); }
.full-card .card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 1rem; }
.full-card .type-icon { font-size: 1.25rem; }
.full-card select { flex: 1; background: transparent; border: none; font-weight: 800; color: white; font-size: 1rem; }
.full-card .card-time { display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 12px; margin-bottom: 0.75rem; }
.full-card .card-time input { width: 80px; background: transparent; border: none; color: white; font-weight: 800; text-align: center; }
.full-card .card-note { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-muted); opacity: 0.6; }
.full-card .card-note input { background: transparent; border: none; color: var(--text-muted); font-size: 0.8rem; flex: 1; }

.fab-mobile { position: fixed; bottom: 100px; right: 20px; width: 64px; height: 64px; border-radius: 22px; background: var(--primary); color: white; box-shadow: 0 12px 24px var(--primary-glow); border: none; display: grid; place-items: center; }

/* Stats View (PC) */
.desktop-stats-layout { display: flex; gap: 2rem; }
.stats-sidebar { width: 320px; display: flex; flex-direction: column; gap: 1.5rem; }
.hero-card { padding: 2rem; border-radius: 24px; border: none; }
.hero-card.blue { background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); }
.hero-card.green { background: linear-gradient(135deg, #065f46 0%, #064e3b 100%); }
.hero-card .label { font-size: 0.8rem; font-weight: 700; opacity: 0.7; }
.hero-card h2 { font-size: 1.75rem; margin: 0.5rem 0; }
.hero-card p { font-size: 0.75rem; opacity: 0.6; }

.stats-main { flex: 1; display: flex; flex-direction: column; gap: 1.5rem; }
.chart-section, .milestones-section { padding: 1.5rem; border-radius: 24px; }
.chart-section h3, .milestones-section h3 { font-size: 1.1rem; margin-bottom: 1.5rem; }

.breakdown-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
.breakdown-box { display: flex; flex-direction: column; gap: 8px; }
.box-head { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 700; }
.box-head .val { margin-left: auto; color: var(--text-muted); }
.progress-bg { height: 6px; background: rgba(255, 255, 255, 0.05); border-radius: 3px; overflow: hidden; }
.progress-bar { height: 100%; border-radius: 3px; transition: width 1s ease; }

.food-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.food-item { display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.03); padding: 1.25rem; border-radius: 20px; border: 1px solid var(--border); }
.food-icon { font-size: 2rem; }
.food-info .name { display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); }
.food-info .count { font-size: 1.5rem; }

/* Settings View (PC) */
.settings-dashboard { display: flex; flex-direction: column; gap: 1.5rem; max-width: 800px; }
.settings-card { padding: 1.5rem; border-radius: 24px; }
.settings-card h3 { margin-bottom: 1.5rem; }
.setting-row { display: flex; justify-content: space-between; align-items: center; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
.setting-row .title { display: block; font-weight: 700; font-size: 1rem; }
.setting-row .desc { display: block; font-size: 0.75rem; color: var(--text-muted); }
.input-group { display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.3); padding: 10px 16px; border-radius: 12px; border: 1px solid var(--border); }
.input-group input { width: 100px; background: transparent; border: none; color: white; font-weight: 800; font-size: 1.25rem; text-align: center; }

.activity-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.activity-config-box { background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 20px; border: 1px solid var(--border); }
.box-top { display: flex; align-items: center; gap: 10px; margin-bottom: 1rem; }
.box-top input[type="text"] { flex: 1; background: transparent; border: none; border-bottom: 1px solid var(--border); color: white; font-weight: 700; }
.box-rate { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-muted); }
.box-rate input { width: 80px; background: rgba(0,0,0,0.2); border: none; color: white; font-weight: 800; text-align: center; border-radius: 6px; padding: 4px; }

.danger-zone { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); padding: 1.5rem; }
.btn-danger { margin-top: 1rem; padding: 0.85rem 1.5rem; border-radius: 14px; background: var(--danger); color: white; border: none; font-weight: 800; cursor: pointer; }

/* Mobile Navigation */
.mobile-nav { position: fixed; bottom: 0; left: 0; right: 0; height: 75px; background: rgba(10, 10, 15, 0.95); backdrop-filter: blur(20px); border-top: 1px solid var(--border); display: flex; justify-content: space-around; align-items: center; z-index: 100; }
.mobile-nav button { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; background: transparent; border: none; color: var(--text-muted); }
.mobile-nav button.active { color: var(--primary); }
.mobile-nav button span { font-size: 0.65rem; font-weight: 700; }

/* Responsive Utility */
.show-mobile { display: none !important; }
.hide-mobile { display: flex !important; }

@media (max-width: 1023px) {
  .sidebar-nav { display: none !important; }
  .hide-mobile { display: none !important; }
  .show-mobile { display: flex !important; }
  .main-viewport { padding: 1rem; padding-bottom: 80px; }
  .top-dashboard { padding: 1rem; }
  .app-layout { flex-direction: column; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade { animation: fadeIn 0.4s ease-out; }
</style>

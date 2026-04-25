<script setup>
import { ref, onMounted } from 'vue'
import { useScheduleStore } from '../../stores/schedule'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { 
  Clock, 
  Plus, 
  Trash2, 
  Settings, 
  X, 
  Palette, 
  Wallet, 
  Star,
  Gift,
  BookOpen,
  Briefcase,
  PieChart,
  StickyNote,
  CreditCard,
  TrendingDown,
  LayoutGrid,
  ChevronRight,
  Sparkles
} from 'lucide-vue-next'
import draggable from 'vuedraggable'

const store = useScheduleStore()
const showSettings = ref(false)
const activeDayIndex = ref(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

const getActivityType = (id) => {
  return store.activityTypes.find(t => t.id === id)
}

const handleAdd = (day) => {
  store.addAssignment(day)
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
  <div class="scheduler-container" :class="{ 'is-mounted': mounted }">
    <div id="scheduler-grid" class="glass-card main-dashboard animate-fade">
      
      <!-- Premium Header Bar -->
      <div class="dashboard-header">
        <div class="user-info">
          <div class="avatar-glow">
            <span class="user-avatar">K</span>
          </div>
          <div class="user-meta">
            <h3 class="font-heading">{{ store.userProfile.name }}'s Dashboard</h3>
            <p class="text-muted"><LayoutGrid :size="12" /> Taiwan Student Lifestyle</p>
          </div>
        </div>
        
        <div class="quick-stats">
          <!-- Food Milestones (Micro) -->
          <div class="milestones-track hide-mobile">
            <div class="milestone" title="Trà sữa"><span class="icon">🧋</span> <span class="count">{{ store.foodComparison.tea }}</span></div>
            <div class="milestone" title="Bento"><span class="icon">🍱</span> <span class="count">{{ store.foodComparison.bento }}</span></div>
            <div class="milestone" title="Mì bò"><span class="icon">🍜</span> <span class="count">{{ store.foodComparison.noodle }}</span></div>
          </div>

          <!-- Productivity Pills -->
          <div class="stat-pills">
            <div class="pill study" title="Giờ học tập">
              <BookOpen :size="14" /> <span>{{ store.calculateWeeklyStudyHours.toFixed(1) }}h</span>
            </div>
            <div class="pill work" :class="{ 'over': store.calculateWeeklyWorkHours > store.workLimit }" title="Giờ làm việc">
              <Briefcase :size="14" /> <span>{{ store.calculateWeeklyWorkHours.toFixed(1) }} / {{ store.workLimit }}h</span>
            </div>
            <div class="pill salary" title="Tổng lương tuần">
              <Wallet :size="14" /> <span>{{ Math.round(store.estimatedSalary).toLocaleString() }} <span class="unit">TWD</span></span>
            </div>
          </div>
          
          <button class="btn-icon-round" @click="showSettings = true" title="Thiết lập">
            <Settings :size="20" />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Tabs -->
      <div class="day-navigation">
        <button 
          v-for="(day, index) in store.weekDays" 
          :key="index"
          class="nav-tab"
          :class="{ 'active': activeDayIndex === index, 'holiday': store.isDayHoliday(day) }"
          @click="activeDayIndex = index"
        >
          <span class="day-abbr">{{ format(day, 'EEE', { locale: vi }) }}</span>
          <span class="day-num">{{ format(day, 'dd') }}</span>
          <div v-if="store.isDayHoliday(day)" class="holiday-indicator"></div>
        </button>
      </div>

      <!-- Grid Content Area -->
      <div class="grid-content">
        <div 
          v-for="(day, index) in store.weekDays" 
          :key="day.toString()" 
          class="day-pane"
          :class="{ 'active': activeDayIndex === index, 'holiday-theme': store.isDayHoliday(day) }"
        >
          <div class="pane-header">
            <div class="date-info">
              <h2 class="font-heading">{{ format(day, 'EEEE', { locale: vi }) }}</h2>
              <span class="date-sub">{{ format(day, 'dd MMMM, yyyy', { locale: vi }) }}</span>
            </div>
            
            <button 
              class="holiday-toggle-btn" 
              :class="{ 'is-active': store.isDayHoliday(day) }"
              @click="store.toggleHoliday(day)"
            >
              <Gift :size="16" />
              <span>{{ store.isDayHoliday(day) ? 'Lễ x2 Đang Bật' : 'Đánh dấu Ngày Lễ' }}</span>
            </button>
          </div>

          <draggable 
            :list="store.getAssignmentsByDay(day)"
            group="activities"
            item-key="id"
            class="cards-container"
            @add="(evt) => onAdd(evt, day)"
            :animation="250"
            ghost-class="ghost-card"
            handle=".drag-handle"
          >
            <template #item="{ element: act }">
              <div 
                class="activity-tile drag-handle"
                :style="{ '--tile-color': getActivityType(act.activityId)?.color }"
              >
                <div class="tile-header">
                  <div class="type-badge" :style="{ background: getActivityType(act.activityId)?.color + '20', color: getActivityType(act.activityId)?.color }">
                    {{ getActivityType(act.activityId)?.icon }}
                  </div>
                  <select :value="act.activityId" @change="handleUpdate(act.id, 'activityId', $event.target.value)" class="tile-select">
                    <option v-for="type in store.activityTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
                  </select>
                  <button class="tile-delete" @click="handleDelete(act.id)"><Trash2 :size="14" /></button>
                </div>

                <div class="tile-body">
                  <div class="tile-time">
                    <input type="time" :value="act.startTime" @change="handleUpdate(act.id, 'startTime', $event.target.value)">
                    <ChevronRight :size="14" class="time-sep" />
                    <input type="time" :value="act.endTime" @change="handleUpdate(act.id, 'endTime', $event.target.value)">
                  </div>
                  
                  <div class="tile-note">
                    <StickyNote :size="12" />
                    <input 
                      type="text" 
                      :value="act.notes" 
                      @input="handleUpdate(act.id, 'notes', $event.target.value)"
                      placeholder="Ghi chú nhanh..."
                    >
                  </div>
                </div>
              </div>
            </template>
          </draggable>

          <button class="btn-add-tile" @click="handleAdd(day)">
            <Plus :size="18" /> Thêm hoạt động
          </button>
        </div>
      </div>

      <!-- Footer Dashboard Analytics -->
      <div class="analytics-footer">
        <div class="analytics-header">
          <div class="title">
            <PieChart :size="18" />
            <span class="font-heading">Phân tích tuần này</span>
          </div>
          <div v-if="store.remainingSalary > 0" class="net-income-label">
            Lương còn dư: <span class="value">{{ Math.round(store.remainingSalary).toLocaleString() }} TWD</span>
          </div>
        </div>

        <div class="analytics-grid">
          <div v-for="type in store.activityBreakdown" :key="type.id" class="analytic-item">
            <div class="item-head">
              <span class="icon">{{ type.icon }}</span>
              <span class="label">{{ type.name }}</span>
              <span class="hours">{{ type.hours.toFixed(1) }}h</span>
            </div>
            <div class="progress-bar-bg">
              <div 
                class="progress-fill" 
                :style="{ width: (type.hours / 40 * 100) + '%', background: type.color }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Overlay -->
    <Teleport to="body">
      <div v-if="showSettings" class="modal-overlay" @click.self="showSettings = false">
        <div class="glass-card modal-panel animate-fade">
          <div class="panel-header">
            <h2 class="font-heading">Thiết lập cá nhân</h2>
            <button class="btn-icon-round" @click="showSettings = false"><X :size="20" /></button>
          </div>

          <div class="panel-body">
            <!-- Expenses -->
            <div class="panel-section">
              <label class="font-heading"><CreditCard :size="16" /> Chi phí cố định</label>
              <div class="input-glow-group">
                <input 
                  type="number" 
                  :value="store.monthlyExpenses" 
                  @input="store.updateMonthlyExpenses(Number($event.target.value))"
                  placeholder="Tiền nhà, bảo hiểm..."
                >
                <span class="suffix">TWD/Tháng</span>
              </div>
            </div>

            <!-- Activity Configuration -->
            <div class="panel-section">
              <label class="font-heading"><Sparkles :size="16" /> Hoạt động & Thu nhập</label>
              <div class="config-list">
                <div v-for="type in store.activityTypes" :key="type.id" class="config-item">
                  <div class="config-icon">{{ type.icon }}</div>
                  <div class="config-fields">
                    <div class="row">
                      <input type="text" :value="type.name" @input="store.updateActivityType(type.id, { name: $event.target.value })" class="name-edit">
                      <input type="color" :value="type.color" @input="store.updateActivityType(type.id, { color: $event.target.value })" class="color-edit">
                    </div>
                    <div v-if="type.isWork" class="row rate-row">
                      <Wallet :size="12" />
                      <input type="number" :value="type.rate" @input="store.updateActivityType(type.id, { rate: Number($event.target.value) })" class="rate-edit">
                      <span class="unit">TWD/h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button class="btn btn-primary w-full" @click="showSettings = false">Lưu thay đổi</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.scheduler-container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 1rem; }
.main-dashboard { padding: 0; border-radius: 24px; overflow: hidden; background: rgba(10, 10, 15, 0.7); }

/* Header Pro Max */
.dashboard-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.5rem 2rem; background: rgba(20, 20, 25, 0.6); border-bottom: 1px solid var(--border);
}

.user-info { display: flex; align-items: center; gap: 1.25rem; }
.avatar-glow {
  width: 48px; height: 48px; background: var(--primary); border-radius: 14px;
  display: grid; place-items: center; box-shadow: 0 0 20px var(--primary-glow);
}
.user-avatar { font-weight: 900; font-size: 1.5rem; color: white; font-family: 'Outfit'; }
.user-meta h3 { font-size: 1.2rem; margin: 0; }
.user-meta p { font-size: 0.75rem; display: flex; align-items: center; gap: 4px; margin-top: 2px; }

.quick-stats { display: flex; align-items: center; gap: 1.5rem; }
.milestones-track { display: flex; gap: 1rem; padding-right: 1.5rem; border-right: 1px solid var(--border); }
.milestone { display: flex; align-items: center; gap: 6px; font-weight: 800; font-size: 1.1rem; }
.milestone .count { font-size: 0.8rem; opacity: 0.8; }

.stat-pills { display: flex; gap: 0.75rem; }
.pill {
  display: flex; align-items: center; gap: 6px; padding: 0.5rem 0.8rem;
  background: rgba(255, 255, 255, 0.05); border-radius: 12px; border: 1px solid var(--border);
  font-weight: 700; font-size: 0.85rem; transition: var(--transition);
}
.pill.study { color: var(--primary); border-color: rgba(59, 130, 246, 0.2); }
.pill.work { color: var(--accent); border-color: rgba(245, 158, 11, 0.2); }
.pill.work.over { color: var(--danger); border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.1); }
.pill.salary { color: var(--secondary); border-color: rgba(16, 185, 129, 0.2); }
.pill.salary .unit { font-size: 0.65rem; opacity: 0.7; margin-left: 2px; }

.btn-icon-round {
  width: 42px; height: 42px; border-radius: 50%; background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border); color: var(--text); display: grid; place-items: center;
  cursor: pointer; transition: var(--transition);
}
.btn-icon-round:hover { background: rgba(255, 255, 255, 0.1); border-color: var(--text-muted); transform: rotate(45deg); }

/* Day Tabs Pro Max */
.day-navigation {
  display: flex; background: rgba(0, 0, 0, 0.3); padding: 0.75rem; gap: 0.5rem;
  border-bottom: 1px solid var(--border);
}
.nav-tab {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  padding: 0.6rem; border: none; background: transparent; cursor: pointer;
  border-radius: 12px; transition: var(--transition); position: relative;
}
.nav-tab.active { background: var(--primary); color: white; box-shadow: 0 4px 15px var(--primary-glow); }
.day-abbr { font-size: 0.65rem; text-transform: uppercase; font-weight: 800; opacity: 0.7; }
.day-num { font-size: 1.1rem; font-weight: 900; font-family: 'Outfit'; }
.holiday-indicator { position: absolute; top: 6px; right: 6px; width: 6px; height: 6px; background: var(--accent); border-radius: 50%; }

/* Grid Layout */
.grid-content { display: grid; grid-template-columns: repeat(7, 1fr); min-height: 550px; background: var(--border); gap: 1px; }
.day-pane { background: rgba(10, 10, 15, 0.6); display: flex; flex-direction: column; }
.pane-header { padding: 1.25rem 1rem; border-bottom: 1px solid var(--border); background: rgba(25, 25, 30, 0.4); }
.date-info h2 { font-size: 1rem; margin: 0; }
.date-sub { font-size: 0.65rem; color: var(--text-muted); }

.holiday-toggle-btn {
  margin-top: 0.75rem; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 6px; border-radius: 8px; border: 1px solid var(--border); background: rgba(255, 255, 255, 0.03);
  color: var(--text-muted); font-size: 0.7rem; font-weight: 700; cursor: pointer; transition: var(--transition);
}
.holiday-toggle-btn.is-active { background: rgba(245, 158, 11, 0.1); border-color: var(--accent); color: var(--accent); }

/* Activity Tiles */
.cards-container { padding: 1rem; display: flex; flex-direction: column; gap: 1rem; flex: 1; }
.activity-tile {
  background: rgba(30, 30, 35, 0.6); border-radius: 16px; border: 1px solid var(--border);
  padding: 0.85rem; cursor: grab; transition: var(--transition);
  border-left: 5px solid var(--tile-color);
}
.activity-tile:hover { transform: scale(1.02); background: rgba(40, 40, 45, 0.8); }

.tile-header { display: flex; align-items: center; gap: 8px; margin-bottom: 0.75rem; }
.type-badge { width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; font-size: 1rem; }
.tile-select { flex: 1; background: transparent; border: none; font-size: 0.85rem; font-weight: 700; color: white; cursor: pointer; }
.tile-delete { background: transparent; border: none; color: var(--text-muted); cursor: pointer; opacity: 0.3; transition: 0.2s; }
.tile-delete:hover { color: var(--danger); opacity: 1; }

.tile-time {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  background: rgba(0, 0, 0, 0.3); padding: 6px; border-radius: 10px; margin-bottom: 0.5rem;
}
.tile-time input { width: 60px; text-align: center; font-size: 0.85rem; font-weight: 700; background: transparent; border: none; padding: 0; }
.time-sep { opacity: 0.3; }

.tile-note { display: flex; align-items: center; gap: 6px; padding: 4px 8px; background: rgba(255, 255, 255, 0.03); border-radius: 6px; }
.tile-note input { flex: 1; background: transparent; border: none; font-size: 0.7rem; color: var(--text-muted); padding: 0; outline: none; }

.btn-add-tile {
  margin: 1rem; padding: 0.75rem; border-radius: 12px; border: 1px dashed var(--border);
  background: transparent; color: var(--text-muted); font-size: 0.8rem; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: 0.2s;
}
.btn-add-tile:hover { border-color: var(--primary); color: var(--primary); background: rgba(59, 130, 246, 0.05); }

/* Analytics Footer */
.analytics-footer { padding: 1.5rem 2rem; background: rgba(20, 20, 25, 0.8); border-top: 1px solid var(--border); }
.analytics-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.analytics-header .title { display: flex; align-items: center; gap: 8px; color: var(--primary); }
.net-income-label { font-size: 0.85rem; font-weight: 700; color: var(--secondary); background: rgba(16, 185, 129, 0.1); padding: 4px 12px; border-radius: 20px; }

.analytics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
.item-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 0.85rem; font-weight: 700; }
.item-head .hours { margin-left: auto; color: var(--text-muted); font-size: 0.75rem; }
.progress-bar-bg { height: 6px; background: rgba(255, 255, 255, 0.05); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 3px; transition: width 1s ease-out; }

/* Modal Panel */
.modal-panel { width: 100%; max-width: 500px; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
.panel-header { display: flex; justify-content: space-between; align-items: center; }
.panel-section { display: flex; flex-direction: column; gap: 0.75rem; }
.panel-section label { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--primary); }

.input-glow-group {
  display: flex; align-items: center; gap: 12px; background: rgba(255, 255, 255, 0.05);
  padding: 0.75rem 1rem; border-radius: 14px; border: 1px solid var(--border);
}
.input-glow-group input { flex: 1; background: transparent; border: none; color: white; font-size: 1.25rem; font-weight: 800; outline: none; }
.input-glow-group .suffix { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); }

.config-list { display: flex; flex-direction: column; gap: 1rem; }
.config-item { display: flex; gap: 1rem; background: rgba(255, 255, 255, 0.03); padding: 1rem; border-radius: 14px; border: 1px solid var(--border); }
.config-icon { width: 36px; height: 36px; background: rgba(0,0,0,0.3); border-radius: 10px; display: grid; place-items: center; font-size: 1.25rem; }
.config-fields { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.config-fields .row { display: flex; gap: 8px; align-items: center; }
.name-edit { flex: 1; background: transparent; border: none; border-bottom: 1px solid var(--border); color: white; font-weight: 600; padding: 2px 0; }
.color-edit { width: 30px; height: 30px; border: none; background: transparent; cursor: pointer; }
.rate-edit { width: 80px; background: rgba(0,0,0,0.3); border: none; color: white; font-weight: 800; padding: 4px; border-radius: 6px; text-align: center; }

/* Mobile Adaptations */
@media (max-width: 1024px) {
  .dashboard-header { padding: 1rem; }
  .grid-content { grid-template-columns: 1fr; }
  .day-pane { display: none; }
  .day-pane.active { display: flex; }
}

@media (max-width: 768px) {
  .quick-stats { gap: 0.5rem; }
  .milestones-track { display: none; }
  .user-info { gap: 0.75rem; }
  .user-meta h3 { font-size: 1rem; }
  .analytics-grid { grid-template-columns: 1fr 1fr; }
}
</style>

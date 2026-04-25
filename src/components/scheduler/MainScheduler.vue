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
  Sparkles,
  User,
  ArrowRight,
  LogOut,
  RefreshCw,
  Utensils,
  HelpCircle
} from 'lucide-vue-next'
import draggable from 'vuedraggable'
import confetti from 'canvas-confetti'

const store = useScheduleStore()
const showSettings = ref(false)
const showSetup = ref(false)
const showHelp = ref(false)
const setupStep = ref(1)
const setupForm = ref({
  name: store.userProfile.name === 'Kim' ? '' : store.userProfile.name,
  activities: JSON.parse(JSON.stringify(store.activityTypes))
})

const addSetupActivity = (isWork = true) => {
  setupForm.value.activities.push({
    id: 'setup-' + Math.random().toString(36).substr(2, 5),
    name: isWork ? 'Công việc mới' : 'Hoạt động mới',
    color: isWork ? '#10b981' : '#3b82f6',
    isWork,
    icon: isWork ? '💼' : '🎓',
    rate: isWork ? 185 : 0
  })
}

const removeSetupActivity = (id) => {
  if (setupForm.value.activities.length <= 1) return
  setupForm.value.activities = setupForm.value.activities.filter(a => a.id !== id)
}

const submitSetup = () => {
  store.completeSetup({ name: setupForm.value.name || 'Kim' }, setupForm.value.activities)
  showSetup.value = false
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 }
  })
}

const activeDayIndex = ref(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
  // Force show if name is default or flag is missing
  if (!store.hasSeenSetup || store.userProfile.name === 'Kim') {
    setTimeout(() => {
      showSetup.value = true
    }, 500)
  }
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

const handleLogout = () => {
  if (confirm('BẠN CÓ CHẮC CHẮN? Toàn bộ lịch trình và thiết lập cá nhân sẽ bị xóa vĩnh viễn.')) {
    localStorage.clear()
    window.location.reload()
  }
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
            <p class="text-muted"><LayoutGrid :size="12" /> Taiwan Lifestyle</p>
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
          
          <button class="btn-icon-round" @click="showHelp = true" title="Hướng dẫn">
            <HelpCircle :size="20" />
          </button>
          
          <button class="btn-icon-round" @click="showSettings = true" title="Thiết lập">
            <Settings :size="20" />
          </button>
          
          <button class="btn-icon-round btn-logout-header" @click="handleLogout" title="Đăng xuất & Xóa dữ liệu">
            <LogOut :size="20" />
          </button>
        </div>
      </div>


      <!-- Grid Content Area -->
      <div class="grid-content">
        <div 
          v-for="(day, index) in store.weekDays" 
          :key="day.toString()" 
          class="day-pane"
          :class="{ 'active': activeDayIndex === index }"
        >
          <div class="pane-header">
            <div class="date-info">
              <h2 class="font-heading">{{ format(day, 'EEEE', { locale: vi }) }}</h2>
              <span class="date-sub">{{ format(day, 'dd MMMM, yyyy', { locale: vi }) }}</span>
            </div>
          </div>

          <draggable 
            :list="store.getAssignmentsByDay(day)"
            group="activities"
            item-key="id"
            class="cards-container"
            @add="(evt) => onAdd(evt, day)"
            :animation="250"
            ghost-class="ghost-card"
          >
            <template #item="{ element: act }">
              <div 
                class="activity-tile"
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
                  
                  <div class="tile-actions-row">
                    <div class="tile-note">
                      <StickyNote :size="12" />
                      <input 
                        type="text" 
                        :value="act.notes" 
                        @input="handleUpdate(act.id, 'notes', $event.target.value)"
                        placeholder="Ghi chú..."
                      >
                    </div>
                    <button 
                      class="btn-recurring" 
                      :class="{ 'active': act.isRecurring }"
                      @click="handleUpdate(act.id, 'isRecurring', !act.isRecurring)"
                      title="Lặp lại hàng tuần"
                    >
                      <RefreshCw :size="12" />
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </draggable>

          <button class="list-add-btn" @click="handleAdd(day)">
            <Plus :size="16" /> Thêm thẻ
          </button>
        </div>
      </div>

      <!-- Footer Dashboard Analytics -->
      <div class="analytics-footer">
        <div class="analytics-header">
          <div class="title">
            <span class="font-heading">Phân tích tuần này</span>
          </div>
          
          <div class="food-recommendation" v-if="store.getFoodSuggestion(store.weekDays[activeDayIndex])">
            <div class="food-label">
              <Utensils :size="14" /> 
              <span>Gợi ý bữa tối {{ format(store.weekDays[activeDayIndex], 'EEEE', { locale: vi }) }}:</span>
            </div>
            <div class="food-value">
              <span class="food-icon">{{ store.getFoodSuggestion(store.weekDays[activeDayIndex]).icon }}</span>
              <span class="food-name">{{ store.getFoodSuggestion(store.weekDays[activeDayIndex]).name }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Unified Day Selector -->
      <div class="mobile-day-nav">
        <button 
          v-for="(day, index) in store.weekDays" 
          :key="index"
          class="day-nav-item"
          :class="{ 'active': activeDayIndex === index, 'holiday': store.isDayHoliday(day) }"
          @click="activeDayIndex = index"
        >
          <span class="day-short">{{ format(day, 'EEE', { locale: vi }) }}</span>
          <span class="day-num">{{ format(day, 'dd') }}</span>
          <div v-if="store.isDayHoliday(day)" class="holiday-dot"></div>
        </button>
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

    <Teleport to="body">
      <div v-if="showSetup" class="modal-overlay setup-overlay">
        <div class="glass-card setup-modal animate-pop">
          
          <div class="setup-progress">
            <div class="progress-segment" :class="{ 'active': setupStep >= 1 }"></div>
            <div class="progress-segment" :class="{ 'active': setupStep >= 2 }"></div>
          </div>

          <div v-if="setupStep === 1" class="setup-step animate-fade">
            <div class="setup-header">
              <div class="setup-icon"><User :size="32" /></div>
              <h2 class="font-heading">Chào mừng bạn!</h2>
              <p class="text-muted">Bắt đầu bằng việc cho mình biết tên của bạn.</p>
            </div>

            <div class="setup-body">
              <div class="setup-section">
                <label><User :size="16" /> Tên của bạn</label>
                <input v-model="setupForm.name" type="text" placeholder="Ví dụ: Kim">
              </div>
            </div>

            <div class="setup-footer">
              <button class="btn btn-primary btn-full" @click="setupStep = 2">
                Tiếp theo <ArrowRight :size="18" />
              </button>
            </div>
          </div>

          <div v-if="setupStep === 2" class="setup-step animate-fade">
            <div class="setup-header">
              <div class="setup-icon"><Sparkles :size="32" /></div>
              <h2 class="font-heading">Công việc & Học tập</h2>
              <p class="text-muted">Tùy chỉnh tên và mức lương cho các hoạt động của bạn.</p>
            </div>

            <div class="setup-body scrollable">
              <div class="activity-edit-list">
                <div v-for="act in setupForm.activities" :key="act.id" class="activity-edit-card">
                  <div class="card-top">
                    <span class="icon">{{ act.icon }}</span>
                    <input v-model="act.name" type="text" class="act-name-input">
                    <button class="btn-delete-setup" @click="removeSetupActivity(act.id)" v-if="setupForm.activities.length > 1">
                      <Trash2 :size="14" />
                    </button>
                  </div>
                  <div v-if="act.isWork" class="card-rate">
                    <Wallet :size="14" />
                    <input v-model.number="act.rate" type="number">
                    <span class="unit">TWD/h</span>
                  </div>
                </div>
              </div>
              
              <div class="setup-add-actions">
                <button class="btn btn-ghost btn-sm" @click="addSetupActivity(true)">
                  <Plus :size="14" /> Thêm Công việc
                </button>
                <button class="btn btn-ghost btn-sm" @click="addSetupActivity(false)">
                  <Plus :size="14" /> Thêm Hoạt động
                </button>
              </div>
            </div>

            <div class="setup-footer dual">
              <button class="btn btn-ghost" @click="setupStep = 1">Quay lại</button>
              <button class="btn btn-primary flex-1" @click="submitSetup">
                Hoàn tất <ArrowRight :size="18" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </Teleport>

    <!-- Help Modal -->
    <Teleport to="body">
      <div v-if="showHelp" class="modal-overlay" @click.self="showHelp = false">
        <div class="glass-card modal-panel help-panel animate-fade">
          <div class="panel-header">
            <h2 class="font-heading">Hướng dẫn sử dụng</h2>
            <button class="btn-icon-round" @click="showHelp = false"><X :size="20" /></button>
          </div>

          <div class="help-body scrollable">
            <div class="help-section">
              <div class="help-item">
                <div class="help-icon"><LayoutGrid :size="20" /></div>
                <div class="help-text">
                  <h4>Bảng Kanban mượt mà</h4>
                  <p>Kéo và thả các thẻ công việc để thay đổi lịch trình. Trên điện thoại, bạn có thể vuốt qua lại giữa các ngày.</p>
                </div>
              </div>

              <div class="help-item">
                <div class="help-icon"><RefreshCw :size="20" /></div>
                <div class="help-text">
                  <h4>Công việc lặp lại (Recurring)</h4>
                  <p>Bật biểu tượng 🔄 trên thẻ để công việc đó tự động xuất hiện ở mọi tuần tiếp theo. Tiết kiệm thời gian nhập liệu!</p>
                </div>
              </div>

              <div class="help-item">
                <div class="help-icon"><ArrowRight :size="20" /></div>
                <div class="help-text">
                  <h4>Copy sang tuần sau</h4>
                  <p>Sử dụng nút 📑 trên thanh Menu để sao chép toàn bộ lịch trình tuần này sang tuần tới chỉ trong 1 giây.</p>
                </div>
              </div>

              <div class="help-item">
                <div class="help-icon"><Utensils :size="20" /></div>
                <div class="help-text">
                  <h4>Gợi ý món ăn Đài Loan</h4>
                  <p>Dựa trên thu nhập trong ngày, hệ thống sẽ gợi ý bữa tối phù hợp (từ cơm nắm 🍙 đến Haidilao 🔥) ở phần Phân tích.</p>
                </div>
              </div>

              <div class="help-item">
                <div class="help-icon"><Settings :size="20" /></div>
                <div class="help-text">
                  <h4>Thiết lập linh hoạt</h4>
                  <p>Vào phần Cài đặt để thêm bớt các loại công việc, đổi màu sắc hoặc điều chỉnh mức lương TWD/h của bạn.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="panel-footer">
            <button class="btn btn-primary w-full" @click="showHelp = false">Đã hiểu!</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Settings Overlay -->
    <Teleport to="body">
      <div v-if="showSettings" class="modal-overlay" @click.self="showSettings = false">
        <div class="glass-card modal-panel animate-fade">
          <div class="panel-header">
            <h2 class="font-heading">Thiết lập cá nhân</h2>
            <button class="btn-icon-round" @click="showSettings = false"><X :size="20" /></button>
          </div>

          <div class="panel-body">
            <!-- Activity Configuration -->
            <div class="panel-section">
              <div class="section-header-row">
                <label class="font-heading"><Sparkles :size="16" /> Hoạt động & Thu nhập</label>
                <div class="header-actions">
                  <button class="btn-add-mini" @click="store.addActivityType(true)" title="Thêm Công việc"><Plus :size="14" /></button>
                </div>
              </div>
              <div class="config-list">
                <div v-for="type in store.activityTypes" :key="type.id" class="config-item">
                  <div class="config-icon">{{ type.icon }}</div>
                  <div class="config-fields">
                    <div class="row">
                      <input type="text" :value="type.name" @input="store.updateActivityType(type.id, { name: $event.target.value })" class="name-edit">
                      <input type="color" :value="type.color" @input="store.updateActivityType(type.id, { color: $event.target.value })" class="color-edit">
                      <button class="btn-delete-mini" @click="store.removeActivityType(type.id)"><Trash2 :size="14" /></button>
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
          
          <div class="panel-footer">
            <button class="btn btn-primary w-full" @click="showSettings = false">Lưu thay đổi</button>
            <button class="btn btn-danger-outline w-full logout-panel-btn" @click="handleLogout">
              <LogOut :size="16" /> Đăng xuất & Xóa dữ liệu
            </button>
          </div>
        </div>
      </div>
    </Teleport>
</template>

<style scoped>
.scheduler-container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 1rem; }
.main-dashboard { padding: 0; border-radius: 24px; overflow: hidden; background: rgba(10, 10, 15, 0.7); }

/* Header Pro Max */
.dashboard-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 2.5rem; background: rgba(10, 10, 15, 0.4); border-bottom: 1px solid var(--border);
}

.user-info { display: flex; align-items: center; gap: 1.5rem; }
.avatar-glow {
  width: 56px; height: 56px; background: var(--magic); border-radius: 18px;
  display: grid; place-items: center; box-shadow: 0 0 30px var(--primary-glow);
  position: relative;
}
.avatar-glow::before {
  content: ''; position: absolute; inset: -4px; background: var(--magic); 
  border-radius: 20px; filter: blur(12px); opacity: 0.3;
}
.user-avatar { font-size: 1.5rem; font-weight: 900; color: white; position: relative; z-index: 1; }
.user-meta h3 { font-size: 1.4rem; margin-bottom: 2px; }
.user-meta p { font-size: 0.8rem; font-weight: 600; opacity: 0.6; display: flex; align-items: center; gap: 6px; }

.quick-stats { display: flex; align-items: center; gap: 1.5rem; }
.milestones-track { display: flex; gap: 1rem; padding-right: 1.5rem; border-right: 1px solid var(--border); }
.milestone { display: flex; align-items: center; gap: 6px; font-weight: 800; font-size: 1.1rem; }
.milestone .count { font-size: 0.8rem; opacity: 0.8; }

.stat-pills { display: flex; gap: 8px; }
.pill { 
  display: flex; align-items: center; gap: 6px; padding: 0.6rem 1rem; 
  background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border); border-radius: 12px;
  font-weight: 700; font-size: 0.85rem; transition: 0.3s;
}
.pill:hover { border-color: var(--border-bright); background: rgba(255, 255, 255, 0.08); }
.pill.study { color: var(--primary); border-color: rgba(59, 130, 246, 0.2); }
.pill.work { color: var(--accent); border-color: rgba(245, 158, 11, 0.2); }
.pill.work.over { color: var(--danger); border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.1); }
.pill.salary { background: rgba(16, 185, 129, 0.1); color: var(--secondary); border-color: rgba(16, 185, 129, 0.2); }
.pill.salary .unit { font-size: 0.6rem; opacity: 0.6; margin-left: 2px; }

.btn-icon-round {
  width: 44px; height: 44px; border-radius: 14px; border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.05); color: white; display: grid; place-items: center;
  cursor: pointer; transition: var(--transition);
}
.btn-icon-round:hover { background: rgba(255, 255, 255, 0.1); border-color: var(--border-bright); transform: rotate(45deg); }
.btn-logout-header { color: #ef4444; border-color: rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.05); }
.btn-logout-header:hover { background: var(--danger) !important; border-color: var(--danger) !important; color: white !important; transform: translateX(3px) rotate(0deg) !important; }

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
.day-num { font-size: 1.1rem; font-weight: 900; font-family: var(--font-heading); }
.holiday-indicator { position: absolute; top: 6px; right: 6px; width: 6px; height: 6px; background: var(--accent); border-radius: 50%; }

/* Trello-style Grid Layout Pro Max */
.grid-content { 
  display: flex; gap: 2rem; padding: 2.5rem; 
  overflow-x: auto; min-height: 750px;
  background: var(--bg); scroll-behavior: smooth;
  scrollbar-width: none;
}
.grid-content::-webkit-scrollbar { display: none; }

.day-pane { 
  min-width: 320px; width: 320px; 
  background: var(--surface); backdrop-filter: blur(20px);
  border-radius: 28px; display: flex; flex-direction: column;
  border: 1px solid var(--border); transition: var(--transition);
  height: fit-content; max-height: 100%; overflow: hidden;
}
.day-pane:hover { border-color: var(--border-bright); background: var(--glass-hover); }

.pane-header { 
  padding: 1.5rem; border-bottom: 1px solid var(--border); 
  background: rgba(255, 255, 255, 0.02);
}
.date-info h2 { font-size: 1.1rem; margin-bottom: 4px; font-family: var(--font-heading); color: white; font-weight: 800; }
.date-sub { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

/* Activity Tiles (Cards) Pro Max */
.cards-container { 
  padding: 1rem; display: flex; flex-direction: column; 
  gap: 1.25rem; flex: 1; min-height: 100px;
}
.activity-tile {
  background: rgba(255, 255, 255, 0.04); border-radius: 20px;
  border: 1px solid var(--border); padding: 1.25rem;
  cursor: grab; transition: var(--transition);
  border-top: 4px solid var(--tile-color);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  position: relative; overflow: hidden;
}
.activity-tile:hover { 
  transform: translateY(-4px) scale(1.02);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  border-color: var(--tile-color);
}
.ghost-card {
  opacity: 0.4;
  background: var(--primary) !important;
  border: 2px dashed white !important;
}

.list-add-btn {
  margin: 0.5rem 0.75rem 1rem;
  padding: 0.75rem;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: 0.2s;
  text-align: left;
}
.list-add-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.tile-actions-row { display: flex; align-items: center; gap: 8px; }
.btn-recurring { 
  width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--border); 
  background: rgba(255, 255, 255, 0.05); color: var(--text-muted); cursor: pointer; transition: 0.2s;
  display: grid; place-items: center;
}
.btn-recurring:hover { border-color: var(--primary); color: var(--primary); }
.btn-recurring.active { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 0 10px var(--primary-glow); }

/* Food Recommendation Style */
.food-recommendation { 
  display: flex; align-items: center; gap: 12px; padding: 6px 12px; 
  background: rgba(255, 255, 255, 0.05); border-radius: 12px; border: 1px solid var(--border);
  font-size: 0.85rem;
}
.food-label { display: flex; align-items: center; gap: 6px; color: var(--text-muted); font-weight: 600; }
.food-value { display: flex; align-items: center; gap: 6px; color: var(--secondary); font-weight: 800; }
.food-icon { font-size: 1.1rem; }

/* Analytics Footer */
.analytics-footer { 
  padding: 3rem; background: rgba(8, 8, 12, 0.85); 
  border-top: 1px solid var(--border); backdrop-filter: blur(40px);
}
.analytics-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
.analytics-header .title { display: flex; align-items: center; gap: 15px; }
.analytics-header .title span { font-size: 1.75rem; letter-spacing: -0.05em; font-weight: 800; color: var(--primary); }

.analytics-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem;
}

.ana-card {
  background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border);
  border-radius: 20px; padding: 1.5rem; transition: 0.3s cubic-bezier(0.2, 1, 0.3, 1);
}
.ana-card:hover { 
  border-color: var(--border-bright); background: rgba(255, 255, 255, 0.06); 
  transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.4);
}
.ana-card .label { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); margin-bottom: 10px; display: block; text-transform: uppercase; letter-spacing: 0.08em; }
.ana-card .value { font-size: 1.6rem; font-weight: 900; font-family: var(--font-heading); color: white; }
.ana-card .bar-bg { height: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; margin-top: 15px; overflow: hidden; }
.ana-card .bar-fill { height: 100%; background: var(--magic); transition: 1.5s cubic-bezier(0.2, 1, 0.3, 1); }

/* Help Panel Specifics */
.help-panel { max-width: 580px; }
.help-section { display: flex; flex-direction: column; gap: 1.5rem; }
.help-item { display: flex; gap: 1.25rem; align-items: flex-start; }
.help-icon { 
  width: 44px; height: 44px; background: var(--magic); border-radius: 12px; 
  display: grid; place-items: center; color: white; flex-shrink: 0;
  box-shadow: 0 5px 15px var(--primary-glow);
}
.help-text h4 { font-size: 1.1rem; margin-bottom: 4px; color: white; }
.help-text p { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; }

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

.panel-footer { display: flex; flex-direction: column; gap: 0.75rem; }
.btn-danger-outline { 
  background: transparent; border: 1px solid rgba(239, 68, 68, 0.3); color: var(--danger); 
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-danger-outline:hover { background: rgba(239, 68, 68, 0.1); border-color: var(--danger); }

/* Mobile Adaptations */
.mobile-day-nav { display: none; }

@media (max-width: 1024px) {
  .dashboard-header { padding: 1rem; border-bottom: 1px solid var(--border); }
  
  .mobile-day-nav {
    display: flex;
    gap: 8px;
    padding: 0.75rem;
    overflow-x: auto;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(10px);
  }

  .day-nav-item {
    flex: 1;
    min-width: 48px;
    height: 56px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--glass);
    border: 1px solid var(--border);
    border-radius: 14px;
    color: var(--text-muted);
    cursor: pointer;
    transition: 0.2s;
  }

  .day-nav-item .day-short { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; }
  .day-nav-item .day-num { font-size: 1.1rem; font-weight: 900; font-family: var(--font-heading); }

  .day-nav-item.active {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
    box-shadow: 0 4px 15px var(--primary-glow);
    transform: translateY(-2px);
  }

  .grid-content { 
    display: block; 
    padding: 0.5rem;
    overflow-x: hidden;
  }
  .day-pane { 
    width: 100%; 
    min-width: 100%;
    display: none; 
    border: none;
    background: transparent;
  }
  .day-pane.active { display: flex; }
  .pane-header { display: none; }
  
  .holiday-dot { position: absolute; top: 4px; right: 4px; width: 6px; height: 6px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 5px var(--accent); }

  /* Compact Tiles for Mobile */
  .activity-tile { 
    padding: 0.75rem; 
    border-radius: 12px;
  }
  .tile-header { margin-bottom: 0.5rem; }
  .type-badge { width: 24px; height: 24px; font-size: 0.85rem; }
  .tile-select { font-size: 0.8rem; }
  .tile-time { margin-bottom: 0.35rem; padding: 4px; border-radius: 8px; }
  .tile-time input { font-size: 0.75rem; width: 50px; }
  .tile-note { padding: 4px; border-radius: 6px; }
  .tile-note input { font-size: 0.65rem; }

  .analytics-footer { padding: 1rem; }
  .analytics-grid { grid-template-columns: 1fr; gap: 0.75rem; }
}

@media (max-width: 768px) {
  .quick-stats { gap: 0.5rem; }
  .milestones-track { display: none; }
  .user-info { gap: 0.5rem; }
  .user-meta h3 { font-size: 0.9rem; }
  .pill span { font-size: 0.7rem; }
  .pill .unit { display: none; }
  .analytics-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .net-income-label { width: 100%; text-align: center; font-size: 0.75rem; }
}

/* Setup Modal Specifics */
.setup-overlay { z-index: 1000; background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(20px); }
.setup-modal { width: 100%; max-width: 480px; padding: 2.5rem; display: flex; flex-direction: column; gap: 2rem; border-color: rgba(255, 255, 255, 0.15); }
.setup-header { text-align: center; }
.setup-icon { width: 64px; height: 64px; background: var(--primary); border-radius: 20px; display: grid; place-items: center; margin: 0 auto 1.5rem; color: white; box-shadow: 0 8px 32px var(--primary-glow); }
.setup-header h2 { font-size: 1.75rem; margin-bottom: 0.5rem; }

.setup-section { display: flex; flex-direction: column; gap: 0.75rem; }
.setup-section input { width: 100%; padding: 1rem; font-size: 1.1rem; font-weight: 700; border-radius: 14px; }
.input-with-unit { position: relative; display: flex; align-items: center; }
.input-with-unit .unit-text { position: absolute; right: 1rem; font-weight: 800; font-size: 0.75rem; opacity: 0.5; }

.setup-progress { display: flex; gap: 8px; margin-bottom: 2rem; }
.progress-segment { flex: 1; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; transition: 0.3s; }
.progress-segment.active { background: var(--primary); box-shadow: 0 0 10px var(--primary-glow); }

.setup-body.scrollable { max-height: 400px; overflow-y: auto; padding-right: 10px; margin: -10px; padding: 10px; }
.activity-edit-list { display: flex; flex-direction: column; gap: 1rem; }
.activity-edit-card { background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 18px; border: 1px solid var(--border); transition: 0.2s; }
.activity-edit-card:focus-within { border-color: var(--primary); background: rgba(255,255,255,0.05); }
.card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.card-top .icon { font-size: 1.5rem; width: 40px; height: 40px; background: rgba(0,0,0,0.2); border-radius: 10px; display: grid; place-items: center; }
.act-name-input { flex: 1; background: transparent; border: none; font-size: 1.1rem; font-weight: 700; color: white; padding: 0; }
.card-rate { display: flex; align-items: center; gap: 8px; padding-left: 52px; color: var(--text-muted); font-size: 0.8rem; }
.card-rate input { width: 80px; background: rgba(0,0,0,0.2); border: none; padding: 4px 8px; border-radius: 6px; text-align: center; font-weight: 800; color: var(--accent); }

.btn-delete-setup { background: transparent; border: none; color: var(--text-muted); opacity: 0.3; cursor: pointer; transition: 0.2s; }
.btn-delete-setup:hover { color: var(--danger); opacity: 1; }

.setup-add-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
.btn-sm { padding: 0.5rem 0.75rem; font-size: 0.8rem; border-radius: 10px; }

.section-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.btn-add-mini, .btn-delete-mini { 
  width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; 
  background: var(--glass); border: 1px solid var(--border); color: var(--text-muted); cursor: pointer; transition: 0.2s;
}
.btn-add-mini:hover { border-color: var(--primary); color: var(--primary); background: rgba(59, 130, 246, 0.1); }
.btn-delete-mini:hover { border-color: var(--danger); color: var(--danger); background: rgba(239, 68, 68, 0.1); }

.setup-footer.dual { display: flex; gap: 1rem; }
.flex-1 { flex: 1; }

.animate-pop { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes popIn {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>

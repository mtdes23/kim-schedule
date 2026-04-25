import { defineStore } from 'pinia'
import { startOfWeek, addDays, isSameDay, parseISO, format, differenceInMinutes, parse, addWeeks } from 'date-fns'

export const useScheduleStore = defineStore('schedule', {
  state: () => {
    // Migration: Ensure all activity types have a rate
    const savedTypes = JSON.parse(localStorage.getItem('kim-activity-types')) || []
    const defaultTypes = [
      { id: 'school', name: 'Đi học', color: '#3b82f6', isWork: false, icon: '🎓', rate: 0 },
      { id: 'job1', name: 'Công việc 1', color: '#10b981', isWork: true, icon: '💼', rate: 185 },
      { id: 'job2', name: 'Công việc 2', color: '#f59e0b', isWork: true, icon: '🛠', rate: 185 },
      { id: 'job3', name: 'Công việc 3', color: '#ef4444', isWork: true, icon: '🛒', rate: 185 }
    ]

    const activityTypes = savedTypes.length > 0 
      ? savedTypes.map(t => ({ ...defaultTypes.find(d => d.id === t.id) || {}, ...t, rate: t.rate ?? 0 }))
      : defaultTypes

    return {
      userProfile: JSON.parse(localStorage.getItem('kim-user-profile')) || { name: 'Kim', position: 'Personal' },
      hasSeenSetup: JSON.parse(localStorage.getItem('kim-has-seen-setup')) || false,
      foodPrices: { tea: 60, bento: 100, noodle: 180 },
      activityTypes,
      assignments: JSON.parse(localStorage.getItem('kim-range-assignments')) || [],
      holidays: JSON.parse(localStorage.getItem('kim-holidays')) || [],
      currentWeekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
      foodSuggestions: [
        { min: 0, max: 100, name: 'Cơm nắm 7-11 / Trà trứng', icon: '🍙' },
        { min: 101, max: 200, name: 'Bento siêu thị / Mì tôm', icon: '🍱' },
        { min: 201, max: 500, name: 'Mì bò / Cơm thịt kho (Lu Rou Fan)', icon: '🍜' },
        { min: 501, max: 1000, name: 'Lẩu mini / Gà rán Shilin', icon: '🍲' },
        { min: 1001, max: 9999, name: 'Lẩu Haidilao / Buffet khách sạn', icon: '🔥' }
      ]
    }
  },

  getters: {
    weekDays: (state) => {
      const days = []
      for (let i = 0; i < 7; i++) {
        days.push(addDays(state.currentWeekStart, i))
      }
      return days
    },

    workLimit: (state) => {
      return 48
    },

    calculateWeeklyWorkHours: (state) => {
      const weekAssignments = state.assignments.filter(a => {
        const date = parseISO(a.date)
        return date >= state.currentWeekStart && date <= addDays(state.currentWeekStart, 6)
      })

      return weekAssignments.reduce((total, a) => {
        const type = state.activityTypes.find(t => t.id === a.activityId)
        if (type && type.isWork) {
          try {
            const start = parse(a.startTime, 'HH:mm', new Date())
            const end = parse(a.endTime, 'HH:mm', new Date())
            return total + (differenceInMinutes(end, start) / 60)
          } catch (e) { return total }
        }
        return total
      }, 0)
    },

    calculateWeeklyStudyHours: (state) => {
      const weekAssignments = state.assignments.filter(a => {
        const date = parseISO(a.date)
        return date >= state.currentWeekStart && date <= addDays(state.currentWeekStart, 6)
      })

      return weekAssignments.reduce((total, a) => {
        const type = state.activityTypes.find(t => t.id === a.activityId)
        if (type && !type.isWork) {
          try {
            const start = parse(a.startTime, 'HH:mm', new Date())
            const end = parse(a.endTime, 'HH:mm', new Date())
            return total + (differenceInMinutes(end, start) / 60)
          } catch (e) { return total }
        }
        return total
      }, 0)
    },

    activityBreakdown: (state) => {
      const weekAssignments = state.assignments.filter(a => {
        const date = parseISO(a.date)
        return date >= state.currentWeekStart && date <= addDays(state.currentWeekStart, 6)
      })

      return state.activityTypes.map(type => {
        const hours = weekAssignments
          .filter(a => a.activityId === type.id)
          .reduce((total, a) => {
            try {
              const start = parse(a.startTime, 'HH:mm', new Date())
              const end = parse(a.endTime, 'HH:mm', new Date())
              return total + (differenceInMinutes(end, start) / 60)
            } catch (e) { return total }
          }, 0)
        return { ...type, hours }
      })
    },

    estimatedSalary: (state) => {
      const weekAssignments = state.assignments.filter(a => {
        const date = parseISO(a.date)
        return date >= state.currentWeekStart && date <= addDays(state.currentWeekStart, 6)
      })

      return weekAssignments.reduce((total, a) => {
        const type = state.activityTypes.find(t => t.id === a.activityId)
        if (type && type.isWork) {
          try {
            const start = parse(a.startTime, 'HH:mm', new Date())
            const end = parse(a.endTime, 'HH:mm', new Date())
            const hours = differenceInMinutes(end, start) / 60
            const isHoliday = state.holidays.some(h => isSameDay(parseISO(h), parseISO(a.date)))
            const multiplier = isHoliday ? 2 : 1
            const rate = Number(type.rate) || 0
            return total + (hours * rate * multiplier)
          } catch (e) { return total }
        }
        return total
      }, 0)
    },

    remainingSalary: (state) => {
      return state.estimatedSalary || 0
    },

    foodComparison: (state) => {
      const salary = state.estimatedSalary || 0
      return {
        tea: Math.floor(salary / state.foodPrices.tea) || 0,
        bento: Math.floor(salary / state.foodPrices.bento) || 0,
        noodle: Math.floor(salary / state.foodPrices.noodle) || 0
      }
    }
  },

  actions: {
    getAssignmentsByDay(date) {
      if (!date) return []
      const dayOfWeek = date.getDay()
      
      // Get normal assignments for this specific date
      const normal = this.assignments.filter(a => !a.isRecurring && isSameDay(parseISO(a.date), date))
      
      // Get recurring assignments for this day of week
      const recurring = this.assignments.filter(a => a.isRecurring && parseISO(a.date).getDay() === dayOfWeek)
      
      return [...normal, ...recurring].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
    },

    getDailyEarnings(date) {
      const dayAssignments = this.getAssignmentsByDay(date)
      return dayAssignments.reduce((total, a) => {
        const type = this.activityTypes.find(t => t.id === a.activityId)
        if (type && type.isWork) {
          const start = parse(a.startTime, 'HH:mm', new Date())
          const end = parse(a.endTime, 'HH:mm', new Date())
          const hours = differenceInMinutes(end, start) / 60
          return total + (hours * (Number(type.rate) || 0))
        }
        return total
      }, 0)
    },

    getFoodSuggestion(date) {
      const earnings = this.getDailyEarnings(date)
      return this.foodSuggestions.find(f => earnings >= f.min && earnings <= f.max) || this.foodSuggestions[0]
    },

    isDayHoliday(date) {
      if (!date) return false
      return this.holidays.some(h => isSameDay(parseISO(h), date))
    },

    toggleHoliday(date) {
      if (!date) return
      const dateStr = date.toISOString()
      const index = this.holidays.findIndex(h => isSameDay(parseISO(h), date))
      if (index > -1) {
        this.holidays.splice(index, 1)
      } else {
        this.holidays.push(dateStr)
      }
      localStorage.setItem('kim-holidays', JSON.stringify(this.holidays))
    },

    updateActivityType(id, updates) {
      const index = this.activityTypes.findIndex(t => t.id === id)
      if (index > -1) {
        this.activityTypes[index] = { ...this.activityTypes[index], ...updates }
        localStorage.setItem('kim-activity-types', JSON.stringify(this.activityTypes))
      }
    },

    addActivityType(isWork = true) {
      const newId = 'act-' + Math.random().toString(36).substr(2, 5)
      this.activityTypes.push({
        id: newId,
        name: isWork ? 'Công việc mới' : 'Hoạt động mới',
        color: isWork ? '#10b981' : '#3b82f6',
        isWork,
        icon: isWork ? '💼' : '🎓',
        rate: isWork ? 185 : 0
      })
      localStorage.setItem('kim-activity-types', JSON.stringify(this.activityTypes))
    },

    removeActivityType(id) {
      if (this.activityTypes.length <= 1) {
        alert('Cần có ít nhất một loại hoạt động.')
        return
      }
      if (confirm('Xóa loại hoạt động này? Tất cả lịch trình liên quan sẽ bị xóa.')) {
        this.activityTypes = this.activityTypes.filter(t => t.id !== id)
        this.assignments = this.assignments.filter(a => a.activityId !== id)
        localStorage.setItem('kim-activity-types', JSON.stringify(this.activityTypes))
        this.saveToLocal()
      }
    },

    addAssignment(date, activityId = 'school') {
      this.assignments.push({
        id: Math.random().toString(36).substr(2, 9),
        date: date.toISOString(),
        startTime: '08:00',
        endTime: '12:00',
        activityId,
        notes: ''
      })
      this.saveToLocal()
    },

    updateAssignment(id, updates) {
      const index = this.assignments.findIndex(a => a.id === id)
      if (index > -1) {
        this.assignments[index] = { ...this.assignments[index], ...updates }
        this.saveToLocal()
      }
    },

    moveAssignment(id, newDate) {
      const index = this.assignments.findIndex(a => a.id === id)
      if (index > -1) {
        this.assignments[index].date = newDate.toISOString()
        this.saveToLocal()
      }
    },

    removeAssignment(id) {
      this.assignments = this.assignments.filter(a => a.id !== id)
      this.saveToLocal()
    },

    autoSchedule() {
      const maxWeeklyHours = this.workLimit
      const jobs = this.activityTypes.filter(t => t.isWork).map(t => t.id)
      if (jobs.length === 0) return
      let jobIndex = 0

      this.weekDays.forEach(day => {
        const dayAssignments = this.getAssignmentsByDay(day)
        if (dayAssignments.length === 0) {
          const currentTotal = this.calculateWeeklyWorkHours
          if (currentTotal < maxWeeklyHours) {
            this.addAssignment(day, jobs[jobIndex % jobs.length])
            const last = this.assignments[this.assignments.length - 1]
            last.startTime = '08:00'
            last.endTime = '12:00'
            jobIndex++
          }
        }
      })
      this.saveToLocal()
    },

    clearAll() {
      if (confirm('Xóa hết lịch trình tuần này?')) {
        this.assignments = this.assignments.filter(a => {
          const date = parseISO(a.date)
          return date < this.currentWeekStart || date > addDays(this.currentWeekStart, 6)
        })
        this.saveToLocal()
      }
    },

    copyToNextWeek() {
      const nextWeekStart = addWeeks(this.currentWeekStart, 1)
      const nextWeekEnd = addDays(nextWeekStart, 6)
      
      // Filter current week assignments
      const currentWeekAssignments = this.assignments.filter(a => {
        const date = parseISO(a.date)
        return date >= this.currentWeekStart && date <= addDays(this.currentWeekStart, 6)
      })

      if (currentWeekAssignments.length === 0) {
        alert('Tuần này chưa có lịch để copy.')
        return
      }

      if (confirm(`Copy ${currentWeekAssignments.length} thẻ sang tuần tiếp theo (${format(nextWeekStart, 'dd/MM')} - ${format(nextWeekEnd, 'dd/MM')})?`)) {
        // Remove existing in next week
        this.assignments = this.assignments.filter(a => {
          const date = parseISO(a.date)
          return date < nextWeekStart || date > nextWeekEnd
        })

        // Add cloned ones
        const newAssignments = currentWeekAssignments.map(a => ({
          ...a,
          id: Math.random().toString(36).substr(2, 9),
          date: addWeeks(parseISO(a.date), 1).toISOString()
        }))

        this.assignments.push(...newAssignments)
        this.saveToLocal()
        this.setWeek(nextWeekStart)
      }
    },

    saveToLocal() {
      localStorage.setItem('kim-range-assignments', JSON.stringify(this.assignments))
    },

    setWeek(date) {
      this.currentWeekStart = startOfWeek(date, { weekStartsOn: 1 })
    },

    completeSetup(profile, activities) {
      this.userProfile = { ...this.userProfile, ...profile }
      
      // Update all activity types
      if (activities && Array.isArray(activities)) {
        this.activityTypes = activities.map(a => ({
          ...a,
          rate: Number(a.rate) || 0
        }))
        localStorage.setItem('kim-activity-types', JSON.stringify(this.activityTypes))
      }

      this.hasSeenSetup = true
      localStorage.setItem('kim-user-profile', JSON.stringify(this.userProfile))
      localStorage.setItem('kim-has-seen-setup', JSON.stringify(true))
    }
  }
})

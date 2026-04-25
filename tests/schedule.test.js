import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useScheduleStore } from '../src/stores/schedule'
import { startOfWeek, format } from 'date-fns'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString() }),
    clear: vi.fn(() => { store = {} })
  }
})()
vi.stubGlobal('localStorage', localStorageMock)
vi.stubGlobal('confirm', vi.fn(() => true))

describe('Schedule Store Logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('should have a fixed work limit of 48 hours', () => {
    const store = useScheduleStore()
    expect(store.workLimit).toBe(48)
  })

  it('should calculate weekly hours correctly', () => {
    const store = useScheduleStore()
    const monday = format(store.weekDays[0], 'yyyy-MM-dd')
    
    // Add 4 hours of school (not work)
    store.assignments.push({
      id: '1',
      date: monday,
      startTime: '08:00',
      endTime: '12:00',
      activityId: 'school'
    })
    
    // Add 8 hours of work
    store.assignments.push({
      id: '2',
      date: monday,
      startTime: '13:00',
      endTime: '21:00',
      activityId: 'job1'
    })

    expect(store.calculateWeeklyWorkHours).toBe(8)
    expect(store.calculateWeeklyStudyHours).toBe(4)
  })

  it('should apply holiday multiplier (x2) for salary', () => {
    const store = useScheduleStore()
    const monday = format(store.weekDays[0], 'yyyy-MM-dd')
    
    // Set job1 rate to 200
    store.updateActivityType('job1', { rate: 200, isWork: true })
    
    // Add 5 hours of work
    store.assignments.push({
      id: '3',
      date: monday,
      startTime: '10:00',
      endTime: '15:00',
      activityId: 'job1'
    })

    // Normal salary: 5 * 200 = 1000
    expect(store.estimatedSalary).toBe(1000)

    // Mark as holiday
    store.toggleHoliday(store.weekDays[0])
    
    // Holiday salary: 5 * 200 * 2 = 2000
    expect(store.estimatedSalary).toBe(2000)
  })

  it('should calculate food comparison correctly', () => {
    const store = useScheduleStore()
    
    // Set salary to 600 TWD
    // 600 / 60 (tea) = 10
    // 600 / 100 (bento) = 6
    // 600 / 180 (noodle) = 3
    
    vi.spyOn(store, 'estimatedSalary', 'get').mockReturnValue(600)
    
    expect(store.foodComparison.tea).toBe(10)
    expect(store.foodComparison.bento).toBe(6)
    expect(store.foodComparison.noodle).toBe(3)
  })
})

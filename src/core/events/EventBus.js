/**
 * PozitifKoç Merkezi Event Bus
 * Modüller arası iletişimi sağlar.
 */
class EventBusClass {
  constructor() {
    this.events = {};
  }

  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return () => this.unsubscribe(event, callback);
  }

  unsubscribe(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  publish(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
    
    // Log for auditing
    console.log(`[EventBus] ${event}:`, data);
  }
}

export const EventBus = new EventBusClass();

// Temel Event Tipleri
export const EVENTS = {
  STUDY_STARTED: 'STUDY_STARTED',
  STUDY_COMPLETED: 'STUDY_COMPLETED',
  TOPIC_COMPLETED: 'TOPIC_COMPLETED',
  EXAM_ANALYZED: 'EXAM_ANALYZED',
  NOTIFICATION_SENT: 'NOTIFICATION_SENT',
  XP_EARNED: 'XP_EARNED'
};

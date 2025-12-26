
import { CitadelEvent, AppState, EventStatus } from '../types';

const DB_NAME = 'citadel_local_db';
const STORE_NAME = 'events';
const APP_STATE_KEY = 'citadel_app_state';

/**
 * In a real Tauri app, this would use SQL.
 * For this browser-based delivery, we use IndexedDB to simulate a production local DB.
 */
export const db = {
  async saveEvent(event: CitadelEvent): Promise<void> {
    const events = await this.getAllEvents();
    const existingIndex = events.findIndex(e => e.id === event.id);
    if (existingIndex >= 0) {
      events[existingIndex] = event;
    } else {
      events.push(event);
    }
    localStorage.setItem(STORE_NAME, JSON.stringify(events));
  },

  async getAllEvents(): Promise<CitadelEvent[]> {
    const data = localStorage.getItem(STORE_NAME);
    return data ? JSON.parse(data) : [];
  },

  async getAppState(): Promise<AppState | null> {
    const data = localStorage.getItem(APP_STATE_KEY);
    return data ? JSON.parse(data) : null;
  },

  async saveAppState(state: AppState): Promise<void> {
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
  },

  async deleteEvent(id: string): Promise<void> {
    const events = await this.getAllEvents();
    const filtered = events.filter(e => e.id !== id);
    localStorage.setItem(STORE_NAME, JSON.stringify(filtered));
  }
};

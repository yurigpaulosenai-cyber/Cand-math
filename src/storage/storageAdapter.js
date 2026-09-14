import localforage from 'localforage';
import { Capacitor } from '@capacitor/core';

let adapter;

if (Capacitor.isNativePlatform()) {
  // Usar Capacitor Preferences no mobile
  adapter = {
    async setItem(key, value) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key, value: JSON.stringify(value) });
    },
    async getItem(key) {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key });
      return value ? JSON.parse(value) : null;
    },
    async removeItem(key) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key });
    }
  };
} else {
  // Usar localForage na web (IndexedDB com fallback)
  const store = localforage.createInstance({
    name: 'CandyMath',
    storeName: 'game_data',
    description: 'Dados do jogo Candy Math'
  });
  adapter = store;
}

export const saveData = (key, data) => adapter.setItem(key, data);
export const loadData = (key) => adapter.getItem(key);
export const removeData = (key) => adapter.removeItem(key);

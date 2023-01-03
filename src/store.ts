import { updateStorage } from './plugin/persist';
import { defineStore } from 'pinia'
import Tasbeeh from './schema/Tasbeeh';

interface State {
  debug: boolean,
  version: string,
  isInitialized: boolean,
  tasbeehs: Tasbeeh[],
}

type TasbeehId = number;

const versionString =
  import.meta.env.MODE === 'development'
    ? import.meta.env.VITE_APP_VERSION + '-dev'
    : import.meta.env.VITE_APP_VERSION

export const useStore = defineStore('main', {
  state: (): State => ({
    debug: import.meta.env.MODE === 'development',
    version: versionString,
    isInitialized: false,
    tasbeehs: [],
  }),
  actions: {
    initApp() {
      this.isInitialized = true
      console.log('app initialized!')
    },
    addTasbeeh(tasbeeh: Tasbeeh): void {
      tasbeeh.id = this.nextTasbeehId;
      this.tasbeehs.push(tasbeeh);
      updateStorage(this.tasbeehs);
    },
    deleteTasbeeh(tasbeehId: TasbeehId): void {
      this.tasbeehs = this.tasbeehs.filter((tasbeeh) => tasbeeh.id === tasbeehId);
      updateStorage(this.tasbeehs);
    }
  },

  getters: {
    isReady(state): boolean {
      return !state.isInitialized
    },

    findTasbeehById(state): (id: TasbeehId) => Tasbeeh | undefined {
      return (id: TasbeehId): Tasbeeh | undefined => state.tasbeehs.find((tasbeeh) => tasbeeh.id == id);
    },

    tasbeehList(state): Tasbeeh[] {
      return state.tasbeehs;
    },

    nextTasbeehId(state): TasbeehId {
      return state.tasbeehs.reduce((mid, tasbeeh) => tasbeeh.id ? Math.max(tasbeeh.id, mid) : mid, 0) + 1;
    },
  },

  persist: {
    enabled: true,
  },
});

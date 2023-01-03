import Tasbeeh from '@/schema/Tasbeeh';
import { PiniaPluginContext } from 'pinia'

type PersistData = Tasbeeh[];

const Key = 'TasbeehApp';

const dd = console.debug;


export default function plugin(context: PiniaPluginContext): void {
    dd('Start pinia persist plugin');
    dd('Init persist');

    subscribeToStoreChange(context);
    dd('Subscribed');

    hydrateStore(context, Key);
    dd('store hydrated');
}

export function updateStorage(data: PersistData): void {
    dd('Direct updateStorage', data);
    updateLocalStorage(Key, data);
}

function subscribeToStoreChange(context: PiniaPluginContext): void {
    context.store.$subscribe(
        () => {
            dd('$subscribe state changes -> updateStorage');
            updateLocalStorage(Key, context.store.$state.tasbeehs);
        },
        {
            flush: 'sync',
        }
    );
}

function updateLocalStorage(key: string, data: PersistData): void {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
    }
    localStorage.setItem(key, JSON.stringify(data));
    dd('updated localStorage', data);
}

function hydrateStore(context: PiniaPluginContext, key: string): void {
    const hasSavedState = localStorage.getItem(key);
    dd('store hydrated');

    if (hasSavedState) {
        dd('$patch saved state', hasSavedState);
        context.store.$patch({ tasbeehs: JSON.parse(hasSavedState) });
    }
}

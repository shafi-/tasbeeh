import { createHead } from '@vueuse/head'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
// import piniaPersist from 'pinia-plugin-persist'
import piniaPersist from './plugin/persist';
import App from './App.vue'
import './assets/index.postcss'
import router from './router'

const head = createHead()
const app = createApp(App)

const pinia = createPinia();
pinia.use(piniaPersist)

app.use(pinia);
app.use(router);
app.use(head);

app.mount('#app');

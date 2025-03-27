import Vue from 'vue';
import App from './App.vue';
import router from './router';
import 'tdesign-vue/es/style/index.css';
import { Dialog,  Input, Alert} from 'tdesign-vue';
import { createPinia, PiniaVuePlugin } from 'pinia';
import i18n from './locales';

Vue.use(PiniaVuePlugin);
const pinia = createPinia();

// @ts-ignore
Vue.use(i18n);
Vue.use(Dialog);
Vue.use(Input);
Vue.use(Alert);

Vue.config.productionTip = false;

new Vue({
  pinia,
  // @ts-ignore
  router,
  render: h => h(App),
}).$mount('#app');

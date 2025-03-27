import Vue from 'vue';
import App from './App.vue';
import router from './router';
import TDesign from 'tdesign-vue';
import 'tdesign-vue/es/style/index.css';
import { createPinia, PiniaVuePlugin } from 'pinia';
import i18n from './locales';

Vue.use(PiniaVuePlugin);
const pinia = createPinia();

// @ts-ignore
Vue.use(i18n);
Vue.use(TDesign);

Vue.config.productionTip = false;

new Vue({
  pinia,
  // @ts-ignore
  router,
  render: h => h(App),
}).$mount('#app');

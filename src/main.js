// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueResource from 'vue-resource';
import ElementUI from 'element-ui';

import 'element-ui/lib/theme-default/index.css';
import App from './components/App.vue';


Vue.config.productionTip = false;

Vue.use(ElementUI);
Vue.use(VueResource);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App },
});

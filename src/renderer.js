import '@mdi/font/css/materialdesignicons.css'
import "./style.scss"

import Vue from 'vue'
import VueKonva from 'vue-konva'
import Buefy from 'buefy'

import App from './App.vue'

Vue.use(VueKonva)
Vue.use(Buefy)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  render: h => h(App),
}).$mount('#app')

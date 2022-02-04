import Vue from '../node_modules/vue/dist/vue.esm.browser.min.js'
import App from './App.vue'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
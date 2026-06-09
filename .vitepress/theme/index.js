import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import Badge from './components/Badge.vue'
import EqualityTable from './components/EqualityTable.vue'
import CountryRecommendations from './components/CountryRecommendations.vue'
import PanicButton from './components/PanicButton.vue'
import SafetyBanner from './components/SafetyBanner.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(SafetyBanner),
      'layout-bottom': () => h(PanicButton),
    })
  },
  enhanceApp({ app }) {
    app.component('Badge', Badge)
    app.component('EqualityTable', EqualityTable)
    app.component('CountryRecommendations', CountryRecommendations)
  }
}
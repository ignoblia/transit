import DefaultTheme from 'vitepress/theme'
import Badge from './components/Badge.vue'
import EqualityTable from './components/EqualityTable.vue'
import CountryRecommendations from './components/CountryRecommendations.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Badge', Badge)
    app.component('EqualityTable', EqualityTable)
    app.component('CountryRecommendations', CountryRecommendations)
  }
}
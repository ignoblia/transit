import DefaultTheme from 'vitepress/theme'
import Badge from './components/Badge.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Badge', Badge)
  }
}
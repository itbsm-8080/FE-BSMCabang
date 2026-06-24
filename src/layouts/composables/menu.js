// layouts/composables/menu.js
import { ref } from 'vue'
import { menuModel } from '~/config/menu'

const model = ref(menuModel)

export function useMenu() {
    return { model }
}
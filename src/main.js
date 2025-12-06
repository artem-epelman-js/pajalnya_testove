import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// App + Router
import App from './App.vue'
import { router } from './router'


import Dropdown from 'primevue/dropdown'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import CascadeSelect from 'primevue/cascadeselect'
import DataTable from 'primevue/datatable'
import Button from 'primevue/button'
import Column from 'primevue/column'
import { InputText } from 'primevue'
import ToggleSwitch from 'primevue/toggleswitch'
import draggable from 'vuedraggable'


import '@/assets/styles/kanban-task.scss'
import '@/assets/styles/kanban-column.scss'
import '@/assets/styles/projects-page.scss'
import '@/assets/styles/tasks-page.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue, {
    theme: { preset: Aura }
})

app.use(Toast, {
    position: 'top-right',
    timeout: 2500
})

app.component('Dropdown', Dropdown)
app.component('InputGroup', InputGroup)
app.component('InputGroupAddon', InputGroupAddon)
app.component('CascadeSelect', CascadeSelect)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('InputText', InputText)
app.component('Button', Button)
app.component('ToggleSwitch', ToggleSwitch)
app.component('draggable', draggable)

app.mount('#app')

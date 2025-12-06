<script setup lang="ts">
import {onMounted, reactive, ref, watch} from "vue";
import { useRouter } from 'vue-router'

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import {useProjectsStore} from "@/stores/projects-store.js";
import {Status} from "@/interfaces/task.interface";
import {ProjectPayloadInterface} from "@/interfaces/project.interface";
import {projectValidator} from "@/validators/project.validator";

// stores
const projectsStore = useProjectsStore()

// hooks
const router = useRouter()

// reactive const
const inputName = ref('')
const selectedStatus = ref<Status | null>(null)
const selectedFilter = ref<string | null>(null)
const isOpenCreator = ref<boolean>(false)
const formState = reactive<ProjectPayloadInterface>({ name:'', description:'', status:Status.To_do })
let formErrors = reactive<{ name?: string; description?: string }>({})

// base functions
const goToProject = (event: any) => {
  router.push(`/projects/${event.data.id}`)
}

// filter & sort options
const filterOptions = [
  { name: 'ID', value: 'id' },
  { name: 'Кіль-ть завдань', value: 'tasks_count' },
  { name: 'Дата створення', value: 'created_at' },
]
const statusOptions = [
  { name: 'До виконання', value: Status.To_do },
  { name: 'В процесі', value: Status.In_progress },
  { name: 'Готово', value: Status.Done },
]

// filters
const filtersKey = 'projects_filters';
const saveFilters = (filters: any) => {
  localStorage.setItem(filtersKey, JSON.stringify(filters));
}
const loadFilters = (): any => {
  const saved = localStorage.getItem(filtersKey);
  if (saved) return JSON.parse(saved);
  return {};
}
const clearFilters = () => localStorage.removeItem(filtersKey);
const resetFilters = () => {
  inputName.value = ''
  selectedStatus.value = null
  selectedFilter.value = null
  clearFilters()
  projectsStore.getAll({})
}

// watchers
watch([inputName, selectedStatus, selectedFilter], async ([name, status, sort]) => {
  const newFilters = {
    name: name || '',
    status: status || null,
    sortBy: sort || ''
  };

  saveFilters(newFilters);

  await projectsStore.getAll(newFilters);
});

// form
const resetFormState = () => {
  formState.name = ''
  formState.description = ''
  isOpenCreator.value = false
}
const handleSubmit = () => {

  const result = projectValidator.safeParse(formState)

  if (!result.success) {
    formErrors = {}
    result.error.issues.forEach(err => {
      const field = err.path[0] as 'name' | 'description'
      formErrors[field] = err.message
    })
    return
  }

  projectsStore.create(formState)
  resetFormState()
}

// lifecycle hooks
onMounted(() => {
  const f: any = loadFilters();

  inputName.value = f.filterByName || '';
  selectedStatus.value = f.filterByStatus || null;
  selectedFilter.value = f.sortBy || '';

  projectsStore.getAll({
    ...(inputName.value && { filterBy: 'name', filterValue: inputName.value }),
    ...(selectedStatus.value && { filterBy: 'status', filterValue: selectedStatus.value }),
    ...(selectedFilter.value && { sortBy: selectedFilter.value })
  });
});
</script>

<template>
  <div>
    <div class="projects-page">
      <div class="filters-wrapper">
        <Dropdown
            v-model="selectedFilter"
            :options="filterOptions"
            optionLabel="name"
            optionValue="value"
            placeholder="Сортувати за..."
        />

        <Dropdown
            v-model="selectedStatus"
            :options="statusOptions"
            optionLabel="name"
            optionValue="value"
            placeholder="Статус"
        />

        <InputText
            v-model="inputName"
            placeholder="Пошук за назвою"
        />

        <Button
            label="Скинути фільтри"
            @click="resetFilters"
        />
      </div>

      <div class="creator-wrapper">
        <Button
            :label="isOpenCreator ? 'Приховати форму' : 'Додати проєкт'"
            @click="isOpenCreator = !isOpenCreator"
        />

        <Form
            v-if="isOpenCreator"
            @submit.prevent="handleSubmit"
            class="creator-form"
        >
          <div>
            <InputText
                v-model="formState.name"
                name="name"
                placeholder="Назва проєкту"

            />
            <small v-if="formErrors.name" class="error">
              {{ formErrors.name }}
            </small>
          </div>

          <div>
            <Textarea
                v-model="formState.description"
                name="description"
                placeholder="Опис проєкту"
                class="form-field"

            />
            <small v-if="formErrors.description" class="error">
              {{ formErrors.description }}
            </small>
          </div>

          <Button
              type="submit"
              severity="secondary"
              label="Submit"
          />
        </Form>
      </div>
    </div>


    <DataTable

        :value="projectsStore.data"
        resizableColumns
        columnResizeMode="fit"
        tableStyle="width: 100vw"
        @row-click="goToProject"
    >
      <Column field="id" header="ID проєкту" />
      <Column field="name" header="Назва" />
      <Column field="tasks_count" header="Кіль-ть завдань" />
      <Column field="status" header="Статус" />
      <Column field="created_at" header="Термін виконання" sortable>
        <template #body="slotProps">
        <span v-if="slotProps.data.created_at">
            {{ new Date(slotProps.data.created_at).toLocaleDateString('uk-UA') }}
        </span>
          <span v-else>-</span>
        </template>
      </Column>

    </DataTable>

  </div>
</template>

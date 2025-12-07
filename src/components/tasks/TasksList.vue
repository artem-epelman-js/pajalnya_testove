<script setup lang="ts">
import { ref, onMounted, watch, reactive, computed } from "vue"
import { useRoute } from "vue-router"

import { useTasksStore } from "@/stores/tasks-store"
import {Status, TaskInterface, TaskPayloadInterface} from "@/interfaces/task.interface"

import KanbanTasks from "@/components/tasks/KanbanTask.vue";
import KanbanCard from "@/components/tasks/KanbanCard.vue";
import {useProjectsStore} from "@/stores/projects-store";
import {ProjectInterface} from "@/interfaces/project.interface";




const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()

const todo = computed(() => tasksStore.data.filter(t => t.status === Status.To_do))
const inProgress = computed(() => tasksStore.data.filter(t => t.status === Status.In_progress))
const done = computed(() => tasksStore.data.filter(t => t.status === Status.Done))

const draggedTask = ref<TaskInterface | null>(null)
const isDraggingOver = ref<string | null>(null);
const draggingTaskId = ref<number | null>(null);

function onDragStart(event: DragEvent, task: TaskInterface) {
  draggedTask.value = task
  draggingTaskId.value = task.id;

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData('taskId', String(task.id));
  }
}

function onDragOver(event: DragEvent, status: Status) {
  event.preventDefault()
  if (event.dataTransfer)
    event.dataTransfer.dropEffect = "move"
  isDraggingOver.value = status;
}

async function onDrop(event: DragEvent, targetStatus: Status) {
  event.preventDefault()
  if (!draggedTask.value) return

  const task: TaskInterface = draggedTask.value

  if (task.status === targetStatus) {
    draggedTask.value = null
    return
  }

  const oldStatus = task.status;
  task.status = targetStatus

  try {

    await tasksStore.update(projectId.value, task.id, {
      status: targetStatus,
    })

    tasksStore.data = [...tasksStore.data]

  } catch (e) {
    task.status = oldStatus;
    console.error("Помилка оновлення статусу:", e)
  }
  draggedTask.value = null
  isDraggingOver.value = null;
  draggingTaskId.value = null;
}

async function onDropInColumn(event: DragEvent, targetStatus: Status, targetIndex: number) {
  event.preventDefault();
  if (!draggedTask.value) return;

  const sourceTask = draggedTask.value;
  const sourceStatus = sourceTask.status;

  if (sourceStatus !== targetStatus) {
    await onDrop(event, targetStatus);
    return;
  }

  const tasksInTargetColumn = tasksStore.data.filter(t => t.status === targetStatus);
  const sourceIndexInColumn = tasksInTargetColumn.findIndex(t => t.id === sourceTask.id);

  if (sourceIndexInColumn !== -1) {
    const reorderedTasks = [...tasksInTargetColumn];

    reorderedTasks.splice(sourceIndexInColumn, 1);
    reorderedTasks.splice(targetIndex, 0, sourceTask);
    const otherTasks = tasksStore.data.filter(t => t.status !== targetStatus);
    tasksStore.data = [...otherTasks, ...reorderedTasks];


  }

  draggedTask.value = null;
  draggingTaskId.value = null;
  isDraggingOver.value = null;
}

// hooks & routes
const route = useRoute()
const projectId = computed(() => Number(route.params.id))

// reactive variables
const isOpenCreator = ref(false)
const displayVariant = ref(false)
const performerFilter = ref<string | null>(null)
const statusFilter = ref<string | null>(null)


// form
const formErrors = ref<Record<string, string>>({})
const formState = reactive<TaskPayloadInterface>({
  name: "",
  performer: "",
  status: Status.To_do,
  deadline: ""
})
const resetFormState = () => {
  formState.name = ""
  formState.performer = ""
  formState.status = Status.To_do
  formState.deadline = ""
  isOpenCreator.value = false
}

// handlers
const handleSubmit = () => {
  formErrors.value = {}

  tasksStore.create(projectId.value, {
    ...formState,
  })
  resetFormState()
}

// async functions
async function loadFilteredTasks() {
  await tasksStore.getAll(projectId.value, {
    performer: performerFilter.value,
    status: statusFilter.value
  })
}

// watchers
watch([performerFilter, statusFilter], async ([performer, status]) => {
  saveFilters({ performer: performer || null, status: status || null })


  await tasksStore.getAll(projectId.value, {
    performer: performer ?? null,
    status: status ?? null
  })
})

watch(displayVariant, (value) => {
  localStorage.setItem('display_variant', JSON.stringify(value));
});

const statuses = ['To do', 'In Progress', 'Done']

// base functions
function onRowReorder(event: any) {
  if (event?.value) tasksStore.data = event.value
}

// base const
const performers = ["Іван", "Петро", "Олег", "Анна", "Марія", "Олена"]
const currentProject = ref<ProjectInterface>(null)

// create and save filters
const FILTERS_KEY = 'tasks_filters'

const saveFilters = (filters: any) => {
  localStorage.setItem(FILTERS_KEY, JSON.stringify(filters))
}

const loadFilters = () => {
  try {
    return JSON.parse(localStorage.getItem(FILTERS_KEY) || '{}')
  } catch {
    return {}
  }
}

// reset filters
const clearFilters = () => localStorage.removeItem(FILTERS_KEY);
const resetFilters = () => {
  performerFilter.value = null
  statusFilter.value = null
  clearFilters()
  tasksStore.getAll(projectId.value)
}

// lifecycle hooks
onMounted(async() => {
  const f: any = loadFilters()

  performerFilter.value = f.performer ?? null
  statusFilter.value = f.status ?? null


  await loadFilteredTasks()

  const savedVariant = localStorage.getItem('display_variant')
  if (savedVariant !== null) {
    displayVariant.value = JSON.parse(savedVariant)
  }

  currentProject.value = await projectsStore.getById(projectId.value)

})

</script>

<template>
  <div class="tasks-page">
    <div>
      <div class="tasks-header">
        <h2>Проєкт №{{ projectId }}. {{currentProject?.name}}</h2>
        <div>
          <ToggleSwitch v-model="displayVariant" class="view-switch"/>
          <span>Переключити вигляд</span>
        </div>
        <div class="tasks-creator">
          <Button
              :label="isOpenCreator ? 'Приховати форму' : 'Додати завдання'"
              @click="isOpenCreator = !isOpenCreator"
          />

          <Button
              label="Скинути фільтри"
              @click="resetFilters"
              class="reset-btn"
          />

          <Form v-if="isOpenCreator" @submit.prevent="handleSubmit"  class="creator-form">
            <div class="form-field">
              <InputText v-model="formState.name" placeholder="Назва завдання" />
              <small v-if="formErrors.name" class="error">{{ formErrors.name }}</small>
            </div>

            <div class="form-field multi">
              <Dropdown v-model="formState.performer" :options="performers" placeholder="Виконавець" />
              <small v-if="formErrors.performer" class="error">{{ formErrors.performer }}</small>

              <Dropdown v-model="formState.status" :options="statuses" placeholder="Статус" />
              <small v-if="formErrors.status" class="error">{{ formErrors.status }}</small>

              <InputText v-model="formState.deadline" type="date" />
              <small v-if="formErrors.deadline" class="error">{{ formErrors.deadline }}</small>
            </div>

            <Button type="submit" severity="secondary" label="Створити" class="submit-btn"/>
          </Form>
        </div>

        <div>
          <Dropdown v-model="performerFilter" :options="performers" placeholder="Фільтр по виконавцю"/>
          <Dropdown v-model="statusFilter" :options="statuses" placeholder="Фільтр по статусу"/>
        </div>

        <DataTable
            v-if="!displayVariant"
            :value="tasksStore.data"
            resizableColumns
            columnResizeMode="fit"
            tableStyle="width: 100vw"
            :loading="tasksStore.loading"
            rowReorder
            @rowReorder="onRowReorder"
        >
          <Column rowReorder/>
          <Column field="id" header="ID"/>
          <Column field="name" header="Назва" />
          <Column field="performer" header="Виконавець" />
          <Column field="status" header="Статус" sortable />
          <Column field="deadline" header="Термін виконання" sortable>
            <template #body="slotProps">
        <span v-if="slotProps.data.deadline">
            {{ new Date(slotProps.data.deadline).toLocaleDateString('uk-UA') }}
        </span>
              <span v-else>-</span>
            </template>
          </Column>
        </DataTable>
      </div>

      <div v-if="displayVariant" class="kanban-board">

        <div>
          <KanbanCard
              :is-dragging="false"
              :item-count="todo.length"
              title="To do"
              @dragover.prevent="onDragOver($event, Status.To_do)"

              @drop="onDropInColumn($event, Status.To_do, todo.length)"
          >
            <template #body>
              <div
                  @dragover.prevent="onDragOver($event, Status.To_do)"

                  @drop.prevent="onDropInColumn($event, Status.To_do, todo.length)"
              >
                <div
                    v-for="(task, index) in todo"
                    :key="task.id"
                    draggable="true"
                    @dragstart="onDragStart($event, task)"

                    @dragover.prevent="onDragOver($event, Status.To_do)"

                    @drop.prevent="onDropInColumn($event, Status.To_do, index)"
                >
                  <KanbanTasks :task="task" />
                </div>
              </div>
            </template>
          </KanbanCard>
        </div>

        <div>
          <KanbanCard
              :is-dragging="false"
              :item-count="inProgress.length"
              title="In Progress"
              @dragover.prevent="onDragOver($event, Status.In_progress)"

              @drop="onDropInColumn($event, Status.In_progress, inProgress.length)"
          >
            <template #body>
              <div
                  @dragover.prevent="onDragOver($event, Status.In_progress)"
                  @drop.prevent="onDropInColumn($event, Status.In_progress, inProgress.length)"
              >
                <div
                    v-for="(task, index) in inProgress"
                    :key="task.id"
                    draggable="true"
                    @dragstart="onDragStart($event, task)"
                    @dragover.prevent="onDragOver($event, Status.In_progress)"
                    @drop.prevent="onDropInColumn($event, Status.In_progress, index)"
                >
                  <KanbanTasks :task="task" />
                </div>
              </div>
            </template>
          </KanbanCard>
        </div>

        <div>
          <KanbanCard
              :is-dragging="false"
              :item-count="done.length"
              title="Done"
              @dragover.prevent="onDragOver($event, Status.Done)"

              @drop="onDropInColumn($event, Status.Done, done.length)"
          >
            <template #body>
              <div
                  @dragover.prevent="onDragOver($event, Status.Done)"
                  @drop.prevent="onDropInColumn($event, Status.Done, done.length)"
              >
                <div
                    v-for="(task, index) in done"
                    :key="task.id"
                    draggable="true"
                    @dragstart="onDragStart($event, task)"
                    @dragover.prevent="onDragOver($event, Status.Done)"
                    @drop.prevent="onDropInColumn($event, Status.Done, index)"
                >
                  <KanbanTasks :task="task" />
                </div>
              </div>
            </template>
          </KanbanCard>
        </div>
      </div>
      <div v-if="tasksStore.data.length === 0 && !tasksStore.loading">
        Немає задач для цього проєкту
      </div>
    </div>
  </div>
</template>
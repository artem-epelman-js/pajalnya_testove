<script setup lang="ts">
defineProps<{
  title: string,
  itemCount: number
  isDragging: boolean
}>()
</script>

<template>
  <div class="kanban-column" @dragenter.prevent @dragover.prevent>
    <div class="kanban-column__header">
      {{ title }} <span class="kanban-column__counter">({{ itemCount }})</span>
    </div>
    <div class="kanban-column__body"
         :class="isDragging && 'kanban-column__body--dragging'">
      <slot name="body"></slot>
    </div>
  </div>
</template>
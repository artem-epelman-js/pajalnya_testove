<script setup lang="ts">
 import {TaskInterface} from "@/interfaces/task.interface";

 defineProps<{
   task: TaskInterface
 }>()
</script>

<template>
  <div  class="kanban-task" draggable="true">
    <div class="kanban-task__name">{{task.name}}</div>
    <div class="kanban-task__status">{{task.status}}</div>
  </div>
</template>
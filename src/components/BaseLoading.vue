<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    message?: string;
    color?:
      | 'text-primary'
      | 'text-secondary'
      | 'text-success'
      | 'text-neutral'
      | 'text-error'
      | 'text-warning'
      | 'text-info'
      | 'text-accent';
  }>(),
  { color: 'text-primary', message: '' }
);
</script>
<template>
  <div class="flex flex-col items-center justify-center">
    <span class="loading loading-infinity h-50 w-50" :class="[props.color]"></span>
    <h1 className="text-2xl font-thin text-center">{{ message }}</h1>
  </div>
</template>

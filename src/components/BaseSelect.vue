<script setup lang="ts">
import { computed, useAttrs } from 'vue';

interface Option {
  value: string | number;
  label: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    options: Option[];
    width?: string;
    error?: boolean;
    errorMessage?: string;
    fieldsetLabel?: string;
    showLabel?: boolean;
  }>(),
  {
    width: 'w-auto',
    error: false,
    showLabel: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
}>();

const attrs = useAttrs();

const selectClasses = computed(() => [
  'select select-bordered',
  props.width,
  { 'select-error': props.error },
]);
</script>

<template>
  <div :class="width">
    <fieldset class="fieldset">
      <legend class="fieldset-legend" :class="[!showLabel ? 'hidden' : '']">
        {{ fieldsetLabel }}
      </legend>
      <select
        v-bind="attrs"
        :value="modelValue"
        :class="selectClasses"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>

      <span v-if="errorMessage" class="text-error text-sm">
        {{ errorMessage }}
      </span>
    </fieldset>
  </div>
</template>

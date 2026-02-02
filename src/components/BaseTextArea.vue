<script setup lang="ts">
import { computed, useAttrs } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    width?: string;
    error?: boolean;
    errorMessage?: string;
    fieldsetLabel?: string;
    showLabel?: boolean;
    rows?: number;
  }>(),
  {
    width: 'w-auto',
    error: false,
    showLabel: false,
    rows: 4,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const attrs = useAttrs();

const textareaClasses = computed(() => [
  'textarea textarea-bordered w-full resize-none',
  { 'textarea-error': props.error },
]);
</script>

<template>
  <div :class="width">
    <fieldset class="fieldset">
      <legend class="fieldset-legend" :class="{ hidden: !showLabel }">
        {{ fieldsetLabel }}
      </legend>

      <textarea
        v-bind="attrs"
        :rows="rows"
        :value="modelValue"
        :class="textareaClasses"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      />

      <span v-if="errorMessage" class="text-error text-sm">
        {{ errorMessage }}
      </span>
    </fieldset>
  </div>
</template>

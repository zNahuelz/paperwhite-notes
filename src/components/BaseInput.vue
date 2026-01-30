<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { Icon } from '@iconify/vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    icon?: string;
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

const inputClasses = computed(() => [
  'input input-bordered flex items-center gap-2',
  props.width,
  { 'input-error': props.error },
]);
</script>
<template>
  <div :class="width">
    <fieldset class="fieldset">
      <legend class="fieldset-legend" :class="[!showLabel ? 'hidden' : '']">
        {{ fieldsetLabel }}
      </legend>
      <label :class="inputClasses">
        <Icon v-if="icon" :icon="icon" class="text-xl opacity-50" />

        <input
          v-bind="attrs"
          :value="modelValue"
          class="grow bg-transparent outline-none"
          @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <span v-if="errorMessage" class="text-error text-sm">
        {{ errorMessage }}
      </span>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { Icon as IconifyIcon } from '@iconify/vue';

const attrs = useAttrs();

const props = withDefaults(
  defineProps<{
    label?: string;
    color?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    isLoading?: boolean;
    width?: string;
    icon?: string;
  }>(),
  {
    color: 'btn-primary',
    type: 'button',
    disabled: false,
    isLoading: false,
    width: 'w-auto',
  }
);

const isDisabled = computed(() => props.disabled || props.isLoading);

const buttonClasses = computed(() => [
  'btn flex items-center gap-2 transition-all duration-150',
  props.color,
  props.width,
  {
    'cursor-not-allowed': isDisabled.value,
  },
]);
</script>

<template>
  <button :type="type" :disabled="isDisabled" :class="buttonClasses" v-bind="attrs">
    <span v-if="isLoading" class="loading loading-dots loading-sm" />

    <IconifyIcon v-if="icon" :icon="icon" class="h-5 w-5" />

    <span v-if="label">
      {{ label }}
    </span>
  </button>
</template>

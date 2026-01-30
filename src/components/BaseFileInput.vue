<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const attrs = useAttrs();

const props = withDefaults(
  defineProps<{
    modelValue?: File | File[] | null;
    width?: string;
    error?: boolean;
    errorMessage?: string;
    fieldsetLabel?: string;
    showLabel?: boolean;
    multiple?: boolean;
    accept?: string;
    disabled?: boolean;
  }>(),
  {
    width: 'w-auto',
    error: false,
    showLabel: false,
    multiple: false,
    disabled: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: File | File[] | null): void;
}>();

const inputClasses = computed(() => [
  'input input-bordered flex items-center gap-2',
  props.width,
  { 'input-error': props.error },
]);

function onChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || files.length === 0) {
    emit('update:modelValue', null);
    return;
  }

  emit('update:modelValue', props.multiple ? Array.from(files) : files[0]);
  target.value = '';
}

const fileLabel = computed(() => {
  if (!props.modelValue) return '';
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.map((f) => f.name).join(', ');
  }
  return props.modelValue.name;
});
</script>

<template>
  <div>
    <fieldset class="fieldset">
      <legend class="fieldset-legend" :class="{ hidden: !showLabel }">
        {{ fieldsetLabel }}
      </legend>

      <label :class="inputClasses">
        <input
          v-bind="attrs"
          type="file"
          class="grow bg-transparent outline-none"
          :accept="accept"
          :multiple="multiple"
          :disabled="disabled"
          @change="onChange"
        />
      </label>
      <span v-if="fileLabel" class="text-sm opacity-70 mt-1 block truncate" :title="fileLabel">
        {{ `${t('common.selectedFile')}: ${fileLabel}` }}
      </span>
      <span v-if="errorMessage" class="text-error text-sm">
        {{ errorMessage }}
      </span>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { reactive, ref, watch } from 'vue';
import { highlightSchema, HighlightSchema } from '@/forms/schemas/highlightSchema.ts';
import { Icon } from '@iconify/vue';
import { Icons } from '@/constants/icons.ts';
import BaseButton from '@/components/BaseButton.vue';
import BaseTextArea from '@/components/BaseTextArea.vue';

const { t } = useI18n();
const errorMessage = ref('');
const isSubmitting = ref(false);
const highlightSaved = ref(false);

const props = defineProps<{
  highlightId: number;
  initialValues?: HighlightSchema;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const form = reactive<HighlightSchema>({
  content: '',
});

const errors = reactive<Partial<Record<keyof HighlightSchema, string>>>({});

const clearErrors = () => {
  (Object.keys(errors) as (keyof HighlightSchema)[]).forEach((key) => {
    delete errors[key];
  });
};

watch(
  () => props.initialValues,
  (values) => {
    if (!values) return;

    Object.assign(form, {
      content: values.content ?? '',
    });

    clearErrors();
  },
  { immediate: true }
);

const validate = () => {
  clearErrors();

  const result = highlightSchema.safeParse(form);

  if (result.success) return true;

  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof HighlightSchema;
    errors[field] = t(issue.message);
  }

  return false;
};

const onSubmit = async () => {
  if (!validate()) return;
  try {
    errorMessage.value = '';
    isSubmitting.value = true;
    await window.api.highlights.update(props.highlightId, { ...form });
    highlightSaved.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1200));

    window.location.reload();
  } catch (error) {
    errorMessage.value = t('errors.highlightSaveFailed');
  } finally {
    isSubmitting.value = false;
  }
};
</script>
<template>
  <div v-if="highlightSaved" class="flex flex-col items-center">
    <Icon :icon="Icons.CircleCheck" class="text-success text-[100px]"></Icon>
    <span class="font-light text-2xl">{{ t('highlights.highlightUpdated') }}</span>
  </div>
  <form @submit.prevent="onSubmit" class="space-y-4" v-if="!highlightSaved">
    <div class="flex flex-col items-center" v-if="errorMessage !== ''">
      <span class="text-md font-bold text-error text-center">{{ errorMessage }}</span>
    </div>

    <BaseTextArea
      width="w-full"
      v-model="form.content"
      :error="!!errors.content"
      :errorMessage="errors.content"
      :showLabel="true"
      :fieldsetLabel="t('highlights.highlight')"
      :disabled="isSubmitting"
      :rows="8"
    ></BaseTextArea>

    <div class="flex justify-end">
      <div class="join join-vertical md:join-horizontal">
        <BaseButton
          :label="t('common.cancel')"
          type="button"
          @click="emit('close')"
          class="join-item"
          color="btn-error"
          :disabled="isSubmitting"
        ></BaseButton>
        <BaseButton
          :label="!isSubmitting ? t('common.save') : t('common.saving')"
          type="submit"
          class="join-item"
          :isLoading="isSubmitting"
        ></BaseButton>
      </div>
    </div>
  </form>
</template>

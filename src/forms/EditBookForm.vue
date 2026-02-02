<script setup lang="ts">
import { BookSchema, bookSchema } from '@/forms/schemas/bookSchema.ts';
import { reactive, ref, watch } from 'vue';
import BaseInput from '@/components/BaseInput.vue';
import { useI18n } from 'vue-i18n';
import { toFileUrl } from '@/constants/utils.ts';
import BaseButton from '@/components/BaseButton.vue';
import BaseTextArea from '@/components/BaseTextArea.vue';
import { Icons } from '@/constants/icons.ts';
import { Icon } from '@iconify/vue';

const { t } = useI18n();
const errorMessage = ref('');

const isSubmitting = ref(false);
const bookSaved = ref(false);

const props = defineProps<{
  bookId: number;
  initialValues?: BookSchema;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const form = reactive<BookSchema>({
  title: '',
  author: '',
  description: '',
  cover: '',
});

const errors = reactive<Partial<Record<keyof BookSchema, string>>>({});
const coverPreview = ref<string | null>(null);

const clearErrors = () => {
  (Object.keys(errors) as (keyof BookSchema)[]).forEach((key) => {
    delete errors[key];
  });
};

watch(
  () => props.initialValues,
  (values) => {
    if (!values) return;

    Object.assign(form, {
      title: values.title ?? '',
      author: values.author ?? '',
      description: values.description ?? '',
      cover: values.cover ?? '',
    });

    coverPreview.value = values.cover ? toFileUrl(values.cover) : null;

    clearErrors();
  },
  { immediate: true }
);

const validate = () => {
  clearErrors();

  const result = bookSchema.safeParse(form);

  if (result.success) return true;

  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof BookSchema;
    errors[field] = t(issue.message);
  }

  return false;
};

const onSubmit = async () => {
  if (!validate()) return;
  try {
    errorMessage.value = '';
    isSubmitting.value = true;
    await window.api.books.update(props.bookId, { ...form });
    bookSaved.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1800));

    window.location.reload();
  } catch (error) {
    errorMessage.value = t('errors.bookSaveFailed');
  } finally {
    isSubmitting.value = false;
  }
};

const handleCoverSelect = async () => {
  const filePath = await window.electron.selectCoverImage();
  if (!filePath) return;

  form.cover = filePath;
  coverPreview.value = toFileUrl(filePath);
};
</script>
<template>
  <div v-if="bookSaved" class="flex flex-col items-center">
    <Icon :icon="Icons.CircleCheck" class="text-success text-[100px]"></Icon>
    <span class="font-light text-2xl">{{ t('library.bookUpdated') }}</span>
  </div>
  <form @submit.prevent="onSubmit" class="space-y-4" v-if="!bookSaved">
    <div class="flex flex-col items-center" v-if="errorMessage !== ''">
      <span class="text-md font-bold text-error text-center">{{ errorMessage }}</span>
    </div>
    <BaseInput
      width="w-full"
      v-model="form.title"
      :error="!!errors.title"
      :errorMessage="errors.title"
      :showLabel="true"
      :fieldsetLabel="t('common.title')"
      :disabled="isSubmitting"
    />
    <BaseInput
      width="w-full"
      v-model="form.author"
      :showLabel="true"
      :fieldsetLabel="t('common.author')"
      :disabled="isSubmitting"
    />
    <BaseTextArea
      v-model="form.description"
      width="w-full"
      :showLabel="true"
      :fieldsetLabel="t('common.description')"
      :disabled="isSubmitting"
    ></BaseTextArea>
    <div>
      <label class="label mb-2">{{ t('common.coverImage') }}</label>
      <div class="flex items-center gap-4">
        <BaseButton
          type="button"
          :title="t('common.selectImage')"
          color="btn-secondary"
          @click="handleCoverSelect"
          :icon="Icons.Upload"
          :disabled="isSubmitting"
        ></BaseButton>
        <img
          v-if="coverPreview"
          :src="coverPreview"
          class="h-24 rounded shadow"
          alt=""
          @dragstart.prevent
          @contextmenu.prevent
        />
      </div>
      <span class="text-sm font-semibold">{{ t('library.recommendedResolution') }}</span>
    </div>
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

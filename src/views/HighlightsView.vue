<script setup lang="ts">
import { Book } from 'electron/db/types/book';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import { Highlight } from 'electron/db/types/highlight';
import BaseLoading from '@/components/BaseLoading.vue';
import HighlightCard from '@/components/HighlightCard.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { Icons } from '@/constants/icons';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = route.params.id as string;

const isLoading = ref(true);
const book = ref<Book | undefined>(undefined);
const highlights = ref<Highlight[]>([]);
const search = ref('');

const loadBookDetails = async () => {
  try {
    book.value = await window.api.books.get(Number(id));
    highlights.value = await window.api.highlights.byBook(Number(id));
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
};

const filteredHighlights = computed(() => {
  if (!search.value.trim()) return highlights.value;

  const q = search.value.toLowerCase();

  return highlights.value.filter((h) => h.content.toLowerCase().includes(q));
});

onMounted(() => loadBookDetails());
</script>
<template>
  <div v-if="isLoading">
    <BaseLoading></BaseLoading>
  </div>
  <div v-else class="p-4 m-4">
    <h1 class="text-3xl font-semibold">{{ t('highlights.highlights') }}</h1>
    <div class="divider"></div>
    <div class="flex flex-col items-end mb-5">
      <div class="inline-flex items-center gap-2">
        <BaseInput :placeholder="`${t('common.search')}...`" v-model="search"></BaseInput>
        <div class="join md:join-horizontal join-vertical">
          <BaseButton
            :icon="Icons.Refresh"
            :title="t('common.reset').toUpperCase()"
            class="join-item"
            @click="search = ''"
          ></BaseButton>
          <BaseButton
            :icon="Icons.ArrowLeft"
            :title="t('common.goBack').toUpperCase()"
            class="join-item"
            color="btn-neutral"
            @click="() => router.push({ name: 'library' })"
          ></BaseButton>
        </div>
      </div>
    </div>
    <div class="grid md:grid-cols-2 grid-cols-1 gap-4 items-strech">
      <div v-for="quote in filteredHighlights" :key="quote.id">
        <HighlightCard :highlight="quote"></HighlightCard>
      </div>
    </div>
  </div>
</template>

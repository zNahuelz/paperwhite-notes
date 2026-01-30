<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue';
import { Icon } from '@iconify/vue';
import { Icons } from '@/constants/icons';

interface Props {
  open: boolean;
  title?: string;
  disableClose?: boolean;
  width?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disableClose: false,
  width: 'max-w-md',
});

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const modalRef = ref<HTMLElement | null>(null);
let lastFocusedElement: HTMLElement | null = null;

const close = () => {
  if (!props.disableClose) emit('close');
};

const onBackdropClick = (e: MouseEvent) => {
  if (props.disableClose) return;
  if (e.target === e.currentTarget) close();
};

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && !props.disableClose) {
    close();
  }

  if (e.key === 'Tab' && modalRef.value) {
    const focusable = modalRef.value.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
};

watch(
  () => props.open,
  async (open) => {
    if (open) {
      lastFocusedElement = document.activeElement as HTMLElement;
      await nextTick();
      modalRef.value?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      lastFocusedElement?.focus();
    }
  }
);

onMounted(() => {
  document.addEventListener('keydown', onKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyDown);
  document.body.style.overflow = '';
});
</script>

<template>
  <teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      @click="onBackdropClick"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref="modalRef"
        class="relative bg-base-100 rounded-3xl shadow-lg w-full outline-none"
        :class="width"
        tabindex="-1"
      >
        <div class="flex items-center justify-between p-4 border-b border-base-300">
          <h3 class="text-xl font-semibold">
            {{ title }}
          </h3>

          <button
            v-if="!disableClose"
            type="button"
            class="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-4xl p-2"
            @click="close"
          >
            <Icon :icon="Icons.X" />
          </button>
        </div>

        <div class="p-6">
          <slot />
        </div>

        <div v-if="$slots.footer" class="border-t border-base-300 p-4">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </teleport>
</template>

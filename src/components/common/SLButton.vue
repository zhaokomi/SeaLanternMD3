<script setup lang="ts">
import { ref, computed } from "vue";
import { Loader2 } from "lucide-vue-next";
import { useRegisterComponent } from "@composables/useRegisterComponent";

interface Props {
  /** MD3 按钮变体: filled | filled-tonal | elevated | outlined | text */
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "filled" | "filled-tonal" | "elevated" | "outlined" | "text";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  iconOnly?: boolean;
  componentId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "filled",
  size: "md",
  type: "button",
  disabled: false,
  loading: false,
  iconOnly: false,
});

// 旧变体到新 MD3 变体的映射，保持向后兼容
const variantMap: Record<string, string> = {
  primary: "filled",
  secondary: "filled-tonal",
  ghost: "text",
  danger: "filled",
  success: "filled",
  filled: "filled",
  "filled-tonal": "filled-tonal",
  elevated: "elevated",
  outlined: "outlined",
  text: "text",
};

const resolvedVariant = computed(() => variantMap[props.variant] || "filled");
const isColorVariant = computed(() => ["danger", "success"].includes(props.variant));

const elRef = ref<HTMLElement | null>(null);
const id = props.componentId ?? `sl-button-${Math.random().toString(36).slice(2, 8)}`;
useRegisterComponent(id, {
  type: "SLButton",
  get: (prop) => (prop === "disabled" ? props.disabled : undefined),
  set: () => {},
  call: (method) => {
    if (method === "click") elRef.value?.click();
  },
  on: () => () => {},
  el: () => elRef.value,
});

const buttonClasses = computed(() => [
  `sl-button`,
  `sl-button--${resolvedVariant.value}`,
  `sl-button--${props.size}`,
  {
    "sl-button--disabled": props.disabled || props.loading,
    "sl-button--icon-only": props.iconOnly,
    "sl-button--danger": props.variant === "danger",
    "sl-button--success": props.variant === "success",
  },
]);
</script>

<template>
  <button
    ref="elRef"
    class="sl-button"
    :class="buttonClasses"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
  >
    <Loader2 v-if="loading" class="sl-button-spinner" :size="16" />
    <slot v-else />
  </button>
</template>

<style src="@styles/components/common/SLButton.css" scoped></style>

<script setup lang="ts">
import { ref, computed } from "vue";
import DOMPurify from "dompurify";
import { useRegisterComponent } from "@composables/useRegisterComponent";

const PADDING_MAP = {
  none: "0",
  xs: "var(--sl-space-xs)",
  sm: "var(--sl-space-sm)",
  md: "var(--sl-space-md)",
  lg: "var(--sl-space-lg)",
} as const;

type PaddingType = keyof typeof PADDING_MAP;
/** MD3 Card: elevated | filled | outlined | glass(acrylic only) */
type CardVariant = "solid" | "glass" | "outline" | "elevated" | "filled" | "outlined";

interface Props {
  title?: string;
  subtitle?: string;
  hoverable?: boolean;
  padding?: PaddingType;
  variant?: CardVariant;
  componentId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  hoverable: false,
  padding: "md",
  variant: "filled",
});

// 向后兼容：solid → filled, outline → outlined
const resolveVariant = computed(() => {
  const map: Record<string, CardVariant> = {
    solid: "filled",
    glass: "glass",
    outline: "outlined",
    elevated: "elevated",
    filled: "filled",
    outlined: "outlined",
  };
  return map[props.variant] || "filled";
});

const paddingValue = PADDING_MAP[props.padding as PaddingType];

const elRef = ref<HTMLElement | null>(null);
const pluginFooterHtml = ref<string | null>(null);

const id = props.componentId ?? `sl-card-${Math.random().toString(36).slice(2, 8)}`;
useRegisterComponent(id, {
  type: "SLCard",
  get: (prop) => {
    if (prop === "pluginFooter") return pluginFooterHtml.value;
    if (prop === "title") return props.title;
    return undefined;
  },
  set: (prop, value) => {
    if (prop === "pluginFooter") {
      pluginFooterHtml.value = value
        ? DOMPurify.sanitize(value, {
            FORBID_TAGS: ["script", "iframe", "style", "link"],
            FORBID_ATTR: ["style"],
          })
        : null;
    }
  },
  call: () => undefined,
  on: () => () => {},
  el: () => elRef.value,
});

const cardClasses = computed(() => ({
  "sl-card": true,
  [`sl-card--${resolveVariant.value}`]: true,
  "sl-card--hoverable": props.hoverable,
}));
</script>

<template>
  <div ref="elRef" :class="cardClasses" :style="{ padding: paddingValue }">
    <div v-if="title || $slots.header || $slots.actions" class="sl-card-header">
      <div v-if="title" class="sl-card-header-text">
        <h3 class="sl-card-title">{{ title }}</h3>
        <p v-if="subtitle" class="sl-card-subtitle">{{ subtitle }}</p>
      </div>
      <slot name="header" />
      <slot v-if="$slots.actions" name="actions" />
    </div>

    <div class="sl-card-body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="sl-card-footer">
      <slot name="footer" />
    </div>

    <div
      v-if="pluginFooterHtml"
      class="sl-card-footer sl-card-plugin-footer"
      v-html="pluginFooterHtml"
    />
  </div>
</template>

<style src="@styles/components/common/SLCard.css" scoped></style>

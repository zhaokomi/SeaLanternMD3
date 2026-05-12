<script setup lang="ts">
import { ref } from "vue";
import { useRegisterComponent } from "@composables/useRegisterComponent";

interface Props {
  modelValue?: string;
  placeholder?: string;
  label?: string;
  type?: string;
  disabled?: boolean;
  maxlength?: number;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  hideNumberControls?: boolean;
  /** MD3 输入框变体: outlined (默认) | filled */
  variant?: "outlined" | "filled";
  supportingText?: string;
  errorText?: string;
  componentId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "",
  type: "text",
  disabled: false,
  hideNumberControls: true,
  variant: "outlined",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const handleInput = (e: Event) => {
  emit("update:modelValue", (e.target as HTMLInputElement).value);
};

const elRef = ref<HTMLElement | null>(null);
const id = props.componentId ?? `sl-input-${Math.random().toString(36).slice(2, 8)}`;
useRegisterComponent(id, {
  type: "SLInput",
  get: (prop) => (prop === "value" ? props.modelValue : undefined),
  set: (prop, value) => {
    if (prop === "value") emit("update:modelValue", String(value ?? ""));
  },
  call: () => undefined,
  on: () => () => {},
  el: () => elRef.value,
});
</script>

<template>
  <div ref="elRef" class="sl-input-wrapper">
    <div class="sl-input-container" :class="`sl-input--${variant}`">
      <div v-if="$slots.prefix" class="sl-input-prefix">
        <slot name="prefix" />
      </div>
      <div class="sl-input-field">
        <input
          class="sl-input"
          :class="{
            'sl-input--hide-number-controls': hideNumberControls,
            'sl-input--has-value': modelValue,
          }"
          :type="type"
          :value="modelValue"
          :placeholder="variant === 'filled' ? placeholder : ' '"
          :disabled="disabled"
          :maxlength="maxlength"
          :min="min"
          :max="max"
          :step="step"
          @input="handleInput"
        />
        <label v-if="label" class="sl-input-label">{{ label }}</label>
        <fieldset v-if="variant === 'outlined'" class="sl-input-fieldset">
          <legend class="sl-input-legend">
            <span v-if="label">{{ label }}</span>
          </legend>
        </fieldset>
      </div>
      <div v-if="$slots.suffix" class="sl-input-suffix">
        <slot name="suffix" />
      </div>
    </div>
    <div v-if="errorText" class="sl-input-supporting sl-input-supporting--error">
      {{ errorText }}
    </div>
    <div v-else-if="supportingText" class="sl-input-supporting">
      {{ supportingText }}
    </div>
  </div>
</template>

<style scoped>
.sl-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sl-input-container {
  display: flex;
  align-items: center;
  border-radius: var(--md-sys-shape-corner-extra-small) var(--md-sys-shape-corner-extra-small) 0 0;
  transition:
    background-color var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
}

/* ===== MD3 Outlined Text Field ===== */
.sl-input--outlined {
  background: transparent;
  border-radius: var(--md-sys-shape-corner-extra-small);
}

.sl-input--outlined .sl-input-field {
  position: relative;
  flex: 1;
}

.sl-input--outlined .sl-input {
  flex: 1;
  padding: 12px 16px;
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  background: transparent;
  border: 0;
  outline: 0;
  min-width: 0;
  width: 100%;
  color: var(--md-sys-color-on-surface);
}

.sl-input--outlined .sl-input-label {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  color: var(--md-sys-color-on-surface-variant);
  pointer-events: none;
  transition:
    transform var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard),
    font-size var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard),
    color var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
  transform-origin: left top;
}

.sl-input--outlined .sl-input:focus + .sl-input-label,
.sl-input--outlined .sl-input:not(:placeholder-shown) + .sl-input-label,
.sl-input--outlined .sl-input--has-value + .sl-input-label {
  transform: translateY(-130%) scale(0.75);
  color: var(--md-sys-color-primary);
}

.sl-input--outlined .sl-input-fieldset {
  position: absolute;
  inset: -6px 0 0;
  margin: 0;
  padding: 0 12px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-extra-small);
  pointer-events: none;
  transition: border-color var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
}

.sl-input--outlined .sl-input-legend {
  visibility: hidden;
  width: 0;
  padding: 0;
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: 11px;
  transition: width var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
}

.sl-input--outlined .sl-input:focus + .sl-input-label + .sl-input-fieldset,
.sl-input--outlined:focus-within .sl-input-fieldset {
  border-color: var(--md-sys-color-primary);
  border-width: 2px;
}

.sl-input--outlined .sl-input:focus ~ .sl-input-fieldset .sl-input-legend,
.sl-input--outlined .sl-input:not(:placeholder-shown) ~ .sl-input-fieldset .sl-input-legend,
.sl-input--outlined .sl-input--has-value ~ .sl-input-fieldset .sl-input-legend {
  visibility: visible;
  width: auto;
}

.sl-input--outlined .sl-input:focus ~ .sl-input-fieldset .sl-input-legend span,
.sl-input--outlined .sl-input:not(:placeholder-shown) ~ .sl-input-fieldset .sl-input-legend span,
.sl-input--outlined .sl-input--has-value ~ .sl-input-fieldset .sl-input-legend span {
  padding: 0 4px;
}

/* ===== MD3 Filled Text Field ===== */
.sl-input--filled {
  background: var(--md-sys-color-surface-container-highest);
  border-bottom: 1px solid var(--md-sys-color-on-surface-variant);
  border-radius: var(--md-sys-shape-corner-extra-small) var(--md-sys-shape-corner-extra-small) 0 0;
}

.sl-input--filled .sl-input-field {
  position: relative;
  flex: 1;
}

.sl-input--filled .sl-input {
  flex: 1;
  padding: 20px 16px 8px;
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  background: transparent;
  border: 0;
  outline: 0;
  min-width: 0;
  width: 100%;
  color: var(--md-sys-color-on-surface);
}

.sl-input--filled .sl-input-label {
  position: absolute;
  left: 16px;
  top: 16px;
  font-size: var(--md-sys-typescale-body-large-size);
  color: var(--md-sys-color-on-surface-variant);
  pointer-events: none;
  transition:
    transform var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard),
    font-size var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard),
    color var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
  transform-origin: left top;
}

.sl-input--filled .sl-input:focus + .sl-input-label,
.sl-input--filled .sl-input--has-value + .sl-input-label {
  transform: translateY(-60%) scale(0.75);
  color: var(--md-sys-color-primary);
}

.sl-input--filled:focus-within {
  border-bottom-color: var(--md-sys-color-primary);
  border-bottom-width: 2px;
}

[data-theme="dark"] .sl-input--filled {
  background: var(--md-sys-color-surface-container-highest);
}

/* ===== 通用 ===== */
.sl-input:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.sl-input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
  opacity: 0.6;
}

.sl-input--hide-number-controls[type="number"] {
  -moz-appearance: textfield;
}

.sl-input--hide-number-controls[type="number"]::-webkit-outer-spin-button,
.sl-input--hide-number-controls[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.sl-input-prefix,
.sl-input-suffix {
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: var(--md-sys-color-on-surface-variant);
}

.sl-input-supporting {
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  color: var(--md-sys-color-on-surface-variant);
  padding: 0 16px;
  margin-top: 2px;
}

.sl-input-supporting--error {
  color: var(--md-sys-color-error);
}

/* 输入框内嵌操作按钮 (保留兼容) */
:deep(.sl-input-action) {
  padding: 4px 10px;
  border-radius: var(--md-sys-shape-corner-extra-small);
  color: var(--md-sys-color-primary);
  background: color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent);
  font-size: var(--md-sys-typescale-label-medium-size);
  cursor: pointer;
  border: none;
  transition:
    background-color var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard),
    opacity var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
}

:deep(.sl-input-action:hover) {
  background: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
}

:deep(.sl-input-action:disabled) {
  opacity: 0.38;
  cursor: not-allowed;
}
</style>

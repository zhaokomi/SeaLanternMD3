<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick, type Component } from "vue";
import { Check, ChevronDown, Loader2, Search } from "lucide-vue-next";
import { i18n } from "@language";
import { useRegisterComponent } from "@composables/useRegisterComponent";

interface Option {
  label: string;
  value: string | number;
  subLabel?: string;
}

interface Props {
  modelValue?: string | number;
  options: Option[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  loading?: boolean;
  maxHeight?: string;
  previewFont?: boolean;
  componentId?: string;
  icon?: Component;
  collapsed?: boolean;
  dropdownAlign?: "left" | "right";
  dropdownWidth?: string;
  variant?: "default" | "server";
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: () => i18n.t("common.select"),
  disabled: false,
  searchable: false,
  loading: false,
  maxHeight: "280px",
  previewFont: false,
  collapsed: false,
  dropdownAlign: "left",
  dropdownWidth: "200px",
  variant: "default",
});

const _selectId = props.componentId ?? `sl-select-${Math.random().toString(36).slice(2, 8)}`;
useRegisterComponent(_selectId, {
  type: "SLSelect",
  get: (prop) => (prop === "value" ? props.modelValue : undefined),
  set: (prop, value) => {
    if (prop === "value") emit("update:modelValue", value as string | number);
  },
  call: () => undefined,
  on: () => () => {},
  el: () => containerRef.value,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
}>();

const isOpen = ref(false);
const searchQuery = ref("");
const containerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const highlightedIndex = ref(-1);

const dropdownStyle = ref<Record<string, string>>({});

const optionsMaxHeight = computed(() => {
  let maxHeight = parseInt(props.maxHeight) || 280;
  if (props.searchable) {
    maxHeight = Math.max(50, maxHeight - 50);
  }
  return `${maxHeight}px`;
});

const getFontStyle = (value: string | number) => {
  if (!props.previewFont || !value) return {};
  return { fontFamily: String(value) };
};

const selectedOption = computed(() => {
  const currentValue = props.modelValue;
  if (currentValue === undefined) return undefined;
  return props.options.find((opt: Option) => opt.value === currentValue);
});

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value.trim()) return props.options;

  const query = searchQuery.value.toLowerCase();
  return props.options.filter((opt: Option) => opt.label.toLowerCase().includes(query));
});

const updateDropdownPosition = () => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const dropdownMaxHeight = parseInt(props.maxHeight) || 280;
  const dropdownWidth = parseInt(props.dropdownWidth) || 200;
  const spaceBelow = viewportHeight - rect.bottom;
  const spaceAbove = rect.top;
  const gap = 4;

  const openUpward = spaceBelow < dropdownMaxHeight + gap && spaceAbove > spaceBelow;

  let top: number;
  let left: number;

  if (props.collapsed && props.dropdownAlign === "right") {
    left = rect.right + gap;
    top = rect.top;
  } else {
    left = props.dropdownAlign === "right" ? rect.right - dropdownWidth : rect.left;
    top = openUpward ? rect.top - dropdownMaxHeight - gap : rect.bottom + gap;
  }

  if (left + dropdownWidth > viewportWidth - gap) {
    left = viewportWidth - dropdownWidth - gap;
  }
  if (left < gap) {
    left = gap;
  }

  if (top + dropdownMaxHeight > viewportHeight - gap) {
    top = viewportHeight - dropdownMaxHeight - gap;
  }
  if (top < gap) {
    top = gap;
  }

  dropdownStyle.value = {
    position: "fixed",
    top: `${top}px`,
    left: `${left}px`,
    width: `${dropdownWidth}px`,
    zIndex: "99999",
    maxHeight: `${dropdownMaxHeight}px`,
  };
};

const toggleDropdown = () => {
  if (props.disabled) return;

  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    searchQuery.value = "";
    highlightedIndex.value = -1;
    nextTick(() => {
      updateDropdownPosition();
      if (props.searchable) {
        inputRef.value?.focus();
      }
    });
  }
};

const selectOption = (option: Option) => {
  emit("update:modelValue", option.value);
  isOpen.value = false;
  searchQuery.value = "";
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!isOpen.value) {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      toggleDropdown();
    }
    return;
  }

  const handleArrowDown = () => {
    e.preventDefault();
    highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1);
    scrollToHighlighted();
  };

  const handleArrowUp = () => {
    e.preventDefault();
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
    scrollToHighlighted();
  };

  const handleHome = () => {
    e.preventDefault();
    highlightedIndex.value = 0;
    scrollToHighlighted();
  };

  const handleEnd = () => {
    e.preventDefault();
    highlightedIndex.value = filteredOptions.value.length - 1;
    scrollToHighlighted();
  };

  const handleEnter = () => {
    e.preventDefault();
    if (highlightedIndex.value >= 0 && filteredOptions.value[highlightedIndex.value]) {
      selectOption(filteredOptions.value[highlightedIndex.value]);
    }
  };

  const handleSpace = () => {
    e.preventDefault();
    if (highlightedIndex.value >= 0 && filteredOptions.value[highlightedIndex.value]) {
      selectOption(filteredOptions.value[highlightedIndex.value]);
    }
  };

  switch (e.key) {
    case "ArrowDown":
      handleArrowDown();
      break;
    case "ArrowUp":
      handleArrowUp();
      break;
    case "Home":
      handleHome();
      break;
    case "End":
      handleEnd();
      break;
    case "Enter":
      handleEnter();
      break;
    case " ":
      handleSpace();
      break;
    case "Escape":
      isOpen.value = false;
      break;
  }
};

const scrollToHighlighted = () => {
  requestAnimationFrame(() => {
    const highlighted = dropdownRef.value?.querySelector(".highlighted");
    highlighted?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
};

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node;
  if (
    containerRef.value &&
    !containerRef.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    isOpen.value = false;
  }
};

const handleScroll = () => {
  if (isOpen.value) {
    updateDropdownPosition();
  }
};

const stopWatch = watch(searchQuery, () => {
  highlightedIndex.value = filteredOptions.value.length > 0 ? 0 : -1;
});

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("scroll", handleScroll, true);
  window.addEventListener("resize", handleScroll);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("scroll", handleScroll, true);
  window.removeEventListener("resize", handleScroll);
  stopWatch();

  containerRef.value = null;
  dropdownRef.value = null;
  inputRef.value = null;
});
</script>

<template>
  <div
    class="sl-select"
    :class="{
      'sl-select--collapsed': collapsed,
      'sl-select--server': variant === 'server',
    }"
    ref="containerRef"
  >
    <label v-if="label && !collapsed" class="sl-select-label">{{ label }}</label>

    <div
      class="sl-select-trigger"
      :class="{
        open: isOpen,
        disabled,
        'sl-select-trigger--collapsed': collapsed,
        'sl-select-trigger--server': variant === 'server',
      }"
      @click="toggleDropdown"
      @keydown="handleKeydown"
      tabindex="0"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-disabled="disabled"
      :aria-owns="isOpen ? 'sl-select-listbox' : undefined"
      :aria-label="collapsed ? placeholder : undefined"
      :aria-activedescendant="
        isOpen && highlightedIndex >= 0
          ? `option-${filteredOptions[highlightedIndex].value}`
          : undefined
      "
    >
      <component
        v-if="icon"
        :is="icon"
        class="sl-select-icon"
        :size="20"
        :stroke-width="1.8"
        aria-hidden="true"
      />
      <template v-if="!collapsed">
        <span v-if="loading" class="sl-select-loading" aria-live="polite">
          <Loader2 class="spinner" :size="16" aria-hidden="true" />
          {{ i18n.t("common.loading") }}
        </span>
        <span
          v-else-if="selectedOption"
          class="sl-select-value"
          :style="getFontStyle(selectedOption.value)"
        >
          {{ selectedOption.label }}
        </span>
        <span v-else class="sl-select-placeholder">{{ placeholder }}</span>

        <ChevronDown
          v-if="variant !== 'server'"
          class="sl-select-arrow"
          :class="{ open: isOpen }"
          :size="16"
          aria-hidden="true"
        />
        <ChevronDown
          v-else
          class="sl-select-arrow"
          :class="{ open: isOpen }"
          :size="14"
          aria-hidden="true"
        />
      </template>
    </div>

    <Teleport to="body">
      <Transition name="dropdown">
        <div v-if="isOpen" class="sl-select-dropdown" ref="dropdownRef" :style="dropdownStyle">
          <div v-if="searchable" class="sl-select-search">
            <Search class="search-icon" :size="16" aria-hidden="true" />
            <input
              ref="inputRef"
              v-model="searchQuery"
              type="text"
              :placeholder="i18n.t('common.search')"
              class="sl-select-input"
              @keydown="handleKeydown"
              :aria-label="i18n.t('common.search_options')"
            />
          </div>

          <div
            id="sl-select-listbox"
            class="sl-select-options"
            :style="{ maxHeight: optionsMaxHeight }"
            role="listbox"
            :aria-activedescendant="
              highlightedIndex >= 0
                ? `option-${filteredOptions[highlightedIndex].value}`
                : undefined
            "
          >
            <div v-if="filteredOptions.length === 0" class="sl-select-empty" role="presentation">
              {{ i18n.t("common.no_match") }}
            </div>
            <div
              v-for="(option, index) in filteredOptions"
              :key="option.value"
              :id="`option-${option.value}`"
              class="sl-select-option"
              :class="{
                selected: option.value === modelValue,
                highlighted: index === highlightedIndex,
              }"
              :style="getFontStyle(option.value)"
              @click="selectOption(option)"
              @mouseenter="highlightedIndex = index"
              role="option"
              :aria-selected="option.value === modelValue"
              tabindex="-1"
            >
              <span class="option-label-wrap">
                <span class="option-label">{{ option.label }}</span>
                <span v-if="option.subLabel" class="option-sublabel">{{ option.subLabel }}</span>
              </span>
              <Check
                v-if="option.value === modelValue"
                class="check-icon"
                :size="16"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.sl-select {
  position: relative;
  width: 100%;
}

.sl-select-label {
  display: block;
  font-size: var(--sl-font-size-sm);
  font-weight: 500;
  color: var(--sl-text-secondary);
  margin-bottom: var(--sl-space-xs);
}

.sl-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  font-size: var(--md-sys-typescale-body-large-size);
  background: transparent;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-extra-small);
  cursor: pointer;
  transition: all var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
  color: var(--md-sys-color-on-surface);
  min-height: 40px;
  box-sizing: border-box;
}

.sl-select-trigger:hover:not(.disabled) {
  border-color: var(--md-sys-color-on-surface-variant);
}

.sl-select-trigger:focus {
  border-color: var(--md-sys-color-primary);
  box-shadow: none;
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: -2px;
}

.sl-select-trigger.open {
  border-color: var(--md-sys-color-primary);
  box-shadow: none;
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: -2px;
}

.sl-select-trigger.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sl-select-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sl-select-placeholder {
  color: var(--sl-text-tertiary);
  flex: 1;
}

.sl-select-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--sl-text-tertiary);
  flex: 1;
}

.sl-select-loading .spinner {
  animation: spin 1s linear infinite;
  transform-origin: center;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.sl-select-arrow {
  color: var(--sl-text-tertiary);
  transition: transform var(--sl-transition-fast);
  flex-shrink: 0;
  margin-left: 8px;
}

.sl-select-arrow.open {
  transform: rotate(180deg);
}

.sl-select-icon {
  flex-shrink: 0;
  color: var(--sl-text-secondary);
  transition: color var(--sl-transition-fast);
}

.sl-select-trigger:hover:not(.disabled) .sl-select-icon {
  color: var(--sl-primary);
}

.sl-select-trigger--collapsed {
  width: 40px;
  height: 40px;
  justify-content: center;
  padding: 0;
  min-height: 40px;
}

.sl-select-trigger--collapsed:hover:not(.disabled) {
  background: var(--sl-primary-bg);
  border-color: var(--sl-primary-alpha);
}

.sl-select--collapsed {
  width: auto;
}

/* Server variant styles */
.sl-select--server {
  width: 100%;
}

.sl-select-trigger--server {
  gap: var(--sl-space-sm);
  padding: 8px;
  min-height: 40px;
  margin-top: 5px;
  background: transparent;
  border: 1px solid var(--md-sys-color-outline);
  color: var(--md-sys-color-on-surface-variant);
  border-radius: var(--md-sys-shape-corner-full);
}

.sl-select-trigger--server:hover:not(.disabled) {
  background: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
  color: var(--md-sys-color-on-surface);
  border-color: var(--md-sys-color-outline);
}

.sl-select-trigger--server:hover:not(.disabled) .sl-select-icon {
  color: var(--md-sys-color-primary);
}

.sl-select-trigger--server.open {
  background: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 10%, transparent);
  border-color: var(--md-sys-color-primary);
}

.sl-select-trigger--server .sl-select-value {
  text-align: left;
}

.sl-select-trigger--server .sl-select-placeholder {
  text-align: left;
}

.sl-select--server.collapsed .sl-select-trigger--server {
  width: 40px;
  height: 40px;
  justify-content: center;
  padding: 0;
  margin-left: auto;
  margin-right: auto;
}

.sl-select--server.collapsed .sl-select-trigger--server:hover:not(.disabled) {
  background: var(--sl-primary-bg);
}
</style>

<style>
/* 下拉框样式 - 非 scoped，因为使用 Teleport 渲染到 body */
.sl-select-dropdown {
  background: var(--md-sys-color-surface-container);
  border: none;
  border-radius: var(--md-sys-shape-corner-extra-small);
  box-shadow: var(--md-sys-elevation-level-2);
  overflow: hidden;
  color: var(--md-sys-color-on-surface);
  transform-origin: top center;
}

[data-theme="dark"] .sl-select-dropdown {
  background: var(--md-sys-color-surface-container-high);
}

[data-acrylic="true"] .sl-select-dropdown {
  background: color-mix(in srgb, var(--md-sys-color-surface-container) 88%, transparent);
  backdrop-filter: blur(var(--sl-blur-lg));
  -webkit-backdrop-filter: blur(var(--sl-blur-lg));
  border: 1px solid var(--md-sys-color-outline-variant);
}

.sl-select-dropdown .sl-select-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--sl-border);
}

.sl-select-dropdown .search-icon {
  color: var(--sl-text-tertiary);
  flex-shrink: 0;
}

.sl-select-dropdown .sl-select-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--sl-font-size-base);
  color: var(--sl-text-primary);
  outline: none;
  width: 100%;
}

.sl-select-dropdown .sl-select-input::placeholder {
  color: var(--sl-text-tertiary);
}

.sl-select-dropdown .sl-select-options {
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.sl-select-dropdown .sl-select-empty {
  padding: 16px;
  text-align: center;
  color: var(--sl-text-tertiary);
  font-size: var(--sl-font-size-base);
}

.sl-select-dropdown .sl-select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
  user-select: none;
  position: relative;
  min-height: 40px;
}

.sl-select-dropdown .sl-select-option:hover,
.sl-select-dropdown .sl-select-option.highlighted {
  background: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
}

.sl-select-dropdown .sl-select-option:active {
  background: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
}

.sl-select-dropdown .sl-select-option.selected {
  color: var(--md-sys-color-primary);
  font-weight: 500;
}

.sl-select-dropdown .sl-select-option .option-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sl-select-dropdown .sl-select-option .option-label-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.sl-select-dropdown .sl-select-option .option-sublabel {
  font-size: var(--md-sys-typescale-body-small-size);
  color: var(--md-sys-color-on-surface-variant);
  font-family: var(--sl-font-mono);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sl-select-dropdown .sl-select-option .check-icon {
  color: var(--md-sys-color-primary);
  flex-shrink: 0;
  margin-left: 8px;
}

@keyframes check-in {
  from {
    opacity: 0;
    transform: scale(0.5) rotate(-45deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.dropdown-enter-active {
  animation: dropdown-enter var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-decelerated);
}

.dropdown-leave-active {
  animation: dropdown-leave var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-accelerated);
}

@keyframes dropdown-enter {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes dropdown-leave {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-4px) scale(0.96);
  }
}

@media (max-width: 768px) {
  .sl-select-trigger {
    min-height: 44px;
    font-size: 16px;
  }

  .sl-select-option {
    min-height: 44px;
  }
}
</style>

<script setup lang="ts">
import { ref } from "vue";
import "../../packages/web/src/components/index.js";
import "../../packages/theme/src/tokens.css";

const email = ref("");
const updates = ref(true);
const framework = ref("vue");

function updateEmail(value: unknown) { email.value = String(value ?? ""); }
function updateUpdates(value: unknown) { updates.value = Boolean(value); }
function updateFramework(value: unknown) { framework.value = String(value ?? ""); }
function submit(event: Event) {
  event.preventDefault();
  console.log(Object.fromEntries(new FormData(event.target as HTMLFormElement).entries()));
}
</script>

<template>
  <form @submit="submit">
    <cu-text-field
      v-cu-model="{ value: email, onUpdate: updateEmail, event: 'cu-input' }"
      name="email" type="email" label="Email" required
    ></cu-text-field>
    <cu-checkbox
      v-cu-model="{ value: updates, property: 'checked', onUpdate: updateUpdates }"
      name="updates" value="yes"
    >Receive updates</cu-checkbox>
    <cu-select
      v-cu-model="{ value: framework, onUpdate: updateFramework, event: 'cu-change' }"
      name="framework" label="Framework"
    >
      <option value="react">React</option>
      <option value="vue">Vue</option>
    </cu-select>
    <cu-button type="submit" variant="accent">
      <cu-icon name="check" size="18"></cu-icon> Save changes
    </cu-button>
  </form>
</template>

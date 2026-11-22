<script lang="ts">
  import { cuModel } from "@componentui/svelte";
  import "@componentui/theme/tokens.css";
  import "@componentui/web/components";

  let framework = $state("react");
  let updates = $state(true);
</script>

<h2>ComponentUI in Svelte 5</h2>
<form onsubmit={(event) => {
  event.preventDefault();
  console.log(Object.fromEntries(new FormData(event.currentTarget).entries()));
}}>
  <cu-select name="framework" label="Framework"
    use:cuModel={{ value: framework, event: "cu-change",
      onUpdate: (next) => framework = String(next ?? "") }}>
    <option value="react">React</option>
    <option value="vue">Vue</option>
    <option value="svelte">Svelte</option>
  </cu-select>
  <cu-checkbox name="updates" value="yes"
    use:cuModel={{ value: updates, property: "checked",
      onUpdate: (next) => updates = Boolean(next) }}>
    Enable updates
  </cu-checkbox>
  <cu-button type="submit" variant="accent">
    <cu-icon name="check" size="18"></cu-icon> Save
  </cu-button>
</form>

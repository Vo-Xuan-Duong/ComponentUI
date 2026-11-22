/**
 * React 18/19 example for a consumer within the ComponentUI workspace.
 * Not part of the dependency-free Playground; requires a React bundler.
 */
import * as React from "react";
import { createReactComponents } from "../packages/react/src/index.js";
import "../packages/web/src/components/index.js";
import "../packages/theme/src/tokens.css";

const { Button, TextField, Checkbox, Select, Icon } = createReactComponents(React);

export default function ComponentUIReactExample() {
  const [email, setEmail] = React.useState("");
  const [updates, setUpdates] = React.useState(true);
  const [framework, setFramework] = React.useState("react");

  return (
    <form onSubmit={event => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      console.log(Object.fromEntries(formData.entries()));
    }}>
      <TextField
        name="email"
        label="Email"
        type="email"
        required
        value={email}
        onCuInput={event => setEmail(String(event.detail.value ?? ""))}
      />
      <Checkbox
        name="updates"
        value="yes"
        checked={updates}
        onCuChange={event => setUpdates(Boolean(event.detail.checked))}
      >
        Receive updates
      </Checkbox>
      <Select name="framework" label="Framework" value={framework}
        onCuChange={event => setFramework(String(event.detail.value ?? ""))}>
        <option value="react">React</option>
        <option value="vue">Vue</option>
      </Select>
      <Button type="submit" variant="accent">
        <Icon name="check" size="18" /> Save changes
      </Button>
    </form>
  );
}

import * as React from "react";
import { useState } from "react";
import { Button, Icon, TextField, Select, Card } from "@componentui/react/components";
import "@componentui/web/components";
import "@componentui/theme/tokens.css";

export function SettingsPanel() {
  const [name,setName] = useState("");
  const [framework,setFramework] = useState("react");
  return (
    <Card variant="elevated">
      <h2 slot="header">Project settings</h2>
      <form onSubmit={event => {
        event.preventDefault();
        console.log(Object.fromEntries(new FormData(event.currentTarget).entries()));
      }}>
        <TextField label="Project name" name="name" value={name}
          onCuInput={event => setName(String(event.detail.value ?? ""))} />
        <Select label="Framework" name="framework" value={framework}
          onCuChange={event => setFramework(String(event.detail.value ?? ""))}>
          <option value="react">React</option>
          <option value="vue">Vue</option>
          <option value="svelte">Svelte</option>
        </Select>
        <Button variant="accent" type="submit">
          <Icon name="check" size={18} /> Save
        </Button>
      </form>
    </Card>
  );
}

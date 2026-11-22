/**
 * Ready-to-use React 18/19 components. Registration of cu-* elements remains
 * explicit and separate: import "@componentui/web/components" in a client entry.
 */
import * as React from "react";
import { createReactComponents } from "./index.js";

export const { Button, TextField, PasswordField, FilePicker, AppShell, NavigationView, SettingsPage, SettingsGroup, SettingsItem, TextArea, NumberField, SearchBox, Checkbox, Switch, Dialog, Select, Radio, RadioGroup, Tab, Tabs, Tooltip, Popover, DatePicker, Slider, ProgressBar, Badge, Avatar, Menu, MenuItem, Icon, Card, Divider, Skeleton, Spinner, Alert, Breadcrumb, BreadcrumbItem, DataTable, TreeView, TreeItem, ListBox, ListOption, Combobox, ComboOption, ContextMenu } = createReactComponents(React);

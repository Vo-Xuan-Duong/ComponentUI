# Component inventory

The catalog is tracked as data at [catalog.json](../design-system/components/catalog.json). **All entries are planned**, not published components. The preview demonstrates some using native HTML and CSS.

The component families cover actions, input/form, navigation, data display, feedback/overlays, layout, desktop patterns and complex application patterns.

| Priority | Meaning | Release gate |
| --- | --- | --- |
| P0 | Foundation: usable in most personal projects | Contract + implementation + tests + accessibility review + docs |
| P1 | Extended workflows (navigation, rich data, productivity) | Same gates, later milestone |
| P2 | Complex/high-maintenance patterns | Build or integrate only on real demand |

## Quality checklist for every component

1. Public API and events documented with per-platform mappings.
2. Light/dark/high-contrast review; semantic tokens only.
3. Hover, focus, active, disabled and validation/loading states if applicable.
4. Keyboard interactions, names/roles/values, screen reader messages.
5. Unit, integration, visual and responsive tests.
6. Tests in at least two framework consumers for the Web renderer.
7. SSR/hydration guidance where relevant and upgrade notes for breaking changes.

## Strategy

Do **not** implement 100 components independently from scratch in the first release. Prioritize P0 and use mature low-level building blocks with compatible licenses. Keep the universal design contract above framework adapters. Package managers and runtime code remain platform-specific.

## Detailed inventory

### Actions

`Button` · `SplitButton` · `IconButton` · `ToggleButton` · `ToggleButtonGroup` · `Hyperlink` · `CommandBar` · `Toolbar` · `MenuButton` · `FloatingActionButton`

### Inputs

`TextField` · `PasswordField` · `TextArea` · `SearchBox` · `NumberField` · `Select` · `Combobox` · `AutoComplete` · `Checkbox` · `Radio` · `RadioGroup` · `Switch` · `Slider` · `RangeSlider` · `Rating` · `DatePicker` · `TimePicker` · `DateRangePicker` · `ColorPicker` · `FilePicker` · `FileUpload` · `OTPInput` · `TagInput` · `RichTextEditor` · `FormField` · `Form`

### Navigation

`NavigationView` · `Sidebar` · `TopNav` · `Breadcrumb` · `Tabs` · `VerticalTabs` · `Pagination` · `Stepper` · `TreeView` · `CommandPalette` · `Menu` · `MenuItem` · `ContextMenu` · `BottomNavigation` · `SplitView` · `TabView`

### Data display

`Card` · `List` · `ListItem` · `DataTable` · `DataGrid` · `TreeTable` · `DescriptionList` · `Badge` · `Chip` · `Tag` · `Avatar` · `AvatarGroup` · `Tooltip` · `Calendar` · `Timeline` · `Kbd` · `CodeBlock` · `Statistic` · `ChartContainer` · `EmptyState` · `Skeleton` · `Divider` · `ScrollArea` · `VirtualList` · `Image` · `Carousel`

### Feedback & overlays

`ProgressBar` · `ProgressRing` · `Spinner` · `Toast` · `Snackbar` · `InfoBar` · `Alert` · `NotificationCenter` · `Dialog` · `ConfirmDialog` · `Drawer` · `Flyout` · `Popover` · `TeachingTip` · `Callout` · `Banner` · `LoadingOverlay`

### Layouts

`Container` · `Stack` · `Grid` · `Flex` · `Splitter` · `ResizablePanel` · `ScrollView` · `Collapsible` · `Accordion` · `AppShell` · `PageHeader` · `Surface` · `Masonry`

### Desktop patterns

`TitleBar` · `WindowControls` · `StatusBar` · `FileExplorer` · `PropertyGrid` · `TaskPanel` · `SettingsPage` · `TreeList` · `CommandSurface` · `WindowPane`

### Advanced patterns

`FilterBar` · `DataFilter` · `KanbanBoard` · `ChatComposer` · `MessageList` · `SearchResults` · `MediaPlayer` · `UploadManager` · `Wizard` · `DashboardShell`


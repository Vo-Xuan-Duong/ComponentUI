# Carousel and PropertyGrid (preview)

Import the registry or standalone entrypoints:

```js
import "@componentui/web/components/carousel";
import "@componentui/web/components/property-grid";
```

## Carousel

```html
<cu-carousel id="highlights" label="Highlights" loop>
  <div slot="slide-first">Custom content</div>
</cu-carousel>
```

```js
const carousel = document.querySelector("#highlights");
carousel.items = [
  {id:"first",title:"First slide"},
  {id:"second",title:"Second slide",description:"A textual slide"}
];
carousel.addEventListener("cu-change", event => console.log(event.detail.index));
```

Each item has a unique nonempty id and optional title, description, src
and alt. Supply image alt text when appropriate. A matching named slot
slide-ID replaces the default image and text content. Active index is zero
based, clamped by default or wrapped when loop is enabled. Use next(),
previous(), goTo(index), or assign active (silent). Buttons, slide indicators,
arrow keys on navigation controls, Home/End and horizontal touch swipes
provide manual navigation. No autoplay: reading content remains under user
control. Nonactive slotted content is not rendered. No external image service.
The change event provides index, previousIndex, value (slide id) and item.
The component has a labeled region and slide announcements.

## PropertyGrid

```html
<cu-property-grid id="inspector" label="Properties" searchable></cu-property-grid>
```

```js
const inspector = document.querySelector("#inspector");
inspector.items = [
  {key:"width",label:"Width",group:"Layout",type:"number",
   value:320,min:200,max:600,step:10},
  {key:"enabled",label:"Enabled",type:"boolean",value:true}
];
inspector.addEventListener("cu-change", event => {
  console.log(event.detail.property,event.detail.value);
});
```

Unique property keys are required. Types: text, number, boolean, select,
color (#rrggbb). Items may contain group, label, description, readonly,
disabled, required, numeric min/max/step, and select options with disabled
flags. Required text, finite number bounds and steps, select membership,
and color syntax are validated. Invalid edits retain the last accepted
value; Escape restores it. Groups can be collapsed; search expands matching
groups and ignores Vietnamese diacritics. Commit occurs on native change.
The values getter returns a snapshot; setValue(key,value) validates and
updates silently, including readonly fields for application-owned updates.
cu-change exposes property/key, value, propertyValue, previousPropertyValue
and item. This is a property inspector rather than a spreadsheet/grid
or form-associated control. It uses native editors and has no persistence
or arbitrary custom editor factory.

## Frameworks and acceptance

React exports Carousel and PropertyGrid. Use property-bound items and
onCuChange. Vue/Svelte can set items directly and subscribe to cu-change.
Electron/Tauri reuse the web components. Verify native color/number
editors, focus on slide updates, keyboard navigation, touch gestures,
RTL, empty datasets, disabled and readonly states, dark mode and
custom slots in a browser. Run npm run check, npm run check:packages
and npm run preview locally. Both remain preview pending acceptance.

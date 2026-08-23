# Base UI vs Radix — API Differences (OmniStack uses BASE)

Check the `base` field from `npx shadcn@latest info` (OmniStack: `"base"`). Radix examples from docs/tutorials online will NOT work here. Source: shadcn-ui/ui skills/rules/base-vs-radix.md (MIT), adapted.

## Composition: render (base) vs asChild (radix)

❌ Never in OmniStack:
```tsx
<DialogTrigger asChild><Button>Open</Button></DialogTrigger>
<DialogTrigger><div><Button>Open</Button></div></DialogTrigger>  // wrapper div also wrong
```

✅ Base UI:
```tsx
<DialogTrigger render={<Button />}>Open</DialogTrigger>
```

Applies to ALL trigger/close components: `DialogTrigger`, `SheetTrigger`, `AlertDialogTrigger`, `DropdownMenuTrigger`, `PopoverTrigger`, `TooltipTrigger`, `CollapsibleTrigger`, `DialogClose`, `SheetClose`, `NavigationMenuLink`, `BreadcrumbLink`, `SidebarMenuButton`, `Badge`, `Item`.

## Non-button element via render → add nativeButton={false}

When `render` renders an `<a>`/`<span>` etc. instead of a button:
```tsx
<Button render={<a href="/docs" />} nativeButton={false}>Read the docs</Button>
```
Same for non-Button triggers: `<PopoverTrigger render={<InputGroupAddon />} nativeButton={false}>Pick date</PopoverTrigger>`

(Radix equivalent for comparison: `<Button asChild><a href="/docs">…</a></Button>`.)

## Select

**Base REQUIRES `items` prop on root. Placeholder = `{ value: null }` item.**

```tsx
const items = [
  { label: "Select a fruit", value: null },   // placeholder
  { label: "Apple", value: "apple" },
]

<Select items={items}>
  <SelectTrigger><SelectValue /></SelectTrigger>
  <SelectContent>
    <SelectGroup>
      {items.map((item) => item.value && (
        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
      ))}
    </SelectGroup>
  </SelectContent>
</Select>
```

Radix differences (do NOT use): no items prop, placeholder via `<SelectValue placeholder="...">`.

**Content positioning:** base `alignItemWithTrigger={false} side="bottom"` vs radix `position="popper"`.

**Base-only extras:** `multiple` + `defaultValue={[]}` with render-function SelectValue; object values via `itemToStringValue`:
```tsx
<Select items={items} multiple defaultValue={[]}>
  <SelectTrigger>
    <SelectValue>{(value: string[]) => value.length === 0 ? "Select fruits" : `${value.length} selected`}</SelectValue>
  </SelectTrigger>
  ...
```

## ToggleGroup

| Aspect | Base ✅ | Radix ❌ |
|--------|---------|----------|
| Single select | no prop needed | `type="single"` |
| Multi select | `multiple` boolean | `type="multiple"` |
| defaultValue | ALWAYS array `["daily"]` | string `"daily"` |
| Controlled single | `value={[v]} onValueChange={(v) => set(v[0])}` | plain string |

```tsx
<ToggleGroup defaultValue={["daily"]} spacing={2}>
  <ToggleGroupItem value="daily">Daily</ToggleGroupItem>
  <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
</ToggleGroup>

<ToggleGroup multiple>…multi…</ToggleGroup>
```

## Slider

Single thumb takes a SCALAR in base:
```tsx
<Slider defaultValue={50} max={100} step={1} />          // base ✅
<Slider defaultValue={[50]} max={100} step={1} />        // radix pattern ❌ in base
```
Range sliders still use arrays in both. Controlled base may need a cast:
```tsx
const [value, setValue] = React.useState([0.3, 0.7])
<Slider value={value} onValueChange={(v) => setValue(v as number[])} />
```

## Accordion

No `type` prop, no `collapsible` in base; `defaultValue` is always an array; multi via `multiple`:
```tsx
<Accordion defaultValue={["item-1"]}>
  <AccordionItem value="item-1">…</AccordionItem>
</Accordion>

<Accordion multiple defaultValue={["item-1", "item-2"]}>…</Accordion>
```

Radix shape (`type="single" collapsible defaultValue="item-1"`) is INVALID here.

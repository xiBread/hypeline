import { Select as SelectPrimitive } from "bits-ui";
import Content from "./select-content.svelte";
import Group from "./select-group.svelte";
import Item from "./select-item.svelte";
import Label from "./select-label.svelte";
import ScrollDownButton from "./select-scroll-down-button.svelte";
import ScrollUpButton from "./select-scroll-up-button.svelte";
import Trigger from "./select-trigger.svelte";

const Root = SelectPrimitive.Root;

export { Content, Group, Item, Label, Root, ScrollDownButton, ScrollUpButton, Trigger };

<script lang="ts">
  /**
   * @component Button TypeScript
   * @wrapper
   */
  import { global as globalThis } from '@storybook/global';
  // @ts-ignore
  const Button = globalThis.Components?.Button;

  /**
   * Rounds the button
   */
  export let primary: boolean = false;

  /**
   * Displays the count
   */
  export let count: number = 0;

  /**
   * Button text
   * @slot
   */
  export let text: string = 'You clicked';

  function handleClick(_event: MouseEvent) {
    count += 1;
  }
</script>

<h1>Button TypeScript</h1>

<Button {primary} on:click on:click={handleClick} label="{text}: {count}" />

<p>A little text to show this is a view.</p>
<p>If we need to test components in a Svelte environment, for instance to test slot behaviour,</p>
<p>then wrapping the component up in a view</p>
<p>made just for the story is the simplest way to achieve this.</p>

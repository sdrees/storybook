<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let onClick = (event) => {
    dispatch('click', event);
  };
</script>

<div class="main">
  <h1>Link Action</h1>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <button on:click={onClick} class="link">
    Return to the <code class="code">Welcome</code> view story.
  </button>
</div>

<style>
</style>

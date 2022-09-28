<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let onClick = (event) => {
    dispatch('click', event);
  };
</script>

<div class="main">
  <h1>Link Action</h1>
  <button on:click={onClick} class="link">
    Return to the <code class="code">Welcome</code> view story.
  </button>
</div>

<style>
</style>

<script lang="ts">
  export let count = 0;

  function onIncrement() {
    count +=1 
  }

  function onDecrement() {
    count +=1 
  }
</script>

<div>
  <h1>Svelte - Counter</h1>
  <h2 data-testid="count">You clicked {count} times</h2>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <button type="button" on:click={onDecrement}>Decrement</button>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <button type="button" on:click={onIncrement}>Increment</button>
</div>

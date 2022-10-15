<script>
    import { getContext } from 'svelte';

    let value = getContext('storybook/test') || 'No value';
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div on:click>
    Value read from context: {value}
</div>

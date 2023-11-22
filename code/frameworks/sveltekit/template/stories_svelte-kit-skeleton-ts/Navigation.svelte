<script>
	import { goto, invalidate, invalidateAll, afterNavigate } from '$app/navigation';

	export let afterNavigateFn;

	afterNavigate(afterNavigateFn);
</script>

<button
	on:click={() => {
		goto('/storybook');
	}}>goto</button
>

<button
	on:click={() => {
		invalidate('/storybook');
	}}>invalidate</button
>

<button
	on:click={() => {
		invalidateAll();
	}}>invalidateAll</button
>

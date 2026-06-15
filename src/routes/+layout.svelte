<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import Sidebar from '../components/Sidebar.svelte';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="app-shell">
  <Sidebar />
  <div class="page-content">
    {@render children()}
  </div>
</div>

<style>
  .app-shell {
    display: flex;
    min-height: 100vh;
  }

  .page-content {
    flex: 1;
    min-width: 0;
    overflow-x: visible;
  }
</style>

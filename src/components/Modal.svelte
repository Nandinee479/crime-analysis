<script>
  import { createEventDispatcher } from 'svelte'
  export let title = ''
  export let open = false

  const dispatch = createEventDispatcher()

  function close() { dispatch('close') }

  function onKey(e) { if (e.key === 'Escape') close() }
</script>

<svelte:window on:keydown={onKey} />

{#if open}
  <div class="modal-overlay" on:click|self={close} role="dialog" aria-modal="true">
    <div class="modal">
      <div class="modal-header">
        <h3>{title}</h3>
        <button class="modal-close" on:click={close} aria-label="Close">✕</button>
      </div>
      <div class="modal-body">
        <slot name="body" />
      </div>
      <div class="modal-footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
{/if}

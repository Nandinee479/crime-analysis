<script>
  import { createEventDispatcher } from 'svelte'
  export let open = false
  export let message = 'Are you sure you want to delete this record? This action cannot be undone.'

  const dispatch = createEventDispatcher()
</script>

{#if open}
  <div class="modal-overlay" on:click|self={() => dispatch('cancel')} role="dialog" aria-modal="true">
    <div class="modal confirm-modal">
      <div class="modal-header">
        <h3>⚠️ Confirm Delete</h3>
        <button class="modal-close" on:click={() => dispatch('cancel')}>✕</button>
      </div>
      <div class="confirm-body">{message}</div>
      <div class="modal-footer">
        <button class="btn btn-secondary" on:click={() => dispatch('cancel')}>Cancel</button>
        <button class="btn btn-danger" on:click={() => dispatch('confirm')}>Delete</button>
      </div>
    </div>
  </div>
{/if}

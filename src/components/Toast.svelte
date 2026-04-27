<script>
  import { toastStore } from '../stores/navigation.js'
  import { fly } from 'svelte/transition'

  let toasts = []

  toastStore.subscribe(t => {
    if (!t) return
    toasts = [...toasts, t]
    setTimeout(() => { toasts = toasts.filter(x => x.id !== t.id) }, 3200)
  })
</script>

<div class="toast-wrap">
  {#each toasts as t (t.id)}
    <div
      class="toast toast-{t.type}"
      transition:fly={{ x: 60, duration: 250 }}
    >
      {#if t.type === 'success'}✅{:else if t.type === 'error'}❌{:else}ℹ️{/if}
      {t.message}
    </div>
  {/each}
</div>

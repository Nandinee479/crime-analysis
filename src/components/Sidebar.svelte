<script>
  import { currentPage } from '../stores/navigation.js'

  const navItems = [
    { id: 'dashboard',     label: 'Dashboard',          icon: '📊', section: null },
    { id: 'crime-type',    label: 'Crime Types',         icon: '🏷️', section: 'Master Data' },
    { id: 'location',      label: 'Locations',           icon: '📍', section: null },
    { id: 'suspect',       label: 'Suspects',            icon: '🔍', section: null },
    { id: 'crime',         label: 'Crimes',              icon: '🚔', section: 'Records' },
    { id: 'crime-suspect', label: 'Crime ↔ Suspects',   icon: '🔗', section: null },
    { id: 'victim',        label: 'Victims',             icon: '👤', section: null },
  ]

  let sections = []
  let seen = new Set()
  for (const item of navItems) {
    if (item.section && !seen.has(item.section)) {
      seen.add(item.section)
      sections.push(item.section)
    }
  }

  function navigate(id) { currentPage.set(id) }
</script>

<nav class="sidebar">
  <div class="sidebar-header">
    <h1>🔒 Crime Analysis</h1>
    <p>Management System</p>
  </div>

  <div class="sidebar-section">
    {#each navItems as item, i}
      {#if item.section}
        <div class="sidebar-label">{item.section}</div>
      {/if}
      {#if i === 0 && !item.section}
        <div class="sidebar-label">Overview</div>
      {/if}
      <button
        class="nav-item"
        class:active={$currentPage === item.id}
        on:click={() => navigate(item.id)}
      >
        <span class="nav-icon">{item.icon}</span>
        {item.label}
      </button>
    {/each}
  </div>

  <div style="flex:1"></div>
  <div style="padding:16px 20px; font-size:11px; opacity:.45; border-top:1px solid rgba(255,255,255,.1);">
    Crime Analysis System v1.0
  </div>
</nav>

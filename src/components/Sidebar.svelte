<script>
  import { currentPage } from '../stores/navigation.js'
  import { logout, isAdmin } from '../stores/auth.js'

  export let user

  $: admin = $isAdmin

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
  function handleLogout() { logout(); currentPage.set('dashboard') }
</script>

<nav class="sidebar">
  <div class="sidebar-header">
    <h1>🔒 Crime Analysis</h1>
    <p>Management System</p>
  </div>

  <div class="user-info">
    <div class="user-avatar">{user.name.charAt(0)}</div>
    <div class="user-details">
      <span class="user-name">{user.name}</span>
      <span class="user-role">{admin ? 'Administrator' : 'Student'}</span>
    </div>
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

  <div class="sidebar-footer">
    <button class="btn-logout" on:click={handleLogout}>
      <span class="nav-icon">🚪</span>
      Sign Out
    </button>
    <div class="sidebar-version">Crime Analysis System v1.0</div>
  </div>
</nav>

<style>
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,.15);
  }
  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .user-details {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .user-name {
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .user-role {
    font-size: 11px;
    opacity: .6;
  }
  .sidebar-footer {
    padding: 0 16px 16px;
    border-top: 1px solid rgba(255,255,255,.1);
  }
  .btn-logout {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border: none;
    background: rgba(255,255,255,.1);
    color: inherit;
    width: 100%;
    font-size: 13px;
    border-radius: 8px;
    cursor: pointer;
    transition: background .2s ease;
    font-family: inherit;
  }
  .btn-logout:hover {
    background: rgba(255,255,255,.2);
  }
  .sidebar-version {
    font-size: 10px;
    opacity: .4;
    text-align: center;
    margin-top: 8px;
  }
</style>

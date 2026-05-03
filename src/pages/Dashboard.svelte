<script>
  import { currentPage } from '../stores/navigation.js'
  import { onMount } from 'svelte'

  let stats = null
  let loading = true

  onMount(async () => {
    stats = await window.api.dashboard.getStats()
    loading = false
  })

  function severityColor(s) {
    if (!s) return '#9C27B0'
    const l = s.toLowerCase()
    if (l === 'high')   return '#C62828'
    if (l === 'medium') return '#E65100'
    if (l === 'low')    return '#2E7D32'
    return '#9C27B0'
  }

  const statCards = [
    { key: 'totalCrimes',    label: 'Total Crimes',    icon: '🚔', bg: '#EDE7F6', color: '#4527A0', page: 'crime' },
    { key: 'totalSuspects',  label: 'Total Suspects',  icon: '🔍', bg: '#E3F2FD', color: '#01579B', page: 'suspect' },
    { key: 'totalVictims',   label: 'Total Victims',   icon: '👤', bg: '#FCE4EC', color: '#880E4F', page: 'victim' },
    { key: 'totalLocations', label: 'Crime Locations', icon: '📍', bg: '#E8F5E9', color: '#1B5E20', page: 'location' },
  ]

  function maxCount(arr) {
    return arr && arr.length ? Math.max(...arr.map(r => r.count), 1) : 1
  }

  const BAR_COLORS = ['#1A237E','#283593','#303F9F','#3949AB','#3F51B5']
</script>

<div class="page-header">
  <div>
    <h2>Dashboard</h2>
    <p>Overview of crime analysis data</p>
  </div>
</div>

<div class="content-area">
  {#if loading}
    <p style="color:#888; padding:40px 0; text-align:center;">Loading statistics…</p>
  {:else if stats}

    <!-- Stat cards -->
    <div class="stats-grid">
      {#each statCards as c}
        <button class="stat-card stat-card-interactive" on:click={() => currentPage.set(c.page)} type="button">
          <div class="stat-icon" style="background:{c.bg}; color:{c.color};">{c.icon}</div>
          <div>
            <div class="stat-value" style="color:{c.color};">{stats[c.key]}</div>
            <div class="stat-label">{c.label}</div>
          </div>
          <div class="stat-card-arrow">→</div>
        </button>
      {/each}
    </div>

    <!-- Charts + recent crimes -->
    <div class="charts-grid" style="margin-bottom:20px;">

      <!-- Crimes by type -->
      <div class="card" style="padding:20px 24px;">
        <h4 style="font-size:15px; color:var(--md-primary); margin-bottom:16px;">Crimes by Type</h4>
        {#if stats.crimesByType.length === 0}
          <p style="color:#aaa; font-size:13px;">No data yet</p>
        {:else}
          <div class="chart-bar-wrap">
            {#each stats.crimesByType as row, i}
              <div class="chart-row">
                <div class="chart-label">
                  <span>{row.Type_Name || 'Unknown'}</span>
                  <span style="font-weight:600;">{row.count}</span>
                </div>
                <div class="chart-track">
                  <div class="chart-fill"
                    style="width:{(row.count / maxCount(stats.crimesByType)) * 100}%; background:{BAR_COLORS[i % BAR_COLORS.length]};">
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Crimes by severity -->
      <div class="card" style="padding:20px 24px;">
        <h4 style="font-size:15px; color:var(--md-primary); margin-bottom:16px;">Crimes by Severity</h4>
        {#if stats.crimesBySeverity.length === 0}
          <p style="color:#aaa; font-size:13px;">No data yet</p>
        {:else}
          <div class="chart-bar-wrap">
            {#each stats.crimesBySeverity as row}
              <div class="chart-row">
                <div class="chart-label">
                  <span>{row.Severity}</span>
                  <span style="font-weight:600;">{row.count}</span>
                </div>
                <div class="chart-track">
                  <div class="chart-fill"
                    style="width:{(row.count / maxCount(stats.crimesBySeverity)) * 100}%; background:{severityColor(row.Severity)};">
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Recent crimes -->
    <div class="card">
      <div style="padding:16px 24px; border-bottom:1px solid #ECEFF1;">
        <h4 style="font-size:15px; color:var(--md-primary);">Recent Crimes</h4>
      </div>
      {#if stats.recentCrimes.length === 0}
        <div class="empty-state">
          <div class="icon">🚔</div>
          <p>No crime records yet. Add crimes from the Crimes menu.</p>
        </div>
      {:else}
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Date</th><th>Type</th><th>Location</th><th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {#each stats.recentCrimes as r}
                <tr>
                  <td>#{r.Crime_ID}</td>
                  <td>{r.Crime_Date || '—'}</td>
                  <td>{r.Type_Name || '—'}</td>
                  <td>{r.Location_Name || '—'}</td>
                  <td>
                    <span class="badge badge-{(r.Severity || '').toLowerCase()}">
                      {r.Severity || '—'}
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>

  {/if}
</div>

<script>
  import { onMount } from 'svelte'

  let searchQuery = ''
  let locations = []
  let crimes = []
  let risk = null
  let loading = false
  let searched = false

  async function handleSearch() {
    if (!searchQuery.trim()) return
    loading = true
    searched = true
    try {
      const res = await window.api.crimeRisk.search(searchQuery.trim())
      locations = res.locations || []
      crimes = res.crimes || []
      risk = res.risk
    } catch (err) {
      console.error('Search failed:', err)
      locations = []
      crimes = []
      risk = null
    } finally {
      loading = false
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') handleSearch()
  }
</script>

<div class="page-header">
  <div>
    <h2>🔍 Area Crime Search</h2>
    <p>Search any area to see past crimes and risk prediction</p>
  </div>
</div>

<div class="content-area">
  <!-- Search Bar -->
  <div class="search-section">
    <div class="search-bar">
      <span class="search-bar-icon">📍</span>
      <input
        type="text"
        class="search-input"
        bind:value={searchQuery}
        on:keydown={handleKeydown}
        placeholder="Search area name or city (e.g. Gulshan, Motijheel...)"
        autocomplete="off"
      />
      <button class="search-btn" on:click={handleSearch} disabled={loading || !searchQuery.trim()}>
        {loading ? 'Searching...' : 'Search'}
      </button>
    </div>
  </div>

  {#if loading}
    <p style="color:#888; padding:40px 0; text-align:center;">Searching...</p>
  {:else if searched && locations.length === 0}
    <div class="empty-state">
      <div class="icon">📍</div>
      <p>No locations found for "<b>{searchQuery}</b>"</p>
    </div>
  {:else if searched && risk}
    <!-- Risk Card -->
    <div class="risk-card" style="border-color:{risk.color};">
      <div class="risk-header">
        <div class="risk-level" style="background:{risk.color};">
          {risk.level}
        </div>
        <div class="risk-stats">
          <span><b>{risk.total}</b> total crimes</span>
          <span>Last 3mo: <b>{risk.recent3}</b></span>
          <span>Prev 3mo: <b>{risk.prev3}</b></span>
        </div>
      </div>
      <div class="risk-trend">
        {#if risk.trend === 'rising'}
          <span class="trend-up">📈 Rising crime trend — be cautious</span>
        {:else if risk.trend === 'falling'}
          <span class="trend-down">📉 Falling crime trend — improving</span>
        {:else}
          <span class="trend-stable">➡️ Stable crime rate</span>
        {/if}
      </div>
    </div>

    <!-- Locations found -->
    <div class="locations-bar">
      {#each locations as loc}
        <div class="loc-chip">
          <span>📍</span> {loc.Location_Name}{loc.City ? `, ${loc.City}` : ''}
        </div>
      {/each}
    </div>

    <!-- Crimes Table -->
    <div class="card">
      <div style="padding:16px 24px; border-bottom:1px solid #ECEFF1;">
        <h4 style="font-size:15px; color:var(--md-primary);">Past Crimes in this Area</h4>
      </div>
      {#if crimes.length === 0}
        <div class="empty-state">
          <div class="icon">🚔</div>
          <p>No crime records found for this area.</p>
        </div>
      {:else}
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Date</th><th>Type</th><th>Location</th><th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {#each crimes as r}
                <tr>
                  <td>#{r.Crime_ID}</td>
                  <td>{r.Crime_Date || '—'}</td>
                  <td>{r.Type_Name || '—'}</td>
                  <td>{r.Location_Name}{r.City ? `, ${r.City}` : ''}</td>
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

<style>
  .search-section { margin-bottom: 20px; }
  .search-bar {
    display: flex; align-items: center; gap: 0;
    background: #fff; border: 2px solid #E0E0E0; border-radius: 14px;
    overflow: hidden; transition: border-color .2s;
    max-width: 600px;
  }
  .search-bar:focus-within { border-color: #3949AB; }
  .search-bar-icon { padding: 0 0 0 16px; font-size: 20px; }
  .search-input {
    flex: 1; padding: 14px 12px; border: none; font-size: 15px;
    outline: none; font-family: inherit; color: #333;
  }
  .search-input::placeholder { color: #999; }
  .search-btn {
    padding: 14px 24px; background: #1A237E; color: #fff;
    border: none; font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: inherit; transition: background .2s;
  }
  .search-btn:hover:not(:disabled) { background: #283593; }
  .search-btn:disabled { opacity: .6; cursor: not-allowed; }
  .risk-card {
    border: 2px solid; border-radius: 14px; padding: 20px 24px;
    margin-bottom: 16px; background: #fff;
    animation: slideUp .3s ease;
  }
  .risk-header { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
  .risk-level {
    padding: 8px 20px; border-radius: 8px; color: #fff;
    font-size: 18px; font-weight: 800; white-space: nowrap;
  }
  .risk-stats { display: flex; gap: 16px; font-size: 13px; color: #666; flex-wrap: wrap; }
  .risk-trend { margin-top: 12px; font-size: 14px; font-weight: 500; }
  .trend-up { color: #C62828; }
  .trend-down { color: #2E7D32; }
  .trend-stable { color: #E65100; }
  .locations-bar {
    display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;
  }
  .loc-chip {
    display: flex; align-items: center; gap: 4px;
    padding: 6px 14px; background: #EDE7F6; border-radius: 20px;
    font-size: 13px; font-weight: 500; color: #1A237E;
  }
</style>

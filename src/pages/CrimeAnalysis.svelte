<script>
  import { onMount } from 'svelte'
  import { showToast } from '../stores/navigation.js'

  let stats = {}
  let loading = true

  onMount(async () => {
    try {
      stats = await window.api.dashboard.getStats()
    } catch (error) {
      showToast('Failed to load statistics', 'error')
    } finally {
      loading = false
    }
  })

  function getSeverityColor(severity) {
    if (!severity) return '#666'
    const s = severity.toLowerCase()
    if (s === 'high') return '#d32f2f'
    if (s === 'medium') return '#f57c00'
    if (s === 'low') return '#388e3c'
    return '#666'
  }
</script>

<div class="page-header">
  <div><h2>Crime Analysis Dashboard</h2><p>View crime statistics and trends</p></div>
</div>

<div class="content-area">
  {#if loading}
    <div class="loading">Loading statistics...</div>
  {:else}
    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🚔</div>
        <div class="stat-content">
          <h3>{stats.totalCrimes || 0}</h3>
          <p>Total Crimes</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🔍</div>
        <div class="stat-content">
          <h3>{stats.totalSuspects || 0}</h3>
          <p>Total Suspects</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">👤</div>
        <div class="stat-content">
          <h3>{stats.totalVictims || 0}</h3>
          <p>Total Victims</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📍</div>
        <div class="stat-content">
          <h3>{stats.totalLocations || 0}</h3>
          <p>Total Locations</p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-card">
        <h3>Crimes by Type</h3>
        <div class="chart-placeholder">
          {#if stats.crimesByType && stats.crimesByType.length > 0}
            <div class="bar-chart">
              {#each stats.crimesByType as type}
                <div class="bar-item">
                  <span class="bar-label">{type.Type_Name || 'Unknown'}</span>
                  <div class="bar-container">
                    <div class="bar" style="width: {Math.min((type.count / Math.max(...stats.crimesByType.map(t => t.count))) * 100, 100)}%"></div>
                    <span class="bar-value">{type.count}</span>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <p class="no-data">No crime type data available</p>
          {/if}
        </div>
      </div>

      <div class="chart-card">
        <h3>Crimes by Severity</h3>
        <div class="chart-placeholder">
          {#if stats.crimesBySeverity && stats.crimesBySeverity.length > 0}
            <div class="pie-chart">
              {#each stats.crimesBySeverity as severity}
                <div class="pie-item">
                  <div class="pie-color" style="background-color: {getSeverityColor(severity.Severity)}"></div>
                  <span class="pie-label">{severity.Severity || 'Unknown'}</span>
                  <span class="pie-value">{severity.count}</span>
                </div>
              {/each}
            </div>
          {:else}
            <p class="no-data">No severity data available</p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Recent Crimes -->
    <div class="recent-crimes-card">
      <h3>Recent Crime Reports</h3>
      {#if stats.recentCrimes && stats.recentCrimes.length > 0}
        <div class="recent-list">
          {#each stats.recentCrimes as crime}
            <div class="recent-item">
              <div class="crime-info">
                <strong>#{crime.Crime_ID}</strong>
                <span class="crime-type">{crime.Type_Name || 'Unknown'}</span>
                <span class="crime-location">{crime.Location_Name || 'Unknown Location'}</span>
              </div>
              <div class="crime-meta">
                <span class="crime-date">{crime.Crime_Date || 'No date'}</span>
                {#if crime.Severity}
                  <span class="crime-severity" style="color: {getSeverityColor(crime.Severity)}">{crime.Severity}</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="no-data">No recent crimes to display</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .stat-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 10px rgba(0,0,0,.1);
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stat-icon {
    font-size: 40px;
    opacity: 0.8;
  }

  .stat-content h3 {
    font-size: 32px;
    font-weight: 700;
    color: #1a237e;
    margin: 0;
  }

  .stat-content p {
    color: #666;
    margin: 4px 0 0;
    font-size: 14px;
  }

  .charts-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
  }

  .chart-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 10px rgba(0,0,0,.1);
  }

  .chart-card h3 {
    margin: 0 0 20px;
    color: #1a237e;
    font-size: 18px;
  }

  .bar-chart {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .bar-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .bar-label {
    min-width: 120px;
    font-size: 14px;
    color: #333;
  }

  .bar-container {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bar {
    height: 24px;
    background: linear-gradient(90deg, #1a237e, #3949ab);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .bar-value {
    font-size: 12px;
    color: #666;
    font-weight: 600;
  }

  .pie-chart {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .pie-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .pie-color {
    width: 16px;
    height: 16px;
    border-radius: 50%;
  }

  .pie-label {
    flex: 1;
    font-size: 14px;
  }

  .pie-value {
    font-weight: 600;
    color: #1a237e;
  }

  .recent-crimes-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 10px rgba(0,0,0,.1);
  }

  .recent-crimes-card h3 {
    margin: 0 0 20px;
    color: #1a237e;
  }

  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .recent-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    transition: border-color 0.2s;
  }

  .recent-item:hover {
    border-color: #3949ab;
  }

  .crime-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .crime-info strong {
    color: #1a237e;
    font-size: 16px;
  }

  .crime-type {
    color: #666;
    font-size: 14px;
  }

  .crime-location {
    color: #888;
    font-size: 12px;
  }

  .crime-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .crime-date {
    color: #666;
    font-size: 12px;
  }

  .crime-severity {
    font-size: 12px;
    font-weight: 600;
  }

  .loading {
    text-align: center;
    padding: 40px;
    color: #666;
  }

  .no-data {
    text-align: center;
    color: #999;
    font-style: italic;
    padding: 20px;
  }

  @media (max-width: 768px) {
    .charts-section {
      grid-template-columns: 1fr;
    }

    .recent-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .crime-meta {
      align-items: flex-start;
    }
  }
</style>
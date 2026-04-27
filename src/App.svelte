<script>
  import { currentPage } from './stores/navigation.js'
  import Sidebar from './components/Sidebar.svelte'
  import Toast from './components/Toast.svelte'
  import Dashboard from './pages/Dashboard.svelte'
  import CrimeType from './pages/CrimeType.svelte'
  import Location from './pages/Location.svelte'
  import Suspect from './pages/Suspect.svelte'
  import Crime from './pages/Crime.svelte'
  import CrimeSuspect from './pages/CrimeSuspect.svelte'
  import Victim from './pages/Victim.svelte'
</script>

<div class="app-layout">
  <Sidebar />
  <main class="main-content">
    {#if $currentPage === 'dashboard'}
      <Dashboard />
    {:else if $currentPage === 'crime-type'}
      <CrimeType />
    {:else if $currentPage === 'location'}
      <Location />
    {:else if $currentPage === 'suspect'}
      <Suspect />
    {:else if $currentPage === 'crime'}
      <Crime />
    {:else if $currentPage === 'crime-suspect'}
      <CrimeSuspect />
    {:else if $currentPage === 'victim'}
      <Victim />
    {/if}
  </main>
</div>
<Toast />

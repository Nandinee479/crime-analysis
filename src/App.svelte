<script>
  import { authUser, isAdmin } from './stores/auth.js'
  import { currentPage } from './stores/navigation.js'
  import Sidebar from './components/Sidebar.svelte'
  import Toast from './components/Toast.svelte'
  import LoginPage from './login/LoginPage.svelte'
  import Dashboard from './pages/Dashboard.svelte'
  import Heatmap from './pages/Heatmap.svelte'
  import CrimeType from './pages/CrimeType.svelte'
  import Location from './pages/Location.svelte'
  import Suspect from './pages/Suspect.svelte'
  import Crime from './pages/Crime.svelte'
  import CrimeSuspect from './pages/CrimeSuspect.svelte'
  import Victim from './pages/Victim.svelte'
  import CrimeAnalysis from './pages/CrimeAnalysis.svelte'
  import CrimeSearch from './pages/CrimeSearch.svelte'
  import CrimeRisk from './pages/CrimeRisk.svelte'
  import AdminCrimeProgress from './components/AdminCrimeProgress.svelte'
  import UserCrimeProgress from './components/UserCrimeProgress.svelte'
</script>

{#if $authUser}
  <div class="app-layout">
    <Sidebar user={$authUser} />
    <main class="main-content">
      {#if $currentPage === 'dashboard'}
        <Dashboard />
      {:else if $currentPage === 'heatmap'}
        <Heatmap />
      {:else if $currentPage === 'crime-progress' && $isAdmin}
        <AdminCrimeProgress currentUserId={$authUser.id} />
      {:else if $currentPage === 'crime-progress' && !$isAdmin}
        <UserCrimeProgress />
      {:else if $currentPage === 'crime-analysis' && !$isAdmin}
        <CrimeAnalysis />
      {:else if $currentPage === 'crime-search' && !$isAdmin}
        <CrimeSearch />
      {:else if $currentPage === 'crime-risk' && !$isAdmin}
        <CrimeRisk />
      {:else if $currentPage === 'crime-type' && $isAdmin}
        <CrimeType />
      {:else if $currentPage === 'location' && $isAdmin}
        <Location />
      {:else if $currentPage === 'suspect' && $isAdmin}
        <Suspect />
      {:else if $currentPage === 'crime' && $isAdmin}
        <Crime />
      {:else if $currentPage === 'crime-suspect' && $isAdmin}
        <CrimeSuspect />
      {:else if $currentPage === 'victim' && $isAdmin}
        <Victim />
      {:else}
        <Dashboard />
      {/if}
    </main>
  </div>
{:else}
  <LoginPage />
{/if}
<Toast />

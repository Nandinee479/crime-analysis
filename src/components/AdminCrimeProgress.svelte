<!-- src/components/AdminCrimeProgress.svelte -->
<!-- Admin panel: view all crimes and update their progress status -->

<script>
  import { onMount } from 'svelte';

  // currentUserId should be passed from your auth/session store
  export let currentUserId = null;

  let crimes = [];
  let loading = true;
  let error = '';

  // Modal state
  let selectedCrime = null;
  let showModal = false;
  let newStatus = '';
  let note = '';
  let saving = false;
  let saveMsg = '';

  // Progress log modal
  let showLogModal = false;
  let progressLog = [];
  let logLoading = false;

  const statuses = ['Ongoing', 'Under Investigation', 'Suspect Caught', 'Case Closed'];

  const statusColor = {
    'Ongoing':              'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Under Investigation':  'bg-blue-100 text-blue-800 border-blue-300',
    'Suspect Caught':       'bg-orange-100 text-orange-800 border-orange-300',
    'Case Closed':          'bg-green-100 text-green-800 border-green-300',
  };

  const statusIcon = {
    'Ongoing':              '🔄',
    'Under Investigation':  '🔍',
    'Suspect Caught':       '🚔',
    'Case Closed':          '✅',
  };

  onMount(fetchCrimes);

  async function fetchCrimes() {
    loading = true;
    error = '';
    try {
      crimes = await window.api.crimeProgress.getAll();
    } catch (e) {
      error = 'Failed to load crimes: ' + e.message;
    } finally {
      loading = false;
    }
  }

  function openUpdateModal(crime) {
    selectedCrime = crime;
    newStatus = crime.Progress || 'Ongoing';
    note = '';
    saveMsg = '';
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    selectedCrime = null;
  }

  async function saveProgress() {
    if (!newStatus) return;
    saving = true;
    saveMsg = '';
    try {
      const result = await window.api.crimeProgress.update({
        crimeId: selectedCrime.Crime_ID,
        status: newStatus,
        note: note.trim(),
        updatedBy: currentUserId
      });
      if (result.success) {
        saveMsg = '✅ Progress updated successfully!';
        await fetchCrimes();
        setTimeout(() => { closeModal(); }, 1000);
      } else {
        saveMsg = '❌ Error: ' + (result.error || 'Unknown error');
      }
    } catch (e) {
      saveMsg = '❌ Failed: ' + e.message;
    } finally {
      saving = false;
    }
  }

  async function openLogModal(crime) {
    selectedCrime = crime;
    showLogModal = true;
    logLoading = true;
    progressLog = [];
    try {
      progressLog = await window.api.crimeProgress.getLog(crime.Crime_ID);
    } catch (e) {
      progressLog = [];
    } finally {
      logLoading = false;
    }
  }

  function closeLogModal() {
    showLogModal = false;
    selectedCrime = null;
    progressLog = [];
  }
</script>

<div class="p-6 max-w-7xl mx-auto">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">🛡️ Crime Progress Management</h1>
      <p class="text-sm text-gray-500 mt-1">Update and track the investigation status of each crime</p>
    </div>
    <button
      on:click={fetchCrimes}
      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition"
    >
      🔄 Refresh
    </button>
  </div>

  <!-- Error -->
  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
  {/if}

  <!-- Loading -->
  {#if loading}
    <div class="flex justify-center items-center h-48">
      <div class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

  {:else}
    <!-- Table -->
    <div class="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
          <tr>
            <th class="px-4 py-3 text-left">ID</th>
            <th class="px-4 py-3 text-left">Crime Type</th>
            <th class="px-4 py-3 text-left">Severity</th>
            <th class="px-4 py-3 text-left">Date</th>
            <th class="px-4 py-3 text-left">Location</th>
            <th class="px-4 py-3 text-left">Suspects</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#each crimes as crime (crime.Crime_ID)}
            <tr class="hover:bg-gray-50 transition">
              <td class="px-4 py-3 font-mono text-gray-500">#{crime.Crime_ID}</td>
              <td class="px-4 py-3 font-medium text-gray-800">{crime.Type_Name || '—'}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold
                  {crime.Severity === 'High'   ? 'bg-red-100 text-red-700' :
                   crime.Severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                  'bg-green-100 text-green-700'}">
                  {crime.Severity || '—'}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-600">{crime.Crime_Date || '—'}</td>
              <td class="px-4 py-3 text-gray-600">{crime.Location_Name || '—'}{crime.City ? `, ${crime.City}` : ''}</td>
              <td class="px-4 py-3 text-gray-600 max-w-xs truncate">{crime.Suspects || 'None'}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border
                  {statusColor[crime.Progress] || 'bg-gray-100 text-gray-700 border-gray-300'}">
                  {statusIcon[crime.Progress] || '❓'} {crime.Progress || 'Ongoing'}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button
                    on:click={() => openUpdateModal(crime)}
                    class="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition"
                  >
                    ✏️ Update
                  </button>
                  <button
                    on:click={() => openLogModal(crime)}
                    class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition"
                  >
                    📋 History
                  </button>
                </div>
              </td>
            </tr>
          {/each}

          {#if crimes.length === 0}
            <tr>
              <td colspan="8" class="px-4 py-12 text-center text-gray-400">No crimes found.</td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<!-- ====== Update Progress Modal ====== -->
{#if showModal && selectedCrime}
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div class="p-6 border-b border-gray-100">
        <h2 class="text-lg font-bold text-gray-800">✏️ Update Crime Progress</h2>
        <p class="text-sm text-gray-500 mt-1">Crime #{selectedCrime.Crime_ID} — {selectedCrime.Type_Name}</p>
      </div>

      <div class="p-6 space-y-4">
        <!-- Current status -->
        <div class="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          <span class="font-medium">Current Status:</span>
          <span class="ml-2 font-semibold">{statusIcon[selectedCrime.Progress] || '❓'} {selectedCrime.Progress || 'Ongoing'}</span>
        </div>

        <!-- New status selector -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">New Status</label>
          <div class="grid grid-cols-2 gap-2">
            {#each statuses as s}
              <button
                on:click={() => newStatus = s}
                class="flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition
                  {newStatus === s
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
              >
                <span>{statusIcon[s]}</span>
                <span>{s}</span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Note -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Note <span class="text-gray-400 font-normal">(optional)</span></label>
          <textarea
            bind:value={note}
            rows="3"
            placeholder="Add a note about this update..."
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          ></textarea>
        </div>

        {#if saveMsg}
          <div class="text-sm font-medium {saveMsg.startsWith('✅') ? 'text-green-600' : 'text-red-600'}">{saveMsg}</div>
        {/if}
      </div>

      <div class="p-6 pt-0 flex gap-3 justify-end">
        <button on:click={closeModal} class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition">Cancel</button>
        <button
          on:click={saveProgress}
          disabled={saving || !newStatus}
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : '💾 Save Progress'}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- ====== Progress History/Log Modal ====== -->
{#if showLogModal && selectedCrime}
  <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
      <div class="p-6 border-b border-gray-100 flex justify-between items-start">
        <div>
          <h2 class="text-lg font-bold text-gray-800">📋 Progress History</h2>
          <p class="text-sm text-gray-500 mt-1">Crime #{selectedCrime.Crime_ID} — {selectedCrime.Type_Name}</p>
        </div>
        <button on:click={closeLogModal} class="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
      </div>

      <div class="p-6 max-h-80 overflow-y-auto space-y-3">
        {#if logLoading}
          <div class="flex justify-center py-8">
            <div class="w-6 h-6 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        {:else if progressLog.length === 0}
          <p class="text-center text-gray-400 py-8">No history yet. Progress has not been updated.</p>
        {:else}
          {#each progressLog as log (log.Log_ID)}
            <div class="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div class="text-xl">{statusIcon[log.Status] || '❓'}</div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-semibold text-sm text-gray-800">{log.Status}</span>
                  <span class="text-xs text-gray-400 whitespace-nowrap">{log.Updated_At}</span>
                </div>
                {#if log.Note}
                  <p class="text-sm text-gray-600 mt-1">{log.Note}</p>
                {/if}
                <p class="text-xs text-gray-400 mt-1">by {log.Updated_By || 'Unknown'}</p>
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <div class="p-6 pt-0 flex justify-end">
        <button on:click={closeLogModal} class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition">Close</button>
      </div>
    </div>
  </div>
{/if}

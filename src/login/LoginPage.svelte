<script>
  import { authUser, login } from '../stores/auth.js'

  let role = 'admin'
  let username = ''
  let password = ''
  let error = ''
  let loading = false

  function handleSubmit() {
    error = ''
    if (!username.trim() || !password.trim()) {
      error = 'Please fill in all fields'
      return
    }
    loading = true
    setTimeout(() => {
      const result = login(role === 'admin' ? 'admin' : 'student', password)
      loading = false
      if (result.success) {
        authUser.set(result.user)
      } else {
        error = result.error
      }
    }, 600)
  }

  function fillDemo() {
    if (role === 'admin') {
      username = 'admin'
      password = 'admin123'
    } else {
      username = 'student'
      password = 'student123'
    }
    error = ''
  }
</script>

<div class="login-container">
  <div class="login-card">
    <div class="login-header">
      <div class="login-logo">🔒</div>
      <h1>Crime Analysis</h1>
      <p>Management System</p>
    </div>

    <div class="role-selector">
      <button
        type="button"
        class:active={role === 'admin'}
        on:click={() => { role = 'admin'; username = ''; password = ''; error = '' }}
      >
        <span class="role-icon">👮</span>
        <span>Admin</span>
      </button>
      <button
        type="button"
        class:active={role === 'student'}
        on:click={() => { role = 'student'; username = ''; password = ''; error = '' }}
      >
        <span class="role-icon">🎓</span>
        <span>Student</span>
      </button>
    </div>

    <form on:submit|preventDefault={handleSubmit}>
      {#if error}
        <div class="error-msg">{error}</div>
      {/if}

      <div class="form-group">
        <label class="form-label">Username</label>
        <input
          class="form-control"
          type="text"
          bind:value={username}
          placeholder="Enter username"
          autocomplete="off"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Password</label>
        <input
          class="form-control"
          type="password"
          bind:value={password}
          placeholder="Enter password"
        />
      </div>

      <button class="btn btn-login" type="submit" disabled={loading}>
        {#if loading}
          <span class="spinner"></span>
          Signing in…
        {:else}
          Sign In as {role === 'admin' ? 'Admin' : 'Student'}
        {/if}
      </button>
    </form>

    <div class="login-footer">
      <button class="btn-demo" type="button" on:click={fillDemo}>
        Fill demo credentials
      </button>
      <div class="demo-credentials">
        <span>Admin: admin / admin123</span>
        <span>Student: student / student123</span>
      </div>
    </div>
  </div>
</div>

<style>
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1A237E 0%, #283593 50%, #3949AB 100%);
    padding: 20px;
  }
  .login-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,.25);
    width: 100%;
    max-width: 420px;
    padding: 40px 36px 32px;
    animation: slideUp .3s ease;
  }
  .login-header {
    text-align: center;
    margin-bottom: 28px;
  }
  .login-logo {
    font-size: 48px;
    margin-bottom: 8px;
  }
  .login-header h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1A237E;
    margin: 0;
  }
  .login-header p {
    font-size: 14px;
    color: #79747E;
    margin: 4px 0 0;
  }
  .role-selector {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
  }
  .role-selector button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    border: 2px solid #E0E0E0;
    border-radius: 12px;
    background: #FAFAFA;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #555;
    transition: all .2s ease;
    font-family: inherit;
  }
  .role-selector button:hover {
    border-color: #3949AB;
    background: #EDE7F6;
  }
  .role-selector button.active {
    border-color: #1A237E;
    background: #E8EAF6;
    color: #1A237E;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(26,35,126,.15);
  }
  .role-icon { font-size: 20px; }
  .form-group { margin-bottom: 18px; }
  .error-msg {
    background: #FFEBEE;
    color: #C62828;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 16px;
    font-weight: 500;
  }
  .btn-login {
    width: 100%;
    padding: 14px;
    background: #1A237E;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all .2s ease;
    font-family: inherit;
  }
  .btn-login:hover:not(:disabled) {
    background: #283593;
    box-shadow: 0 4px 12px rgba(26,35,126,.3);
  }
  .btn-login:disabled {
    opacity: .7;
    cursor: not-allowed;
  }
  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin .6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg) } }
  .login-footer {
    margin-top: 24px;
    text-align: center;
    border-top: 1px solid #ECEFF1;
    padding-top: 20px;
  }
  .btn-demo {
    background: none;
    border: none;
    color: #3949AB;
    font-size: 13px;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 6px;
    transition: background .2s;
    font-family: inherit;
  }
  .btn-demo:hover { background: #EDE7F6; }
  .demo-credentials {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 11px;
    color: #999;
  }
</style>

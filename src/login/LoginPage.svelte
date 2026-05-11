<script>
  import { authUser, login, register } from '../stores/auth.js'

  let showRegister = false
  let role = 'admin'
  let username = ''
  let adminEmail = ''
  let adminPassword = ''
  let userPassword = ''
  let fullName = ''
  let error = ''
  let success = ''
  let loading = false

  async function handleAdminLogin() {
    error = ''
    if (!adminEmail.trim()) {
      error = 'Please enter the admin email'
      return
    }
    if (!adminPassword.trim()) {
      error = 'Please enter the admin password'
      return
    }
    loading = true
    try {
      const result = await login(adminEmail, adminPassword)
      if (!result.success) {
        error = result.error || 'Login failed'
      }
    } catch (err) {
      error = err?.message || 'Unable to sign in. Please try again.'
    } finally {
      loading = false
    }
  }

  async function handleUserLogin() {
    error = ''
    success = ''
    if (!username.trim() || !userPassword.trim()) {
      error = 'Please enter both username and password'
      return
    }
    loading = true
    try {
      const result = await login(username, userPassword)
      if (!result.success) {
        error = result.error || 'Login failed'
      }
    } catch (err) {
      error = err?.message || 'Unable to sign in. Please try again.'
    } finally {
      loading = false
    }
  }

  async function handleRegister() {
    error = ''
    success = ''
    if (!fullName.trim() || !username.trim() || !userPassword.trim()) {
      error = 'Please enter full name, username and password'
      return
    }
    if (userPassword.length < 3) {
      error = 'Password must be at least 3 characters long'
      return
    }
    loading = true
    const result = await register({ username, password: userPassword, fullName })
    loading = false
    if (result.success) {
      success = 'Account Create Successfully! Please login now.'
      showRegister = false
      username = ''
      userPassword = ''
      fullName = ''
    } else {
      error = result.error
    }
  }

  function switchToAdmin() {
    role = 'admin'
    showRegister = false
    username = ''
    adminEmail = ''
    adminPassword = ''
    userPassword = ''
    fullName = ''
    error = ''
    success = ''
  }

  function switchToUser() {
    role = 'user'
    showRegister = false
    username = ''
    adminPassword = ''
    userPassword = ''
    fullName = ''
    error = ''
    success = ''
  }
</script>

<div class="login-wrapper">
  <div class="login-card">
    <div class="login-header">
      <div class="logo-icon">🔒</div>
      <h1>Crime Analysis System</h1>
    </div>

    <div class="role-tabs">
      <button type="button" class:active={role === 'admin'} on:click={switchToAdmin}>
        <span class="tab-icon">👮</span>
        Admin
      </button>
      <button type="button" class:active={role === 'user'} on:click={switchToUser}>
        <span class="tab-icon">👤</span>
        User
      </button>
    </div>

    {#if role === 'admin'}
      <!-- ADMIN LOGIN - Password only -->
      <form on:submit|preventDefault={handleAdminLogin}>
        {#if error}
          <div class="error-box">{error}</div>
        {/if}

        <div class="input-group">
          <span class="input-icon">📧</span>
          <input
            type="email"
            class="login-input"
            bind:value={adminEmail}
            placeholder="Admin Email"
            autocomplete="off"
          />
        </div>

        <div class="input-group">
          <span class="input-icon">🔑</span>
          <input
            type="password"
            class="login-input"
            bind:value={adminPassword}
            placeholder="Admin Password"
          />
        </div>

        <button class="btn-admin-login" type="submit" disabled={loading}>
          {#if loading}
            <span class="loader"></span>
            Verifying...
          {:else}
            Admin Login
          {/if}
        </button>
      </form>

    {:else if !showRegister}
      <!-- USER LOGIN -->
      <form on:submit|preventDefault={handleUserLogin}>
        {#if error}
          <div class="error-box">{error}</div>
        {/if}
        {#if success}
          <div class="success-box">{success}</div>
        {/if}

        <div class="input-group">
          <span class="input-icon">👤</span>
          <input
            type="text"
            class="login-input"
            bind:value={username}
            placeholder="Username"
            autocomplete="off"
          />
        </div>

        <div class="input-group">
          <span class="input-icon">🔑</span>
          <input
            type="password"
            class="login-input"
            bind:value={userPassword}
            placeholder="Password"
          />
        </div>

        <button class="btn-login" type="submit" disabled={loading}>
          {#if loading}
            <span class="loader"></span>
            Signing in...
          {:else}
            User Login
          {/if}
        </button>
      </form>

      <div class="divider">
        <span>OR</span>
      </div>

      <button class="btn-register" type="button" on:click={() => { showRegister = true; error = ''; success = '' }}>
        <span>📝</span>
        Create New Account
      </button>

    {:else}
      <!-- REGISTER VIEW -->
      <div class="register-header">
        <button class="back-btn" type="button" on:click={() => { showRegister = false; error = ''; success = '' }}>←</button>
        <h2>Create Account</h2>
      </div>

      <form on:submit|preventDefault={handleRegister}>
        {#if error}
          <div class="error-box">{error}</div>
        {/if}
        {#if success}
          <div class="success-box">{success}</div>
        {/if}

        <div class="input-group">
          <span class="input-icon">📋</span>
          <input
            type="text"
            class="login-input"
            bind:value={fullName}
            placeholder="Full Name"
            autocomplete="off"
          />
        </div>

        <div class="input-group">
          <span class="input-icon">👤</span>
          <input
            type="text"
            class="login-input"
            bind:value={username}
            placeholder="Username"
            autocomplete="off"
          />
        </div>

        <div class="input-group">
          <span class="input-icon">🔑</span>
          <input
            type="password"
            class="login-input"
            bind:value={userPassword}
            placeholder="Password (min 3 chars)"
          />
        </div>

        <button class="btn-register-action" type="submit" disabled={loading}>
          {#if loading}
            <span class="loader"></span>
            Creating...
          {:else}
            Create Account
          {/if}
        </button>
      </form>

      <div class="divider">
        <span>OR</span>
      </div>

      <button class="btn-back-login" type="button" on:click={() => { showRegister = false; error = ''; success = '' }}>
        Already have an account? Sign In
      </button>
    {/if}
  </div>
</div>

<style>
  .login-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1A237E 0%, #283593 50%, #3949AB 100%);
    padding: 20px;
  }
  .login-card {
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(0,0,0,.3);
    width: 100%;
    max-width: 400px;
    padding: 36px 30px 30px;
    animation: slideUp .3s ease;
  }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
  .login-header { text-align: center; margin-bottom: 24px; }
  .logo-icon { font-size: 50px; margin-bottom: 6px; }
  .login-header h1 { font-size: 22px; font-weight: 700; color: #1A237E; margin: 0; }
  .role-tabs { display: flex; gap: 10px; margin-bottom: 24px; }
  .role-tabs button {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 14px; border: 2px solid #E0E0E0; border-radius: 12px;
    background: #FAFAFA; cursor: pointer; font-size: 15px; font-weight: 500;
    color: #666; transition: all .2s; font-family: inherit;
  }
  .role-tabs button:hover { border-color: #3949AB; background: #EDE7F6; }
  .role-tabs button.active { border-color: #1A237E; background: #E8EAF6; color: #1A237E; font-weight: 700; box-shadow: 0 2px 8px rgba(26,35,126,.12); }
  .tab-icon { font-size: 18px; }
  .input-group {
    display: flex; align-items: center; gap: 10px;
    background: #F5F5F5; border: 2px solid #E8E8E8;
    border-radius: 12px; padding: 4px 14px;
    margin-bottom: 14px; transition: border-color .2s;
  }
  .input-group:focus-within { border-color: #3949AB; background: #fff; }
  .input-icon { font-size: 18px; }
  .login-input {
    flex: 1; border: none; background: transparent; padding: 10px 0;
    font-size: 15px; outline: none; font-family: inherit; color: #333;
  }
  .login-input::placeholder { color: #999; }
  .btn-admin-login {
    width: 100%; padding: 16px; background: #1A237E; color: #fff;
    border: none; border-radius: 12px; font-size: 16px; font-weight: 700;
    cursor: pointer; margin-top: 6px; display: flex; align-items: center;
    justify-content: center; gap: 8px; transition: all .2s; font-family: inherit;
  }
  .btn-admin-login:hover:not(:disabled) { background: #283593; box-shadow: 0 4px 16px rgba(26,35,126,.3); }
  .btn-admin-login:disabled { opacity: .6; cursor: not-allowed; }
  .btn-login {
    width: 100%; padding: 14px; background: #1A237E; color: #fff;
    border: none; border-radius: 12px; font-size: 15px; font-weight: 700;
    cursor: pointer; margin-top: 6px; display: flex; align-items: center;
    justify-content: center; gap: 8px; transition: all .2s; font-family: inherit;
  }
  .btn-login:hover:not(:disabled) { background: #283593; box-shadow: 0 4px 16px rgba(26,35,126,.3); }
  .btn-login:disabled { opacity: .6; cursor: not-allowed; }
  .loader { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg) } }
  .error-box { background: #FFEBEE; color: #C62828; padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 14px; font-weight: 500; }
  .success-box { background: #E8F5E9; color: #2E7D32; padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 14px; font-weight: 500; }
  .divider { text-align: center; margin: 20px 0; position: relative; }
  .divider::before { content: ''; position: absolute; left: 0; top: 50%; width: 100%; height: 1px; background: #E0E0E0; }
  .divider span { background: #fff; padding: 0 14px; position: relative; font-size: 12px; color: #999; font-weight: 600; }
  .btn-register {
    width: 100%; padding: 16px; background: #1A237E; color: #fff;
    border: none; border-radius: 12px; font-size: 16px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    gap: 8px; transition: all .2s; font-family: inherit;
    margin-top: 10px;
  }
  .btn-register:hover { background: #283593; box-shadow: 0 4px 16px rgba(26,35,126,.3); }
  .register-header { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
  .back-btn {
    background: none; border: none; font-size: 22px; cursor: pointer;
    color: #1A237E; padding: 4px 8px; border-radius: 8px; transition: background .2s;
    display: flex; align-items: center; font-family: inherit;
  }
  .back-btn:hover { background: #EDE7F6; }
  .register-header h2 { font-size: 18px; font-weight: 700; color: #1A237E; margin: 0; }
  .btn-register-action {
    width: 100%; padding: 14px; background: #2E7D32; color: #fff;
    border: none; border-radius: 12px; font-size: 15px; font-weight: 700;
    cursor: pointer; margin-top: 6px; display: flex; align-items: center;
    justify-content: center; gap: 8px; transition: all .2s; font-family: inherit;
  }
  .btn-register-action:hover:not(:disabled) { background: #1B5E20; box-shadow: 0 4px 16px rgba(46,125,50,.3); }
  .btn-register-action:disabled { opacity: .6; cursor: not-allowed; }
  .btn-back-login {
    width: 100%; padding: 14px; background: none; color: #1A237E;
    border: none; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all .2s; font-family: inherit;
  }
  .btn-back-login:hover { background: #EDE7F6; border-radius: 8px; }
</style>

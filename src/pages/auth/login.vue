<template>
  <div class="login-page">
    <div class="login-bg-accent"></div>
    <div class="login-container">
      <div class="login-grid">
        <!-- Brand Panel (Kiri) -->
        <div class="login-brand-panel">
          <div class="brand-inner">
            <div class="brand-top">
              <img src="/logo-bsm.svg" alt="BSM Logo" class="brand-logo" />
            </div>
            <div class="brand-slogan">
              <h1>
                <span class="slogan-line">Bigger,</span>
                <span class="slogan-line slogan-accent">Stronger,</span>
                <span class="slogan-line slogan-light">Winner!</span>
              </h1>
            </div>
            <div class="brand-footer">
              <span>&copy; 2026 BSM Group</span>
              <div class="brand-footer-right">
                <span class="brand-secure"><i class="pi pi-shield"></i> Secure</span>
                <span>v1.0.0</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Panel (Kanan) -->
        <div class="login-form-panel">
          <div class="login-card" :class="{ 'is-ready': isReady }">
            <!-- Mobile Brand -->
            <div class="mobile-brand">
              <img src="/logo-bsm.svg" alt="BSM Logo" class="mobile-brand-logo" />
              <p class="mobile-brand-sub">Enterprise Resource Planning</p>
            </div>

            <div class="login-header">
              <h2>Selamat Datang</h2>
              <p>Masuk ke sistem untuk melanjutkan</p>
            </div>

            <form @submit.prevent="handleLogin" class="login-form">
              <!-- Cabang -->
              <div class="form-field">
                <label for="branch">Cabang</label>
                <div class="field-wrapper">
                  <i class="pi pi-building field-icon"></i>
                  <Select 
                    id="branch" 
                    v-model="selectedBranch" 
                    :options="branches" 
                    optionLabel="nama" 
                    optionValue="kode"
                    placeholder="Pilih cabang" 
                    class="w-full" 
                  />
                </div>
              </div>

              <!-- Username -->
              <div class="form-field">
                <label for="username">Username</label>
                <div class="field-wrapper">
                  <i class="pi pi-user field-icon"></i>
                  <InputText 
                    id="username" 
                    v-model="username" 
                    placeholder="Masukkan username" 
                    class="w-full" 
                    @keydown.enter="handleLogin"
                  />
                </div>
              </div>

              <!-- Password -->
              <div class="form-field">
                <label for="password">Password</label>
                <div class="field-wrapper">
                  <i class="pi pi-lock field-icon"></i>
                  <Password 
                    id="password" 
                    v-model="password" 
                    placeholder="Masukkan password" 
                    :toggleMask="true" 
                    :feedback="false" 
                    class="w-full" 
                    @keydown.enter="handleLogin"
                  />
                </div>
              </div>

              <!-- Submit -->
              <div class="form-field">
                <Button 
                  type="submit" 
                  :loading="isLoading" 
                  label="Masuk" 
                  icon="pi pi-sign-in" 
                  class="login-btn w-full" 
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Toast position="top-right" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '~/stores/auth'

const username = ref('')
const password = ref('')
const selectedBranch = ref<any>(null)
const isLoading = ref(false)
const isReady = ref(false)
const branches = ref<any[]>([])

const toast = useToast()
const authStore = useAuthStore()
const { $api } = useNuxtApp()

definePageMeta({
    layout: 'auth'
})

// 🔥 Fetch daftar cabang
const fetchBranches = async () => {
  try {
    const response = await $api.get('/cabang')
    if (response.data.success) {
      branches.value = response.data.data.map((cabang: any) => ({
        kode: cabang.cbg_kode,
        nama: cabang.cbg_nama,
        database: cabang.cbg_database
      }))
    }
  } catch (error: any) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'Gagal mengambil daftar cabang', 
      life: 3000 
    })
  }
}

onMounted(() => {
  // 🔥 Restore session - kalau sudah login, redirect
  const restored = authStore.restoreSession()
  
  if (restored && authStore.isLoggedIn) {
    navigateTo('/dashboard')
    return
  }
  
  fetchBranches()
  
  setTimeout(() => {
    isReady.value = true
  }, 100)
})

// 🔥 Handle Login
const handleLogin = async () => {
  // Validasi
  if (!selectedBranch.value) {
    toast.add({ severity: 'warn', summary: 'Peringatan', detail: 'Pilih cabang terlebih dahulu', life: 3000 })
    return
  }
  if (!username.value || !password.value) {
    toast.add({ severity: 'warn', summary: 'Peringatan', detail: 'Isi username dan password', life: 3000 })
    return
  }

  isLoading.value = true
  try {
    const response = await $api.post('/login', {
cabang_kode: selectedBranch.value,
      username: username.value,
      password: password.value
    })
    
    if (response.data.success) {
      const { user, token, refresh_token, token_expiry } = response.data.data
      
      // 🔥 Simpan login data (ini trigger preload menu & permission)
      authStore.setLoginData(user, token, refresh_token, token_expiry)
      
      // 🔥 Tunggu preload selesai
      await authStore.preloadData()
      
      toast.add({ 
        severity: 'success', 
        summary: 'Berhasil', 
        detail: `Selamat datang, ${user.nama || user.USER_NAMA}!`, 
        life: 3000 
      })
      
      // 🔥 Redirect ke dashboard (menu sudah siap)
      await navigateTo('/dashboard')
    }
  } catch (error: any) {
    toast.add({ 
      severity: 'error', 
      summary: 'Login Gagal', 
      detail: error.response?.data?.message || 'Username atau password salah', 
      life: 3000 
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fb;
  position: relative;
  overflow: hidden;
}

.login-bg-accent {
  position: fixed;
  top: -200px;
  right: -200px;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--p-primary-100) 0%, transparent 70%);
  opacity: 0.5;
  pointer-events: none;
  z-index: 0;
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
}

.login-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06);
}

/* Brand Panel */
.login-brand-panel {
  background: linear-gradient(160deg, var(--p-primary-700) 0%, var(--p-primary-600) 50%, var(--p-primary-500) 100%);
  position: relative;
  display: none;
}

@media (min-width: 992px) {
  .login-brand-panel {
    display: block;
  }
}

.brand-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 2.5rem;
  min-height: 560px;
}

.brand-logo {
  height: 56px;
  width: auto;
  filter: brightness(0) invert(1);
  opacity: 0.95;
}

.brand-slogan {
  margin-top: auto;
  margin-bottom: auto;
  padding: 2rem 0;
}

.brand-slogan h1 {
  margin: 0;
  line-height: 1.15;
}

.slogan-line {
  display: block;
  font-size: 3.25rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.03em;
}

.slogan-accent {
  color: #fbbf24;
}

.slogan-light {
  color: rgba(255,255,255,0.6);
  font-weight: 600;
}

.brand-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.35);
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 1.25rem;
}

/* Form Panel */
.login-form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 2.5rem;
}

.app-dark .login-form-panel {
  background: #13151d;
}

.login-card {
  width: 100%;
  max-width: 380px;
}

.mobile-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

@media (min-width: 992px) {
  .mobile-brand {
    display: none;
  }
}

.mobile-brand-logo {
  height: 48px;
  width: auto;
  margin-bottom: 0.5rem;
}

.login-header {
  margin-bottom: 2rem;
}

.login-header h2 {
  font-size: 1.625rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.375rem 0;
}

.login-header p {
  font-size: 0.9rem;
  color: #94a3b8;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.field-wrapper {
  position: relative;
}

.field-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.95rem;
  z-index: 1;
  pointer-events: none;
}

:deep(.p-inputtext) {
  padding-left: 2.6rem !important;
  height: 2.875rem;
  font-size: 0.9rem;
  border-radius: 0.75rem;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  width: 100%;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password .p-password-input) {
  width: 100%;
  padding-left: 2.6rem !important;
  padding-right: 2.75rem !important;
  height: 2.875rem;
  font-size: 0.9rem;
  border-radius: 0.75rem;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
}

:deep(.p-select) {
  border-radius: 0.75rem !important;
  border: 1.5px solid #e2e8f0 !important;
  background: #f8fafc !important;
  height: 2.875rem;
  width: 100%;
}

:deep(.p-select .p-select-label) {
  padding-left: 2.6rem !important;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.login-btn {
  height: 2.875rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 0.75rem !important;
  border: none !important;
  background: var(--p-primary-600) !important;
  color: #fff !important;
  margin-top: 0.5rem;
}
</style>
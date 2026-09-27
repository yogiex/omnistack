"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotice } from "@/hooks/use-notice"
import { useAuth } from "@/lib/auth-context"
import type { ApiKeyItem } from "@/lib/settings/mock-settings"

import { useApiKeys } from "./_hooks/use-api-keys"
import { useLocalePrefs } from "./_hooks/use-locale-prefs"
import { useNotificationPrefs } from "./_hooks/use-notification-prefs"
import { useProfileForm } from "./_hooks/use-profile-form"
import { useTransientFlag } from "./_hooks/use-transient-flag"
import { ApiKeysTab } from "./_components/api-keys-tab"
import { IntegrationsTab } from "./_components/integrations-tab"
import { PreferencesTab } from "./_components/preferences-tab"
import { ProfileTab } from "./_components/profile-tab"
import { SettingsHeader } from "./_components/settings-header"

export function SettingsClient() {
  const { user } = useAuth()
  const { notice, showNotice } = useNotice()

  const profile = useProfileForm({
    initialName: user?.name ?? "",
    // Audit: tidak ada user yang benar-benar ter-enroll 2FA, jadi jangan
    // tampilkan "Aktif" sebagai default.
    initial2FA: false,
  })
  const apiKeys = useApiKeys()
  const notif = useNotificationPrefs()
  const locale = useLocalePrefs()

  // Indikator "Tersimpan" per bagian. `useTransientFlag` yang memegang timer-nya
  // dan membersihkannya saat unmount — sebelumnya tiap handler punya
  // `setTimeout` sendiri yang tidak pernah di-clear.
  const profileSaved = useTransientFlag()
  const prefsSaved = useTransientFlag()
  const localeSaved = useTransientFlag()
  const gitlabNotice = useTransientFlag(2500)
  const sessionsNotice = useTransientFlag(2500)

  if (!user) return null

  const isViewer = user.role === "VIEWER"

  /* ------------------------------------------------------------------ */
  /*  Handlers                                                           */
  /* ------------------------------------------------------------------ */

  const handleSaveProfile = () => {
    profileSaved.flash()
    showNotice("Profil disimpan (mock).")
    profile.reset()
  }

  const handleChangePassword = () => {
    profileSaved.flash()
    showNotice("Email reset password terkirim (mock).")
  }

  const handleGenerateKey = () => {
    const key = apiKeys.generate()
    showNotice(`API key ${key.name} dibuat. Salin sekarang — mock ini tidak pernah disembunyikan.`)
  }

  const handleCopyKey = async (key: ApiKeyItem) => {
    const ok = await apiKeys.copy(key)
    showNotice(ok ? "API key tersalin." : "Gagal menyalin — salin manual.")
  }

  const handleRevokeKey = (id: string) => {
    apiKeys.revoke(id)
    showNotice("API key dicabut.")
  }

  const handleSavePrefs = () => {
    notif.markSaved()
    prefsSaved.flash()
    showNotice("Preferensi notifikasi disimpan.")
  }

  const handleSaveLocale = () => {
    locale.markSaved()
    localeSaved.flash()
    showNotice("Bahasa & zona waktu disimpan.")
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <main className="flex flex-col gap-6">
      <SettingsHeader />

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary"
        >
          {notice}
        </div>
      )}

      <Tabs defaultValue="profil">
        <TabsList className="h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="integrasi">Integrasi</TabsTrigger>
          <TabsTrigger value="preferensi">Preferensi</TabsTrigger>
        </TabsList>

        <TabsContent value="profil" className="mt-4">
          <ProfileTab
            user={user}
            isViewer={isViewer}
            name={profile.name}
            onNameChange={profile.setName}
            twoFAEnabled={profile.twoFAEnabled}
            onToggle2FA={profile.setTwoFAEnabled}
            isDirty={profile.isDirty}
            isSaved={profileSaved.isOn}
            onReset={profile.reset}
            onSave={handleSaveProfile}
            onChangePassword={handleChangePassword}
            onRevokeOtherSessions={sessionsNotice.flash}
            sessionsNotice={sessionsNotice.isOn}
          />
        </TabsContent>

        <TabsContent value="api-keys" className="mt-4">
          <ApiKeysTab
            keys={apiKeys.keys}
            copiedId={apiKeys.copiedId}
            onGenerate={handleGenerateKey}
            onCopy={handleCopyKey}
            onRevoke={handleRevokeKey}
          />
        </TabsContent>

        <TabsContent value="integrasi" className="mt-4">
          <IntegrationsTab
            isViewer={isViewer}
            gitlabNotice={gitlabNotice.isOn}
            onConnectGitLab={gitlabNotice.flash}
          />
        </TabsContent>

        <TabsContent value="preferensi" className="mt-4">
          <PreferencesTab
            notifPrefs={notif.prefs}
            onToggleNotif={notif.toggle}
            prefsDirty={notif.isDirty}
            prefsSaved={prefsSaved.isOn}
            onSavePrefs={handleSavePrefs}
            language={locale.language}
            onLanguageChange={locale.changeLanguage}
            timezone={locale.timezone}
            onTimezoneChange={locale.changeTimezone}
            localeDirty={locale.isDirty}
            localeSaved={localeSaved.isOn}
            onSaveLocale={handleSaveLocale}
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}

import { ref, onMounted } from 'vue'
import { versionManager } from '@/services/versionManager'

export function useVersionManagement() {
  const isFirstInstall = ref(false)
  const hasUpdate = ref(false)
  const currentVersion = ref('')
  const previousVersion = ref<string | null>(null)
  const updateNotes = ref<string[]>([])
  const isProcessingUpdate = ref(false)

  const checkVersion = async () => {
    try {
      const versionCheck = versionManager.checkForUpdate()

      hasUpdate.value = versionCheck.hasUpdate
      currentVersion.value = versionCheck.currentVersion
      previousVersion.value = versionCheck.storedVersion
      isFirstInstall.value = !versionCheck.storedVersion

      if (versionCheck.hasUpdate) {
        updateNotes.value = versionManager.getUpdateNotes(
          versionCheck.storedVersion,
          versionCheck.currentVersion
        )
      }

      return versionCheck
    } catch (error) {
      console.error('Erreur lors de la vérification de version:', error)
      return null
    }
  }

  const processUpdate = async () => {
    if (!hasUpdate.value) return false

    isProcessingUpdate.value = true

    try {
      const success = await versionManager.performMigration(
        previousVersion.value,
        currentVersion.value
      )

      if (success) {
        hasUpdate.value = false
        isFirstInstall.value = false
        console.log('Mise à jour effectuée avec succès')
      }

      return success
    } catch (error) {
      console.error('Erreur lors du traitement de la mise à jour:', error)
      return false
    } finally {
      isProcessingUpdate.value = false
    }
  }

  const getCurrentVersionInfo = () => {
    return versionManager.getCurrentVersion()
  }

  onMounted(() => {
    checkVersion()
  })

  return {
    isFirstInstall,
    hasUpdate,
    currentVersion,
    previousVersion,
    updateNotes,
    isProcessingUpdate,
    checkVersion,
    processUpdate,
    getCurrentVersionInfo
  }
}

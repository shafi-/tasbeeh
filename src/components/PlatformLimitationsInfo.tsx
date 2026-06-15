export function PlatformLimitationsInfo() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
        Known Platform Limitations
      </h3>

      <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
        <section>
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            iOS Scheduled Notifications
          </h4>
          <p className="leading-relaxed">
            iOS does not support scheduled local notifications in PWAs. Goal reminders
            are tracked in-app but will not trigger system notifications. Check your
            goals manually in the Progress page.
          </p>
        </section>

        <section>
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            Background Sync
          </h4>
          <p className="leading-relaxed">
            PWA background sync has limited browser support. Sessions are saved immediately
            to local storage (IndexedDB) but won't sync in the background if offline.
          </p>
        </section>

        <section>
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            Data Storage
          </h4>
          <p className="leading-relaxed">
            All data is stored locally on your device. Clearing browser data or
            uninstalling the app will delete all your zikrs, sessions, and goals.
            Use the Export feature regularly to backup your data.
          </p>
        </section>
      </div>
    </div>
  );
}

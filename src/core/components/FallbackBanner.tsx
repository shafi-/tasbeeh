import { useState } from 'react';

export function FallbackBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white p-4 z-50">
      <div className="max-w-mobile-container mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-shrink-0 text-2xl" role="img" aria-label="Warning">
            ⚠️
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">
              Browser storage is not available
            </h3>
            <p className="text-sm mb-2">
              Your progress will be lost if you close the app. All your data is temporary and will be deleted when you close this browser.
            </p>
            <p className="text-sm font-medium mb-2">
              Try:
            </p>
            <ol className="text-sm list-decimal list-inside space-y-1 mb-2">
              <li>Use a different browser (Chrome/Firefox)</li>
              <li>Clear browser storage</li>
              <li>Check browser permissions</li>
            </ol>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 p-1 hover:bg-amber-600 rounded text-xl"
            aria-label="Dismiss warning"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

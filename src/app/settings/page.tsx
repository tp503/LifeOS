export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Settings</h2>
        <p className="mt-1 text-sm text-zinc-400">Connector credentials and health will live here.</p>
      </div>
      <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-300">
        <li>Microsoft Graph OAuth (Phase 2)</li>
        <li>Twilio SMS webhook signing secret (Phase 3)</li>
        <li>Finance import / Plaid keys (Phase 4)</li>
      </ul>
      <p className="text-xs text-zinc-500">
        Copy <code className="text-zinc-400">.env.example</code> to <code className="text-zinc-400">.env</code> and keep secrets out of git.
      </p>
    </div>
  );
}

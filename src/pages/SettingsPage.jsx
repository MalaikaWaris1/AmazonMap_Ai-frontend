import { useEffect, useState } from "react";
import { KeyRound, RefreshCw } from "lucide-react";
import { AppShell, Skeleton } from "../components/layout/DashboardLayout.jsx";
import { useToast } from "../components/Toast.jsx";
import { apiService } from "../api/apiService.js";

function Switch({ checked, onChange }) {
  return <button type="button" role="switch" aria-checked={checked} className={`switch ${checked ? "on" : ""}`} onClick={() => onChange(!checked)} />;
}

export default function SettingsPage() {
  const [data, setData] = useState(null);
  const [twoFa, setTwoFa] = useState(true);
  const [accounts, setAccounts] = useState({});
  const toast = useToast();

  useEffect(() => {
    apiService.getSettings().then((d) => {
      setData(d);
      setAccounts(Object.fromEntries(d.accounts.map((a) => [a.name, a.connected])));
    });
  }, []);

  const title = "Settings & Security";
  const crumbs = ["Account", "Settings & security"];

  if (!data) return <AppShell title={title} breadcrumb={crumbs}><Skeleton height={384} /></AppShell>;

  return (
    <AppShell title={title} breadcrumb={crumbs}>
      <div className="grid grid-2">
        <div className="card pad">
          <p className="label-caps">Connected accounts</p>
          <div className="mt-4 stack">
            {data.accounts.map((a) => (
              <div key={a.name} className="boxed row">
                <div className="flex-1">
                  <p className="font-medium">{a.name}</p>
                  <p className="truncate text-xs text-muted">{a.detail}</p>
                </div>
                <Switch
                  checked={accounts[a.name] ?? false}
                  onChange={(v) => {
                    setAccounts((s) => ({ ...s, [a.name]: v }));
                    toast(`${a.name} ${v ? "connected" : "disconnected"}`);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card pad">
          <p className="label-caps">API keys</p>
          <div className="mt-4 stack">
            {data.apiKeys.map((k) => (
              <div key={k.name} className="boxed row">
                <KeyRound size={16} className="text-muted" />
                <div className="flex-1">
                  <p className="font-medium">{k.name}</p>
                  <p className="truncate font-mono text-xs text-muted">{k.value}</p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => toast(`${k.name} regenerated`)}><RefreshCw size={14} /> Regenerate</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card pad">
          <p className="label-caps">Two-factor authentication</p>
          <div className="mt-4 boxed row" style={{ padding: 16 }}>
            <div className="flex-1">
              <p className="font-medium">Authenticator app</p>
              <p className="text-xs text-muted">Require a 6-digit code at every sign-in.</p>
            </div>
            <Switch checked={twoFa} onChange={setTwoFa} />
          </div>
        </div>

        <div className="card clip" style={{ gridColumn: "1 / -1" }}>
          <div className="card-head"><p className="label-caps">Login activity log</p></div>
          <table className="table">
            <thead><tr>{["Device", "Location", "Time", "Status"].map((h) => <th key={h} className="label-caps">{h}</th>)}</tr></thead>
            <tbody>
              {data.logins.map((l, i) => (
                <tr key={i}>
                  <td>{l.device}</td>
                  <td className="text-muted">{l.location}</td>
                  <td className="text-muted">{l.time}</td>
                  <td><span className={`badge ${l.status === "Success" ? "badge-success" : "badge-danger"}`}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

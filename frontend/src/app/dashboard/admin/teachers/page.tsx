"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  status: string;
  featured: boolean;
  walletBalance: string;
};

export default function AdminTeachersPage() {
  const [rows, setRows] = useState<Teacher[]>([]);
  async function load() {
    setRows(await api<Teacher[]>("/admin/teachers"));
  }
  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    const reason = status === "REJECTED" ? prompt("Reason") || "Rejected" : undefined;
    await api(`/admin/teachers/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, reason }),
    });
    await load();
  }

  async function toggleFeatured(id: string, featured: boolean) {
    await api(`/admin/teachers/${id}/featured`, {
      method: "PATCH",
      body: JSON.stringify({ featured: !featured }),
    });
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Teachers</h1>
      <div className="mt-6 overflow-x-auto rounded-3xl bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-navy/10 text-navy/50">
              <th className="p-4">Teacher</th>
              <th>Status</th>
              <th>Wallet</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-navy/5">
                <td className="p-4">
                  <div className="font-medium">{row.firstName} {row.lastName}</div>
                  <div className="text-navy/50">{row.email} · {row.country}</div>
                </td>
                <td>{row.status}{row.featured ? " · featured" : ""}</td>
                <td>${row.walletBalance}</td>
                <td className="space-x-2 p-4">
                  <button onClick={() => setStatus(row.id, "APPROVED")}>Approve</button>
                  <button onClick={() => setStatus(row.id, "REJECTED")}>Reject</button>
                  <button onClick={() => setStatus(row.id, "SUSPENDED")}>Suspend</button>
                  <button onClick={() => toggleFeatured(row.id, row.featured)}>Feature</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

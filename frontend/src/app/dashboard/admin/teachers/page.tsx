"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";

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
  const [rows, setRows] = useState<Teacher[] | null>(null);
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
      <p className="mt-2 text-sm text-navy/60">
        Only approved profiles appear in the public directory. Featured placement is paid promotional visibility.
      </p>
      {rows === null && <div className="skeleton mt-6 h-64 rounded-[1.6rem]" />}
      {rows && rows.length === 0 && (
        <div className="mt-6">
          <EmptyState title="No teacher applications" body="New teacher registrations will appear here for review." image="/images/teacher-walk.jpg" />
        </div>
      )}
      {rows && rows.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-[1.6rem] bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-navy/10 text-navy/50">
                <th className="p-4">Teacher</th>
                <th>Status</th>
                <th>Wallet</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-navy/5">
                  <td className="p-4">
                    <div className="font-medium text-navy">
                      {row.firstName} {row.lastName}
                    </div>
                    <div className="text-navy/50">
                      {row.email} · {row.country}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={row.status} />
                      {row.featured && <StatusBadge value="FEATURED" />}
                    </div>
                  </td>
                  <td>${row.walletBalance}</td>
                  <td className="space-x-2 p-4 whitespace-nowrap">
                    <button className="btn-soft" onClick={() => setStatus(row.id, "APPROVED")}>
                      Approve
                    </button>
                    <button className="btn-soft" onClick={() => setStatus(row.id, "REJECTED")}>
                      Reject
                    </button>
                    <button className="btn-soft" onClick={() => setStatus(row.id, "SUSPENDED")}>
                      Suspend
                    </button>
                    <button className="btn-soft" onClick={() => toggleFeatured(row.id, row.featured)}>
                      {row.featured ? "Unfeature" : "Feature"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

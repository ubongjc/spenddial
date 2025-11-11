"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  recurring: boolean;
  frequency: string;
  isAutoPay: boolean;
  createdAt: string;
}

export default function BillsPage() {
  const { user } = useUser();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    dueDay: "1",
    category: "",
    recurring: true,
    frequency: "monthly",
    isAutoPay: false,
  });

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/bills");
      if (response.ok) {
        const data = await response.json();
        setBills(data.bills);
      }
    } catch (error) {
      console.error("Failed to fetch bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingBill ? `/api/bills/${editingBill.id}` : "/api/bills";
      const method = editingBill ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          amount: parseFloat(formData.amount),
          dueDay: parseInt(formData.dueDay),
          category: formData.category,
          recurring: formData.recurring,
          frequency: formData.frequency,
          isAutoPay: formData.isAutoPay,
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setEditingBill(null);
        setFormData({
          name: "",
          amount: "",
          dueDay: "1",
          category: "",
          recurring: true,
          frequency: "monthly",
          isAutoPay: false,
        });
        fetchBills();
      }
    } catch (error) {
      console.error("Failed to save bill:", error);
    }
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setFormData({
      name: bill.name,
      amount: bill.amount.toString(),
      dueDay: bill.dueDay.toString(),
      category: bill.category,
      recurring: bill.recurring,
      frequency: bill.frequency,
      isAutoPay: bill.isAutoPay,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (billId: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;

    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchBills();
      }
    } catch (error) {
      console.error("Failed to delete bill:", error);
    }
  };

  const getDaysUntilDue = (dueDay: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let dueDate = new Date(currentYear, currentMonth, dueDay);

    if (dueDay < currentDay) {
      // Bill is next month
      dueDate = new Date(currentYear, currentMonth + 1, dueDay);
    }

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const getStatusColor = (daysUntil: number) => {
    if (daysUntil <= 3) return "text-red-600 dark:text-red-400";
    if (daysUntil <= 7) return "text-orange-600 dark:text-orange-400";
    return "text-green-600 dark:text-green-400";
  };

  const getStatusBadge = (daysUntil: number, isAutoPay: boolean) => {
    if (isAutoPay) {
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          AutoPay
        </span>
      );
    }

    if (daysUntil === 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
          Due Today
        </span>
      );
    }

    if (daysUntil <= 3) {
      return (
        <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          Due in {daysUntil}d
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
        Due in {daysUntil}d
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">SpendDial</h1>
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Dashboard
              </Link>
              <Link
                href="/transactions"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Transactions
              </Link>
              <Link
                href="/categories"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Categories
              </Link>
              <Link href="/bills" className="text-sm font-medium hover:text-primary">
                Bills
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bills & Recurring Payments</h1>
            <p className="text-muted-foreground">
              Track your bills and never miss a payment
            </p>
          </div>
          <button
            onClick={() => {
              setEditingBill(null);
              setFormData({
                name: "",
                amount: "",
                dueDay: "1",
                category: "",
                recurring: true,
                frequency: "monthly",
                isAutoPay: false,
              });
              setShowAddModal(true);
            }}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Add Bill
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Bills This Month</p>
            <p className="text-2xl font-bold">
              ${bills.reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">Active Bills</p>
            <p className="text-2xl font-bold">{bills.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">On AutoPay</p>
            <p className="text-2xl font-bold">
              {bills.filter((b) => b.isAutoPay).length}
            </p>
          </div>
        </div>

        {/* Bills List */}
        <div className="rounded-lg border bg-card">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading bills...</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-lg font-medium">No bills yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add your recurring bills to track them and get reminders
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                + Add Bill
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-3 text-left text-sm font-medium">Bill Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Category</th>
                    <th className="px-6 py-3 text-right text-sm font-medium">Amount</th>
                    <th className="px-6 py-3 text-center text-sm font-medium">Due Day</th>
                    <th className="px-6 py-3 text-center text-sm font-medium">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-medium">Frequency</th>
                    <th className="px-6 py-3 text-center text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills
                    .sort((a, b) => getDaysUntilDue(a.dueDay) - getDaysUntilDue(b.dueDay))
                    .map((bill) => {
                      const daysUntil = getDaysUntilDue(bill.dueDay);

                      return (
                        <tr key={bill.id} className="border-b hover:bg-muted/50">
                          <td className="px-6 py-4">
                            <div className="font-medium">{bill.name}</div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              {bill.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-medium">
                            ${bill.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center text-sm">
                            {bill.dueDay}
                            {bill.dueDay === 1
                              ? "st"
                              : bill.dueDay === 2
                              ? "nd"
                              : bill.dueDay === 3
                              ? "rd"
                              : "th"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {getStatusBadge(daysUntil, bill.isAutoPay)}
                          </td>
                          <td className="px-6 py-4 text-center text-sm capitalize">
                            {bill.frequency}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEdit(bill)}
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(bill.id)}
                                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingBill ? "Edit Bill" : "Add Bill"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bill Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="e.g., Netflix Subscription"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="15.99"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Subscriptions">Subscriptions</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Rent">Rent/Mortgage</option>
                  <option value="Loans">Loans</option>
                  <option value="Internet">Internet/Phone</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Due Day of Month</label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={formData.dueDay}
                  onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Day of the month when this bill is due (1-28)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.recurring}
                  onChange={(e) =>
                    setFormData({ ...formData, recurring: e.target.checked })
                  }
                  className="rounded"
                />
                <label htmlFor="recurring" className="text-sm font-medium">
                  Recurring bill
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoPay"
                  checked={formData.isAutoPay}
                  onChange={(e) =>
                    setFormData({ ...formData, isAutoPay: e.target.checked })
                  }
                  className="rounded"
                />
                <label htmlFor="autoPay" className="text-sm font-medium">
                  AutoPay enabled
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingBill(null);
                    setFormData({
                      name: "",
                      amount: "",
                      dueDay: "1",
                      category: "",
                      recurring: true,
                      frequency: "monthly",
                      isAutoPay: false,
                    });
                  }}
                  className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {editingBill ? "Save Changes" : "Add Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

interface Category {
  id: string;
  name: string;
  budget: number;
  spent: number;
  icon: string;
  color: string;
  createdAt: string;
}

export default function CategoriesPage() {
  const { user } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    budget: "",
    icon: "💰",
    color: "#3b82f6",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";

      const method = editingCategory ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          budget: parseFloat(formData.budget),
          icon: formData.icon,
          color: formData.color,
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setEditingCategory(null);
        setFormData({ name: "", budget: "", icon: "💰", color: "#3b82f6" });
        fetchCategories();
      }
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      budget: category.budget.toString(),
      icon: category.icon,
      color: category.color,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const getSpendingPercentage = (spent: number, budget: number) => {
    if (budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  const getStatusColor = (spent: number, budget: number) => {
    const percentage = getSpendingPercentage(spent, budget);
    if (percentage >= 100) return "text-red-600 dark:text-red-400";
    if (percentage >= 80) return "text-orange-600 dark:text-orange-400";
    return "text-green-600 dark:text-green-400";
  };

  const commonIcons = ["💰", "🍔", "🚗", "🎬", "🏠", "✈️", "🛒", "💊", "📱", "🎓"];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">SpendDial</h1>
            <div className="flex gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary">
                Dashboard
              </Link>
              <Link href="/transactions" className="text-sm font-medium text-muted-foreground hover:text-primary">
                Transactions
              </Link>
              <Link href="/categories" className="text-sm font-medium hover:text-primary">
                Categories
              </Link>
              <Link href="/bills" className="text-sm font-medium text-muted-foreground hover:text-primary">
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
            <h1 className="text-3xl font-bold mb-2">Categories</h1>
            <p className="text-muted-foreground">Manage your spending categories and budgets</p>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: "", budget: "", icon: "💰", color: "#3b82f6" });
              setShowAddModal(true);
            }}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Add Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="rounded-lg border bg-card">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-lg font-medium">No categories yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first category to start tracking spending
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                + Add Category
              </button>
            </div>
          ) : (
            <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const percentage = getSpendingPercentage(category.spent, category.budget);

                return (
                  <div
                    key={category.id}
                    className="rounded-lg border p-6 hover:shadow-md transition-shadow"
                    style={{ borderLeftColor: category.color, borderLeftWidth: "4px" }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{category.icon}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            ${category.budget.toFixed(2)} budget
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className={getStatusColor(category.spent, category.budget)}>
                          ${category.spent.toFixed(2)} spent
                        </span>
                        <span className="text-muted-foreground">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining:</span>
                      <span className={getStatusColor(category.spent, category.budget)}>
                        ${Math.max(0, category.budget - category.spent).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingCategory ? "Edit Category" : "Add Category"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="e.g., Food & Dining"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Monthly Budget</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="500.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Icon</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {commonIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`text-2xl p-2 rounded-lg border-2 ${
                        formData.icon === icon
                          ? "border-primary bg-primary/10"
                          : "border-transparent hover:border-muted"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Or enter custom emoji"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-10 w-20 rounded-lg border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 rounded-lg border px-3 py-2"
                    placeholder="#3b82f6"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                    setFormData({ name: "", budget: "", icon: "💰", color: "#3b82f6" });
                  }}
                  className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {editingCategory ? "Save Changes" : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { DashboardLayout } from "@/components/Layouts/dashboard-layout";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ApiError, fetchAdminEnquiryCategory, updateAdminEnquiryCategory } from "@/lib/api";

interface FormData {
  form_type: string;
  name: string;
  description: string;
  is_active: number;
}

export default function EditCategoryPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [form, setForm] = useState<FormData>({
    form_type: "evaluation",
    name: "",
    description: "",
    is_active: 1,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !categoryId) return;
    let cancelled = false;

    fetchAdminEnquiryCategory(token, categoryId)
      .then((c) => {
        if (cancelled) return;
        setForm({
          form_type: c.form_type,
          name: c.name,
          description: c.description || "",
          is_active: c.is_active,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(err instanceof ApiError ? err.message : "Failed to load category");
        router.push("/admin/enquiry-categories");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!token) return;

    setSubmitting(true);
    try {
      await updateAdminEnquiryCategory(token, categoryId, {
        name: form.name,
        description: form.description,
        is_active: form.is_active,
      });
      toast.success("Category updated successfully");
      router.push("/admin/enquiry-categories");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Edit Category</h1>
        <p className="text-muted-foreground mt-1">Update enquiry category details</p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 shadow-sm max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Form Type</label>
            <select
              value={form.form_type}
              onChange={(e) => setForm(prev => ({ ...prev, form_type: e.target.value }))}
              className="w-full rounded-lg border border-border bg-gray-50 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-not-allowed"
              disabled
            >
              <option value="evaluation">Evaluation</option>
              <option value="management">Management</option>
              <option value="marketplace">Marketplace</option>
              <option value="investment">Investment</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">Form type cannot be changed after creation.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter category name"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
              rows={3}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select
              value={form.is_active}
              onChange={(e) => setForm(prev => ({ ...prev, is_active: parseInt(e.target.value) }))}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/admin/enquiry-categories"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-ink transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

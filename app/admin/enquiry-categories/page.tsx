"use client";

import { DashboardLayout } from "@/components/Layouts/dashboard-layout";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ExportButton } from "@/components/ExportButton";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError, deleteEnquiryCategory, fetchAdminEnquiryCategories, fetchAllEnquiryCategories } from "@/lib/api";


interface EnquiryCategory {
  id: string;
  form_type: string;
  name: string;
  description: string | null;
  is_active: number;
  created_at: string;
}

export default function EnquiryCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<EnquiryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ form_type: "", is_active: "" });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  // const fetchCategories = async () => {
  //   if (!token) return;
  //   setLoading(true);
  //   try {
  //     const params = new URLSearchParams({
  //       limit: pagination.limit.toString(),
  //       offset: ((pagination.page - 1) * pagination.limit).toString(),
  //     });
  //     if (filters.form_type) params.append("form_type", filters.form_type);
  //     if (filters.is_active !== "") params.append("is_active", filters.is_active);

  //     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/admin/enquiry-categories?${params}`, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  //     if (!res.ok) throw new Error("Failed to fetch categories");
  //     const data = await res.json();
  //     setCategories(data);
  //     setPagination(prev => ({ ...prev, total: data.length + (pagination.page - 1) * pagination.limit }));
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : "Failed to load categories");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  // const timeoutId = setTimeout(() => {
  //           fetchCategories();
  //       }, 0);
  // }, [token, pagination.page, filters]);


  function fetchCategories(){

    if(!token) return
    setLoading(true)

    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: ((pagination.page - 1) * pagination.limit).toString(),
      });
      if (filters.form_type) params.append("form_type", filters.form_type);
      if (filters.is_active !== "") params.append("is_active", filters.is_active);

      fetchAdminEnquiryCategories(token, params)
      .then(setCategories)
      .catch((err) => err instanceof ApiError ? setError(err.message) : 'could not load data')
      .finally(() => {
        setLoading(false)
      })
    }catch(err){
      setError(err instanceof Error ? err.message : 'Could not load categories')
    }finally{
      setLoading(false)
    }
  }

  useEffect(() => {

    
    const timeOutId = setTimeout(() => {

      fetchCategories()
    })


  }, [token, pagination.page, filters])

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const deleteCategory = async (categoryId: string) => {
    if (!token) return;
    try {
      deleteEnquiryCategory(token, categoryId).then(() => {
        toast.success("Category deleted successfully");
        fetchCategories();

      }).catch((err) => err instanceof ApiError ? toast.error(err.message) : toast.error('could not delete category'))
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  const getFormTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      evaluation: "Evaluation",
      management: "Management",
      marketplace: "Marketplace",
      investment: "Investment"
    };
    return labels[type] || type;
  };

  const getStatusBadge = (isActive: number) => (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isActive === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
      {isActive === 1 ? "Active" : "Inactive"}
    </span>
  );

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Enquiry Categories</h1>
          <p className="text-muted-foreground mt-1">Manage categories for evaluation, management, marketplace, and investment forms</p>
        </div>
        <Link
          href="/admin/enquiry-categories/new"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-3.5 font-medium text-white transition-colors hover:bg-primary/90 sm:w-auto"
        >
          Add Category
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-48">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Form Type</label>
            <select
              value={filters.form_type}
              onChange={handleFilterChange}
              name="form_type"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Types</option>
              <option value="evaluation">Evaluation</option>
              <option value="management">Management</option>
              <option value="marketplace">Marketplace</option>
              <option value="investment">Investment</option>
            </select>
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
            <select
              value={filters.is_active}
              onChange={handleFilterChange}
              name="is_active"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFilters({ form_type: "", is_active: "" });
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-ink transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-card shadow-card overflow-hidden">
        {loading ? (
          <p className="p-6 text-muted text-sm">Loading categories…</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-muted text-sm">No categories found.</p>
        ) : (
          <>
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow className="text-center text-base font-medium text-dark dark:text-white">
                  <TableHead className="px-6 py-3 font-semibold">Name</TableHead>
                  <TableHead className="px-6 py-3 font-semibold">Form Type</TableHead>
                  {/* <TableHead className="px-6 py-3 font-semibold">Order</TableHead> */}
                  <TableHead className="px-6 py-3 font-semibold">Status</TableHead>
                  <TableHead className="px-6 py-3 font-semibold">Created</TableHead>
                  <TableHead className="px-6 py-3 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id} className="border-b border-line last:border-0">
                    <TableCell className="px-6 py-3.5 text-ink font-semibold">{cat.name}</TableCell>
                    <TableCell className="px-6 py-3.5 text-muted">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {getFormTypeLabel(cat.form_type)}
                      </span>
                    </TableCell>
                    {/* <TableCell className="px-6 py-3.5 text-muted">{cat.display_order}</TableCell> */}
                    <TableCell className="px-6 py-3.5">{getStatusBadge(cat.is_active)}</TableCell>
                    <TableCell className="px-6 py-3.5 text-muted">
                      {format(new Date(cat.created_at), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className='px-6 py-3.5'>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/enquiry-categories/${cat.id}/edit`}
                          className="px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${cat.name}"? This cannot be undone.`)) {
                              deleteCategory(cat.id);
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} categories
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 text-sm border border-border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-muted-foreground">
                  Page {pagination.page} of {Math.max(totalPages, 1)}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= totalPages}
                  className="px-3 py-1.5 text-sm border border-border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
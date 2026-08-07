"use client"

import { DashboardLayout } from "@/components/Layouts/dashboard-layout";
import { useAuth } from "@/context/AuthContext";
import { listAllGeneralClientMessages, markGeneralMessageAsRead, deleteClientMessage, GeneralClientMessage } from "@/lib/api";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function MessagesPage(){
    const [messages, setMessages] = useState<GeneralClientMessage[]>([])
    const [loading, setLoading] = useState(true);
    const {token} = useAuth();
    const [selectedMessage, setSelectedMessage] = useState<GeneralClientMessage | null>(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showDeleteMessageModal, setShowDeleteMessageModal] = useState(false);
    
    // Pagination state
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
    const [filters, setFilters] = useState({ search: "", is_read: "" as string });

    const fetchMessages = async () => {
        if (!token) return;
        const timeoutId = setTimeout(() => setLoading(true), 0);
        try {
            const params = new URLSearchParams({
                limit: pagination.limit.toString(),
                offset: ((pagination.page - 1) * pagination.limit).toString(),
            });
            if (filters.search) params.append("search", filters.search);
            if (filters.is_read !== "") params.append("is_read", filters.is_read);


            listAllGeneralClientMessages(token, params).then((e) => {

                setMessages(e)
                setPagination(prev => ({ ...prev, total: e.length + (pagination.page - 1) * pagination.limit }));
            }).catch((err) => {
                toast.error(err instanceof Error ? err.message : "Failed to fetch messages");
            }).finally(() => {

                setLoading(false);

            })
            
            // Estimate total for pagination
            // setPagination(prev => ({ ...prev, total: data.length + (pagination.page - 1) * pagination.limit }));
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchMessages();
        }, 0);
        return () => clearTimeout(timeoutId);
    }, [token, pagination.page, filters]);

    const handleView = (message: GeneralClientMessage) => {
        setSelectedMessage(message);
        setShowMessageModal(true);
        if (!message.is_read) {
            handleMarkAsRead(message.id);
        }
    };

    const handleMarkAsRead = async (messageId: string) => {
        if (!token) return;
        try {
            await markGeneralMessageAsRead(token, messageId);
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_read: true } : m));
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const handleDelete = async(message: GeneralClientMessage) => {
        if (!token){
            return
        }

        setSelectedMessage(message)
        setShowDeleteMessageModal(true);
    }

    const handleConfirmDelete = async(message_id: string) => {
        if(!token){
            return
        }

        try{
            await deleteClientMessage(token, message_id);
            setMessages(prev => prev.filter(m => m.id !== message_id));
            setShowDeleteMessageModal(false);
            setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        }catch(err){
            console.error("Failed to delete message:",err)
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, is_read: e.target.value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

    return(
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-ink">Client Messages</h1>
                <p className="text-muted-foreground mt-1">Manage and respond to client inquiries</p>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl border border-border p-4 mb-6 shadow-sm">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[250px]">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search by name, email, category..."
                            value={filters.search}
                            onChange={handleSearch}
                            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="w-48">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                        <select
                            value={filters.is_read}
                            onChange={handleFilterChange}
                            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="">All Status</option>
                            <option value="false">Unread</option>
                            <option value="true">Read</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setFilters({ search: "", is_read: "" });
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-ink transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-card shadow-card overflow-hidden">
                {loading ? (
                    <p className="p-6 text-muted text-sm">Loading messages…</p>
                ) : messages.length === 0 ? (
                    <p className="p-6 text-muted text-sm">No messages found.</p>
                ) : (
                    <>
                        <Table className="w-full text-sm">
                            <TableHeader>
                                <TableRow className="text-center text-base font-medium text-dark dark:text-white">
                                    <TableHead className="px-6 py-3 font-semibold">Name</TableHead>
                                    <TableHead className="px-6 py-3 font-semibold">Email</TableHead>
                                    {/* <TableHead className="px-6 py-3 font-semibold">Category</TableHead> */}
                                    <TableHead className="px-6 py-3 font-semibold">Brief</TableHead>
                                    <TableHead className="px-6 py-3 font-semibold">Status</TableHead>
                                    <TableHead className="px-6 py-3 font-semibold">Date</TableHead>
                                    <TableHead className="px-6 py-3 font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {messages.map((m) => (
                                    <TableRow key={m.id} className={m.is_read ? "border-b border-line last:border-0" : "border-b border-line last:border-0 bg-blue-50/50 dark:bg-blue-900/20"}>
                                        <TableCell className="px-6 py-3.5 text-ink font-semibold">{m.full_name}</TableCell>
                                        <TableCell className="px-6 py-3.5 text-muted">{m.email}</TableCell>
                                        {/* <TableCell className="px-6 py-3.5 text-muted">{m.whatyouneed}</TableCell> */}
                                        <TableCell className="px-6 py-3.5 text-muted max-w-xs truncate">{m.brief}</TableCell>
                                        <TableCell className="px-6 py-3.5">
                                            <span className={m.is_read 
                                                ? "px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700" 
                                                : "px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700"
                                            }>
                                                {m.is_read ? "Read" : "Unread"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-3.5 text-muted">
                                            {format(new Date(m.created_at), "MMM d, yyyy h:mm a")}
                                        </TableCell>
                                        <TableCell className='px-6 py-3.5'>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleView(m)}
                                                    className="px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded transition-colors"
                                                >
                                                    View
                                                </button>
                                                {!m.is_read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(m.id)}
                                                        className="px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                                                    >
                                                        Mark Read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(m)}
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
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} messages
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
            
            {showDeleteMessageModal && selectedMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-ink">Do you want to delete the message?</h2>
                            <button
                                onClick={() => setShowDeleteMessageModal(false)}
                                className="p-1 text-muted-foreground hover:text-ink transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="grid gap-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Name</label>
                                    <p className="text-ink mt-1">{selectedMessage.full_name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Email</label>
                                    <p className="text-ink mt-1">{selectedMessage.email}</p>
                                </div>
                                {/* <div>
                                    <label className="text-xs font-medium text-muted-foreground">Category</label>
                                    <p className="text-ink mt-1">{selectedMessage.whatyouneed}</p>
                                </div> */}
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                                    <p className="text-ink mt-1">
                                        <span className={selectedMessage.is_read 
                                            ? "px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700" 
                                            : "px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700"
                                        }>
                                            {selectedMessage.is_read ? "Read" : "Unread"}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Received</label>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Message</label>
                                    <div className="mt-1 p-4 bg-gray-50 dark:bg-dark-3 rounded-lg border border-border dark:border-dark-3">
                                        <p className="text-ink whitespace-pre-wrap">{selectedMessage.brief}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    if (confirm("Delete this message?")) {
                                        handleConfirmDelete(selectedMessage.id);
                                        setShowDeleteMessageModal(false);
                                    }
                                }}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setShowDeleteMessageModal(false)}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-gray-100 dark:hover:bg-dark-3 rounded transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Detail Modal */}
            {showMessageModal && selectedMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-ink">Message Details</h2>
                            <button
                                onClick={() => setShowMessageModal(false)}
                                className="p-1 text-muted-foreground hover:text-ink transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="grid gap-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Name</label>
                                    <p className="text-ink mt-1">{selectedMessage.full_name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Email</label>
                                    <p className="text-ink mt-1">{selectedMessage.email}</p>
                                </div>
                                {/* <div>
                                    <label className="text-xs font-medium text-muted-foreground">Category</label>
                                    <p className="text-ink mt-1">{selectedMessage.whatyouneed}</p>
                                </div> */}
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                                    <p className="text-ink mt-1">
                                        <span className={selectedMessage.is_read 
                                            ? "px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700" 
                                            : "px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700"
                                        }>
                                            {selectedMessage.is_read ? "Read" : "Unread"}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Received</label>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Message</label>
                                    <div className="mt-1 p-4 bg-gray-50 dark:bg-dark-3 rounded-lg border border-border dark:border-dark-3">
                                        <p className="text-ink whitespace-pre-wrap">{selectedMessage.brief}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
                            {/* {!selectedMessage.is_read && (
                                <button
                                    onClick={() => handleMarkAsRead(selectedMessage.id)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded transition-colors"
                                >
                                    Mark as Read
                                </button>
                            )} */}
                            <button
                                onClick={() => {
                                    if (confirm("Delete this message?")) {
                                        handleConfirmDelete(selectedMessage.id);
                                        setShowMessageModal(false);
                                    }
                                }}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setShowMessageModal(false)}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-gray-100 dark:hover:bg-dark-3 rounded transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
import { useEffect, useState } from 'react';
import {
    ChevronLeft, ChevronRight, Edit3, Eye, EyeOff, Layers, Plus, Search,
    Tag, Trash2, X
} from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const PAGE_SIZE = 10;

const emptyCategoryForm = {
    name: '',
    slug: '',
    parentId: '',
    description: '',
    imageUrl: '',
    sortOrder: 0,
    isActive: true
};

const emptyBrandForm = {
    name: '',
    slug: '',
    logoUrl: '',
    description: '',
    isActive: true
};

const getPayload = (response) => response?.data?.data ?? response?.data ?? response;

const AdminCategories = () => {
    const [activeTab, setActiveTab] = useState('categories');
    const [rows, setRows] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(0);
    const [reload, setReload] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
    const [brandForm, setBrandForm] = useState(emptyBrandForm);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(0);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        let cancelled = false;
        const fetchRows = async () => {
            setLoading(true);
            setError('');
            const resource = activeTab === 'categories' ? 'categories' : 'brands';
            const params = { page, size: PAGE_SIZE, search };
            if (statusFilter !== '') params.active = statusFilter;

            try {
                const response = await axiosClient.get(`/admin/${resource}`, { params });
                const result = getPayload(response);
                if (cancelled) return;
                setRows(Array.isArray(result?.content) ? result.content : []);
                setTotalPages(result?.totalPages ?? 0);
                setTotalElements(result?.totalElements ?? 0);
            } catch (requestError) {
                if (cancelled) return;
                setRows([]);
                setTotalPages(0);
                setTotalElements(0);
                setError(requestError.response?.data?.message || 'Không thể tải dữ liệu. Vui lòng thử lại.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchRows();
        return () => {
            cancelled = true;
        };
    }, [activeTab, page, reload, search, statusFilter]);

    useEffect(() => {
        if (activeTab !== 'categories') return undefined;
        let cancelled = false;
        axiosClient.get('/admin/categories', { params: { page: 0, size: 100 } })
            .then((response) => {
                if (!cancelled) {
                    const result = getPayload(response);
                    setCategoryOptions(Array.isArray(result?.content) ? result.content : []);
                }
            })
            .catch((requestError) => {
                if (!cancelled) {
                    setError(requestError.response?.data?.message || 'Không thể tải danh sách danh mục cha.');
                }
            });
        return () => {
            cancelled = true;
        };
    }, [activeTab, reload]);

    const openCreateModal = () => {
        setEditingItem(null);
        setCategoryForm(emptyCategoryForm);
        setBrandForm(emptyBrandForm);
        setError('');
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        if (activeTab === 'categories') {
            setCategoryForm({
                name: item.name || '',
                slug: item.slug || '',
                parentId: item.parentId ?? '',
                description: item.description || '',
                imageUrl: item.imageUrl || '',
                sortOrder: item.sortOrder ?? 0,
                isActive: Boolean(item.isActive)
            });
        } else {
            setBrandForm({
                name: item.name || '',
                slug: item.slug || '',
                logoUrl: item.logoUrl || '',
                description: item.description || '',
                isActive: Boolean(item.isActive)
            });
        }
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (!saving) setIsModalOpen(false);
    };

    const refreshRows = (afterDelete = false) => {
        if (afterDelete && totalElements <= page * PAGE_SIZE + 1) {
            setPage((currentPage) => Math.max(currentPage - 1, 0));
        }
        setReload((current) => current + 1);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        const resource = activeTab === 'categories' ? 'categories' : 'brands';
        const rawForm = activeTab === 'categories' ? categoryForm : brandForm;
        const payload = activeTab === 'categories'
            ? {
                ...rawForm,
                parentId: rawForm.parentId === '' ? null : Number(rawForm.parentId),
                sortOrder: Number(rawForm.sortOrder)
            }
            : rawForm;

        try {
            if (editingItem) {
                await axiosClient.put(`/admin/${resource}/${editingItem.id}`, payload);
            } else {
                await axiosClient.post(`/admin/${resource}`, payload);
            }
            setIsModalOpen(false);
            refreshRows();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Không thể lưu dữ liệu. Hãy kiểm tra thông tin và thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleVisibility = async (item) => {
        const resource = activeTab === 'categories' ? 'categories' : 'brands';
        const payload = activeTab === 'categories'
            ? {
                parentId: item.parentId ?? null,
                name: item.name,
                slug: item.slug,
                description: item.description || '',
                imageUrl: item.imageUrl || '',
                sortOrder: item.sortOrder ?? 0,
                isActive: !item.isActive
            }
            : {
                name: item.name,
                slug: item.slug,
                logoUrl: item.logoUrl || '',
                description: item.description || '',
                isActive: !item.isActive
            };

        try {
            await axiosClient.put(`/admin/${resource}/${item.id}`, payload);
            refreshRows();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Không thể cập nhật trạng thái.');
        }
    };

    const handleDelete = async (item) => {
        const typeLabel = activeTab === 'categories' ? 'danh mục' : 'thương hiệu';
        if (!window.confirm(`Xóa ${typeLabel} "${item.name}"?`)) return;
        const resource = activeTab === 'categories' ? 'categories' : 'brands';
        try {
            await axiosClient.delete(`/admin/${resource}/${item.id}`);
            refreshRows(true);
            if (activeTab === 'categories') {
                setCategoryOptions((current) => current.filter((category) => category.id !== item.id));
            }
        } catch (requestError) {
            setError(requestError.response?.data?.message || `Không thể xóa ${typeLabel}; hãy kiểm tra các dữ liệu đang liên kết.`);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setPage(0);
        setSearchInput('');
        setSearch('');
        setStatusFilter('');
        setError('');
    };

    return (
        <div className="min-h-full p-4 md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Danh mục &amp; Thương hiệu</h1>
                        <p className="mt-1 text-sm text-slate-500">Quản lý cấu trúc danh mục và thương hiệu sản phẩm.</p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Thêm {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}
                    </button>
                </header>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex border-b border-slate-200 px-4">
                        <button
                            type="button"
                            onClick={() => handleTabChange('categories')}
                            className={`inline-flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-bold ${
                                activeTab === 'categories' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Layers size={17} /> Danh mục
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('brands')}
                            className={`inline-flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-bold ${
                                activeTab === 'brands' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Tag size={17} /> Thương hiệu
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row">
                        <label className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder={`Tìm ${activeTab === 'categories' ? 'danh mục' : 'thương hiệu'} theo tên hoặc slug...`}
                                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(event) => {
                                setStatusFilter(event.target.value);
                                setPage(0);
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                            aria-label="Lọc trạng thái"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="true">Đang hiển thị</option>
                            <option value="false">Đang ẩn</option>
                        </select>
                    </div>

                    {error && (
                        <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-3 font-bold">{activeTab === 'categories' ? 'Danh mục' : 'Thương hiệu'}</th>
                                    {activeTab === 'categories' && <th className="px-5 py-3 font-bold">Danh mục cha</th>}
                                    <th className="px-5 py-3 font-bold">Slug</th>
                                    <th className="px-5 py-3 text-center font-bold">Sản phẩm</th>
                                    <th className="px-5 py-3 text-center font-bold">Trạng thái</th>
                                    <th className="px-5 py-3 text-right font-bold">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={activeTab === 'categories' ? 6 : 5} className="px-5 py-12 text-center text-slate-500">Đang tải dữ liệu...</td></tr>
                                ) : rows.length === 0 ? (
                                    <tr><td colSpan={activeTab === 'categories' ? 6 : 5} className="px-5 py-12 text-center text-slate-500">Không tìm thấy dữ liệu phù hợp.</td></tr>
                                ) : rows.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/70">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {activeTab === 'categories' ? (
                                                    item.imageUrl
                                                        ? <img src={item.imageUrl} alt="" className="h-10 w-10 rounded-lg border border-slate-200 object-cover" />
                                                        : <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Layers size={18} /></span>
                                                ) : (
                                                    item.logoUrl
                                                        ? <img src={item.logoUrl} alt="" className="h-10 w-10 rounded-lg border border-slate-200 object-contain p-1" />
                                                        : <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Tag size={18} /></span>
                                                )}
                                                <div>
                                                    <div className="font-bold text-slate-800">{item.name}</div>
                                                    <div className="max-w-xs truncate text-xs text-slate-500">{item.description || 'Chưa có mô tả'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {activeTab === 'categories' && <td className="px-5 py-4 text-slate-600">{item.parentName || 'Danh mục gốc'}</td>}
                                        <td className="px-5 py-4 text-slate-600">{item.slug}</td>
                                        <td className="px-5 py-4 text-center font-semibold text-slate-700">{item.productCount ?? 0}</td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                                item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {item.isActive ? 'Đang hiển thị' : 'Đang ẩn'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-1">
                                                <button type="button" onClick={() => handleToggleVisibility(item)} title={item.isActive ? 'Ẩn' : 'Hiển thị'} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600">
                                                    {item.isActive ? <EyeOff size={17} /> : <Eye size={17} />}
                                                </button>
                                                <button type="button" onClick={() => openEditModal(item)} title="Chỉnh sửa" className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600">
                                                    <Edit3 size={17} />
                                                </button>
                                                <button type="button" onClick={() => handleDelete(item)} title="Xóa" className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600">
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <footer className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500">
                            {totalElements} {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}
                        </p>
                        <div className="flex items-center justify-end gap-2">
                            <button type="button" disabled={page <= 0 || loading} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40">
                                <ChevronLeft size={17} />
                            </button>
                            <span className="text-xs font-semibold text-slate-600">Trang {totalPages === 0 ? 0 : page + 1} / {totalPages}</span>
                            <button type="button" disabled={page + 1 >= totalPages || loading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40">
                                <ChevronRight size={17} />
                            </button>
                        </div>
                    </footer>
                </section>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => {
                    if (event.target === event.currentTarget) closeModal();
                }}>
                    <section role="dialog" aria-modal="true" aria-labelledby="catalog-modal-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h2 id="catalog-modal-title" className="text-lg font-black text-slate-900">
                                {editingItem ? 'Cập nhật' : 'Thêm'} {activeTab === 'categories' ? 'danh mục' : 'thương hiệu'}
                            </h2>
                            <button type="button" onClick={closeModal} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Đóng">
                                <X size={20} />
                            </button>
                        </header>
                        <form onSubmit={handleSubmit} className="space-y-4 p-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="space-y-1.5">
                                    <span className="text-sm font-semibold text-slate-700">Tên</span>
                                    <input required maxLength={150} value={activeTab === 'categories' ? categoryForm.name : brandForm.name} onChange={(event) => {
                                        const value = event.target.value;
                                        if (activeTab === 'categories') {
                                            setCategoryForm((form) => ({ ...form, name: value }));
                                        } else {
                                            setBrandForm((form) => ({ ...form, name: value }));
                                        }
                                    }} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                                </label>
                                <label className="space-y-1.5">
                                    <span className="text-sm font-semibold text-slate-700">Slug</span>
                                    <input required maxLength={180} value={activeTab === 'categories' ? categoryForm.slug : brandForm.slug} onChange={(event) => {
                                        const value = event.target.value;
                                        if (activeTab === 'categories') {
                                            setCategoryForm((form) => ({ ...form, slug: value }));
                                        } else {
                                            setBrandForm((form) => ({ ...form, slug: value }));
                                        }
                                    }} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                                </label>
                                {activeTab === 'categories' ? (
                                    <>
                                        <label className="space-y-1.5">
                                            <span className="text-sm font-semibold text-slate-700">Danh mục cha</span>
                                            <select value={categoryForm.parentId} onChange={(event) => setCategoryForm((form) => ({ ...form, parentId: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                                                <option value="">Danh mục gốc</option>
                                                {categoryOptions.filter((category) => category.id !== editingItem?.id).map((category) => (
                                                    <option key={category.id} value={category.id}>{category.name}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="space-y-1.5">
                                            <span className="text-sm font-semibold text-slate-700">Thứ tự hiển thị</span>
                                            <input type="number" min="0" value={categoryForm.sortOrder} onChange={(event) => setCategoryForm((form) => ({ ...form, sortOrder: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                                        </label>
                                    </>
                                ) : null}
                                <label className="space-y-1.5 sm:col-span-2">
                                    <span className="text-sm font-semibold text-slate-700">{activeTab === 'categories' ? 'URL ảnh' : 'URL logo'}</span>
                                    <input type="url" value={activeTab === 'categories' ? categoryForm.imageUrl : brandForm.logoUrl} onChange={(event) => {
                                        const value = event.target.value;
                                        if (activeTab === 'categories') {
                                            setCategoryForm((form) => ({ ...form, imageUrl: value }));
                                        } else {
                                            setBrandForm((form) => ({ ...form, logoUrl: value }));
                                        }
                                    }} placeholder="https://" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                                </label>
                                <label className="space-y-1.5 sm:col-span-2">
                                    <span className="text-sm font-semibold text-slate-700">Mô tả</span>
                                    <textarea rows="3" value={activeTab === 'categories' ? categoryForm.description : brandForm.description} onChange={(event) => {
                                        const value = event.target.value;
                                        if (activeTab === 'categories') {
                                            setCategoryForm((form) => ({ ...form, description: value }));
                                        } else {
                                            setBrandForm((form) => ({ ...form, description: value }));
                                        }
                                    }} className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                                </label>
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                                <input type="checkbox" checked={activeTab === 'categories' ? categoryForm.isActive : brandForm.isActive} onChange={(event) => {
                                    const value = event.target.checked;
                                    if (activeTab === 'categories') {
                                        setCategoryForm((form) => ({ ...form, isActive: value }));
                                    } else {
                                        setBrandForm((form) => ({ ...form, isActive: value }));
                                    }
                                }} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                                Hiển thị trên cửa hàng
                            </label>
                            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                                <button type="button" onClick={closeModal} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Hủy</button>
                                <button type="submit" disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
                                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;

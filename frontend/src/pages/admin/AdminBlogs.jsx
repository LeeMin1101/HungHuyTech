import { useState, useEffect } from 'react';
import { 
    FileText, Plus, Search, Filter, Edit, Trash2, 
    Eye, EyeOff, CheckCircle, Clock, X, Image as ImageIcon
} from 'lucide-react';
import axiosClient from '../../utils/axiosClient';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Style mặc định của Quill

const AdminBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Bộ lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL'); // DRAFT, PUBLISHED, HIDDEN

    // Modal và Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: 'Công nghệ',
        thumbnail: '',
        summary: '',
        content: '',
        status: 'PUBLISHED'
    });

    const categories = ['Công nghệ', 'Review Sản phẩm', 'Khuyến mãi', 'Thủ thuật', 'Thông báo'];

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/admin/blogs');
            setBlogs(res?.data?.data || res?.data?.content || res?.data || []);
        } catch (error) {
            console.error('Lỗi tải danh sách bài viết:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // Tự động tạo slug từ title nếu đang gõ title
            if (name === 'title' && !editingId) {
                newData.slug = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            }
            return newData;
        });
    };

    // Hàm xử lý nội dung từ ReactQuill
    const handleContentChange = (value) => {
        setFormData(prev => ({ ...prev, content: value }));
    };

    const handleOpenModal = (blog = null) => {
        if (blog) {
            setEditingId(blog.id);
            setFormData({
                title: blog.title,
                slug: blog.slug,
                category: blog.category,
                thumbnail: blog.thumbnail || '',
                summary: blog.summary || '',
                content: blog.content || '',
                status: blog.status
            });
        } else {
            setEditingId(null);
            setFormData({ title: '', slug: '', category: 'Công nghệ', thumbnail: '', summary: '', content: '', status: 'DRAFT' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.content || formData.content === '<p><br></p>') {
            return alert('Vui lòng nhập nội dung bài viết!');
        }

        setIsSubmitting(true);
        try {
            if (editingId) {
                await axiosClient.put(`/admin/blogs/${editingId}`, formData);
                alert('Cập nhật bài viết thành công!');
            } else {
                await axiosClient.post('/admin/blogs', formData);
                alert('Đăng bài viết mới thành công!');
            }
            setIsModalOpen(false);
            fetchBlogs();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu bài viết.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'HIDDEN' ? 'PUBLISHED' : 'HIDDEN';
        try {
            await axiosClient.put(`/admin/blogs/${id}/status`, { status: newStatus });
            setBlogs(blogs.map(b => b.id === id ? { ...b, status: newStatus } : b));
        } catch (error) {
            alert('Lỗi cập nhật trạng thái');
        }
    };

    const getStatusUI = (status) => {
        switch (status) {
            case 'PUBLISHED': return { text: 'Đã xuất bản', style: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
            case 'DRAFT': return { text: 'Bản nháp', style: 'bg-gray-100 text-gray-700 border-gray-200' };
            case 'HIDDEN': return { text: 'Đang ẩn', style: 'bg-red-100 text-red-700 border-red-200' };
            default: return { text: 'N/A', style: 'bg-gray-100 text-gray-500' };
        }
    };

    const filteredBlogs = blogs.filter(b => {
        const matchSearch = (b.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = filterCategory === 'ALL' || b.category === filterCategory;
        const matchStatus = filterStatus === 'ALL' || b.status === filterStatus;
        return matchSearch && matchCat && matchStatus;
    });

    // Cấu hình Toolbar cho ReactQuill
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image', 'video'],
            ['clean']
        ]
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 relative">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Tin tức & Bài viết công nghệ</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý nội dung blog, bài đánh giá và tin khuyến mãi</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus size={18} /> Viết bài mới
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" placeholder="Tìm kiếm theo tiêu đề bài viết..." 
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm bg-white"
                    />
                </div>
                <div className="flex gap-2 shrink-0">
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="py-2 px-3 border border-gray-200 rounded-lg text-sm outline-none bg-white text-gray-700 font-medium">
                        <option value="ALL">Tất cả chuyên mục</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="py-2 px-3 border border-gray-200 rounded-lg text-sm outline-none bg-white text-gray-700 font-medium">
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="PUBLISHED">Đã xuất bản</option>
                        <option value="DRAFT">Bản nháp</option>
                        <option value="HIDDEN">Đang ẩn</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm border-b border-gray-100">
                            <th className="p-4 font-semibold w-24">Ảnh bìa</th>
                            <th className="p-4 font-semibold">Tiêu đề bài viết</th>
                            <th className="p-4 font-semibold">Chuyên mục</th>
                            <th className="p-4 font-semibold">Ngày tạo</th>
                            <th className="p-4 font-semibold text-center">Trạng thái</th>
                            <th className="p-4 font-semibold text-center w-28">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredBlogs.map((b) => {
                            const statusInfo = getStatusUI(b.status);
                            return (
                                <tr key={b.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="w-16 h-12 bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
                                            {b.thumbnail ? <img src={b.thumbnail} className="w-full h-full object-cover"/> : <ImageIcon size={20} className="text-gray-400"/>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800 line-clamp-2">{b.title}</div>
                                        <div className="text-xs text-gray-400 mt-1">/{b.slug}</div>
                                    </td>
                                    <td className="p-4 font-medium text-blue-600">{b.category}</td>
                                    <td className="p-4 text-gray-600 text-xs flex items-center gap-1.5"><Clock size={14}/> {new Date(b.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold border ${statusInfo.style}`}>
                                            {statusInfo.text}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleToggleStatus(b.id, b.status)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors" title={b.status === 'HIDDEN' ? 'Hiển thị' : 'Ẩn bài'}>
                                                {b.status === 'HIDDEN' ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                            <button onClick={() => handleOpenModal(b)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors" title="Chỉnh sửa">
                                                <Edit size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredBlogs.length === 0 && <tr><td colSpan="6" className="text-center py-12 text-gray-500">Không có bài viết nào.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Modal Editor Soạn thảo bài viết */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[95vh]">
                        <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-slate-50 shrink-0">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                <FileText size={20} className="text-blue-600"/> 
                                {editingId ? 'Chỉnh sửa bài viết' : 'Soạn bài viết mới'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={24}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            <form id="blogForm" onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-800 mb-1">Tiêu đề bài viết *</label>
                                            <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Nhập tiêu đề..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:border-blue-500 outline-none font-semibold text-gray-800" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-800 mb-1">Đường dẫn (Slug)</label>
                                            <div className="flex items-center">
                                                <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-lg px-3 py-2 text-sm text-gray-500">hunghuy.com/blog/</span>
                                                <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full border border-gray-300 rounded-r-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-800 mb-1">Nội dung bài viết *</label>
                                            <div className="bg-white">
                                                <ReactQuill 
                                                    theme="snow" 
                                                    value={formData.content} 
                                                    onChange={handleContentChange} 
                                                    modules={modules}
                                                    className="h-80 mb-12"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                                            <label className="block text-sm font-bold text-gray-800 mb-2">Trạng thái xuất bản</label>
                                            <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-semibold outline-none">
                                                <option value="PUBLISHED">Công khai (Xuất bản)</option>
                                                <option value="DRAFT">Lưu Nháp</option>
                                                <option value="HIDDEN">Ẩn bài viết</option>
                                            </select>
                                        </div>

                                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                                            <label className="block text-sm font-bold text-gray-800 mb-2">Chuyên mục</label>
                                            <select name="category" value={formData.category} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none">
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>

                                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                                            <label className="block text-sm font-bold text-gray-800 mb-2">Ảnh bìa (Thumbnail URL)</label>
                                            <input type="text" name="thumbnail" value={formData.thumbnail} onChange={handleChange} placeholder="https://..." className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none mb-3" />
                                            {formData.thumbnail && (
                                                <img src={formData.thumbnail} alt="Preview" className="w-full h-32 object-cover rounded border border-gray-200"/>
                                            )}
                                        </div>

                                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                                            <label className="block text-sm font-bold text-gray-800 mb-2">Tóm tắt (Mô tả ngắn)</label>
                                            <textarea name="summary" value={formData.summary} onChange={handleChange} rows="4" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none resize-none"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-4 border-t border-gray-200 bg-white shrink-0 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">Đóng</button>
                            <button type="submit" form="blogForm" disabled={isSubmitting} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md transition-colors disabled:opacity-50 flex items-center gap-2">
                                {isSubmitting ? 'Đang lưu...' : (editingId ? 'Cập nhật bài viết' : 'Đăng bài viết')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBlogs;
import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Image as ImageIcon, X, Upload, Link as LinkIcon, Video, LayoutTemplate, MonitorPlay, CheckCircle } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const AdminBanners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [activeTab, setActiveTab] = useState('IMAGE'); 
    const [uploadMode, setUploadMode] = useState('FILE'); 
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Lưu thông tin file video để hiển thị UI ô vuông
    const [fileInfo, setFileInfo] = useState({ name: '', size: '' });

    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '', 
        targetLink: '',
        status: 'ACTIVE',
        type: 'IMAGE',
        highlight: '', 
        description: '' 
    });

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/admin/banners');
            const responseData = res?.data?.data || res?.data || res;
            setBanners(Array.isArray(responseData) ? responseData : []);
        } catch (error) {
            console.error('Lỗi tải danh sách banner:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const filteredBanners = banners.filter(b => b.type === activeTab || (!b.type && activeTab === 'IMAGE'));

    // Xử lý chung cho cả Ảnh và Video
    const processFile = (file) => {
        if (!file) return;

        if (activeTab === 'IMAGE' && !file.type.startsWith('image/')) {
            alert('Vui lòng chọn file hình ảnh hợp lệ!');
            return;
        }

        if (activeTab === 'VIDEO' && !file.type.startsWith('video/')) {
            alert('Vui lòng chọn file video hợp lệ (MP4)!');
            return;
        }

        const maxSize = activeTab === 'IMAGE' ? 5 : 20; 
        if (file.size > maxSize * 1024 * 1024) {
            alert(`Kích thước file quá lớn (tối đa ${maxSize}MB). Vui lòng chọn file nhẹ hơn hoặc dùng link URL.`);
            return;
        }

        // Lưu thông tin file để hiển thị giao diện UI
        setFileInfo({
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        });

        const reader = new FileReader();
        reader.onload = (e) => {
            setFormData(prev => ({ ...prev, imageUrl: e.target.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e) => processFile(e.target.files[0]);
    
    const handlePaste = (e) => {
        if (activeTab === 'VIDEO') return;
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                processFile(blob);
                e.preventDefault();
                break;
            }
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        processFile(e.dataTransfer.files[0]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenModal = (banner = null) => {
        setFileInfo({ name: '', size: '' }); // Reset file info
        if (banner) {
            setEditingId(banner.id);
            setFormData({
                title: banner.title,
                imageUrl: banner.imageUrl || banner.videoUrl,
                targetLink: banner.targetLink || '',
                status: banner.status,
                type: banner.type || 'IMAGE',
                highlight: banner.highlight || '',
                description: banner.description || ''
            });
            const isBase64 = (banner.imageUrl || banner.videoUrl)?.startsWith('data:');
            setUploadMode(isBase64 ? 'FILE' : 'URL');
            if(isBase64 && banner.type === 'VIDEO') {
                setFileInfo({ name: 'Video_Da_Tai_Len.mp4', size: 'Bản lưu nháp' });
            }
        } else {
            setEditingId(null);
            setFormData({ 
                title: '', imageUrl: '', targetLink: '', status: 'ACTIVE', 
                type: activeTab, highlight: '', description: '' 
            });
            setUploadMode('FILE'); // Mặc định mở tab upload file
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.imageUrl) {
            alert(`Vui lòng cung cấp link hoặc upload file ${activeTab === 'VIDEO' ? 'Video' : 'Hình ảnh'}!`);
            return;
        }

        // ==========================================
        // KHỐI LỆNH MỚI: BẢO VỆ CHỐNG UP NHẦM FILE/LINK
        // ==========================================
        const isVideoData = formData.imageUrl.startsWith('data:video') || formData.imageUrl.match(/\.(mp4|webm|ogg|mov)$/i);
        const isImageData = formData.imageUrl.startsWith('data:image') || formData.imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);

        if (formData.type === 'IMAGE' && isVideoData) {
            alert("❌ LỖI: Bạn đang ở mục thêm 'Ảnh' nhưng lại cung cấp dữ liệu của 'Video'.\nVui lòng tắt form này, chuyển sang tab 'Video Trang chủ' và thêm lại!");
            return;
        }

        if (formData.type === 'VIDEO' && isImageData) {
            alert("❌ LỖI: Bạn đang ở mục thêm 'Video' nhưng lại cung cấp dữ liệu của 'Ảnh'.\nVui lòng tắt form này, chuyển sang tab 'Ảnh Khuyến mãi' và thêm lại!");
            return;
        }
        // ==========================================

        setIsSubmitting(true);
        try {
            const payload = { ...formData };
            if (payload.type === 'VIDEO') {
                payload.videoUrl = payload.imageUrl; 
            }

            if (editingId) {
                await axiosClient.put(`/admin/banners/${editingId}`, payload);
                alert('Cập nhật thành công!');
            } else {
                await axiosClient.post('/admin/banners', payload);
                alert('Thêm mới thành công!');
            }
            setIsModalOpen(false);
            fetchBanners();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu. (Gợi ý: Nếu video lớn, server có thể chặn payload)');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'HIDDEN' ? 'ACTIVE' : 'HIDDEN';
        try {
            await axiosClient.put(`/admin/banners/${id}/status`, { status: newStatus });
            fetchBanners();
        } catch (error) {
            alert('Lỗi cập nhật trạng thái');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa mục này?')) {
            try {
                await axiosClient.delete(`/admin/banners/${id}`);
                fetchBanners();
            } catch (error) {
                alert('Lỗi khi xóa');
            }
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Quản lý Truyền thông</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý banner khuyến mãi và Video Hero</p>
                </div>
                
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('IMAGE')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'IMAGE' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <ImageIcon size={16} /> Ảnh Khuyến mãi
                    </button>
                    <button onClick={() => setActiveTab('VIDEO')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === 'VIDEO' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <Video size={16} /> Video Trang chủ
                    </button>
                </div>

                <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
                    <Plus size={18} /> Thêm {activeTab === 'IMAGE' ? 'Banner' : 'Video'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBanners.map(banner => (
                    <div key={banner.id} className={`border rounded-xl overflow-hidden transition-all flex flex-col ${banner.status === 'HIDDEN' ? 'opacity-60 grayscale-[50%]' : 'hover:shadow-md'}`}>
                        <div className="h-40 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                            {banner.type === 'VIDEO' ? (
                                <video src={banner.videoUrl || banner.imageUrl} className="w-full h-full object-cover opacity-70" muted loop playsInline />
                            ) : (
                                banner.imageUrl ? (
                                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon size={40} className="text-gray-500" />
                                )
                            )}
                            {banner.type === 'VIDEO' && <Video size={30} className="absolute text-white/50" />}
                            <div className="absolute top-2 right-2">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold text-white shadow-sm ${banner.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                    {banner.status === 'ACTIVE' ? 'ĐANG HIỂN THỊ' : 'ĐANG ẨN'}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-800 line-clamp-1">{banner.title}</h3>
                            {banner.type === 'VIDEO' ? (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{banner.description}</p>
                            ) : (
                                <p className="text-xs text-blue-500 mt-1 line-clamp-1 truncate">{banner.targetLink || 'Không có link liên kết'}</p>
                            )}
                            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
                                <button onClick={() => handleToggleStatus(banner.id, banner.status)} className="flex-1 py-1.5 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-semibold transition-colors">
                                    {banner.status === 'HIDDEN' ? <><Eye size={14} /> Hiện</> : <><EyeOff size={14} /> Ẩn</>}
                                </button>
                                <button onClick={() => handleOpenModal(banner)} className="flex-1 py-1.5 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-xs font-semibold transition-colors">
                                    <Edit size={14} /> Sửa
                                </button>
                                <button onClick={() => handleDelete(banner.id)} className="flex-1 py-1.5 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-xs font-semibold transition-colors">
                                    <Trash2 size={14} /> Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredBanners.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        Chưa có {activeTab === 'IMAGE' ? 'Banner' : 'Video'} nào.
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onPaste={handlePaste}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-slate-50">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                {activeTab === 'IMAGE' ? <ImageIcon size={20} className="text-blue-600" /> : <LayoutTemplate size={20} className="text-blue-600"/>}
                                {editingId ? 'Chỉnh sửa' : 'Thêm mới'} {activeTab === 'IMAGE' ? 'Banner' : 'Video Hero'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
                        </div>
                        
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <form id="bannerForm" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-1">{activeTab === 'IMAGE' ? 'Tên chiến dịch' : 'Tiêu đề chính'} *</label>
                                    <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                </div>

                                {activeTab === 'VIDEO' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-800 mb-1">Cụm từ nhấn mạnh</label>
                                            <input type="text" name="highlight" value={formData.highlight} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-800 mb-1">Đoạn mô tả ngắn</label>
                                            <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-bold text-gray-800">
                                            {activeTab === 'IMAGE' ? 'Hình ảnh Banner *' : 'Video nền (MP4) *'}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={() => setUploadMode('FILE')} className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${uploadMode === 'FILE' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>Tải file lên</button>
                                            <button type="button" onClick={() => setUploadMode('URL')} className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${uploadMode === 'URL' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>Dán link URL</button>
                                        </div>
                                    </div>

                                    {/* Upload Input */}
                                    {uploadMode === 'FILE' ? (
                                        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}`}>
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={activeTab === 'IMAGE' ? 'image/*' : 'video/mp4,video/x-m4v,video/*'} className="hidden" />
                                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Upload size={20} /></div>
                                                <p className="text-xs font-medium text-gray-700">Click hoặc kéo thả {activeTab === 'IMAGE' ? 'ảnh' : 'video'} vào đây</p>
                                                {activeTab === 'VIDEO' && <p className="text-[10px] text-gray-400">Giới hạn tối đa 20mb</p>}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <LinkIcon size={16} className="absolute left-3 top-3 text-gray-400" />
                                            <input required type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:border-blue-500 outline-none" placeholder={activeTab === 'IMAGE' ? "https://.../banner.jpg" : "https://.../video.mp4"} />
                                        </div>
                                    )}

                                    {/* PREVIEW ẢNH */}
                                    {formData.imageUrl && activeTab === 'IMAGE' && (
                                        <div className="mt-3 relative group">
                                            <img src={formData.imageUrl} alt="Preview" className="w-full h-36 object-cover rounded-lg border border-gray-200" />
                                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition-colors"><X size={14} /></button>
                                        </div>
                                    )}

                                    {/* PREVIEW VIDEO */}
                                    {formData.imageUrl && activeTab === 'VIDEO' && (
                                        <div className="mt-4 bg-[#1e1e1e] border border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className="w-14 h-14 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                                                    <MonitorPlay size={24} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-semibold text-sm truncate">{fileInfo.name || 'Video_Banner_Custom.mp4'}</h4>
                                                    <p className="text-gray-400 text-[11px] mt-1">MP4 • {fileInfo.size || 'URL Link'} • Trang chủ</p>
                                                    <p className="text-emerald-500 text-[11px] mt-1 flex items-center gap-1">
                                                        <CheckCircle size={12}/> {formData.status === 'ACTIVE' ? 'Đang hiển thị' : 'Đang ẩn'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => { setFormData(prev => ({ ...prev, imageUrl: '' })); setFileInfo({ name: '', size: '' }); }} className="p-2 ml-2 text-gray-400 hover:text-red-500 hover:bg-white/10 rounded-full transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-1">Trạng thái hiển thị</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                                        <option value="ACTIVE">Hiển thị ngay</option>
                                        <option value="HIDDEN">Ẩn (Bản nháp)</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition-colors">Hủy</button>
                            <button type="submit" form="bannerForm" disabled={isSubmitting} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
                                {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBanners;
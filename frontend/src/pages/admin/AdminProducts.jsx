import { useState, useEffect, useRef } from 'react';
import { 
    Plus, Edit, Trash2, X, Image as ImageIcon, UploadCloud, 
    CopyPlus, ArrowDown, Search, Filter, Download, Upload, 
    ChevronLeft, ChevronRight, CheckSquare, Square, Star, 
    Eye, EyeOff, Tag, Layers, Flame, Clock
} from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const AdminProducts = () => {
    // --- 1. STATE DỮ LIỆU ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 2. STATE TÌM KIẾM, LỌC, PHÂN TRANG & THAO TÁC HÀNG LOẠT ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedIds, setSelectedIds] = useState([]);
    const fileInputRef = useRef(null);

    // --- 3. STATE MODAL & FORM ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Quản lý ảnh (Hỗ trợ nhiều ảnh)
    const [existingImages, setExistingImages] = useState([]); 
    const [newImageFiles, setNewImageFiles] = useState([]); 
    const [previewUrls, setPreviewUrls] = useState([]); 

    // Form data chuẩn hóa (đã bổ sung trường Flash Sale & Thời gian kết thúc)
    const [formData, setFormData] = useState({
        name: '', categoryId: '', brandId: '', 
        shortDescription: '', specs: '', 
        isActive: true, isFeatured: false,
        isFlashSale: false, flashSaleEnd: '', // <--- MỚI: Quản lý Deal Hot / Flash Sale
        variants: [
            { id: null, sku: '', name: 'Mặc định', originalPrice: '', costPrice: '', salePrice: '', stock: '' }
        ]
    });

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [prodRes, catRes, brandRes] = await Promise.all([
                    axiosClient.get('/products'), 
                    axiosClient.get('/categories'),
                    axiosClient.get('/brands')
                ]);
                setProducts(prodRes?.data?.content || prodRes?.data?.data || prodRes?.data || []);
                setCategories(catRes?.data?.data || catRes?.data || []);
                setBrands(brandRes?.data?.data || brandRes?.data || []);
            } catch (error) {
                console.error('Lỗi tải dữ liệu:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- XỬ LÝ LỌC & PHÂN TRANG ---
    const filteredProducts = products.filter(p => {
        const matchSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = filterCategory ? p.categoryId?.toString() === filterCategory : true;
        return matchSearch && matchCategory;
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // --- THAO TÁC HÀNG LOẠT (BULK ACTIONS) ---
    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0) setSelectedIds([]);
        else setSelectedIds(paginatedProducts.map(p => p.id));
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Bạn chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn? Dữ liệu không thể khôi phục!`)) return;
        try {
            await Promise.all(selectedIds.map(id => axiosClient.delete(`/admin/products/${id}`)));
            setProducts(products.filter(p => !selectedIds.includes(p.id)));
            setSelectedIds([]);
            alert('Xóa hàng loạt thành công!');
        } catch (error) {
            alert('Có lỗi xảy ra khi xóa hàng loạt.');
        }
    };

    // --- IMPORT / EXPORT EXCEL ---
    const handleExportExcel = () => {
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + "ID,SKU,Tên Sản Phẩm,Danh Mục,Tồn Kho,Giá Bán,Trạng Thái\n" 
            + products.map(p => {
                const stock = p.variants?.[0]?.stock ?? p.stock ?? 0;
                return `${p.id},${p.sku || ''},"${p.name}","${p.categoryName || ''}",${stock},${p.minPrice || 0},${p.isActive ? 'Đang bán' : 'Ẩn'}`;
            }).join("\n");
        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = `Danh_Sach_San_Pham_${new Date().getTime()}.csv`;
        link.click();
    };

    const handleImportExcel = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        alert(`Đã nhận file: ${file.name}.`);
        e.target.value = null; 
    };

    // --- QUẢN LÝ MODAL & FORM ---
    const resetForm = () => {
        setFormData({
            name: '', categoryId: '', brandId: '', shortDescription: '', specs: '',
            isActive: true, isFeatured: false, isFlashSale: false, flashSaleEnd: '',
            variants: [{ id: null, sku: '', name: 'Mặc định', originalPrice: '', costPrice: '', salePrice: '', stock: '' }]
        });
        setExistingImages([]); setNewImageFiles([]); setPreviewUrls([]); setEditingId(null);
    };

    const handleOpenAdd = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (product) => {
        const variants = product.variants && product.variants.length > 0 
            ? product.variants.map(v => ({
                id: v.id, sku: v.sku || '', name: v.name || 'Mặc định',
                originalPrice: v.originalPrice || v.price || '',
                costPrice: v.costPrice || '',
                salePrice: v.price || '',
                stock: v.stock || 0
            }))
            : [{ id: null, sku: product.sku || '', name: 'Mặc định', originalPrice: product.minPrice || '', costPrice: '', salePrice: product.minPrice || '', stock: product.stock || 0 }];

        // Format lại thời gian dạng yyyy-MM-ddTHH:mm để truyền vào input type="datetime-local"
        let formattedDate = '';
        if (product.flashSaleEnd) {
            formattedDate = product.flashSaleEnd.substring(0, 16);
        }

        setFormData({
            name: product.name || '',
            categoryId: product.categoryId || '',
            brandId: product.brandId || '',
            shortDescription: product.shortDescription || '',
            specs: product.description || '', 
            isActive: product.isActive !== false,
            isFeatured: product.isFeatured === true,
            isFlashSale: product.isFlashSale === true,
            flashSaleEnd: formattedDate,
            variants: variants
        });

        setExistingImages(product.images || (product.primaryImageUrl ? [{ id: null, imageUrl: product.primaryImageUrl, isPrimary: true }] : []));
        setNewImageFiles([]); setPreviewUrls([]);
        setEditingId(product.id);
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // --- QUẢN LÝ ẢNH (MULTIPLE) ---
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setNewImageFiles(prev => [...prev, ...files]);
        
        const newUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newUrls]);
    };

    const removeNewImage = (index) => {
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImagesToCloudinary = async (files) => {
        const uploadedUrls = [];
        for (const file of files) {
            const data = new FormData();
            data.append('file', file);
            data.append('upload_preset', 'hunghuy_upload'); 
            try {
                const res = await fetch(`https://api.cloudinary.com/v1_1/dfsv3dslz/image/upload`, { method: 'POST', body: data });
                const result = await res.json();
                if (result.secure_url) uploadedUrls.push(result.secure_url);
            } catch (error) {
                console.error("Lỗi upload ảnh:", error);
            }
        }
        return uploadedUrls;
    };

    // --- QUẢN LÝ BIẾN THỂ (VARIANTS) ---
    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { id: null, sku: '', name: '', originalPrice: '', costPrice: '', salePrice: '', stock: '' }]
        }));
    };

    const removeVariant = (index) => {
        if (formData.variants.length === 1) return alert("Phải có ít nhất 1 phân loại/biến thể!");
        setFormData(prev => ({
            ...prev, variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index][field] = value;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    // --- SUBMIT FORM ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.variants.length === 0) return alert("Vui lòng nhập giá và tồn kho!");
        setIsSaving(true);
        
        try {
            const newUploadedUrls = newImageFiles.length > 0 ? await uploadImagesToCloudinary(newImageFiles) : [];
            
            const finalImages = [
                ...existingImages.map((img, i) => ({ id: img.id, imageUrl: img.imageUrl, isPrimary: i === 0, sortOrder: i + 1 })),
                ...newUploadedUrls.map((url, i) => ({ imageUrl: url, isPrimary: existingImages.length === 0 && i === 0, sortOrder: existingImages.length + i + 1 }))
            ];

            if (finalImages.length === 0) {
                alert("Vui lòng thêm ít nhất 1 hình ảnh sản phẩm!");
                setIsSaving(false); return;
            }

            const payload = {
                categoryId: parseInt(formData.categoryId),
                brandId: formData.brandId ? parseInt(formData.brandId) : null,
                name: formData.name,
                sku: formData.variants[0].sku || `SP-${Date.now()}`,
                shortDescription: formData.shortDescription,
                description: formData.specs, 
                isActive: formData.isActive,
                isFeatured: formData.isFeatured,
                isFlashSale: formData.isFlashSale,                                    // <--- MỚI: Truyền trạng thái Flash Sale
                flashSaleEnd: formData.flashSaleEnd ? `${formData.flashSaleEnd}:00` : null, // <--- MỚI: Truyền thời gian kết thúc
                variants: formData.variants.map((v, i) => ({
                    ...(v.id ? { id: v.id } : {}),
                    sku: v.sku || `VAR-${Date.now()}-${i}`,
                    name: v.name || "Mặc định",
                    price: parseFloat(v.salePrice) || parseFloat(v.originalPrice) || 0,
                    originalPrice: parseFloat(v.originalPrice) || parseFloat(v.salePrice) || 0,
                    costPrice: parseFloat(v.costPrice) || 0,
                    stock: parseInt(v.stock) || 0,
                    isActive: true
                })),
                images: finalImages
            };

            if (editingId) {
                await axiosClient.put(`/admin/products/${editingId}`, payload);
                alert('Cập nhật sản phẩm thành công!');
            } else {
                await axiosClient.post('/admin/products', payload);
                alert('Thêm sản phẩm mới thành công!');
            }
            
            setIsModalOpen(false);
            const res = await axiosClient.get('/products');
            setProducts(res?.data?.content || res?.data?.data || res?.data || []);
            
        } catch (error) {
            console.error('Lỗi khi lưu:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm!');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Không thể hoàn tác!')) {
            try {
                await axiosClient.delete(`/admin/products/${id}`);
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                alert('Sản phẩm đang phát sinh giao dịch, không thể xóa!');
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* --- HEADER TÍNH NĂNG --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
                    <p className="text-sm text-gray-500 mt-1">Tổng số: {filteredProducts.length} sản phẩm</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={handleExportExcel} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium flex items-center gap-2 transition-colors">
                        <Download size={16} /> Xuất Excel
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-medium flex items-center gap-2 transition-colors">
                        <Upload size={16} /> Nhập Excel
                        <input type="file" ref={fileInputRef} onChange={handleImportExcel} accept=".csv, .xlsx" className="hidden" />
                    </button>
                    <button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
                        <Plus size={18} /> Thêm Mới
                    </button>
                </div>
            </div>

            {/* --- THANH TÌM KIẾM & LỌC --- */}
            <div className="flex flex-col md:flex-row gap-4 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Tìm theo tên hoặc SKU..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:border-blue-500 outline-none text-sm" />
                </div>
                <div className="flex items-center gap-2 min-w-[200px]">
                    <Filter className="text-gray-400" size={18} />
                    <select value={filterCategory} onChange={(e) => {setFilterCategory(e.target.value); setCurrentPage(1);}} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none">
                        <option value="">Tất cả danh mục</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            {/* --- THANH CÔNG CỤ XÓA HÀNG LOẠT --- */}
            {selectedIds.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex justify-between items-center animate-fade-in">
                    <span className="text-sm font-medium text-blue-800">Đã chọn <b>{selectedIds.length}</b> sản phẩm</span>
                    <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors flex items-center gap-1"><Trash2 size={14}/> Xóa hàng loạt</button>
                </div>
            )}

            {/* --- BẢNG DỮ LIỆU --- */}
            <div className="overflow-x-auto rounded-lg border border-gray-100 mb-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm border-b border-gray-100">
                            <th className="p-4 w-12 cursor-pointer" onClick={toggleSelectAll}>
                                {selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0 ? <CheckSquare size={18} className="text-blue-600"/> : <Square size={18} className="text-gray-400"/>}
                            </th>
                            <th className="p-4 font-semibold w-20">Ảnh</th>
                            <th className="p-4 font-semibold">Tên sản phẩm & SKU</th>
                            <th className="p-4 font-semibold text-center">Tồn kho</th>
                            <th className="p-4 font-semibold text-right">Giá bán</th>
                            <th className="p-4 font-semibold text-center">Trạng thái</th>
                            <th className="p-4 font-semibold text-center w-24">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {paginatedProducts.map((product) => {
                            const stock = product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || product.stock || 0;
                            const isSelected = selectedIds.includes(product.id);
                            const variantsCount = product.variants ? product.variants.length : 0;

                            return (
                                <tr key={product.id} className={`${isSelected ? 'bg-blue-50/30' : 'hover:bg-blue-50/50'} transition-colors`}>
                                    <td className="p-4 cursor-pointer" onClick={() => toggleSelect(product.id)}>
                                        {isSelected ? <CheckSquare size={18} className="text-blue-600"/> : <Square size={18} className="text-gray-300"/>}
                                    </td>
                                    <td className="p-4">
                                        <div className="w-12 h-12 bg-white rounded border border-gray-200 p-1 relative">
                                            <img src={product.primaryImageUrl || 'https://placehold.co/100'} alt="" className="w-full h-full object-contain" />
                                            {product.images?.length > 1 && <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[9px] font-bold px-1.5 rounded-full">+{product.images.length - 1}</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-800 line-clamp-2" title={product.name}>
                                            {product.isFeatured && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded mr-1">HOT</span>}
                                            {product.isFlashSale && <span className="text-[10px] bg-orange-600 text-white px-1.5 py-0.5 rounded mr-2 flex items-center gap-0.5 inline-flex"><Flame size={10}/> DEAL SỐC</span>}
                                            {product.name}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                            <span>SKU: <span className="text-gray-700">{product.sku || 'N/A'}</span></span>
                                            {variantsCount > 1 && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px]">{variantsCount} biến thể</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{stock > 0 ? stock : 'Hết hàng'}</span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-red-600">
                                        {new Intl.NumberFormat('vi-VN').format(product.minPrice || 0)}đ
                                    </td>
                                    <td className="p-4 text-center">
                                        {product.isActive !== false 
                                            ? <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs"><Eye size={14}/> Đang bán</span>
                                            : <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs"><EyeOff size={14}/> Tạm ẩn</span>
                                        }
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => handleOpenEdit(product)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Sửa"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors" title="Xóa"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {paginatedProducts.length === 0 && <tr><td colSpan="7" className="text-center py-12 text-gray-500">Không tìm thấy sản phẩm nào!</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* --- PHÂN TRANG --- */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center text-sm text-gray-600">
                    <div>Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} / {filteredProducts.length}</div>
                    <div className="flex gap-1">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"><ChevronLeft size={16}/></button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded border ${currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}>{i + 1}</button>
                        ))}
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"><ChevronRight size={16}/></button>
                    </div>
                </div>
            )}

            {/* --- MODAL FORM --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-20 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 flex-1 space-y-8">
                            {/* SECTION 1: THÔNG TIN CƠ BẢN */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-4">
                                    <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><Tag size={18} className="text-blue-500"/> Thông tin cơ bản</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                                        <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" placeholder="VD: Laptop Gaming Asus ROG Strix..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                                            <select required name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                                                <option value="">-- Chọn --</option>
                                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                                            <select name="brandId" value={formData.brandId} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none">
                                                <option value="">-- Tự do / Lắp ráp --</option>
                                                {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                                        <textarea name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Thông số kỹ thuật chi tiết (Specs)</label>
                                        <textarea name="specs" value={formData.specs} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none resize-none" placeholder="CPU, RAM, SSD..."></textarea>
                                    </div>
                                </div>

                                {/* BÊN PHẢI: TRẠNG THÁI KINH DOANH, FLASH SALE & ẢNH */}
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                                        <h3 className="font-bold text-gray-800 text-sm">Trạng thái & Ưu đãi</h3>
                                        <div className="space-y-3">
                                            <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-colors">
                                                <span className="text-sm font-medium text-gray-700">Hiển thị trên Web</span>
                                                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-4 h-4 text-blue-600 rounded" />
                                            </label>
                                            <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-colors">
                                                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">Đánh dấu Nổi bật <Star size={14} className="text-yellow-500 fill-yellow-500"/></span>
                                                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500" />
                                            </label>
                                            
                                            {/* --- MỚI: BẬT / TẮT FLASH SALE DEAL SỐC --- */}
                                            <div className="pt-2 border-t border-gray-200 space-y-2">
                                                <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-colors">
                                                    <span className="text-sm font-bold text-orange-600 flex items-center gap-1"><Flame size={16}/> Bật Flash Sale Deal Sốc</span>
                                                    <input type="checkbox" name="isFlashSale" checked={formData.isFlashSale} onChange={handleInputChange} className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500" />
                                                </label>
                                                
                                                {formData.isFlashSale && (
                                                    <div className="pl-2">
                                                        <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Clock size={12}/> Thời gian kết thúc Deal</label>
                                                        <input 
                                                            type="datetime-local" 
                                                            name="flashSaleEnd" 
                                                            value={formData.flashSaleEnd} 
                                                            onChange={handleInputChange} 
                                                            className="w-full border border-orange-300 bg-orange-50/50 rounded-lg px-2.5 py-1.5 text-xs focus:border-orange-500 outline-none" 
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2"><ImageIcon size={16} className="text-blue-500"/> Hình ảnh Sản phẩm</h3>
                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                            {existingImages.map((img, index) => (
                                                <div key={`exist-${index}`} className="relative border rounded-lg overflow-hidden group h-20 bg-gray-50">
                                                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => removeExistingImage(index)} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                                    {index === 0 && <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[9px] text-center py-0.5">Ảnh Bìa</span>}
                                                </div>
                                            ))}
                                            {previewUrls.map((url, index) => (
                                                <div key={`new-${index}`} className="relative border border-blue-200 rounded-lg overflow-hidden group h-20 bg-blue-50">
                                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                                    <span className="absolute bottom-0 left-0 right-0 bg-emerald-500 text-white text-[9px] text-center py-0.5">Mới</span>
                                                </div>
                                            ))}
                                            <label className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg h-20 flex flex-col items-center justify-center cursor-pointer transition-colors">
                                                <Plus size={20} className="text-gray-400" />
                                                <span className="text-[10px] text-gray-500 mt-1">Thêm ảnh</span>
                                                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: BIẾN THỂ VÀ GIÁ BÁN */}
                            <div>
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><Layers size={18} className="text-purple-500"/> Thuộc tính & Giá bán (SKU, RAM, SSD, Màu sắc...)</h3>
                                    <button type="button" onClick={addVariant} className="text-sm bg-purple-50 text-purple-700 px-3 py-1.5 rounded-md hover:bg-purple-100 font-medium flex items-center gap-1"><Plus size={16}/> Thêm Phân loại</button>
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-600 text-xs">
                                            <tr>
                                                <th className="p-3 font-semibold min-w-[150px]">Tên Phân loại / Cấu hình</th>
                                                <th className="p-3 font-semibold w-32">Mã SKU</th>
                                                <th className="p-3 font-semibold w-32">Giá Vốn</th>
                                                <th className="p-3 font-semibold w-32">Giá Gốc</th>
                                                <th className="p-3 font-semibold w-32">Giá Khuyến Mãi</th>
                                                <th className="p-3 font-semibold w-24">Tồn kho</th>
                                                <th className="p-3 font-semibold w-12 text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {formData.variants.map((variant, index) => (
                                                <tr key={index} className="hover:bg-gray-50/50">
                                                    <td className="p-2">
                                                        <input required type="text" value={variant.name} onChange={(e) => handleVariantChange(index, 'name', e.target.value)} placeholder="VD: 16GB RAM - Đen" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none" />
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="text" value={variant.sku} onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} placeholder="Tự động" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none" />
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="number" value={variant.costPrice} onChange={(e) => handleVariantChange(index, 'costPrice', e.target.value)} placeholder="Giá vốn" className="w-full border border-gray-300 bg-gray-50 rounded px-2 py-1.5 text-sm outline-none" />
                                                    </td>
                                                    <td className="p-2">
                                                        <input required type="number" value={variant.originalPrice} onChange={(e) => handleVariantChange(index, 'originalPrice', e.target.value)} placeholder="Giá niêm yết" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none" />
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="number" value={variant.salePrice} onChange={(e) => handleVariantChange(index, 'salePrice', e.target.value)} placeholder="Để trống nếu = gốc" className="w-full border border-blue-200 bg-blue-50/30 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none font-semibold text-blue-700" />
                                                    </td>
                                                    <td className="p-2">
                                                        <input required type="number" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} min="0" placeholder="Số lượng" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none" />
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <button type="button" onClick={() => removeVariant(index)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><Trash2 size={16}/></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            {/* ACTION BUTTONS */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 bg-white sticky bottom-0 py-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Hủy</button>
                                <button type="submit" disabled={isSaving} className="px-8 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-70 shadow-md">
                                    {isSaving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Đang lưu...</> : 'LƯU SẢN PHẨM'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';
import { ShoppingCart, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext'; 

const ProductDetail = () => {
    const { id } = useParams(); 
    const navigate = useNavigate(); 
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [activeImage, setActiveImage] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);

    const { addToCart } = useCart(); 

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const fetchProductDetail = async () => {
            setProduct(null);
            setSelectedVariant(null);
            setLoading(true);

            try {
                const response = await axiosClient.get(`/products/${id}`);
                const data = response?.data?.data || response?.data; 
                setProduct(data);
                
                if (data.primaryImageUrl) {
                    setActiveImage(data.primaryImageUrl);
                } else if (data.images && data.images.length > 0) {
                    setActiveImage(data.images[0].imageUrl);
                }

                const availableVariant = data.variants?.find(variant =>
                    variant.isActive !== false && Number(variant.stock) > 0
                );
                setSelectedVariant(availableVariant || data.variants?.[0] || null);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductDetail();
    }, [id]);

    // ==========================================
    // HÀM XỬ LÝ MUA NGAY (ĐI THẲNG TỚI CHECKOUT)
    // ==========================================
    const handleBuyNow = () => {
        if (!selectedVariant?.id || !product.variants?.some(variant => String(variant.id) === String(selectedVariant.id))) {
            alert('Vui lòng chọn phiên bản sản phẩm trước khi mua.');
            return;
        }
        if (Number(selectedVariant.stock) < 1) {
            alert('Phiên bản này hiện đã hết hàng. Vui lòng chọn phiên bản khác.');
            return;
        }

        navigate('/checkout', { 
            state: { 
                isBuyNow: true,
                buyNowItem: {
                    product: product,
                    productId: product.id,
                    variant: selectedVariant,
                    variantId: selectedVariant.id,
                    quantity: 1,
                    price: selectedVariant.price,
                    imageUrl: activeImage
                }
            } 
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#f8f9fa]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!product) return <div className="text-center py-20">Không tìm thấy sản phẩm</div>;

    const displayPrice = selectedVariant?.price ?? product.minPrice ?? 0;
    const canPurchase = Boolean(selectedVariant?.id) &&
        Number(selectedVariant.stock) > 0 &&
        product.variants?.some(variant => String(variant.id) === String(selectedVariant.id));
    const oldPrice = displayPrice + (displayPrice * 0.15); 

    return (
        <div className="bg-[#f8f9fa] min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4">
                
                {/* Breadcrumb */}
                <div className="text-sm text-gray-500 mb-6 flex gap-2">
                    <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
                    <span>/</span>
                    <span className="hover:text-blue-600 cursor-pointer">{product.categoryName || 'Laptop'}</span>
                    <span>/</span>
                    <span className="text-gray-800 font-medium">{product.name}</span>
                </div>

                {/* Khối Thông tin chính */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 mb-8">
                    
                    {/* Cột trái: Hình ảnh */}
                    <div className="md:w-5/12 flex flex-col">
                        <div className="aspect-square border border-gray-200 rounded-lg p-4 mb-4 flex items-center justify-center">
                            <img src={activeImage} alt={product.name} className="w-full h-full object-contain" />
                        </div>
                        {/* List ảnh nhỏ (Thumbnails) */}
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                            {product.images?.map((img, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => setActiveImage(img.imageUrl)}
                                    className={`w-16 h-16 border rounded p-1 flex-shrink-0 ${activeImage === img.imageUrl ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    <img src={img.imageUrl} className="w-full h-full object-contain" alt="" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cột phải: Thông tin & Đặt hàng */}
                    <div className="md:w-7/12 flex flex-col">
                        <div className="mb-4">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{product.brandName}</span>
                            <h1 className="text-2xl font-bold text-gray-900 mt-1 mb-2">{product.name}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1 text-yellow-500"><Star size={16} fill="currentColor"/> 4.9</span>
                                <span>Mã SP: <b>{product.sku}</b></span>
                                <span>Bảo hành: <b>{product.warrantyMonths || 24} tháng</b></span>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
                            <div className="flex items-end gap-3 mb-2">
                                <span className="text-3xl font-bold text-red-600">{new Intl.NumberFormat('vi-VN').format(displayPrice)}đ</span>
                                <span className="text-base text-gray-400 line-through mb-1">{new Intl.NumberFormat('vi-VN').format(oldPrice)}đ</span>
                            </div>
                            <p className={`text-sm font-medium ${canPurchase ? 'text-green-600' : 'text-red-500'}`}>
                                {canPurchase
                                    ? `✓ Còn ${selectedVariant.stock} sản phẩm (Giao nhanh trong 2h)`
                                    : 'Phiên bản đã chọn hiện hết hàng'}
                            </p>
                        </div>

                        {/* Chọn Phiên bản (Variants) */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3">Chọn cấu hình:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((variant) => (
                                        <button 
                                            key={variant.id}
                                            onClick={() => setSelectedVariant(variant)}
                                            aria-pressed={String(selectedVariant?.id) === String(variant.id)}
                                            className={`px-4 py-2 border rounded-md text-sm transition-all ${selectedVariant?.id === variant.id ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}
                                        >
                                            {variant.sku.split('-').pop()} 
                                            <span className="block text-xs font-normal text-gray-500 mt-1">
                                                {new Intl.NumberFormat('vi-VN').format(variant.price)}đ
                                            </span>
                                            {Number(variant.stock) < 1 && (
                                                <span className="block text-xs text-red-500 mt-1">Hết hàng</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Nút Mua Hàng */}
                        <div className="flex gap-4 mt-auto">
                            <button 
                                onClick={() => {
                                    if (!canPurchase) {
                                        alert('Vui lòng chọn phiên bản còn hàng trước khi thêm vào giỏ.');
                                        return;
                                    }
                                    addToCart(product, selectedVariant, 1);
                                }}
                                disabled={!canPurchase}
                                className="flex-1 bg-blue-600 text-white font-bold text-lg py-4 rounded-lg shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                <ShoppingCart size={24}/> THÊM VÀO GIỎ HÀNG
                            </button>
                            <button 
                                onClick={handleBuyNow} 
                                disabled={!canPurchase}
                                className="flex-1 bg-red-600 text-white font-bold text-lg py-4 rounded-lg shadow-lg hover:bg-red-700 transition flex flex-col items-center justify-center leading-none cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                <span>MUA NGAY</span>
                                <span className="text-xs font-normal mt-1">Giao tận nơi hoặc nhận tại cửa hàng</span>
                            </button>
                        </div>

                        {/* Cam kết */}
                        <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-gray-100">
                            <div className="flex flex-col items-center text-center gap-2 text-sm text-gray-600">
                                <ShieldCheck size={24} className="text-blue-500"/>
                                <span>Bảo hành chính hãng 100%</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2 text-sm text-gray-600">
                                <Truck size={24} className="text-blue-500"/>
                                <span>Giao hàng miễn phí toàn quốc</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2 text-sm text-gray-600">
                                <RotateCcw size={24} className="text-blue-500"/>
                                <span>Đổi trả 7 ngày nếu lỗi phần cứng</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Khối Mô tả chi tiết */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 uppercase mb-4 border-b border-gray-100 pb-2">Đặc điểm nổi bật</h2>
                    <div className="prose max-w-none text-gray-700">
                        <p>{product.shortDescription}</p>
                        <p className="mt-4">{product.description || "Đang cập nhật thông tin chi tiết cho sản phẩm này..."}</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductDetail;
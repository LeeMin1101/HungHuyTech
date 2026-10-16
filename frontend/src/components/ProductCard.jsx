import { Heart, Star, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; 
import { useRef } from 'react';
import { useCart } from '../context/CartContext'; 

const ProductCard = ({ product, index, onAddToCart }) => { 
    const navigate = useNavigate();
    const imageRef = useRef(null);
    const { addToCart } = useCart(); 

    const availableVariant = product?.variants
        ?.filter(variant => variant.isActive !== false && Number(variant.stock) > 0)
        .sort((first, second) => Number(first.price) - Number(second.price))[0] || null;
    const price = availableVariant?.price ?? product.minPrice ?? 0;
    const oldPrice = price > 0 ? price + (price * 0.14) : 0; 
    const discountPercent = price > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
    
    const specs = product.shortDescription || "Đang cập nhật cấu hình"; 
    const brandName = product.brandName || "NO BRAND"; 
    const imageUrl = product.primaryImageUrl || "https://placehold.co/400x400/f3f4f6/a1a1aa?text=No+Image";

    const stock = product?.variants?.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0)
        ?? product?.stock
        ?? 0;
    const isOutOfStock = stock <= 0 || !availableVariant?.id;

    const handleBuyNow = (e) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        if (isOutOfStock) return; 

        navigate('/checkout', { 
            state: { 
                isBuyNow: true,
                buyNowItem: {
                    product: product,
                    productId: product.id,
                    variant: availableVariant,
                    variantId: availableVariant.id,
                    quantity: 1,
                    price: availableVariant.price,
                    imageUrl: imageUrl
                }
            } 
        });
    };

    const handleAddToCartClick = (e) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        if (isOutOfStock) return; 
        
        if (addToCart) {
            addToCart(product, availableVariant, 1); 
        }

        if (imageRef.current && onAddToCart) {
            const rect = imageRef.current.getBoundingClientRect();
            onAddToCart(e, product, rect);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-100 hover:border-blue-500 hover:shadow-lg transition-all duration-300 flex flex-col group relative overflow-hidden h-full">
            
            {isOutOfStock && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-[5] pointer-events-none"></div>
            )}

            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                {discountPercent > 0 && !isOutOfStock && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        GIẢM {discountPercent}%
                    </span>
                )}
                {product.isFeatured && !isOutOfStock && (
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        DEAL HOT
                    </span>
                )}
            </div>

            <button 
                className="absolute top-2 right-2 z-10 p-1.5 text-gray-400 hover:text-red-500 transition-colors bg-white/80 rounded-full shadow-sm cursor-pointer"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
                <Heart size={18} />
            </button>

            <Link to={`/product/${product.id}`} className="aspect-square p-4 flex items-center justify-center relative bg-white block">
                <img 
                    ref={imageRef} 
                    src={imageUrl} 
                    alt={product.name}
                    className={`w-full h-full object-contain transition-transform duration-300 ${!isOutOfStock ? 'group-hover:-translate-y-1' : 'grayscale opacity-60'}`}
                />
            </Link>
            
            <div className={`p-3 flex flex-col flex-grow border-t border-gray-50 ${isOutOfStock ? 'opacity-80' : ''}`}>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{brandName}</span>
                
                <Link to={`/product/${product.id}`}>
                    <h3 className={`text-sm font-semibold line-clamp-2 leading-snug mb-1 transition-colors ${!isOutOfStock ? 'text-gray-800 group-hover:text-blue-600' : 'text-gray-500'}`} title={product.name}>
                        {product.name}
                    </h3>
                </Link>
                
                <p className="text-[11px] text-gray-500 mb-2 truncate bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded w-fit">
                    {specs}
                </p>
                
                <div className="flex items-center gap-1 mb-2">
                    <Star fill="#fbbf24" stroke="none" size={12} className="text-yellow-400" />
                    <span className="text-xs font-bold text-gray-700">4.8</span>
                    <span className="text-xs text-gray-400">(126)</span>
                </div>
                
                <div className="mt-auto">
                    <div className="flex flex-col mb-3">
                        <div className="flex items-center gap-2">
                            <span className={`${isOutOfStock ? 'text-gray-500' : 'text-red-600'} font-bold text-lg leading-none`}>
                                {new Intl.NumberFormat('vi-VN').format(price)}đ
                            </span>
                            {isOutOfStock ? (
                                <span className="text-[11px] text-red-500 font-semibold">(Hết hàng)</span>
                            ) : (
                                <span className="text-[11px] text-gray-500">(Còn {stock})</span>
                            )}
                        </div>

                        {oldPrice > price && (
                            <span className="text-gray-400 text-xs line-through mt-1">
                                {new Intl.NumberFormat('vi-VN').format(oldPrice)}đ
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2 relative z-20">
                        <button 
                            className={`flex-1 font-bold text-sm py-2 rounded shadow transition-colors flex items-center justify-center ${
                                isOutOfStock 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                            }`}
                            onClick={handleBuyNow} 
                            disabled={isOutOfStock}
                        >
                            MUA NGAY
                        </button>
                        
                        <button 
                            className={`px-3 rounded shadow-sm transition-colors flex items-center justify-center group/cart ${
                                isOutOfStock 
                                    ? 'bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed' 
                                    : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white cursor-pointer'
                            }`}
                            onClick={handleAddToCartClick}
                            disabled={isOutOfStock}
                            title={isOutOfStock ? "Sản phẩm đã hết hàng" : "Thêm vào giỏ hàng"}
                        >
                            <ShoppingCart size={18} className={!isOutOfStock ? "group-hover/cart:scale-110 transition-transform" : ""} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity } = useCart();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const safeTotalPrice = cart.reduce((total, item) => {
        const price = item.variant?.price || item.product?.minPrice || 0;
        return total + (price * (item.quantity || 1));
    }, 0);

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#f8f9fa]">
                <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-2130356-1800917.png" alt="Empty Cart" className="w-64 h-64 object-contain opacity-70 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng của bạn đang trống</h2>
                <p className="text-gray-500 mb-6">Hãy chọn thêm sản phẩm để mua sắm nhé!</p>
                <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                    VỀ TRANG CHỦ MUA SẮM
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#f8f9fa] min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-2 mb-6">
                    <Link to="/" className="text-blue-600 flex items-center hover:underline font-medium text-sm">
                        <ArrowLeft size={16} className="mr-1"/> Tiếp tục mua sắm
                    </Link>
                </div>

                <h1 className="text-2xl font-black text-gray-900 mb-6 uppercase">Giỏ hàng của bạn</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-8/12">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {cart.map((item, index) => {
                                const price = item.variant?.price || item.product?.minPrice || 0;
                                const imgUrl = item.product?.primaryImageUrl || (item.product?.images?.length > 0 ? item.product.images[0].imageUrl : '');

                                return (
                                    <div key={`${item.product?.id}-${item.variant?.id || 'base'}`} className={`p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 ${index !== cart.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                        
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 border border-gray-200 rounded p-2 flex items-center justify-center bg-white">
                                            <img src={imgUrl} alt={item.product?.name} className="w-full h-full object-contain" />
                                        </div>

                                        <div className="flex-1 w-full text-center sm:text-left">
                                            <Link to={`/product/${item.product?.id}`} className="font-bold text-gray-800 text-base sm:text-lg hover:text-blue-600 line-clamp-2">
                                                {item.product?.name}
                                            </Link>
                                            
                                            {item.variant && item.variant.sku && (
                                                <p className="text-sm text-gray-500 mt-1">Cấu hình: <span className="font-medium text-gray-700">{item.variant.sku.split('-').pop()}</span></p>
                                            )}

                                            <p className="text-red-600 font-bold text-lg mt-2">
                                                {new Intl.NumberFormat('vi-VN').format(price)}đ
                                            </p>
                                        </div>

                                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 sm:gap-0 h-full mt-4 sm:mt-0">
                                            <div className="flex items-center border border-gray-300 rounded h-10 w-28">
                                                <button 
                                                    onClick={() => updateQuantity(item.product?.id, item.variant?.id, item.quantity - 1)}
                                                    className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition"
                                                ><Minus size={16}/></button>
                                                
                                                <input 
                                                    type="text" 
                                                    value={item.quantity} 
                                                    readOnly 
                                                    className="w-full h-full text-center font-semibold text-gray-700 focus:outline-none border-x border-gray-300"
                                                />
                                                
                                                <button 
                                                    onClick={() => updateQuantity(item.product?.id, item.variant?.id, item.quantity + 1)}
                                                    className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition"
                                                ><Plus size={16}/></button>
                                            </div>

                                            <button 
                                                onClick={() => removeFromCart(item.product?.id, item.variant?.id)}
                                                className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-sm font-medium transition sm:mt-auto"
                                            >
                                                <Trash2 size={16} /> <span className="hidden sm:inline">Xóa</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="lg:w-4/12">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-4">Tóm tắt đơn hàng</h2>
                            
                            <div className="flex justify-between mb-3 text-gray-600 text-sm">
                                <span>Tổng tiền sản phẩm:</span>
                                <span>{new Intl.NumberFormat('vi-VN').format(safeTotalPrice)}đ</span>
                            </div>
                            <div className="flex justify-between mb-4 text-gray-600 text-sm">
                                <span>Phí giao hàng:</span>
                                <span className="text-green-600 font-semibold">Miễn phí</span>
                            </div>
                            
                            <div className="border-t border-gray-100 pt-4 mb-6 flex justify-between items-center">
                                <span className="font-bold text-gray-800">Tổng thanh toán:</span>
                                <span className="text-2xl font-black text-red-600">
                                    {new Intl.NumberFormat('vi-VN').format(safeTotalPrice)}đ
                                </span>
                            </div>

                            <Link 
                                to="/checkout" 
                                className="w-full bg-red-600 text-white font-bold text-lg py-4 rounded-lg shadow-lg hover:bg-red-700 transition uppercase flex items-center justify-center text-center block"
                            >
                                Tiến hành đặt hàng
                            </Link>
                            <p className="text-xs text-center text-gray-400 mt-4">(Xin vui lòng kiểm tra lại đơn hàng trước khi đặt)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
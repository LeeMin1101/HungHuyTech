import { createContext, useState, useEffect, useContext } from 'react';

const hasValidIdentity = (product, variant) => {
    if (product?.id == null || variant?.id == null) return false;
    if (variant.productId != null && String(variant.productId) !== String(product.id)) return false;
    if (Array.isArray(product.variants) &&
        !product.variants.some(productVariant => String(productVariant.id) === String(variant.id))) {
        return false;
    }
    return true;
};

const readSavedCart = () => {
    const savedCart = localStorage.getItem('hungHuyCart');
    if (!savedCart) return [];

    try {
        const parsedCart = JSON.parse(savedCart);
        if (!Array.isArray(parsedCart)) throw new Error('Saved cart must be an array');

        return parsedCart
            .filter(item =>
                hasValidIdentity(item?.product, item?.variant) &&
                Number.isInteger(Number(item.quantity)) &&
                Number(item.quantity) > 0
            )
            .map(item => ({
                ...item,
                productId: item.product.id,
                variantId: item.variant.id,
                quantity: Number(item.quantity)
            }));
    } catch (error) {
        console.error('Không thể đọc giỏ hàng đã lưu:', error);
        localStorage.removeItem('hungHuyCart');
        return [];
    }
};

// Tạo Context
export const CartContext = createContext();

// Provider bọc ngoài ứng dụng
export const CartProvider = ({ children }) => {
    // Khởi tạo state giỏ hàng từ LocalStorage (để F5 không bị mất)
    const [cart, setCart] = useState(() => {
        return readSavedCart();
    });

    // Mỗi khi cart thay đổi, lưu lại vào LocalStorage ngay
    useEffect(() => {
        localStorage.setItem('hungHuyCart', JSON.stringify(cart));
    }, [cart]);

    // Hàm thêm vào giỏ
    const addToCart = (product, variant, quantity = 1) => {
        if (!hasValidIdentity(product, variant) || !Number.isInteger(quantity) || quantity < 1) {
            alert('Sản phẩm hoặc phiên bản không hợp lệ. Vui lòng tải lại trang sản phẩm.');
            return false;
        }

        setCart(prevCart => {
            // Kiểm tra xem sản phẩm (cùng variant) đã có trong giỏ chưa
            const existingItemIndex = prevCart.findIndex(
                item => String(item.productId) === String(product.id) &&
                    String(item.variantId) === String(variant.id)
            );

            if (existingItemIndex >= 0) {
                // Nếu có rồi thì cộng dồn số lượng
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += quantity;
                return newCart;
            } else {
                // Nếu chưa có thì thêm mới
                return [...prevCart, {
                    product,
                    productId: product.id,
                    variant,
                    variantId: variant.id,
                    quantity
                }];
            }
        });
        // Có thể thêm thư viện Toastify ở đây để hiện thông báo "Đã thêm thành công"
        alert("Đã thêm sản phẩm vào giỏ hàng!"); 
        return true;
    };

    // Hàm xóa khỏi giỏ
    const removeFromCart = (productId, variantId) => {
        setCart(prevCart => prevCart.filter(
            item => !(String(item.productId ?? item.product?.id) === String(productId) &&
                String(item.variantId ?? item.variant?.id) === String(variantId))
        ));
    };

    const clearCart = () => {
        setCart([]);
    };

    // Hàm thay đổi số lượng
    const updateQuantity = (productId, variantId, newQuantity) => {
        if (newQuantity < 1) return;
        setCart(prevCart => prevCart.map(item => {
            if (String(item.productId ?? item.product?.id) === String(productId) &&
                String(item.variantId ?? item.variant?.id) === String(variantId)) {
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    // Hàm đếm tổng số lượng sản phẩm trong giỏ (để hiện lên Header)
    const getCartTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    // Hàm tính tổng tiền
    const getCartTotalPrice = () => {
        return cart.reduce((total, item) => {
            const price = item.variant ? item.variant.price : (item.product.minPrice || 0);
            return total + (price * item.quantity);
        }, 0);
    };

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
            clearCart,
            updateQuantity,
            getCartTotalItems,
            getCartTotalPrice 
        }}>
            {children}
        </CartContext.Provider>
    );
};

// Hook tiện ích để gọi nhanh
export const useCart = () => useContext(CartContext);
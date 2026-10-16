import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Navigation } from 'lucide-react';
import axios from 'axios'; 
import axiosClient from '../utils/axiosClient';
import administrativeUnitsUrl from '../../../scripts/don_vi_hanh_chinh_cap_xa (1).csv?url';

const parseAdministrativeUnitsCsv = (csv) => {
    const parseCsvRow = (row) => {
        const values = [];
        let value = '';
        let insideQuotes = false;

        for (let index = 0; index < row.length; index += 1) {
            const character = row[index];

            if (character === '"' && row[index + 1] === '"' && insideQuotes) {
                value += '"';
                index += 1;
            } else if (character === '"') {
                insideQuotes = !insideQuotes;
            } else if (character === ',' && !insideQuotes) {
                values.push(value);
                value = '';
            } else {
                value += character;
            }
        }

        values.push(value);
        return values;
    };

    const rows = csv.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
    const headers = parseCsvRow(rows[0]);
    const requiredHeaders = ['ma_xa', 'ten_don_vi', 'loai_don_vi', 'tinh_thanh_pho'];
    const columnIndexes = Object.fromEntries(
        requiredHeaders.map(header => [header, headers.indexOf(header)])
    );

    if (requiredHeaders.some(header => columnIndexes[header] === -1)) {
        throw new Error('Thiếu cột bắt buộc trong CSV đơn vị hành chính.');
    }

    const provincesByName = new Map();
    const unitCodes = new Set();
    const validUnitTypes = new Set(['Phường', 'Xã', 'Đặc khu']);
    let unitCount = 0;

    for (const row of rows.slice(1)) {
        if (!row.trim()) continue;

        const values = parseCsvRow(row);
        const code = values[columnIndexes.ma_xa]?.trim();
        const name = values[columnIndexes.ten_don_vi]?.trim();
        const type = values[columnIndexes.loai_don_vi]?.trim();
        const provinceName = values[columnIndexes.tinh_thanh_pho]?.trim();

        if (!code || !name || !provinceName || !validUnitTypes.has(type) || unitCodes.has(code)) {
            throw new Error('CSV đơn vị hành chính có bản ghi không hợp lệ.');
        }

        unitCodes.add(code);
        unitCount += 1;

        if (!provincesByName.has(provinceName)) {
            provincesByName.set(provinceName, { name: provinceName, wards: [] });
        }

        provincesByName.get(provinceName).wards.push({ code, name, type });
    }

    const administrativeUnits = Array.from(provincesByName.values());
    if (administrativeUnits.length !== 34 || unitCount !== 3321) {
        throw new Error('CSV không chứa đủ 34 tỉnh/thành và 3.321 đơn vị cấp xã hiện hành.');
    }

    return administrativeUnits;
};

const Checkout = () => {
    const { cart, getCartTotalPrice, clearCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    // 1. KIỂM TRA ĐĂNG NHẬP
    useEffect(() => {
        const token = localStorage.getItem('token'); 
        if (!token) {
            navigate('/auth', { state: { from: location.pathname } });
        }
    }, [navigate, location]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const isBuyNow = location.state?.isBuyNow;
    const buyNowItem = location.state?.buyNowItem;

    // A Buy Now checkout must never fall back to potentially stale cart contents.
    const checkoutItems = isBuyNow ? (buyNowItem ? [buyNowItem] : []) : cart;
    const totalPrice = isBuyNow && buyNowItem
        ? (buyNowItem.price ?? buyNowItem.variant?.price ?? buyNowItem.product?.minPrice ?? 0) * (buyNowItem.quantity ?? 1)
        : getCartTotalPrice();

    const [customerInfo, setCustomerInfo] = useState({
        fullName: '',
        phone: '',
        streetName: '',
        houseNumber: '',
        note: '',
        paymentMethod: 'COD'
    });

    const [errors, setErrors] = useState({});

    const [locations, setLocations] = useState([]);
    const [wards, setWards] = useState([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);
    const [locationsError, setLocationsError] = useState(false);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [isLocating, setIsLocating] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);
    const [submitFeedback, setSubmitFeedback] = useState({ type: '', message: '' });

    useEffect(() => {
        let isActive = true;

        const loadAdministrativeUnits = async () => {
            try {
                const response = await fetch(administrativeUnitsUrl);
                if (!response.ok) {
                    throw new Error(`Không tải được dữ liệu địa chỉ: ${response.status}`);
                }

                const administrativeUnits = parseAdministrativeUnitsCsv(await response.text());
                if (isActive) setLocations(administrativeUnits);
            } catch (error) {
                console.error('Lỗi đọc dữ liệu đơn vị hành chính:', error);
                if (isActive) setLocationsError(true);
            } finally {
                if (isActive) setIsLoadingLocations(false);
            }
        };

        loadAdministrativeUnits();
        return () => {
            isActive = false;
        };
    }, []);

    const handleCityChange = (e) => {
        const cityName = e.target.value;
        setSelectedCity(cityName);
        setSelectedWard('');
        if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
        if (errors.ward) setErrors(prev => ({ ...prev, ward: '' }));
        
        const city = locations.find(location => location.name === cityName);
        setWards(city?.wards || []);
    };

    const handleWardChange = (e) => {
        setSelectedWard(e.target.value);
        if (errors.ward) setErrors(prev => ({ ...prev, ward: '' }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAutoLocate = () => {
        if (!navigator.geolocation) {
            alert("Trình duyệt của bạn không hỗ trợ định vị.");
            return;
        }

        if (locations.length === 0) {
            alert("Dữ liệu địa lý đang được tải, vui lòng thử lại sau vài giây.");
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=vi`;
                const res = await axios.get(url);
                const address = res.data.address;

                const normalize = (value) => String(value || '')
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/đ/g, 'd')
                    .replace(/^(thanh pho|tp\.?|tinh|phuong|xa|dac khu)\s*/i, '')
                    .trim();
                const provinceCandidates = [address.state, address.province, address.city].filter(Boolean);
                const matchedProvince = locations.find(province =>
                    provinceCandidates.some(candidate => normalize(province.name) === normalize(candidate))
                );
                const wardCandidates = [
                    address.suburb,
                    address.village,
                    address.quarter,
                    address.neighbourhood,
                    address.city_district,
                    address.hamlet,
                    address.residential
                ].filter(Boolean);
                const matchedWard = matchedProvince?.wards.find(ward =>
                    wardCandidates.some(candidate => normalize(ward.name) === normalize(candidate))
                );

                setCustomerInfo(prev => ({
                    ...prev,
                    houseNumber: address.house_number || '',
                    streetName: address.road || address.pedestrian || ''
                }));
                setErrors(prev => ({ ...prev, houseNumber: '', streetName: '', city: '', ward: '' }));

                if (matchedProvince) {
                    setSelectedCity(matchedProvince.name);
                    setWards(matchedProvince.wards);
                    setSelectedWard(matchedWard?.code || '');
                } else {
                    alert("Đã định vị được vị trí nhưng không khớp Tỉnh/Thành phố trong dữ liệu. Vui lòng chọn địa chỉ thủ công.");
                }
            } catch (error) {
                console.error("Lỗi lấy vị trí:", error);
                alert("Đã có lỗi xảy ra khi phân tích địa chỉ của bạn.");
            } finally {
                setIsLocating(false);
            }
        }, (error) => {
            setIsLocating(false);
            if (error.code === 1) {
                alert("Vui lòng cấp quyền truy cập vị trí trên trình duyệt.");
            } else {
                alert("Mạng chậm hoặc không thể lấy được tọa độ hiện tại của bạn.");
            }
        }, { 
            enableHighAccuracy: true, 
            timeout: 15000, 
            maximumAge: 0 
        });
    };

    if (checkoutItems.length === 0) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center bg-[#f8f9fa]">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng của bạn đang trống</h2>
                <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">Quay lại trang chủ</button>
            </div>
        );
    }

    const validateForm = () => {
        const newErrors = {};
        
        if (!customerInfo.fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ và tên người nhận';
        }

        if (!customerInfo.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        } else if (!/(0[3|5|7|8|9])+([0-9]{8})\b/.test(customerInfo.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ (Gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)';
        }

        if (!selectedCity) newErrors.city = 'Vui lòng chọn Tỉnh/Thành phố';
        if (!selectedWard) newErrors.ward = 'Vui lòng chọn Phường/Xã/Đặc khu';
        if (!customerInfo.streetName.trim()) newErrors.streetName = 'Vui lòng nhập tên đường';
        if (!customerInfo.houseNumber.trim()) newErrors.houseNumber = 'Vui lòng nhập số nhà/tòa nhà';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            window.scrollTo({ top: 100, behavior: 'smooth' });
            return;
        }

        const provinceName = locations.find(province => province.name === selectedCity)?.name;
        const wardName = wards.find(ward => ward.code === selectedWard)?.name;
        const fullAddress = `${customerInfo.houseNumber.trim()}, ${customerInfo.streetName.trim()}, ${wardName}, ${provinceName}`;
        const orderItems = checkoutItems.map(item => ({
            productId: Number(item.productId ?? item.product?.id),
            variantId: Number(item.variantId ?? item.variant?.id),
            quantity: Number(item.quantity)
        }));

        const hasInvalidItem = checkoutItems.some((item, index) => {
            const orderItem = orderItems[index];
            const variants = item.product?.variants || [];
            const hasConflictingProductId = item.productId != null && item.product?.id != null &&
                String(item.productId) !== String(item.product.id);
            const hasConflictingVariantId = item.variantId != null && item.variant?.id != null &&
                String(item.variantId) !== String(item.variant.id);
            const variantBelongsToProduct = variants.some(
                variant => String(variant.id) === String(orderItem.variantId)
            );

            return !Number.isSafeInteger(Number(orderItem.productId)) || Number(orderItem.productId) < 1 ||
                !Number.isSafeInteger(Number(orderItem.variantId)) || Number(orderItem.variantId) < 1 ||
                !Number.isSafeInteger(Number(orderItem.quantity)) || Number(orderItem.quantity) < 1 ||
                (item.variant?.productId != null &&
                    String(item.variant.productId) !== String(orderItem.productId)) ||
                hasConflictingProductId ||
                hasConflictingVariantId ||
                !variantBelongsToProduct;
        });

        if (hasInvalidItem) {
            setSubmitFeedback({
                type: 'error',
                message: 'Thông tin sản phẩm hoặc phiên bản không hợp lệ. Vui lòng tải lại sản phẩm và thử lại.'
            });
            return;
        }

        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);
        setSubmitFeedback({ type: '', message: '' });

        const orderPayload = {
            recipientName: customerInfo.fullName,
            recipientPhone: customerInfo.phone,
            shippingAddress: fullAddress,
            note: customerInfo.note,
            paymentMethod: customerInfo.paymentMethod,
            items: orderItems
        };

        try {
            await axiosClient.post('/orders', orderPayload);

            if (!isBuyNow) clearCart();
            
            setSubmitFeedback({
                type: 'success',
                message: 'Đặt hàng thành công. Hệ thống đang chuyển hướng...'
            });
            
            setTimeout(() => {
                navigate('/orders', { replace: true });
            }, 1500);

        } catch (error) {
            let errorMessage = "Đã xảy ra lỗi kết nối đến máy chủ. Vui lòng thử lại sau.";
            if (error.response?.data) {
                const backendData = error.response.data;
                errorMessage = backendData.message || backendData.error || errorMessage;
            }
            
            setSubmitFeedback({
                type: 'error',
                message: errorMessage
            });
            
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-6">
                    <Link to="/cart" className="text-blue-600 flex items-center hover:underline font-medium text-sm w-fit">
                        <ArrowLeft size={16} className="mr-1"/> Quay lại giỏ hàng
                    </Link>
                </div>

                <h1 className="text-2xl font-black text-gray-900 mb-6 uppercase">Thanh toán & Đặt hàng</h1>

                <form className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Cột trái: Thông tin khách hàng */}
                    <div className="lg:w-7/12 flex flex-col gap-6">
                        
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Thông tin người nhận</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Họ và tên *</label>
                                    <input 
                                        type="text" 
                                        name="fullName" 
                                        value={customerInfo.fullName} 
                                        onChange={handleInputChange} 
                                        placeholder="Nhập họ và tên" 
                                        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 transition-colors ${errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                    />
                                    {errors.fullName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.fullName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Số điện thoại *</label>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        value={customerInfo.phone} 
                                        onChange={handleInputChange} 
                                        placeholder="Nhập số điện thoại" 
                                        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 transition-colors ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone}</p>}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mb-4">
                                <h2 className="text-lg font-bold text-gray-800">Địa chỉ giao hàng</h2>
                                <button 
                                    type="button" 
                                    onClick={handleAutoLocate}
                                    disabled={isLocating}
                                    className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isLocating ? (
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Navigation size={16}/>
                                    )}
                                    {isLocating ? 'Đang định vị...' : 'Dùng vị trí hiện tại'}
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Tỉnh/Thành phố *</label>
                                    <select 
                                        value={selectedCity} 
                                        onChange={handleCityChange} 
                                        disabled={isLoadingLocations || locationsError} 
                                        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none transition-colors disabled:bg-gray-100 ${errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white'}`}
                                    >
                                        <option value="">{isLoadingLocations ? 'Đang tải dữ liệu...' : 'Chọn Tỉnh/Thành phố'}</option>
                                        {locations.map(province => (
                                            <option key={province.name} value={province.name}>{province.name}</option>
                                        ))}
                                    </select>
                                    {errors.city && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.city}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Phường/Xã/Đặc khu *</label>
                                    <select 
                                        value={selectedWard} 
                                        onChange={handleWardChange} 
                                        disabled={!selectedCity || isLoadingLocations || locationsError} 
                                        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none transition-colors disabled:bg-gray-100 ${errors.ward ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white'}`}
                                    >
                                        <option value="">Chọn Phường/Xã/Đặc khu</option>
                                        {wards.map(ward => (
                                            <option key={ward.code} value={ward.code}>{ward.name}</option>
                                        ))}
                                    </select>
                                    {errors.ward && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.ward}</p>}
                                </div>
                            </div>

                            {locationsError && (
                                <p role="alert" className="text-sm text-red-600 mb-4">
                                    Không thể tải dữ liệu đơn vị hành chính. Vui lòng tải lại trang.
                                </p>
                            )}

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Tên đường *</label>
                                    <input 
                                        type="text" 
                                        name="streetName" 
                                        value={customerInfo.streetName} 
                                        onChange={handleInputChange} 
                                        placeholder="Ví dụ: Lê Lợi" 
                                        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 transition-colors ${errors.streetName ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                    />
                                    {errors.streetName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.streetName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Số nhà / số căn hộ / tòa nhà *</label>
                                    <input 
                                        type="text" 
                                        name="houseNumber" 
                                        value={customerInfo.houseNumber} 
                                        onChange={handleInputChange} 
                                        placeholder="Ví dụ: 123" 
                                        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 transition-colors ${errors.houseNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                    />
                                    {errors.houseNumber && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.houseNumber}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Ghi chú giao hàng (Tùy chọn)</label>
                                    <textarea 
                                        name="note" 
                                        value={customerInfo.note} 
                                        onChange={handleInputChange} 
                                        rows="2" 
                                        placeholder="Ghi chú thêm (ví dụ: Giao giờ hành chính)" 
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Phương thức thanh toán</h2>
                            <div className="flex flex-col gap-3">
                                <label className={`border rounded-lg p-4 cursor-pointer flex items-center gap-3 transition-colors ${customerInfo.paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                    <input type="radio" name="paymentMethod" value="COD" checked={customerInfo.paymentMethod === 'COD'} onChange={handleInputChange} className="w-5 h-5 text-blue-600"/>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-800">Thanh toán khi nhận hàng (COD)</span>
                                        <span className="text-sm text-gray-500">Khách hàng thanh toán bằng tiền mặt khi nhận hàng.</span>
                                    </div>
                                </label>
                                <label className={`border rounded-lg p-4 cursor-pointer flex items-center gap-3 transition-colors ${customerInfo.paymentMethod === 'BANK_TRANSFER' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                    <input type="radio" name="paymentMethod" value="BANK_TRANSFER" checked={customerInfo.paymentMethod === 'BANK_TRANSFER'} onChange={handleInputChange} className="w-5 h-5 text-blue-600"/>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-800">Chuyển khoản qua SePay</span>
                                        <span className="text-sm text-gray-500">Thanh toán tự động qua mã QR. Đơn hàng được xác nhận ngay lập tức.</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Thông tin giỏ hàng */}
                    <div className="lg:w-5/12">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-4">Đơn hàng của bạn ({checkoutItems.length} sản phẩm)</h2>
                            
                            <div className="flex flex-col gap-4 mb-6 max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
                                {checkoutItems.map((item, index) => {
                                    const price = item.price || item.variant?.price || item.product?.minPrice || 0;
                                    const imgUrl = item.imageUrl || item.product?.primaryImageUrl || (item.product?.images?.length > 0 ? item.product.images[0].imageUrl : '');
                                    
                                    return (
                                        <div key={index} className="flex gap-3">
                                            <div className="w-16 h-16 border border-gray-200 rounded p-1 flex-shrink-0 bg-white relative">
                                                <img src={imgUrl} className="w-full h-full object-contain" alt="" />
                                                <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{item.quantity}</span>
                                            </div>
                                            <div className="flex flex-col flex-1 justify-center">
                                                <span className="text-sm font-semibold text-gray-800 line-clamp-2">{item.product?.name}</span>
                                                <span className="text-sm font-bold text-red-600 mt-1">{new Intl.NumberFormat('vi-VN').format(price)}đ</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Tạm tính:</span>
                                    <span>{new Intl.NumberFormat('vi-VN').format(totalPrice)}đ</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Phí vận chuyển:</span>
                                    <span className="text-green-600 font-semibold">Miễn phí</span>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-100 pt-4 mb-6 flex justify-between items-center">
                                <span className="font-bold text-gray-800 text-lg">Tổng cộng:</span>
                                <span className="text-2xl font-black text-red-600">
                                    {new Intl.NumberFormat('vi-VN').format(totalPrice)}đ
                                </span>
                            </div>

                            {submitFeedback.message && (
                                <div className={`mb-4 rounded-lg border px-3 py-2 text-sm ${submitFeedback.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                                    {submitFeedback.message}
                                </div>
                            )}

                            <button 
                                type="button" 
                                onClick={handlePlaceOrder}
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-lg shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 uppercase disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang xử lý đơn hàng...</span>
                                    </>
                                ) : (
                                    <span>Đặt Hàng Ngay</span>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
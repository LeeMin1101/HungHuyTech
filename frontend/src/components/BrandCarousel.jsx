import React from 'react';

const BrandCarousel = () => {
    // Danh sách tên file chính xác như trong thư mục của bạn
    const brands = [
        'acer', 'amd', 'aoc', 'ares', 'asus', 'brother', 'cisco', 'dell', 'dlink', 'draytek', 
        'gigabyte', 'grandstream', 'hp', 'intel', 'kaspersky', 'kbvision-usa', 'lenovo', 'lg', 
        'linksys', 'logitech', 'microsoft', 'msi', 'questek', 'samsung', 'santak', 'seagate', 
        'tenda', 'totolink', 'tp-link', 'transcend', 'western', 'hewlett'
    ];

    return (
        <div className="mb-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="mb-6 border-b border-gray-100 pb-3">
                <h2 className="text-xl font-bold text-gray-800 uppercase relative after:content-[''] after:absolute after:bottom-[-3px] after:left-0 after:w-16 after:h-[3px] after:bg-blue-600">
                    THƯƠNG HIỆU ĐỒNG HÀNH
                </h2>
                <p className="text-sm text-gray-500 mt-1">Sản phẩm từ các đối tác công nghệ uy tín</p>
            </div>

            {/* Container trượt */}
            <div className="relative flex overflow-hidden group">
                <style>
                    {`
                    @keyframes scroll-infinite {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-infinite-scroll {
                        animation: scroll-infinite 45s linear infinite;
                        width: max-content;
                    }
                    /* Dừng trượt khi người dùng di chuột vào để dễ nhìn logo */
                    .animate-infinite-scroll:hover {
                        animation-play-state: paused;
                    }
                    `}
                </style>

                {/* Khối chứa ảnh - Nhân đôi mảng [...brands, ...brands] để tạo hiệu ứng nối đuôi vô tận */}
                <div className="flex items-center gap-10 animate-infinite-scroll py-2">
                    {[...brands, ...brands].map((brand, index) => (
                        <div 
                            key={index} 
                            // Đã xóa grayscale, chỉ giữ hiệu ứng hover nảy lên nhẹ
                            className="w-28 flex-shrink-0 flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer"
                        >
                            <img 
                                src={`/logo-nhan-hang/${brand}.png`} 
                                alt={`Logo ${brand}`} 
                                className="max-h-12 w-auto object-contain"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BrandCarousel;
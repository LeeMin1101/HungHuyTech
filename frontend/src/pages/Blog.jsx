import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Tag, ChevronRight, Image as ImageIcon } from 'lucide-react';
// Đã sửa: lùi 1 thư mục (../) thay vì 2 thư mục (../../)
import axiosClient from '../utils/axiosClient';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Tất cả');

    const categories = ['Tất cả', 'Công nghệ', 'Review Sản phẩm', 'Khuyến mãi', 'Thủ thuật', 'Thông báo'];

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                // Lưu ý: Đảm bảo Backend có API /blogs (Public) không yêu cầu token
                const res = await axiosClient.get('/blogs');
                const data = res?.data?.data || res?.data?.content || res?.data || [];
                // Chỉ hiển thị các bài viết đã xuất bản
                const publishedBlogs = data.filter(blog => blog.status === 'PUBLISHED');
                setBlogs(publishedBlogs);
            } catch (error) {
                console.error('Lỗi tải danh sách bài viết:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    const filteredBlogs = activeCategory === 'Tất cả' 
        ? blogs 
        : blogs.filter(b => b.category === activeCategory);

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-4">Tin tức & Khuyến mãi</h1>
                    <p className="text-gray-500">Cập nhật những thông tin công nghệ mới nhất, mẹo hay và các chương trình khuyến mãi hấp dẫn từ Hùng Huy.</p>
                </div>

                {/* Filter Categories */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                                activeCategory === cat 
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredBlogs.map((blog) => (
                        <div key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow group flex flex-col">
                            {/* Thumbnail */}
                            <Link to={`/blog/${blog.slug}`} className="relative h-56 overflow-hidden bg-gray-100 flex items-center justify-center block">
                                {blog.thumbnail ? (
                                    <img 
                                        src={blog.thumbnail} 
                                        alt={blog.title} 
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <ImageIcon size={40} className="text-gray-300" />
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 flex items-center gap-1">
                                    <Tag size={12} /> {blog.category}
                                </div>
                            </Link>

                            {/* Content */}
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-medium">
                                    <Clock size={14} />
                                    {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                                
                                <Link to={`/blog/${blog.slug}`}>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {blog.title}
                                    </h3>
                                </Link>
                                
                                <p className="text-slate-700 dark:text-slate-300 text-sm mb-6 line-clamp-3 flex-1">
                                    {blog.summary || 'Chưa có mô tả ngắn cho bài viết này.'}
                                </p>
                                
                                <Link to={`/blog/${blog.slug}`} className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all mt-auto w-max">
                                    Đọc tiếp <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredBlogs.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500 font-medium">Chưa có bài viết nào trong chuyên mục này.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
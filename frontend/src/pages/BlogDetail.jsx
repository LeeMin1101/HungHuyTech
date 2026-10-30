import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Tag, ArrowLeft } from 'lucide-react';
// Đã sửa: lùi 1 thư mục (../) thay vì 2 thư mục (../../)
import axiosClient from '../utils/axiosClient';

const BlogDetail = () => {
    const { slug } = useParams(); // Lấy slug từ URL
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogDetail = async () => {
            try {
                // Cần API backend: GET /blogs/{slug}
                const res = await axiosClient.get(`/blogs/${slug}`);
                setBlog(res?.data?.data || res?.data);
            } catch (error) {
                console.error('Lỗi tải bài viết:', error);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchBlogDetail();
    }, [slug]);

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div></div>;

    if (!blog) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy bài viết</h2>
            <Link to="/blog" className="text-blue-600 hover:underline">Quay lại trang Tin tức</Link>
        </div>
    );

    return (
        <div className="bg-white min-h-screen py-10">
            <div className="max-w-3xl mx-auto px-4">
                {/* Breadcrumb */}
                <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors">
                    <ArrowLeft size={16} /> Quay lại danh sách
                </Link>

                {/* Tiêu đề & Thông tin */}
                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                            <Tag size={12} /> {blog.category}
                        </span>
                        <span className="text-gray-500 text-sm flex items-center gap-1.5 font-medium">
                            <Clock size={14} /> {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
                        {blog.title}
                    </h1>
                    {blog.summary && (
                        <p className="text-lg text-gray-600 font-medium italic border-l-4 border-blue-500 pl-4">
                            {blog.summary}
                        </p>
                    )}
                </header>

                {/* Ảnh bìa */}
                {blog.thumbnail && (
                    <div className="rounded-2xl overflow-hidden mb-10 shadow-sm border border-gray-100">
                        <img src={blog.thumbnail} alt={blog.title} className="w-full h-auto max-h-[500px] object-cover" />
                    </div>
                )}

                {/* Nội dung bài viết (Rich Text HTML) */}
                <article 
                    className="prose prose-lg prose-blue max-w-none text-gray-800 
                               prose-headings:font-bold prose-headings:text-gray-900 
                               prose-a:text-blue-600 hover:prose-a:text-blue-800
                               prose-img:rounded-xl prose-img:mx-auto"
                    // Render HTML từ ReactQuill
                    dangerouslySetInnerHTML={{ __html: blog.content }} 
                />
            </div>
        </div>
    );
};

export default BlogDetail;
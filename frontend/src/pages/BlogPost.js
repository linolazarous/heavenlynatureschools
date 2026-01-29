import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, ArrowLeft } from "lucide-react";
import api from "../services/api";

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/blog/${id}`);
        setPost(res.data);
      } catch (error) {
        console.error("Post not found", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center">
        Loading post...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-24 text-center">
        <h1 className="text-4xl font-bold">Post Not Found</h1>
        <Link to="/blog" className="text-primary">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <article className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/blog" className="inline-flex items-center mb-8">
            <ArrowLeft size={20} className="mr-2" />
            Back to Blog
          </Link>

          {post.image_url && (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-96 object-cover rounded-xl mb-8"
            />
          )}

          <div className="flex items-center text-muted-foreground mb-4">
            <Calendar size={18} className="mr-2" />
            {new Date(post.publish_date).toDateString()}
          </div>

          <h1 className="text-4xl font-bold mb-8">{post.title}</h1>

          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    </div>
  );
};

export default BlogPost;

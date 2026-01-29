import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import api from "../services/api";

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/blog");
        setPosts(res.data);
      } catch (error) {
        console.error("Failed to fetch blog posts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="min-h-screen pt-24">
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-6">
              Our Blog
            </h1>
            <p className="text-xl text-muted-foreground">
              Stories, updates, and insights from Heavenly Nature Schools
            </p>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No blog posts yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden"
                >
                  {post.image_url && (
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{ backgroundImage: `url(${post.image_url})` }}
                    />
                  )}

                  <div className="p-6">
                    <div className="flex text-sm text-muted-foreground mb-4">
                      <Calendar size={16} className="mr-2" />
                      {formatDate(post.publish_date)}
                      <Clock size={16} className="ml-4 mr-2" />
                      5 min read
                    </div>

                    <h2 className="text-2xl font-semibold mb-3">
                      {post.title}
                    </h2>

                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>

                    <Link
                      to={`/blog/${post.id}`}
                      className="inline-flex items-center text-primary"
                    >
                      Read More <ArrowRight size={16} className="ml-2" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;

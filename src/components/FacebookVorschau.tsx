import { useEffect, useState } from 'react';
import { Facebook } from 'lucide-react';
import { fetchFacebookCache } from '../lib/reservations';
import type { FacebookCache } from '../types/reservations';

export default function FacebookVorschau() {
  const [post, setPost] = useState<FacebookCache | null>(null);

  useEffect(() => {
    fetchFacebookCache()
      .then(setPost)
      .catch(() => setPost(null));
  }, []);

  if (!post?.post_id) return null;

  return (
    <a
      href={post.permalink_url || 'https://facebook.com/RitterRestaurant'}
      target="_blank"
      rel="noopener noreferrer"
      className="block max-w-md mx-auto card-meadow rounded-sm p-5 hover:border-gold/40 transition-colors"
    >
      <div className="flex items-center gap-2 mb-3">
        <Facebook size={16} className="text-[#1877F2]" />
        <span className="font-cinzel text-xs tracking-widest uppercase text-forest-muted" style={{ fontFamily: 'Cinzel, serif' }}>
          Neuestes von Facebook
        </span>
      </div>
      {post.picture_url && (
        <img src={post.picture_url} alt="" className="w-full h-40 object-cover rounded-sm mb-3" />
      )}
      {post.message && <p className="font-inter text-sm text-forest-muted line-clamp-3">{post.message}</p>}
    </a>
  );
}

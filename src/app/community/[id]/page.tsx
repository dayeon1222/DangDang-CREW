"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Post } from "@/types/dog";
import {
  ArrowLeft,
  Trash2,
  Edit2,
  Heart,
  MessageCircle,
  Send,
  CornerDownRight,
} from "lucide-react";
import { Comment } from "@/types/dog";

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null); // 입력창 제어용 ref
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const fetchData = useCallback(
    async (uId: string | null) => {
      const { count } = await supabase
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", id);
      setLikeCount(count || 0);

      if (uId) {
        const { data } = await supabase
          .from("post_likes")
          .select("*")
          .eq("post_id", id)
          .eq("user_id", uId)
          .maybeSingle();
        setIsLiked(!!data);
      }

      const { data: commentData } = await supabase
        .from("comments")
        .select(`*, profiles:user_id (nickname), comment_likes (user_id)`)
        .eq("post_id", id)
        .order("created_at", { ascending: true });
      setComments(commentData || []);
    },
    [id],
  );

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const uId = user?.id || null;
      setUserId(uId);
      const { data, error } = await supabase
        .from("posts")
        .select(`*, profiles:user_id (nickname)`)
        .eq("id", id)
        .single();
      if (error) router.back();
      else {
        setPost(data);
        fetchData(uId);
      }
      setLoading(false);
    };
    init();
  }, [id, router, fetchData]);

  const handleAddComment = async (parentId: string | null = null) => {
    if (!userId) return alert("로그인이 필요합니다.");
    if (!newComment.trim()) return;

    const { error } = await supabase.from("comments").insert({
      post_id: id,
      user_id: userId,
      content: newComment,
      parent_id: parentId,
    });
    if (error) alert("댓글 등록 실패");
    else {
      setNewComment("");
      setReplyTo(null);
      fetchData(userId);
    }
  };

  const toggleCommentLike = async (commentId: string, isLiked: boolean) => {
    if (!userId) return alert("로그인이 필요합니다.");
    if (isLiked)
      await supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", userId);
    else
      await supabase
        .from("comment_likes")
        .insert({ comment_id: commentId, user_id: userId });
    fetchData(userId);
  };

  const toggleLike = async () => {
    if (!userId) return alert("로그인이 필요합니다.");
    if (isLiked) {
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", id)
        .eq("user_id", userId);
      setLikeCount((prev) => prev - 1);
    } else {
      await supabase
        .from("post_likes")
        .insert({ post_id: id, user_id: userId });
      setLikeCount((prev) => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  if (loading) return <div className="p-10 text-center">불러오는 중...</div>;
  if (!post) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-white min-h-screen pb-20">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft size={24} />
        </button>
        {userId === post.user_id && (
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/community/edit/${id}`)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <Edit2 size={20} />
            </button>
            <button
              onClick={() => {
                if (confirm("삭제하시겠습니까?")) {
                  supabase.from("posts").delete().eq("id", id);
                  router.push("/community");
                }
              }}
              className="p-2 text-red-500 rounded-full"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </div>

      <article className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        {post.image_url && (
          <img src={post.image_url} className="w-full rounded-2xl mb-6" />
        )}
        <p className="text-lg text-gray-700 whitespace-pre-line">
          {post.content}
        </p>
      </article>

      <div className="flex gap-4 border-y py-4 mb-8">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-2 font-bold ${isLiked ? "text-red-500" : "text-gray-500"}`}
        >
          <Heart size={24} fill={isLiked ? "currentColor" : "none"} /> 좋아요{" "}
          {likeCount}
        </button>
        <div className="flex items-center gap-2 text-gray-500 font-bold">
          <MessageCircle size={24} /> 댓글 {comments.length}
        </div>
      </div>

      <section>
        <h3 className="font-bold text-lg mb-4">
          {replyTo ? "답글 작성 중..." : `댓글 ${comments.length}`}
        </h3>
        <div className="flex gap-2 mb-6">
          <textarea
            ref={textareaRef} // ref 연결
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 p-3 border border-gray-200 rounded-lg"
            placeholder={
              replyTo ? "답글을 입력하세요..." : "댓글을 입력하세요..."
            }
            rows={2}
          />
          <button
            onClick={() => handleAddComment(replyTo)}
            className="bg-primary text-white px-6 rounded-lg font-bold"
          >
            <Send size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {comments
            .filter((c) => !c.parent_id)
            .map((c) => (
              <div key={c.id}>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-bold text-gray-700">
                    {c.profiles?.nickname || "익명"}
                  </p>
                  <p className="text-gray-600 mt-1">{c.content}</p>
                  <div className="flex gap-4 mt-2 text-xs">
                    <button
                      onClick={() =>
                        toggleCommentLike(
                          c.id,
                          c.comment_likes.some((l) => l.user_id === userId),
                        )
                      }
                      className={
                        c.comment_likes.some((l) => l.user_id === userId)
                          ? "text-red-500"
                          : "text-gray-500"
                      }
                    >
                      좋아요 {c.comment_likes.length}
                    </button>
                    <button
                      onClick={() => {
                        setReplyTo(c.id);
                        textareaRef.current?.focus();
                      }}
                      className="text-gray-500"
                    >
                      답글달기
                    </button>
                  </div>
                </div>
                {comments
                  .filter((r) => r.parent_id === c.id)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="ml-10 mt-2 p-4 bg-gray-100 rounded-xl flex gap-2"
                    >
                      <CornerDownRight size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-bold text-gray-700">
                          {r.profiles?.nickname || "익명"}
                        </p>
                        <p className="text-gray-600 mt-1">{r.content}</p>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}

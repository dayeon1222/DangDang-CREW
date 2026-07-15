"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Post, Comment } from "@/types/community";
import {
  ArrowLeft,
  Trash2,
  Edit2,
  Heart,
  MessageCircle,
  Send,
  CornerDownRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // 1. 로그인 유저 정보 쿼리
  const { data: userId = null } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id || null;
    },
    staleTime: Infinity,
  });

  // 2. 게시글 정보 쿼리
  const { data: post = null, isLoading: isPostLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`*, profiles:user_id (nickname)`)
        .eq("id", id)
        .single();

      if (error) {
        router.back();
        return null;
      }
      return data as Post;
    },
    enabled: !!id,
  });

  // 3. 좋아요 개수 및 현재 유저의 좋아요 여부 쿼리
  const { data: likeData = { count: 0, isLiked: false } } = useQuery({
    queryKey: ["postLikes", id, userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", id);

      let isLiked = false;
      if (userId) {
        const { data } = await supabase
          .from("post_likes")
          .select("*")
          .eq("post_id", id)
          .eq("user_id", userId)
          .maybeSingle();
        isLiked = !!data;
      }

      return { count: count || 0, isLiked };
    },
    enabled: !!id,
  });

  // 4. 댓글 리스트 쿼리
  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("comments")
        .select(`*, profiles:user_id (nickname), comment_likes (user_id)`)
        .eq("post_id", id)
        .order("created_at", { ascending: true });
      return (data || []) as Comment[];
    },
    enabled: !!id,
  });

  // 5. 게시글 삭제 뮤테이션
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      router.push("/community");
    },
    onError: () => {
      alert("게시글 삭제에 실패했습니다.");
    },
  });

  // 6. 게시글 좋아요 토글 뮤테이션
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("로그인이 필요합니다.");

      if (likeData.isLiked) {
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", id)
          .eq("user_id", userId);
      } else {
        await supabase
          .from("post_likes")
          .insert({ post_id: id, user_id: userId });
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["postLikes", id, userId] });
      const previousLikes = queryClient.getQueryData(["postLikes", id, userId]);

      queryClient.setQueryData(["postLikes", id, userId], (old: any) => ({
        count: old.isLiked ? old.count - 1 : old.count + 1,
        isLiked: !old.isLiked,
      }));

      return { previousLikes };
    },
    onError: (err, variables, context) => {
      if (err.message === "로그인이 필요합니다.") {
        alert(err.message);
      } else {
        alert("좋아요 처리에 실패했습니다.");
      }
      if (context?.previousLikes) {
        queryClient.setQueryData(
          ["postLikes", id, userId],
          context.previousLikes,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["postLikes", id, userId] });
    },
  });

  // 7. 댓글 등록 뮤테이션
  const addCommentMutation = useMutation({
    mutationFn: async (parentId: string | null = null) => {
      if (!userId) throw new Error("로그인이 필요합니다.");
      if (!newComment.trim()) return;

      const { error } = await supabase.from("comments").insert({
        post_id: id,
        user_id: userId,
        content: newComment,
        parent_id: parentId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
    },
    onError: (err: any) => {
      alert(err.message || "댓글 등록 실패");
    },
  });

  // 8. 댓글 좋아요 토글 뮤테이션
  const toggleCommentLikeMutation = useMutation({
    mutationFn: async ({
      commentId,
      isCommentLiked,
    }: {
      commentId: string;
      isCommentLiked: boolean;
    }) => {
      if (!userId) throw new Error("로그인이 필요합니다.");

      if (isCommentLiked) {
        await supabase
          .from("comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", userId);
      } else {
        await supabase
          .from("comment_likes")
          .insert({ comment_id: commentId, user_id: userId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
    },
    onError: (err: any) => {
      alert(err.message || "좋아요 처리 실패");
    },
  });

  if (isPostLoading || isCommentsLoading)
    return <div className="p-10 text-center text-gray-500">불러오는 중...</div>;
  if (!post) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-2">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        {userId === post.user_id && (
          <div className="flex gap-1">
            <button
              onClick={() => router.push(`/community/edit/${id}`)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <Edit2 size={20} />
            </button>
            <button
              onClick={() => {
                if (confirm("삭제하시겠습니까?")) {
                  deletePostMutation.mutate();
                }
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Article */}
      <article className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
          {post.title}
        </h1>
        {post.image_url && (
          <div className="relative w-full aspect-video mb-6">
            <img
              src={post.image_url}
              className="w-full h-full object-cover rounded-2xl shadow-sm"
              alt="post image"
            />
          </div>
        )}
        <p className="text-base md:text-lg text-gray-700 whitespace-pre-line leading-relaxed">
          {post.content}
        </p>
      </article>

      {/* Like & Stats */}
      <div className="flex gap-6 border-y border-gray-100 py-4 mb-8">
        <button
          onClick={() => toggleLikeMutation.mutate()}
          className={`flex items-center gap-2 font-bold transition-colors ${
            likeData.isLiked
              ? "text-red-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Heart size={24} fill={likeData.isLiked ? "currentColor" : "none"} />
          좋아요 {likeData.count}
        </button>
        <div className="flex items-center gap-2 text-gray-500 font-bold">
          <MessageCircle size={24} /> 댓글 {comments.length}
        </div>
      </div>

      {/* Comments Section */}
      <section className="pb-10">
        <h3 className="font-bold text-lg mb-4 text-gray-900">
          {replyTo ? "답글 작성 중..." : `댓글 ${comments.length}`}
        </h3>

        {/* Comment Input */}
        <div className="flex gap-2 mb-8 bg-gray-50 p-2 rounded-xl">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 p-3 bg-transparent rounded-lg focus:outline-none text-sm md:text-base resize-none"
            placeholder={
              replyTo ? "답글을 입력하세요..." : "댓글을 입력하세요..."
            }
            rows={2}
          />
          <button
            onClick={() => addCommentMutation.mutate(replyTo)}
            disabled={addCommentMutation.isPending}
            className="bg-primary hover:bg-opacity-90 text-white px-4 md:px-6 rounded-lg font-bold transition-all disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>

        {/* Comment List */}
        <div className="space-y-6">
          {comments
            .filter((c) => !c.parent_id)
            .map((c) => (
              <div key={c.id} className="space-y-2">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 mb-1">
                    {c.profiles?.nickname || "익명"}
                  </p>
                  <p className="text-gray-700 text-sm md:text-base">
                    {c.content}
                  </p>
                  <div className="flex gap-4 mt-3 text-xs font-bold">
                    <button
                      onClick={() =>
                        toggleCommentLikeMutation.mutate({
                          commentId: c.id,
                          isCommentLiked: c.comment_likes.some(
                            (l) => l.user_id === userId,
                          ),
                        })
                      }
                      className={
                        c.comment_likes.some((l) => l.user_id === userId)
                          ? "text-red-500"
                          : "text-gray-400 hover:text-gray-600"
                      }
                    >
                      좋아요 {c.comment_likes.length}
                    </button>
                    <button
                      onClick={() => {
                        setReplyTo(c.id);
                        textareaRef.current?.focus();
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      답글달기
                    </button>
                  </div>
                </div>

                {/* Replies */}
                {comments
                  .filter((r) => r.parent_id === c.id)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="ml-6 md:ml-10 p-4 bg-white border border-gray-100 rounded-2xl flex gap-3 shadow-sm"
                    >
                      <CornerDownRight
                        size={16}
                        className="text-gray-300 mt-1"
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-400 mb-1">
                          {r.profiles?.nickname || "익명"}
                        </p>
                        <p className="text-gray-700 text-sm md:text-base">
                          {r.content}
                        </p>
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

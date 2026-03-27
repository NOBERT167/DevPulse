import axios from "axios";
import type { PostsResponse, Post, Comment, Stats, AIDraft } from "./types";

const api = axios.create({ baseURL: "/api" });

// Posts (public)
export const getPosts = async (params: {
  search?: string;
  category?: string;
  page?: number;
}): Promise<PostsResponse> => {
  const { data } = await api.get("/posts", { params });
  return data;
};

export const getPostBySlug = async (slug: string): Promise<Post> => {
  const { data } = await api.get(`/posts/${slug}`);
  return data;
};

// Comments
export const getComments = async (postId: string): Promise<Comment[]> => {
  const { data } = await api.get(`/comments/${postId}`);
  return data;
};

export const createComment = async (body: {
  postId: string;
  body: string;
  userName: string;
  userAvatar: string;
}): Promise<Comment> => {
  const { data } = await api.post("/comments", body);
  return data;
};

export const deleteComment = async (id: string): Promise<void> => {
  await api.delete(`/comments/${id}`);
};

// Admin
export const getStats = async (): Promise<Stats> => {
  const { data } = await api.get("/admin/stats");
  return data;
};

export const getAdminPosts = async (params: {
  page?: number;
}): Promise<PostsResponse> => {
  const { data } = await api.get("/admin/posts", { params });
  return data;
};

export const createPost = async (body: Partial<Post>): Promise<Post> => {
  const { data } = await api.post("/admin/posts", body);
  return data;
};

export const updatePost = async (
  id: string,
  body: Partial<Post>,
): Promise<Post> => {
  const { data } = await api.put(`/admin/posts/${id}`, body);
  return data;
};

export const deletePost = async (id: string): Promise<void> => {
  await api.delete(`/admin/posts/${id}`);
};

export const togglePostPublish = async (id: string): Promise<Post> => {
  const { data } = await api.patch(`/admin/posts/${id}/toggle`);
  return data;
};

// AI
export const generateAIDraft = async (body: {
  prompt: string;
  category?: string;
}): Promise<AIDraft> => {
  const { data } = await api.post("/ai/generate", body);
  return data;
};

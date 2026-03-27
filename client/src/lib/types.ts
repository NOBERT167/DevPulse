export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  category: "Programming" | "Tech" | "AI";
  tags: string[];
  author: {
    userId: string;
    name: string;
    avatar: string;
  };
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  body: string;
  createdAt: string;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Stats {
  totalPosts: number;
  publishedPosts: number;
  totalComments: number;
}

export interface AIDraft {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
}

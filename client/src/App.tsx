import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import SinglePostPage from "@/pages/SinglePostPage";
import AdminLayout from "@/pages/admin/AdminLayout";
import OverviewPage from "@/pages/admin/OverviewPage";
import ManagePostsPage from "@/pages/admin/ManagePostsPage";
import { CreatePostPage, EditPostPage } from "@/pages/admin/CreatePostPage";
import AIAssistantPage from "@/pages/admin/AIAssistantPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/post/:slug" element={<SinglePostPage />} />
      </Route>
      <Route element={<Layout />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="posts" element={<ManagePostsPage />} />
          <Route path="create" element={<CreatePostPage />} />
          <Route path="edit/:id" element={<EditPostPage />} />
          <Route path="ai" element={<AIAssistantPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

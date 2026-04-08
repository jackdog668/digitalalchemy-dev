import { PostEditor } from "@/app/admin/_components/PostEditor";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold">New post</h1>
      <PostEditor />
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { createPost, updatePost, type PostInput } from "@/app/admin/_actions";
import { BLOG_CATEGORIES } from "@/lib/blog-constants";

interface Props {
  initial?: Partial<PostInput> & { id?: string };
}

const CATS = BLOG_CATEGORIES.filter((c) => c !== "All");

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function PostEditor({ initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState<PostInput>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    content: initial?.content ?? "",
    category: initial?.category ?? CATS[0],
    tags: initial?.tags ?? [],
    cover_image: initial?.cover_image ?? "",
    status: initial?.status ?? "draft",
    published_at: initial?.published_at ?? "",
  });
  const [tagsText, setTagsText] = useState(form.tags.join(", "));

  function onTitleChange(v: string) {
    setForm((f) => ({
      ...f,
      title: v,
      slug: f.slug || slugify(v),
    }));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const parsedTags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const payload: PostInput = { ...form, tags: parsedTags };

    startTransition(async () => {
      try {
        if (initial?.id) {
          await updatePost(initial.id, payload);
        } else {
          await createPost(payload);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  const inputCls =
    "w-full rounded-lg border border-da-border bg-da-dark px-4 py-3 text-da-text outline-none focus:border-da-indigo";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm text-da-muted">Title</label>
        <input
          className={inputCls}
          value={form.title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-da-muted">Slug</label>
        <input
          className={inputCls}
          value={form.slug}
          onChange={(e) =>
            setForm((f) => ({ ...f, slug: slugify(e.target.value) }))
          }
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-da-muted">Description</label>
        <textarea
          className={`${inputCls} min-h-[80px]`}
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-da-muted">Category</label>
          <select
            className={inputCls}
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
          >
            {CATS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-da-muted">
            Tags (comma-separated)
          </label>
          <input
            className={inputCls}
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-da-muted">
          Cover image URL (optional)
        </label>
        <input
          className={inputCls}
          type="url"
          value={form.cover_image}
          onChange={(e) =>
            setForm((f) => ({ ...f, cover_image: e.target.value }))
          }
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-da-muted">
          Content (MDX)
        </label>
        <textarea
          className={`${inputCls} min-h-[400px] font-mono text-sm`}
          value={form.content}
          onChange={(e) =>
            setForm((f) => ({ ...f, content: e.target.value }))
          }
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-da-muted">Status</label>
          <select
            className={inputCls}
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                status: e.target.value as PostInput["status"],
              }))
            }
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-da-muted">
            Publish date (optional)
          </label>
          <input
            className={inputCls}
            type="datetime-local"
            value={form.published_at}
            onChange={(e) =>
              setForm((f) => ({ ...f, published_at: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-da-indigo px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving..." : initial?.id ? "Update post" : "Create post"}
        </button>
      </div>
    </form>
  );
}

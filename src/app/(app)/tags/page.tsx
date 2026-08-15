'use client'

import type { TagModel } from '@mx-space/api-client'
import { useQuery } from '@tanstack/react-query'
import { m } from 'motion/react'
import { useMemo, useState } from 'react'

import { EmptyIcon } from '~/components/icons/empty'
import { TagDetailModal } from '~/components/modules/post/fab/PostTagsFAB'
import { Loading } from '~/components/ui/loading'
import { useModalStack } from '~/components/ui/modal'
import { apiClient } from '~/lib/request'

const tagColors = [
  'text-rose-500 dark:text-rose-300',
  'text-pink-500 dark:text-pink-300',
  'text-fuchsia-500 dark:text-fuchsia-300',
  'text-violet-500 dark:text-violet-300',
  'text-slate-600 dark:text-slate-300',
]

const hashTag = (name: string) =>
  [...name].reduce((hash, char) => hash + (char.codePointAt(0) ?? 0), 0)

export default function TagsPage() {
  const [keyword, setKeyword] = useState('')
  const { present } = useModalStack()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tags', 'cloud'],
    queryFn: async () => (await apiClient.category.getAllTags()).data,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: 'always',
  })

  const tags = useMemo(
    () =>
      [...(data ?? [])]
        .filter((tag) =>
          tag.name.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()),
        )
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    [data, keyword],
  )

  const counts = (data ?? []).map((tag) => Math.log1p(tag.count))
  const minCount = counts.length > 0 ? Math.min(...counts) : 0
  const maxCount = counts.length > 0 ? Math.max(...counts) : 1
  const totalPosts = (data ?? []).reduce((sum, tag) => sum + tag.count, 0)

  const handleTagClick = (tag: TagModel) => {
    present({
      content: () => <TagDetailModal name={tag.name} />,
      title: `标签：${tag.name}`,
    })
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-12 sm:px-8">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium tracking-[0.2em] text-accent">
            TAG CLOUD
          </p>
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
            词云
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-500 dark:text-zinc-400">
            字号由文章使用次数决定。点击任意标签，可以查看它关联的全部文章。
          </p>
        </div>

        <label className="relative block w-full sm:w-64">
          <span className="sr-only">搜索标签</span>
          <i className="i-mingcute-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索标签"
            className="h-11 w-full rounded-full border border-zinc-900/10 bg-white/60 pl-10 pr-4 text-sm outline-none backdrop-blur transition focus:border-accent/40 focus:ring-4 focus:ring-accent/10 dark:border-white/10 dark:bg-zinc-900/50"
          />
        </label>
      </header>

      <section className="relative min-h-80 overflow-hidden rounded-[2rem] border border-rose-950/5 bg-white/45 px-6 py-10 shadow-xl shadow-rose-950/[0.035] backdrop-blur-sm dark:border-rose-100/10 dark:bg-zinc-950/35 dark:shadow-black/20 sm:px-10">
        <div className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-rose-300/10 blur-3xl dark:bg-rose-400/[0.06]" />
        <div className="pointer-events-none absolute -bottom-28 -right-16 size-72 rounded-full bg-fuchsia-300/10 blur-3xl dark:bg-fuchsia-400/[0.05]" />

        {isLoading ? (
          <div className="center flex min-h-60">
            <Loading />
          </div>
        ) : isError ? (
          <div className="center flex min-h-60 flex-col gap-4 text-zinc-500">
            <span>标签暂时没有加载出来。</span>
            <button
              type="button"
              className="rounded-full bg-accent/10 px-4 py-2 text-sm text-accent transition hover:bg-accent/15"
              onClick={() => refetch()}
            >
              重新加载
            </button>
          </div>
        ) : tags.length === 0 ? (
          <div className="center flex min-h-60 flex-col gap-3 text-zinc-400">
            <EmptyIcon />
            <span>{keyword ? '没有匹配的标签' : '还没有文章标签'}</span>
          </div>
        ) : (
          <m.div
            layout
            className="relative flex min-h-60 flex-wrap content-center items-center justify-center gap-x-5 gap-y-4 sm:gap-x-7 sm:gap-y-5"
          >
            {tags.map((tag, index) => {
              const value = Math.log1p(tag.count)
              const ratio =
                maxCount === minCount
                  ? 0.5
                  : (value - minCount) / (maxCount - minCount)
              const fontSize = 0.9 + ratio * 1.55
              const color = tagColors[hashTag(tag.name) % tagColors.length]

              return (
                <m.button
                  layout
                  type="button"
                  key={tag.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.018, 0.3) }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleTagClick(tag)}
                  className={`group relative rounded-full px-2 py-1 font-medium leading-none transition-colors hover:bg-rose-500/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:hover:bg-rose-300/[0.08] ${color}`}
                  style={{ fontSize: `${fontSize}rem` }}
                  title={`${tag.name} · ${tag.count} 篇文章`}
                  aria-label={`${tag.name}，${tag.count} 篇文章`}
                >
                  <span>{tag.name}</span>
                  <span className="ml-1 align-super text-[0.55em] font-normal opacity-0 transition-opacity group-hover:opacity-60 group-focus-visible:opacity-60">
                    {tag.count}
                  </span>
                </m.button>
              )
            })}
          </m.div>
        )}
      </section>

      {!!data?.length && (
        <p className="mt-5 text-center text-xs text-zinc-400 dark:text-zinc-500">
          {data.length} 个标签 · {totalPosts} 次标记 · 每分钟自动刷新
        </p>
      )}
    </main>
  )
}

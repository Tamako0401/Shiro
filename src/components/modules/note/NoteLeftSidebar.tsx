'use client'

import { m } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { OnlyDesktop } from '~/components/ui/viewport'

import { useNoteMainContainerHeight } from './NoteMainContainer'
import { NoteTimeline } from './NoteTimeline'
import { NoteTopicInfo } from './NoteTopicInfo'

export const NoteLeftSidebar: Component = ({ className }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollHint, setScrollHint] = useState({
    above: 0,
    below: 0,
    scrollable: false,
  })

  const updateScrollHint = useCallback(() => {
    const scroller = scrollRef.current
    if (!scroller) return

    const viewport = scroller.getBoundingClientRect()
    const items = Array.from(
      scroller.querySelectorAll<HTMLElement>('[data-note-timeline-item]'),
    )
    const next = {
      above: items.filter(
        (item) => item.getBoundingClientRect().top < viewport.top - 1,
      ).length,
      below: items.filter(
        (item) => item.getBoundingClientRect().bottom > viewport.bottom + 1,
      ).length,
      scrollable: scroller.scrollHeight > scroller.clientHeight + 1,
    }

    setScrollHint((current) =>
      current.above === next.above &&
      current.below === next.below &&
      current.scrollable === next.scrollable
        ? current
        : next,
    )
  }, [])

  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) return

    const frame = requestAnimationFrame(updateScrollHint)
    const settledLayoutTimer = window.setTimeout(updateScrollHint, 500)
    const resizeObserver = new ResizeObserver(updateScrollHint)
    const mutationObserver = new MutationObserver(updateScrollHint)
    resizeObserver.observe(scroller)
    resizeObserver.observe(document.documentElement)
    mutationObserver.observe(scroller, {
      childList: true,
      characterData: true,
      subtree: true,
    })
    window.addEventListener('resize', updateScrollHint)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(settledLayoutTimer)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      window.removeEventListener('resize', updateScrollHint)
    }
  }, [updateScrollHint])

  const hintText = scrollHint.below
    ? scrollHint.above
      ? `上方 ${scrollHint.above} 篇 · 下方 ${scrollHint.below} 篇`
      : `下方还有 ${scrollHint.below} 篇，滚动查看更多`
    : `已到底 · 上方 ${scrollHint.above} 篇`

  return (
    <OnlyDesktop>
      <AutoHeightOptimize className={className}>
        <m.div layoutRoot layout className="sticky top-[120px] min-h-0">
          <div
            ref={scrollRef}
            className="relative max-h-[calc(100dvh-160px)] min-h-0 overflow-y-auto overscroll-contain pb-8 pr-2 [scrollbar-gutter:stable]"
            onScroll={updateScrollHint}
          >
            <NoteTimeline />

            <NoteTopicInfo />
          </div>

          {scrollHint.scrollable && (
            <div className="pointer-events-none absolute inset-x-2 bottom-1 flex justify-center">
              <span className="rounded-full border border-neutral/10 bg-base-100/90 px-2.5 py-1 text-[11px] text-neutral-content/60 shadow-sm backdrop-blur">
                {hintText}
              </span>
            </div>
          )}
        </m.div>
      </AutoHeightOptimize>
    </OnlyDesktop>
  )
}

const AutoHeightOptimize: Component = ({ children, className }) => {
  const mainContainerHeight = useNoteMainContainerHeight()
  return (
    <div
      className={className}
      style={{
        height: mainContainerHeight ? `${mainContainerHeight}px` : 'auto',
      }}
    >
      {children}
    </div>
  )
}

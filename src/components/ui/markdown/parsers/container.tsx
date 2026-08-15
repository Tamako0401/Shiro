'use client'

import type { MarkdownToJSX } from 'markdown-to-jsx'
import { Priority } from 'markdown-to-jsx'

import { clsxm } from '~/lib/helper'
import { WrappedElementProvider } from '~/providers/shared/WrappedElementProvider'

import { Banner } from '../../banner/Banner'
import { Gallery } from '../../gallery/Gallery'
import { Markdown } from '../Markdown'
import { GridMarkdownImage, GridMarkdownImages } from '../renderers/image'
import { pickImagesFromMarkdown } from '../utils/image'

const supportedContainerNames = new Set([
  'gallery',
  'banner',
  'carousel',

  'warn',
  'caution',
  'error',
  'danger',
  'info',
  'important',
  'success',
  'tip',
  'warning',
  'note',

  'grid',
])

const containerBlockRegex =
  /^(?:[\t ]*\r?\n)*[\t ]*:::[\t ]*(?<header>[^\r\n]*?)[\t ]*\r?\n(?<content>[\s\S]*?)\r?\n[\t ]*:::[\t ]*(?=\r?\n|$)(?:\r?\n[\t ]*)*/

const containerHeaderRegex =
  /^(?<type>[a-z][\w-]*)(?:[\t ]*\[(?<title>[^\]\r\n]*)\])?(?:[\t ]*\{(?<params>[^}\r\n]*)\})?$/i

const calloutConfig = {
  note: { bannerType: 'info', defaultTitle: 'Note' },
  info: { bannerType: 'info', defaultTitle: 'Info' },
  important: { bannerType: 'info', defaultTitle: 'Important' },
  tip: { bannerType: 'success', defaultTitle: 'Tip' },
  success: { bannerType: 'success', defaultTitle: 'Success' },
  warning: { bannerType: 'warning', defaultTitle: 'Warning' },
  warn: { bannerType: 'warning', defaultTitle: 'Warning' },
  caution: { bannerType: 'warning', defaultTitle: 'Caution' },
  danger: { bannerType: 'error', defaultTitle: 'Danger' },
  error: { bannerType: 'error', defaultTitle: 'Error' },
} as const

function parseContainerHeader(header: string) {
  const result = containerHeaderRegex.exec(header.trim())
  if (!result?.groups) return null

  const type = result.groups.type.toLowerCase()
  if (!supportedContainerNames.has(type)) return null

  return {
    type,
    title: result.groups.title?.trim() || undefined,
    params: result.groups.params?.trim() || undefined,
  }
}

export const ContainerRule: MarkdownToJSX.Rule = {
  match: (source: string) => {
    const result = containerBlockRegex.exec(source)

    if (!result?.groups) return null

    const header = parseContainerHeader(result.groups.header)
    if (!header) return null

    Object.assign(result.groups, header)
    return result
  },
  order: Priority.MED,
  parse(capture) {
    const { groups } = capture
    return {
      node: { ...groups },
    }
  },

  react(node, _, state) {
    const { type, title, params, content } = node.node

    switch (type) {
      case 'carousel':
      case 'gallery': {
        return (
          <Gallery key={state?.key} images={pickImagesFromMarkdown(content)} />
        )
      }
      case 'warn':
      case 'caution':
      case 'error':
      case 'danger':
      case 'info':
      case 'important':
      case 'note':
      case 'success':
      case 'tip':
      case 'warning': {
        const config = calloutConfig[type as keyof typeof calloutConfig]
        return (
          <Banner type={config.bannerType} className="my-4" key={state?.key}>
            <WrappedElementProvider className="w-full">
              <div
                className="mb-2 font-semibold leading-6"
                data-callout-title
                data-callout-type={type}
              >
                {title || config.defaultTitle}
              </div>
              <Markdown
                value={content}
                allowsScript
                className="w-full [&>p:first-child]:mt-0 [&>p:last-child]:mb-0"
              />
            </WrappedElementProvider>
          </Banner>
        )
      }
      case 'banner': {
        if (!params) {
          break
        }

        return (
          <Banner type={params} className="my-4" key={state?.key}>
            <WrappedElementProvider className="w-full">
              {title && (
                <div className="mb-2 font-semibold leading-6">{title}</div>
              )}
              <Markdown
                value={content}
                allowsScript
                className="w-full [&>p:first-child]:mt-0 [&>p:last-child]:mb-0"
              />
            </WrappedElementProvider>
          </Banner>
        )
      }

      case 'grid': {
        // cols=2,gap=4,rows=2,type=images

        const { cols, gap = 8, rows, type = 'normal' } = parseParams(params)

        const Grid: Component = ({ children, className }) => {
          return (
            <div
              className={clsxm('relative grid w-full', className)}
              style={{
                gridTemplateColumns: cols
                  ? `repeat(${cols}, minmax(0, 1fr))`
                  : undefined,
                gap: `${gap}px`,
                gridTemplateRows: rows
                  ? `repeat(${rows}, minmax(0, 1fr))`
                  : undefined,
              }}
            >
              {children}
            </div>
          )
        }
        switch (type) {
          case 'normal': {
            return (
              <Grid key={state?.key}>
                <Markdown
                  overrides={{
                    img: GridMarkdownImage,
                  }}
                  value={content}
                  allowsScript
                  removeWrapper
                  className="w-full [&>p:first-child]:mt-0"
                />
              </Grid>
            )
          }
          case 'images': {
            const imagesSrc = pickImagesFromMarkdown(content).map((r) => r.url)

            return (
              <GridMarkdownImages
                height={rows && cols ? +rows / +cols : 1}
                key={state.key}
                imagesSrc={imagesSrc}
                Wrapper={Grid}
              />
            )
          }
          default: {
            return null
          }
        }
      }
    }

    return (
      <div key={state?.key}>
        <p>{content}</p>
      </div>
    )
  },
}

/**
 * gallery container
 *
 * ::: gallery
 * ![name](url)
 * ![name](url)
 * ![name](url)
 * :::
 */

type ParsedResult = Record<string, string>

function parseParams(input: string): ParsedResult {
  const regex = /(\w+)=(\w+)/g
  let match: RegExpExecArray | null
  const result: ParsedResult = {}

  while ((match = regex.exec(input)) !== null) {
    const key = match[1]
    const value = match[2]
    result[key] = value
  }

  return result
}

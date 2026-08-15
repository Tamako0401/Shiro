'use client'

import clsx from 'clsx'
import { m } from 'motion/react'
import type { FC, JSX } from 'react'
import type { TypeOptions } from 'react-toastify'

import { MotionButtonBase } from '../../ui/button'

const typeMap: Record<TypeOptions, JSX.Element> = {
  success: <span className="size-2.5 rounded-full bg-emerald-400" />,
  error: <span className="size-2.5 rounded-full bg-rose-400" />,
  info: <span className="size-2.5 rounded-full bg-sky-400" />,
  warning: <span className="size-2.5 rounded-full bg-amber-400" />,
  default: <span className="size-2.5 rounded-full bg-lime-400/80" />,
}

export const ToastCard: FC<{
  message: string
  toastProps?: {
    type: TypeOptions
  }
  iconElement?: JSX.Element
  closeToast?: () => void
  onClick?: () => void
}> = (props) => {
  const { iconElement, message, closeToast, onClick } = props

  const MotionTag = onClick ? m.button : m.div

  return (
    <MotionTag
      layout="position"
      className={clsx(
        'group relative flex min-h-14 w-full items-center gap-4',
        'overflow-hidden px-5 py-4 pr-11',
        'select-none text-inherit',
        '[&>i]:shrink-0 [&>span:first-child]:shrink-0 [&>svg]:shrink-0',
      )}
      onClick={onClick}
    >
      {iconElement ?? typeMap[props.toastProps?.type ?? 'default']}
      <span className="text-left">{message}</span>

      <MotionButtonBase
        aria-label="Close toast"
        className="absolute inset-y-0 right-3 flex items-center text-sm text-current opacity-0 duration-200 group-hover:opacity-50 hover:opacity-90 focus-visible:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          closeToast?.()
        }}
      >
        <i className="i-mingcute-close-fill p-2" />
      </MotionButtonBase>
    </MotionTag>
  )
}

import type { JSX } from 'react'
import { createElement } from 'react'
import type { Id, ToastOptions, TypeOptions } from 'react-toastify'
import { Slide, toast as Toast } from 'react-toastify'

import { ToastCard } from '~/components/modules/shared/ToastCard'

const baseConfig = {
  position: 'bottom-right',
  autoClose: 3000,
  pauseOnHover: true,
  hideProgressBar: true,
  transition: Slide,

  closeOnClick: true,
  closeButton: false,
} satisfies ToastOptions

interface CustomToastOptions {
  iconElement?: JSX.Element
  onClick?: () => void
}
interface ToastCustom {
  (
    message: string,
    type?: TypeOptions,
    options?: ToastOptions & {
      iconElement?: JSX.Element
    },
  ): Id
  success(message: string, options?: ToastOptions & CustomToastOptions): Id
  info(message: string, options?: ToastOptions & CustomToastOptions): Id
  warn(message: string, options?: ToastOptions & CustomToastOptions): Id
  error(message: string, options?: ToastOptions & CustomToastOptions): Id

  dismiss(id: Id): void
}

// @ts-ignore
export const toast: ToastCustom = (
  message: string,
  type?: TypeOptions,
  options?: ToastOptions & CustomToastOptions,
) => {
  const { iconElement, onClick, ...rest } = options || {}
  return Toast(createElement(ToastCard, { message, iconElement, onClick }), {
    type,
    ...baseConfig,
    ...rest,
  })
}
;(
  [
    ['success', 'success'],
    ['info', 'info'],
    ['warn', 'warning'],
    ['error', 'error'],
  ] as const
).forEach(([method, type]) => {
  // @ts-ignore
  toast[method] = (
    message: string,
    options?: ToastOptions & CustomToastOptions,
  ) => toast(message, type as TypeOptions, options)
})

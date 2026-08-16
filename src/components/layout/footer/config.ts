export const defaultLinkSections: LinkSection[] = [
  {
    name: '关于',
    links: [
      {
        name: '关于本站',
        href: '/about-site',
      },
      {
        name: '关于我',
        href: '/about-me',
      },
      {
        name: '关于此项目',
        href: 'https://github.com/innei/Shiro',
        external: true,
      },
    ],
  },
  {
    name: '更多',
    links: [
      {
        name: '时间线',
        href: '/timeline',
      },
      {
        name: '友链',
        href: '/friends',
      },
      {
        name: '监控',
        href: '//TODO: add your own link',
        external: true,
      },
    ],
  },
  {
    name: '联系',
    links: [
      {
        name: '写留言',
        href: '/message',
      },
      {
        name: '发邮件',
        href: 'mailto:b25091308@njupt.edu.cn',
        external: true,
      },
      {
        name: 'GitHub',
        href: 'https://github.com/Tamako0401',
        external: true,
      },
    ],
  },
]

export interface FooterConfig {
  linkSections: LinkSection[]
  otherInfo: OtherInfo
}

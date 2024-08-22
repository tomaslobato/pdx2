import React from 'react'
import LinkIcon from '../Icons/Link'

interface CustomLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string
    children: React.ReactNode
}

const CustomLink: React.FC<CustomLinkProps> = ({
    href,
    children,
    ...props
}) => {
    if (!href) return <>{children}</>

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline font-bold flex items-center gap-1"
            {...props}
        >
            {children} <LinkIcon size={16} className="" />
        </a>
    )
}

export default CustomLink
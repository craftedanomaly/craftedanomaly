'use client';

import { useRouter } from 'next/navigation';
import { ComponentProps } from 'react';

interface ViewTransitionLinkProps extends Omit<ComponentProps<'a'>, 'href'> {
  href: string;
  children: React.ReactNode;
}

/**
 * Link component with View Transitions API support
 * Falls back to regular navigation if not supported
 */
export function ViewTransitionLink({ href, children, onClick, ...props }: ViewTransitionLinkProps) {
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      // Fallback to regular navigation
      return;
    }

    // Prevent default navigation
    e.preventDefault();

    // Start view transition
    const transition = document.startViewTransition(() => {
      router.push(href);
    });

    // Wait for transition to complete
    try {
      await transition.finished;
    } catch (error) {
      // Transition was skipped or aborted
      console.debug('View transition aborted:', error);
    }
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { RouteLoader } from './RouteLoader';

const INITIAL_DELAY = 900;
const ROUTE_TRANSITION_DURATION = 450;

export function RouteLoaderWrapper() {
  const pathname = usePathname();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const prevPathRef = useRef(pathname);
  const initialTimerRef = useRef<NodeJS.Timeout | null>(null);
  const routeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const shouldRender = pathname ? !pathname.startsWith('/admin') : true;

  useEffect(() => {
    if (!shouldRender) {
      setIsInitialLoading(false);
      setIsRouteChanging(false);
      return;
    }

    if (initialTimerRef.current) {
      clearTimeout(initialTimerRef.current);
    }

    initialTimerRef.current = setTimeout(() => {
      setIsInitialLoading(false);
    }, INITIAL_DELAY);

    return () => {
      if (initialTimerRef.current) {
        clearTimeout(initialTimerRef.current);
      }
    };
  }, [shouldRender]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    if (prevPathRef.current !== pathname) {
      setIsRouteChanging(true);
      prevPathRef.current = pathname;

      if (routeTimerRef.current) {
        clearTimeout(routeTimerRef.current);
      }

      routeTimerRef.current = setTimeout(() => {
        setIsRouteChanging(false);
      }, ROUTE_TRANSITION_DURATION);
    }

    return () => {
      if (routeTimerRef.current) {
        clearTimeout(routeTimerRef.current);
      }
    };
  }, [pathname, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  const isActive = isInitialLoading || isRouteChanging;

  return isActive ? <RouteLoader isActive={isActive} /> : null;
}

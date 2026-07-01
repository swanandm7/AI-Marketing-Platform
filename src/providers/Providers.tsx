/**
 * Root providers wrapper.
 * No external provider libraries — just wraps children.
 * Add context providers here as the app grows.
 */
interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <>{children}</>;
}

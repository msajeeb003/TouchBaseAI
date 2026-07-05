import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { decodeAuthToken, isTokenValid } from "@/utils/auth";

/**
 * Guards the sign-in / sign-up pages. If the visitor already has a valid,
 * unexpired session, send them straight to the app instead of asking them to
 * log in again.
 */
export default function GuestRoute() {
  const location = useLocation();
  const token = useAppSelector((state) => state.auth.token);
  const decoded = decodeAuthToken(token);
  const isAuthenticated = isTokenValid(token) && Boolean(decoded?.email);

  if (isAuthenticated) {
    // Respect a "from" location if the user was redirected here by RequireAuth.
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    return <Navigate to={from ?? "/dashboard"} replace />;
  }

  return <Outlet />;
}

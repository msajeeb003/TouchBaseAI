import { Navigate, Outlet, useLocation } from "react-router-dom";
import { logout } from "@/store/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { decodeAuthToken, isTokenValid } from "@/utils/auth";

export default function RequireAuth() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const decodedToken = decodeAuthToken(token);
  const hasEmailInToken = Boolean(decodedToken?.email);

  const hasValidToken = isTokenValid(token) && hasEmailInToken;

  if (!hasValidToken) {
    if (token) {
      dispatch(logout());
    }

    return <Navigate to="/auth/signin" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { ACCOUNT_TYPE } from "../../../utils/constants";

function AdminRoute({ children }) {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (user?.accountType !== ACCOUNT_TYPE.ADMIN) {
    return <Navigate to="/dashboard/my-profile" />;
  }

  return children;
}

export default AdminRoute;

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";

const PaymentFailure = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.error("Payment Failed!");
    navigate("/cart"); // redirect back to cart
  }, []);

  return <div className="p-6 text-center">Payment Failed!</div>;
};

export default PaymentFailure;

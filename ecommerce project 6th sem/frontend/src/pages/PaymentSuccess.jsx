import { useContext, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const PaymentSuccess = () => {
  const { cart, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all items
    cart.forEach(item => removeFromCart(item._id));

    toast.success("Payment Successful!");
    navigate("/");
  }, []);

  return <div className="p-6 text-center">Payment Successful!</div>;
};

export default PaymentSuccess;

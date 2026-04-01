import ForgotPasswordArea from "@components/forget-password-area";


export const metadata = {
  title: "Forgot Password - Serravit",
};

const ForgotPassword = async ({ params }) => {
  const {token} = await params;
  return (
    <ForgotPasswordArea token={token} />
  );
};


export default ForgotPassword;

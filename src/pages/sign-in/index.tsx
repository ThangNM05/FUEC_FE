import { SignIn } from "@clerk/clerk-react";

function SignInPage() {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <SignIn fallbackRedirectUrl={"/student-management"} />
    </div>
  );
}

export default SignInPage;

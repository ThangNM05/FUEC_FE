import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

function SSOCallback() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Signing in...</h2>
        <p className="text-gray-600 mt-2">Please wait while we complete your sign-in</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}

export default SSOCallback;

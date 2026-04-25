import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-950">
      <SignIn appearance={{
        elements: {
          card: "bg-gray-900 border border-gray-800",
          headerTitle: "text-white",
          headerSubtitle: "text-gray-400",
          socialButtonsBlockButton: "text-white border-gray-700 hover:bg-gray-800",
          socialButtonsBlockButtonText: "text-white",
          dividerLine: "bg-gray-800",
          dividerText: "text-gray-500",
          formFieldLabel: "text-gray-300",
          formFieldInput: "bg-gray-800 border-gray-700 text-white",
          footerActionText: "text-gray-400",
          footerActionLink: "text-emerald-400 hover:text-emerald-300"
        }
      }} />
    </div>
  );
}

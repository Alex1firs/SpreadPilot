import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="flex justify-center py-6">
      <UserProfile 
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "bg-gray-900 border border-gray-800 shadow-none",
            navbar: "bg-gray-950 border-r border-gray-800",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            profileSectionTitleText: "text-white",
            userPreviewMainIdentifier: "text-white",
            userPreviewSecondaryIdentifier: "text-gray-400",
            button: "text-emerald-500 hover:bg-emerald-500/10",
            formFieldLabel: "text-gray-400",
            formFieldInput: "bg-gray-950 border-gray-800 text-white",
            footer: "hidden"
          }
        }}
      />
    </div>
  );
}

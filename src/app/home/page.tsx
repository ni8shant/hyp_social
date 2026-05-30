import TopBar from "@/components/TopBar";
import StoriesRow from "@/components/StoriesRow";
import PostFeed from "@/components/PostFeed";
import BottomNav from "@/components/BottomNav";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-2xl mx-auto relative">
      {/* Top navigation */}
      <TopBar />

      {/* Main content scrollable area */}
      <main className="pb-20">
        {/* Stories */}
        <StoriesRow />

        {/* Tab indicator */}
        <div className="bg-white border-b border-[#E5E7EB] flex">
          <button className="flex-1 py-2.5 text-sm font-semibold text-[#2563EB] border-b-2 border-[#2563EB]">
            Story
          </button>
          <button className="flex-1 py-2.5 text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">
            Post
          </button>
        </div>

        {/* Post Feed */}
        <PostFeed />
      </main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}

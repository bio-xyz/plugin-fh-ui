import type { NextPage } from "next";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import ChatInput from "@/components/ChatInput";

const Home: NextPage = () => {
  return (
    <div className="container">
      <Sidebar />
      <TopHeader />
      <ChatInput />
    </div>
  );
};

export default Home;

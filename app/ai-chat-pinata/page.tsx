import { AIChat } from "@/components/AIChat";
import { systemPromptJane } from "@/lib/constants";

export default function Home() {
  return (
    <>
      <AIChat systemPrompt={systemPromptJane} />
    </>
  );
}

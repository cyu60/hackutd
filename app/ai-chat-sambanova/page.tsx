import { AIChat } from "@/components/AIChat";
import { systemPromptSambaNova } from "@/lib/constants";

export default function Home() {
  return (
    <>
      <AIChat systemPrompt={systemPromptSambaNova} />
    </>
  );
}

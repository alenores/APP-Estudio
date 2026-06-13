import { PlatformLinkIcon } from "@/components/ui/platform-link-icon";

type CardChatLinkIconProps = {
  linkChat?: string | null;
  className?: string;
};

/** Ícono tocable de chat IA en cards (explorador, lienzo, móvil). */
export function CardChatLinkIcon({ linkChat, className = "" }: CardChatLinkIconProps) {
  if (!linkChat?.trim()) return null;
  return (
    <PlatformLinkIcon
      link={linkChat}
      purpose="chat"
      size="sm"
      className={`!h-7 !w-7 shrink-0 rounded-[9px] ${className}`}
    />
  );
}

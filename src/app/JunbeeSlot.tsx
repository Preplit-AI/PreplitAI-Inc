import { useMutation, useQueryClient } from "@tanstack/react-query";
import { JunbeeMessage } from "@/brand/JunbeeMessage";
import { request } from "@/lib/api";
import { keys } from "./queries";
import type { JunbeeMessageData } from "@/lib/types";

/**
 * Where Junbee speaks: one message, dismissible, never back once dismissed.
 * `onlyFor` limits it to a single lecture's page.
 */
export function JunbeeSlot({ message, onlyFor, className }: { message: JunbeeMessageData | null | undefined; onlyFor?: string; className?: string }) {
  const client = useQueryClient();
  const dismiss = useMutation({
    mutationFn: (lectureId: string) => request(`/junbee/${lectureId}/dismiss`, { method: "POST" }),
    onMutate: async () => {
      await client.cancelQueries({ queryKey: keys.junbee });
      client.setQueryData(keys.junbee, null);
    },
    onSettled: () => client.invalidateQueries({ queryKey: keys.junbee }),
  });

  if (!message || (onlyFor && message.lectureId !== onlyFor)) return null;
  return <JunbeeMessage message={message} onDismiss={() => dismiss.mutate(message.lectureId)} className={className} />;
}

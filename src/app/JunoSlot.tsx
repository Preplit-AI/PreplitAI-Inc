import { useMutation, useQueryClient } from "@tanstack/react-query";
import { JunoMessage } from "@/brand/JunoMessage";
import { request } from "@/lib/api";
import { keys } from "./queries";
import type { LectureMessage } from "@/lib/types";

/**
 * Where Juno speaks about a lecture: one message, dismissible, never back once
 * dismissed. `onlyFor` limits it to a single lecture's page.
 */
export function JunoSlot({ message, onlyFor, className }: { message: LectureMessage | null | undefined; onlyFor?: string; className?: string }) {
  const client = useQueryClient();
  const dismiss = useMutation({
    mutationFn: (lectureId: string) => request(`/junbee/${lectureId}/dismiss`, { method: "POST" }),
    onMutate: async () => {
      await client.cancelQueries({ queryKey: keys.juno });
      client.setQueryData(keys.juno, null);
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: keys.juno });
      client.invalidateQueries({ queryKey: ["semester"] });
    },
  });

  if (!message || (onlyFor && message.lectureId !== onlyFor)) return null;
  return <JunoMessage message={message} onDismiss={() => dismiss.mutate(message.lectureId)} className={className} />;
}

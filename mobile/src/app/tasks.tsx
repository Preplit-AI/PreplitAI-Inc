import { useState } from "react";
import { View } from "react-native";
import { useLang } from "@/lib/i18n";
import { useTasks } from "@/lib/queries";
import { space } from "@/lib/theme";
import type { Task } from "@/lib/types";
import { Button, Card, Failed, IconButton, Loading, Screen, Segment } from "@/ui";
import { TaskRow, TaskSheet } from "@/ui/forms";
import { Empty } from "@/ui/Juno";

/** Every task, to do or done, across all courses. */
export default function Tasks() {
  const { t } = useLang();
  const [state, setState] = useState<"open" | "done">("open");
  const tasks = useTasks(state);
  const [sheet, setSheet] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null });

  return (
    <Screen back title={t.task.all} right={<IconButton icon="plus" label={t.task.new} onPress={() => setSheet({ open: true, task: null })} />}>
      <View style={{ marginVertical: space.lg, maxWidth: 280 }}>
        <Segment options={[{ value: "open", label: t.task.open }, { value: "done", label: t.task.done }]} value={state} onChange={setState} />
      </View>
      {tasks.isPending ? <Loading /> : tasks.isError ? <Failed text={t.errors.Network} retryLabel={t.common.retry} onRetry={() => tasks.refetch()} /> : tasks.data.length ? (
        <Card style={{ paddingVertical: 0 }}>
          {tasks.data.map((task, i) => <TaskRow key={task.id} task={task} onOpen={(open) => setSheet({ open: true, task: open })} last={i === tasks.data.length - 1} />)}
        </Card>
      ) : (
        <Empty title={t.task.empty} line={t.task.emptyLine} mood="rest" action={state === "open" ? <Button small icon="plus" label={t.task.new} onPress={() => setSheet({ open: true, task: null })} /> : undefined} />
      )}
      <TaskSheet visible={sheet.open} task={sheet.task} onClose={() => setSheet({ open: false, task: null })} />
    </Screen>
  );
}

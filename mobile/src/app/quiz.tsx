import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useLang } from "@/lib/i18n";
import { buildQuiz, type Question } from "@/lib/quiz";
import { useLecture, useRateCard, useReview } from "@/lib/queries";
import { color, font, radius, space } from "@/lib/theme";
import type { ReviewCard } from "@/lib/types";
import { Button, Card, Failed, Icon, Loading, ProgressBar, Screen, T } from "@/ui";
import { Empty, OwlFigure } from "@/ui/Owl";

/*
 * The quick quiz: a few questions from the student's own lectures, one at a
 * time. Each shows which lecture it came from. Where there are enough cards to
 * offer real wrong answers it is multiple choice; otherwise the student reveals
 * the answer and says whether they knew it.
 *
 * Every answer is recorded with the review schedule on the server (FSRS, in
 * server/services/scheduler.js): a miss brings the question back sooner.
 */

export default function Quiz() {
  const params = useLocalSearchParams<{ courseId?: string; lectureId?: string }>();
  const { t } = useLang();
  const review = useReview();
  const lecture = useLecture(params.lectureId ?? "");
  const rate = useRateCard();

  const loading = params.lectureId ? lecture.isPending : review.isPending;
  const failed = params.lectureId ? lecture.isError : review.isError;

  // The questions are fixed when the quiz opens, so answering one does not reshuffle the rest.
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const pool: ReviewCard[] | null = useMemo(() => {
    if (params.lectureId) {
      const l = lecture.data;
      return l ? l.cards.map((card) => ({ ...card, lectureId: l.id, lectureTitle: l.topic || l.title, courseId: l.courseId, courseName: l.courseName })) : null;
    }
    const cards = review.data?.cards;
    return cards ? (params.courseId ? cards.filter((c) => c.courseId === params.courseId) : cards) : null;
  }, [params.lectureId, params.courseId, lecture.data, review.data]);
  if (!questions && pool) setQuestions(buildQuiz(pool));

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  if (loading || (!questions && !failed)) return <Screen back title={t.quiz.title}><Loading /></Screen>;
  if (failed || !questions) return <Screen back title={t.quiz.title}><Failed text={t.errors.Network} retryLabel={t.common.retry} onRetry={() => (params.lectureId ? lecture.refetch() : review.refetch())} /></Screen>;
  if (!questions.length) return <Screen back title={t.quiz.title}><Empty title={t.quiz.empty} line={t.quiz.emptyLine} mood="resting" /></Screen>;

  const leave = () => (router.canGoBack() ? router.back() : router.replace("/"));

  // ── The end: the score, and what to look at again ──────────────────────────
  if (index >= questions.length) {
    const right = results.filter(Boolean).length;
    const missed = questions.filter((_, i) => !results[i]);
    return (
      <Screen footer={<Button label={t.common.done} onPress={leave} />}>
        <View style={{ alignItems: "center", gap: space.sm, marginTop: space.xl }}>
          <OwlFigure size={150} mood={right === questions.length ? "attentive" : "noticing"} />
          <T variant="display" style={{ textAlign: "center" }}>{t.quiz.doneTitle}</T>
          <T variant="heading" tone={color.inkMuted}>{t.quiz.score(right, questions.length)}</T>
          <T variant="small">{t.quiz.estimate}</T>
        </View>
        {missed.length ? (
          <View style={{ marginTop: space.xxl, gap: space.md }}>
            <View>
              <T variant="label">{t.quiz.missed}</T>
              <T variant="small" style={{ marginTop: 4 }}>{t.quiz.missedLine}</T>
            </View>
            {missed.map((q) => (
              <Card key={q.card.id} style={{ gap: 6 }}>
                <T variant="strong">{q.card.front}</T>
                <T tone={color.inkSoft}>{q.card.back}</T>
                <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.push({ pathname: "/lecture/[id]", params: { id: q.card.lectureId } })} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <Icon name="file-text" size={14} color={color.inkMuted} />
                  <T variant="small" style={{ textDecorationLine: "underline" }}>{t.quiz.reviewSource}: {q.card.lectureTitle}</T>
                </Pressable>
              </Card>
            ))}
          </View>
        ) : null}
      </Screen>
    );
  }

  const question = questions[index];
  const answered = picked !== null || (question.options === null && results.length > index);
  const wasRight = results[index];

  /** Records the answer, here and in the review schedule. */
  const answer = (correct: boolean) => {
    setResults((now) => [...now, correct]);
    rate.mutate({ id: question.card.id, rating: correct ? 3 : 1 });
  };

  const next = () => {
    setPicked(null);
    setRevealed(false);
    setIndex(index + 1);
  };

  return (
    <Screen
      back={leave}
      title={t.quiz.question(index + 1, questions.length)}
      footer={answered ? <Button label={index + 1 === questions.length ? t.quiz.finish : t.quiz.next} icon="arrow-right" onPress={next} /> : undefined}
    >
      <ProgressBar value={(index + (answered ? 1 : 0)) / questions.length} />

      <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.push({ pathname: "/lecture/[id]", params: { id: question.card.lectureId } })} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: space.xl }}>
        <Icon name="file-text" size={14} color={color.inkMuted} />
        <T variant="small" numberOfLines={1} style={{ flex: 1 }}>{t.quiz.from}: {question.card.courseName} · {question.card.lectureTitle}</T>
      </Pressable>
      <T variant="title" style={{ marginTop: space.md, marginBottom: space.xl, fontSize: 23, lineHeight: 31 }}>{question.card.front}</T>

      {question.options ? (
        <View style={{ gap: space.sm }} accessibilityRole="radiogroup">
          {question.options.map((option, i) => {
            const isAnswer = i === question.answer;
            const chosen = picked === i;
            const show = picked !== null;
            return (
              <Pressable
                key={i}
                accessibilityRole="radio"
                accessibilityState={{ selected: chosen, disabled: show }}
                aria-checked={chosen}
                disabled={show}
                onPress={() => { setPicked(i); answer(isAnswer); }}
                style={({ pressed }) => [
                  { flexDirection: "row", alignItems: "center", gap: space.md, minHeight: 60, padding: space.lg, borderRadius: radius.lg, borderWidth: 1.5, borderColor: color.rule, backgroundColor: color.surface },
                  show && isAnswer && { borderColor: color.settled, backgroundColor: color.settledSoft },
                  show && chosen && !isAnswer && { borderColor: color.danger, backgroundColor: color.dangerSoft },
                  pressed && { backgroundColor: color.sunken },
                ]}
              >
                <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: show && isAnswer ? color.settled : show && chosen ? color.danger : color.sunken }}>
                  {show && (isAnswer || chosen) ? <Icon name={isAnswer ? "check" : "x"} size={15} color={color.onInk} /> : <T variant="small" tone={color.ink} style={{ fontFamily: font.bold }}>{"ABCD"[i]}</T>}
                </View>
                <T style={{ flex: 1 }}>{option}</T>
              </Pressable>
            );
          })}
        </View>
      ) : revealed ? (
        <View style={{ gap: space.lg }}>
          <Card tone={color.lampSoft}>
            <T variant="label" tone={color.lampInk}>{t.quiz.answer}</T>
            <T style={{ marginTop: 6, fontSize: 16.5, lineHeight: 25 }}>{question.card.back}</T>
          </Card>
          {!answered ? (
            <View style={{ flexDirection: "row", gap: space.sm }}>
              <Button variant="secondary" icon="rotate-ccw" label={t.quiz.notYet} onPress={() => answer(false)} style={{ flex: 1 }} />
              <Button icon="check" label={t.quiz.knew} onPress={() => answer(true)} style={{ flex: 1 }} />
            </View>
          ) : null}
        </View>
      ) : (
        <Button variant="secondary" icon="eye" label={t.quiz.reveal} onPress={() => setRevealed(true)} />
      )}

      {answered && question.options ? (
        <View style={{ marginTop: space.lg, flexDirection: "row", alignItems: "center", gap: space.sm }} accessibilityLiveRegion="polite">
          <Icon name={wasRight ? "check-circle" : "info"} size={18} color={wasRight ? color.settled : color.danger} />
          <T variant="strong" tone={wasRight ? color.settled : color.danger}>{wasRight ? t.quiz.correct : t.quiz.wrong}</T>
        </View>
      ) : null}
    </Screen>
  );
}

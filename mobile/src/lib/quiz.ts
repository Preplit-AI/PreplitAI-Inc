import type { ReviewCard } from "./types";

/*
 * Turns review cards into a short quiz.
 *
 * A card is a question and its answer, written by Juno from one lecture. With
 * at least three other, different answers to offer as wrong choices, a card
 * becomes a multiple-choice question; wrong choices come from the same course
 * first, since those are the plausible ones. With fewer, it stays a card the
 * student turns over. No answer is ever made up: every choice is the real
 * answer to some question from the student's own lectures.
 */

export type Question = {
  card: ReviewCard;
  /** Four choices, or null when there are not enough other answers to choose between. */
  options: string[] | null;
  /** Which of the options is right. */
  answer: number;
};

export const QUIZ_LENGTH = 8;

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function buildQuiz(cards: ReviewCard[], random: () => number = Math.random, length = QUIZ_LENGTH): Question[] {
  return cards.slice(0, length).map((card) => {
    const others = cards.filter((other) => other.id !== card.id && !same(other.back, card.back));
    const distinct = others.filter((other, i) => others.findIndex((o) => same(o.back, other.back)) === i);
    if (distinct.length < 3) return { card, options: null, answer: 0 };
    const near = shuffle(distinct.filter((o) => o.courseId === card.courseId), random);
    const far = shuffle(distinct.filter((o) => o.courseId !== card.courseId), random);
    const wrong = [...near, ...far].slice(0, 3).map((o) => o.back);
    const options = shuffle([card.back, ...wrong], random);
    return { card, options, answer: options.indexOf(card.back) };
  });
}

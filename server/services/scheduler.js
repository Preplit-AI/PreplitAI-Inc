'use strict';
const { fsrs, generatorParameters, createEmptyCard, Rating } = require('ts-fsrs');

/**
 * FSRS scheduling for review cards.
 *
 * Short-term (same-day) steps are off: every rating, including "다시", moves the
 * card to another day. One pass through the day's queue is the whole session,
 * which is what keeps it under five minutes.
 */
const scheduler = fsrs(generatorParameters({ enable_short_term: false }));

const RATINGS = { 1: Rating.Again, 2: Rating.Hard, 3: Rating.Good, 4: Rating.Easy };

const DATE_FIELDS = ['due', 'last_review'];

function serialise(card) {
  const out = { ...card };
  for (const key of DATE_FIELDS) if (out[key] instanceof Date) out[key] = out[key].toISOString();
  return out;
}

function deserialise(stored) {
  const card = { ...stored };
  for (const key of DATE_FIELDS) if (card[key]) card[key] = new Date(card[key]);
  return card;
}

function newCard(now = new Date()) {
  return serialise(createEmptyCard(now));
}

/** @returns {{ fsrs: object, due: Date }} the card's next state after this rating */
function review(stored, rating, now = new Date()) {
  const grade = RATINGS[rating];
  if (!grade) throw new Error('Invalid rating');
  const { card } = scheduler.next(deserialise(stored), now, grade);
  return { fsrs: serialise(card), due: card.due };
}

module.exports = { newCard, review };

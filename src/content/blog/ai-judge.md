---
title: "How does an AI conduct a real interview?"
date: 2026-08-10
summary: "I sat a 30-minute voice interview with an AI judge, then pulled 125 leaderboard scores to work out what it was actually measuring. It tracks your code as closely as two artifact scores track each other."
tags: ["ai", "agents", "voice", "evaluation"]
---

At the end of [HackerRank Orchestrate](/writing/orchestrate-router) there is a thirty-minute
voice interview conducted by an AI. It is weighted at 30 of 100 points — the same as the
predictions your system produces, and more than the code itself.

I expected a scripted questionnaire. It was not. It asked what I had built, listened, and
then asked a question that only made sense given what I had just said. Later it asked
whether a specific model name appeared in one of my source files. It did — in a dead code
path that never executed.

Two things were worth understanding after that. **How do you build something that holds a
real-time conversation and still reads your repository?** And **what is it actually
measuring?**

The first I can only reason about from constraints. The second I can measure.

---

## Part 1 — The architecture

Nothing below is published. HackerRank has not documented this system, so every element is
derived either from a hard constraint of real-time voice or from behaviour I observed
directly. I have marked which is which.

![Three-phase architecture of an AI interviewer: an offline analysis pass producing an evidence pack, a real-time voice loop with turn detection, streaming transcription, an interviewer model and streaming speech, then offline rubric grading](/ai-judge-architecture.png)

### The latency budget decides the design

Conversation degrades past roughly 800 milliseconds of silence. That single number forces
most of the architecture, because the budget has to cover four sequential things: detecting
that you stopped speaking, finalising transcription, the model producing its first token,
and speech beginning to play.

A naive stack — wait for silence, transcribe, call the model, synthesise, play — lands
somewhere between three and five seconds. That is the texture of every bad IVR you have ever
been trapped in. Getting under a second means **everything streams**: partial transcription
hypotheses arrive while you are still talking, the model emits tokens rather than a
completed answer, and speech synthesis starts on the first sentence boundary instead of the
last token. Transport has to be WebRTC rather than HTTP, because you need sub-100ms media
with jitter buffering.

There is also **barge-in**. When you talk over it, playback must stop immediately *and* the
interrupted output must be truncated in the conversation history — otherwise the model
believes it said things you never heard, and the next question is subtly wrong.

### Turn detection is the hard part

The genuinely difficult component is knowing when you have *finished*, as opposed to merely
paused. Naive silence thresholds fail badly on engineers, who stop mid-sentence to think.
Set the threshold at 500ms and it interrupts constantly. Set it at 1500ms and every exchange
drags.

Good systems use **semantic endpointing**: a small model reads the partial transcript and
predicts whether the utterance is complete. *"So I batched eight messages per call
because—"* is unfinished and should wait. *"…so that's why I batched them"* is done. If an
AI interviewer feels natural, this component is most of the reason.

### How it knew what was in my source file

This is the part my experience constrains most usefully, because it asked a file-and-line
question. The submission was available to it. There are three ways to do that, in ascending
order of likelihood:

1. **Whole repository in context.** Workable for my 2,848 lines; breaks on the 15,000-line
   submissions in the same contest, and wasteful to re-send every turn.
2. **Retrieval during the call.** Adds latency inside a budget that has none to spare.
3. **An offline analysis pass.** Almost certainly this. Before the call, an agent reads the
   entire submission with no clock running and produces a compact brief: architecture
   summary, notable constants and their values, claims the README makes that the code does
   not support, dead paths, and candidate probes keyed to each rubric dimension.

That third design explains my experience exactly. An offline pass hunting for *claims the
code does not support* is precisely what surfaces an unused model alias.

### Why it could follow up

The model conditions on what you just said — that part is simply what a conversation history
does. The interesting question is why it still reliably covered architecture, failure modes,
production viability **and** AI disclosure inside thirty minutes.

That suggests a **coverage tracker** alongside the interviewer: a plan enumerating the
dimensions to reach, with adaptive probing inside each and a decision about when to move on.
Adaptive within a dimension, deterministic across them.

The cheapest and most effective probe is depth. When an answer is generic, ask for the
specific value and the file it lives in. If the candidate has it, they built the thing. If
not, that is the signal — and it costs one question.

### Grading happens afterwards

Almost certainly not live. The score is a post-hoc pass over the full transcript against a
fixed rubric — and the score distribution supports that, which is where measurement takes
over from inference.

---

## Part 2 — What the scores actually measure

I pulled 125 rows from the public leaderboard, sampled across ranks 1 to 1800, and ran the
arithmetic. Anyone can reproduce this; the leaderboard is public.

### The finding

![Bar chart of Pearson correlations between graded axes: interview to code zip 0.522, code zip to output CSV 0.532, interview to output CSV 0.391, interview to chat transcript 0.386](/ai-judge-correlations.png)

The interview score correlates with the code score at **r = +0.52**. Two *artifact* scores —
the code and the predictions, both direct measurements of the same submission — correlate at
**+0.53**.

A thirty-minute voice conversation predicts your code quality about as well as your
predictions file does.

That is the argument against the intuitive read of these systems. It is not scoring
fluency in a vacuum. It is grounded in work it has independently assessed, and it is asking
you to account for that work.

But note the other half: **r = 0.52 leaves roughly 73% of the variance unexplained by code
quality.** It is also, measurably, a separate skill. The engineer who placed 2nd went 15.6 →
20.4 → 26.1 on this axis across three editions while already building strong systems. That
gap is trainable, and most people do not train it.

### The grading signature

![Histogram of AI judge scores as a percentage of the 30-point axis, roughly normal, centred near 53 percent, with no zeros and a maximum of 87 percent](/ai-judge-distribution.png)

Three things stand out.

**Nobody scored zero.** Not one of 125 — while 28 of the same 125 scored exactly zero on the
chat transcript by not uploading one. You cannot fail this by silence, only by vagueness.

**Nobody hit the extremes.** The range is 8% to 87%, and both the first and second place
finishers landed on exactly 87%.

**The scores are fine-grained integers.** Every axis resolves to an integer 0–100 scaled to
its weight — 54 distinct values across 125 rows, with a greatest common divisor of 1. That
rules out a checklist of N equal-weight items.

Compression away from both extremes, combined with fine granularity in the middle, is
characteristic of a language model scoring against a written rubric. Human graders and
deterministic checklists produce flatter or lumpier shapes.

### The part nobody talks about

Consistency, not conversation, is the hard engineering problem here. The same answer has to
score the same on candidate 40 and candidate 1,900. That means a fixed rubric, probably
repeated grading passes, and calibration against human-scored samples. It is the least
visible part of the system and almost certainly where most of the effort went.

---

## What this means if you are being assessed this way

**It has read your work before it speaks to you.** Vague architectural answers do not fail
because they are vague; they fail because the thing asking already knows what your code
does.

**Dead code is a liability.** Anything left in your source is something you can be asked to
defend. An unused alias cost me a question I could not answer. Grep every constant before
you ship and delete what no executed path reads.

**The answer shape that scores is boring.** The direct answer with the exact value and the
file it lives in, then one concrete detail, then stop. Specificity is rewarded; preamble is
not.

**It is a distinct, trainable skill.** Three-quarters of the variance in this score is not
explained by how good your system is. That should be encouraging — it is the cheapest axis
to improve, because it costs no compute and no engineering time, only preparation.

---

*Caveats worth stating. n = 125 of 1,983, drawn from five rank bands rather than at random,
so treat the third decimal as noise. Part 1 is inference from engineering constraints and
observed behaviour, not documentation. Part 2 is arithmetic on public data and can be checked
by anyone.*

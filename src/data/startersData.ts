/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SentenceStarter } from '../types.ts';

export const DEFAULT_STARTERS: SentenceStarter[] = [
  // --- ASKING: QUESTION STARTERS ---
  {
    id: 'q-1',
    type: 'question',
    intentTag: 'Information Seeking',
    starter: 'Could you tell me more about [topic]?',
    situation: 'Requesting detailed context or background on a topic',
    example: 'Could you tell me more about the timeline for the new rollout?'
  },
  {
    id: 'q-2',
    type: 'question',
    intentTag: 'Information Seeking',
    starter: 'Do you happen to know where [item/location] is?',
    situation: 'Casual or polite way to locate something without presuming knowledge',
    example: 'Do you happen to know where the conference room key is kept?'
  },
  {
    id: 'q-3',
    type: 'question',
    intentTag: 'Information Seeking',
    starter: 'What is the best way to handle [challenge]?',
    situation: 'Seeking recommended best practices or advice',
    example: 'What is the best way to handle late submissions from external partners?'
  },
  {
    id: 'q-4',
    type: 'question',
    intentTag: 'Polite Request',
    starter: 'Would you mind [verb-ing] [action]?',
    situation: 'Soft, polite request asking someone to do something',
    example: 'Would you mind forwarding me the updated spreadsheet?'
  },
  {
    id: 'q-5',
    type: 'question',
    intentTag: 'Polite Request',
    starter: 'Could I ask you for a quick favor regarding [matter]?',
    situation: 'Warm opener when asking a colleague or friend for help',
    example: 'Could I ask you for a quick favor regarding the client presentation?'
  },
  {
    id: 'q-6',
    type: 'question',
    intentTag: 'Polite Request',
    starter: 'Would it be possible to [action] by [time]?',
    situation: 'Negotiating a deadline or delivery request respectfully',
    example: 'Would it be possible to review this draft by tomorrow afternoon?'
  },
  {
    id: 'q-7',
    type: 'question',
    intentTag: 'Clarification & Confirmation',
    starter: 'Could you clarify what you mean by [term/phrase]?',
    situation: 'Asking for clarification when a phrase or requirement is vague',
    example: 'Could you clarify what you mean by "high-priority adjustments"?'
  },
  {
    id: 'q-8',
    type: 'question',
    intentTag: 'Clarification & Confirmation',
    starter: 'Just to make sure I understand, are you saying [summary]?',
    situation: 'Paraphrasing the speaker to confirm mutual alignment',
    example: 'Just to make sure I understand, are you saying we should postpone the launch?'
  },
  {
    id: 'q-9',
    type: 'question',
    intentTag: 'Clarification & Confirmation',
    starter: 'Am I right in thinking that [assumption]?',
    situation: 'Checking whether your assumption or deduction is accurate',
    example: 'Am I right in thinking that budget approval has already been granted?'
  },
  {
    id: 'q-10',
    type: 'question',
    intentTag: 'Opinion & Perspective',
    starter: 'What are your thoughts on [topic/proposal]?',
    situation: 'Inviting honest feedback or personal viewpoint',
    example: 'What are your thoughts on switching to a weekly sync instead?'
  },
  {
    id: 'q-11',
    type: 'question',
    intentTag: 'Opinion & Perspective',
    starter: 'From your perspective, what is the biggest obstacle to [goal]?',
    situation: 'Extracting strategic insight from a team member or stakeholder',
    example: 'From your perspective, what is the biggest obstacle to closing this quarter?'
  },
  {
    id: 'q-12',
    type: 'question',
    intentTag: 'Troubleshooting & Blockers',
    starter: 'What seems to be the main issue with [system/task]?',
    situation: 'Investigating a bug, breakdown, or stalled deliverable',
    example: 'What seems to be the main issue with the payment gateway?'
  },
  {
    id: 'q-13',
    type: 'question',
    intentTag: 'Troubleshooting & Blockers',
    starter: 'Is anyone else experiencing trouble with [tool/process]?',
    situation: 'Verifying if a technical problem is isolated or widespread',
    example: 'Is anyone else experiencing trouble with the VPN connection today?'
  },
  {
    id: 'q-14',
    type: 'question',
    intentTag: 'Follow-up & Deadlines',
    starter: 'Where do we currently stand with [project/deliverable]?',
    situation: 'Status check on an ongoing project or milestone',
    example: 'Where do we currently stand with the onboarding documentation?'
  },
  {
    id: 'q-15',
    type: 'question',
    intentTag: 'Follow-up & Deadlines',
    starter: 'Are we still on track to meet the deadline for [event/delivery]?',
    situation: 'Verifying schedule adherence without being pushy',
    example: 'Are we still on track to meet the deadline for Friday release?'
  },
  {
    id: 'q-16',
    type: 'question',
    intentTag: 'Permission & Politeness',
    starter: 'May I ask if [question/curiosity]?',
    situation: 'Very courteous inquiry in formal or sensitive settings',
    example: 'May I ask if the position has already been filled?'
  },
  {
    id: 'q-17',
    type: 'question',
    intentTag: 'Alternative Exploring',
    starter: 'What if we were to try [alternative approach] instead?',
    situation: 'Proposing a gentle alternative during brainstorming',
    example: 'What if we were to try a phased rollout instead of an immediate launch?'
  },

  // --- ANSWERING: RESPONSE STARTERS ---
  {
    id: 'r-1',
    type: 'response',
    intentTag: 'Direct Agreement & Acceptance',
    starter: 'That sounds like a solid plan because [reason].',
    situation: 'Agreeing with a proposal and validating it with sound logic',
    example: 'That sounds like a solid plan because it minimizes risk during peak hours.'
  },
  {
    id: 'r-2',
    type: 'response',
    intentTag: 'Direct Agreement & Acceptance',
    starter: 'I completely agree with your point about [topic].',
    situation: 'Endorsing someone else’s argument in a discussion',
    example: 'I completely agree with your point about improving customer retention.'
  },
  {
    id: 'r-3',
    type: 'response',
    intentTag: 'Direct Agreement & Acceptance',
    starter: 'Absolutely, I’ll take care of [task] right away.',
    situation: 'Prompt, confident commitment to action',
    example: 'Absolutely, I’ll take care of sending the contract right away.'
  },
  {
    id: 'r-4',
    type: 'response',
    intentTag: 'Polite Refusal & Boundary',
    starter: 'I’d love to help, but currently I’m tied up with [current priority].',
    situation: 'Declining a request politely without burning bridges',
    example: 'I’d love to help, but currently I’m tied up with the quarterly financial audit.'
  },
  {
    id: 'r-5',
    type: 'response',
    intentTag: 'Polite Refusal & Boundary',
    starter: 'Unfortunately, that won’t be feasible due to [constraint].',
    situation: 'Explaining impossibility due to rules, budget, or technical limits',
    example: 'Unfortunately, that won’t be feasible due to strict security regulations.'
  },
  {
    id: 'r-6',
    type: 'response',
    intentTag: 'Hesitation & Stalling (Buying Time)',
    starter: 'That’s a fair question, let me double-check [detail] before giving an answer.',
    situation: 'Professional way to stall and verify facts before committing',
    example: 'That’s a fair question, let me double-check the server logs before giving an answer.'
  },
  {
    id: 'r-7',
    type: 'response',
    intentTag: 'Hesitation & Stalling (Buying Time)',
    starter: 'Off the top of my head I’m not certain, but I will look into [topic].',
    situation: 'Admitting you don’t have exact data instantly while committing to check',
    example: 'Off the top of my head I’m not certain, but I will look into the exact user counts.'
  },
  {
    id: 'r-8',
    type: 'response',
    intentTag: 'Clarification & Rephrasing',
    starter: 'What I meant to say was that [clarification].',
    situation: 'Correcting a misunderstanding gently',
    example: 'What I meant to say was that the demo is ready, but the API keys are pending.'
  },
  {
    id: 'r-9',
    type: 'response',
    intentTag: 'Clarification & Rephrasing',
    starter: 'To put it another way, [rephrased explanation].',
    situation: 'Explaining a complex idea from a fresh, simpler angle',
    example: 'To put it another way, users only pay when they exceed the free quota.'
  },
  {
    id: 'r-10',
    type: 'response',
    intentTag: 'Offering Alternative & Solution',
    starter: 'Instead of [option A], how about we [option B]?',
    situation: 'Redirecting away from an unworkable idea toward a practical one',
    example: 'Instead of rebuilding the module, how about we patch the existing endpoint?'
  },
  {
    id: 'r-11',
    type: 'response',
    intentTag: 'Offering Alternative & Solution',
    starter: 'What worked well for us in the past was [proven method].',
    situation: 'Suggesting a tried-and-true solution based on previous experience',
    example: 'What worked well for us in the past was creating a shared Slack channel.'
  },
  {
    id: 'r-12',
    type: 'response',
    intentTag: 'Expressing Uncertainty & Caveats',
    starter: 'As far as I know, [statement], though we should confirm with [person].',
    situation: 'Sharing preliminary information with a clear caveat',
    example: 'As far as I know, the client approved the budget, though we should confirm with Sarah.'
  },
  {
    id: 'r-13',
    type: 'response',
    intentTag: 'Expressing Uncertainty & Caveats',
    starter: 'It largely depends on whether [condition] is fulfilled first.',
    situation: 'Highlighting conditional dependencies before giving a definitive yes/no',
    example: 'It largely depends on whether the design team delivers the assets on Monday.'
  },
  {
    id: 'r-14',
    type: 'response',
    intentTag: 'Providing Status & Progress',
    starter: 'So far, everything is proceeding according to schedule regarding [task].',
    situation: 'Reassuring a stakeholder that milestones are on track',
    example: 'So far, everything is proceeding according to schedule regarding the database migration.'
  },
  {
    id: 'r-15',
    type: 'response',
    intentTag: 'Providing Status & Progress',
    starter: 'We ran into a minor hiccup with [obstacle], but we’re already working on a fix.',
    situation: 'Transparently communicating a bump in the road while showing ownership',
    example: 'We ran into a minor hiccup with the email delivery server, but we’re already working on a fix.'
  },
  {
    id: 'r-16',
    type: 'response',
    intentTag: 'Sympathy & Reassurance',
    starter: 'I completely understand your frustration regarding [situation], let’s solve this together.',
    situation: 'De-escalating an upset customer or colleague with empathy',
    example: 'I completely understand your frustration regarding the billing error, let’s solve this together.'
  }
];

export const ALL_INTENT_TAGS = Array.from(
  new Set(DEFAULT_STARTERS.map(s => s.intentTag))
).sort();

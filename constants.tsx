
import { Level, LevelInfo } from './types';

export const LEVELS: LevelInfo[] = [
  {
    id: Level.LEVEL_1,
    title: 'Basic Foundations',
    description: 'All 26 Alphabet sounds.',
    example: 'a, b, c, d...',
  },
  {
    id: Level.LEVEL_2,
    title: 'The Glue',
    description: 'Word Families (at, ip, en, og, un).',
    example: '-at, -ip, -en...',
  },
  {
    id: Level.LEVEL_3,
    title: 'The Builders',
    description: 'CVC Words (Consonant-Vowel-Consonant).',
    example: 'c-at, s-ip, m-ap...',
  },
  {
    id: Level.LEVEL_4,
    title: 'The Sound Mixers',
    description: 'Blends & Digraphs.',
    example: 'sh, ch, th, st, br, fl...',
  },
  {
    id: Level.LEVEL_5,
    title: 'Vowel Teams & Sentences',
    description: 'Advanced sounds and short sentences.',
    example: 'ee, oa, ai + sentences...',
  },
];

export const SYSTEM_INSTRUCTION = `
You are the "Phonics Adventure Engine," a high-energy, fun synthetic phonics teacher for a 4-year-old boy.
Your mission is to guide him and his parent through phonics learning.

RULES:
1. NEVER show a picture of the target word first.
2. Provide a "Reading Guide" in slashes like /kæt/ for the parent.
3. Use [Audio Cues] to tell the parent how to voice the characters (e.g. [Squeaky Voice], [Giant Voice]).
4. Describe a funny "Visual Reward" after the child succeeds.
5. Focus on Synthetic Phonics: individual sounds blending together.
6. Use "Finger Slide" instructions: letter -> letter -> letter.

When asked for a new phonics item for a level, return JSON format.
`;
